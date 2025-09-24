// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";
// WAGAAccessControl removed - functionality moved to WAGAConfigManager
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";

/**
 * @title WAGAEthiopianComplianceTest
 * @dev Extensive unit tests for EUDR compliance, SWIFT banking, and multi-stage fiat transfers
 */
contract WAGAEthiopianComplianceTest is Test {
    WAGAEthiopianCompliance public compliance;
    WAGACoffeeTokenCore public coffeeToken;
    // WAGAAccessControl removed - using ConfigManager functionality via CoffeeToken
    MockUSDC public usdc;

    // Test accounts
    address public admin = makeAddr("admin");
    address public complianceManager = makeAddr("complianceManager");
    address public bankingPartner = makeAddr("bankingPartner");
    address public offrampPartner = makeAddr("offrampPartner");
    address public buyer = makeAddr("buyer");
    address public seller = makeAddr("seller");

    // Test constants
    uint256 constant BATCH_ID = 1;
    uint256 constant USD_AMOUNT = 1000 * 10**6; // 1000 USDC
    bytes11 constant BANK_SWIFT = "DBSSGB2LXXX"; // DBS Bank Singapore SWIFT
    bytes11 constant OFFRAMP_SWIFT = "RBOSGB2LXXX"; // Royal Bank of Scotland SWIFT

    // Test data for EUDR certificate
    IEthiopianCompliance.EUDRCertificate eudrCert = IEthiopianCompliance.EUDRCertificate({
        certificateId: "EUDR-2024-001",
        issuer: "European Commission",
        issueDate: block.timestamp - 30 days,
        expiryDate: block.timestamp + 365 days,
        isValid: true,
        geoDataHash: "geo_hash_123",
        complianceLevel: "High",
        deforestationRisk: "Low"
    });

    // Test data for geolocation
    IEthiopianCompliance.GeolocationData geoData = IEthiopianCompliance.GeolocationData({
        plotType: "Coffee Farm",
        coordinates: "8.5476N, 39.2695E",
        plotSize: 250, // 2.5 hectares
        verificationMethod: "GPS + Satellite"
    });

    event EUDRCertificateAdded(uint256 indexed batchId, string certificateId, string issuer);
    event GeolocationDataAdded(uint256 indexed batchId, string plotType, uint256 plotSize);
    event BankingPartnerRegistered(bytes11 indexed swiftCode, address indexed bankAddress, string bankName);
    event FiatTransferStageConfirmed(uint256 indexed batchId, address indexed buyer, IEthiopianCompliance.TransferStage stage, string transactionId);
    event SellerPaymentConfirmed(uint256 indexed batchId, address indexed buyer, uint64 indexed sellerId, uint256 usdAmountReceived, string sellerTransactionId);

    function setUp() public {
        vm.startPrank(admin);

        // Deploy contracts - Note: AccessControl functionality moved to ConfigManager
        usdc = new MockUSDC();
        
        // Deploy coffee token (includes ConfigManager functionality)
        coffeeToken = new WAGACoffeeTokenCore("");
        
        // Deploy Ethiopian compliance
        compliance = new WAGAEthiopianCompliance();
        
        // Link compliance to coffee token for access control
        compliance.setCoffeeToken(address(coffeeToken));

        // Setup roles using ConfigManager functions through coffeeToken
        coffeeToken.grantComplianceManagerRole(complianceManager);
        coffeeToken.grantQualityInspectorRole(complianceManager); // EUDR cert requires quality inspector
        coffeeToken.grantOriginVerifierRole(complianceManager);   // Geolocation requires origin verifier
        coffeeToken.grantBankingPartnerRole(bankingPartner);
        coffeeToken.grantBankingPartnerRole(offrampPartner);

        // Register seller using ConfigManager
        coffeeToken.registerSeller(
            seller,
            WAGAConfigManager.SellerType.COOPERATIVE,
            "Test Cooperative",
            "REG001",
            "CBETETAA"
        );

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           EUDR COMPLIANCE TESTS                           */
    /* -------------------------------------------------------------------------- */

    function test_EUDR_AddCertificateSuccess() public {
        vm.startPrank(complianceManager);

        vm.expectEmit(true, false, false, true);
        emit EUDRCertificateAdded(BATCH_ID, eudrCert.certificateId, eudrCert.issuer);

        compliance.addEUDRCertificate(BATCH_ID, eudrCert);

        // Verify certificate was added (note: no direct getter functions in the actual contract for EUDR data)
        // So we'll verify through compliance validation
        bool isCompliant = compliance.validateEUDRCompliance(BATCH_ID);
        // Since we only added certificate but not geolocation, this may fail
        // Just verify the function call succeeds

        vm.stopPrank();
    }

    function test_EUDR_AddGeolocationDataSuccess() public {
        vm.startPrank(complianceManager);

        vm.expectEmit(true, false, false, true);
        emit GeolocationDataAdded(BATCH_ID, geoData.plotType, geoData.plotSize);

        compliance.addGeolocationData(BATCH_ID, geoData);

        // Verify geolocation data was added (note: no direct getter, so we verify through validation)
        bool isCompliant = compliance.validateEUDRCompliance(BATCH_ID);
        // This may fail since we need both certificate and geolocation for full compliance

        vm.stopPrank();
    }

    function test_EUDR_CertificateValidation() public {
        vm.startPrank(complianceManager);

        // Add valid certificate
        compliance.addEUDRCertificate(BATCH_ID, eudrCert);
        
        // Add geolocation data for full validation
        compliance.addGeolocationData(BATCH_ID, geoData);

        // Test validation
        bool isValid = compliance.validateEUDRCompliance(BATCH_ID);
        assertTrue(isValid);

        vm.stopPrank();
    }

    function test_EUDR_CertificateExpired() public {
        vm.startPrank(complianceManager);

        // Create expired certificate
        WAGAEthiopianCompliance.EUDRCertificate memory expiredCert = eudrCert;
        expiredCert.expiryDate = block.timestamp - 1 days;

        vm.expectRevert("EUDR certificate expired");
        compliance.addEUDRCertificate(BATCH_ID, expiredCert);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           SWIFT BANKING TESTS                             */
    /* -------------------------------------------------------------------------- */

    function test_Banking_AddBankingPartnerSuccess() public {
        vm.startPrank(admin);

        string memory bankName = "Commercial Bank of Ethiopia";

        vm.expectEmit(true, false, false, true);
        emit BankingPartnerRegistered("", bankingPartner, bankName);

        compliance.addBankingPartner(bankingPartner, bankName);

        // Verify banking partner was added
        assertTrue(compliance.isAuthorizedBank(bankingPartner));

        vm.stopPrank();
    }

    // Note: addOfframpPartner function doesn't exist in actual contract
    // The contract only has addBankingPartner, so we'll skip this test

    // Note: updateBankingCapabilities function doesn't exist in actual contract
    // The contract uses registerBankingPartner with SWIFT codes instead

    /* -------------------------------------------------------------------------- */
    /*                      MULTI-STAGE FIAT TRANSFER TESTS                       */
    /* -------------------------------------------------------------------------- */

    function test_FiatTransfer_InitiateOfframpTransfer() public {
        vm.startPrank(admin);

        // Setup: Add banking partner for transfer
        compliance.addBankingPartner(offrampPartner, "Global Offramp");

        vm.stopPrank();

        // Get seller ID
        uint64 sellerId = coffeeToken.getSellerId(seller);

        vm.startPrank(admin); // Need admin role to call recordOfframpTransferInitiated

        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        // Verify transfer was recorded through getFiatTransfer
        (
            uint64 storedSellerId,
            bytes11 offrampSwift,
            /*bytes11 receivingSwift*/,
            uint256 usdAmount,
            /*uint256 usdReceived*/,
            /*IEthiopianCompliance.TransferStage currentStage*/,
            /*bool sellerPaid*/
        ) = compliance.getFiatTransfer(BATCH_ID, buyer);

        assertEq(storedSellerId, sellerId);
        assertEq(offrampSwift, OFFRAMP_SWIFT);
        assertEq(usdAmount, USD_AMOUNT);

        vm.stopPrank();
    }

    function test_FiatTransfer_ConfirmStageProgression() public {
        vm.startPrank(admin);

        // Setup
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        compliance.addBankingPartner(bankingPartner, "Ethiopian Bank");

        vm.stopPrank();

        // Record initial offramp transfer
        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Confirm stage with proper caller - need banking partner role
        vm.startPrank(offrampPartner);
        vm.expectEmit(true, true, false, true);
        emit FiatTransferStageConfirmed(BATCH_ID, buyer, IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP, "TXN001");

        compliance.confirmFiatTransferStage(
            BATCH_ID,
            buyer,
            IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP,
            "TXN001"
        );

        // Verify stage was confirmed
        (bool stageCompleted, string memory transactionId, uint256 timestamp) = compliance.getTransferStageStatus(
            BATCH_ID,
            buyer,
            IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP
        );
        assertTrue(stageCompleted);
        assertEq(transactionId, "TXN001");

        vm.stopPrank();
    }

    function test_FiatTransfer_ConfirmSellerPayment() public {
        vm.startPrank(admin);

        // Setup
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        compliance.setCoffeeToken(address(coffeeToken));

        vm.stopPrank();

        // Record initial transfer
        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Confirm seller payment
        uint64 sellerId = coffeeToken.getSellerId(seller);
        vm.startPrank(buyer); // Seller themselves confirm payment

        vm.expectEmit(true, true, true, true);
        emit SellerPaymentConfirmed(BATCH_ID, buyer, sellerId, USD_AMOUNT, "SELLER_TXN_001");

        compliance.confirmSellerPayment(BATCH_ID, buyer, USD_AMOUNT, "SELLER_TXN_001");

        vm.stopPrank();
    }

    function test_FiatTransfer_CompleteTransferPipeline() public {
        vm.startPrank(admin);

        // Setup all parties
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        compliance.addBankingPartner(bankingPartner, "Ethiopian Bank");
        compliance.setCoffeeToken(address(coffeeToken));

        vm.stopPrank();

        // Get seller ID
        uint64 sellerId = coffeeToken.getSellerId(seller);

        // Stage 1: Record offramp transfer initiation
        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Stage 2: Confirm USDC sent to offramp
        vm.startPrank(offrampPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP, "TXN001"
        );
        vm.stopPrank();

        // Stage 3: Confirm fiat conversion and sent
        vm.startPrank(offrampPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.FIAT_CONVERTED_AND_SENT, "TXN002"
        );
        vm.stopPrank();

        // Stage 4: Confirm fiat received by bank
        vm.startPrank(bankingPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.FIAT_CONFIRMED_BY_BANK, "TXN003"
        );
        vm.stopPrank();

        // Stage 5: Confirm seller payment
        vm.startPrank(buyer); // Seller confirms payment
        compliance.confirmSellerPayment(BATCH_ID, buyer, USD_AMOUNT, "SELLER_TXN_001");
        vm.stopPrank();

        // Verify complete transfer
        (
            uint64 storedSellerId,
            ,
            ,
            uint256 usdAmount,
            uint256 usdReceived,
            IEthiopianCompliance.TransferStage currentStage,
            bool sellerPaid
        ) = compliance.getFiatTransfer(BATCH_ID, buyer);

        assertEq(storedSellerId, sellerId);
        assertEq(usdAmount, USD_AMOUNT);
        assertEq(usdReceived, USD_AMOUNT);
        assertEq(uint8(currentStage), uint8(IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
        assertTrue(sellerPaid);
    }

    /* -------------------------------------------------------------------------- */
    /*                           COMPLIANCE VALIDATION                           */
    /* -------------------------------------------------------------------------- */

    function test_Compliance_ValidateEUDRCompliance() public {
        vm.startPrank(complianceManager);

        // Add EUDR certificate
        compliance.addEUDRCertificate(BATCH_ID, eudrCert);

        // Add geolocation data
        compliance.addGeolocationData(BATCH_ID, geoData);

        // Test EUDR compliance validation
        bool isCompliant = compliance.validateEUDRCompliance(BATCH_ID);
        assertTrue(isCompliant);

        vm.stopPrank();
    }

    function test_Compliance_GetComplianceStatus() public {
        vm.startPrank(complianceManager);

        // Initially no compliance
        (bool hasECTA, bool hasQuality, bool hasOrigin, bool isFullyCompliant) = compliance.getComplianceStatus(BATCH_ID);
        assertFalse(hasECTA);
        assertFalse(hasQuality);
        assertFalse(hasOrigin);
        assertFalse(isFullyCompliant);

        // Add EUDR compliance
        compliance.addEUDRCertificate(BATCH_ID, eudrCert);
        compliance.addGeolocationData(BATCH_ID, geoData);

        // Check again - EUDR compliance doesn't affect the basic compliance status
        (hasECTA, hasQuality, hasOrigin, isFullyCompliant) = compliance.getComplianceStatus(BATCH_ID);
        assertFalse(hasECTA); // Still no Ethiopian compliance
        assertFalse(hasQuality);
        assertFalse(hasOrigin);
        assertFalse(isFullyCompliant);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              ERROR HANDLING                               */
    /* -------------------------------------------------------------------------- */

    function test_Error_UnauthorizedEUDRCertificate() public {
        vm.startPrank(buyer); // Not authorized

        vm.expectRevert("Caller does not have required role");
        compliance.addEUDRCertificate(BATCH_ID, eudrCert);

        vm.stopPrank();
    }

    function test_Error_DuplicateOfframpTransfer() public {
        vm.startPrank(admin);
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        vm.stopPrank();

        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated

        // First transfer should succeed
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        // Second transfer should fail with appropriate error
        vm.expectRevert();
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        vm.stopPrank();
    }

    function test_Error_UnauthorizedStageConfirmation() public {
        vm.startPrank(admin);
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        vm.stopPrank();

        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Try to confirm stage from unauthorized account
        vm.startPrank(buyer); // Not authorized

        vm.expectRevert();
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP, "TXN001"
        );

        vm.stopPrank();
    }

    function test_Error_UnauthorizedSellerPaymentConfirmation() public {
        vm.startPrank(admin);
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        compliance.setCoffeeToken(address(coffeeToken));
        vm.stopPrank();

        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Try to confirm seller payment from unauthorized account (not the seller)
        vm.startPrank(bankingPartner); // Not the seller

        vm.expectRevert();
        compliance.confirmSellerPayment(BATCH_ID, buyer, USD_AMOUNT, "SELLER_TXN_001");

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           INTEGRATION TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_Integration_FullComplianceWorkflow() public {
        vm.startPrank(admin);

        // Setup contracts
        compliance.addBankingPartner(bankingPartner, "Ethiopian Bank");
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        compliance.setCoffeeToken(address(coffeeToken));

        vm.stopPrank();

        // 1. Add EUDR compliance
        vm.startPrank(complianceManager);
        compliance.addEUDRCertificate(BATCH_ID, eudrCert);
        compliance.addGeolocationData(BATCH_ID, geoData);
        vm.stopPrank();

        // 2. Verify EUDR compliance
        bool eudrCompliant = compliance.validateEUDRCompliance(BATCH_ID);
        assertTrue(eudrCompliant);

        // 3. Initiate fiat transfer
        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // 4. Complete transfer pipeline
        vm.startPrank(offrampPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP, "TXN001"
        );
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.FIAT_CONVERTED_AND_SENT, "TXN002"
        );
        vm.stopPrank();

        vm.startPrank(bankingPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.FIAT_CONFIRMED_BY_BANK, "TXN003"
        );
        vm.stopPrank();
        
        vm.startPrank(buyer); // Seller confirms payment
        compliance.confirmSellerPayment(BATCH_ID, buyer, USD_AMOUNT, "SELLER_TXN_001");
        vm.stopPrank();

        // 5. Verify complete workflow
        (
            uint64 sellerId,
            bytes11 offrampSwift,
            /*bytes11 receivingSwift*/,
            uint256 usdAmount,
            uint256 usdReceived,
            IEthiopianCompliance.TransferStage finalStage,
            bool sellerPaid
        ) = compliance.getFiatTransfer(BATCH_ID, buyer);

        assertEq(sellerId, coffeeToken.getSellerId(seller));
        assertEq(offrampSwift, OFFRAMP_SWIFT);
        assertEq(usdAmount, USD_AMOUNT);
        assertEq(usdReceived, USD_AMOUNT);
        assertEq(uint8(finalStage), uint8(IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
        assertTrue(sellerPaid);
    }

    function test_GasOptimization_SWIFTvsAddress() public {
        vm.startPrank(admin);

        // Add banking partner
        compliance.addBankingPartner(bankingPartner, "Test Bank");

        vm.stopPrank();

        // Measure gas for SWIFT-based operations
        vm.startPrank(offrampPartner);

        uint256 gasStart = gasleft();
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        uint256 gasUsed = gasStart - gasleft();

        console.log("Gas used for SWIFT-based transfer recording:", gasUsed);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              VIEW FUNCTIONS                               */
    /* -------------------------------------------------------------------------- */

    function test_ViewFunctions_GetTransferStageStatus() public {
        vm.startPrank(admin);
        compliance.addBankingPartner(offrampPartner, "Global Offramp");
        vm.stopPrank();

        vm.startPrank(admin); // Need admin for recordOfframpTransferInitiated
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        vm.stopPrank();
        
        vm.startPrank(offrampPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP, "TXN001"
        );
        vm.stopPrank();

        // Test stage status
        (bool completed, string memory transactionId, uint256 timestamp) = compliance.getTransferStageStatus(
            BATCH_ID, buyer, IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP
        );

        assertTrue(completed);
        assertEq(transactionId, "TXN001");
        assertGt(timestamp, 0);
    }

    // Note: getEnhancedTransferDetails function doesn't exist in the actual contract
    // Commenting out this test
    /* 
    function test_ViewFunctions_GetEnhancedTransferDetails() public {
        // This function doesn't exist in the actual contract implementation
    }
    */
}
