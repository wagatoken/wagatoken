import { JsonRpcProvider, Wallet, Contract } from "ethers";
const CoffeeTokenAbi = [
  "function createBatch(string ipfsUri,uint256 productionDate,uint256 expiryDate,uint256 pricePerUnit,string packagingInfo,string metadataHash) returns (uint256)",
  "function ADMIN_ROLE() view returns (bytes32)"
];

export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL!;
export const COFFEE_TOKEN_ADDR = process.env.NEXT_PUBLIC_COFFEE_TOKEN_ADDR!;
const PRIVATE_KEY = process.env.ADMIN_PK;

export const provider = new JsonRpcProvider(RPC_URL);

export function getSigner() {
  if (!PRIVATE_KEY) throw new Error("ADMIN_PK not set in env");
  return new Wallet(PRIVATE_KEY, provider);
}

export function getCoffeeTokenContract(signer: any = provider) {
  return new Contract(COFFEE_TOKEN_ADDR, CoffeeTokenAbi as any, signer);
}
