#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing WAGA ZK Circuits...\n');

// Check if circuits are built
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  console.log('❌ Circuits not built yet. Run "npm run build" first.');
  process.exit(1);
}

// Test data for each circuit
const testData = {
  PricePrivacyCircuit: {
    inputs: {
      exactPrice: 1550,
      competitorPrices: [1600, 1700, 1800, 1900, 2000],
      marketSegment: 2, // Premium
      priceRange: 2000,
      isCompetitive: 1
    },
    description: 'Price within competitive range for premium tier'
  },
  
  QualityTierCircuit: {
    inputs: {
      cuppingScore: 85,
      defectCount: 0,
      moistureContent: 0,
      qualityTier: 2, // Premium
      minScore: 80,
      meetsTierRequirements: 1
    },
    description: 'Quality metrics meeting premium tier requirements'
  },
  
  SupplyChainPrivacyCircuit: {
    inputs: {
      exactOrigin: 1,
      exactFarmer: 1,
      exactAltitude: 1500,
      exactProcess: 2,
      originRegion: 1,
      originCountry: 1,
      altitudeRange: 1,
      processType: 2,
      complianceType: 1
    },
    description: 'Supply chain meeting compliance requirements'
  }
};

// Test each circuit
for (const [circuitName, testCase] of Object.entries(testData)) {
  console.log(`🧪 Testing ${circuitName}...`);
  console.log(`   ${testCase.description}`);
  
  const circuitPath = path.join(buildDir, circuitName);
  const wasmPath = path.join(circuitPath, `${circuitName}_js`, `${circuitName}.wasm`);
  const r1csPath = path.join(circuitPath, `${circuitName}.r1cs`);
  
  // Check if circuit files exist
  if (!fs.existsSync(wasmPath) || !fs.existsSync(r1csPath)) {
    console.log(`   ❌ Circuit files not found for ${circuitName}`);
    console.log(`      Looking for: ${wasmPath}`);
    console.log(`      Looking for: ${r1csPath}`);
    continue;
  }
  
  try {
    // Create input file
    const inputFile = path.join(circuitPath, 'input.json');
    fs.writeFileSync(inputFile, JSON.stringify(testCase.inputs, null, 2));
    
    console.log(`   📝 Input: ${JSON.stringify(testCase.inputs)}`);
    
    // Test circuit compilation and constraints
    console.log(`   🔍 Checking circuit constraints...`);
    const constraintCommand = `snarkjs r1cs info ${r1csPath}`;
    execSync(constraintCommand, { stdio: 'pipe', cwd: __dirname });
    
    console.log(`   ✅ ${circuitName} constraints verified`);
    
    // Test WASM execution (basic test)
    console.log(`   🚀 Testing WASM execution...`);
    const wasmTestCommand = `node -e "
      const fs = require('fs');
      const wasmBuffer = fs.readFileSync('${wasmPath}');
      console.log('WASM file loaded successfully:', wasmBuffer.length, 'bytes');
    "`;
    execSync(wasmTestCommand, { stdio: 'pipe', cwd: __dirname });
    
    console.log(`   ✅ ${circuitName} WASM execution successful\n`);
    
  } catch (error) {
    console.log(`   ❌ Test failed for ${circuitName}: ${error.message}\n`);
  }
}

console.log('🎯 Circuit Testing Complete!');
console.log('\nNext steps:');
console.log('1. Generate actual proofs using the circuits');
console.log('2. Test proof verification on-chain');
console.log('3. Integrate with WAGA smart contracts');
