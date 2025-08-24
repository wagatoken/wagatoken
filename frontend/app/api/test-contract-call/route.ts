import { NextRequest, NextResponse } from 'next/server';

export async function POST() {
  try {
    console.log("🧪 Testing FULL batch creation including smart contract call...");

    // Import the actual smart contract function
    const { createCoffeeBatch } = await import("@/utils/smartContracts");

    // Create test batch data with fixed pricing
    const testBatchData = {
      name: "Admin Rights Test Coffee",
      description: "Testing if admin role error comes before price validation error",
      origin: "Test Origin", 
      farmer: "Test Farmer",
      altitude: "1800m",
      process: "Washed",
      roastProfile: "Medium" as const,
      roastDate: new Date().toISOString().split('T')[0],
      certifications: ["Test"],
      cupping_notes: ["Test Note"],
      quantity: 10,
      packagingInfo: "250g" as const,
      pricePerUnit: "25.00", // Reasonable USD price
      productionDate: new Date(Date.now() - (5 * 24 * 60 * 60 * 1000)), // 5 days ago
      expiryDate: new Date(Date.now() + (30 * 24 * 60 * 60 * 1000)), // 30 days from now
    };

    console.log("📝 Attempting to create batch with proper pricing...");
    console.log(`   Price: $${testBatchData.pricePerUnit} → ${Math.round(parseFloat(testBatchData.pricePerUnit) * 100)} cents`);

    // This should fail with admin role error if wallet isn't connected or lacks admin rights
    try {
      const result = await createCoffeeBatch(testBatchData);
      
      // If we get here, it means the admin check passed AND the price validation passed
      return NextResponse.json({
        success: true,
        message: "🎉 BATCH CREATED SUCCESSFULLY! Admin rights confirmed and price validation passed!",
        result,
        analysis: {
          adminRights: "✅ PASSED - User has admin role",
          priceValidation: "✅ PASSED - Price validation accepted",
          priceInCents: Math.round(parseFloat(testBatchData.pricePerUnit) * 100),
          originalError: "0x75883caa was likely due to 42 ETH price, now fixed"
        }
      });

    } catch (contractError: any) {
      console.log("❌ Smart contract call failed:", contractError.message);
      
      // Analyze the error to determine what failed
      const errorMessage = contractError.message.toLowerCase();
      
      if (errorMessage.includes("admin_role") || errorMessage.includes("admin role") || errorMessage.includes("unauthorized")) {
        return NextResponse.json({
          success: false,
          message: "❌ ADMIN ROLE ERROR - User lacks admin rights (expected)",
          analysis: {
            adminRights: "❌ FAILED - User does not have admin role on contract",
            priceValidation: "❓ UNKNOWN - Admin check failed first",
            priceInCents: Math.round(parseFloat(testBatchData.pricePerUnit) * 100),
            recommendation: "Connect wallet with admin role to test price validation fix"
          },
          error: contractError.message
        });
      } else if (errorMessage.includes("0x75883caa") || errorMessage.includes("75883caa")) {
        return NextResponse.json({
          success: false,
          message: "❌ SAME PRICE ERROR - The 0x75883caa error still occurs!",
          analysis: {
            adminRights: "✅ PASSED - User has admin role", 
            priceValidation: "❌ FAILED - Price validation still failing",
            priceInCents: Math.round(parseFloat(testBatchData.pricePerUnit) * 100),
            issue: "The price conversion fix didn't resolve the issue",
            debugging: "Need to investigate other parameter validation in contract"
          },
          error: contractError.message
        });
      } else {
        return NextResponse.json({
          success: false,
          message: "❌ OTHER ERROR - Different contract error occurred",
          analysis: {
            adminRights: "❓ UNKNOWN - Different error occurred",
            priceValidation: "❓ UNKNOWN - Different error occurred", 
            priceInCents: Math.round(parseFloat(testBatchData.pricePerUnit) * 100),
            errorType: "Unexpected contract error"
          },
          error: contractError.message
        });
      }
    }

  } catch (error) {
    console.error("❌ Test setup failed:", error);
    return NextResponse.json({
      success: false,
      error: "Test setup failed",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
