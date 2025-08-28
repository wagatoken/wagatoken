import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { batchTokenBalances } from '../../../../db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      batchId,
      holderAddress,
      balance,
      transactionHash
    } = body;

    // Validate required fields
    if (!batchId || !holderAddress || balance === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields (batchId, holderAddress, balance)' },
        { status: 400 }
      );
    }

    // Check if balance record exists
    const [existingBalance] = await db.select()
      .from(batchTokenBalances)
      .where(
        and(
          eq(batchTokenBalances.batchId, Number(batchId)),
          eq(batchTokenBalances.holderAddress, holderAddress)
        )
      );

    if (existingBalance) {
      // Update existing balance
      const [updatedBalance] = await db.update(batchTokenBalances)
        .set({
          balance: balance.toString(),
          lastTransactionHash: transactionHash || null,
          lastTransactionAt: new Date(),
          updatedAt: new Date()
        })
        .where(
          and(
            eq(batchTokenBalances.batchId, Number(batchId)),
            eq(batchTokenBalances.holderAddress, holderAddress)
          )
        )
        .returning();

      return NextResponse.json({
        success: true,
        message: 'Token balance updated successfully',
        tokenBalance: updatedBalance
      });
    } else {
      // Create new balance record
      const [newBalance] = await db.insert(batchTokenBalances).values({
        batchId: Number(batchId),
        holderAddress,
        balance: balance.toString(),
        lastTransactionHash: transactionHash || null,
        lastTransactionAt: transactionHash ? new Date() : null,
        isRedeemed: false
      }).returning();

      return NextResponse.json({
        success: true,
        message: 'Token balance created successfully',
        tokenBalance: newBalance
      });
    }

  } catch (error) {
    console.error('Error managing token balance:', error);
    return NextResponse.json(
      { error: 'Failed to manage token balance' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const holderAddress = searchParams.get('holderAddress');
    
    if (batchId && holderAddress) {
      // Get specific balance
      const [balance] = await db.select()
        .from(batchTokenBalances)
        .where(
          and(
            eq(batchTokenBalances.batchId, Number(batchId)),
            eq(batchTokenBalances.holderAddress, holderAddress)
          )
        );
      
      return NextResponse.json({
        success: true,
        tokenBalance: balance || null
      });
    } else if (batchId) {
      // Get all balances for a batch
      const balances = await db.select()
        .from(batchTokenBalances)
        .where(eq(batchTokenBalances.batchId, Number(batchId)));
      
      return NextResponse.json({
        success: true,
        tokenBalances: balances
      });
    } else if (holderAddress) {
      // Get all balances for a holder
      const balances = await db.select()
        .from(batchTokenBalances)
        .where(eq(batchTokenBalances.holderAddress, holderAddress));
      
      return NextResponse.json({
        success: true,
        tokenBalances: balances
      });
    } else {
      return NextResponse.json(
        { error: 'Either batchId or holderAddress parameter is required' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error fetching token balances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch token balances' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      batchId,
      holderAddress,
      isRedeemed,
      redemptionTxHash
    } = body;

    // Validate required fields
    if (!batchId || !holderAddress) {
      return NextResponse.json(
        { error: 'Missing required fields (batchId, holderAddress)' },
        { status: 400 }
      );
    }

    // Update redemption status
    const [updatedBalance] = await db.update(batchTokenBalances)
      .set({
        isRedeemed: isRedeemed || false,
        redeemedAt: isRedeemed ? new Date() : null,
        redemptionTxHash: redemptionTxHash || null,
        updatedAt: new Date()
      })
      .where(
        and(
          eq(batchTokenBalances.batchId, Number(batchId)),
          eq(batchTokenBalances.holderAddress, holderAddress)
        )
      )
      .returning();

    if (!updatedBalance) {
      return NextResponse.json(
        { error: 'Token balance record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Token balance updated successfully',
      tokenBalance: updatedBalance
    });

  } catch (error) {
    console.error('Error updating token balance:', error);
    return NextResponse.json(
      { error: 'Failed to update token balance' },
      { status: 500 }
    );
  }
}
