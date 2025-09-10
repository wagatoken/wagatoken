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
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGABaseForkTest
 * @dev Fork test for WAGA contracts on Base Sepolia network using current contract architecture
 * @notice This test runs against a fork of Base Sepolia, using real Chainlink Functions infrastructure
 */
contract WAGABaseForkTest is Test {
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
    HelperConfig public helperConfig;

    // Base Sepolia configuration
    uint256 public constant BASE_SEPOLIA_CHAIN_ID = 84532;
    string public constant BASE_SEPOLIA_RPC_URL = "https://sepolia.base.org";

    // Test addresses
    address public constant TEST_ADMIN = address(0x1);
    address public constant TEST_PROCESSOR = address(0x2);
    address public constant TEST_VERIFIER = address(0x3);

    function setUp() public {
        // Create fork of Base Sepolia
        uint256 fork = vm.createFork(BASE_SEPOLIA_RPC_URL);
        vm.selectFork(fork);
        
        // Verify we're on Base Sepolia
        assertEq(block.chainid, BASE_SEPOLIA_CHAIN_ID, "Should be on Base Sepolia");
        
        console.log("=== Base Sepolia Fork Test Setup ===");
        console.log("Chain ID:", block.chainid);
        console.log("Block number:", block.number);
        console.log("Fork selected:", fork);
        
        // Deploy contracts using the current deployment script
        DeployRealZKMVP deployer = new DeployRealZKMVP();
        
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemptionContract,
            , // cdpIntegration
            proofOfReserve,
            inventoryManager,
            circomVerifier,
            , // priceVerifier
            , // qualityVerifier
            , // supplyChainVerifier
            helperConfig
        ) = deployer.run();

        // Get the Base Sepolia configuration
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        
        console.log("=== Deployed Contract Addresses ===");
        console.log("CoffeeToken:", address(coffeeToken));
        console.log("BatchManager:", address(batchManager));
        console.log("ZKManager:", address(zkManager));
        console.log("PrivacyLayer:", address(privacyLayer));
        console.log("Treasury:", address(treasury));
        console.log("RedemptionContract:", address(redemptionContract));
        console.log("ProofOfReserve:", address(proofOfReserve));
        console.log("InventoryManager:", address(inventoryManager));
        console.log("CircomVerifier:", address(circomVerifier));
        
        console.log("=== Chainlink Functions Configuration ===");
        console.log("Router:", config.router);
        console.log("Subscription ID:", config.subscriptionId);
        console.log("DON ID:", vm.toString(config.donId));
        
        // Set up roles for testing
        address deployerAddress = vm.addr(config.deployerKey);
        
        vm.startPrank(deployerAddress);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), TEST_PROCESSOR);
        coffeeToken.grantRole(keccak256("VERIFIER_ROLE"), TEST_VERIFIER);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), TEST_ADMIN); // Admin also gets processor role for testing
        
        // Deploy MockCircomVerifier for testing and replace the real one in ZK Manager
        MockCircomVerifier mockVerifier = new MockCircomVerifier();
        
        // Grant roles to mockVerifier
        mockVerifier.grantRole(mockVerifier.VERIFIER_ROLE(), address(zkManager));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(mockVerifier));
        
        // Update ZK Manager to use MockCircomVerifier (we'll need to add a setter function or redeploy)
        // For now, let's redeploy ZK Manager with MockCircomVerifier for testing
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
        
        console.log("=== Fork Test Setup Completed ===");
    }

    /**
     * @dev Test that contracts deploy successfully on Base Sepolia fork
     */
    function testDeploymentOnBaseSepolia() public view {
        // Verify all contracts are deployed
        assertTrue(address(coffeeToken) != address(0), "CoffeeToken should be deployed");
        assertTrue(address(batchManager) != address(0), "BatchManager should be deployed");
        assertTrue(address(zkManager) != address(0), "ZKManager should be deployed");
        assertTrue(address(privacyLayer) != address(0), "PrivacyLayer should be deployed");
        assertTrue(address(treasury) != address(0), "Treasury should be deployed");
        assertTrue(address(redemptionContract) != address(0), "RedemptionContract should be deployed");
        assertTrue(address(proofOfReserve) != address(0), "ProofOfReserve should be deployed");
        assertTrue(address(inventoryManager) != address(0), "InventoryManager should be deployed");
        assertTrue(address(circomVerifier) != address(0), "CircomVerifier should be deployed");
        
        // Verify chain ID
        assertEq(block.chainid, BASE_SEPOLIA_CHAIN_ID, "Should be on Base Sepolia");
        
        console.log("All contracts deployed and initialized successfully on Base Sepolia fork");
    }

    /**
     * @dev Test Chainlink Functions router connection
     */
    function testChainlinkFunctionsConnection() public view {
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        
        // Verify Chainlink Functions router is set
        assertTrue(config.router != address(0), "Router should be set for Base Sepolia");
        
        // Check that the router address has code (real Chainlink contract)
        uint256 codeSize;
        address routerAddress = config.router;
        assembly {
            codeSize := extcodesize(routerAddress)
        }
        assertTrue(codeSize > 0, "Router should have contract code");
        
        console.log("Chainlink Functions router connection verified");
        console.log("Router address:", config.router);
        console.log("Router code size:", codeSize);
    }

    /**
     * @dev Test role management in fork environment
     */
    function testRoleManagementOnFork() public view {
        // Check that DEFAULT_ADMIN_ROLE exists
        bytes32 defaultAdminRole = coffeeToken.DEFAULT_ADMIN_ROLE();
        bytes32 processorRole = keccak256("PROCESSOR_ROLE");
        bytes32 verifierRole = keccak256("VERIFIER_ROLE");
        
        console.log("Default admin role:", vm.toString(defaultAdminRole));
        console.log("Processor role:", vm.toString(processorRole));
        console.log("Verifier role:", vm.toString(verifierRole));
        
        // Verify role assignments
        assertTrue(coffeeToken.hasRole(processorRole, TEST_PROCESSOR), "TEST_PROCESSOR should have PROCESSOR_ROLE");
        assertTrue(coffeeToken.hasRole(verifierRole, TEST_VERIFIER), "TEST_VERIFIER should have VERIFIER_ROLE");
        assertTrue(coffeeToken.hasRole(processorRole, TEST_ADMIN), "TEST_ADMIN should have PROCESSOR_ROLE");
        
        console.log("Role management system verified on fork");
    }

    /**
     * @dev Test batch creation workflow on Base Sepolia fork
     */
    function testBatchCreationOnFork() public {
        console.log("=== Testing Batch Creation on Base Sepolia Fork ===");
        
        // Create a batch as processor
        vm.startPrank(TEST_PROCESSOR);
        
        uint256 batchId = coffeeToken.createBatchSimple(
            1000, // quantity
            75 * 1e18, // pricePerUnit (75 ETH per unit)
            "ipfs://QmForkTestBatch123" // metadataURI
        );
        
        console.log("Created batch ID on fork:", batchId);
        
        // Verify batch creation
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");
        
        vm.stopPrank();
        
        console.log("Batch creation workflow test completed successfully on Base Sepolia fork");
    }

    /**
     * @dev Test ZK proof integration on fork
     */
    function testZKProofIntegrationOnFork() public {
        console.log("=== Testing ZK Proof Integration on Fork ===");
        
        // First create a batch
        vm.prank(TEST_PROCESSOR);
        uint256 batchId = coffeeToken.createBatchSimple(
            1000,
            50 * 1e18,
            "ipfs://QmZKTestBatch"
        );
        
        // Test ZK proof submission (using mock proofs for fork testing)
        vm.startPrank(TEST_ADMIN);
        
        // Create a properly formatted 256-byte mock Groth16 proof for testing
        bytes memory mockPricingProof = new bytes(256);
        for (uint i = 0; i < 256; i++) {
            mockPricingProof[i] = bytes1(uint8(i % 256));
        }
        
        zkManager.addZKProofWithCaller(
            TEST_PROCESSOR, // Use TEST_PROCESSOR as original caller since it has PROCESSOR_ROLE
            batchId,
            mockPricingProof,
            IZKVerifier.ProofType(0), // PRICE_COMPETITIVENESS
            "premium"
        );
        
        console.log("Successfully added pricing proof for batch:", batchId);
        
        vm.stopPrank();
        
        console.log("ZK proof integration verified on Base Sepolia fork");
    }

    /**
     * @dev Test gas costs on Base Sepolia fork
     */
    function testGasCostsOnFork() public {
        console.log("=== Gas Usage Analysis on Base Sepolia Fork ===");
        
        uint256 gasStart;
        uint256 gasUsed;
        
        // Test batch creation gas usage
        vm.startPrank(TEST_PROCESSOR);
        
        gasStart = gasleft();
        uint256 batchId = coffeeToken.createBatchSimple(
            1000,
            60 * 1e18,
            "ipfs://QmGasTestBatch"
        );
        gasUsed = gasStart - gasleft();
        
        console.log("Batch creation gas used:", gasUsed);
        console.log("Created batch ID:", batchId);
        
        vm.stopPrank();
        
        // Test batch query gas usage
        gasStart = gasleft();
        bool batchExists = coffeeToken.isBatchCreated(batchId);
        gasUsed = gasStart - gasleft();
        
        console.log("Batch query gas used:", gasUsed);
        console.log("Batch exists:", batchExists);
        
        assertTrue(gasUsed > 0, "Should use some gas");
        assertTrue(batchExists, "Batch should exist");
        
        console.log("Gas cost measurement completed on Base Sepolia fork");
    }

    /**
     * @dev Test that we can read Base Sepolia state
     */
    function testReadBaseSepoliaState() public view {
        // Read some basic network state
        uint256 currentBlock = block.number;
        uint256 currentTimestamp = block.timestamp;
        address coinbase = block.coinbase;
        
        console.log("=== Base Sepolia Network State ===");
        console.log("Current block:", currentBlock);
        console.log("Current timestamp:", currentTimestamp);
        console.log("Block coinbase:", coinbase);
        
        // Verify we're getting real network data
        assertTrue(currentBlock > 0, "Block number should be positive");
        assertTrue(currentTimestamp > 0, "Timestamp should be positive");
        
        console.log("Base Sepolia state reading successful");
    }

    /**
     * @dev Test contract state persistence across fork operations
     */
    function testStatePersistenceOnFork() public {
        console.log("=== Testing State Persistence on Fork ===");
        
        uint256 initialBlockNumber = block.number;
        
        // Create multiple batches
        vm.startPrank(TEST_PROCESSOR);
        
        uint256[] memory batchIds = new uint256[](3);
        
        for (uint256 i = 0; i < 3; i++) {
            batchIds[i] = coffeeToken.createBatchSimple(
                1000, // quantity
                (50 + i * 10) * 1e18, // Different prices
                string.concat("ipfs://QmPersistenceTest", vm.toString(i))
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
        
        // Verify all batches still exist
        for (uint256 i = 0; i < 3; i++) {
            assertTrue(coffeeToken.isBatchCreated(batchIds[i]), "Batch should still exist");
            assertTrue(coffeeToken.isBatchActive(batchIds[i]), "Batch should still be active");
            
            console.log("Batch", i, "state verified after fork advancement");
        }
        
        console.log("State persistence verified on Base Sepolia fork");
    }

    /**
     * @dev Test that we can interact with real Chainlink Functions router
     */
    function testChainlinkRouterInteractionOnFork() public view {
        console.log("=== Testing Chainlink Router Interaction on Fork ===");
        
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        
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
}
