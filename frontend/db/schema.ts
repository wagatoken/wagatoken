import { 
  integer, 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  boolean, 
  decimal,
  bigint,
  json
} from 'drizzle-orm/pg-core';

// WAGA Coffee Batches - Core table for coffee batch management (matches real implementation)
export const wagaCoffeeBatches = pgTable('waga_coffee_batches', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: bigint('batch_id', { mode: 'number' }).notNull().unique(), // Blockchain batch ID

  // Core Batch Data (from smart contract)
  quantity: integer().notNull(), // Current quantity (number of bags/units)
  price: decimal({ precision: 10, scale: 2 }).notNull(), // Price per unit in USD

  // Product Type & Packaging (Extended for multiple product lines)
  productType: varchar({ length: 20 }).notNull().default('RETAIL_BAGS'), // 'RETAIL_BAGS', 'GREEN_BEANS', 'ROASTED_BEANS'
  packaging: varchar({ length: 20 }).notNull(), // '250g', '500g', '60kg' (extended from original)
  unitWeight: varchar({ length: 20 }), // Optional: specific weight per unit
  
  // IPFS & Metadata (actual fields from code)
  metadataHash: varchar({ length: 64 }).notNull(), // IPFS CID
  ipfsUri: varchar({ length: 500 }).notNull(), // Full IPFS URI (ipfs://...)
  
  // Verification Status (from CoffeeBatch interface)
  lastVerified: timestamp(),
  verificationStatus: varchar({ length: 20 }).notNull().default('pending'), // 'pending', 'verified', 'failed'
  inventoryActual: integer().notNull().default(0),
  isVerified: boolean().notNull().default(false), // From smart contract
  isMetadataVerified: boolean().notNull().default(false), // From smart contract
  lastVerifiedTimestamp: bigint('last_verified_timestamp', { mode: 'number' }),
  
  // Batch Details (from batchDetails interface)
  farmName: varchar({ length: 255 }).notNull(),
  location: varchar({ length: 255 }).notNull(), // Called 'origin' in IPFS metadata
  productionDate: timestamp().notNull(), // Matches smart contract (not harvestDate)
  expiryDate: timestamp().notNull(),
  processingMethod: varchar({ length: 100 }), // Optional in types
  qualityScore: integer(), // Optional in types
  
  // Additional IPFS Metadata Fields (from CoffeeBatchMetadata)
  name: varchar({ length: 255 }).notNull(), // From IPFS metadata
  description: text(), // From IPFS metadata
  farmer: varchar({ length: 255 }), // From IPFS properties
  altitude: varchar({ length: 100 }), // From IPFS properties
  process: varchar({ length: 100 }), // From IPFS properties (processing method)

  // Product-Specific Fields (conditional based on productType)
  roastProfile: varchar({ length: 100 }), // For RETAIL_BAGS only
  roastDate: varchar({ length: 50 }), // For RETAIL_BAGS only
  moistureContent: decimal({ precision: 5, scale: 2 }), // For GREEN_BEANS/ROASTED_BEANS
  density: decimal({ precision: 5, scale: 2 }), // For GREEN_BEANS/ROASTED_BEANS
  defectCount: integer(), // For GREEN_BEANS/ROASTED_BEANS

  // Common Fields
  certifications: json(), // Array from IPFS properties
  cuppingNotes: json(), // Array from IPFS properties (cupping_notes)
  image: varchar({ length: 255 }), // Optional IPFS image hash

  // Cooperative/Processor Information (for GREEN_BEANS/ROASTED_BEANS)
  cooperativeId: varchar({ length: 42 }), // Ethereum address of cooperative
  processorId: varchar({ length: 42 }), // Ethereum address of processor/roaster
  
  // Timestamps
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow()
});

// Verification Requests - Track Chainlink verification requests (matches ChainlinkFunctionsRequest)
export const verificationRequests = pgTable('verification_requests', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  requestId: varchar({ length: 255 }).notNull().unique(), // Chainlink request ID
  batchId: bigint('batch_id', { mode: 'number' }).notNull(), // References blockchain batch ID
  
  // Request Details (from ChainlinkFunctionsRequest interface)
  verificationType: varchar({ length: 20 }).notNull().default('reserve'), // 'reserve' or 'inventory'
  status: varchar({ length: 20 }).notNull().default('pending'), // 'pending', 'fulfilled', 'failed'
  
  // Timing (from interface)
  submittedAt: timestamp().notNull().defaultNow(),
  completedAt: timestamp(),
  
  // Results (from ChainlinkFunctionsResult interface)
  verifiedQuantity: integer(),
  verifiedPrice: decimal({ precision: 10, scale: 2 }),
  verifiedPackaging: varchar({ length: 20 }),
  verifiedMetadataHash: varchar({ length: 64 }),
  verified: boolean(),
  
  // Error Handling & Blockchain
  error: text(),
  transactionHash: varchar({ length: 66 }),
  gasUsed: bigint('gas_used', { mode: 'number' }),
  
  // Additional tracking
  requestData: json(), // Chainlink request parameters
  responseData: json() // Full Chainlink response
});

// Redemption Requests - Track coffee redemption requests (matches RedemptionRequest & RedemptionFormData)
export const redemptionRequests = pgTable('redemption_requests', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  redemptionId: integer().unique(), // From RedemptionRequest interface
  
  // Core Request Data
  consumer: varchar({ length: 42 }).notNull(), // User address (called 'consumer' in interface)
  batchId: bigint('batch_id', { mode: 'number' }).notNull(), // References blockchain batch ID
  quantity: integer().notNull(),
  
  // Delivery Information (from RedemptionFormData)
  deliveryAddress: text().notNull(),
  deliveryCity: varchar({ length: 100 }),
  deliveryState: varchar({ length: 50 }),
  deliveryZip: varchar({ length: 20 }),
  deliveryCountry: varchar({ length: 50 }).notNull().default('USA'),
  specialInstructions: text(),
  
  // Status & Timing (from RedemptionRequest interface)
  status: varchar({ length:20 }).notNull().default('Requested'), // 'Requested', 'Processing', 'Fulfilled', 'Cancelled'
  requestDate: timestamp().notNull().defaultNow(),
  fulfillmentDate: timestamp(),
  
  // Additional Details
  packagingInfo: varchar({ length: 20 }),
  trackingNumber: varchar({ length: 100 }),
  
  // Processing Info
  processedBy: varchar({ length: 42 }), // Admin address
  processedAt: timestamp()
});

// User Roles - Manage user permissions and roles (Extended for new product lines)
export const userRoles = pgTable('user_roles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userAddress: varchar({ length: 42 }).notNull().unique(), // Ethereum address
  role: varchar({ length: 50 }).notNull(), // admin, distributor, processor, cooperative, roaster
  permissions: json(), // Array of permissions
  isActive: boolean().notNull().default(true),
  assignedBy: varchar({ length: 42 }).notNull(), // Admin who assigned role
  assignedAt: timestamp().notNull().defaultNow(),
  lastLoginAt: timestamp(),

  // Extended fields for new user types
  companyName: varchar({ length: 255 }), // For cooperatives and roasters
  location: varchar({ length: 255 }), // Geographic location
  certificationLevel: varchar({ length: 50 }), // Organic, Fair Trade, etc.
  specialization: varchar({ length: 100 }), // Coffee type specialization

  metadata: json() // Additional user metadata
});

// Inventory Audits - Track physical inventory audits
export const inventoryAudits = pgTable('inventory_audits', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: bigint('batch_id', { mode: 'number' }).notNull(), // References blockchain batch ID
  auditType: varchar({ length: 50 }).notNull(), // physical_count, quality_check, shipping_verification
  auditorAddress: varchar({ length: 42 }).notNull(), // Auditor's address
  physicalQuantity: decimal({ precision: 10, scale: 2 }).notNull(), // Actual kg found
  discrepancy: decimal({ precision: 10, scale: 2 }).notNull().default('0'), // Difference from expected
  auditNotes: text(),
  auditPhotos: json(), // Array of IPFS hashes for photos
  location: varchar({ length: 255 }), // Storage location
  auditedAt: timestamp().notNull().defaultNow(),
  isResolved: boolean().notNull().default(false),
  resolutionNotes: text()
});

// Batch Token Balances - Track token distribution and balances (matches UserTokenBalance interface)
export const batchTokenBalances = pgTable('batch_token_balances', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  
  // Core Balance Data (from UserTokenBalance interface)
  batchId: bigint('batch_id', { mode: 'number' }).notNull(), // References blockchain batch ID
  holderAddress: varchar({ length: 42 }).notNull(), // Token holder address
  balance: integer().notNull().default(0), // Current token balance (integer, not decimal)
  
  // Transaction Tracking
  lastTransactionHash: varchar({ length: 66 }),
  lastTransactionAt: timestamp(),
  
  // Redemption Status
  isRedeemed: boolean().notNull().default(false),
  redeemedAt: timestamp(),
  redemptionTxHash: varchar({ length: 66 }),
  
  // Cached Batch Details (from UserTokenBalance.batchDetails)
  // These are denormalized for performance in user balance queries
  cachedFarmName: varchar({ length: 255 }),
  cachedLocation: varchar({ length: 255 }),
  cachedPackaging: varchar({ length: 20 }),
  cachedPricePerUnit: decimal({ precision: 10, scale: 2 }),
  
  // Timestamps
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow()
});