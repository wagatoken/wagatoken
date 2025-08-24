import { NextResponse } from "next/server";
import { pinata } from "@/utils/config";

export async function GET() {
  try {
    console.log("Fetching all files from Pinata for debugging...");
    
    // Get all pinned files from Pinata
    const files = await pinata.files.list();
    
    console.log(`Found ${files.files.length} total files in Pinata`);
    
    // Log each file's details
    const fileDetails = files.files.map(file => ({
      name: file.name,
      cid: file.cid,
      size: file.size,
      mimeType: file.mime_type,
      keyvalues: file.keyvalues
    }));
    
    console.log("File details:", fileDetails);
    
    // Check which files match the coffee-batch pattern
    const coffeeFiles = files.files.filter(file => 
      file.name?.startsWith('coffee-batch-')
    );
    
    console.log(`Files matching 'coffee-batch-' pattern: ${coffeeFiles.length}`);
    
    return NextResponse.json({
      success: true,
      totalFiles: files.files.length,
      allFiles: fileDetails,
      coffeeFiles: coffeeFiles.map(f => ({ name: f.name, cid: f.cid })),
      message: "Pinata files debug information"
    });
    
  } catch (error) {
    console.error("❌ Pinata files debug failed:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json({
      success: false,
      error: "Failed to fetch Pinata files",
      details: errorMessage
    }, { status: 500 });
  }
}
