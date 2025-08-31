#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Generating Solidity Verifier Contracts for WAGA ZK System...\n');

// Check if build directory exists
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Build directory not found. Run build-circuits.js first.');
  process.exit(1);
}

// Check if powers of tau exists
const potFile = path.join(__dirname, 'pot12_final.ptau');
if (!fs.existsSync(potFile)) {
  console.log('❌ Powers of Tau not found. Run build-circuits.js first.');
  process.exit(1);
}

const circuits = [
  'PricePrivacyCircuit',
  'QualityTierCircuit',
  'SupplyChainPrivacyCircuit'
];

// Generate verifiers for each circuit
for (const circuitName of circuits) {
  console.log(`🔑 Generating verifier for ${circuitName}...`);

  const circuitDir = path.join(buildDir, circuitName);
  const r1csPath = path.join(circuitDir, `${circuitName}.r1cs`);

  if (!fs.existsSync(r1csPath)) {
    console.log(`   ❌ R1CS file not found for ${circuitName}`);
    continue;
  }

  try {
    // Step 1: Generate zkey (trusted setup)
    console.log('   🔐 Step 1: Generating zkey...');
    const zkeyCommand = `npx snarkjs groth16 setup ${r1csPath} ${potFile} ${circuitName}_vk.json`;
    execSync(zkeyCommand, { stdio: 'inherit', cwd: __dirname });

    // Step 2: Export verification key
    console.log('   📋 Step 2: Exporting verification key...');
    const vkCommand = `npx snarkjs zkey export verificationkey ${circuitName}_vk.json ${circuitName}_verification_key.json`;
    execSync(vkCommand, { stdio: 'inherit', cwd: __dirname });

    // Step 3: Generate Solidity verifier contract
    console.log('   💻 Step 3: Generating Solidity verifier...');
    const solidityCommand = `npx snarkjs zkey export solidityverifier ${circuitName}_vk.json ${circuitName}Verifier.sol`;
    execSync(solidityCommand, { stdio: 'inherit', cwd: __dirname });

    // Step 4: Move generated files to circuit directory
    console.log('   📁 Step 4: Organizing files...');
    const generatedFiles = [
      `${circuitName}_vk.json`,
      `${circuitName}_verification_key.json`,
      `${circuitName}Verifier.sol`
    ];

    for (const file of generatedFiles) {
      if (fs.existsSync(file)) {
        const srcPath = path.join(__dirname, file);
        const destPath = path.join(circuitDir, file);
        fs.renameSync(srcPath, destPath);
        console.log(`      Moved ${file} to circuit directory`);
      }
    }

    // Step 5: Clean up intermediate files
    console.log('   🧹 Step 5: Cleaning up...');
    const cleanupFiles = [`${circuitName}_vk.json`];
    for (const file of cleanupFiles) {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    console.log(`   ✅ ${circuitName} verifier generated successfully!\n`);

  } catch (error) {
    console.error(`   ❌ Failed to generate verifier for ${circuitName}:`, error.message);
    console.log('');
  }
}

console.log('🎉 Solidity Verifier Generation Complete!');
console.log('\n📂 Generated files:');
console.log('   - {CircuitName}Verifier.sol - Solidity verifier contract');
console.log('   - {CircuitName}_verification_key.json - Verification key');
console.log('   - {CircuitName}_vk.json - Proving key');

console.log('\n🚀 Integration Steps:');
console.log('1. Deploy generated Solidity verifier contracts to blockchain');
console.log('2. Update CircomVerifier.sol to use real cryptographic verification');
console.log('3. Test full proof generation and on-chain verification');
console.log('4. Integrate with WAGA batch creation and verification flows');

console.log('\n💡 Usage Example:');
// Example of how to use the generated verifier
console.log(`
   // In your Solidity contract:
   import "./PricePrivacyCircuitVerifier.sol";

   contract MyContract {
       PricePrivacyCircuitVerifier public verifier;

       function verifyProof(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[3] memory input)
           public view returns (bool) {
           return verifier.verifyProof(a, b, c, input);
       }
   }
`);