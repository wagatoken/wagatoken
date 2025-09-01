// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVPForTesting} from "../../script/DeployRealZKMVPForTesting.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
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

    DeployRealZKMVPForTesting public deployer;
    HelperConfig public helperConfig;
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    MockCircomVerifier public mockVerifier;
    PrivacyLayer public privacyLayer;

    // Test addresses
    address public admin = address(0x1);
    address public processor = address(0x2);
    address public distributor = address(0x3);

    /* -------------------------------------------------------------------------- */
    /*                                 Setup                                      */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        // Deploy the system
        deployer = new DeployRealZKMVPForTesting();
        (
            coffeeToken,
            batchManager,
            zkManager,
            , // proofOfReserve
            , // inventoryManager
            , // redemption
            mockVerifier,
            privacyLayer,
            helperConfig
        ) = deployer.run();

        // Set up roles
        address deployer_address = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;
        vm.startPrank(deployer_address);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), processor);
        coffeeToken.grantRole(keccak256("DISTRIBUTOR_ROLE"), distributor);

        // Also grant PROCESSOR_ROLE to admin for testing ZK proofs
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), admin);

        // Grant VERIFIER_ROLE to the ZK Manager contract so it can call verifier functions
        mockVerifier.grantVerifierRole(address(zkManager));

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              Test Functions                               */
    /* -------------------------------------------------------------------------- */

    function testBasicZKProofVerification() public {
        console.log("Testing basic ZK proof verification...");

        // Create a batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatchSimple(
            1000,
            1 ether,
            "ipfs://QmTestBatch"
        );
        vm.stopPrank();

        // Test pricing proof verification
        vm.startPrank(admin);
        bytes memory pricingProof = "mock_pricing_proof";
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
        uint256 batchId = coffeeToken.createBatchSimple(
            500,
            0.5 ether,
            "ipfs://QmQualityTest"
        );
        vm.stopPrank();

        // Test quality proof verification
        vm.startPrank(admin);
        bytes memory qualityProof = "mock_quality_proof";
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
        uint256 batchId = coffeeToken.createBatchSimple(
            750,
            0.75 ether,
            "ipfs://QmSupplyChainTest"
        );
        vm.stopPrank();

        // Test supply chain proof verification
        vm.startPrank(admin);
        bytes memory supplyChainProof = "mock_supply_chain_proof";
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

        // Test that processors can create batches
        vm.startPrank(processor);

        uint256 batchId1 = coffeeToken.createBatchSimple(200, 0.2 ether, "ipfs://QmBatch1");
        uint256 batchId2 = coffeeToken.createBatchSimple(300, 0.3 ether, "ipfs://QmBatch2");

        assertTrue(coffeeToken.isBatchCreated(batchId1), "First batch should be created");
        assertTrue(coffeeToken.isBatchCreated(batchId2), "Second batch should be created");

        console.log("Batch creation with ZK integration test passed");

        vm.stopPrank();
    }
}
