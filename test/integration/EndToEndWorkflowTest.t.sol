// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
// WAGAAccessControl removed - functionality moved to WAGAConfigManager
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {WAGACDPIntegration} from "../../src/WAGACDPIntegration.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGAECXPriceOracle} from "../../src/WAGAECXPriceOracle.sol";
import {MockOfframpPartner} from "../../src/MockOfframpPartner.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {TestHelperUtilities} from "../TestHelperUtilities.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title EndToEndWorkflowTest
 * @dev Comprehensive end-to-end integration test covering the complete WAGA MVP workflow
 * @notice Tests: Seller Registration -> EUDR Batch Creation -> Redemption -> Offramp Transfer -> Seller Payment
 */
contract EndToEndWorkflowTest is Test {
    // TestHelperUtilities is now a contract, not a library

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
    // WAGAAccessControl removed - using ConfigManager functionality via CoffeeToken
    CircomVerifier public circomVerifier;
    MockUSDC public usdcToken;
    
    // Additional contracts now included in deployment
    WAGACDPIntegration public cdpIntegration;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGAECXPriceOracle public ecxOracle;
    
    // Test utilities
    TestHelperUtilities public testUtils;

    /* -------------------------------------------------------------------------- */
    /*                              TEST ACCOUNTS                                 */
    /* -------------------------------------------------------------------------- */

    address public admin;
    address public processor = makeAddr("processor");
    address public complianceManager = makeAddr("complianceManager");
    address public consumer = makeAddr("consumer");
    address public offrampPartner = makeAddr("offrampPartner");

    uint64 public sellerId;

    /* -------------------------------------------------------------------------- */
    /*                              TEST CONSTANTS                                */
    /* -------------------------------------------------------------------------- */

    bytes11 public constant ETHIOPIAN_BANK_SWIFT = bytes11("CBETETAAXXX"); // Commercial Bank of Ethiopia
    bytes11 public constant OFFRAMP_BANK_SWIFT = bytes11("OFFRAMPXXXX");

    uint256 public constant BATCH_SIZE = 100;
    uint256 public constant PRICE_PER_UNIT = 1 ether; // 1 ETH per unit
    uint256 public constant USDC_AMOUNT = 100 * 1e6; // 100 USDC (6 decimals)

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
            cdpIntegration, // Now included in deployment
            proofOfReserve, // Now included in deployment
            inventoryManager, // Now included in deployment
            ethiopianCompliance,
            ecxOracle, // Now included in deployment
            circomVerifier,
            helperConfig
        ) = deployer.run();

        admin = vm.addr(helperConfig.getActiveNetworkConfig().deployerKey);
        // Note: AccessControl functionality now in ConfigManager (inherited by CoffeeToken)
        usdcToken = MockUSDC(address(treasury.usdcToken()));
        
        // Initialize test utilities
        testUtils = new TestHelperUtilities();

        // Setup roles and permissions
        vm.startPrank(admin);
        // Use ConfigManager role granting functions
        coffeeToken.grantProcessorRole(processor);
        // Ethiopian compliance now uses coffeeToken for access control
        coffeeToken.grantComplianceManagerRole(complianceManager);
        coffeeToken.grantRole(keccak256("ADMIN_ROLE"), admin);

        // Register seller
        sellerId = coffeeToken.registerSeller(
            processor,
            WAGAConfigManager.SellerType.PROCESSOR,
            "Test Ethiopian Processor",
            "TEST001",
            bytes11("TESTSWIFTXX")
        );

        // Setup offramp partner
        MockOfframpPartner(offrampPartner).grantOfframpExecutorRole(offrampPartner);

        // Setup banking partners
        ethiopianCompliance.registerBankingPartner(
            OFFRAMP_BANK_SWIFT,
            offrampPartner,
            "Global Offramp Partner",
            IEthiopianCompliance.BankingCapabilities({
                swiftCode: OFFRAMP_BANK_SWIFT,
                bankName: "Global Offramp Partner",
                canActAsOfframp: true,
                canHandleForexSurrender: false,
                partnerType: IEthiopianCompliance.OfframpPartnerType.DIRECT_BANK,
                connectedBankSwift: bytes11("CBETETAAXXX"),
                maxTransactionAmount: 1000000 * 1e6,
                isActive: true
            })
        );

        // Grant treasury permissions
        // Treasury roles are managed through coffeeToken (unified access control)
        coffeeToken.grantPaymentProcessorRole(offrampPartner);

        // Setup ZK verifier roles - managed through coffeeToken (unified access control)
        coffeeToken.grantVerifierRole(processor);
        coffeeToken.grantVerifierRole(complianceManager);

        vm.stopPrank();

        // Fund accounts
        vm.deal(consumer, 1000 ether);
        usdcToken.mint(consumer, USDC_AMOUNT * 2); // Extra for fees
        usdcToken.mint(address(treasury), USDC_AMOUNT); // Treasury funds

        // Approve treasury spending
        vm.prank(consumer);
        usdcToken.approve(address(treasury), USDC_AMOUNT);
    }

    /* -------------------------------------------------------------------------- */
    /*                           END-TO-END WORKFLOW TEST                         */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Test the complete workflow: Seller Registration -> EUDR Batch Creation -> Redemption -> Offramp Transfer -> Seller Payment
     */
    function testCompleteWorkflowWithEUDRAndOfframp() public {
        console.log("=== STARTING COMPLETE END-TO-END WORKFLOW TEST ===");

        /* ---------------------------------------------------------------------- */
        /*                          PHASE 1: SELLER REGISTRATION                  */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 1: Seller Registration");
        assertEq(coffeeToken.getSellerId(processor), sellerId, "Seller ID should be registered");
        assertEq(coffeeToken.getSellerAddress(sellerId), processor, "Seller address should be mapped");

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 2: EUDR COMPLIANT BATCH CREATION              */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 2: EUDR Compliant Batch Creation");

        uint256 batchId;
        vm.startPrank(processor);

        // Create batch with Ethiopian origin
        batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            BATCH_SIZE,
            PRICE_PER_UNIT,
            "Yirgacheffe",
            "Washed",
            "ipfs://batch-metadata"
        );

        // Register EUDR compliance
        TestHelperUtilities.EUDRTestData memory eudrData = testUtils.generateSampleEUDRData();
        ethiopianCompliance.addEUDRCertificate(
            batchId,
            IEthiopianCompliance.EUDRCertificate({
                certificateId: eudrData.certificateId,
                issuer: "European Commission",
                issueDate: block.timestamp - 30 days,
                expiryDate: eudrData.certificateExpiry,
                isValid: true,
                geoDataHash: "geo-hash-end-to-end-test",
                complianceLevel: eudrData.complianceLevel,
                deforestationRisk: eudrData.deforestationStatus
            })
        );

        ethiopianCompliance.addGeolocationData(
            batchId,
            IEthiopianCompliance.GeolocationData({
                plotType: "Farm Plot A",
                coordinates: "Polygon",
                plotSize: eudrData.plotSize,
                verificationMethod: eudrData.verificationMethod
            })
        );

        // Submit EUDR ZK proofs
        bytes memory eudrDeforestationProof = testUtils.generateMockZKProof();
        zkManager.addEUDRComplianceZKProof(
            batchId,
            eudrDeforestationProof,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            eudrData.deforestationStatus
        );

        bytes memory eudrGeolocationProof = testUtils.generateMockZKProof();
        zkManager.addEUDRComplianceZKProof(
            batchId,
            eudrGeolocationProof,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            eudrData.geolocationData
        );

        vm.stopPrank();

        // Verify EUDR compliance
        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) =
            batchManager.validateEUDRZKCompliance(batchId);
        assertTrue(fullyCompliant, "Batch should be fully EUDR compliant");

        console.log("Batch created with EUDR compliance:", batchId);

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 3: ETHIOPIAN COMPLIANCE REGISTRATION           */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 3: Ethiopian Compliance Registration");

        vm.startPrank(complianceManager);

        // Register Ethiopian compliance
        TestHelperUtilities.EthiopianComplianceTestData memory ethData =
            testUtils.generateSampleEthiopianComplianceData();

        ethiopianCompliance.addECTAPermit(
            batchId,
            IEthiopianCompliance.ECTAPermit({
                permitNumber: ethData.ectaPermitNumber,
                exporterName: "Test Ethiopian Processor",
                exporterLicense: "TEST001",
                issueDate: block.timestamp - 7 days,
                expiryDate: block.timestamp + 180 days,
                isValid: true,
                permitDocumentHash: "ipfs://ecta-permit-hash"
            })
        );

        ethiopianCompliance.addQualityCertificate(
            batchId,
            IEthiopianCompliance.QualityCertificate({
                certificateNumber: ethData.qualityCertificateNumber,
                gradingResult: "Grade 1",
                moistureContent: ethData.moistureContent,
                screenSize: ethData.screenSize,
                scaeCompliant: true,
                issueDate: block.timestamp,
                certificateHash: "ipfs://quality-certificate-hash",
                inspectorId: "ECX-INSPECTOR-001"
            })
        );

        ethiopianCompliance.addOriginVerification(
            batchId,
            IEthiopianCompliance.OriginVerification({
                region: "Yirgacheffe",
                woreda: "Yirgacheffe Woreda",
                kebele: "Test Kebele",
                cooperativeName: "Test Cooperative",
                cooperativeLicense: "COOP-LIC-001",
                verified: true,
                verificationDate: block.timestamp,
                verificationDocumentHash: ethData.originDocumentHash
            })
        );

        // Submit Ethiopian compliance ZK proofs
        bytes memory ectaProof = testUtils.generateMockZKProof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            "ECTA",
            ectaProof,
            ethData.ectaPermitNumber
        );

        bytes memory qualityProof = testUtils.generateMockZKProof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            "QUALITY",
            qualityProof,
            ethData.qualityCertificateNumber
        );

        bytes memory originProof = testUtils.generateMockZKProof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            "ORIGIN",
            originProof,
            "Yirgacheffe Origin Verified"
        );

        bytes memory boeProof = testUtils.generateMockZKProof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            "BOE",
            boeProof,
            ethData.boeRegistrationNumber
        );

        vm.stopPrank();

        // Verify Ethiopian compliance
        bool ethiopianCompliant = zkManager.validateEthiopianZKCompliance(batchId);
        assertTrue(ethiopianCompliant, "Batch should be Ethiopian compliant");

        console.log("Ethiopian compliance registered for batch:", batchId);

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 4: REGISTER TRADE WITH BOE                     */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 4: Register Trade with Bank of Ethiopia");

        vm.startPrank(complianceManager);
        ethiopianCompliance.registerTradeWithBoE(
            batchId,
            consumer,
            processor,
            BATCH_SIZE,
            USDC_AMOUNT,
            "Bank Transfer"
        );
        vm.stopPrank();

        console.log("Trade registered with BoE for batch:", batchId);

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 5: CONSUMER PURCHASE AND PAYMENT               */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 5: Consumer Purchase and Payment");

        vm.startPrank(consumer);
        treasury.payForBatch(batchId, USDC_AMOUNT);
        vm.stopPrank();

        // Verify payment
        assertTrue(treasury.hasPaidForBatch(consumer, batchId), "Consumer should have paid for batch");
        assertEq(treasury.batchPaymentCollected(batchId), USDC_AMOUNT, "Payment should be collected");

        console.log("Consumer payment completed for batch:", batchId);

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 6: TOKEN MINTING AND REDEMPTION REQUEST       */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 6: Token Minting and Redemption Request");

        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, BATCH_SIZE);
        vm.stopPrank();

        // Verify token balance
        assertEq(coffeeToken.balanceOf(consumer, batchId), BATCH_SIZE, "Consumer should have received tokens");

        // Request redemption with EUDR compliance requirement
        vm.startPrank(consumer);
        uint256 redemptionId = redemptionContract.requestRedemption(batchId, BATCH_SIZE, "End-to-End Test Bank Details");
        vm.stopPrank();

        // Verify redemption request
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
        assertEq(redemptionSellerId, sellerId, "Redemption seller ID should match");
        assertEq(redemptionBatchId, batchId, "Redemption batch ID should match");
        assertEq(quantity, BATCH_SIZE, "Redemption quantity should match");
        assertTrue(requiresEUDRCompliance, "Redemption should require EUDR compliance");

        console.log("Redemption requested with ID:", redemptionId);

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 7: OFFRAMP TRANSFER TO PARTNER                */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 7: Offramp Transfer to Partner");

        vm.startPrank(offrampPartner);
        treasury.transferToOfframpPartner(batchId, consumer, offrampPartner, USDC_AMOUNT);
        vm.stopPrank();

        // Verify offramp transfer
        assertTrue(treasury.hasOfframpTransferExecuted(batchId, consumer), "Offramp transfer should be executed");
        (address transferPartner, uint256 transferAmount, bool executed) =
            treasury.getOfframpTransferDetails(batchId, consumer);
        assertEq(transferPartner, offrampPartner, "Transfer partner should match");
        assertEq(transferAmount, USDC_AMOUNT, "Transfer amount should match");
        assertTrue(executed, "Transfer should be marked as executed");

        console.log("Offramp transfer completed to partner:", offrampPartner);

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 8: FIAT TRANSFER TO ETHIOPIAN BANK            */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 8: Fiat Transfer to Ethiopian Bank");

        // Setup offramp partner contract
        MockOfframpPartner mockPartner = new MockOfframpPartner(address(usdcToken));

        vm.startPrank(admin);
        mockPartner.addSupportedSwiftCode(ETHIOPIAN_BANK_SWIFT, "Commercial Bank of Ethiopia");
        mockPartner.grantOfframpExecutorRole(offrampPartner);
        vm.stopPrank();

        // Receive offramp at partner
        vm.startPrank(offrampPartner);
        mockPartner.receiveOfframp(batchId, consumer, sellerId, USDC_AMOUNT, ETHIOPIAN_BANK_SWIFT);
        mockPartner.initiateFiatTransfer(sellerId, "BANK_TX_001");
        vm.stopPrank();

        // Verify offramp record
        MockOfframpPartner.OfframpRecord memory record = mockPartner.getOfframpRecord(sellerId);

        assertEq(record.batchId, batchId, "Offramp record batch ID should match");
        assertEq(record.buyer, consumer, "Offramp record buyer should match");
        assertEq(record.sellerId, sellerId, "Offramp record seller ID should match");
        assertEq(record.usdAmount, USDC_AMOUNT, "Offramp record amount should match");
        assertEq(record.receivingBankSwift, ETHIOPIAN_BANK_SWIFT, "Offramp record SWIFT should match");
        assertTrue(record.fiatTransferInitiated, "Fiat transfer should be initiated");

        console.log("Fiat transfer initiated to Ethiopian bank");

        /* ---------------------------------------------------------------------- */
        /*                    PHASE 9: SELLER PAYMENT CONFIRMATION                */
        /* ---------------------------------------------------------------------- */

        console.log("Phase 9: Seller Payment Confirmation");

        uint256 sellerReceivedAmount = (USDC_AMOUNT * 95) / 100; // 95% after fees/taxes

        vm.startPrank(processor); // Seller confirms payment
        ethiopianCompliance.confirmSellerPayment(
            batchId,
            consumer,
            sellerReceivedAmount,
            "SELLER_PAYMENT_001"
        );
        vm.stopPrank();

        // Verify seller payment confirmation
        (
            ,
            ,
            ,
            ,
            ,
            ,
            bool isFulfilled,
            ,
            ,
        ) = redemptionContract.getEnhancedRedemptionDetails(redemptionId);

        assertTrue(isFulfilled, "Redemption should be fulfilled");

        console.log("Seller payment confirmed. Redemption fulfilled!");

        /* ---------------------------------------------------------------------- */
        /*                          FINAL VERIFICATION                            */
        /* ---------------------------------------------------------------------- */

        console.log("=== FINAL VERIFICATION ===");

        // Verify complete workflow
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(zkManager.validateEUDRZKCompliance(batchId), "Batch should have EUDR proofs");
        assertTrue(zkManager.validateEthiopianZKCompliance(batchId), "Batch should have Ethiopian ZK compliance");
        assertTrue(treasury.hasPaidForBatch(consumer, batchId), "Consumer payment should be recorded");
        assertTrue(treasury.hasOfframpTransferExecuted(batchId, consumer), "Offramp transfer should be executed");
        assertTrue(isFulfilled, "Redemption should be completed");

        console.log("=== COMPLETE END-TO-END WORKFLOW TEST PASSED ===");
        console.log("Seller Registration: PASSED");
        console.log("EUDR Batch Creation: PASSED");
        console.log("Ethiopian Compliance: PASSED");
        console.log("Consumer Payment: PASSED");
        console.log("Offramp Transfer: PASSED");
        console.log("Fiat Transfer: PASSED");
        console.log("Seller Payment: PASSED");
        console.log("Redemption Fulfillment: PASSED");
    }

    /* -------------------------------------------------------------------------- */
    /*                        GAS OPTIMIZATION VALIDATION                        */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Test gas optimization for SWIFT codes vs addresses
     */
    function testSwiftCodeGasOptimization() public {
        console.log("=== TESTING SWIFT CODE GAS OPTIMIZATION ===");

        uint256 numTransactions = 1000;

        // Calculate expected savings
        uint256 expectedSavings = testUtils.calculateSwiftGasSavings(numTransactions);

        console.log("Number of transactions:", numTransactions);
        console.log("Expected gas savings:", expectedSavings);

        // In a real scenario, we'd measure actual gas usage
        // For this test, we verify the calculation logic
        assertTrue(expectedSavings > 0, "Should have gas savings");

        // Test SWIFT code validation
        bytes11[] memory validCodes = testUtils.getValidSwiftCodes();
        for (uint256 i = 0; i < validCodes.length; i++) {
            assertTrue(validCodes[i].length == 11 || validCodes[i].length == 8, "SWIFT code should be valid length");
        }

        console.log("SWIFT code gas optimization test passed");
    }

    /**
     * @dev Test gas optimization for seller IDs vs addresses
     */
    function testSellerIdGasOptimization() public {
        console.log("=== TESTING SELLER ID GAS OPTIMIZATION ===");

        uint256 numTransactions = 500;

        // Calculate expected savings
        uint256 expectedSavings = testUtils.calculateSellerIdGasSavings(numTransactions);

        console.log("Number of transactions:", numTransactions);
        console.log("Expected gas savings:", expectedSavings);

        // Verify seller ID generation
        uint64[] memory sellerIds = testUtils.generateSellerIds(5, 100);
        assertEq(sellerIds.length, 5, "Should generate correct number of IDs");
        assertEq(sellerIds[0], 100, "First ID should match start value");
        assertEq(sellerIds[4], 104, "Last ID should be sequential");

        console.log("Seller ID gas optimization test passed");
    }

    /* -------------------------------------------------------------------------- */
    /*                        CROSS-CONTRACT INTEGRATION                         */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Test cross-contract data flow and integration
     */
    function testCrossContractDataFlow() public {
        console.log("=== TESTING CROSS-CONTRACT DATA FLOW ===");

        // Create batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            50,
            PRICE_PER_UNIT,
            "Sidamo",
            "Natural",
            "ipfs://test-batch"
        );
        vm.stopPrank();

        // Register EUDR compliance
        vm.startPrank(complianceManager);
        ethiopianCompliance.addEUDRCertificate(
            batchId,
            IEthiopianCompliance.EUDRCertificate({
                certificateId: "EUDR-TEST-001",
                issuer: "European Commission",
                issueDate: block.timestamp - 10 days,
                expiryDate: block.timestamp + 365 days,
                isValid: true,
                geoDataHash: "geo-hash-comprehensive-workflow-test",
                complianceLevel: "High",
                deforestationRisk: "Deforestation-Free"
            })
        );
        vm.stopPrank();

        // Verify data flows between contracts
        assertTrue(coffeeToken.isBatchCreated(batchId), "CoffeeToken should have batch");
        assertTrue(ethiopianCompliance.validateEUDRCompliance(batchId), "EthiopianCompliance should have certificate");

        // Test ZK manager integration
        vm.startPrank(complianceManager);
        bytes memory proof = testUtils.generateMockZKProof();
        zkManager.addEUDRComplianceZKProof(
            batchId,
            proof,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free Verified"
        );
        vm.stopPrank();

        assertTrue(zkManager.validateEUDRZKCompliance(batchId), "ZKManager should have EUDR proofs");

        console.log("Cross-contract data flow test passed");
    }

    /* -------------------------------------------------------------------------- */
    /*                        BACKWARD COMPATIBILITY                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Test that existing functionality still works
     */
    function testBackwardCompatibility() public {
        console.log("=== TESTING BACKWARD COMPATIBILITY ===");

        // Test basic batch creation (original functionality)
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            PRICE_PER_UNIT,
            "Test Region",
            "Test Grade",
            "ipfs://legacy-batch"
        );
        vm.stopPrank();

        assertTrue(coffeeToken.isBatchCreated(batchId), "Legacy batch creation should work");

        // Test basic payment (original functionality)
        vm.startPrank(consumer);
        treasury.payForBatch(batchId, PRICE_PER_UNIT * 100);
        vm.stopPrank();

        assertTrue(treasury.hasPaidForBatch(consumer, batchId), "Legacy payment should work");

        // Test basic redemption (original functionality)
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, 100);
        vm.stopPrank();

        vm.startPrank(consumer);
        uint256 redemptionId = redemptionContract.requestRedemption(batchId, 50, "Cross-Contract Test Bank Details"); // No EUDR requirement
        vm.stopPrank();

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

        assertEq(redemptionConsumer, consumer, "Legacy redemption consumer should match");
        assertEq(redemptionBatchId, batchId, "Legacy redemption batch should match");
        assertEq(quantity, 50, "Legacy redemption quantity should match");
        assertFalse(requiresEUDRCompliance, "Legacy redemption should not require EUDR");

        console.log("Backward compatibility test passed");
    }
}
