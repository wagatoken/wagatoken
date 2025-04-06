# 🛠️ **Testing Guide: WAGA Coffee MVP Phase 1**

## **1️⃣ Prerequisites**
Ensure you have:
- **Node.js & npm/yarn**
- **Hardhat or Foundry**
- **Metamask (for local wallet testing)**
- **Alchemy/Infura API key (for IPFS & RPC access)**

---

## **2️⃣ Setup Project**
```bash
git clone <WAGA_MVP_V2-repo-url>
cd WAGA_MVP_V2
npm install  # or yarn install
```

---

## **3️⃣ Deploy Smart Contracts**
### **Compile contracts**
```bash
npx hardhat compile
```

### **Deploy locally**
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### **Deploy to testnet**
```bash
npx hardhat run scripts/deploy.js --network goerli  # Or any other testnet
```

---

## **4️⃣ Test Tokenization & Redemption**
### **1️⃣ Create a Batch**
```javascript
const tx = await WAGACoffeeToken.createBatch(
  1, // batchId
  "ipfs://QmXYZ...", // Metadata URI
  1710000000, // Production date
  1730000000  // Expiry date
);
await tx.wait();
```

### **2️⃣ Request Proof of Reserve Verification**
```javascript
const tx = await WAGAProofOfReserve.requestReserveVerification(
  1, // batchId
  100, // Amount
  "0xUserAddress" // Recipient
);
await tx.wait();
```

### **3️⃣ Mint Verified Batch Tokens**
```javascript
const tx = await WAGACoffeeToken.mintBatch(
  "0xUserAddress",
  1, // batchId
  100 // Amount
);
await tx.wait();
```

### **4️⃣ Redeem Coffee Tokens**
```javascript
const tx = await WAGACoffeeRedemption.requestRedemption(
  1, // batchId
  2, // Amount
  "Consumer's address"
);
await tx.wait();
```

---

## **5️⃣ View Transactions & Logs**
```bash
npx hardhat console --network localhost
> await ethers.provider.getLogs({ fromBlock: 0 });
```

---

## **6️⃣ Summary**
This guide helps you **deploy, test, and interact** with WAGA's **batch tokenization, verification, and redemption workflows**.

---
