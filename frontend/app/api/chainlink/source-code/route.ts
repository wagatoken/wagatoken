import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    // Read the default source code file from your codebase
    const sourceCodePath = join(process.cwd(), '../../DefaultSourceCode.js');
    const sourceCode = readFileSync(sourceCodePath, 'utf8');

    // Replace placeholder API URL with production URL
    const productionSourceCode = sourceCode
      .replace('https://api.wagacoffee.com', process.env.NEXT_PUBLIC_API_BASE_URL || '')
      .replace('/inventory/batch/', '/api/batches/')
      .replace('/metadata/verify/', '/api/batches/pin-status?cid=');

    return NextResponse.json({ 
      sourceCode: productionSourceCode,
      version: "1.0.0",
      lastUpdated: new Date().toISOString()
    }, { status: 200 });

  } catch (error) {
    console.error("Error reading source code:", error);
    
    // Fallback source code if file read fails
    const fallbackSourceCode = `
// WAGA Coffee Chainlink Functions Source Code
const batchId = args[0];
const expectedQuantity = parseInt(args[1]);
const expectedPrice = parseInt(args[2]);
const expectedPackaging = args[3];
const expectedMetadataHash = args[4];

try {
  const response = await Functions.makeHttpRequest({
    url: \`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/batches/\${batchId}\`,
    method: "GET",
    headers: { "Content-Type": "application/json" }
  });

  if (response.error) throw new Error(response.error);
  
  const data = response.data;
  return Functions.encodeUint256(data.quantity) +
         Functions.encodeUint256(data.price) +
         Functions.encodeString(data.packaging) +
         Functions.encodeString(data.metadataHash);
} catch (error) {
  return Functions.encodeUint256(0) + Functions.encodeUint256(0) +
         Functions.encodeString("") + Functions.encodeString("");
}`.trim();

    return NextResponse.json({ 
      sourceCode: fallbackSourceCode,
      version: "1.0.0-fallback",
      lastUpdated: new Date().toISOString()
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
