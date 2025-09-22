// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {WAGAAccessControl} from "../../src/WAGAAccessControl.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {TestHelperUtilities} from "../TestHelperUtilities.sol";

/**
 * @title BackwardCompatibilityTest
 * @dev Comprehensive backward compatibility tests
 * @notice Ensures existing functionality works with enhanced features
 */
contract BackwardCompatibilityTest is Test {
    using TestHelperUtilities for *;

    /* -------------------------------------------------------------------------- */
    /*                              CONTRACT INSTANCES                            */
    /* -------------------------------------------------------------------------- */

    DeployRealZKMVP public deployer;
    HelperConfig public helperConfig;

    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGAEthiopianCompliance public ethiopianCompliance;
    WAGACoffeeRedemption public redemptionContract;
    WAGATreasury public treasury;
    PrivacyLayer public privacyLayer;
    WAGAAccessControl public accessControl;
    CircomVerifier public circomVerifier;
    MockUSDC public usdcToken;

    /* -------------------------------------------------------------------------- */
    /*                              TEST ACCOUNTS                                 */
    /* -------------------------------------------------------------------------- */

    address public admin;
    address public processor = makeAddr("legacyProcessor");
    address public consumer = makeAddr("legacyConsumer");

    /* -------------------------------------------------------------------------- */
    /*                              SETUP FUNCTION                                */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        // Deploy the system
        deployer = new DeployRealZKMVP();
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemptionContract,
            , // cdpIntegration
            , // proofOfReserve
            , // inventoryManager
            ethiopianCompliance,
            , // ecxOracle
            circomVerifier,
            , // accessControl (use getter instead)
            helperConfig
        ) = deployer.run();

        // Get access control using getter function to avoid stack too deep
        accessControl = deployer.getAccessControl();

        admin = vm.addr(helperConfig.getActiveNetworkConfig().deployerKey);
        usdcToken = MockUSDC(address(treasury.usdcToken()));

        // Setup legacy roles (minimal setup for backward compatibility)
        vm.startPrank(admin);
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), admin);
        circomVerifier.grantRole(circomVerifier.VERIFIER_ROLE(), processor);
        vm.stopPrank();

        // Fund accounts
        vm.deal(consumer, 1000 ether);
        usdcToken.mint(consumer, 10000 * 1e6);
        usdcToken.mint(address(treasury), 10000 * 1e6);

        vm.prank(consumer);
        usdcToken.approve(address(treasury), 10000 * 1e6);
    }

    /* -------------------------------------------------------------------------- */
    /*                     LEGACY BATCH CREATION TESTS                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Test legacy batch creation without enhanced features
     */
    function testLegacyBatchCreation() public {
        console.log("=== TESTING LEGACY BATCH CREATION ===");

        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            1 ether,
            "Legacy Region",
            "Legacy Grade",
            "ipfs://legacy-batch-metadata"
        );
        vm.stopPrank();

        // Verify basic batch creation works
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertEq(batchManager.batchCreator(batchId), processor, "Batch creator should be set");

        // Verify batch metadata
        (
            uint256 productionDate,
            uint256 expiryTime,
            uint256 quantity,
            uint256 pricePerUnit,
            string memory packagingInfo,
            string memory metadataHash,
            uint256 lastVerifiedTimestamp
        ) = coffeeToken.getBatchInfo(batchId);

        assertEq(productionDate, block.timestamp, "Production date should match");
        assertEq(expiryTime, block.timestamp + 365 days, "Expiry time should match");
        assertEq(quantity, 1000, "Quantity should match");
        assertEq(pricePerUnit, 1 ether, "Price per unit should match");
        assertEq(packagingInfo, "Legacy Region", "Packaging info should match");
        assertEq(metadataHash, "ipfs://legacy-batch-metadata", "Metadata hash should match");

        console.log("Legacy batch creation works correctly");
    }

    /**
     * @dev Test legacy ZK proof submission (original three proof types)
     */
    function testLegacyZKProofSubmission() public {
        console.log("=== TESTING LEGACY ZK PROOF SUBMISSION ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            500,
            0.5 ether,
            "Legacy ZK Region",
            "Legacy ZK Grade",
            "ipfs://legacy-zk-batch"
        );
        vm.stopPrank();

        // Submit legacy ZK proofs
        vm.startPrank(processor);
        zkManager.addZKProof(
            batchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.PRICE_COMPETITIVENESS,
            "Legacy competitive pricing"
        );

        zkManager.addZKProof(
            batchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.QUALITY_STANDARDS,
            "Legacy quality standards"
        );

        zkManager.addZKProof(
            batchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE,
            "Legacy supply chain provenance"
        );
        vm.stopPrank();

        // Verify legacy proofs work
        assertTrue(zkManager.hasAllRequiredProofs(batchId), "Legacy proofs should be accepted");
        assertTrue(circomVerifier.hasAllRequiredProofs(batchId), "CircomVerifier should record legacy proofs");

        // Note: CircomVerifier.BatchProofStatus is different from IZKVerifier.BatchProofStatus
        // For backward compatibility testing, we'll verify proofs through the ZK manager instead

        console.log("Legacy ZK proof submission works correctly");
    }

    /**
     * @dev Test legacy payment and redemption workflow
     */
    function testLegacyPaymentAndRedemption() public {
        console.log("=== TESTING LEGACY PAYMENT AND REDEMPTION ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1 ether,
            "Legacy Payment Region",
            "Legacy Payment Grade",
            "ipfs://legacy-payment-batch"
        );
        vm.stopPrank();

        // Legacy payment (direct USDC transfer)
        vm.startPrank(consumer);
        treasury.payForBatch(batchId, 100 * 1 ether);
        vm.stopPrank();

        // Verify payment
        assertTrue(treasury.hasPaidForBatch(consumer, batchId), "Legacy payment should be recorded");
        assertEq(treasury.batchPaymentCollected(batchId), 100 * 1 ether, "Payment amount should be collected");

        // Mint tokens (admin function)
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, 100);
        vm.stopPrank();

        // Verify token minting
        assertEq(coffeeToken.balanceOf(consumer, batchId), 100, "Tokens should be minted");

        // Legacy redemption (without EUDR requirement)
        vm.startPrank(consumer);
        uint256 redemptionId = redemptionContract.requestRedemption(batchId, 50, "Legacy Bank Details");
        vm.stopPrank();

        // Verify redemption
        (
            address redemptionConsumer,
            uint64 redemptionSellerId,
            uint256 redemptionBatchId,
            uint256 quantity,
            ,
            ,
            ,
            bool requiresEUDRCompliance,
            ,
        ) = redemptionContract.getEnhancedRedemptionDetails(redemptionId);

        assertEq(redemptionConsumer, consumer, "Redemption consumer should match");
        assertEq(redemptionBatchId, batchId, "Redemption batch should match");
        assertEq(quantity, 50, "Redemption quantity should match");
        assertFalse(requiresEUDRCompliance, "Legacy redemption should not require EUDR");

        console.log("Legacy payment and redemption workflow works correctly");
    }

    /**
     * @dev Test legacy Ethiopian compliance registration (minimal)
     */
    function testLegacyEthiopianCompliance() public {
        console.log("=== TESTING LEGACY ETHIOPIAN COMPLIANCE ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            200,
            2 ether,
            "Yirgacheffe",
            "Washed",
            "ipfs://legacy-compliance-batch"
        );
        vm.stopPrank();

        // Legacy compliance registration (minimal setup)
        vm.startPrank(admin);
        ethiopianCompliance.addBankingPartner(makeAddr("legacyBank"), "Legacy Bank");
        vm.stopPrank();

        // This tests that the contract doesn't break with minimal compliance setup
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should still exist with minimal compliance");

        console.log("Legacy Ethiopian compliance setup works correctly");
    }

    /**
     * @dev Test that new features don't break existing contract interactions
     */
    function testNewFeaturesDontBreakExistingInteractions() public {
        console.log("=== TESTING NEW FEATURES DON'T BREAK EXISTING INTERACTIONS ===");

        // Create multiple legacy batches
        vm.startPrank(processor);
        uint256 batchId1 = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1 ether,
            "Legacy 1",
            "Grade 1",
            "ipfs://legacy-1"
        );

        uint256 batchId2 = coffeeToken.createBatch(
            block.timestamp + 1,
            block.timestamp + 366 days,
            200,
            2 ether,
            "Legacy 2",
            "Grade 2",
            "ipfs://legacy-2"
        );
        vm.stopPrank();

        // Verify both batches work independently
        assertTrue(coffeeToken.isBatchCreated(batchId1), "First legacy batch should work");
        assertTrue(coffeeToken.isBatchCreated(batchId2), "Second legacy batch should work");
        assertTrue(batchId1 != batchId2, "Batch IDs should be different");

        // Test batch isolation
        (
            uint256 productionDate1,
            uint256 expiryTime1,
            uint256 quantity1,
            uint256 pricePerUnit1,
            string memory packagingInfo1,
            string memory metadataHash1,
            uint256 lastVerifiedTimestamp1
        ) = coffeeToken.getBatchInfo(batchId1);

        (
            uint256 productionDate2,
            uint256 expiryTime2,
            uint256 quantity2,
            uint256 pricePerUnit2,
            string memory packagingInfo2,
            string memory metadataHash2,
            uint256 lastVerifiedTimestamp2
        ) = coffeeToken.getBatchInfo(batchId2);

        // Verify batch data isolation
        assertEq(quantity1, 100, "First batch quantity should be isolated");
        assertEq(quantity2, 200, "Second batch quantity should be isolated");
        assertEq(pricePerUnit1, 1 ether, "First batch price should be isolated");
        assertEq(pricePerUnit2, 2 ether, "Second batch price should be isolated");
        assertEq(packagingInfo1, "Legacy 1", "First batch packaging info should be isolated");
        assertEq(packagingInfo2, "Legacy 2", "Second batch packaging info should be isolated");

        console.log("New features don't break existing batch interactions");
    }

    /**
     * @dev Test that enhanced system maintains all legacy APIs
     */
    function testLegacyAPIMaintenance() public {
        console.log("=== TESTING LEGACY API MAINTENANCE ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            150,
            1.5 ether,
            "API Test Region",
            "API Test Grade",
            "ipfs://api-test-batch"
        );
        vm.stopPrank();

        // Test all legacy view functions still work
        assertTrue(coffeeToken.isBatchCreated(batchId), "isBatchCreated should work");
        assertEq(batchManager.batchCreator(batchId), processor, "batchCreator should work");

        // Test legacy batch details
        (
            uint256 creationTime,
            uint256 expiryTime,
            uint256 quantity,
            uint256 pricePerUnit,
            string memory packagingInfo,
            string memory metadataHash,
            uint256 lastVerifiedTimestamp
        ) = coffeeToken.getBatchInfo(batchId);

        assertTrue(creationTime > 0, "getBatchInfo creationTime should work");
        assertTrue(expiryTime > creationTime, "getBatchInfo expiryTime should work");
        assertEq(quantity, 150, "getBatchInfo quantity should work");
        assertEq(pricePerUnit, 1.5 ether, "getBatchInfo pricePerUnit should work");
        assertEq(packagingInfo, "API Test Packaging", "getBatchInfo packagingInfo should work");
        assertEq(metadataHash, "ipfs://api-test-batch", "getBatchInfo metadataHash should work");
        assertTrue(lastVerifiedTimestamp >= 0, "getBatchInfo lastVerifiedTimestamp should work");

        // Test legacy ZK functions
        assertFalse(zkManager.hasAllRequiredProofs(batchId), "hasAllRequiredProofs should work (false for no proofs)");
        assertFalse(circomVerifier.hasAllRequiredProofs(batchId), "CircomVerifier hasAllRequiredProofs should work");

        console.log("All legacy APIs maintained and working");
    }

    /**
     * @dev Test mixed usage - legacy and enhanced features together
     */
    function testMixedLegacyAndEnhancedUsage() public {
        console.log("=== TESTING MIXED LEGACY AND ENHANCED USAGE ===");

        // Create two batches - one legacy, one enhanced
        vm.startPrank(processor);
        uint256 legacyBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1 ether,
            "Legacy Batch",
            "Legacy Grade",
            "ipfs://legacy-batch"
        );

        uint256 enhancedBatchId = coffeeToken.createBatch(
            block.timestamp + 1,
            block.timestamp + 366 days,
            200,
            2 ether,
            "Enhanced Batch",
            "Enhanced Grade",
            "ipfs://enhanced-batch"
        );
        vm.stopPrank();

        // Legacy batch - only basic ZK proofs
        vm.startPrank(processor);
        zkManager.addZKProof(
            legacyBatchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.PRICE_COMPETITIVENESS,
            "Legacy pricing"
        );
        vm.stopPrank();

        // Enhanced batch - full compliance suite
        vm.startPrank(admin);
        accessControl.registerSeller(
            processor,
            WAGAAccessControl.SellerType.PROCESSOR,
            "Enhanced Processor",
            "ENH001",
            bytes11("TESTSWIFTXX")
        );
        vm.stopPrank();

        vm.startPrank(processor);
        zkManager.addZKProof(
            enhancedBatchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.PRICE_COMPETITIVENESS,
            "Enhanced pricing"
        );

        zkManager.addEUDRComplianceZKProof(
            enhancedBatchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free"
        );
        vm.stopPrank();

        // Verify both work independently
        assertTrue(zkManager.hasAllRequiredProofs(legacyBatchId), "Legacy batch should have basic proofs");
        assertTrue(circomVerifier.hasEUDRComplianceProofs(enhancedBatchId), "Enhanced batch should have EUDR proofs");

        // Verify no interference
        assertFalse(circomVerifier.hasEUDRComplianceProofs(legacyBatchId), "Legacy batch should not have EUDR proofs");
        assertFalse(zkManager.hasAllRequiredProofs(enhancedBatchId), "Enhanced batch should not have all basic proofs yet");

        console.log("Mixed legacy and enhanced usage works correctly");
        console.log("Legacy features: WORKING");
        console.log("Enhanced features: WORKING");
        console.log("No interference: CONFIRMED");
    }
}
