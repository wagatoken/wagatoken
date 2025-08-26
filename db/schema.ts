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

// WAGA Coffee Batches - Core table for coffee batch management
export const wagaCoffeeBatches = pgTable('waga_coffee_batches', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: bigint().notNull().unique(), // Blockchain batch ID
  farmerName: varchar({ length: 255 }).notNull(),
  coffeeType: varchar({ length: 100 }).notNull(),
  region: varchar({ length: 100 }).notNull(),
  harvestDate: timestamp().notNull(),
  processingMethod: varchar({ length: 100 }).notNull(),
  quantity: decimal({ precision: 10, scale: 2 }).notNull(), // kg
  qualityScore: integer().notNull(), // 1-100
  certifications: text(), // JSON string of certifications
  pricePerKg: decimal({ precision: 10, scale: 2 }).notNull(), // USD
  isVerified: boolean().notNull().default(false),
  verificationDate: timestamp(),
  verificationNotes: text(),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow()
});

// Verification Requests - Track Chainlink verification requests
export const verificationRequests = pgTable('verification_requests', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: bigint().notNull(), // References blockchain batch ID
  requestId: varchar({ length: 255 }).notNull().unique(), // Chainlink request ID
  status: varchar({ length: 50 }).notNull().default('pending'), // pending, completed, failed
  requestData: json(), // Chainlink request parameters
  responseData: json(), // Chainlink response data
  errorMessage: text(),
  requestedAt: timestamp().notNull().defaultNow(),
  completedAt: timestamp(),
  gasUsed: bigint(),
  transactionHash: varchar({ length: 66 })
});

// Redemption Requests - Track coffee redemption requests
export const redemptionRequests = pgTable('redemption_requests', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: bigint().notNull(), // References blockchain batch ID
  userAddress: varchar({ length: 42 }).notNull(), // Ethereum address
  requestedQuantity: decimal({ precision: 10, scale: 2 }).notNull(), // kg
  status: varchar({ length: 50 }).notNull().default('pending'), // pending, approved, fulfilled, rejected
  requestNotes: text(),
  adminNotes: text(),
  shippingAddress: json(), // Shipping details as JSON
  trackingNumber: varchar({ length: 100 }),
  requestedAt: timestamp().notNull().defaultNow(),
  processedAt: timestamp(),
  fulfilledAt: timestamp(),
  processedBy: varchar({ length: 42 }) // Admin address
});

// User Roles - Manage user permissions and roles
export const userRoles = pgTable('user_roles', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userAddress: varchar({ length: 42 }).notNull().unique(), // Ethereum address
  role: varchar({ length: 50 }).notNull(), // admin, distributor, user
  permissions: json(), // Array of permissions
  isActive: boolean().notNull().default(true),
  assignedBy: varchar({ length: 42 }).notNull(), // Admin who assigned role
  assignedAt: timestamp().notNull().defaultNow(),
  lastLoginAt: timestamp(),
  metadata: json() // Additional user metadata
});

// Inventory Audits - Track physical inventory audits
export const inventoryAudits = pgTable('inventory_audits', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: bigint().notNull(), // References blockchain batch ID
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

// Batch Token Balances - Track token distribution and balances
export const batchTokenBalances = pgTable('batch_token_balances', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  batchId: bigint().notNull(), // References blockchain batch ID
  holderAddress: varchar({ length: 42 }).notNull(), // Token holder address
  balance: decimal({ precision: 18, scale: 8 }).notNull(), // Token balance (18 decimals)
  lastTransactionHash: varchar({ length: 66 }),
  lastTransactionAt: timestamp(),
  isRedeemed: boolean().notNull().default(false),
  redeemedAt: timestamp(),
  redemptionTxHash: varchar({ length: 66 }),
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp().notNull().defaultNow()
});