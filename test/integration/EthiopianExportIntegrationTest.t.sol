// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
// WAGAAccessControl removed - functionality moved to WAGAConfigManager
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {WAGACDPIntegration} from "../../src/WAGACDPIntegration.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGAECXPriceOracle} from "../../src/WAGAECXPriceOracle.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";

/**
 * @title EthiopianExportIntegrationTest
 * @dev End-to-end integration tests for Ethiopian export compliance and fiat transfer pipeline
 * Tests complete BoE registration and multi-stage fiat transfer process
 */
contract EthiopianExportIntegrationTest is Test {
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    DeployRealZKMVP public deployer;
    HelperConfig public helperConfig;

    // Contract instances
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGACoffeeRedemption public redemption;
    WAGAEthiopianCompliance public ethiopianCompliance;
    WAGATreasury public treasury;
    // WAGAAccessControl removed - using ConfigManager functionality via CoffeeToken
    CircomVerifier public circomVerifier;
    MockCircomVerifier public mockVerifier;
    MockUSDC public usdc;
    
    // Additional contracts now included in deployment
    WAGACDPIntegration public cdpIntegration;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGAECXPriceOracle public ecxOracle;

    // Test accounts
    address public admin = makeAddr("admin");
    address public processor = makeAddr("processor");
    address public verifier = makeAddr("verifier");
    address public consumer = makeAddr("consumer");
    address public offrampPartner = makeAddr("offrampPartner");
    address public bankingPartner = makeAddr("bankingPartner");
    address public seller = makeAddr("seller");

    // Test constants
    uint256 constant QUANTITY = 100;
    uint256 constant PRICE_PER_UNIT = 5000; // $50
    uint256 constant TOTAL_VALUE = QUANTITY * PRICE_PER_UNIT; // 500,000 USDC
    bytes11 constant OFFRAMP_SWIFT = "DBSSGB2LXXX"; // DBS Bank Singapore
    bytes11 constant BANK_SWIFT = "CBETETAAXXX"; // Commercial Bank of Ethiopia

    uint256 public testBatchId;

    /* -------------------------------------------------------------------------- */
    /*                                 Setup                                      */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        console.log("=== Ethiopian Export Integration Test Setup ===");

        // Deploy the entire system
        deployer = new DeployRealZKMVP();
        (
            coffeeToken,
            batchManager,
            zkManager,
            , // privacyLayer
            treasury,
            redemption,
            cdpIntegration, // Now included in deployment
            proofOfReserve, // Now included in deployment
            inventoryManager, // Now included in deployment
            ethiopianCompliance,
            ecxOracle, // Now included in deployment
            circomVerifier,
            // accessControl removed
            helperConfig
        ) = deployer.run();

        // Note: AccessControl functionality now in ConfigManager (inherited by CoffeeToken)
        // No separate accessControl contract needed

        // Get the actual admin address from the deployment
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        address deployerAddress = vm.addr(config.deployerKey);

        // Setup roles and test environment
        vm.startPrank(deployerAddress);

        // Grant roles using unified ConfigManager functions
        coffeeToken.grantProcessorRole(processor);
        coffeeToken.grantVerifierRole(verifier);
        coffeeToken.grantProcessorRole(admin);

        // Register seller using ConfigManager
        coffeeToken.registerSeller(
            seller,
            WAGAConfigManager.SellerType.COOPERATIVE,
            "Test Cooperative",
            "REG001",
            "TESTSWIFTXX"
        );

        // Setup banking partners
        ethiopianCompliance.addBankingPartner(bankingPartner, "Commercial Bank of Ethiopia");
        ethiopianCompliance.addBankingPartner(offrampPartner, "Global Offramp Partner"); // Offramp partners are banking partners with specific capabilities

        // Banking partners are now set up with addBankingPartner above
        // For more advanced capabilities, use registerBankingPartner instead

        // Deploy MockUSDC and fund treasury
        usdc = new MockUSDC();
        usdc.mint(address(treasury), TOTAL_VALUE * 3); // Extra for multiple tests

        // Configure mock verifier for testing
        mockVerifier = new MockCircomVerifier();
        // Note: MockCircomVerifier doesn't require role setup - it's a mock for testing

        // Replace zkManager with test version using mock verifier
        WAGAZKManager testZKManager = new WAGAZKManager(address(coffeeToken), address(mockVerifier));
        coffeeToken.setManagerAddresses(address(batchManager), address(testZKManager));
        zkManager = testZKManager;

        vm.stopPrank();

        console.log("Ethiopian Export Integration Test Setup Complete");
    }

    /* -------------------------------------------------------------------------- */
    /*                       ETHIOPIAN EXPORT WORKFLOWS                          */
    /* -------------------------------------------------------------------------- */

    function testCompleteEthiopianExportWorkflow() public {
        console.log("=== Testing Complete Ethiopian Export Workflow ===");

        // Step 1: Create export-compliant batch
        vm.startPrank(processor);
        testBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Ethiopian Yirgacheffe",
            "Export Compliant Packaging",
            "ipfs://export-compliant-batch-metadata"
        );
        console.log("Created export-compliant batch:", testBatchId);
        vm.stopPrank();

        // Step 2: Add Ethiopian compliance proofs
        vm.startPrank(admin);

        // ECTA permit validity
        zkManager.addComplianceZKProof(
            testBatchId,
            "ECTA_PERMIT",
            _createValidMockGroth16Proof(),
            "ECTA Export Permit Valid - NBE Approved"
        );

        // Quality certificate authenticity
        zkManager.addComplianceZKProof(
            testBatchId,
            "QUALITY_CERT",
            _createValidMockGroth16Proof(),
            "Quality Certificate Authentic - SCA Certified"
        );

        // Origin verification
        zkManager.addComplianceZKProof(
            testBatchId,
            "ORIGIN_VERIFICATION",
            _createValidMockGroth16Proof(),
            "Origin Verified - Yirgacheffe Region"
        );

        // BoE forex compliance
        zkManager.addComplianceZKProof(
            testBatchId,
            "BOE_FOREX",
            _createValidMockGroth16Proof(),
            "BoE Forex Compliance - Export Declaration Filed"
        );

        vm.stopPrank();

        console.log("Added Ethiopian compliance proofs");

        // Step 3: Verify Ethiopian compliance
        bool ethiopianCompliant = zkManager.validateCompliance(testBatchId, "ETHIOPIAN");
        assertTrue(ethiopianCompliant, "Batch should be Ethiopian compliant");

        bool hasEthiopianProofs = zkManager.validateCompliance(testBatchId, "ETHIOPIAN");
        assertTrue(hasEthiopianProofs, "Batch should have Ethiopian proofs");

        console.log("Verified Ethiopian compliance status");

        // Step 4: Mint tokens to consumer
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, testBatchId, QUANTITY);
        vm.stopPrank();

        console.log("Minted tokens to consumer");

        // Step 5: Request redemption (Ethiopian compliance required by default)
        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(testBatchId, QUANTITY, "Test Bank Details");
        console.log("Requested redemption:", redemptionId);
        vm.stopPrank();

        // Step 6: Execute complete fiat transfer pipeline
        console.log("Starting fiat transfer pipeline...");

        // Stage 1: Offramp partner initiates transfer
        vm.startPrank(offrampPartner);
        ethiopianCompliance.recordOfframpTransferInitiated(testBatchId, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);
        vm.stopPrank();

        console.log("Recorded offramp transfer initiation");

        // Stage 2: Offramp partner confirms USDC sent
        vm.startPrank(offrampPartner);
        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP,
            "TXN_USDC_SENT_001"
        );
        vm.stopPrank();

        console.log("Confirmed USDC sent to offramp");

        // Stage 3: Offramp partner confirms fiat conversion and sent
        vm.startPrank(offrampPartner);
        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.FIAT_CONVERTED_AND_SENT,
            "TXN_FIAT_CONVERTED_001"
        );
        vm.stopPrank();

        console.log("Confirmed fiat conversion and transfer");

        // Stage 4: Banking partner confirms fiat received
        vm.startPrank(bankingPartner);
        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.FIAT_CONFIRMED_BY_BANK,
            "TXN_BANK_RECEIVED_001"
        );
        vm.stopPrank();

        console.log("Confirmed fiat received by bank");

        // Stage 5: Banking partner confirms seller payment
        vm.startPrank(bankingPartner);
        ethiopianCompliance.confirmSellerPayment(testBatchId, consumer, TOTAL_VALUE, "SELLER_PAYMENT_001");
        vm.stopPrank();

        console.log("Confirmed seller payment");

        // Step 7: Verify complete transfer status
        (
            uint64 sellerId,
            bytes11 offrampSwift,
            bytes11 receivingSwift,
            uint256 usdAmount,
            uint256 usdReceived,
            IEthiopianCompliance.TransferStage currentStage,
            bool sellerPaid
        ) = ethiopianCompliance.getFiatTransfer(testBatchId, consumer);

        assertEq(sellerId, coffeeToken.getSellerId(seller));
        assertEq(offrampSwift, OFFRAMP_SWIFT);
        assertEq(usdAmount, TOTAL_VALUE);
        assertEq(usdReceived, TOTAL_VALUE);
        assertEq(uint8(currentStage), uint8(IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
        assertTrue(sellerPaid);

        console.log("Verified complete transfer pipeline");

        // Step 8: Verify redemption completion
        (
            ,
            ,
            ,
            ,
            WAGACoffeeRedemption.RedemptionStatus redemptionStatus,
            ,
            ,
            bool fiatTransferCompleted,
            ,
        ) = redemption.getEnhancedRedemptionDetails(redemptionId);

        assertEq(uint8(redemptionStatus), uint8(WAGACoffeeRedemption.RedemptionStatus.Requested));
        assertTrue(fiatTransferCompleted);

        console.log("=== Complete Ethiopian Export Workflow Complete ===");
    }

    function testSWIFTBankingIntegration() public {
        console.log("=== Testing SWIFT Banking Integration ===");

        // Step 1: Verify banking partner setup
        (bytes11 swiftCode, string memory bankName, bool canOfframp) = ethiopianCompliance.getBankingPartner(bankingPartner);
        assertEq(swiftCode, BANK_SWIFT);
        assertEq(bankName, "Commercial Bank of Ethiopia");
        assertTrue(canOfframp);

        (bytes11 offrampSwift, string memory offrampName, bool offrampCanOfframp) = ethiopianCompliance.getBankingPartner(offrampPartner);
        assertEq(offrampSwift, OFFRAMP_SWIFT);
        assertEq(offrampName, "Global Offramp Partner");
        assertTrue(offrampCanOfframp);

        console.log("Verified banking partner configurations");

        // Step 2: Test banking capabilities
        IEthiopianCompliance.BankingCapabilities memory capabilities = ethiopianCompliance.getBankingCapabilities(BANK_SWIFT);
        assertEq(capabilities.swiftCode, BANK_SWIFT);
        assertEq(capabilities.bankName, "Commercial Bank of Ethiopia");
        assertTrue(capabilities.canActAsOfframp);
        assertTrue(capabilities.canHandleForexSurrender);
        assertEq(capabilities.maxTransactionAmount, 1000000 * 10**6);

        console.log("Verified banking capabilities");

        // Step 3: Create batch and test transfer with SWIFT codes
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Test Origin",
            "Test Packaging",
            "ipfs://test-batch"
        );
        vm.stopPrank();

        // Step 4: Mint and redeem
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, QUANTITY);
        vm.stopPrank();

        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(batchId, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Step 5: Test SWIFT-based transfer recording
        vm.startPrank(offrampPartner);
        ethiopianCompliance.recordOfframpTransferInitiated(batchId, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);
        vm.stopPrank();

        // Verify SWIFT codes are properly stored
        (
            uint64 sellerId,
            bytes11 storedOfframpSwift,
            bytes11 storedReceivingSwift,
            ,
            ,
            ,
        ) = ethiopianCompliance.getFiatTransfer(batchId, consumer);

        assertEq(storedOfframpSwift, OFFRAMP_SWIFT);
        assertEq(storedReceivingSwift, BANK_SWIFT); // Should be set from banking partner

        console.log("Verified SWIFT code integration in transfers");

        console.log("=== SWIFT Banking Integration Test Complete ===");
    }

    function testMultiStageTransferPipeline() public {
        console.log("=== Testing Multi-Stage Transfer Pipeline ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Test Origin",
            "Test Packaging",
            "ipfs://test-batch"
        );
        vm.stopPrank();

        // Mint and redeem
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, QUANTITY);
        vm.stopPrank();

        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(batchId, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Test each stage of the transfer pipeline
        IEthiopianCompliance.TransferStage[5] memory stages = [
            IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP,
            IEthiopianCompliance.TransferStage.FIAT_CONVERTED_AND_SENT,
            IEthiopianCompliance.TransferStage.FIAT_CONFIRMED_BY_BANK,
            IEthiopianCompliance.TransferStage.SELLER_PAYMENT_INITIATED,
            IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED
        ];

        string[5] memory stageNames = [
            "USDC_SENT_TO_OFFRAMP",
            "FIAT_CONVERTED_AND_SENT",
            "FIAT_CONFIRMED_BY_BANK",
            "SELLER_PAYMENT_INITIATED",
            "SELLER_PAYMENT_CONFIRMED"
        ];

        // Record initial transfer
        vm.startPrank(offrampPartner);
        ethiopianCompliance.recordOfframpTransferInitiated(batchId, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);
        vm.stopPrank();

        console.log("Recorded initial offramp transfer");

        // Execute each stage
        for (uint256 i = 0; i < stages.length; i++) {
            if (i < 2) {
                // First two stages by offramp partner
                vm.startPrank(offrampPartner);
            } else {
                // Last three stages by banking partner
                vm.startPrank(bankingPartner);
            }

            string memory transactionId = string(abi.encodePacked("TXN_", vm.toString(i + 1)));

            if (i == stages.length - 1) {
                // Final stage - seller payment confirmation
                ethiopianCompliance.confirmSellerPayment(batchId, consumer, TOTAL_VALUE, transactionId);
            } else {
                // Regular transfer stage confirmation
                ethiopianCompliance.confirmFiatTransferStage(redemptionId, consumer, stages[i], transactionId);
            }

            vm.stopPrank();

            // Verify stage completion
            (bool stageCompleted, , ) = ethiopianCompliance.getTransferStageStatus(redemptionId, consumer, stages[i]);
            assertTrue(stageCompleted, string(abi.encodePacked("Stage ", stageNames[i], " should be completed")));

            console.log(string(abi.encodePacked("Completed stage: ", stageNames[i])));
        }

        // Verify final state
        (
            ,
            ,
            ,
            ,
            uint256 usdReceived,
            IEthiopianCompliance.TransferStage finalStage,
            bool sellerPaid
        ) = ethiopianCompliance.getFiatTransfer(batchId, consumer);

        assertEq(usdReceived, TOTAL_VALUE);
        assertEq(uint8(finalStage), uint8(IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
        assertTrue(sellerPaid);

        console.log("=== Multi-Stage Transfer Pipeline Test Complete ===");
    }

    function testSellerPaymentTracking() public {
        console.log("=== Testing Seller Payment Tracking ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Test Origin",
            "Test Packaging",
            "ipfs://test-batch"
        );
        vm.stopPrank();

        // Mint and redeem
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, QUANTITY);
        vm.stopPrank();

        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(batchId, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Setup transfer pipeline
        vm.startPrank(offrampPartner);
        ethiopianCompliance.recordOfframpTransferInitiated(batchId, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);
        vm.stopPrank();

        // Test partial payments
        uint256 partialPayment1 = TOTAL_VALUE / 3;
        uint256 partialPayment2 = TOTAL_VALUE / 3;
        uint256 finalPayment = TOTAL_VALUE - partialPayment1 - partialPayment2;

        vm.startPrank(bankingPartner);

        // Partial payment 1
        ethiopianCompliance.confirmSellerPayment(batchId, consumer, partialPayment1, "PARTIAL_1");

        (
            ,
            ,
            ,
            ,
            uint256 usdReceived1,
            ,
            bool sellerPaid1
        ) = ethiopianCompliance.getFiatTransfer(batchId, consumer);

        assertEq(usdReceived1, partialPayment1);
        assertFalse(sellerPaid1); // Not fully paid yet

        console.log("Recorded partial payment 1:", partialPayment1);

        // Partial payment 2
        ethiopianCompliance.confirmSellerPayment(batchId, consumer, partialPayment2, "PARTIAL_2");

        (
            ,
            ,
            ,
            ,
            uint256 usdReceived2,
            ,
            bool sellerPaid2
        ) = ethiopianCompliance.getFiatTransfer(batchId, consumer);

        assertEq(usdReceived2, partialPayment1 + partialPayment2);
        assertFalse(sellerPaid2); // Not fully paid yet

        console.log("Recorded partial payment 2:", partialPayment2);

        // Final payment
        ethiopianCompliance.confirmSellerPayment(batchId, consumer, finalPayment, "FINAL");

        (
            ,
            ,
            ,
            ,
            uint256 usdReceived3,
            IEthiopianCompliance.TransferStage finalStage,
            bool sellerPaid3
        ) = ethiopianCompliance.getFiatTransfer(batchId, consumer);

        assertEq(usdReceived3, TOTAL_VALUE);
        assertEq(uint8(finalStage), uint8(IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
        assertTrue(sellerPaid3);

        console.log("Recorded final payment:", finalPayment);
        console.log("Total received:", usdReceived3);

        vm.stopPrank();

        console.log("=== Seller Payment Tracking Test Complete ===");
    }

    function testEthiopianComplianceFailureScenarios() public {
        console.log("=== Testing Ethiopian Compliance Failure Scenarios ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Test Origin",
            "Test Packaging",
            "ipfs://test-batch"
        );
        vm.stopPrank();

        // Mint tokens
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, QUANTITY);
        vm.stopPrank();

        // Test 1: Redemption fails without Ethiopian compliance proofs
        vm.startPrank(consumer);

        vm.expectRevert("ZK compliance validation failed");
        redemption.requestRedemption(batchId, QUANTITY, "Test Bank Details");

        vm.stopPrank();

        console.log("Verified redemption fails without Ethiopian compliance");

        // Test 2: Partial Ethiopian compliance (missing some proofs)
        vm.startPrank(admin);

        // Add only some proofs
        zkManager.addComplianceZKProof(
            batchId,
            "ECTA_PERMIT",
            _createValidMockGroth16Proof(),
            "ECTA Valid"
        );

        zkManager.addComplianceZKProof(
            batchId,
            "QUALITY_CERT",
            _createValidMockGroth16Proof(),
            "Quality Valid"
        );

        // Missing origin verification and BoE compliance

        vm.stopPrank();

        // Verify partial compliance
        bool ethiopianCompliant = zkManager.validateCompliance(batchId, "ETHIOPIAN");
        assertFalse(ethiopianCompliant, "Should not be fully compliant with missing proofs");

        // Redemption should still fail
        vm.startPrank(consumer);
        vm.expectRevert("ZK compliance validation failed");
        redemption.requestRedemption(batchId, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        console.log("Verified redemption fails with partial Ethiopian compliance");

        // Test 3: Unauthorized transfer stage confirmation
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, QUANTITY); // Mint more tokens
        vm.stopPrank();

        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(batchId, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Setup transfer
        vm.startPrank(offrampPartner);
        ethiopianCompliance.recordOfframpTransferInitiated(batchId, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);
        vm.stopPrank();

        // Try to confirm stage from unauthorized account
        vm.startPrank(consumer); // Not authorized

        vm.expectRevert("Not authorized banking partner");
        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP,
            "UNAUTHORIZED_TXN"
        );

        vm.stopPrank();

        console.log("Verified unauthorized transfer stage confirmation is blocked");

        console.log("=== Ethiopian Compliance Failure Scenarios Test Complete ===");
    }

    /* -------------------------------------------------------------------------- */
    /*                              UTILITY FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Helper function to create valid mock Groth16 proof data (256 bytes)
     * @notice Creates structurally valid proof that will decode properly but fail verification
     * @return 256-byte proof in Groth16 format: point A (64 bytes) + point B (128 bytes) + point C (64 bytes)
     */
    function _createValidMockGroth16Proof() internal pure returns (bytes memory) {
        bytes memory mockProof = new bytes(256);

        // Point A (G1 point: x, y coordinates, 32 bytes each)
        for (uint256 i = 0; i < 64; i++) {
            mockProof[i] = bytes1(uint8(1 + (i % 32)));
        }

        // Point B (G2 point: x1, x2, y1, y2 coordinates, 32 bytes each)
        for (uint256 i = 64; i < 192; i++) {
            mockProof[i] = bytes1(uint8(2 + (i % 32)));
        }

        // Point C (G1 point: x, y coordinates, 32 bytes each)
        for (uint256 i = 192; i < 256; i++) {
            mockProof[i] = bytes1(uint8(3 + (i % 32)));
        }

        return mockProof;
    }
}
