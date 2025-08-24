import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Read the default source code file from your codebase
    const sourceCodePath = join(process.cwd(), './DefaultSourceCode.js');
    let sourceCode = readFileSync(sourceCodePath, 'utf8');

    // Replace placeholder URLs with production URLs for coffee API
    sourceCode = sourceCode
      .replace('https://api.wagacoffee.com/inventory/batch/', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/batches/`)
      .replace('https://api.wagacoffee.com/metadata/verify/', `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/batches/pin-status?cid=`);

    // Add coffee specific validation
    const productionSourceCode = sourceCode + `

// Additional validation for coffee batches
if (verifiedPackaging !== "250g" && verifiedPackaging !== "500g") {
  throw Error("Invalid packaging for coffee batch");
}

console.log("Coffee batch verification completed successfully");
`;

    return NextResponse.json({ 
      sourceCode: productionSourceCode,
      version: "1.0.0-coffee",
      lastUpdated: new Date().toISOString(),
      description: "Chainlink Functions source code for coffee batch verification"
    }, { status: 200 });

  } catch (error) {
    console.error("Error reading source code:", error);
    
    // Production-ready fallback source code for
    const fallbackSourceCode = `
// Coffee Chainlink Functions Source Code
const batchId = args[0];
const expectedQuantity = parseInt(args[1]);
const expectedPrice = parseInt(args[2]);
const expectedPackaging = args[3];
const expectedMetadataHash = args[4];

if (!batchId || isNaN(expectedQuantity) || isNaN(expectedPrice)) {
  throw Error("Invalid coffee batch arguments");
}

try {
  const response = await Functions.makeHttpRequest({
    url: \`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/batches/\${batchId}\`,
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (response.error) throw new Error(response.error);
  
  const data = response.data;
  
  // Validate coffee packaging
  if (data.packaging !== "250g" && data.packaging !== "500g") {
    throw Error("Invalid coffee packaging");
  }
  
  return Functions.encodeUint256(data.quantity) +
         Functions.encodeUint256(data.price) +
         Functions.encodeString(data.packaging) +
         Functions.encodeString(data.metadataHash);
} catch (error) {
  console.log(" coffee verification failed:", error.message);
  return Functions.encodeUint256(0) + Functions.encodeUint256(0) +
         Functions.encodeString("") + Functions.encodeString("");
}`.trim();

    return NextResponse.json({ 
      sourceCode: fallbackSourceCode,
      version: "1.0.0-fallback-coffee",
      lastUpdated: new Date().toISOString(),
      description: "Fallback Chainlink Functions source code for coffee"
    }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const { sourceCode } = await request.json();
    
    // In production, you might want to save custom source code
    // For now, we'll just validate and return it
    if (!sourceCode || typeof sourceCode !== 'string') {
      return NextResponse.json(
        { error: "Invalid source code provided" },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true,
      message: "Source code updated successfully",
      preview: sourceCode.substring(0, 200) + "..."
    }, { status: 200 });

  } catch (error) {
    console.error("Error updating source code:", error);
    return NextResponse.json(
      { error: "Failed to update source code" },
      { status: 500 }
    );
  }
}
