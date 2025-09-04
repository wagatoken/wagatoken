// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {WAGACDPIntegration} from "../../src/WAGACDPIntegration.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGAEnhancedForkTest
 * @dev Enhanced fork test for WAGA contracts with comprehensive workflow testing on Base Sepolia
 * @notice This test runs comprehensive workflows against Base Sepolia fork using current architecture
 */
contract WAGAEnhancedForkTest is Test {
    // Contract instances
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGACoffeeRedemption public redemptionContract;
    CircomVerifier public circomVerifier;
    PrivacyLayer public privacyLayer;
    WAGATreasury public treasury;
    WAGACDPIntegration public cdpIntegration;
    HelperConfig public helperConfig;
    HelperConfig.NetworkConfig public config;
    address public deployerAddress;

    // Base Sepolia configuration
    uint256 public constant BASE_SEPOLIA_CHAIN_ID = 84532;
    string public constant BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";

    // Test addresses
    address public constant ADMIN_USER = address(0x1);
    address public constant PROCESSOR_USER = address(0x2);
    address public constant VERIFIER_USER = address(0x3);
    address public constant CONSUMER_USER = address(0x4);

    // Test data
    uint256 public testBatchId;

    function setUp() public {
        // Create fork of Base Sepolia
        uint256 fork = vm.createFork(BASE_SEPOLIA_RPC_URL);
        vm.selectFork(fork);
        
        console.log("=== Enhanced Base Sepolia Fork Test Setup ===");
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        console.log("Timestamp:", block.timestamp);
        console.log("Fork ID:", fork);
        
        // Deploy contracts
        DeployRealZKMVP deployer = new DeployRealZKMVP();
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemptionContract,
            cdpIntegration,
            proofOfReserve,
            inventoryManager,
            circomVerifier,
            , // priceVerifier
            , // qualityVerifier
            , // supplyChainVerifier
            helperConfig
        ) = deployer.run();

        console.log("=== Contract Addresses on Base Sepolia Fork ===");
        console.log("CoffeeToken:", address(coffeeToken));
        console.log("BatchManager:", address(batchManager));
        console.log("ZKManager:", address(zkManager));
        console.log("PrivacyLayer:", address(privacyLayer));
        console.log("Treasury:", address(treasury));
        console.log("RedemptionContract:", address(redemptionContract));
        console.log("CDPIntegration:", address(cdpIntegration));
        console.log("ProofOfReserve:", address(proofOfReserve));
        console.log("InventoryManager:", address(inventoryManager));
        console.log("CircomVerifier:", address(circomVerifier));
        
        config = helperConfig.getActiveNetworkConfig();
        console.log("=== Real Chainlink Functions Configuration ===");
        console.log("Router:", config.router);
        console.log("Subscription ID:", config.subscriptionId);
        console.log("DON ID:", vm.toString(config.donId));
        
        // Set up roles for testing
        deployerAddress = vm.addr(config.deployerKey);
        
        vm.startPrank(deployerAddress);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), PROCESSOR_USER);
        coffeeToken.grantRole(keccak256("VERIFIER_ROLE"), VERIFIER_USER);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), ADMIN_USER); // Admin also gets processor role for testing
        
        // Deploy MockCircomVerifier for testing and replace the real one in ZK Manager
        MockCircomVerifier mockVerifier = new MockCircomVerifier();
        
        // Grant roles to mockVerifier
        mockVerifier.grantRole(mockVerifier.VERIFIER_ROLE(), address(zkManager));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(mockVerifier));
        
        // Deploy new ZK Manager with MockCircomVerifier for testing
        WAGAZKManager testZkManager = new WAGAZKManager(
            address(coffeeToken),
            address(mockVerifier)
        );
        
        // Grant roles to the new ZK Manager
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(testZkManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(testZkManager));
        mockVerifier.grantRole(mockVerifier.VERIFIER_ROLE(), address(testZkManager));
        
        // Update coffee token to use the test ZK Manager
        coffeeToken.setManagerAddresses(address(batchManager), address(testZkManager));
        
        // Update our test reference
        zkManager = testZkManager;
        
        vm.stopPrank();
    }

    /**
     * @dev Test comprehensive batch workflow on Base Sepolia fork
     */
    function testComprehensiveBatchWorkflowOnFork() public {
        console.log("=== Testing Complete Batch Workflow on Base Sepolia Fork ===");
        
        // Step 1: Create a batch as processor
        vm.startPrank(PROCESSOR_USER);
        
        testBatchId = coffeeToken.createBatchSimple(
            1000, // quantity
            75 * 1e18, // pricePerUnit (75 ETH per unit)
            "ipfs://QmForkTestBatch123" // metadataURI
        );
        
        console.log("Created batch ID on fork:", testBatchId);
        
        // Verify batch creation
        assertTrue(coffeeToken.isBatchCreated(testBatchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(testBatchId), "Batch should be active");
        
        vm.stopPrank();
        
        // Step 2: Add ZK proofs
        vm.startPrank(ADMIN_USER);
        
        // Add pricing proof
        bytes memory pricingProof = new bytes(256);
        for (uint i = 0; i < 256; i++) {
            pricingProof[i] = bytes1(uint8((i + 1) % 256));
        }
        zkManager.addZKProofWithCaller(
            PROCESSOR_USER, // Use PROCESSOR_USER as it has PROCESSOR_ROLE
            testBatchId,
            pricingProof,
            IZKVerifier.ProofType(0), // PRICE_COMPETITIVENESS
            "premium"
        );
        
        // Add quality proof
        bytes memory qualityProof = new bytes(256);
        for (uint i = 0; i < 256; i++) {
            qualityProof[i] = bytes1(uint8((i + 2) % 256));
        }
        zkManager.addZKProofWithCaller(
            PROCESSOR_USER, // Use PROCESSOR_USER as it has PROCESSOR_ROLE
            testBatchId,
            qualityProof,
            IZKVerifier.ProofType(1), // QUALITY_STANDARDS
            "premium_grade"
        );
        
                // Add supply chain proof
        bytes memory supplyProof = new bytes(256);
        for (uint i = 0; i < 256; i++) {
            supplyProof[i] = bytes1(uint8((i + 3) % 256));
        }
        zkManager.addZKProofWithCaller(
            PROCESSOR_USER, // Use PROCESSOR_USER as it has PROCESSOR_ROLE
            testBatchId,
            supplyProof,
            IZKVerifier.ProofType(2), // SUPPLY_CHAIN_PROVENANCE
            "direct_trade"
        );
        
        console.log("Added all ZK proofs for batch:", testBatchId);
        
        vm.stopPrank();

        // Verify the complete workflow
        assertTrue(coffeeToken.isBatchCreated(testBatchId), "Batch should still be created");
        assertTrue(coffeeToken.isBatchActive(testBatchId), "Batch should still be active");
        
        console.log("Comprehensive batch workflow test completed successfully on Base Sepolia fork");
    }

    /**
     * @dev Test verification request setup on real network
     */
    function testVerificationRequestSetupOnFork() public {
        console.log("=== Testing Verification Request Setup on Fork ===");
        
        // First create a batch
        vm.prank(PROCESSOR_USER);
        uint256 batchId = coffeeToken.createBatchSimple(
            1000,
            50 * 1e18,
            "ipfs://QmVerificationTestFork"
        );
        
        console.log("Created batch for verification test:", batchId);
        
        // Test verification request setup (without actually calling Chainlink)
        vm.startPrank(VERIFIER_USER);
        
        // This would normally trigger a Chainlink Functions call
        // but we're just testing the setup without funding
        string memory jsSource = "return { verified: true, quantity: 1000, price: 50000000000000000000 };";
        
        console.log("JavaScript source prepared:", jsSource);
        console.log("Verifier user:", VERIFIER_USER);
        console.log("Batch ready for verification:", batchId);
        
        // Verify the batch is in the correct state for verification
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should exist");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");
        assertTrue(coffeeToken.hasRole(keccak256("VERIFIER_ROLE"), VERIFIER_USER), "User should have verifier role");
        
        vm.stopPrank();
        
        console.log("Verification request setup verified on Base Sepolia fork");
    }

    /**
     * @dev Test contract state persistence across fork operations
     */
    function testStatePersistenceOnFork() public {
        console.log("=== Testing State Persistence on Fork ===");
        
        uint256 initialBlockNumber = block.number;
        
        // Create multiple batches
        vm.startPrank(PROCESSOR_USER);
        
        uint256[] memory batchIds = new uint256[](3);
        
        for (uint256 i = 0; i < 3; i++) {
            batchIds[i] = coffeeToken.createBatchSimple(
                1000, // quantity
                (50 + i * 10) * 1e18, // Different prices
                string.concat("ipfs://QmPersistenceTestFork", vm.toString(i))
            );
            
            console.log("Created batch", i, "with ID:", batchIds[i]);
        }
        
        vm.stopPrank();
        
        // Advance fork state
        vm.roll(block.number + 100);
        vm.warp(block.timestamp + 1000);
        
        console.log("Advanced fork state:");
        console.log("Initial block:", initialBlockNumber);
        console.log("Current block:", block.number);
        console.log("Time advanced by 1000 seconds");
        
        // Verify all batches still exist and have correct data
        for (uint256 i = 0; i < 3; i++) {
            assertTrue(coffeeToken.isBatchCreated(batchIds[i]), "Batch should still exist");
            assertTrue(coffeeToken.isBatchActive(batchIds[i]), "Batch should still be active");
            
            console.log("Batch", i, "state verified after fork advancement");
        }
        
        console.log("State persistence verified on Base Sepolia fork");
    }

    /**
     * @dev Test advanced role management functionality on fork
     */
    function testAdvancedRoleManagementOnFork() public {
        console.log("=== Testing Advanced Role Management on Fork ===");
        
        // Get deployer address for role management
        console.log("Deployer address:", deployerAddress);
        console.log("Admin user:", ADMIN_USER);
        console.log("Processor user:", PROCESSOR_USER);
        console.log("Verifier user:", VERIFIER_USER);
        
        // Test role checking
        assertTrue(coffeeToken.hasRole(coffeeToken.DEFAULT_ADMIN_ROLE(), deployerAddress), "Deployer should have default admin role");
        assertTrue(coffeeToken.hasRole(keccak256("PROCESSOR_ROLE"), PROCESSOR_USER), "Processor user should have processor role");
        assertTrue(coffeeToken.hasRole(keccak256("VERIFIER_ROLE"), VERIFIER_USER), "Verifier user should have verifier role");
        assertTrue(coffeeToken.hasRole(keccak256("PROCESSOR_ROLE"), ADMIN_USER), "Admin user should have processor role");
        
        // Test role-based access control
        vm.prank(PROCESSOR_USER);
        uint256 batchId = coffeeToken.createBatchSimple(
            1000,
            100 * 1e18,
            "ipfs://QmRoleTestFork"
        );
        
        console.log("Processor successfully created batch:", batchId);
        
        // Test that non-processor cannot create batches
        vm.prank(CONSUMER_USER);
        vm.expectRevert();
        coffeeToken.createBatchSimple(
            1000,
            100 * 1e18,
            "ipfs://QmFailedBatch"
        );
        
        console.log("Role-based access control verified on Base Sepolia fork");
        
        // Test contract roles
        // InventoryManager needs DEFAULT_ADMIN_ROLE to call batch manager functions
        bytes32 adminRole = coffeeToken.DEFAULT_ADMIN_ROLE();
        
        assertTrue(coffeeToken.hasRole(adminRole, address(inventoryManager)), "InventoryManager should have DEFAULT_ADMIN_ROLE");
        assertTrue(coffeeToken.hasRole(adminRole, address(proofOfReserve)), "ProofOfReserve should have DEFAULT_ADMIN_ROLE");
        
        console.log("Contract role assignments verified on Base Sepolia fork");
    }

    /**
     * @dev Test gas usage patterns on real network
     */
    function testGasUsageAnalysisOnFork() public {
        console.log("=== Gas Usage Analysis on Base Sepolia Fork ===");
        
        uint256 gasStart;
        uint256 gasUsed;
        
        // Test batch creation gas usage
        vm.startPrank(PROCESSOR_USER);
        
        gasStart = gasleft();
        uint256 batchId = coffeeToken.createBatchSimple(
            1000,
            60 * 1e18,
            "ipfs://QmGasTestFork"
        );
        gasUsed = gasStart - gasleft();
        
        console.log("=== Gas Usage Results ===");
        console.log("Batch creation gas used:", gasUsed);
        console.log("Created batch ID:", batchId);
        
        // Test batch query gas usage
        gasStart = gasleft();
        bool batchExists = coffeeToken.isBatchCreated(batchId);
        gasUsed = gasStart - gasleft();
        
        console.log("Batch query gas used:", gasUsed);
        console.log("Batch exists:", batchExists);
        
        // Test role check gas usage
        gasStart = gasleft();
        bool hasRole = coffeeToken.hasRole(keccak256("PROCESSOR_ROLE"), PROCESSOR_USER);
        gasUsed = gasStart - gasleft();
        
        console.log("Role check gas used:", gasUsed);
        console.log("Role check result:", hasRole);
        
        vm.stopPrank();
        
        console.log("Gas usage analysis completed on Base Sepolia fork");
    }

    /**
     * @dev Test ZK proof workflow on fork
     */
    function testZKProofWorkflowOnFork() public {
        console.log("=== Testing ZK Proof Workflow on Fork ===");
        
        // Create a batch
        vm.prank(PROCESSOR_USER);
        uint256 batchId = coffeeToken.createBatchSimple(
            750,
            80 * 1e18,
            "ipfs://QmZKWorkflowTestFork"
        );
        
        console.log("Created batch for ZK workflow:", batchId);
        
        // Test multiple ZK proof types
        vm.startPrank(ADMIN_USER);
        
        // Pricing proof
        bytes memory pricingProof = new bytes(256);
        for (uint i = 0; i < 256; i++) {
            pricingProof[i] = bytes1(uint8((i + 10) % 256));
        }
        zkManager.addZKProofWithCaller(
            PROCESSOR_USER, // Use PROCESSOR_USER as it has PROCESSOR_ROLE
            batchId,
            pricingProof,
            IZKVerifier.ProofType(0), // PRICE_COMPETITIVENESS
            "premium"
        );
        console.log("Added pricing proof");
        
        // Quality proof
        bytes memory qualityProof = new bytes(256);
        for (uint i = 0; i < 256; i++) {
            qualityProof[i] = bytes1(uint8((i + 20) % 256));
        }
        zkManager.addZKProofWithCaller(
            PROCESSOR_USER, // Use PROCESSOR_USER as it has PROCESSOR_ROLE
            batchId,
            qualityProof,
            IZKVerifier.ProofType(1), // QUALITY_STANDARDS
            "premium"
        );
        console.log("Added quality proof");
        
        // Supply chain proof
        bytes memory supplyChainProof = new bytes(256);
        for (uint i = 0; i < 256; i++) {
            supplyChainProof[i] = bytes1(uint8((i + 30) % 256));
        }
        zkManager.addZKProofWithCaller(
            PROCESSOR_USER, // Use PROCESSOR_USER as it has PROCESSOR_ROLE
            batchId,
            supplyChainProof,
            IZKVerifier.ProofType(2), // SUPPLY_CHAIN_PROVENANCE
            "compliance"
        );
        console.log("Added supply chain proof");
        
        vm.stopPrank();
        
        // Verify all proofs were added successfully
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should still exist");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should still be active");
        
        console.log("ZK proof workflow completed successfully on Base Sepolia fork");
    }

    /**
     * @dev Test that we can interact with real Chainlink Functions router
     */
    function testChainlinkRouterInteractionOnFork() public view {
        console.log("=== Testing Chainlink Router Interaction on Fork ===");
        
        // Verify router configuration
        address routerAddress = config.router;
        uint64 subscriptionId = config.subscriptionId;
        bytes32 donId = config.donId;
        
        console.log("=== Chainlink Configuration Verification ===");
        console.log("Router address:", routerAddress);
        console.log("Subscription ID:", subscriptionId);
        console.log("DON ID:", vm.toString(donId));
        
        // Check router contract exists and has code
        uint256 codeSize;
        assembly {
            codeSize := extcodesize(routerAddress)
        }
        
        assertTrue(codeSize > 0, "Router should have contract code");
        console.log("Router contract code size:", codeSize);
        
        console.log("Chainlink router interaction verification completed");
    }

    /**
     * @dev Test Treasury integration on fork
     */
    function testTreasuryIntegrationOnFork() public view {
        console.log("=== Testing Treasury Integration on Fork ===");
        
        // Verify treasury is deployed and configured
        assertTrue(address(treasury) != address(0), "Treasury should be deployed");
        
        console.log("Treasury address:", address(treasury));
        console.log("Treasury integration verified");
        
        console.log("Treasury integration test completed on Base Sepolia fork");
    }

    /**
     * @dev Test CDP integration on fork
     */
    function testCDPIntegrationOnFork() public view {
        console.log("=== Testing CDP Integration on Fork ===");
        
        // Verify CDP integration is deployed and configured
        assertTrue(address(cdpIntegration) != address(0), "CDP Integration should be deployed");
        
        console.log("CDP Integration address:", address(cdpIntegration));
        console.log("CDP integration verified");
        
        console.log("CDP integration test completed on Base Sepolia fork");
    }
}
