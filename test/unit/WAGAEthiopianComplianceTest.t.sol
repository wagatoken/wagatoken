// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
// WAGAAccessControl removed - functionality moved to WAGAConfigManager
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

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
    WAGAEthiopianCompliance.EUDRCertificate eudrCert = WAGAEthiopianCompliance.EUDRCertificate({
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
    WAGAEthiopianCompliance.GeolocationData geoData = WAGAEthiopianCompliance.GeolocationData({
        plotType: "Coffee Farm",
        coordinates: "8.5476N, 39.2695E",
        plotSize: 250, // 2.5 hectares
        verificationMethod: "GPS + Satellite"
    });

    event EUDRCertificateAdded(uint256 indexed batchId, string certificateId, string issuer);
    event GeolocationDataAdded(uint256 indexed batchId, string plotType, uint256 plotSize);
    event BankingPartnerRegistered(bytes11 indexed swiftCode, string bankName, bool canOfframp);
    event FiatTransferStageConfirmed(uint256 indexed batchId, WAGAEthiopianCompliance.TransferStage stage, string transactionId, uint256 timestamp);
    event SellerPaymentConfirmed(uint256 indexed batchId, uint64 indexed sellerId, uint256 usdAmountReceived, string sellerTransactionId);

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

        // Setup roles using ConfigManager functions
        coffeeToken.grantComplianceManagerRole(complianceManager);
        coffeeToken.grantBankingPartnerRole(bankingPartner);
        coffeeToken.grantBankingPartnerRole(offrampPartner);

        // Register seller using ConfigManager
        coffeeToken.registerSeller(
            seller,
            WAGACoffeeTokenCore.SellerType.COOPERATIVE,
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

        // Verify certificate was added
        (
            string memory certId,
            string memory issuer,
            uint256 issueDate,
            uint256 expiryDate,
            bool isValid,
            string memory geoHash,
            string memory complianceLevel,
            string memory deforestationRisk
        ) = compliance.getEUDRCertificate(BATCH_ID);

        assertEq(certId, eudrCert.certificateId);
        assertEq(issuer, eudrCert.issuer);
        assertEq(issueDate, eudrCert.issueDate);
        assertEq(expiryDate, eudrCert.expiryDate);
        assertTrue(isValid);
        assertEq(geoHash, eudrCert.geoDataHash);
        assertEq(complianceLevel, eudrCert.complianceLevel);
        assertEq(deforestationRisk, eudrCert.deforestationRisk);

        vm.stopPrank();
    }

    function test_EUDR_AddGeolocationDataSuccess() public {
        vm.startPrank(complianceManager);

        vm.expectEmit(true, false, false, true);
        emit GeolocationDataAdded(BATCH_ID, geoData.plotType, geoData.plotSize);

        compliance.addGeolocationData(BATCH_ID, geoData);

        // Verify geolocation data was added
        (
            string memory plotType,
            string memory coordinates,
            uint256 plotSize,
            string memory verificationMethod
        ) = compliance.getGeolocationData(BATCH_ID);

        assertEq(plotType, geoData.plotType);
        assertEq(coordinates, geoData.coordinates);
        assertEq(plotSize, geoData.plotSize);
        assertEq(verificationMethod, geoData.verificationMethod);

        vm.stopPrank();
    }

    function test_EUDR_CertificateValidation() public {
        vm.startPrank(complianceManager);

        // Add valid certificate
        compliance.addEUDRCertificate(BATCH_ID, eudrCert);

        // Test validation
        bool isValid = compliance.validateEUDRCertificate(BATCH_ID);
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

        bytes11 swiftCode = "CBETETAAXXX"; // Commercial Bank of Ethiopia
        string memory bankName = "Commercial Bank of Ethiopia";

        vm.expectEmit(true, false, false, true);
        emit BankingPartnerRegistered(swiftCode, bankName, false);

        compliance.addBankingPartner(bankingPartner, bankName);

        // Verify banking partner was added
        (bytes11 storedSwift, string memory storedName, bool canOfframp) = compliance.getBankingPartner(bankingPartner);
        assertEq(storedSwift, swiftCode);
        assertEq(storedName, bankName);
        assertFalse(canOfframp);

        assertTrue(compliance.isAuthorizedBank(bankingPartner));

        vm.stopPrank();
    }

    function test_Banking_AddOfframpPartnerSuccess() public {
        vm.startPrank(admin);

        bytes11 swiftCode = "CHASUS33XXX"; // JPMorgan Chase
        string memory bankName = "JPMorgan Chase";

        vm.expectEmit(true, false, false, true);
        emit BankingPartnerRegistered(swiftCode, bankName, true);

        compliance.addOfframpPartner(offrampPartner, bankName);

        // Verify offramp partner was added
        (bytes11 storedSwift, string memory storedName, bool canOfframp) = compliance.getBankingPartner(offrampPartner);
        assertEq(storedSwift, swiftCode);
        assertEq(storedName, bankName);
        assertTrue(canOfframp);

        assertTrue(compliance.isAuthorizedBank(offrampPartner));

        vm.stopPrank();
    }

    function test_Banking_UpdateBankingCapabilities() public {
        vm.startPrank(admin);

        // Add banking partner
        compliance.addBankingPartner(bankingPartner, "Test Bank");

        // Update capabilities
        IEthiopianCompliance.BankingCapabilities memory capabilities = IEthiopianCompliance.BankingCapabilities({
            swiftCode: "TESTETXXXXX",
            bankName: "Updated Test Bank",
            country: "Ethiopia",
            canOfframp: true,
            canReceiveFiat: true,
            supportedCurrencies: "ETB,USD,EUR",
            dailyLimit: 100000 * 10**6, // 100k USD
            isActive: true,
            regulatoryApproval: "NBE-2024-001"
        });

        compliance.updateBankingCapabilities(bankingPartner, capabilities);

        // Verify capabilities were updated
        IEthiopianCompliance.BankingCapabilities memory stored = compliance.getBankingCapabilities(bankingPartner);
        assertEq(stored.swiftCode, capabilities.swiftCode);
        assertEq(stored.bankName, capabilities.bankName);
        assertTrue(stored.canOfframp);
        assertTrue(stored.canReceiveFiat);
        assertEq(stored.country, "Ethiopia");

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                      MULTI-STAGE FIAT TRANSFER TESTS                       */
    /* -------------------------------------------------------------------------- */

    function test_FiatTransfer_InitiateOfframpTransfer() public {
        vm.startPrank(admin);

        // Setup: Add offramp partner and record offramp transfer
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");

        vm.stopPrank();

        // Get seller ID
        uint64 sellerId = coffeeToken.getSellerId(seller);

        vm.startPrank(offrampPartner);

        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        // Verify transfer was recorded
        (
            uint64 storedSellerId,
            bytes11 offrampSwift,
            bytes11 receivingSwift,
            uint256 usdAmount,
            uint256 usdReceived,
            WAGAEthiopianCompliance.TransferStage currentStage,
            bool sellerPaid
        ) = compliance.getFiatTransfer(BATCH_ID, buyer);

        assertEq(storedSellerId, sellerId);
        assertEq(offrampSwift, OFFRAMP_SWIFT);
        assertEq(usdAmount, USD_AMOUNT);
        assertEq(uint8(currentStage), uint8(WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP));

        vm.stopPrank();
    }

    function test_FiatTransfer_ConfirmStageProgression() public {
        vm.startPrank(admin);

        // Setup
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        compliance.addBankingPartner(bankingPartner, "Ethiopian Bank");

        vm.stopPrank();

        // Record initial offramp transfer
        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Confirm USDC sent to offramp
        vm.startPrank(offrampPartner);
        vm.expectEmit(true, false, false, true);
        emit FiatTransferStageConfirmed(BATCH_ID, WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP, "TXN001", block.timestamp);

        compliance.confirmFiatTransferStage(
            BATCH_ID,
            buyer,
            WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP,
            "TXN001"
        );

        // Verify stage was confirmed
        bool stageCompleted = compliance.getTransferStageStatus(
            BATCH_ID,
            buyer,
            WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP
        );
        assertTrue(stageCompleted);

        vm.stopPrank();
    }

    function test_FiatTransfer_ConfirmSellerPayment() public {
        vm.startPrank(admin);

        // Setup
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        compliance.setAccessControl(address(accessControl));

        vm.stopPrank();

        // Record initial transfer
        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Confirm seller payment
        uint64 sellerId = coffeeToken.getSellerId(seller);
        vm.startPrank(bankingPartner); // Banking partner confirms payment

        vm.expectEmit(true, true, false, true);
        emit SellerPaymentConfirmed(BATCH_ID, sellerId, USD_AMOUNT, "SELLER_TXN_001");

        compliance.confirmSellerPayment(BATCH_ID, buyer, USD_AMOUNT, "SELLER_TXN_001");

        vm.stopPrank();
    }

    function test_FiatTransfer_CompleteTransferPipeline() public {
        vm.startPrank(admin);

        // Setup all parties
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        compliance.addBankingPartner(bankingPartner, "Ethiopian Bank");
        compliance.setAccessControl(address(accessControl));

        vm.stopPrank();

        // Get seller ID
        uint64 sellerId = coffeeToken.getSellerId(seller);

        // Stage 1: Record offramp transfer initiation
        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Stage 2: Confirm USDC sent to offramp
        vm.startPrank(offrampPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP, "TXN001"
        );
        vm.stopPrank();

        // Stage 3: Confirm fiat conversion and sent
        vm.startPrank(offrampPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.FIAT_CONVERTED_AND_SENT, "TXN002"
        );
        vm.stopPrank();

        // Stage 4: Confirm fiat received by bank
        vm.startPrank(bankingPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.FIAT_CONFIRMED_BY_BANK, "TXN003"
        );
        vm.stopPrank();

        // Stage 5: Confirm seller payment
        vm.startPrank(bankingPartner);
        compliance.confirmSellerPayment(BATCH_ID, buyer, USD_AMOUNT, "SELLER_TXN_001");
        vm.stopPrank();

        // Verify complete transfer
        (
            uint64 storedSellerId,
            ,
            ,
            uint256 usdAmount,
            uint256 usdReceived,
            WAGAEthiopianCompliance.TransferStage currentStage,
            bool sellerPaid
        ) = compliance.getFiatTransfer(BATCH_ID, buyer);

        assertEq(storedSellerId, sellerId);
        assertEq(usdAmount, USD_AMOUNT);
        assertEq(usdReceived, USD_AMOUNT);
        assertEq(uint8(currentStage), uint8(WAGAEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
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
        (bool hasECTA, bool hasQuality, bool hasOrigin, bool hasEUDR) = compliance.getComplianceStatus(BATCH_ID);
        assertFalse(hasECTA);
        assertFalse(hasQuality);
        assertFalse(hasOrigin);
        assertFalse(hasEUDR);

        // Add EUDR compliance
        compliance.addEUDRCertificate(BATCH_ID, eudrCert);
        compliance.addGeolocationData(BATCH_ID, geoData);

        (hasECTA, hasQuality, hasOrigin, hasEUDR) = compliance.getComplianceStatus(BATCH_ID);
        assertFalse(hasECTA); // Still no Ethiopian compliance
        assertFalse(hasQuality);
        assertFalse(hasOrigin);
        assertTrue(hasEUDR); // Now has EUDR compliance

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
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        vm.stopPrank();

        vm.startPrank(offrampPartner);

        // First transfer should succeed
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        // Second transfer should fail
        vm.expectRevert("Offramp transfer already exists");
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        vm.stopPrank();
    }

    function test_Error_UnauthorizedStageConfirmation() public {
        vm.startPrank(admin);
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        vm.stopPrank();

        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Try to confirm stage from unauthorized account
        vm.startPrank(buyer); // Not authorized

        vm.expectRevert("Not authorized banking partner");
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP, "TXN001"
        );

        vm.stopPrank();
    }

    function test_Error_UnauthorizedSellerPaymentConfirmation() public {
        vm.startPrank(admin);
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        compliance.setAccessControl(address(accessControl));
        vm.stopPrank();

        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Try to confirm seller payment from unauthorized account
        vm.startPrank(buyer); // Not authorized

        vm.expectRevert("Unauthorized seller confirmation");
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
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        compliance.setAccessControl(address(accessControl));

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
        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // 4. Complete transfer pipeline
        vm.startPrank(offrampPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP, "TXN001"
        );
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.FIAT_CONVERTED_AND_SENT, "TXN002"
        );
        vm.stopPrank();

        vm.startPrank(bankingPartner);
        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.FIAT_CONFIRMED_BY_BANK, "TXN003"
        );
        compliance.confirmSellerPayment(BATCH_ID, buyer, USD_AMOUNT, "SELLER_TXN_001");
        vm.stopPrank();

        // 5. Verify complete workflow
        (
            uint64 sellerId,
            bytes11 offrampSwift,
            bytes11 receivingSwift,
            uint256 usdAmount,
            uint256 usdReceived,
            WAGAEthiopianCompliance.TransferStage finalStage,
            bool sellerPaid
        ) = compliance.getFiatTransfer(BATCH_ID, buyer);

        assertEq(sellerId, coffeeToken.getSellerId(seller));
        assertEq(offrampSwift, OFFRAMP_SWIFT);
        assertEq(usdAmount, USD_AMOUNT);
        assertEq(usdReceived, USD_AMOUNT);
        assertEq(uint8(finalStage), uint8(WAGAEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED));
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

    function test_ViewFunctions_GetEnhancedTransferDetails() public {
        vm.startPrank(admin);
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        compliance.setAccessControl(address(accessControl));
        vm.stopPrank();

        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);
        vm.stopPrank();

        // Test enhanced transfer details
        (
            address consumer,
            uint64 sellerId,
            uint256 batchId_,
            uint256 quantity,
            WAGAEthiopianCompliance.TransferStage status,
            bool requiresEthiopianCompliance,
            bool requiresEUDRCompliance,
            bool fiatTransferCompleted,
            bytes11 offrampSwift,
            bytes11 receivingSwift
        ) = compliance.getEnhancedTransferDetails(BATCH_ID, buyer);

        assertEq(consumer, buyer);
        assertEq(sellerId, coffeeToken.getSellerId(seller));
        assertEq(batchId_, BATCH_ID);
        assertEq(offrampSwift, OFFRAMP_SWIFT);
        assertFalse(fiatTransferCompleted);
    }

    function test_ViewFunctions_GetTransferStageStatus() public {
        vm.startPrank(admin);
        compliance.addOfframpPartner(offrampPartner, "Global Offramp");
        vm.stopPrank();

        vm.startPrank(offrampPartner);
        compliance.recordOfframpTransferInitiated(BATCH_ID, buyer, OFFRAMP_SWIFT, USD_AMOUNT);

        compliance.confirmFiatTransferStage(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP, "TXN001"
        );

        vm.stopPrank();

        // Test stage status
        (bool completed, string memory transactionId, uint256 timestamp) = compliance.getTransferStageStatus(
            BATCH_ID, buyer, WAGAEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP
        );

        assertTrue(completed);
        assertEq(transactionId, "TXN001");
        assertGt(timestamp, 0);
    }
}
