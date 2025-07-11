import { NextResponse, type NextRequest } from "next/server";
import { pinata } from "@/utils/config";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cid = searchParams.get('cid');
    
    if (!cid) {
      return NextResponse.json(
        { error: "CID parameter required" },
        { status: 400 }
      );
    }

    console.log(`Checking pin status for CID: ${cid}`);
    
    // List all files to check if our CID is pinned
    const files = await pinata.files.list();
    const pinnedFile = files.files.find(file => file.cid === cid);
    
    const isPinned = !!pinnedFile;
    
    console.log(`Pin status for ${cid}: ${isPinned ? 'PINNED' : 'NOT PINNED'}`);
    
    return NextResponse.json({
      cid,
      isPinned,
      fileInfo: pinnedFile || null
    }, { status: 200 });
  } catch (error) {
    console.error("Error checking pin status:", error);
    return NextResponse.json(
      { error: "Failed to check pin status" },
      { status: 500 }
    );
  }
}
