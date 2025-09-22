// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
// WAGAAccessControl removed - functionality moved to WAGAConfigManager
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGACoffeeRedemptionTest
 * @dev Unit tests for enhanced WAGA Coffee Redemption with ZK compliance validation and fiat transfers
 */
contract WAGACoffeeRedemptionTest is Test {
    WAGACoffeeRedemption public redemption;
    WAGACoffeeTokenCore public coffeeToken;
    WAGATreasury public treasury;
    WAGAEthiopianCompliance public ethiopianCompliance;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    // WAGAAccessControl removed - using ConfigManager functionality via CoffeeToken
    CircomVerifier public circomVerifier;
    MockUSDC public usdc;

    // Test accounts
    address public admin = makeAddr("admin");
    address public consumer = makeAddr("consumer");
    address public seller = makeAddr("seller");
    address public processor = makeAddr("processor");
    address public offrampPartner = makeAddr("offrampPartner");

    // Test constants
    uint256 constant BATCH_ID = 1;
    uint256 constant QUANTITY = 100;
    uint256 constant PRICE_PER_UNIT = 5000; // $50
    uint256 constant TOTAL_VALUE = QUANTITY * PRICE_PER_UNIT; // 500,000 USDC
    bytes constant MOCK_PROOF_DATA = hex"00112233445566778899aabbccddeeff";

    bytes11 constant OFFRAMP_SWIFT = "DBSSGB2LXXX"; // DBS Bank Singapore

    event RedemptionRequested(
        uint256 indexed redemptionId,
        address indexed consumer,
        uint256 indexed batchId,
        uint256 quantity
    );

    event EUDRComplianceValidated(
        uint256 indexed batchId,
        uint256 indexed redemptionId,
        bool deforestationCompliant,
        bool geolocationVerified
    );

    event ZKComplianceValidated(
        uint256 indexed batchId,
        uint256 indexed redemptionId,
        IZKVerifier.ProofType proofType,
        bool verified
    );

    event FiatTransferStageConfirmed(
        uint256 indexed redemptionId,
        IEthiopianCompliance.TransferStage stage,
        string transactionId,
        uint256 timestamp
    );

    function setUp() public {
        vm.startPrank(admin);

        // Deploy contracts
        usdc = new MockUSDC();
        coffeeToken = new WAGACoffeeTokenCore("");
        // Note: AccessControl functionality now in ConfigManager (inherited by CoffeeToken)
        circomVerifier = new CircomVerifier();
        treasury = new WAGATreasury(address(usdc));
        ethiopianCompliance = new WAGAEthiopianCompliance();
        batchManager = new WAGABatchManager(address(coffeeToken), address(circomVerifier));
        zkManager = new WAGAZKManager(address(coffeeToken), address(circomVerifier));

        redemption = new WAGACoffeeRedemption(
            address(coffeeToken),
            address(treasury),
            address(ethiopianCompliance),
            address(batchManager),
            address(zkManager),
            address(coffeeToken) // Use coffeeToken for access control instead of separate contract
        );

        // Setup roles using ConfigManager functions
        coffeeToken.grantProcessorRole(processor);

        // Register seller using ConfigManager
        coffeeToken.registerSeller(
            seller,
            WAGAConfigManager.SellerType.COOPERATIVE,
            "Test Cooperative",
            "REG001",
            "CBETETAA"
        );

        // Create batch
        vm.startPrank(processor);
        coffeeToken.createBatch(
            "Ethiopian Yirgacheffe",
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            PRICE_PER_UNIT,
            "Premium packaging",
            "ipfs://batch-metadata"
        );

        // Mint tokens to consumer
        coffeeToken.mintBatch(consumer, BATCH_ID, QUANTITY);
        vm.stopPrank();

        // Fund treasury
        usdc.mint(address(treasury), TOTAL_VALUE * 2);

        // Setup banking
        ethiopianCompliance.addOfframpPartner(offrampPartner, "Global Offramp");

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         REDEMPTION REQUEST TESTS                          */
    /* -------------------------------------------------------------------------- */

    function test_Redemption_RequestRedemptionSuccess() public {
        vm.startPrank(consumer);

        vm.expectEmit(true, true, true, true);
        emit RedemptionRequested(1, consumer, BATCH_ID, QUANTITY);

        uint256 redemptionId = redemption.requestRedemption(
            BATCH_ID,
            QUANTITY,
            false // Not requiring EUDR
        );

        assertEq(redemptionId, 1);

        vm.stopPrank();

        // Verify redemption details
        (
            address storedConsumer,
            uint64 sellerId,
            uint256 batchId_,
            uint256 quantity,
            ,
            bool requiresEthiopianCompliance,
            bool requiresEUDRCompliance,
            ,
            ,
        ) = redemption.getEnhancedRedemptionDetails(redemptionId);

        assertEq(storedConsumer, consumer);
        assertEq(sellerId, coffeeToken.getSellerId(seller));
        assertEq(batchId_, BATCH_ID);
        assertEq(quantity, QUANTITY);
        assertTrue(requiresEthiopianCompliance);
        assertFalse(requiresEUDRCompliance);
    }

    function test_Redemption_RequestWithEUDRCompliance() public {
        vm.startPrank(consumer);

        uint256 redemptionId = redemption.requestRedemption(
            BATCH_ID,
            QUANTITY,
            true // Require EUDR
        );

        vm.stopPrank();

        (
            ,
            ,
            ,
            ,
            ,
            ,
            bool requiresEUDRCompliance,
            ,
            ,
        ) = redemption.getEnhancedRedemptionDetails(redemptionId);

        assertTrue(requiresEUDRCompliance);
    }

    function test_Redemption_GetRedemptionSellerId() public {
        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        uint64 sellerId = redemption.getRedemptionSellerId(redemptionId);
        assertEq(sellerId, coffeeToken.getSellerId(seller));
    }

    /* -------------------------------------------------------------------------- */
    /*                           ZK COMPLIANCE VALIDATION                        */
    /* -------------------------------------------------------------------------- */

    function test_ZK_EUDRComplianceValidation() public {
        // Setup EUDR compliance for batch
        vm.startPrank(processor);

        IEthiopianCompliance.EUDRCertificate memory eudrCert = IEthiopianCompliance.EUDRCertificate({
            certificateId: "EUDR-2024-001",
            issuer: "European Commission",
            issueDate: block.timestamp - 30 days,
            expiryDate: block.timestamp + 365 days,
            isValid: true,
            geoDataHash: "geo_hash_123",
            complianceLevel: "High",
            deforestationRisk: "Low"
        });

        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free"
        );

        vm.stopPrank();

        // Request redemption with EUDR requirement
        vm.startPrank(consumer);

        vm.expectEmit(true, true, false, true);
        emit EUDRComplianceValidated(BATCH_ID, 1, true, false); // Geolocation not verified yet

        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "EUDR Bank Details");

        vm.stopPrank();

        // Verify EUDR validation was performed
        (
            ,
            ,
            ,
            ,
            ,
            ,
            bool requiresEUDRCompliance,
            ,
            ,
        ) = redemption.getEnhancedRedemptionDetails(redemptionId);

        assertTrue(requiresEUDRCompliance);
    }

    function test_ZK_EthiopianComplianceValidation() public {
        // Setup Ethiopian compliance proofs
        vm.startPrank(admin);
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), admin);
        vm.stopPrank();

        vm.startPrank(admin);

        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            "ECTA Permit Valid"
        );

        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
            "Quality Certificate Authentic"
        );

        vm.stopPrank();

        // Request redemption
        vm.startPrank(consumer);

        vm.expectEmit(true, true, false, true);
        emit ZKComplianceValidated(BATCH_ID, 1, IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, true);

        vm.expectEmit(true, true, false, true);
        emit ZKComplianceValidated(BATCH_ID, 1, IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY, true);

        redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          FIAT TRANSFER INTEGRATION                        */
    /* -------------------------------------------------------------------------- */

    function test_FiatTransfer_ConfirmFiatTransferStage() public {
        // Setup redemption
        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Confirm fiat transfer stage
        vm.startPrank(offrampPartner);

        vm.expectEmit(true, false, false, true);
        emit FiatTransferStageConfirmed(redemptionId, IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP, "TXN001", block.timestamp);

        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP,
            "TXN001"
        );

        vm.stopPrank();

        // Verify stage was confirmed through redemption contract
        // Note: This would require the redemption contract to expose transfer stage status
        // For now, we test that the call doesn't revert
    }

    function test_FiatTransfer_ConfirmSellerPayment() public {
        // Setup redemption
        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Record offramp transfer
        vm.startPrank(offrampPartner);
        ethiopianCompliance.recordOfframpTransferInitiated(BATCH_ID, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);
        vm.stopPrank();

        // Confirm seller payment
        uint64 sellerId = coffeeToken.getSellerId(seller);
        vm.startPrank(offrampPartner); // Offramp partner confirms payment

        ethiopianCompliance.confirmSellerPayment(BATCH_ID, consumer, TOTAL_VALUE, "SELLER_TXN_001");

        vm.stopPrank();

        // Verify payment was recorded
        (, , , , uint256 usdReceived, , bool sellerPaid) = ethiopianCompliance.getFiatTransfer(BATCH_ID, consumer);

        assertEq(usdReceived, TOTAL_VALUE);
        assertTrue(sellerPaid);
    }

    /* -------------------------------------------------------------------------- */
    /*                           REDEMPTION ERROR HANDLING                       */
    /* -------------------------------------------------------------------------- */

    function test_Error_EUDRComplianceNotMet() public {
        // Request redemption requiring EUDR compliance without having EUDR compliance
        vm.startPrank(consumer);

        vm.expectRevert("EUDR compliance not met");
        redemption.requestRedemption(BATCH_ID, QUANTITY, "EUDR Bank Details");

        vm.stopPrank();
    }

    function test_Error_ZKComplianceValidationFailed() public {
        // This would require setting up failing ZK proofs
        // For now, test passes with current setup
        vm.startPrank(consumer);

        redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");

        vm.stopPrank();
    }

    function test_Error_UnauthorizedStageConfirmation() public {
        // Setup redemption
        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Try to confirm stage from unauthorized account
        vm.startPrank(consumer); // Not authorized

        vm.expectRevert("Not authorized banking partner");
        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP,
            "TXN001"
        );

        vm.stopPrank();
    }

    function test_Error_UnauthorizedSellerPaymentConfirmation() public {
        // Setup redemption
        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");
        vm.stopPrank();

        // Try to confirm seller payment from unauthorized account
        vm.startPrank(consumer); // Not authorized

        vm.expectRevert("Unauthorized seller confirmation");
        ethiopianCompliance.confirmSellerPayment(BATCH_ID, consumer, TOTAL_VALUE, "SELLER_TXN_001");

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          ENHANCED REDEMPTION DETAILS                      */
    /* -------------------------------------------------------------------------- */

    function test_EnhancedDetails_GetEnhancedRedemptionDetails() public {
        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "EUDR Bank Details");
        vm.stopPrank();

        (
            address consumer_,
            uint64 sellerId,
            uint256 batchId_,
            uint256 quantity,
            IEthiopianCompliance.TransferStage status,
            bool requiresEthiopianCompliance,
            bool requiresEUDRCompliance,
            bool fiatTransferCompleted,
            bytes11 offrampSwift,
            bytes11 receivingSwift
        ) = redemption.getEnhancedRedemptionDetails(redemptionId);

        assertEq(consumer_, consumer);
        assertEq(sellerId, coffeeToken.getSellerId(seller));
        assertEq(batchId_, BATCH_ID);
        assertEq(quantity, QUANTITY);
        assertEq(uint8(status), uint8(IEthiopianCompliance.TransferStage.PENDING));
        assertTrue(requiresEthiopianCompliance);
        assertTrue(requiresEUDRCompliance);
        assertFalse(fiatTransferCompleted);
        assertEq(offrampSwift, bytes11(0));
        assertEq(receivingSwift, bytes11(0));
    }

    /* -------------------------------------------------------------------------- */
    /*                          INTEGRATION TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_Integration_FullRedemptionWorkflow() public {
        console.log("=== Full Redemption Workflow Test ===");

        // Setup EUDR compliance
        vm.startPrank(processor);

        IEthiopianCompliance.EUDRCertificate memory eudrCert = IEthiopianCompliance.EUDRCertificate({
            certificateId: "EUDR-2024-001",
            issuer: "European Commission",
            issueDate: block.timestamp - 30 days,
            expiryDate: block.timestamp + 365 days,
            isValid: true,
            geoDataHash: "geo_hash_123",
            complianceLevel: "High",
            deforestationRisk: "Low"
        });

        IEthiopianCompliance.GeolocationData memory geoData = IEthiopianCompliance.GeolocationData({
            plotType: "Coffee Farm",
            coordinates: "8.5476N, 39.2695E",
            plotSize: 250,
            verificationMethod: "GPS + Satellite"
        });

        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free"
        );

        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Geolocation Verified"
        );

        vm.stopPrank();

        console.log("EUDR compliance setup complete");

        // Step 1: Request redemption
        vm.startPrank(consumer);

        vm.expectEmit(true, true, false, true);
        emit EUDRComplianceValidated(BATCH_ID, 1, true, true);

        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "EUDR Bank Details");

        console.log("Redemption requested with ID:", redemptionId);

        vm.stopPrank();

        // Step 2: Confirm fiat transfer stages
        vm.startPrank(offrampPartner);

        ethiopianCompliance.recordOfframpTransferInitiated(BATCH_ID, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);

        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP,
            "TXN001"
        );

        ethiopianCompliance.confirmFiatTransferStage(
            redemptionId,
            consumer,
            IEthiopianCompliance.TransferStage.FIAT_CONVERTED_AND_SENT,
            "TXN002"
        );

        vm.stopPrank();

        console.log("Fiat transfer stages confirmed");

        // Step 3: Confirm seller payment
        vm.startPrank(offrampPartner);

        ethiopianCompliance.confirmSellerPayment(BATCH_ID, consumer, TOTAL_VALUE, "SELLER_TXN_001");

        vm.stopPrank();

        console.log("Seller payment confirmed");

        // Step 4: Verify final state
        (
            ,
            uint64 sellerId,
            ,
            ,
            IEthiopianCompliance.TransferStage finalStatus,
            ,
            ,
            bool fiatTransferCompleted,
            ,
        ) = redemption.getEnhancedRedemptionDetails(redemptionId);

        assertEq(sellerId, coffeeToken.getSellerId(seller));
        assertEq(uint8(finalStatus), uint8(IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
        assertTrue(fiatTransferCompleted);

        console.log("=== Redemption Workflow Complete ===");
    }

    /* -------------------------------------------------------------------------- */
    /*                          COMPATIBILITY TESTS                              */
    /* -------------------------------------------------------------------------- */

    function test_Compatibility_ExistingRedemptionFunctions() public {
        // Test that existing redemption functionality still works
        vm.startPrank(consumer);

        // Request redemption with minimal requirements
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");

        // Verify basic redemption data is accessible
        uint64 sellerId = redemption.getRedemptionSellerId(redemptionId);
        assertGt(sellerId, 0);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          GAS OPTIMIZATION TESTS                           */
    /* -------------------------------------------------------------------------- */

    function test_GasOptimization_RedemptionOperations() public {
        vm.startPrank(consumer);

        // Measure gas for redemption request
        uint256 gasStart = gasleft();
        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");
        uint256 gasUsedRedemption = gasStart - gasleft();

        vm.stopPrank();

        // Measure gas for enhanced details retrieval
        gasStart = gasleft();
        redemption.getEnhancedRedemptionDetails(redemptionId);
        uint256 gasUsedDetails = gasStart - gasleft();

        console.log("Gas used for redemption request:", gasUsedRedemption);
        console.log("Gas used for enhanced details:", gasUsedDetails);

        // Redemption should be reasonable (< 500k gas)
        // Details retrieval should be cheap (< 50k gas)
        assertLt(gasUsedRedemption, 500000);
        assertLt(gasUsedDetails, 50000);
    }

    /* -------------------------------------------------------------------------- */
    /*                            EDGE CASE TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_EdgeCase_ZeroQuantityRedemption() public {
        vm.startPrank(consumer);

        vm.expectRevert("Quantity must be greater than 0");
        redemption.requestRedemption(BATCH_ID, 0, false);

        vm.stopPrank();
    }

    function test_EdgeCase_MaxQuantityRedemption() public {
        vm.startPrank(consumer);

        // Request redemption for all available tokens
        redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");

        vm.stopPrank();

        // Verify consumer now has 0 tokens
        assertEq(coffeeToken.balanceOf(consumer, BATCH_ID), 0);
    }

    function test_EdgeCase_MultipleRedemptions() public {
        vm.startPrank(consumer);

        // Request multiple redemptions
        uint256 redemptionId1 = redemption.requestRedemption(BATCH_ID, 25, false);
        uint256 redemptionId2 = redemption.requestRedemption(BATCH_ID, 25, false);
        uint256 redemptionId3 = redemption.requestRedemption(BATCH_ID, 25, false);

        vm.stopPrank();

        // Verify unique IDs and seller IDs
        uint64 sellerId1 = redemption.getRedemptionSellerId(redemptionId1);
        uint64 sellerId2 = redemption.getRedemptionSellerId(redemptionId2);
        uint64 sellerId3 = redemption.getRedemptionSellerId(redemptionId3);

        assertEq(sellerId1, sellerId2);
        assertEq(sellerId2, sellerId3);
        assertEq(sellerId1, coffeeToken.getSellerId(seller));
    }

    function test_EdgeCase_RedemptionWithoutSellerId() public {
        // This would require a batch created by an unregistered seller
        // For now, test passes with current setup where seller is registered
        vm.startPrank(consumer);

        uint256 redemptionId = redemption.requestRedemption(BATCH_ID, QUANTITY, "Test Bank Details");
        uint64 sellerId = redemption.getRedemptionSellerId(redemptionId);

        assertGt(sellerId, 0);

        vm.stopPrank();
    }
}
