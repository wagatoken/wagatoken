// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test} from "forge-std/Test.sol";
import {DeployWagaToken} from "../../script/DeployWagaToken.s.sol";
import {WAGACoffeeToken} from "../../src/WAGACoffeeToken.sol";
import {WAGAZKManager} from "../../src/ZKIntegration/WAGAZKManager.sol";
import {CircomVerifier} from "../../src/ZKVerifiers/CircomVerifier.sol";
import {SelectiveTransparency} from "../../src/PrivacyLayers/SelectiveTransparency.sol";
import {CompetitiveProtection} from "../../src/PrivacyLayers/CompetitiveProtection.sol";

contract WAGAZKIntegration is Test {
    WAGACoffeeToken public coffeeToken;
    WAGAZKManager public zkManager;
    CircomVerifier public circomVerifier;
    SelectiveTransparency public selectiveTransparency;
    CompetitiveProtection public competitiveProtection;
    
    address public admin = address(0x1);
    address public user = address(0x2);
    
    function setUp() public {
        // Deploy the entire system using the deployment script
        DeployWagaToken deployer = new DeployWagaToken();
        
        (
            coffeeToken,
            , // inventoryManager
            , // redemptionContract
            , // proofOfReserve
            zkManager,
            circomVerifier,
            selectiveTransparency,
            competitiveProtection,
            // helperConfig
        ) = deployer.run();
        
        // Set up test addresses
        vm.startPrank(admin);
        vm.stopPrank();
    }
    
    function testCompleteZKIntegration() public {
        vm.startPrank(admin);
        
        // 1. Test batch creation with privacy
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,           // productionDate
            block.timestamp + 365 days, // expiryDate
            100,                       // quantity
            1000000000000000000,      // pricePerUnit (1 ETH)
            "250g",                    // packagingInfo
            1                          // PrivacyLevel.Selective
        );
        
        assertTrue(batchId > 0, "Batch should be created");
        console.log("Batch created with ID:", batchId);
        
        // 2. Test privacy configuration
        (
            bool pricingPrivate,
            bool qualityPrivate,
            bool supplyChainPrivate,
            , // pricingProofHash
            , // qualityProofHash
            , // supplyChainProofHash
            uint8 privacyLevel
        ) = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertTrue(pricingPrivate, "Pricing should be private");
        assertTrue(qualityPrivate, "Quality should be private");
        assertTrue(supplyChainPrivate, "Supply chain should be private");
        assertEq(privacyLevel, 1, "Privacy level should be Selective");
        
        console.log("Privacy configuration verified");
        
        // 3. Test ZK proof verification
        bytes memory mockPricingProof = "mock_pricing_proof";
        bytes memory mockQualityProof = "mock_quality_proof";
        bytes memory mockSupplyChainProof = "mock_supply_chain_proof";
        
        bool verified = zkManager.verifyBatchPrivacyProofs(
            batchId,
            mockPricingProof,
            mockQualityProof,
            mockSupplyChainProof
        );
        
        assertTrue(verified, "ZK proofs should be verified");
        console.log("ZK proofs verified successfully");
        
        // 4. Test IPFS update with ZK proofs
        string memory ipfsUri = "ipfs://QmTest123";
        string memory metadataHash = "0x1234567890abcdef";
        
        coffeeToken.updateBatchIPFSWithZKProofs(
            batchId,
            ipfsUri,
            metadataHash,
            mockPricingProof,
            mockQualityProof,
            mockSupplyChainProof
        );
        
        // 5. Verify privacy configuration was updated
        (
            pricingPrivate,
            qualityPrivate,
            supplyChainPrivate,
            , // pricingProofHash
            , // qualityProofHash
            , // supplyChainProofHash
            privacyLevel
        ) = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertTrue(pricingPrivate, "Pricing should remain private");
        assertTrue(qualityPrivate, "Quality should remain private");
        assertTrue(supplyChainPrivate, "Supply chain should remain private");
        
        console.log("IPFS update with ZK proofs successful");
        
        vm.stopPrank();
    }
    
    function testPrivacyLevels() public {
        vm.startPrank(admin);
        
        // Test Public privacy level
        uint256 publicBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            50,
            500000000000000000, // 0.5 ETH
            "500g",
            0 // PrivacyLevel.Public
        );
        
        (
            bool pricingPrivate,
            bool qualityPrivate,
            bool supplyChainPrivate,
            , // pricingProofHash
            , // qualityProofHash
            , // supplyChainProofHash
            uint8 privacyLevel
        ) = coffeeToken.getBatchPrivacyConfig(publicBatchId);
        
        assertFalse(pricingPrivate, "Pricing should be public");
        assertFalse(qualityPrivate, "Quality should be public");
        assertFalse(supplyChainPrivate, "Supply chain should be public");
        assertEq(privacyLevel, 0, "Privacy level should be Public");
        
        // Test Private privacy level
        uint256 privateBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            25,
            2000000000000000000, // 2 ETH
            "250g",
            2 // PrivacyLevel.Private
        );
        
        (
            pricingPrivate,
            qualityPrivate,
            supplyChainPrivate,
            , // pricingProofHash
            , // qualityProofHash
            , // supplyChainProofHash
            privacyLevel
        ) = coffeeToken.getBatchPrivacyConfig(privateBatchId);
        
        assertTrue(pricingPrivate, "Pricing should be private");
        assertTrue(qualityPrivate, "Quality should be private");
        assertTrue(supplyChainPrivate, "Supply chain should be private");
        assertEq(privacyLevel, 2, "Privacy level should be Private");
        
        console.log("Privacy levels test passed");
        
        vm.stopPrank();
    }
    
    function testBackwardCompatibility() public {
        vm.startPrank(admin);
        
        // Test that old createBatch function still works (defaults to Public)
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            75,
            750000000000000000, // 0.75 ETH
            "250g"
        );
        
        assertTrue(batchId > 0, "Backward compatible batch should be created");
        
        // Verify it defaults to Public privacy
        (
            bool pricingPrivate,
            bool qualityPrivate,
            bool supplyChainPrivate,
            , // pricingProofHash
            , // qualityProofHash
            , // supplyChainProofHash
            uint8 privacyLevel
        ) = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertFalse(pricingPrivate, "Pricing should be public by default");
        assertFalse(qualityPrivate, "Quality should be public by default");
        assertFalse(supplyChainPrivate, "Supply chain should be public by default");
        assertEq(privacyLevel, 0, "Privacy level should default to Public");
        
        console.log("Backward compatibility test passed");
        
        vm.stopPrank();
    }
    
    function testRoleBasedAccess() public {
        // Test that non-admin users cannot create batches with privacy
        vm.startPrank(user);
        
        vm.expectRevert();
        coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1000000000000000000,
            "250g",
            1 // PrivacyLevel.Selective
        );
        
        vm.stopPrank();
        
        // Test that non-admin users cannot update privacy config
        vm.startPrank(user);
        
        vm.expectRevert();
        coffeeToken.updateBatchPrivacyConfig(1, 
            WAGACoffeeToken.PrivacyConfig({
                pricingPrivate: true,
                qualityPrivate: true,
                supplyChainPrivate: true,
                pricingProofHash: bytes32(0),
                qualityProofHash: bytes32(0),
                supplyChainProofHash: bytes32(0),
                level: WAGACoffeeToken.PrivacyLevel.Private
            })
        );
        
        vm.stopPrank();
        
        console.log("Role-based access control test passed");
    }
    
    function testZKManagerIntegration() public {
        vm.startPrank(admin);
        
        // Create a batch
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            200,
            1500000000000000000, // 1.5 ETH
            "500g",
            1 // PrivacyLevel.Selective
        );
        
        // Test individual proof verification
        bytes memory pricingProof = "individual_pricing_proof";
        bool pricingVerified = zkManager.verifyPricingProof(
            batchId,
            pricingProof,
            "premium",
            true
        );
        
        assertTrue(pricingVerified, "Individual pricing proof should be verified");
        
        // Test quality proof verification
        bytes memory qualityProof = "individual_quality_proof";
        bool qualityVerified = zkManager.verifyQualityProof(
            batchId,
            qualityProof,
            "premium",
            true
        );
        
        assertTrue(qualityVerified, "Individual quality proof should be verified");
        
        // Test supply chain proof verification
        bytes memory supplyChainProof = "individual_supply_chain_proof";
        bool supplyChainVerified = zkManager.verifySupplyChainProof(
            batchId,
            supplyChainProof,
            "compliance",
            true
        );
        
        assertTrue(supplyChainVerified, "Individual supply chain proof should be verified");
        
        console.log("ZK Manager integration test passed");
        
        vm.stopPrank();
    }
    
    function testPrivacyConfigurationUpdates() public {
        vm.startPrank(admin);
        
        // Create a batch
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            150,
            1200000000000000000, // 1.2 ETH
            "250g",
            1 // PrivacyLevel.Selective
        );
        
        // Update privacy configuration
        WAGACoffeeToken.PrivacyConfig memory newConfig = WAGACoffeeToken.PrivacyConfig({
            pricingPrivate: false,      // Make pricing public
            qualityPrivate: true,       // Keep quality private
            supplyChainPrivate: true,   // Keep supply chain private
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            level: WAGACoffeeToken.PrivacyLevel.Selective
        });
        
        coffeeToken.updateBatchPrivacyConfig(batchId, newConfig);
        
        // Verify the update
        (
            bool pricingPrivate,
            bool qualityPrivate,
            bool supplyChainPrivate,
            , // pricingProofHash
            , // qualityProofHash
            , // supplyChainProofHash
            uint8 privacyLevel
        ) = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertFalse(pricingPrivate, "Pricing should now be public");
        assertTrue(qualityPrivate, "Quality should remain private");
        assertTrue(supplyChainPrivate, "Supply chain should remain private");
        assertEq(privacyLevel, 1, "Privacy level should remain Selective");
        
        console.log("Privacy configuration update test passed");
        
        vm.stopPrank();
    }
}
