import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { zkProofs, batchPrivacyConfigs, protectedBatchData, zkVerificationHistory } from '../../../../db/schema';
import { eq, desc, and } from 'drizzle-orm';

// GET /api/zk/proofs - Get ZK proofs for a batch or all proofs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');
    const proofType = searchParams.get('proofType');
    const userAddress = searchParams.get('userAddress');

    console.log(`Fetching ZK proofs - batchId: ${batchId}, proofType: ${proofType}`);

    // Build where conditions
    const whereConditions = [];
    
    if (batchId) {
      whereConditions.push(eq(zkProofs.batchId, parseInt(batchId)));
    }
    
    if (proofType) {
      whereConditions.push(eq(zkProofs.proofType, proofType));
    }

    if (userAddress) {
      whereConditions.push(eq(zkProofs.proofGeneratorAddress, userAddress));
    }

    // Execute query with conditions
    const proofs = whereConditions.length > 0 
      ? await db.select().from(zkProofs).where(and(...whereConditions)).orderBy(desc(zkProofs.createdAt)).limit(50)
      : await db.select().from(zkProofs).orderBy(desc(zkProofs.createdAt)).limit(50);

    // Transform for API response
    const transformedProofs = proofs.map(proof => ({
      proofId: proof.proofId,
      batchId: proof.batchId,
      proofType: proof.proofType,
      proofHash: proof.proofHash,
      publicClaim: proof.publicClaim,
      isVerified: proof.isVerified,
      circuitName: proof.circuitName,
      circuitVersion: proof.circuitVersion,
      proofGeneratorAddress: proof.proofGeneratorAddress,
      generatedAt: proof.generatedAt.toISOString(),
      verifiedAt: proof.verifiedAt?.toISOString(),
      verificationTransactionHash: proof.verificationTransactionHash,
      verificationError: proof.verificationError,
      retryCount: proof.retryCount
    }));

    console.log(`Found ${transformedProofs.length} ZK proofs`);

    return NextResponse.json({
      success: true,
      proofs: transformedProofs,
      count: transformedProofs.length,
      usingRealData: true,
      note: 'ZK proofs from live database'
    });

  } catch (error) {
    console.error('Error fetching ZK proofs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch ZK proofs',
      proofs: [],
      usingRealData: false
    }, { status: 500 });
  }
}

// POST /api/zk/proofs - Submit a new ZK proof
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      batchId,
      proofType,
      proofData,
      publicSignals,
      publicClaim,
      circuitName,
      circuitVersion = '1.0.0',
      proofGeneratorAddress
    } = body;

    // Validate required fields
    if (!batchId || !proofType || !proofData || !publicSignals || !publicClaim || !circuitName || !proofGeneratorAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    // Validate proof type
    const validProofTypes = ['PRICE_COMPETITIVENESS', 'QUALITY_STANDARDS', 'SUPPLY_CHAIN_PROVENANCE'];
    if (!validProofTypes.includes(proofType)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid proof type'
      }, { status: 400 });
    }

    console.log(`Submitting ZK proof for batch ${batchId}, type: ${proofType}`);

    // Generate proof ID and hash
    const proofId = `proof_${batchId}_${proofType}_${Date.now()}`;
    const proofHash = `0x${Buffer.from(JSON.stringify(proofData)).toString('hex').slice(0, 64)}`;

    // Insert proof into database
    const newProof = await db.insert(zkProofs).values({
      proofId,
      batchId: parseInt(batchId),
      proofType,
      proofHash,
      proofData: JSON.stringify(proofData),
      publicSignals: JSON.stringify(publicSignals),
      publicClaim,
      circuitName,
      circuitVersion,
      proofGeneratorAddress,
      isVerified: false, // Will be set to true after on-chain verification
      generatedAt: new Date()
    }).returning();

    // Create initial verification history entry
    await db.insert(zkVerificationHistory).values({
      proofId,
      batchId: parseInt(batchId),
      verificationAttempt: 1,
      verificationMethod: 'pending',
      verificationResult: 'pending',
      startedAt: new Date()
    });

    console.log(`✅ ZK proof ${proofId} submitted successfully`);

    return NextResponse.json({
      success: true,
      message: 'ZK proof submitted successfully',
      proof: {
        proofId: newProof[0].proofId,
        proofHash: newProof[0].proofHash,
        batchId: newProof[0].batchId,
        proofType: newProof[0].proofType,
        isVerified: newProof[0].isVerified,
        publicClaim: newProof[0].publicClaim
      },
      usingRealData: true,
      note: 'Proof stored in database, ready for on-chain verification'
    }, { status: 201 });

  } catch (error) {
    console.error('Error submitting ZK proof:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to submit ZK proof'
    }, { status: 500 });
  }
}
