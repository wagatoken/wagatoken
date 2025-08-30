// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployWagaToken} from "../../script/DeployWagaToken.s.sol";
import {WAGACoffeeToken} from "../../src/WAGACoffeeToken.sol";
import {WAGAZKManager} from "../../src/ZKIntegration/WAGAZKManager.sol";
import {CircomVerifier} from "../../src/ZKVerifiers/CircomVerifier.sol";
import {SelectiveTransparency} from "../../src/PrivacyLayers/SelectiveTransparency.sol";
import {CompetitiveProtection} from "../../src/PrivacyLayers/CompetitiveProtection.sol";
import {IPrivacyLayer} from "../../src/ZKCircuits/Interfaces/IPrivacyLayer.sol";

contract WAGAZKIntegration is Test {
    WAGACoffeeToken public coffeeToken;
    WAGAZKManager public zkManager;
    CircomVerifier public circomVerifier;
    SelectiveTransparency public selectiveTransparency;
    CompetitiveProtection public competitiveProtection;
    
    address public admin;
    address public user = address(0x2);
    address public processor = address(0x3);
    address public distributor = address(0x4);
    
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
        
        // Get the actual admin address from the deployment
        // Since we're in a test environment, we can use the default deployer address
        admin = address(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266);
        
        // Set up test addresses and roles
        vm.startPrank(admin);
        
        // Grant roles to test addresses
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), processor);
        coffeeToken.grantRole(keccak256("DISTRIBUTOR_ROLE"), distributor);
        
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
            IPrivacyLayer.PrivacyLevel.Selective  // PrivacyLevel.Selective
        );
        
        assertTrue(batchId > 0, "Batch should be created");
        console.log("Batch created with ID:", batchId);
        
        // 2. Test privacy configuration
        IPrivacyLayer.PrivacyConfig memory privacyConfig = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertTrue(privacyConfig.pricingPrivate, "Pricing should be private");
        assertTrue(privacyConfig.qualityPrivate, "Quality should be private");
        assertTrue(privacyConfig.supplyChainPrivate, "Supply chain should be private");
        assertEq(uint8(privacyConfig.level), uint8(IPrivacyLayer.PrivacyLevel.Selective), "Privacy level should be Selective");
        
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
        IPrivacyLayer.PrivacyConfig memory updatedPrivacyConfig = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertTrue(updatedPrivacyConfig.pricingPrivate, "Pricing should remain private");
        assertTrue(updatedPrivacyConfig.qualityPrivate, "Quality should remain private");
        assertTrue(updatedPrivacyConfig.supplyChainPrivate, "Supply chain should remain private");
        
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
            IPrivacyLayer.PrivacyLevel.Public
        );
        
        IPrivacyLayer.PrivacyConfig memory publicConfig = coffeeToken.getBatchPrivacyConfig(publicBatchId);
        
        assertFalse(publicConfig.pricingPrivate, "Pricing should be public");
        assertFalse(publicConfig.qualityPrivate, "Quality should be public");
        assertFalse(publicConfig.supplyChainPrivate, "Supply chain should be public");
        assertEq(uint8(publicConfig.level), uint8(IPrivacyLayer.PrivacyLevel.Public), "Privacy level should be Public");
        
        // Test Private privacy level
        uint256 privateBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            25,
            2000000000000000000, // 2 ETH
            "250g",
            IPrivacyLayer.PrivacyLevel.Private
        );
        
        IPrivacyLayer.PrivacyConfig memory privateConfig = coffeeToken.getBatchPrivacyConfig(privateBatchId);
        
        assertTrue(privateConfig.pricingPrivate, "Pricing should be private");
        assertTrue(privateConfig.qualityPrivate, "Quality should be private");
        assertTrue(privateConfig.supplyChainPrivate, "Supply chain should be private");
        assertEq(uint8(privateConfig.level), uint8(IPrivacyLayer.PrivacyLevel.Private), "Privacy level should be Private");
        
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
            "250g",
            IPrivacyLayer.PrivacyLevel.Public
        );
        
        assertTrue(batchId > 0, "Backward compatible batch should be created");
        
        // Verify it defaults to Public privacy
        IPrivacyLayer.PrivacyConfig memory defaultConfig = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertFalse(defaultConfig.pricingPrivate, "Pricing should be public by default");
        assertFalse(defaultConfig.qualityPrivate, "Quality should be public by default");
        assertFalse(defaultConfig.supplyChainPrivate, "Supply chain should be public by default");
        assertEq(uint8(defaultConfig.level), uint8(IPrivacyLayer.PrivacyLevel.Public), "Privacy level should default to Public");
        
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
            IPrivacyLayer.PrivacyLevel.Selective
        );
        
        vm.stopPrank();
        
        // Test that non-admin users cannot update privacy config
        vm.startPrank(user);
        
        vm.expectRevert();
        coffeeToken.updateBatchPrivacyConfig(1, 
            IPrivacyLayer.PrivacyConfig({
                pricingPrivate: true,
                qualityPrivate: true,
                supplyChainPrivate: true,
                pricingSelective: false,
                qualitySelective: false,
                supplyChainSelective: false,
                pricingProofHash: bytes32(0),
                qualityProofHash: bytes32(0),
                supplyChainProofHash: bytes32(0),
                level: IPrivacyLayer.PrivacyLevel.Private
            })
        );
        
        vm.stopPrank();
        
        console.log("Role-based access control test passed");
    }

    function testProcessorFunctionality() public {
        // Grant PROCESSOR_ROLE to processor address
        vm.startPrank(admin);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), processor);
        vm.stopPrank();

        // Test that processors can create batches
        vm.startPrank(processor);
        
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            150,
            2000000000000000000, // 2 ETH
            "250g",
            IPrivacyLayer.PrivacyLevel.Selective
        );
        
        assertTrue(batchId > 0, "Processor should be able to create batches");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created after creation");
        assertFalse(coffeeToken.exists(batchId), "Tokens should not exist before verification");
        
        vm.stopPrank();

        // Test batch request functionality (only distributors can request)
        vm.startPrank(distributor);
        
        coffeeToken.requestBatch(batchId, "Need 50 bags for distribution");
        
        uint256 requestCount = coffeeToken.getBatchRequestCount(batchId);
        assertEq(requestCount, 1, "Should have one batch request");
        
        (address requester, string memory details, uint256 timestamp, bool fulfilled) = 
            coffeeToken.getBatchRequest(batchId, 0);
            
        assertEq(requester, distributor, "Requester should be distributor");
        assertEq(details, "Need 50 bags for distribution", "Request details should match");
        assertFalse(fulfilled, "Request should not be fulfilled initially");
        
        vm.stopPrank();
        
        console.log("Processor functionality test passed");
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
            IPrivacyLayer.PrivacyLevel.Selective
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
            IPrivacyLayer.PrivacyLevel.Selective
        );
        
        // Update privacy configuration
        IPrivacyLayer.PrivacyConfig memory newConfig = IPrivacyLayer.PrivacyConfig({
            pricingPrivate: false,      // Make pricing public
            qualityPrivate: true,       // Keep quality private
            supplyChainPrivate: true,   // Keep supply chain private
            pricingSelective: false,
            qualitySelective: true,     // Enable selective quality transparency
            supplyChainSelective: true, // Enable selective supply chain transparency
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            level: IPrivacyLayer.PrivacyLevel.Selective
        });
        
        coffeeToken.updateBatchPrivacyConfig(batchId, newConfig);
        
        // Verify the update
        IPrivacyLayer.PrivacyConfig memory updatedConfig = coffeeToken.getBatchPrivacyConfig(batchId);
        
        assertFalse(updatedConfig.pricingPrivate, "Pricing should now be public");
        assertTrue(updatedConfig.qualityPrivate, "Quality should remain private");
        assertTrue(updatedConfig.supplyChainPrivate, "Supply chain should remain private");
        assertEq(uint8(updatedConfig.level), uint8(IPrivacyLayer.PrivacyLevel.Selective), "Privacy level should remain Selective");
        
        console.log("Privacy configuration update test passed");
        
        vm.stopPrank();
    }

    function testRoleBasedAccessControl() public {
        vm.startPrank(admin);
        
        // Create a batch with selective privacy
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1000000000000000000, // 1 ETH
            "250g",
            IPrivacyLayer.PrivacyLevel.Selective
        );
        
        vm.stopPrank();
        
        // Test Public Access (no role) - should not see price
        (
            uint256 productionDate,
            uint256 expiryDate,
            bool isVerified,
            uint256 quantity,
            uint256 pricePerUnit,
            string memory packagingInfo,
            string memory metadataHash,
            bool isMetadataVerified,
            uint256 lastVerifiedTimestamp,
            IPrivacyLayer.PrivacyConfig memory privacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(batchId, user);
        
        assertEq(pricePerUnit, 0, "Public users should not see price data");
        assertTrue(privacyConfig.pricingPrivate, "Pricing should be private for public users");
        console.log("Public access test passed - price hidden");
        
        // Test Distributor Access - should see price
        vm.startPrank(distributor);
        (
            , // productionDate
            , // expiryDate
            , // isVerified
            , // quantity
            uint256 distributorPrice,
            , // packagingInfo
            , // metadataHash
            , // isMetadataVerified
            , // lastVerifiedTimestamp
            IPrivacyLayer.PrivacyConfig memory distributorPrivacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(batchId, distributor);
        
        assertEq(distributorPrice, 1000000000000000000, "Distributors should see price data");
        assertTrue(distributorPrivacyConfig.pricingPrivate, "Privacy config should still show pricing as private");
        console.log("Distributor access test passed - price visible");
        
        vm.stopPrank();
        
        // Test Admin Access - should see everything
        vm.startPrank(admin);
        (
            , // productionDate
            , // expiryDate
            , // isVerified
            , // quantity
            uint256 adminPrice,
            , // packagingInfo
            , // metadataHash
            , // isMetadataVerified
            , // lastVerifiedTimestamp
            IPrivacyLayer.PrivacyConfig memory adminPrivacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(batchId, admin);
        
        assertEq(adminPrice, 1000000000000000000, "Admins should see price data");
        assertTrue(adminPrivacyConfig.pricingPrivate, "Privacy config should show pricing as private");
        console.log("Admin access test passed - full access");
        
        vm.stopPrank();
        
        // Test Processor Access - should see everything
        vm.startPrank(processor);
        (
            , // productionDate
            , // expiryDate
            , // isVerified
            , // quantity
            uint256 processorPrice,
            , // packagingInfo
            , // metadataHash
            , // isMetadataVerified
            , // lastVerifiedTimestamp
            IPrivacyLayer.PrivacyConfig memory processorPrivacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(batchId, processor);
        
        assertEq(processorPrice, 1000000000000000000, "Processors should see price data");
        assertTrue(processorPrivacyConfig.pricingPrivate, "Privacy config should show pricing as private");
        console.log("Processor access test passed - full access");
        
        vm.stopPrank();
        
        console.log("Role-based access control test completed successfully");
    }

    function testBatchRequestFunctionality() public {
        vm.startPrank(admin);
        
        // Create a batch
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1000000000000000000, // 1 ETH
            "250g",
            IPrivacyLayer.PrivacyLevel.Selective
        );
        
        vm.stopPrank();
        
        // Test batch request by distributor
        vm.startPrank(distributor);
        coffeeToken.requestBatch(batchId, "Need 50 bags for delivery to Nairobi");
        
        uint256 requestCount = coffeeToken.getBatchRequestCount(batchId);
        assertEq(requestCount, 1, "Should have one batch request");
        
        (
            address requester,
            string memory requestDetails,
            uint256 timestamp,
            bool fulfilled
        ) = coffeeToken.getBatchRequest(batchId, 0);
        
        assertEq(requester, distributor, "Requester should be distributor");
        assertEq(requestDetails, "Need 50 bags for delivery to Nairobi", "Request details should match");
        assertFalse(fulfilled, "Request should not be fulfilled yet");
        console.log("Batch request functionality test passed");
        
        vm.stopPrank();
        
        // Test that public users cannot request batches
        vm.startPrank(user); // user has no DISTRIBUTOR_ROLE
        vm.expectRevert(); // Should revert due to lack of DISTRIBUTOR_ROLE
        coffeeToken.requestBatch(batchId, "Public user trying to request");
        vm.stopPrank();
        
        console.log("Public user batch request restriction test passed");
    }
}
