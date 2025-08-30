#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Building WAGA ZK Circuits...\n');

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
    
    // Compile with circom2
    const command = `circom2 ${circuit.file} --r1cs --wasm --sym --c`;
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
console.log('\nNext steps:');
console.log('1. Test the circuits with sample inputs');
console.log('2. Generate proofs using the compiled circuits');
console.log('3. Verify proofs on-chain using the verification keys');
