import { PinataSDK } from "pinata"

// Initialize Pinata SDK with proper configuration
export const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: `https://${process.env.NEXT_PUBLIC_GATEWAY_URL!}`
})

// Test function to verify Pinata connection
export async function testPinataConnection() {
  try {
    await pinata.testAuthentication();
    console.log("✅ Pinata connection verified");
    return true;
  } catch (error) {
    console.error("❌ Pinata connection failed:", error);
    return false;
  }
}
