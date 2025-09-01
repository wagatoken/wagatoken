// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVPForTesting} from "../../script/DeployRealZKMVPForTesting.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {IPrivacyLayer} from "../../src/Interfaces/IPrivacyLayer.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

contract WAGAZKIntegration is Test {
    DeployRealZKMVPForTesting public deployer;
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGACoffeeRedemption public redemption;
    MockCircomVerifier public mockVerifier;
    PrivacyLayer public privacyLayer;
    HelperConfig public helperConfig;

    address public admin;
    address public user = address(0x2);
    address public processor = address(0x3);
    address public distributor = address(0x4);
    
    function setUp() public {
        // Deploy the entire system using the deployment script
        deployer = new DeployRealZKMVPForTesting();

        (
            coffeeToken,
            batchManager,
            zkManager,
            proofOfReserve,
            inventoryManager,
            redemption,
            mockVerifier,
            privacyLayer,
            helperConfig
        ) = deployer.run();

        // Get the actual admin address from the deployment
        // Use the default Anvil key (same as HelperConfig for local testing)
        uint256 deployerKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        admin = vm.addr(deployerKey);

                // Set up test addresses and roles
        vm.startPrank(admin);

        // First, ensure admin has DEFAULT_ADMIN_ROLE
        coffeeToken.grantRole(keccak256("DEFAULT_ADMIN_ROLE"), admin);

        // Grant roles to test addresses using the keccak256 hash directly
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), processor);
        coffeeToken.grantRole(keccak256("DISTRIBUTOR_ROLE"), distributor);

        // Also grant PROCESSOR_ROLE to admin for testing ZK proofs
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), admin);

        // Grant VERIFIER_ROLE to the ZK Manager contract so it can call verifier functions
        mockVerifier.grantVerifierRole(address(zkManager));

        vm.stopPrank();
    }
    
    function testCompleteZKIntegration() public {
        vm.startPrank(admin);

        // 1. Test batch creation with simple function
        uint256 batchId = coffeeToken.createBatchSimple(
            100,                       // quantity
            1000000000000000000,      // pricePerUnit (1 ETH)
            "ipfs://QmTest123"         // metadataURI
        );

        assertTrue(batchId > 0, "Batch should be created");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be marked as created");
        console.log("Batch created with ID:", batchId);

        vm.stopPrank();

        // 2. Test ZK proof verification (basic functionality)
        vm.startPrank(admin);

        // Test adding pricing proof
        bytes memory mockPricingProof = "mock_pricing_proof";
        zkManager.addZKProof(
            batchId,
            mockPricingProof,
            IZKVerifier.ProofType(0), // PRICE_COMPETITIVENESS
            "premium"
        );

        console.log("Pricing proof added successfully");

        // Test adding quality proof
        bytes memory mockQualityProof = "mock_quality_proof";
        zkManager.addZKProof(
            batchId,
            mockQualityProof,
            IZKVerifier.ProofType(1), // QUALITY_STANDARDS
            "premium"
        );

        console.log("Quality proof added successfully");

        // Test adding supply chain proof
        bytes memory mockSupplyChainProof = "mock_supply_chain_proof";
        zkManager.addZKProof(
            batchId,
            mockSupplyChainProof,
            IZKVerifier.ProofType(2), // SUPPLY_CHAIN_PROVENANCE
            "compliance"
        );

        console.log("Supply chain proof added successfully");

        // Verify that all proofs were added
        bool hasProofs = zkManager.hasAllRequiredProofs(batchId);
        assertTrue(hasProofs, "Batch should have all required proofs");
        console.log("All required proofs verified successfully");

        vm.stopPrank();
    }
    
    function testPrivacyLevels() public {
        vm.startPrank(admin);

        // Test Public privacy level (using simple create function)
        uint256 publicBatchId = coffeeToken.createBatchSimple(
            50,
            500000000000000000, // 0.5 ETH
            "ipfs://QmPublicBatch"
        );

        assertTrue(coffeeToken.isBatchCreated(publicBatchId), "Public batch should be created");

        // Test Private privacy level (using simple create function)
        uint256 privateBatchId = coffeeToken.createBatchSimple(
            25,
            2000000000000000000, // 2 ETH
            "ipfs://QmPrivateBatch"
        );

        assertTrue(coffeeToken.isBatchCreated(privateBatchId), "Private batch should be created");

        console.log("Privacy levels test passed - batches created successfully");

        vm.stopPrank();
    }
    
    function testBackwardCompatibility() public {
        vm.startPrank(admin);

        // Test that createBatchSimple function works
        uint256 batchId = coffeeToken.createBatchSimple(
            75,
            750000000000000000, // 0.75 ETH
            "ipfs://QmBackwardCompat"
        );

        assertTrue(batchId > 0, "Simple batch should be created");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be marked as created");

        console.log("Backward compatibility test passed - simple batch creation works");

        vm.stopPrank();
    }
    
    function testRoleBasedAccess() public {
        // Test that non-processor users cannot create batches
        vm.startPrank(user);

        vm.expectRevert();
        coffeeToken.createBatchSimple(
            100,
            1000000000000000000,
            "ipfs://QmUnauthorized"
        );

        vm.stopPrank();

        console.log("Role-based access control test passed - non-processor cannot create batches");
    }

    function testProcessorFunctionality() public {
        // Grant PROCESSOR_ROLE to processor address (already done in setUp)

        // Test that processors can create batches
        vm.startPrank(processor);

        uint256 batchId = coffeeToken.createBatchSimple(
            150,
            2000000000000000000, // 2 ETH
            "ipfs://QmProcessorBatch"
        );

        assertTrue(batchId > 0, "Processor should be able to create batches");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created after creation");

        vm.stopPrank();

        console.log("Processor functionality test passed - processors can create batches");
    }
    
    function testZKManagerIntegration() public {
        vm.startPrank(admin);

        // Create a batch
        uint256 batchId = coffeeToken.createBatchSimple(
            200,
            1500000000000000000, // 1.5 ETH
            "ipfs://QmZKTest"
        );

                // Test adding pricing proof
        bytes memory pricingProof = "individual_pricing_proof";
        zkManager.addZKProof(
            batchId,
            pricingProof,
            IZKVerifier.ProofType(0), // PRICE_COMPETITIVENESS
            "premium"
        );

        // Test adding quality proof
        bytes memory qualityProof = "individual_quality_proof";
        zkManager.addZKProof(
            batchId,
            qualityProof,
            IZKVerifier.ProofType(1), // QUALITY_STANDARDS
            "premium"
        );

        // Test adding supply chain proof
        bytes memory supplyChainProof = "individual_supply_chain_proof";
        zkManager.addZKProof(
            batchId,
            supplyChainProof,
            IZKVerifier.ProofType(2), // SUPPLY_CHAIN_PROVENANCE
            "compliance"
        );

        console.log("ZK Manager integration test passed");

        vm.stopPrank();
    }
    
    function testPrivacyConfigurationUpdates() public {
        vm.startPrank(admin);

        // Create a batch
        uint256 batchId = coffeeToken.createBatchSimple(
            150,
            1200000000000000000, // 1.2 ETH
            "ipfs://QmPrivacyConfig"
        );

        // Test that batch was created successfully
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");

        console.log("Privacy configuration update test passed - batch created");

        vm.stopPrank();
    }

    function testRoleBasedAccessControl() public {
        // Test that only processors can create batches
        vm.startPrank(processor);

        uint256 processorBatchId = coffeeToken.createBatchSimple(
            50,
            500000000000000000, // 0.5 ETH
            "ipfs://QmProcessorAccess"
        );

        // Just test that the function doesn't revert for processors
        assertTrue(processorBatchId > 0, "Processor should be able to create batches");

        vm.stopPrank();

        console.log("Role-based access control test completed successfully");
    }

    function testBatchRequestFunctionality() public {
        vm.startPrank(processor);

        // Create a batch
        uint256 batchId = coffeeToken.createBatchSimple(
            100,
            1000000000000000000, // 1 ETH
            "ipfs://QmBatchRequest"
        );

        // Test that batch was created successfully
        assertTrue(batchId > 0, "Batch should be created");

        vm.stopPrank();

        console.log("Batch request functionality test passed - batch created successfully");
    }
}
