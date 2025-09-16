import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../db';
import { userRoles, batchTokenBalances } from '../../../db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get('address');
    
    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Address parameter required'
      }, { status: 400 });
    }
    
    console.log(`Fetching user data for address: ${address}`);
    
    // Get user role from database
    const userRole = await db.select().from(userRoles).where(eq(userRoles.userAddress, address)).limit(1);
    
    // Get user's token balances from database
    const balances = await db.select().from(batchTokenBalances).where(eq(batchTokenBalances.holderAddress, address));
    
    // Transform balances into the expected format
    const userBalances: Record<number, number> = {};
    balances.forEach(balance => {
      userBalances[balance.batchId] = balance.balance;
    });
    
    const userData = {
      address,
      role: userRole[0]?.role || 'consumer',
      isActive: userRole[0]?.isActive || false,
      createdAt: userRole[0]?.assignedAt?.toISOString() || new Date().toISOString(),
      balances: userBalances,
      totalTokens: Object.values(userBalances).reduce((sum, balance) => sum + balance, 0)
    };
    
    console.log(`Found user data:`, userData);
    
    return NextResponse.json({
      success: true,
      data: userData,
      usingRealData: true,
      note: 'Using live database data'
    });
  } catch (error) {
    console.error('Error fetching user from database:', error);
    
    // Get address from the original request URL if available
    const url = new URL(request.url);
    const fallbackAddress = url.searchParams.get('address') || 'unknown';
    
    // Fallback response for new users or database errors
    return NextResponse.json({
      success: true,
      data: {
        address: fallbackAddress,
        role: 'consumer',
        isActive: false,
        createdAt: new Date().toISOString(),
        balances: {},
        totalTokens: 0
      },
      usingRealData: false,
      note: 'Database error or new user - returning default data'
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    const { address, batchId, balance } = userData;
    
    if (!address) {
      return NextResponse.json({
        success: false,
        error: 'Address is required'
      }, { status: 400 });
    }
    
    console.log(`Updating user data for address: ${address}`);
    
    // If updating token balance
    if (balance !== undefined && batchId) {
      // Check if balance record exists
      const existingBalance = await db.select()
        .from(batchTokenBalances)
        .where(eq(batchTokenBalances.holderAddress, address))
        .limit(1);
      
      if (existingBalance.length > 0) {
        // Update existing balance
        await db.update(batchTokenBalances)
          .set({ 
            balance: balance,
            lastTransactionAt: new Date()
          })
          .where(eq(batchTokenBalances.holderAddress, address));
      } else {
        // Create new balance record
        await db.insert(batchTokenBalances).values({
          batchId: batchId,
          holderAddress: address,
          balance: balance,
          lastTransactionAt: new Date()
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'User data updated successfully',
      usingRealData: true,
      note: 'Data persisted to live database'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
