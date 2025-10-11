# Frontend Integration Plan for WAGA MVP V2

## Overview
This document outlines the required frontend updates to align with the newly deployed WAGA contracts on Base Sepolia. The contracts have significant architectural changes that require frontend modifications.

## Major Changes from Previous Version

### 1. Central Authority Pattern
- **Old**: Multiple contracts with role inheritance
- **New**: Single `WAGAConfigManager` handles all access control
- **Impact**: All role checks now go through one contract

### 2. New Contract Addresses (Base Sepolia)
All contract addresses have changed and need to be updated in frontend configuration:

```typescript
// Update contract addresses in frontend config
export const CONTRACTS = {
  WAGACoffeeTokenCore: "0x5f4bE57dA14a03387Db976CB4c16F619f6958544",
  WAGAConfigManager: "0xdf47b379c23647cAeD932D025104d40D8B2A7864",
  WAGACoffeeRedemption: "0x4dc1Ea2637a74919262e31396B18ce83d2f0bfB3",
  WAGATreasury: "0xe400f90fc4E59B0DA49c8f818C371d9233e7D83f",
  WAGAEthiopianComplianceCore: "0x7F88fA7cFdAA15D9f4B735e89A2DA3026633c6a2",
  WAGABankingCore: "0x1B1CFE2272E65caE26823Aa4BA53877A290EAB32",
  WAGAZKManager: "0x56d7F9947Cd6946153A24dE66d27Be9Eb071FD4e",
  CircomVerifier: "0xEf6875Ae4418191422C0cD4D59036345A5e8cADF",
  // ... (all 24 contracts)
};
```

### 3. New Function Signatures

#### WAGAConfigManager Functions (NEW)
```typescript
// Seller registration (completely new)
interface SellerProfile {
  sellerId: bigint;
  sellerType: 0 | 1 | 2; // COOPERATIVE, PROCESSOR, ROASTER
  sellerName: string;
  businessRegistration: string;
  preferredBankSwift: string;
  isActive: boolean;
  registrationTimestamp: bigint;
}

// New functions to implement
registerSeller(
  sellerAddress: string,
  sellerType: 0 | 1 | 2,
  sellerName: string,
  businessRegistration: string,
  preferredBankSwift: string
): Promise<TransactionResponse>

getSellerId(sellerAddress: string): Promise<bigint>
getSellerProfile(sellerId: bigint): Promise<SellerProfile>
isRegisteredSeller(address: string): Promise<boolean>

// Role management functions
grantCooperativeRole(address: string): Promise<TransactionResponse>
grantProcessorRole(address: string): Promise<TransactionResponse>
grantBankingPartnerRole(address: string): Promise<TransactionResponse>
grantDistributorRole(address: string): Promise<TransactionResponse>
```

#### WAGAEthiopianComplianceCore Functions (NEW)
```typescript
interface ECTAPermit {
  permitNumber: string;
  issueDate: bigint;
  expiryDate: bigint;
  isValid: boolean;
  permitType: string;
}

interface QualityCertificate {
  certificateNumber: string;
  issueDate: bigint;
  moistureContent: number;
  screenSize: number;
  scaeCompliant: boolean;
  gradingNotes: string;
}

interface OriginVerification {
  region: string;
  cooperativeName: string;
  cooperativeLicense: string;
  farmGPS: string;
  verified: boolean;
  verificationDate: bigint;
}

// New compliance functions
addECTAPermit(batchId: bigint, permit: ECTAPermit): Promise<TransactionResponse>
addQualityCertificate(batchId: bigint, certificate: QualityCertificate): Promise<TransactionResponse>
addOriginVerification(batchId: bigint, origin: OriginVerification): Promise<TransactionResponse>
validateUpstreamCompliance(batchId: bigint): Promise<boolean>
getComplianceStatus(batchId: bigint): Promise<{
  hasECTA: boolean;
  hasQuality: boolean;
  hasOrigin: boolean;
  isFullyCompliant: boolean;
}>
```

#### WAGABankingCore Functions (NEW)
```typescript
interface BankingCapabilities {
  canActAsOfframp: boolean;
  supportsUSDC: boolean;
  supportsETB: boolean;
  partnerType: 0 | 1 | 2; // DIRECT_BANK, CORRESPONDENT_BANK, FINTECH_PARTNER
  dailyLimitUSD: bigint;
  swiftCode: string;
}

// Banking integration functions
registerBankingPartner(
  swiftCode: string,
  bankAddress: string,
  bankName: string,
  capabilities: BankingCapabilities
): Promise<TransactionResponse>

convertUSDToETB(usdAmount: bigint): Promise<bigint>
assignOfframpPartner(batchId: bigint): Promise<{
  offrampSwift: string;
  partnerType: 0 | 1 | 2;
}>

getBankingPartner(partner: string): Promise<{
  swiftCode: string;
  bankName: string;
  canOfframp: boolean;
}>
```

#### WAGAZKManager Functions (UPDATED)
```typescript
// Updated ZK functions with unified compliance
addComplianceZKProof(
  batchId: bigint,
  complianceType: string, // "ECTA_PERMIT", "QUALITY_CERT", etc.
  zkProofData: Uint8Array,
  publicClaim: string
): Promise<TransactionResponse>

validateCompliance(
  batchId: bigint,
  complianceFramework: string // "ETHIOPIAN", "EUDR", "GLOBAL"
): Promise<boolean>

hasComplianceProof(
  batchId: bigint,
  complianceType: string
): Promise<boolean>

getRequiredComplianceTypes(
  origin: string,
  isEUDestination: boolean
): Promise<string[]>
```

#### WAGACoffeeRedemption Functions (ENHANCED)
```typescript
// Enhanced redemption with Ethiopian banking
interface RedemptionDetails {
  id: bigint;
  redeemer: string;
  batchId: bigint;
  quantity: bigint;
  requestTimestamp: bigint;
  status: 0 | 1 | 2 | 3; // Requested, Processing, Fulfilled, Cancelled
  deliveryAddress: string;
  requiresEthiopianBanking: boolean;
  sellerId: bigint;
  bankingPartner: string;
  fiatTransferCompleted: boolean;
  fiatTransferAmount: bigint;
}

// New redemption functions
requestRedemption(
  batchId: bigint,
  quantity: bigint,
  deliveryAddress: string,
  requiresEthiopianBanking: boolean
): Promise<TransactionResponse>

confirmFiatTransfer(
  redemptionId: bigint,
  bankingPartner: string,
  transferAmount: bigint,
  transferReference: string
): Promise<TransactionResponse>

confirmSellerPayment(redemptionId: bigint): Promise<TransactionResponse>

getEnhancedRedemptionDetails(redemptionId: bigint): Promise<RedemptionDetails>
```

## Required Frontend Updates

### 1. Contract ABI Updates
All contract ABIs need to be regenerated from the deployed contracts:

```bash
# Generate ABIs for frontend
forge inspect WAGACoffeeTokenCore abi > frontend/abis/WAGACoffeeTokenCore.json
forge inspect WAGAConfigManager abi > frontend/abis/WAGAConfigManager.json
forge inspect WAGAEthiopianComplianceCore abi > frontend/abis/WAGAEthiopianComplianceCore.json
forge inspect WAGABankingCore abi > frontend/abis/WAGABankingCore.json
forge inspect WAGAZKManager abi > frontend/abis/WAGAZKManager.json
forge inspect WAGACoffeeRedemption abi > frontend/abis/WAGACoffeeRedemption.json
forge inspect WAGATreasury abi > frontend/abis/WAGATreasury.json
# ... for all contracts
```

### 2. New UI Components Required

#### Seller Registration Component
```typescript
// components/SellerRegistration.tsx
interface SellerRegistrationProps {
  onRegistrationComplete: (sellerId: bigint) => void;
}

export function SellerRegistration({ onRegistrationComplete }: SellerRegistrationProps) {
  // Form for seller registration with:
  // - Seller type selection (Cooperative/Processor/Roaster)
  // - Business name input
  // - Ethiopian business registration number
  // - Preferred banking partner SWIFT code
  // - Integration with WAGAConfigManager.registerSeller()
}
```

#### Ethiopian Compliance Dashboard
```typescript
// components/EthiopianCompliance.tsx
interface ComplianceProps {
  batchId: bigint;
}

export function EthiopianComplianceDashboard({ batchId }: ComplianceProps) {
  // Dashboard showing:
  // - ECTA permit status and upload
  // - Quality certificate validation
  // - Origin verification status
  // - Overall compliance percentage
  // - Integration with WAGAEthiopianComplianceCore
}
```

#### Banking Integration Component
```typescript
// components/BankingIntegration.tsx
interface BankingProps {
  redemptionId: bigint;
}

export function BankingIntegration({ redemptionId }: BankingProps) {
  // Component for:
  // - Banking partner selection
  // - USD to ETB conversion display
  // - Fiat transfer confirmation
  // - SWIFT code validation
  // - Integration with WAGABankingCore
}
```

#### ZK Compliance Manager
```typescript
// components/ZKComplianceManager.tsx
interface ZKComplianceProps {
  batchId: bigint;
  origin: string;
  isEUDestination: boolean;
}

export function ZKComplianceManager({ batchId, origin, isEUDestination }: ZKComplianceProps) {
  // Component for:
  // - Required compliance types display
  // - ZK proof upload interface
  // - Compliance validation status
  // - Framework-specific validation (Ethiopian/EUDR/Global)
  // - Integration with WAGAZKManager
}
```

### 3. State Management Updates

#### New Stores/Contexts
```typescript
// contexts/SellerContext.tsx
interface SellerContextType {
  currentSeller: SellerProfile | null;
  isRegistered: boolean;
  registerSeller: (data: SellerRegistrationData) => Promise<void>;
  refreshSellerData: () => Promise<void>;
}

// contexts/ComplianceContext.tsx
interface ComplianceContextType {
  complianceStatus: Map<bigint, ComplianceStatus>;
  addCompliance: (batchId: bigint, type: string, data: any) => Promise<void>;
  validateCompliance: (batchId: bigint, framework: string) => Promise<boolean>;
}

// contexts/BankingContext.tsx
interface BankingContextType {
  bankingPartners: BankingPartner[];
  exchangeRate: bigint;
  registerBankingPartner: (data: BankingPartnerData) => Promise<void>;
  assignOfframpPartner: (batchId: bigint) => Promise<string>;
}
```

### 4. API Integration Updates

#### New API Endpoints
```typescript
// api/ecx-prices.ts - Ethiopian Commodity Exchange integration
export async function getECXPrices(): Promise<ECXPriceData>

// api/swift-validation.ts - SWIFT code validation
export async function validateSWIFTCode(code: string): Promise<boolean>

// api/ethiopian-business.ts - Ethiopian business registration validation
export async function validateBusinessRegistration(regNumber: string): Promise<boolean>

// api/ipfs-metadata.ts - Enhanced metadata with compliance data
export async function uploadComplianceMetadata(data: ComplianceMetadata): Promise<string>
```

### 5. Enhanced Workflows

#### Complete Batch Creation Workflow
1. **Seller Verification**: Check if user is registered seller
2. **Role Validation**: Verify appropriate role (Cooperative/Processor)
3. **Batch Creation**: Create batch with enhanced metadata
4. **Compliance Setup**: Add required compliance documents
5. **ZK Proof Generation**: Generate privacy proofs
6. **Inventory Registration**: Register with Proof of Reserve
7. **Token Minting**: Mint tokens after full validation

#### Enhanced Redemption Workflow
1. **Redemption Request**: Standard redemption request
2. **Compliance Check**: Validate Ethiopian/EUDR compliance
3. **Banking Partner Assignment**: Automatic partner selection
4. **Payment Processing**: USDC payment via treasury
5. **Fiat Transfer**: ETB transfer to Ethiopian seller
6. **Seller Confirmation**: Seller confirms payment receipt
7. **Physical Fulfillment**: Coffee shipment tracking
8. **Token Burning**: Final token burn on delivery

### 6. Configuration Updates

#### Environment Variables
```typescript
// .env.local updates
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_CHAIN_ID=84532
NEXT_PUBLIC_BLOCK_EXPLORER=https://sepolia.basescan.org

// Contract addresses
NEXT_PUBLIC_COFFEE_TOKEN_CORE=0x5f4bE57dA14a03387Db976CB4c16F619f6958544
NEXT_PUBLIC_CONFIG_MANAGER=0xdf47b379c23647cAeD932D025104d40D8B2A7864
NEXT_PUBLIC_REDEMPTION=0x4dc1Ea2637a74919262e31396B18ce83d2f0bfB3
NEXT_PUBLIC_TREASURY=0xe400f90fc4E59B0DA49c8f818C371d9233e7D83f
NEXT_PUBLIC_ETHIOPIAN_COMPLIANCE=0x7F88fA7cFdAA15D9f4B735e89A2DA3026633c6a2
NEXT_PUBLIC_BANKING_CORE=0x1B1CFE2272E65caE26823Aa4BA53877A290EAB32
NEXT_PUBLIC_ZK_MANAGER=0x56d7F9947Cd6946153A24dE66d27Be9Eb071FD4e
```

## Implementation Priority

### Phase 1: Core Integration (Week 1)
1. Update contract addresses and ABIs
2. Update existing functions with new signatures
3. Implement seller registration component
4. Basic Ethiopian compliance integration

### Phase 2: Enhanced Features (Week 2)
1. Complete banking integration
2. ZK compliance manager
3. Enhanced redemption workflow
4. Ethiopian business validation

### Phase 3: UI/UX Polish (Week 3)
1. Dashboard updates
2. Workflow visualization
3. Error handling improvements
4. Performance optimization

## Testing Requirements

### Unit Tests
- Test all new function integrations
- Mock contract interactions
- Validate data transformations

### Integration Tests
- End-to-end workflow testing
- Ethiopian banking simulation
- ZK proof generation and validation

### User Acceptance Testing
- Seller registration flow
- Complete batch creation
- Redemption with Ethiopian banking
- Compliance validation

## Migration Strategy

### Backward Compatibility
- Maintain old function names with deprecation warnings
- Gradual migration of UI components
- Feature flag system for new functionality

### Data Migration
- No existing data to migrate (new deployment)
- Fresh start with Base Sepolia testnet
- Clean slate for user registration

## Conclusion

The frontend requires significant updates to align with the new contract architecture. The central authority pattern simplifies some interactions but requires updates to all role-related functionality. The new Ethiopian compliance and banking features require entirely new UI components and workflows.

The integration should be done in phases to ensure stability and allow for thorough testing of each component before moving to the next phase.