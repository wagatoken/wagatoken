#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check if powers of tau exists, generate if not
function ensurePowersOfTau() {
  const potFile = 'pot12_final.ptau';
  if (!fs.existsSync(potFile)) {
    console.log('🔑 Generating Powers of Tau ceremony...');
    try {
      // Generate initial powers of tau
      execSync(`npx snarkjs powersoftau new bn128 12 pot12_0000.ptau -v`, { stdio: 'inherit' });

      // Contribute to ceremony (in production, this would be multiple contributions)
      execSync(`npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v`, { stdio: 'inherit' });

      // Prepare phase 2
      execSync(`npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v`, { stdio: 'inherit' });

      console.log('✅ Powers of Tau ceremony completed');
    } catch (error) {
      console.error('❌ Failed to generate Powers of Tau:', error.message);
      process.exit(1);
    }
  } else {
    console.log('✅ Powers of Tau already exists');
  }
}

console.log('🔧 Building WAGA ZK Circuits...\n');

// Ensure Powers of Tau exists
ensurePowersOfTau();

// Create build directories
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

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

// Build each circuit
for (const circuit of circuits) {
  console.log(`📦 Building ${circuit.name}...`);
  console.log(`   ${circuit.description}`);
  
  try {
    // Create circuit-specific build directory
    const circuitBuildDir = path.join(buildDir, circuit.name);
    if (!fs.existsSync(circuitBuildDir)) {
      fs.mkdirSync(circuitBuildDir, { recursive: true });
    }
    
    // Compile with circom
    const command = `npx circom2 ${circuit.file} --r1cs --wasm --sym --c`;
    console.log(`   Running: ${command}`);
    
    execSync(command, { 
      stdio: 'inherit',
      cwd: __dirname 
    });
    
    // Move generated files to build directory
    const files = ['r1cs', 'sym', 'cpp', 'js'];
    files.forEach(ext => {
      const sourceFile = `${circuit.name}.${ext}`;
      const sourceDir = `${circuit.name}_${ext}`;
      
      if (fs.existsSync(sourceFile)) {
        fs.renameSync(sourceFile, path.join(circuitBuildDir, `${circuit.name}.${ext}`));
      }
      if (fs.existsSync(sourceDir)) {
        fs.renameSync(sourceDir, path.join(circuitBuildDir, `${circuit.name}_${ext}`));
      }
    });
    
    console.log(`   ✅ ${circuit.name} built successfully\n`);
    
  } catch (error) {
    console.error(`   ❌ Failed to build ${circuit.name}:`, error.message);
    process.exit(1);
  }
}

console.log('🎉 ZK Circuit build complete!');
console.log(`📁 Build artifacts: ${buildDir}`);

// Generate Solidity verifiers
console.log('\n🔐 Generating Solidity Verifier Contracts...');

for (const circuit of circuits) {
  console.log(`\n🔑 Generating verifier for ${circuit.name}...`);

  try {
    const circuitBuildDir = path.join(buildDir, circuit.name);

    // Generate verification key (trusted setup)
    execSync(`npx snarkjs groth16 setup ${circuit.name}.r1cs ../pot12_final.ptau ${circuit.name}_vk.json`, {
      stdio: 'inherit',
      cwd: circuitBuildDir
    });

    // Export verification key
    execSync(`npx snarkjs zkey export verificationkey ${circuit.name}_vk.json ${circuit.name}_verification_key.json`, {
      stdio: 'inherit',
      cwd: circuitBuildDir
    });

    // Generate Solidity verifier contract
    execSync(`npx snarkjs zkey export solidityverifier ${circuit.name}_vk.json ${circuit.name}Verifier.sol`, {
      stdio: 'inherit',
      cwd: circuitBuildDir
    });

    console.log(`   ✅ ${circuit.name} verifier generated successfully`);

  } catch (error) {
    console.error(`   ❌ Failed to generate verifier for ${circuit.name}:`, error.message);
  }
}

console.log('\n🚀 Next steps:');
console.log('1. Generate trusted setup (ceremony or use powers of tau)');
console.log('2. Test circuits with sample inputs');
console.log('3. Generate proofs using the compiled circuits');
console.log('4. Verify proofs on-chain using the generated Solidity verifiers');
