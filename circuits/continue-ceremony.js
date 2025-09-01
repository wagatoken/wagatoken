#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔑 Continuing Powers of Tau ceremony...\n');

// Check if we already have the final ptau file
const potFile = 'pot12_final.ptau';
if (fs.existsSync(potFile)) {
  console.log('✅ Powers of Tau ceremony already completed\n');
  process.exit(0);
}

// Continue with the ceremony if pot12_0000.ptau exists
if (fs.existsSync('pot12_0000.ptau')) {
  console.log('🔄 Continuing ceremony from pot12_0000.ptau...\n');

  try {
    // Check if pot12_0001.ptau already exists
    if (!fs.existsSync('pot12_0001.ptau')) {
      console.log('📝 Making contribution...\n');
      // Use printf to provide input to the command
      execSync('printf "WAGA_COFFEE_ENTROPY_2024\\n" | npx snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="WAGA Contribution" -v', {
        stdio: 'inherit'
      });
    } else {
      console.log('✅ Contribution already made\n');
    }

    // Check if final file already exists
    if (!fs.existsSync('pot12_final.ptau')) {
      console.log('🔄 Preparing phase 2...\n');
      execSync('npx snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v', {
        stdio: 'inherit'
      });
    } else {
      console.log('✅ Phase 2 already prepared\n');
    }

    console.log('🎉 Powers of Tau ceremony completed successfully!\n');

  } catch (error) {
    console.error('❌ Ceremony failed:', error.message);
    process.exit(1);
  }
} else {
  console.log('❌ No pot12_0000.ptau found. Run full ceremony first.\n');
  process.exit(1);
}

