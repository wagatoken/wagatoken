import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../../db';
import { verificationRequests, inventoryAudits } from '../../../../../db/schema';
import { desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    console.log('Fetching verification history from database...');
    
    // Get verification requests from database
    const verifications = await db.select()
      .from(verificationRequests)
      .orderBy(desc(verificationRequests.submittedAt))
      .limit(20);
    
    // Get audit history from database
    const audits = await db.select()
      .from(inventoryAudits)
      .orderBy(desc(inventoryAudits.auditedAt))
      .limit(20);
    
    // Transform verification requests into history format
    const verificationHistory = verifications.map(v => ({
      batchId: v.batchId,
      verificationType: v.verificationType,
      timestamp: Math.floor(v.submittedAt.getTime() / 1000),
      result: v.status === 'fulfilled' ? 'success' as const : 
              v.status === 'failed' ? 'failed' as const : 'pending' as const,
      details: v.error || `${v.verificationType} verification ${v.status}`,
      requestId: v.requestId,
      completedAt: v.completedAt ? Math.floor(v.completedAt.getTime() / 1000) : undefined
    }));
    
    // Transform audits into history format
    const auditHistory = audits.map(a => ({
      batchId: a.batchId,
      verificationType: a.auditType,
      timestamp: Math.floor(a.auditedAt.getTime() / 1000),
      result: a.isResolved ? 'success' as const : 
              parseFloat(a.discrepancy) > 0 ? 'failed' as const : 'success' as const,
      details: a.auditNotes || `${a.auditType} - ${a.physicalQuantity}kg found`,
      auditorAddress: a.auditorAddress,
      discrepancy: parseFloat(a.discrepancy)
    }));
    
    // Combine and sort by timestamp
    const combinedHistory = [...verificationHistory, ...auditHistory]
      .sort((a, b) => b.timestamp - a.timestamp);
    
    console.log(`Found ${combinedHistory.length} verification/audit records`);
    
    return NextResponse.json({
      success: true,
      history: combinedHistory,
      usingRealData: true,
      note: 'Using live database verification and audit history'
    });
    
  } catch (error) {
    console.error('Error fetching verification history from database:', error);
    
    // Fallback to empty history if database fails
    return NextResponse.json({
      success: true,
      history: [],
      usingRealData: false,
      note: 'Database error - returning empty history'
    });
  }
}
