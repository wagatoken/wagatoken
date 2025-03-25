# 📜 **WAGACoffeeToken.sol: Function Analysis & Interactions**  

This document outlines:  
1️⃣ **All externally visible functions in `WAGACoffeeToken.sol`**  
2️⃣ **How other contracts in the WAGA MVP suite interact with these functions**  

---

## **1️⃣ Externally Visible Functions in WAGACoffeeToken.sol**
Below is a list of all public/external functions, along with their purpose and how they interact with the ecosystem.

| **Function** | **Visibility** | **Purpose** |
|-------------|--------------|-------------|
| `createBatch(uint256 batchId, string memory ipfsUri, uint256 productionDate, uint256 expiryDate)` | `external` | Registers a new coffee batch and stores its metadata URI. |
| `mintBatch(address to, uint256 batchId, uint256 amount)` | `external` | Mints ERC-1155 tokens for a coffee batch after inventory verification. |
| `burn(address account, uint256 batchId, uint256 amount)` | `external` | Burns coffee tokens upon redemption or expiration. |
| `isBatchCreated(uint256 batchId) external view returns (bool)` | `external view` | Checks if a batch exists. |
| `uri(uint256 tokenId) external view override returns (string memory)` | `external view` | Retrieves metadata URI from IPFS for a specific batch. |
| `updateBatchStatus(uint256 batchId, bool status)` | `external` | Marks a batch as verified or expired. |
| `updateInventory(uint256 batchId, uint256 actualQuantity)` | `external` | Updates batch inventory count. |
| `markBatchExpired(uint256 batchId)` | `external` | Marks a batch as expired. |

---

## **2️⃣ Contracts That Call Functions in `WAGACoffeeToken.sol`**
Here, we analyze **which contracts call each function**, along with their role in the system.

### **🔹 `createBatch()`**
- **Who Calls It?**
  - ✅ `UI / Frontend` (Admin role)
- **Why?**
  - Used to **register a new coffee batch** before any tokens can be minted.
- **How?**
  - Admins submit batch details & metadata to the UI, which triggers this function.
  - Stores the **IPFS metadata URI** in the contract.

---

### **🔹 `mintBatch()`**
- **Who Calls It?**
  - ✅ `WAGAProofOfReserve.sol`
  - ✅ `WAGAInventoryManager.sol`
- **Why?**
  - Ensures that **tokens are only minted after proof of coffee stock**.
- **How?**
  - `WAGAProofOfReserve.sol` verifies the inventory.
  - If verification is successful, it **triggers `mintBatch()`** to issue tokens.

---

### **🔹 `burn()`**
- **Who Calls It?**
  - ✅ `WAGACoffeeRedemption.sol`
  - ✅ `WAGAInventoryManager.sol`
- **Why?**
  - Ensures that **redeemed tokens or expired batches are removed from circulation**.
- **How?**
  - A user requests redemption via `WAGACoffeeRedemption.sol`, which triggers `burn()`.
  - `WAGAInventoryManager.sol` burns tokens when batches expire.

---

### **🔹 `isBatchCreated()`**
- **Who Calls It?**
  - ✅ `WAGAProofOfReserve.sol`
  - ✅ `WAGAInventoryManager.sol`
  - ✅ `WAGACoffeeRedemption.sol`
- **Why?**
  - Before verifying inventory or redemption, it must **check if the batch exists**.
- **How?**
  - `WAGAProofOfReserve.sol` queries this function before initiating `requestReserveVerification()`.
  - `WAGAInventoryManager.sol` checks batch existence before processing stock updates.
  - `WAGACoffeeRedemption.sol` ensures that only existing batches can be redeemed.

---

### **🔹 `updateBatchStatus()`**
- **Who Calls It?**
  - ✅ `WAGAInventoryManager.sol`
- **Why?**
  - Used to **mark batches as verified or expired**.
- **How?**
  - After a batch passes quality checks, it is **marked as verified**.
  - If a batch expires, it is **marked as expired**.

---

### **🔹 `updateInventory()`**
- **Who Calls It?**
  - ✅ `WAGAInventoryManager.sol`
- **Why?**
  - Ensures that **inventory records match real-world stock**.
- **How?**
  - `WAGAInventoryManager.sol` updates inventory after **physical stock checks**.

---

### **🔹 `markBatchExpired()`**
- **Who Calls It?**
  - ✅ `WAGAInventoryManager.sol`
- **Why?**
  - Prevents expired batches from being used.
- **How?**
  - Runs in **automated batch expiry checks**.

---

## **3️⃣ Additional Findings**
### **Expired Batch Handling**
- **Who Checks for Expired Batches?**
  - ✅ `WAGAInventoryManager.sol`
- **How?**
  - Calls `isBatchCreated(batchId)` to confirm the batch exists.
  - Reads `batchInfo[batchId].expiryDate` to determine whether a batch has expired.
  - Calls `markBatchExpired()` to **invalidate expired batches**.

---

### **Inventory Updates**
- **Who Calls It?**
  - ✅ `WAGAInventoryManager.sol`
  - ✅ `WAGAProofOfReserve.sol`
- **How?**
  - `WAGAProofOfReserve.sol` calls `mintBatch()` **only after verifying inventory**.
  - `WAGAInventoryManager.sol` calls `burn()` **to remove expired or depleted batch tokens**.
  - `WAGAInventoryManager.sol` calls `updateInventory()` to **synchronize supply data**.

---

## **4️⃣ Summary of Interactions**
| **Caller Contract** | **Calls Function** | **Purpose** |
|---------------------|------------------|-------------|
| `WAGAProofOfReserve.sol` | `mintBatch()` | Mints tokens only after inventory verification. |
| `WAGAProofOfReserve.sol` | `isBatchCreated()` | Checks if a batch exists before verification. |
| `WAGAInventoryManager.sol` | `isBatchCreated()` | Confirms batch existence before checking inventory and expiry. |
| `WAGAInventoryManager.sol` | `burn()` | Burns expired or depleted batch tokens. |
| `WAGAInventoryManager.sol` | `mintBatch()` | Mints new tokens if inventory levels allow. |
| `WAGAInventoryManager.sol` | `updateBatchStatus()` | Marks a batch as verified or expired. |
| `WAGAInventoryManager.sol` | `updateInventory()` | Updates real-world inventory levels. |
| `WAGAInventoryManager.sol` | `markBatchExpired()` | Flags expired batches to prevent use. |
| `WAGACoffeeRedemption.sol` | `burn()` | Burns redeemed tokens after fulfillment. |
| `WAGACoffeeRedemption.sol` | `isBatchCreated()` | Ensures batch validity before redemption. |
| `UI / Frontend` | `createBatch()` | Admins register new coffee batches. |
| `UI / Frontend` | `uri()` | Fetches batch metadata for traceability. |

---

## **🔍 Conclusion**
- `WAGACoffeeToken.sol` is **the central contract for batch tokenization**.
- It **interacts with multiple contracts** to enforce the **business logic**:
  - **`WAGAProofOfReserve.sol`** ensures that tokens are **only minted when inventory exists**.
  - **`WAGACoffeeRedemption.sol`** ensures that tokens are **burned when redeemed**.
  - **`WAGAInventoryManager.sol`** manages **batch expiry, stock levels, and audits**.
- **The frontend interacts with `WAGACoffeeToken.sol`** for **batch creation, metadata retrieval, and UI-based verification**.

🚀 **This breakdown provides clarity on how `WAGACoffeeToken.sol` interacts with all other contracts, ensuring traceability, inventory accuracy, and seamless redemption.**
