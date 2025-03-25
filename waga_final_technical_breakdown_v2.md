# 📜 **Technical Breakdown: Smart Contract Interactions**

## **1️⃣ Overview**
The **WAGA MVP Phase 1** smart contracts enable **tokenized coffee tracking**, **proof of reserve verification**, **inventory management**, and **redemption mechanisms**. These contracts interact with each other and external services such as **Chainlink Functions** and **IPFS metadata storage**.

## **2️⃣ Smart Contract Architecture**
### **Contracts Involved**
| Contract Name | Description |
|--------------|-------------|
| `WAGACoffeeToken.sol` | ERC-1155 contract that handles coffee batch tokenization. |
| `WAGAProofOfReserve.sol` | Chainlink-integrated contract that verifies inventory before minting. |
| `WAGAInventoryManager.sol` | Automates stock validation, alerts on low inventory. |
| `WAGACoffeeRedemption.sol` | Handles redemption of coffee tokens for physical delivery. |

---

## **3️⃣ Contract Interactions**
### **Batch Creation & Tokenization**
1. `WAGACoffeeToken.createBatch()`:
   - Accepts batch details and an **IPFS URI**.
   - Stores batch metadata and assigns a **unique token ID**.

2. `WAGAProofOfReserve.requestReserveVerification()`:
   - Uses **Chainlink Functions** to verify stock levels.
   - Triggers `WAGACoffeeToken.mintBatch()` upon successful verification.

3. `WAGACoffeeToken.mintBatch()`:
   - Only called by the **Proof of Reserve contract** after verification.
   - Mints **ERC-1155 tokens** for a batch.

---

### **Inventory Management**
1. `WAGAInventoryManager.checkInventory()`:
   - Periodically verifies stock levels using **Chainlink Automation**.
   - Fetches inventory data from `WAGACoffeeToken`.

2. `WAGAInventoryManager.emitLowInventoryAlert()`:
   - **Emits an event** if stock levels are below a set threshold.
   - Can trigger **automated restocking mechanisms**.

---

### **Redemption & Logistics**
1. `WAGACoffeeRedemption.requestRedemption()`:
   - Consumers **send tokenized coffee** to the redemption contract.
   - The contract **locks** tokens until fulfillment.

2. `WAGACoffeeRedemption.fulfillRedemption()`:
   - Called by an **authorized role**.
   - **Burns** redeemed tokens.
   - Initiates **logistics API** for delivery.

---

### **Automated Upkeep & Inventory Checks**
1. `WAGAProofOfReserve.performUpkeep()`:
   - Uses **Chainlink Automation** to refresh reserve data.
   - Calls `WAGAProofOfReserve.verifyInventory()` to prevent outdated data.

2. `WAGAInventoryManager.performInventoryCheck()`:
   - Uses **Chainlink Functions** to fetch **off-chain stock data**.
   - Ensures **accurate and up-to-date inventory tracking**.

---

## **4️⃣ External Integrations**
- **IPFS**: Stores **batch metadata** (farmer info, origin, roast details).
- **Chainlink Functions**: Fetches inventory levels before token minting.
- **Chainlink Automation**: Schedules reserve & stock updates automatically.
- **WalletConnect**: Allows consumers to connect wallets for **purchasing & redemption**.

---

## **5️⃣ Summary**
This system ensures **transparent traceability**, **tamper-proof verification**, and **seamless redemption** of tokenized coffee through **on-chain & off-chain interactions**. With **automated inventory management**, the platform enhances **stock efficiency** and **supply chain reliability**.

---

---

## **6️⃣ Expired Batch Handling & Inventory Updates**

### **🔹 Checking for Expired Batches**
| **Caller Contract** | **Calls Function** | **Purpose** |
|---------------------|------------------|-------------|
| `WAGAInventoryManager.sol` | `isBatchCreated(batchId)` | Ensures the batch exists before checking expiry. |
| `WAGAInventoryManager.sol` | `batchInfo[batchId].expiryDate` | Reads batch expiry date to determine validity. |

#### **How It Works**
1. `WAGAInventoryManager.sol` **periodically checks for expired batches**.
2. If expired, it **emits an alert** or **triggers token burning**.
3. Can be **extended** to automatically remove expired batches.

---

### **🔹 Inventory Updates**
| **Caller Contract** | **Calls Function** | **Purpose** |
|---------------------|------------------|-------------|
| `WAGAProofOfReserve.sol` | `mintBatch()` | Mints tokens after inventory verification. |
| `WAGAInventoryManager.sol` | `burn()` | Burns tokens when stock is depleted or redeemed. |

#### **How It Works**
1. **`WAGAProofOfReserve.sol`**:
   - Calls `mintBatch()` **only after confirming inventory exists**.
2. **`WAGAInventoryManager.sol`**:
   - Calls `burn()` **to remove tokens from circulation** when:
     - A batch **expires**.
     - A batch **is fully redeemed**.

#### **Next Steps**
- ✅ **Confirm if expired batches are auto-removed** or need **manual intervention**.
- ✅ **Ensure inventory updates happen dynamically** and reflect **real-world stock**.
- ✅ **Check if batches post-expiry still exist**—should they be **force-burned**?

---

---

## **7️⃣ Inventory & Batch Expiry Management (Updated Findings)**

### **🔹 Expired Batch Handling**
| **Caller Contract** | **Calls Function** | **Purpose** |
|---------------------|------------------|-------------|
| `WAGAInventoryManager.sol` | `isBatchCreated(batchId)` | Ensures the batch exists before checking expiry. |
| `WAGAInventoryManager.sol` | `batchInfo[batchId].expiryDate` | Reads batch expiry date to determine validity. |
| `WAGAInventoryManager.sol` | `markBatchExpired(batchId)` | Marks a batch as expired to prevent further use. |
| `WAGAInventoryManager.sol` | `burn(batchId, amount)` | Removes expired batch tokens from circulation. |

#### **How It Works**
1. `WAGAInventoryManager.sol` **periodically checks for expired batches**.
2. If expired, it **marks the batch as expired** using `markBatchExpired()`.
3. The contract **calls `burn()`** to remove expired tokens.
4. The system can **emit an alert** to notify stakeholders of the expiry.

---

### **🔹 Inventory Updates & Real-Time Tracking**
| **Caller Contract** | **Calls Function** | **Purpose** |
|---------------------|------------------|-------------|
| `WAGAInventoryManager.sol` | `updateInventory(batchId, actualQuantity)` | Synchronizes inventory levels with real-world stock. |
| `WAGAInventoryManager.sol` | `mintBatch(address to, batchId, amount)` | Mints new batch tokens when inventory is confirmed. |
| `WAGAProofOfReserve.sol` | `mintBatch()` | Mints tokens after verification of coffee reserves. |
| `WAGAInventoryManager.sol` | `performLowInventoryCheck()` | Detects when stock is running low and triggers alerts. |

#### **How It Works**
1. **Real-time inventory updates**:
   - `WAGAInventoryManager.sol` monitors batch inventory and updates via `updateInventory()`.
   - Prevents discrepancies between **physical coffee stock** and **tokenized supply**.
2. **Low Inventory Alerts**:
   - `performLowInventoryCheck()` emits alerts when stock levels drop below a set threshold.
3. **Minting After Verification**:
   - `WAGAProofOfReserve.sol` calls `mintBatch()` **only after confirming that inventory exists**.

---

### **8️⃣ Summary of New Findings**
✅ **Expired batches are now explicitly marked as invalid and burned.**  
✅ **Inventory updates happen in real-time to reflect real-world supply.**  
✅ **Low inventory alerts ensure coffee batches are replenished proactively.**  

🚀 **These enhancements further strengthen the WAGA MVP by ensuring accurate inventory tracking, automated batch expiry, and seamless token minting.**

---
