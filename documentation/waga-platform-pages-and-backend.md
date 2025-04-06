
# ☕ WAGA Coffee Platform – Pages and Backend Integration Details

Here’s an enhanced list of all platform pages along with their respective backend integration components.

---

## 📊 Main Dashboard & Home Pages

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Home** | `/` or `/home` | ✅ Done | • REST API for analytics data<br>• Supabase for user authentication<br>• WebSocket for real-time updates |
| **Dashboard** | `/dashboard` | ✅ Done | • GraphQL API for batch statistics<br>• Blockchain API for token metrics<br>• Supabase for user data |
| **Unified Dashboard** | `/unified-dashboard` | ✅ Done | • REST API for combined metrics<br>• Smart Contract interactions<br>• Firebase for notifications |

---

## 📦 Batch Management

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Batches Overview** | `/batches` | ✅ Done | • REST API for batch listing<br>• Pagination API<br>• Search/filter API |
| **Batch Details** | `/batches/[id]` | ✅ Done | • REST API for batch details<br>• Blockchain verification<br>• IPFS for metadata |
| **Create Batch** | `/batches/create` | ✅ Done | • Form submission API<br>• File upload to cloud<br>• Validation API |
| **Create New Batch** | `/create-new-batch` | ✅ Done | • Multi-step form<br>• REST API<br>• Blockchain transaction |
| **Batch Metadata** | `/batch-metadata` | ✅ Done | • IPFS integration<br>• JSON schema validation<br>• Metadata standardization |
| **Request New Batch** | `/request-new-batch` | ✅ Done | • REST API<br>• Notification service<br>• Approval workflow API |

---

## ✅ Verification & Minting

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Verification** | `/verification` | ✅ Done | • Blockchain API<br>• Digital signature validation<br>• Verification history API |
| **Mint Batch** | `/mint-batch` | ✅ Done | • Smart Contract interaction<br>• Gas estimation API<br>• Transaction monitoring |
| **QR Generator** | `/qr-generator` | ✅ Done | • QR code API<br>• Cryptographic signing<br>• Cloud storage for image |

---

## 📦 Inventory Management

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Inventory** | `/inventory` | ✅ Done | • Inventory data API<br>• WebSocket updates<br>• Filter/search API |
| **Alerts** | `/alerts` | ✅ Done | • Notification API<br>• WebSocket for alerts<br>• Alert config API |
| **Events** | `/events` | ✅ Done | • Event logging API<br>• Blockchain listeners<br>• Pagination API |

---

## 🎟️ Redemption System

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Redemption Overview** | `/redemption` | ✅ Done | • Redemption listings API<br>• Status tracking<br>• Pagination API |
| **New Redemption Request** | `/redemption/new` | ✅ Done | • REST API submission<br>• Token validation<br>• Smart contract |
| **Redemption Details** | `/redemption/[id]` | ✅ Done | • Redemption detail API<br>• Status update<br>• Document verification |

---

## 🛒 Marketplace

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Marketplace** | `/marketplace` | ✅ Done | • Listings API<br>• Search/filter API<br>• Pricing service |
| **Marketplace Item** | `/marketplace/[id]` | ✅ Done | • Item detail API<br>• Smart contract purchase<br>• Review/rating API |

---

## 👤 User Management

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Users** | `/users` | ✅ Done | • User management API<br>• Role-based access<br>• Activity logging |
| **Settings** | `/settings` | ✅ Done | • Preferences API<br>• Notification settings<br>• Profile update |
| **Blockchain Settings** | `/settings/blockchain` | ✅ Done | • Wallet connection API<br>• Network config<br>• Key management |

---

## 🚚 Distributor Portal

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Distributor Dashboard** | `/distributor/dashboard` | ✅ Done | • Distributor metrics API<br>• Order management<br>• Analytics |
| **Distributor Inventory** | `/distributor/inventory` | ✅ Done | • Inventory management<br>• Stock level monitoring<br>• Order fulfillment |
| **Distributor Registration** | `/distributor/register` | ✅ Done | • Registration form API<br>• KYC service<br>• Approval workflow |
| **Distributor Requests** | `/distributor/requests` | ✅ Done | • Request management API<br>• Status tracking<br>• Notifications |
| **Distributor Request Details** | `/distributor/requests/[id]` | ✅ Done | • Request details API<br>• Document management<br>• Communication service |
| **Process Request** | `/distributor/requests/[id]/process` | ✅ Done | • Processing API<br>• Workflow management<br>• Status update |
| **Complete Request** | `/distributor/requests/[id]/complete` | ✅ Done | • Completion API<br>• Blockchain transaction<br>• Notification service |

---

## 🔎 Traceability System

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **Process Flow** | `/traceability/process-flow` | ✅ Done | • Flow API<br>• Status tracking<br>• Visualization API |
| **Batch List** | `/traceability/batch` | ✅ Done | • Listing API<br>• Search/filter<br>• Pagination |
| **Batch Details** | `/traceability/batch/[id]` | ✅ Done | • Details API<br>• Blockchain verification<br>• Document retrieval |
| **Create Batch** | `/traceability/batch/create` | ✅ Done | • Batch creation API<br>• Validation<br>• Blockchain transaction |
| **Verification** | `/traceability/verification` | ✅ Done | • Verification API<br>• Signature validation<br>• Blockchain query |

---

## 🧪 Proof of Concept Pages

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **PoC Dashboard** | `/proof-of-concept` | ✅ Done | • Demo API<br>• Simulation<br>• Test blockchain |
| **Inventory Mgmt** | `/proof-of-concept/inventory-management` | ✅ Done | • Test inventory API<br>• Mock data<br>• Simulation controls |
| **Batch Details** | `/proof-of-concept/inventory-management/batch/[id]` | ✅ Done | • Batch details API<br>• Mock blockchain data<br>• Parameters API |
| **New Batch** | `/proof-of-concept/inventory-management/batch/new` | ✅ Done | • Creation API<br>• Mock transaction<br>• Validation sim |
| **Verification Engine** | `/proof-of-concept/verification-engine` | ✅ Done | • Verification API<br>• Signature validation<br>• Simulation controls |
| **Event Listener** | `/proof-of-concept/event-listener` | ✅ Done | • Event stream API<br>• WebSocket<br>• Simulation controls |
| **Off-Chain Dashboard** | `/proof-of-concept/off-chain-dashboard` | ✅ Done | • Off-chain data API<br>• Simulation<br>• DB integration |
| **Off-Chain System** | `/proof-of-concept/off-chain-system` | ✅ Done | • System API<br>• Test data generation<br>• Simulation controls |

---

## 📚 Informational Pages

| Page | URL | Backend Integration Status | Integration Components |
|------|-----|-----------------------------|------------------------|
| **About / Goals / Roadmap** | `/about/*` | ❌ No Backend Required | Static content only |
| **Features** | `/features/*` | ❌ No Backend Required | Static content only |
| **Technical Pages** | `/technical/*` | ❌ No Backend Required | Static content only |
| **Roadmap Timeline** | `/roadmap/timeline` | ❌ No Backend Required | Static content only |
| **Impact Pages** | `/impact/*` | ❌ No Backend Required | Static content only |
| **Token Sale** | `/token-sale` | 🚧 To Be Implemented | • Payment gateway<br>• KYC verification<br>• Token distribution |

---

## 🛠 Backend Technology Stack Summary

1. **API Services**
   - REST APIs
   - GraphQL
   - WebSockets

2. **Database & Storage**
   - Supabase (auth + DB)
   - Firebase (real-time)
   - IPFS (decentralized storage)
   - Cloud storage

3. **Blockchain Integration**
   - Smart contracts
   - Event listeners
   - Signature validation
   - Multi-network support

4. **Auth & Security**
   - Role-based access
   - KYC services
   - Key management
   - Signature checks

5. **Notifications**
   - Real-time alerts
   - WebSockets
   - Email/SMS
