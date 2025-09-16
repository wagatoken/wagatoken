import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../../db';
import { batchPrivacyConfigs, protectedBatchData } from '../../../../db/schema';
import { eq } from 'drizzle-orm';

// GET /api/zk/privacy - Get privacy configuration for a batch
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const batchId = searchParams.get('batchId');

    if (!batchId) {
      return NextResponse.json({
        success: false,
        error: 'batchId parameter required'
      }, { status: 400 });
    }

    console.log(`Fetching privacy configuration for batch ${batchId}`);

    // Get privacy configuration
    const privacyConfig = await db.select()
      .from(batchPrivacyConfigs)
      .where(eq(batchPrivacyConfigs.batchId, parseInt(batchId)))
      .limit(1);

    // Get protected data entries
    const protectedData = await db.select()
      .from(protectedBatchData)
      .where(eq(protectedBatchData.batchId, parseInt(batchId)));

    const config = privacyConfig[0] || {
      batchId: parseInt(batchId),
      privacyLevel: 'public',
      pricePrivate: false,
      qualityPrivate: false,
      supplyChainPrivate: false,
      quantityPrivate: false,
      farmerDetailsPrivate: false,
      configuredBy: null,
      configurationReason: null,
      authorizedViewers: [],
      accessExpiry: null,
      configuredAt: null,
      updatedAt: null
    };

    const protectedDataSummary = protectedData.map(data => ({
      dataType: data.dataType,
      dataCategory: data.dataCategory,
      accessLevel: data.accessLevel,
      dataOwner: data.dataOwner,
      createdAt: data.createdAt.toISOString()
    }));

    return NextResponse.json({
      success: true,
      privacyConfig: {
        batchId: config.batchId,
        privacyLevel: config.privacyLevel,
        pricePrivate: config.pricePrivate,
        qualityPrivate: config.qualityPrivate,
        supplyChainPrivate: config.supplyChainPrivate,
        quantityPrivate: config.quantityPrivate,
        farmerDetailsPrivate: config.farmerDetailsPrivate,
        configuredBy: config.configuredBy,
        configurationReason: config.configurationReason,
        authorizedViewers: config.authorizedViewers || [],
        accessExpiry: config.accessExpiry?.toISOString(),
        configuredAt: config.configuredAt?.toISOString(),
        updatedAt: config.updatedAt?.toISOString()
      },
      protectedData: protectedDataSummary,
      usingRealData: true,
      note: 'Privacy configuration from live database'
    });

  } catch (error) {
    console.error('Error fetching privacy configuration:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch privacy configuration'
    }, { status: 500 });
  }
}

// POST /api/zk/privacy - Configure privacy settings for a batch
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      batchId,
      privacyLevel,
      pricePrivate,
      qualityPrivate,
      supplyChainPrivate,
      quantityPrivate,
      farmerDetailsPrivate,
      configuredBy,
      configurationReason,
      authorizedViewers = []
    } = body;

    // Validate required fields
    if (!batchId || !privacyLevel || !configuredBy) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: batchId, privacyLevel, configuredBy'
      }, { status: 400 });
    }

    // Validate privacy level
    const validPrivacyLevels = ['public', 'selective', 'private'];
    if (!validPrivacyLevels.includes(privacyLevel)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid privacy level'
      }, { status: 400 });
    }

    console.log(`Configuring privacy for batch ${batchId} with level: ${privacyLevel}`);

    // Check if configuration exists
    const existingConfig = await db.select()
      .from(batchPrivacyConfigs)
      .where(eq(batchPrivacyConfigs.batchId, parseInt(batchId)))
      .limit(1);

    let result;
    
    if (existingConfig.length > 0) {
      // Update existing configuration
      result = await db.update(batchPrivacyConfigs)
        .set({
          privacyLevel,
          pricePrivate: pricePrivate || false,
          qualityPrivate: qualityPrivate || false,
          supplyChainPrivate: supplyChainPrivate || false,
          quantityPrivate: quantityPrivate || false,
          farmerDetailsPrivate: farmerDetailsPrivate || false,
          configuredBy,
          configurationReason,
          authorizedViewers: JSON.stringify(authorizedViewers),
          updatedAt: new Date()
        })
        .where(eq(batchPrivacyConfigs.batchId, parseInt(batchId)))
        .returning();
    } else {
      // Create new configuration
      result = await db.insert(batchPrivacyConfigs).values({
        batchId: parseInt(batchId),
        privacyLevel,
        pricePrivate: pricePrivate || false,
        qualityPrivate: qualityPrivate || false,
        supplyChainPrivate: supplyChainPrivate || false,
        quantityPrivate: quantityPrivate || false,
        farmerDetailsPrivate: farmerDetailsPrivate || false,
        configuredBy,
        configurationReason,
        authorizedViewers: JSON.stringify(authorizedViewers),
        configuredAt: new Date(),
        updatedAt: new Date()
      }).returning();
    }

    console.log(`✅ Privacy configuration updated for batch ${batchId}`);

    return NextResponse.json({
      success: true,
      message: `Privacy configuration ${existingConfig.length > 0 ? 'updated' : 'created'} successfully`,
      privacyConfig: {
        batchId: result[0].batchId,
        privacyLevel: result[0].privacyLevel,
        pricePrivate: result[0].pricePrivate,
        qualityPrivate: result[0].qualityPrivate,
        supplyChainPrivate: result[0].supplyChainPrivate,
        quantityPrivate: result[0].quantityPrivate,
        farmerDetailsPrivate: result[0].farmerDetailsPrivate,
        configuredBy: result[0].configuredBy,
        configurationReason: result[0].configurationReason,
        authorizedViewers: result[0].authorizedViewers,
        configuredAt: result[0].configuredAt.toISOString(),
        updatedAt: result[0].updatedAt.toISOString()
      },
      usingRealData: true,
      note: 'Privacy configuration stored in database'
    }, { status: existingConfig.length > 0 ? 200 : 201 });

  } catch (error) {
    console.error('Error configuring privacy settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to configure privacy settings'
    }, { status: 500 });
  }
}
