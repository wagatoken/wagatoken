// Mock data for development when database is not available
// This file provides dummy data and can be easily replaced with real database calls

export interface MockBatch {
  batchId: string;
  name: string;
  origin: string;
  farmer: string;
  quantity: number;
  packagingInfo: string;
  pricePerUnit: string;
  isVerified: boolean;
  isMetadataVerified: boolean;
  productType: 'RETAIL_BAGS' | 'GREEN_BEANS' | 'ROASTED_BEANS';
  unitWeight: string;
  createdAt: string;
  verifiedAt?: string;
  metadata?: {
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

export interface MockUser {
  address: string;
  roles: {
    isAdmin: boolean;
    isVerifier: boolean;
    isMinter: boolean;
    isRedemption: boolean;
    isFulfiller: boolean;
  };
  balances: Record<string, number>; // batchId -> balance
}

export interface MockStats {
  totalBatches: number;
  activeBatches: number;
  totalSupply: number;
  redemptionRate: number;
  verifiedBatches: number;
  pendingVerifications: number;
}

// Mock batch data
export const MOCK_BATCHES: MockBatch[] = [
  {
    batchId: "1",
    name: "Ethiopian Highland Arabica",
    origin: "Sidamo, Ethiopia",
    farmer: "Haile Gebremariam",
    quantity: 100,
    packagingInfo: "60kg",
    pricePerUnit: "0.05",
    isVerified: true,
    isMetadataVerified: true,
    productType: "GREEN_BEANS",
    unitWeight: "60kg",
    createdAt: "2024-12-01T10:00:00Z",
    verifiedAt: "2024-12-02T15:30:00Z",
    metadata: {
      description: "Premium single-origin Ethiopian Arabica beans",
      image: "https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Ethiopian+Coffee",
      attributes: [
        { trait_type: "Origin", value: "Sidamo, Ethiopia" },
        { trait_type: "Altitude", value: "1800-2000m" },
        { trait_type: "Processing", value: "Washed" },
        { trait_type: "Grade", value: "Grade 1" }
      ]
    }
  },
  {
    batchId: "2",
    name: "Colombian Supreme",
    origin: "Huila, Colombia",
    farmer: "Maria Rodriguez",
    quantity: 75,
    packagingInfo: "60kg",
    pricePerUnit: "0.06",
    isVerified: true,
    isMetadataVerified: true,
    productType: "GREEN_BEANS",
    unitWeight: "60kg",
    createdAt: "2024-12-03T14:20:00Z",
    verifiedAt: "2024-12-04T11:45:00Z",
    metadata: {
      description: "High-quality Colombian coffee from Huila region",
      image: "https://via.placeholder.com/400x300/654321/FFFFFF?text=Colombian+Coffee",
      attributes: [
        { trait_type: "Origin", value: "Huila, Colombia" },
        { trait_type: "Altitude", value: "1500-1700m" },
        { trait_type: "Processing", value: "Honey" },
        { trait_type: "Grade", value: "Supremo" }
      ]
    }
  },
  {
    batchId: "3",
    name: "Brazilian Santos Roasted",
    origin: "Cerrado, Brazil",
    farmer: "Roberto Silva",
    quantity: 200,
    packagingInfo: "500g",
    pricePerUnit: "0.02",
    isVerified: false,
    isMetadataVerified: true,
    productType: "ROASTED_BEANS",
    unitWeight: "500g",
    createdAt: "2024-12-05T09:15:00Z",
    metadata: {
      description: "Medium roast Brazilian Santos beans",
      image: "https://via.placeholder.com/400x300/8B4513/FFFFFF?text=Brazilian+Roasted",
      attributes: [
        { trait_type: "Origin", value: "Cerrado, Brazil" },
        { trait_type: "Roast Level", value: "Medium" },
        { trait_type: "Processing", value: "Natural" },
        { trait_type: "Grade", value: "NY2" }
      ]
    }
  },
  {
    batchId: "4",
    name: "Premium Retail Blend",
    origin: "Multi-Origin Blend",
    farmer: "Cooperative Blend",
    quantity: 500,
    packagingInfo: "250g",
    pricePerUnit: "0.015",
    isVerified: true,
    isMetadataVerified: true,
    productType: "RETAIL_BAGS",
    unitWeight: "250g",
    createdAt: "2024-12-06T16:30:00Z",
    verifiedAt: "2024-12-07T10:20:00Z",
    metadata: {
      description: "Premium retail coffee blend ready for consumers",
      image: "https://via.placeholder.com/400x300/2F4F4F/FFFFFF?text=Retail+Blend",
      attributes: [
        { trait_type: "Blend", value: "60% Arabica, 40% Robusta" },
        { trait_type: "Roast Level", value: "Medium-Dark" },
        { trait_type: "Packaging", value: "Vacuum Sealed" },
        { trait_type: "Shelf Life", value: "12 months" }
      ]
    }
  }
];

// Mock user data
export const MOCK_USERS: Record<string, MockUser> = {
  "0x1234567890123456789012345678901234567890": {
    address: "0x1234567890123456789012345678901234567890",
    roles: {
      isAdmin: true,
      isVerifier: true,
      isMinter: true,
      isRedemption: true,
      isFulfiller: true
    },
    balances: {
      "1": 10,
      "2": 5,
      "4": 25
    }
  },
  "0x0987654321098765432109876543210987654321": {
    address: "0x0987654321098765432109876543210987654321",
    roles: {
      isAdmin: false,
      isVerifier: false,
      isMinter: false,
      isRedemption: true,
      isFulfiller: false
    },
    balances: {
      "1": 3,
      "4": 8
    }
  }
};

// Mock stats
export const MOCK_STATS: MockStats = {
  totalBatches: MOCK_BATCHES.length,
  activeBatches: MOCK_BATCHES.filter(b => !b.isVerified).length,
  totalSupply: MOCK_BATCHES.reduce((sum, b) => sum + b.quantity, 0),
  redemptionRate: 0.75, // 75%
  verifiedBatches: MOCK_BATCHES.filter(b => b.isVerified).length,
  pendingVerifications: MOCK_BATCHES.filter(b => !b.isVerified).length
};

// Helper functions to simulate database operations
export class MockDataService {
  private static batches = [...MOCK_BATCHES];
  private static users = { ...MOCK_USERS };

  // Batch operations
  static async getBatches(): Promise<MockBatch[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.batches];
  }

  static async getBatch(batchId: string): Promise<MockBatch | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.batches.find(b => b.batchId === batchId) || null;
  }

  static async createBatch(batchData: Omit<MockBatch, 'batchId' | 'createdAt'>): Promise<MockBatch> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newBatch: MockBatch = {
      ...batchData,
      batchId: (this.batches.length + 1).toString(),
      createdAt: new Date().toISOString()
    };
    this.batches.push(newBatch);
    return newBatch;
  }

  static async verifyBatch(batchId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const batchIndex = this.batches.findIndex(b => b.batchId === batchId);
    if (batchIndex !== -1) {
      this.batches[batchIndex].isVerified = true;
      this.batches[batchIndex].verifiedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // User operations
  static async getUser(address: string): Promise<MockUser | null> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return this.users[address] || null;
  }

  static async getUserBalance(address: string, batchId: string): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const user = this.users[address];
    return user?.balances[batchId] || 0;
  }

  static async updateUserBalance(address: string, batchId: string, amount: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (!this.users[address]) {
      this.users[address] = {
        address,
        roles: {
          isAdmin: false,
          isVerifier: false,
          isMinter: false,
          isRedemption: true,
          isFulfiller: false
        },
        balances: {}
      };
    }
    this.users[address].balances[batchId] = amount;
  }

  // Stats operations
  static async getStats(): Promise<MockStats> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      totalBatches: this.batches.length,
      activeBatches: this.batches.filter(b => !b.isVerified).length,
      totalSupply: this.batches.reduce((sum, b) => sum + b.quantity, 0),
      redemptionRate: 0.75,
      verifiedBatches: this.batches.filter(b => b.isVerified).length,
      pendingVerifications: this.batches.filter(b => !b.isVerified).length
    };
  }

  // Reset data (for testing)
  static reset(): void {
    this.batches = [...MOCK_BATCHES];
    this.users = { ...MOCK_USERS };
  }
}
