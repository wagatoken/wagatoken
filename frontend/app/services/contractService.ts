"use client";

import { ethers } from 'ethers';

// Contract addresses (update these with your deployed addresses)
const CONTRACT_ADDRESSES = {
  COFFEE_TOKEN: process.env.NEXT_PUBLIC_WAGA_COFFEE_TOKEN_ADDRESS,
  PROOF_OF_RESERVE: process.env.NEXT_PUBLIC_WAGA_PROOF_OF_RESERVE_ADDRESS,
  INVENTORY_MANAGER: process.env.NEXT_PUBLIC_WAGA_INVENTORY_MANAGER_ADDRESS,
  REDEMPTION: process.env.NEXT_PUBLIC_WAGA_REDEMPTION_ADDRESS,
};

// ABI definitions (simplified for MVP)
const COFFEE_TOKEN_ABI = [
  "function createBatch(string memory ipfsUri, uint256 productionDate, uint256 expiryDate, uint256 expectedQuantity, uint256 pricePerUnit, string memory packagingInfo, string memory metadataHash) external returns (uint256)",
  "function getbatchInfo(uint256 batchId) external view returns (uint256 productionDate, uint256 expiryDate, bool isVerified, uint256 expectedQuantity, uint256 currentQuantity, uint256 pricePerUnit, string memory packagingInfo, string memory metadataHash, bool isMetadataVerified)",
  "function isBatchCreated(uint256 batchId) external view returns (bool)",
  "function isBatchActive(uint256 batchId) external view returns (bool)",
  "function mintBatch(address to, uint256 batchId, uint256 amount) external",
  "function balanceOf(address account, uint256 id) external view returns (uint256)",
  "function hasRole(bytes32 role, address account) external view returns (bool)",
  "function ADMIN_ROLE() external view returns (bytes32)",
  "function VERIFIER_ROLE() external view returns (bytes32)",
  "function MINTER_ROLE() external view returns (bytes32)",
  "event BatchCreated(uint256 indexed batchId, string ipfsUri)"
];

const PROOF_OF_RESERVE_ABI = [
  "function requestReserveVerification(uint256 batchId, address recipient, string calldata source) external returns (bytes32)",
  "function requestInventoryVerification(uint256 batchId, string calldata source) external returns (bytes32)",
  "function verificationRequests(bytes32 requestId) external view returns (uint256 batchId, uint256 requestQuantity, uint256 verifiedQuantity, uint256 requestPrice, uint256 verifiedPrice, string memory expectedPackaging, string memory verifiedPackaging, string memory expectedMetadataHash, string memory verifiedMetadataHash, address recipient, bool completed, bool verified, uint256 lastVerifiedTimestamp, bool shouldMint)",
  "event ReserveVerificationRequested(bytes32 indexed requestId, uint256 indexed batchId, uint256 quantity)",
  "event ReserveVerificationCompleted(bytes32 indexed requestId, uint256 indexed batchId, bool verified)"
];

const REDEMPTION_ABI = [
  "function requestRedemption(uint256 batchId, uint256 quantity, string memory deliveryAddress) external",
  "function updateRedemptionStatus(uint256 redemptionId, uint8 status) external",
  "function getRedemptionDetails(uint256 redemptionId) external view returns (address consumer, uint256 batchId, uint256 quantity, string memory deliveryAddress, uint256 requestDate, uint8 status, uint256 fulfillmentDate)",
  "function getConsumerRedemptions(address consumer) external view returns (uint256[] memory)",
  "event RedemptionRequested(uint256 indexed redemptionId, address indexed consumer, uint256 batchId, uint256 quantity, string packagingInfo)"
];

export interface BatchCreationData {
  ipfsUri: string;
  productionDate: number; // Unix timestamp
  expiryDate: number; // Unix timestamp
  expectedQuantity: number;
  pricePerUnit: string; // In wei
  packagingInfo: string;
  metadataHash: string;
}

export interface BatchInfo {
  productionDate: number;
  expiryDate: number;
  isVerified: boolean;
  expectedQuantity: number;
  currentQuantity: number;
  pricePerUnit: string;
  packagingInfo: string;
  metadataHash: string;
  isMetadataVerified: boolean;
}

export interface VerificationRequest {
  batchId: number;
  requestQuantity: number;
  verifiedQuantity: number;
  requestPrice: number;
  verifiedPrice: number;
  expectedPackaging: string;
  verifiedPackaging: string;
  expectedMetadataHash: string;
  verifiedMetadataHash: string;
  recipient: string;
  completed: boolean;
  verified: boolean;
  lastVerifiedTimestamp: number;
  shouldMint: boolean;
}

export class ContractService {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.Signer | null = null;
  private coffeeTokenContract: ethers.Contract | null = null;
  private proofOfReserveContract: ethers.Contract | null = null;
  private redemptionContract: ethers.Contract | null = null;

  async initialize() {
    if (typeof window === 'undefined' || !window.ethereum) {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.signer = await this.provider.getSigner();

    // Initialize contracts
    this.coffeeTokenContract = new ethers.Contract(
      CONTRACT_ADDRESSES.COFFEE_TOKEN!,
      COFFEE_TOKEN_ABI,
      this.signer
    );

    this.proofOfReserveContract = new ethers.Contract(
      CONTRACT_ADDRESSES.PROOF_OF_RESERVE!,
      PROOF_OF_RESERVE_ABI,
      this.signer
    );

    this.redemptionContract = new ethers.Contract(
      CONTRACT_ADDRESSES.REDEMPTION!,
      REDEMPTION_ABI,
      this.signer
    );
  }

  /**
   * Phase 1: Create batch on-chain after IPFS upload
   */
  async createBatch(data: BatchCreationData): Promise<{ batchId: number; txHash: string }> {
    if (!this.coffeeTokenContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.coffeeTokenContract.createBatch(
        data.ipfsUri,
        data.productionDate,
        data.expiryDate,
        data.expectedQuantity,
        data.pricePerUnit,
        data.packagingInfo,
        data.metadataHash
      );

      const receipt = await tx.wait();
      
      // Extract batch ID from event
      const batchCreatedEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.coffeeTokenContract!.interface.parseLog(log);
          return parsedLog?.name === 'BatchCreated';
        } catch {
          return false;
        }
      });

      if (!batchCreatedEvent) {
        throw new Error('BatchCreated event not found');
      }

      const parsedEvent = this.coffeeTokenContract.interface.parseLog(batchCreatedEvent);
      if (!parsedEvent) {
        throw new Error('Failed to parse BatchCreated event');
      }
      
      const batchId = Number(parsedEvent.args.batchId);

      return {
        batchId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error creating batch:', error);
      throw new Error(`Failed to create batch: ${error.message}`);
    }
  }

  /**
   * Get batch information from smart contract
   */
  async getBatchInfo(batchId: number): Promise<BatchInfo> {
    if (!this.coffeeTokenContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await this.coffeeTokenContract.getbatchInfo(batchId);
      
      return {
        productionDate: Number(result[0]),
        expiryDate: Number(result[1]),
        isVerified: result[2],
        expectedQuantity: Number(result[3]),
        currentQuantity: Number(result[4]),
        pricePerUnit: result[5].toString(),
        packagingInfo: result[6],
        metadataHash: result[7],
        isMetadataVerified: result[8]
      };
    } catch (error: any) {
      console.error('Error getting batch info:', error);
      throw new Error(`Failed to get batch info: ${error.message}`);
    }
  }

  /**
   * Phase 2: Request batch verification
   */
  async requestBatchVerification(
    batchId: number, 
    recipient: string,
    sourceCode?: string
  ): Promise<{ requestId: string; txHash: string }> {
    if (!this.proofOfReserveContract) {
      throw new Error('Contract not initialized');
    }

    try {
      // Get source code if not provided
      let jsSource = sourceCode;
      if (!jsSource) {
        const response = await fetch('/api/chainlink/source-code');
        if (!response.ok) {
          throw new Error('Failed to fetch source code');
        }
        const data = await response.json();
        jsSource = data.sourceCode;
      }

      const tx = await this.proofOfReserveContract.requestReserveVerification(
        batchId,
        recipient,
        jsSource
      );

      const receipt = await tx.wait();

      // Extract request ID from event
      const verificationEvent = receipt.logs.find((log: any) => {
        try {
          const parsedLog = this.proofOfReserveContract!.interface.parseLog(log);
          return parsedLog?.name === 'ReserveVerificationRequested';
        } catch {
          return false;
        }
      });

      if (!verificationEvent) {
        throw new Error('ReserveVerificationRequested event not found');
      }

      const parsedEvent = this.proofOfReserveContract.interface.parseLog(verificationEvent);
      if (!parsedEvent) {
        throw new Error('Failed to parse ReserveVerificationRequested event');
      }
      
      const requestId = parsedEvent.args.requestId;

      return {
        requestId,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error requesting verification:', error);
      throw new Error(`Failed to request verification: ${error.message}`);
    }
  }

  /**
   * Get verification request status
   */
  async getVerificationStatus(requestId: string): Promise<VerificationRequest> {
    if (!this.proofOfReserveContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const result = await this.proofOfReserveContract.verificationRequests(requestId);
      
      return {
        batchId: Number(result[0]),
        requestQuantity: Number(result[1]),
        verifiedQuantity: Number(result[2]),
        requestPrice: Number(result[3]),
        verifiedPrice: Number(result[4]),
        expectedPackaging: result[5],
        verifiedPackaging: result[6],
        expectedMetadataHash: result[7],
        verifiedMetadataHash: result[8],
        recipient: result[9],
        completed: result[10],
        verified: result[11],
        lastVerifiedTimestamp: Number(result[12]),
        shouldMint: result[13]
      };
    } catch (error: any) {
      console.error('Error getting verification status:', error);
      throw new Error(`Failed to get verification status: ${error.message}`);
    }
  }

  /**
   * Phase 3: Mint tokens (for ADMIN/MINTER role)
   */
  async mintTokens(
    to: string, 
    batchId: number, 
    amount: number
  ): Promise<{ txHash: string }> {
    if (!this.coffeeTokenContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.coffeeTokenContract.mintBatch(to, batchId, amount);
      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error minting tokens:', error);
      throw new Error(`Failed to mint tokens: ${error.message}`);
    }
  }

  /**
   * Get token balance
   */
  async getTokenBalance(address: string, batchId: number): Promise<number> {
    if (!this.coffeeTokenContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const balance = await this.coffeeTokenContract.balanceOf(address, batchId);
      return Number(balance);
    } catch (error: any) {
      console.error('Error getting token balance:', error);
      throw new Error(`Failed to get token balance: ${error.message}`);
    }
  }

  /**
   * Phase 4: Request redemption
   */
  async requestRedemption(
    batchId: number,
    quantity: number,
    deliveryAddress: string
  ): Promise<{ txHash: string }> {
    if (!this.redemptionContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const tx = await this.redemptionContract.requestRedemption(
        batchId,
        quantity,
        deliveryAddress
      );

      const receipt = await tx.wait();

      return {
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error requesting redemption:', error);
      throw new Error(`Failed to request redemption: ${error.message}`);
    }
  }

  /**
   * Get user's redemptions
   */
  async getUserRedemptions(userAddress: string): Promise<number[]> {
    if (!this.redemptionContract) {
      throw new Error('Contract not initialized');
    }

    try {
      const redemptionIds = await this.redemptionContract.getConsumerRedemptions(userAddress);
      return redemptionIds.map((id: any) => Number(id));
    } catch (error: any) {
      console.error('Error getting user redemptions:', error);
      throw new Error(`Failed to get user redemptions: ${error.message}`);
    }
  }

  /**
   * Check user roles
   */
  async hasRole(role: 'ADMIN' | 'VERIFIER' | 'MINTER', userAddress: string): Promise<boolean> {
    if (!this.coffeeTokenContract) {
      throw new Error('Contract not initialized');
    }

    try {
      let roleBytes: string;
      
      switch (role) {
        case 'ADMIN':
          roleBytes = await this.coffeeTokenContract.ADMIN_ROLE();
          break;
        case 'VERIFIER':
          roleBytes = await this.coffeeTokenContract.VERIFIER_ROLE();
          break;
        case 'MINTER':
          roleBytes = await this.coffeeTokenContract.MINTER_ROLE();
          break;
        default:
          throw new Error(`Unknown role: ${role}`);
      }

      return await this.coffeeTokenContract.hasRole(roleBytes, userAddress);
    } catch (error: any) {
      console.error('Error checking role:', error);
      return false;
    }
  }
}

export const contractService = new ContractService();
