// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {IPrivacyLayer} from "../../src/Interfaces/IPrivacyLayer.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGAPrivacyIntegration
 * @dev Basic integration tests for the privacy-enhanced WAGA system
 */
contract WAGAPrivacyIntegration is Test {
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    DeployRealZKMVP public deployer;
    HelperConfig public helperConfig;
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    CircomVerifier public circomVerifier;
    MockCircomVerifier public mockVerifier;
    PrivacyLayer public privacyLayer;

    // Test addresses - using makeAddr pattern
    address public admin = makeAddr("admin");
    address public processor = makeAddr("processor");
    address public distributor = makeAddr("distributor");

    /* -------------------------------------------------------------------------- */
    /*                                 Setup                                      */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        // Deploy the system
        deployer = new DeployRealZKMVP();
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            , // treasury
            , // redemption
            , // cdpIntegration
            , // proofOfReserve
            , // inventoryManager
            , // ethiopianCompliance
            , // ecxOracle
            circomVerifier,
            helperConfig
        ) = deployer.run();

        // Set up roles using the deployer who already has admin rights from deployment
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        address deployer_address = vm.addr(config.deployerKey);
        
        vm.startPrank(deployer_address);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), processor);
        coffeeToken.grantRole(keccak256("DISTRIBUTOR_ROLE"), distributor);

        // Also grant PROCESSOR_ROLE to admin for testing ZK proofs
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), admin);

        // Grant VERIFIER_ROLE to the ZK Manager contract so it can call verifier functions
        circomVerifier.grantRole(circomVerifier.VERIFIER_ROLE(), address(zkManager));

        // Deploy and configure MockCircomVerifier for testing
        mockVerifier = new MockCircomVerifier();
        mockVerifier.grantRole(mockVerifier.VERIFIER_ROLE(), address(admin));
        
        // Create a new ZKManager with MockCircomVerifier for testing ZK functionality
        WAGAZKManager testZKManager = new WAGAZKManager(
            address(coffeeToken),
            address(mockVerifier)
        );
        
        // Grant necessary roles to the test ZK Manager
        mockVerifier.grantRole(mockVerifier.VERIFIER_ROLE(), address(testZKManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(testZKManager));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(testZKManager));
        
        // Replace the zkManager reference for tests that need ZK verification
        zkManager = testZKManager;

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              Test Functions                               */
    /* -------------------------------------------------------------------------- */

    function testBasicZKProofVerification() public {
        console.log("Testing basic ZK proof verification...");

        // Create a batch
        vm.startPrank(processor);
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                1000,                   // quantity
                1 ether,               // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
        vm.stopPrank();

        // Test pricing proof verification
        vm.startPrank(admin);
        bytes memory pricingProof = _createValidMockGroth16Proof();
        zkManager.addZKProofWithCaller(
            admin, // original caller
            batchId,
            pricingProof,
            IZKVerifier.ProofType(0), // PRICE_COMPETITIVENESS
            "premium"
        );

        console.log("Pricing proof verification test passed");

        vm.stopPrank();
    }

    function testQualityZKProofVerification() public {
        console.log("Testing quality ZK proof verification...");

        // Create a batch
        vm.startPrank(processor);
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                500,                    // quantity
                0.5 ether,             // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
        vm.stopPrank();

        // Test quality proof verification
        vm.startPrank(admin);
        bytes memory qualityProof = _createValidMockGroth16Proof();
        zkManager.addZKProofWithCaller(
            admin, // original caller
            batchId,
            qualityProof,
            IZKVerifier.ProofType(1), // QUALITY_STANDARDS
            "premium"
        );

        console.log("Quality proof verification test passed");

        vm.stopPrank();
    }

    function testSupplyChainZKProofVerification() public {
        console.log("Testing supply chain ZK proof verification...");

        // Create a batch
        vm.startPrank(processor);
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                750,                    // quantity
                0.75 ether,            // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
        vm.stopPrank();

        // Test supply chain proof verification
        vm.startPrank(admin);
        bytes memory supplyChainProof = _createValidMockGroth16Proof();
        zkManager.addZKProofWithCaller(
            admin, // original caller
            batchId,
            supplyChainProof,
            IZKVerifier.ProofType(2), // SUPPLY_CHAIN_PROVENANCE
            "compliance"
        );

        console.log("Supply chain proof verification test passed");

        vm.stopPrank();
    }

    function testBatchCreationWithZK() public {
        console.log("Testing batch creation with ZK integration...");

        // Test batch creation by processor
        vm.startPrank(processor);
        uint256 batchId1 = coffeeToken.createBatch(
            block.timestamp,         // productionDate
            block.timestamp + 365 days, // expiryDate
            200,                    // quantity
            0.2 ether,             // pricePerUnit
            "Origin",              // origin
            "Standard",            // packagingInfo
            "ipfs://test-metadata" // metadataURI
        );
        assertTrue(coffeeToken.isBatchCreated(batchId1), "First batch should be created by processor");
        vm.stopPrank();

        // Test batch creation by admin (also has PROCESSOR_ROLE)
        vm.startPrank(admin);
        uint256 batchId2 = coffeeToken.createBatch(
            block.timestamp,         // productionDate
            block.timestamp + 365 days, // expiryDate
            300,                    // quantity
            0.3 ether,             // pricePerUnit
            "Origin",              // origin
            "Standard",            // packagingInfo
            "ipfs://test-metadata" // metadataURI
        );
        assertTrue(coffeeToken.isBatchCreated(batchId2), "Second batch should be created by admin");
        vm.stopPrank();

        console.log("Batch creation with ZK integration test passed for both processor and admin");
    }
    
    /**
     * @dev Helper function to create valid mock Groth16 proof data (256 bytes)
     * @notice Creates structurally valid proof that will decode properly but fail verification
     * @return 256-byte proof in Groth16 format: point A (64 bytes) + point B (128 bytes) + point C (64 bytes)
     */
    function _createValidMockGroth16Proof() internal pure returns (bytes memory) {
        // Create 256 bytes of mock proof data with valid structure
        bytes memory mockProof = new bytes(256);
        
        // Point A (G1 point: x, y coordinates, 32 bytes each)
        for (uint256 i = 0; i < 64; i++) {
            mockProof[i] = bytes1(uint8(1 + (i % 32))); // Avoid all zeros
        }
        
        // Point B (G2 point: x1, x2, y1, y2 coordinates, 32 bytes each)  
        for (uint256 i = 64; i < 192; i++) {
            mockProof[i] = bytes1(uint8(2 + (i % 32))); // Different pattern
        }
        
        // Point C (G1 point: x, y coordinates, 32 bytes each)
        for (uint256 i = 192; i < 256; i++) {
            mockProof[i] = bytes1(uint8(3 + (i % 32))); // Another pattern
        }
        
        return mockProof;
    }
}
