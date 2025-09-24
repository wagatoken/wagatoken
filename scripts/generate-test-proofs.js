#!/usr/bin/env node

/**
 * @title Generate Test Proofs for ZK Integration Testing
 * @dev Creates valid ZK proofs for testing real cryptographic verification
 * @notice Uses existing circuit infrastructure to generate Groth16 proofs
 */

const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

// Circuit paths
const CIRCUITS_DIR = "./circuits";
const BUILD_DIR = path.join(CIRCUITS_DIR, "build");
const ARTIFACTS_DIR = path.join(CIRCUITS_DIR, "artifacts");

// Output directory for test proofs
const TEST_PROOFS_DIR = "./test/fixtures/proofs";

/**
 * Generate a valid ZK proof for price privacy circuit
 */
async function generatePriceProof() {
    console.log("🔐 Generating Price Privacy Circuit Proof...");
    
    try {
        // Load circuit artifacts
        const wasmPath = path.join(BUILD_DIR, "PricePrivacyCircuit.wasm");
        const zkeyPath = path.join(ARTIFACTS_DIR, "PricePrivacyCircuit_final.zkey");
        
        if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
            console.log("❌ Circuit artifacts not found. Please run circuit build first.");
            return null;
        }
        
        // Test inputs for price circuit
        const input = {
            actualPrice: 150, // $1.50 per unit
            minPrice: 100,    // $1.00 minimum
            maxPrice: 200,    // $2.00 maximum
            salt: 12345       // Random salt for privacy
        };
        
        console.log("Input:", input);
        
        // Generate witness
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasmPath,
            zkeyPath
        );
        
        console.log("✅ Price proof generated successfully");
        console.log("Public signals:", publicSignals);
        
        return {
            proof,
            publicSignals,
            input
        };
        
    } catch (error) {
        console.error("❌ Error generating price proof:", error.message);
        return null;
    }
}

/**
 * Generate a valid ZK proof for quality tier circuit
 */
async function generateQualityProof() {
    console.log("🔐 Generating Quality Tier Circuit Proof...");
    
    try {
        const wasmPath = path.join(BUILD_DIR, "QualityTierCircuit.wasm");
        const zkeyPath = path.join(ARTIFACTS_DIR, "QualityTierCircuit_final.zkey");
        
        if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
            console.log("❌ Quality circuit artifacts not found.");
            return null;
        }
        
        // Test inputs for quality circuit
        const input = {
            qualityScore: 85,  // 85% quality score
            minQuality: 80,    // 80% minimum for premium
            certification: 1,  // SCA certified
            salt: 54321        // Random salt
        };
        
        console.log("Input:", input);
        
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasmPath,
            zkeyPath
        );
        
        console.log("✅ Quality proof generated successfully");
        console.log("Public signals:", publicSignals);
        
        return {
            proof,
            publicSignals,
            input
        };
        
    } catch (error) {
        console.error("❌ Error generating quality proof:", error.message);
        return null;
    }
}

/**
 * Generate a valid ZK proof for supply chain circuit
 */
async function generateSupplyChainProof() {
    console.log("🔐 Generating Supply Chain Privacy Circuit Proof...");
    
    try {
        const wasmPath = path.join(BUILD_DIR, "SupplyChainPrivacyCircuit.wasm");
        const zkeyPath = path.join(ARTIFACTS_DIR, "SupplyChainPrivacyCircuit_final.zkey");
        
        if (!fs.existsSync(wasmPath) || !fs.existsSync(zkeyPath)) {
            console.log("❌ Supply chain circuit artifacts not found.");
            return null;
        }
        
        // Test inputs for supply chain circuit
        const input = {
            originHash: 123456789,     // Hash of origin location
            processingSteps: 5,        // Number of processing steps
            traceabilityScore: 95,     // 95% traceability
            minTraceability: 90,       // 90% minimum required
            salt: 98765                // Random salt
        };
        
        console.log("Input:", input);
        
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            wasmPath,
            zkeyPath
        );
        
        console.log("✅ Supply chain proof generated successfully");
        console.log("Public signals:", publicSignals);
        
        return {
            proof,
            publicSignals,
            input
        };
        
    } catch (error) {
        console.error("❌ Error generating supply chain proof:", error.message);
        return null;
    }
}

/**
 * Convert snarkjs proof to Solidity format
 */
function formatProofForSolidity(proof) {
    // Extract proof components
    const a = [proof.pi_a[0], proof.pi_a[1]];
    const b = [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]];
    const c = [proof.pi_c[0], proof.pi_c[1]];
    
    return {
        a,
        b, 
        c
    };
}

/**
 * Encode proof as bytes for Solidity
 */
function encodeProofAsBytes(proof) {
    const formattedProof = formatProofForSolidity(proof);
    
    // Convert to hex strings and concatenate
    let proofBytes = "0x";
    
    // Point A (64 bytes)
    proofBytes += formattedProof.a[0].slice(2).padStart(64, '0');
    proofBytes += formattedProof.a[1].slice(2).padStart(64, '0');
    
    // Point B (128 bytes)  
    proofBytes += formattedProof.b[0][0].slice(2).padStart(64, '0');
    proofBytes += formattedProof.b[0][1].slice(2).padStart(64, '0');
    proofBytes += formattedProof.b[1][0].slice(2).padStart(64, '0');
    proofBytes += formattedProof.b[1][1].slice(2).padStart(64, '0');
    
    // Point C (64 bytes)
    proofBytes += formattedProof.c[0].slice(2).padStart(64, '0');
    proofBytes += formattedProof.c[1].slice(2).padStart(64, '0');
    
    return proofBytes;
}

/**
 * Generate test proof data file for Solidity tests
 */
async function generateTestProofData() {
    console.log("🚀 Starting Test Proof Generation...");
    
    // Create output directory
    if (!fs.existsSync(TEST_PROOFS_DIR)) {
        fs.mkdirSync(TEST_PROOFS_DIR, { recursive: true });
    }
    
    const testProofs = {
        price: null,
        quality: null,
        supplyChain: null
    };
    
    // Generate proofs for each circuit
    testProofs.price = await generatePriceProof();
    testProofs.quality = await generateQualityProof();
    testProofs.supplyChain = await generateSupplyChainProof();
    
    // Filter out null results
    const successfulProofs = Object.fromEntries(
        Object.entries(testProofs).filter(([_, proof]) => proof !== null)
    );
    
    if (Object.keys(successfulProofs).length === 0) {
        console.log("❌ No proofs generated successfully. Check circuit artifacts.");
        return;
    }
    
    // Create Solidity test data
    const solidityData = {
        proofs: {},
        encodedProofs: {},
        publicSignals: {},
        inputs: {}
    };
    
    for (const [circuitType, proofData] of Object.entries(successfulProofs)) {
        solidityData.proofs[circuitType] = formatProofForSolidity(proofData.proof);
        solidityData.encodedProofs[circuitType] = encodeProofAsBytes(proofData.proof);
        solidityData.publicSignals[circuitType] = proofData.publicSignals;
        solidityData.inputs[circuitType] = proofData.input;
    }
    
    // Save test data
    const outputPath = path.join(TEST_PROOFS_DIR, "test-proofs.json");
    fs.writeFileSync(outputPath, JSON.stringify(solidityData, null, 2));
    
    console.log("✅ Test proof data generated successfully:");
    console.log(`   Output: ${outputPath}`);
    console.log(`   Circuits: ${Object.keys(successfulProofs).join(", ")}`);
    
    // Generate Solidity helper file
    await generateSolidityHelper(solidityData);
}

/**
 * Generate Solidity helper contract for test proofs
 */
async function generateSolidityHelper(proofData) {
    const solidityContent = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title TestProofData
 * @dev Contains valid ZK proofs for testing real cryptographic verification
 * @notice Generated automatically from circuit test runs
 */
library TestProofData {
    
    struct ProofComponents {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }
    
    // Valid proof data generated from circuits
    ${Object.entries(proofData.proofs).map(([circuitType, proof]) => `
    function get${circuitType.charAt(0).toUpperCase() + circuitType.slice(1)}Proof() 
        internal pure returns (ProofComponents memory) 
    {
        return ProofComponents({
            a: [${proof.a.map(x => `uint256(${x})`).join(', ')}],
            b: [[${proof.b[0].map(x => `uint256(${x})`).join(', ')}], 
                [${proof.b[1].map(x => `uint256(${x})`).join(', ')}]],
            c: [${proof.c.map(x => `uint256(${x})`).join(', ')}]
        });
    }
    
    function get${circuitType.charAt(0).toUpperCase() + circuitType.slice(1)}ProofBytes() 
        internal pure returns (bytes memory) 
    {
        return hex"${proofData.encodedProofs[circuitType].slice(2)}";
    }
    
    function get${circuitType.charAt(0).toUpperCase() + circuitType.slice(1)}PublicSignals() 
        internal pure returns (uint256[] memory) 
    {
        uint256[] memory signals = new uint256[](${proofData.publicSignals[circuitType].length});
        ${proofData.publicSignals[circuitType].map((signal, i) => 
            `signals[${i}] = uint256(${signal});`
        ).join('\n        ')}
        return signals;
    }`).join('')}
}`;
    
    const solidityPath = path.join("./test/fixtures", "TestProofData.sol");
    fs.writeFileSync(solidityPath, solidityContent);
    
    console.log("✅ Solidity helper generated:", solidityPath);
}

/**
 * Main execution
 */
async function main() {
    try {
        await generateTestProofData();
        console.log("🎉 Test proof generation completed successfully!");
        
    } catch (error) {
        console.error("💥 Error in proof generation:", error);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    generatePriceProof,
    generateQualityProof,
    generateSupplyChainProof,
    generateTestProofData
};