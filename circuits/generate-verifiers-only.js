#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Circuit definitions
const circuits = [
  {
    name: 'PricePrivacyCircuit',
    file: 'PricePrivacyCircuit.circom',
    description: 'Price competitiveness proof without revealing exact pricing'
  },
  {
    name: 'QualityTierCircuit',
    file: 'QualityTierCircuit.circom',
    description: 'Quality tier verification without revealing exact scores'
  },
  {
    name: 'SupplyChainPrivacyCircuit',
    file: 'SupplyChainPrivacyCircuit.circom',
    description: 'Supply chain compliance proof without revealing sourcing details'
  }
];

console.log('🔐 Generating Solidity Verifier Contracts...\n');

for (const circuit of circuits) {
  console.log(`🔑 Generating verifier for ${circuit.name}...`);
  console.log(`   ${circuit.description}`);

  try {
    const circuitBuildDir = path.join(__dirname, 'build', circuit.name);

    // Check if circuit is already built
    if (!fs.existsSync(path.join(circuitBuildDir, `${circuit.name}.r1cs`))) {
      console.log(`   ❌ ${circuit.name}.r1cs not found. Please run build-circuits.js first`);
      continue;
    }

    // Generate verification key (trusted setup)
    console.log('   🔐 Generating zkey...');
    execSync(`npx snarkjs groth16 setup ${circuit.name}.r1cs ../../pot12_final.ptau ${circuit.name}_vk.json`, {
      stdio: 'inherit',
      cwd: circuitBuildDir
    });

    // Export verification key
    console.log('   📋 Exporting verification key...');
    execSync(`npx snarkjs zkey export verificationkey ${circuit.name}_vk.json ${circuit.name}_verification_key.json`, {
      stdio: 'inherit',
      cwd: circuitBuildDir
    });

    // Generate Solidity verifier contract
    console.log('   💻 Generating Solidity verifier...');
    execSync(`npx snarkjs zkey export solidityverifier ${circuit.name}_vk.json ${circuit.name}Verifier.sol`, {
      stdio: 'inherit',
      cwd: circuitBuildDir
    });

    console.log(`   ✅ ${circuit.name} verifier generated successfully\n`);

  } catch (error) {
    console.error(`   ❌ Failed to generate verifier for ${circuit.name}:`, error.message);
    console.log('');
  }
}

console.log('🚀 Next steps:');
console.log('1. Test circuits with sample inputs');
console.log('2. Generate proofs using the compiled circuits');
console.log('3. Verify proofs on-chain using the generated Solidity verifiers');
