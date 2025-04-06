
```prism
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ==================== User Management ====================

model User {
  id                String    @id @default(cuid())
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  walletAddress     String    @unique
  email             String?   @unique
  name              String?
  bio               String?
  avatar            String?
  role              UserRole  @default(MEMBER)
  isActive          Boolean   @default(true)
  joinedAt          DateTime  @default(now())
  lastLogin         DateTime?
  reputation        Int       @default(0)
  
  // Relationships
  batches           CoffeeBatch[]
  verifications     VerificationRequest[]
  tokens            MintedToken[]
  redemptions       RedemptionRequest[]
  distributorProfile Distributor?
  forumTopics       ForumTopic[]
  forumReplies      ForumReply[]
  resources         Resource[]
  events            Event[]
  eventRegistrations EventRegistration[]
  activities        Activity[]
  badges            UserBadge[]
  notifications     Notification[]
  tokenSales        TokenSale[]
  
  @@index([walletAddress])
}

enum UserRole {
  ADMIN
  MODERATOR
  FOUNDING_MEMBER
  MEMBER
  DISTRIBUTOR
}

model UserBadge {
  id          String   @id @default(cuid())
  createdAt   DateTime @default(now())
  userId      String
  badgeType   String
  awardedAt   DateTime @default(now())
  description String?
  
  // Relationships
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
}

// ==================== Coffee Tokenization System ====================

model CoffeeBatch {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  batchId         String    @unique // External ID for the batch
  producer        String
  origin          String
  variety         String
  altitude        String
  process         String
  roastProfile    String
  harvestDate     DateTime
  quantity        Int       // Number of retail bags
  packagingInfo   String    // Retail bag size (250g, 500g, etc.)
  pricePerUnit    Float
  metadataHash    String?   // IPFS hash for additional metadata
  qrCodeUrl       String?   // URL for QR code verification
  status          BatchStatus @default(CREATED)
  creatorId       String
  
  // Relationships
  creator         User      @relation(fields: [creatorId], references: [id])
  verifications   VerificationRequest[]
  tokens          MintedToken[]
  
  @@index([batchId])
  @@index([creatorId])
  @@index([status])
}

enum BatchStatus {
  CREATED
  VERIFIED
  TOKENIZED
  DISTRIBUTED
  REDEEMED
}

model VerificationRequest {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  batchId         String
  status          VerificationStatus @default(PENDING)
  inspectorId     String
  warehouseId     String
  timestamp       DateTime  @default(now())
  quantityVerified Int
  qualityScore    Int
  notes           String?
  txHash          String?   // Blockchain transaction hash
  
  // Relationships
  batch           CoffeeBatch @relation(fields: [batchId], references: [id])
  inspector       User      @relation(fields: [inspectorId], references: [id])
  
  @@index([batchId])
  @@index([inspectorId])
  @@index([status])
}

enum VerificationStatus {
  PENDING
  COMPLETED
  FAILED
}

model MintedToken {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  tokenId         Int       @unique // On-chain token ID
  batchId         String
  quantity        Int       // Number of tokens minted
  ownerId         String
  metadataURI     String    // IPFS URI for token metadata
  txHash          String    // Blockchain transaction hash
  
  // Relationships
  batch           CoffeeBatch @relation(fields: [batchId], references: [id])
  owner           User      @relation(fields: [ownerId], references: [id])
  redemptions     RedemptionRequest[]
  distributionOrders DistributionOrderItem[]
  
  @@index([tokenId])
  @@index([batchId])
  @@index([ownerId])
}

model RedemptionRequest {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  tokenId         String
  quantity        Int
  userId          String
  shippingAddress String
  status          RedemptionStatus @default(PENDING)
  trackingNumber  String?
  estimatedDelivery DateTime?
  logisticsProvider String?
  txHash          String    // Blockchain transaction hash
  
  // Relationships
  token           MintedToken @relation(fields: [tokenId], references: [id])
  user            User      @relation(fields: [userId], references: [id])
  
  @@index([tokenId])
  @@index([userId])
  @@index([status])
}

enum RedemptionStatus {
  PENDING
  PROCESSING
  SHIPPED
  COMPLETED
}

// ==================== Distribution Network ====================

model Distributor {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  userId          String    @unique
  name            String
  location        String
  stakingAmount   Int       @default(0)
  discountRate    Float     @default(0)
  status          DistributorStatus @default(PENDING)
  joinedAt        DateTime  @default(now())
  
  // Relationships
  user            User      @relation(fields: [userId], references: [id])
  orders          DistributionOrder[]
  
  @@index([userId])
  @@index([status])
}

enum DistributorStatus {
  ACTIVE
  PENDING
}

model DistributionOrder {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  distributorId   String
  status          DistributionOrderStatus @default(PENDING)
  shippedAt       DateTime?
  deliveredAt     DateTime?
  trackingInfo    Json?     // Provider, tracking number, estimated delivery
  
  // Relationships
  distributor     Distributor @relation(fields: [distributorId], references: [id])
  items           DistributionOrderItem[]
  
  @@index([distributorId])
  @@index([status])
}

model DistributionOrderItem {
  id              String    @id @default(cuid())
  orderId         String
  tokenId         String
  quantity        Int
  
  // Relationships
  order           DistributionOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  token           MintedToken @relation(fields: [tokenId], references: [id])
  
  @@index([orderId])
  @@index([tokenId])
}

enum DistributionOrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
}

model LogisticsProvider {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String
  regions         String[]
  trackingUrl     String
  integrationStatus String
}

// ==================== QR Traceability ====================

model QRCode {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  url             String    @unique
  batchId         String?
  tokenId         String?
  type            QRCodeType
  scans           QRScan[]
  
  @@index([url])
}

enum QRCodeType {
  BATCH
  TOKEN
  PRODUCT
}

model QRScan {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  qrCodeId        String
  scannerIp       String?
  userAgent       String?
  location        String?
  
  // Relationships
  qrCode          QRCode   @relation(fields: [qrCodeId], references: [id])
  
  @@index([qrCodeId])
}

// ==================== Community Platform ====================

model ForumCategory {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String
  description     String?
  order           Int       @default(0)
  
  // Relationships
  topics          ForumTopic[]
}

model ForumTopic {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  title           String
  content         String
  categoryId      String
  authorId        String
  isSticky        Boolean   @default(false)
  isLocked        Boolean   @default(false)
  viewCount       Int       @default(0)
  lastActivityAt  DateTime  @default(now())
  
  // Relationships
  category        ForumCategory @relation(fields: [categoryId], references: [id])
  author          User      @relation(fields: [authorId], references: [id])
  replies         ForumReply[]
  
  @@index([categoryId])
  @@index([authorId])
  @@index([isSticky])
}

model ForumReply {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  content         String
  topicId         String
  authorId        String
  
  // Relationships
  topic           ForumTopic @relation(fields: [topicId], references: [id], onDelete: Cascade)
  author          User      @relation(fields: [authorId], references: [id])
  
  @@index([topicId])
  @@index([authorId])
}

model Resource {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  title           String
  description     String
  type            ResourceType
  fileUrl         String
  thumbnailUrl    String?
  authorId        String
  publishDate     DateTime  @default(now())
  downloadCount   Int       @default(0)
  rating          Float     @default(0)
  
  // Relationships
  author          User      @relation(fields: [authorId], references: [id])
  
  @@index([authorId])
  @@index([type])
}

enum ResourceType {
  GUIDE
  TUTORIAL
  WHITEPAPER
  VIDEO
  IMAGE
  DOCUMENT
}

model Event {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  title           String
  description     String
  type            EventType
  date            DateTime
  time            String
  duration        Int       // In minutes
  location        String?   // Physical location or virtual link
  capacity        Int
  organizerId     String
  
  // Relationships
  organizer       User      @relation(fields: [organizerId], references: [id])
  registrations   EventRegistration[]
  speakers        EventSpeaker[]
  
  @@index([organizerId])
  @@index([date])
  @@index([type])
}

enum EventType {
  WEBINAR
  WORKSHOP
  AMA
  CONFERENCE
  MEETUP
}

model EventRegistration {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  eventId         String
  userId          String
  status          RegistrationStatus @default(REGISTERED)
  
  // Relationships
  event           Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  user            User      @relation(fields: [userId], references: [id])
  
  @@unique([eventId, userId])
  @@index([eventId])
  @@index([userId])
}

enum RegistrationStatus {
  REGISTERED
  ATTENDED
  CANCELLED
}

model EventSpeaker {
  id              String    @id @default(cuid())
  eventId         String
  name            String
  bio             String?
  avatar          String?
  
  // Relationships
  event           Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)
  
  @@index([eventId])
}

model Activity {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  type            ActivityType
  title           String
  content         String?
  userId          String
  url             String?
  
  // Relationships
  user            User      @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([type])
  @@index([createdAt])
}

enum ActivityType {
  POST
  COMMENT
  RESOURCE
  EVENT
  REACTION
  TOKEN_MINT
  TOKEN_REDEEM
  BATCH_CREATE
  BATCH_VERIFY
}

// ==================== Notification System ====================

model Notification {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  userId          String
  type            NotificationType
  title           String
  content         String
  isRead          Boolean   @default(false)
  url             String?
  
  // Relationships
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}

enum NotificationType {
  SYSTEM
  FORUM
  EVENT
  TOKEN
  BATCH
  DISTRIBUTION
  REDEMPTION
}

// ==================== Token Pre-Sale ====================

model TokenSale {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  userId          String
  amount          Float
  tokenAmount     Int
  status          TokenSaleStatus @default(PENDING)
  paymentMethod   PaymentMethod
  paymentId       String?   // External payment ID
  txHash          String?   // Blockchain transaction hash
  
  // Relationships
  user            User      @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
}

enum TokenSaleStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

enum PaymentMethod {
  ETH
  BTC
  USDT
  USDC
  CREDIT_CARD
  BANK_TRANSFER
}

model TokenSalePhase {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String
  description     String?
  startDate       DateTime
  endDate         DateTime
  tokenPrice      Float
  hardCap         Int
  softCap         Int
  minPurchase     Int
  maxPurchase     Int
  isActive        Boolean   @default(false)
}

model KYCVerification {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  walletAddress   String    @unique
  status          KYCStatus @default(PENDING)
  verificationId  String?   // External verification ID
  verificationData Json?    // Stored securely
  expiresAt       DateTime?
  
  @@index([walletAddress])
  @@index([status])
}

enum KYCStatus {
  PENDING
  APPROVED
  REJECTED
  EXPIRED
}

// ==================== Admin System ====================

model SystemSetting {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  key             String    @unique
  value           String
  description     String?
  isPublic        Boolean   @default(false)
}

model FeatureFlag {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String    @unique
  description     String?
  isEnabled       Boolean   @default(false)
  userRoles       UserRole[]
}

model AuditLog {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  action          String
  entityType      String
  entityId        String
  userId          String?
  ipAddress       String?
  userAgent       String?
  details         Json?
  
  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
}

model ContentItem {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  title           String
  type            ContentType
  status          ContentStatus @default(DRAFT)
  author          String
  publishDate     DateTime?
  content         String
  featured        Boolean   @default(false)
  views           Int       @default(0)
  
  @@index([type])
  @@index([status])
  @@index([featured])
}

enum ContentType {
  ARTICLE
  VIDEO
  IMAGE
  LINK
}

enum ContentStatus {
  DRAFT
  REVIEW
  PUBLISHED
}

```