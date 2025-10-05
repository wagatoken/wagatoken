const fs = require('fs');
const path = require('path');

// Simple test to verify our proof files exist and are valid
function testRealProofs() {
  const circuitsPath = '/Users/manu-acho/foundry_2/WAGA_MVP_V2/circuits/build';
  const circuits = ['PricePrivacyCircuit', 'QualityTierCircuit', 'SupplyChainPrivacyCircuit'];
  
  console.log('Testing real ZK proof files...\n');
  
  circuits.forEach(circuitName => {
    const proofPath = path.join(circuitsPath, circuitName, 'proof.json');
    const publicPath = path.join(circuitsPath, circuitName, 'public.json');
    
    console.log(`Testing ${circuitName}:`);
    
    if (fs.existsSync(proofPath) && fs.existsSync(publicPath)) {
      try {
        const proof = JSON.parse(fs.readFileSync(proofPath, 'utf8'));
        const publicSignals = JSON.parse(fs.readFileSync(publicPath, 'utf8'));
        
        console.log('  ✅ Proof file exists and is valid JSON');
        console.log('  ✅ Public signals file exists and is valid JSON');
        console.log(`  📊 Public signals: [${publicSignals.join(', ')}]`);
        console.log(`  🔐 Proof protocol: ${proof.protocol}`);
        console.log(`  📐 Curve: ${proof.curve}`);
      } catch (error) {
        console.log('  ❌ Error parsing JSON:', error.message);
      }
    } else {
      console.log('  ❌ Proof files missing');
    }
    console.log('');
  });
}

testRealProofs();