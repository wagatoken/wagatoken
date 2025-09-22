// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";

// Import the main deployment script
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";

// Core contracts
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGAECXPriceOracle} from "../../src/WAGAECXPriceOracle.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";

// Interfaces
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";
import {IPrivacyLayer} from "../../src/Interfaces/IPrivacyLayer.sol";

/**
 * @title EthiopianComplianceZKIntegrationTest
 * @dev Comprehensive test suite for Ethiopian compliance with ZK privacy integration
 * @notice Uses the main deployment script to ensure consistency with production deployments
 */
contract EthiopianComplianceZKIntegrationTest is Test {
    // Deployment script instance
    DeployRealZKMVP public deployer;
    
    // Core contracts - accessed from deployment script
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    PrivacyLayer public privacyLayer;
    WAGACoffeeRedemption public redemption;
    WAGAEthiopianCompliance public ethiopianCompliance;
    WAGAECXPriceOracle public ecxOracle;
    CircomVerifier public circomVerifier;
    MockCircomVerifier public mockVerifier;

    // Test accounts - using makeAddr pattern
    address public admin = makeAddr("admin");
    address public cooperative = makeAddr("cooperative");
    address public processor = makeAddr("processor");
    address public buyer = makeAddr("buyer");
    address public complianceOfficer = makeAddr("complianceOfficer");
    address public qualityInspector = makeAddr("qualityInspector");
    address public bankingPartner = makeAddr("bankingPartner");

    // Test data
    uint256 public testBatchId = 1001;
    string public testOrigin = "Sidamo, Ethiopia";
    uint256 public testQuantity = 1000;

    /* -------------------------------------------------------------------------- */
    /*                                   SETUP                                    */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        // Use the main deployment script to ensure consistency
        deployer = new DeployRealZKMVP();
        
        // Run deployment with deployer contract as admin
        deployer.runForTesting();
        
        // Get deployed contract addresses from the deployment script
        coffeeToken = deployer.coffeeToken();
        batchManager = deployer.batchManager();
        zkManager = deployer.zkManager();
        privacyLayer = deployer.privacyLayer();
        redemption = deployer.redemptionManager();
        ethiopianCompliance = deployer.ethiopianCompliance();
        ecxOracle = deployer.ecxOracle();
        circomVerifier = deployer.circomVerifier();
        
        // Deploy MockCircomVerifier for testing ZK operations
        mockVerifier = new MockCircomVerifier();
        
        // Replace ZK Manager with one using MockCircomVerifier
        vm.prank(address(deployer));
        zkManager = new WAGAZKManager(
            address(coffeeToken),
            address(mockVerifier)
        );
        
        // Note: MockCircomVerifier doesn't require role setup - it's a mock for testing
        
        // Configure Ethiopian compliance on the new ZK Manager
        vm.prank(address(deployer));
        zkManager.setEthiopianCompliance(address(ethiopianCompliance));
        
        // Setup test environment with additional configurations
        _setupTestEnvironment();
    }
    
    /**
     * @dev Setup test environment with test-specific configurations
     */
    function _setupTestEnvironment() internal {
        // Use deployer contract address for role grants since it has DEFAULT_ADMIN_ROLE
        vm.startPrank(address(deployer));
        
        // Setup roles for testing
        _setupRoles();
        
        // Add banking partner for Ethiopian compliance testing
        ethiopianCompliance.addBankingPartner(bankingPartner, "Test Ethiopian Bank");
        
        // Setup ECX oracle with test prices
        _setupTestPrices();

        vm.stopPrank();
    }

    function _setupRoles() internal {
        // Setup verifier roles following established pattern (MockCircomVerifier role already granted in setUp)
        // Grant verifier role through ConfigManager
        coffeeToken.grantVerifierRole(address(mockVerifier));
        // Grant user roles through ConfigManager functions
        coffeeToken.grantProcessorRole(processor);
        // Cooperative role granted automatically when registering seller as COOPERATIVE type
        coffeeToken.grantProcessorRole(qualityInspector); // Quality inspector needs processor role for adding certificates
        coffeeToken.grantProcessorRole(complianceOfficer); // Compliance officer needs processor role for adding origin verification
        coffeeToken.grantRole(keccak256("ADMIN_ROLE"), address(batchManager)); // BatchManager needs admin role
        // Grant system roles through ConfigManager functions
        coffeeToken.grantRole(keccak256("ADMIN_ROLE"), address(zkManager)); // ZK Manager needs admin role
        coffeeToken.setRedemptionManager(address(redemption));
        coffeeToken.grantRole(keccak256("MINTER_ROLE"), admin); // Admin needs to mint tokens for testing
        coffeeToken.setProofOfReserveManager(admin); // Admin needs to simulate verification for testing
        
        // Ethiopian compliance roles - all granted through coffeeToken (unified access control)
        coffeeToken.grantComplianceManagerRole(complianceOfficer);
        coffeeToken.grantComplianceManagerRole(processor); // Processor needs to add compliance docs
        coffeeToken.grantComplianceManagerRole(qualityInspector); // Quality inspector needs to add certificates
        coffeeToken.grantComplianceManagerRole(address(batchManager)); // BatchManager needs to add compliance docs on behalf of users
        coffeeToken.grantComplianceVerifierRole(complianceOfficer); // For origin verification
        coffeeToken.grantComplianceVerifierRole(address(batchManager)); // BatchManager needs to add origin verification on behalf of users
        coffeeToken.grantQualityAssessorRole(qualityInspector); // Quality inspector role
        coffeeToken.grantQualityAssessorRole(address(batchManager)); // BatchManager needs to add quality certificates on behalf of users
        coffeeToken.grantComplianceManagerRole(address(redemption)); // Redemption needs compliance manager role
        
        // ECX Oracle roles - granted through coffeeToken (unified access control)
        coffeeToken.grantPriceUpdaterRole(admin);
        coffeeToken.grantVerifierRole(address(zkManager)); // ZK Manager needs verifier role
    }
    
    function _setupTestPrices() internal {
        // Setup ECX price data for testing
        ecxOracle.updateECXPrice(
            WAGAECXPriceOracle.CoffeeGrade.WGQ1,
            WAGAECXPriceOracle.CoffeeOrigin.SC,
            800, // ETB per 17kg bag
            WAGAECXPriceOracle.DataQuality.HIGH,
            "ECX_OFFICIAL",
            95
        );
        
        ecxOracle.updateExchangeRate(58000000); // 58 ETB per 1 USD (with 6 decimal precision)
    }

    /* -------------------------------------------------------------------------- */
    /*                          BATCH CREATION WITH COMPLIANCE                    */
    /* -------------------------------------------------------------------------- */

    function test_CreateEthiopianBatchWithCompliance() public {
        console.log("\n=== Testing Ethiopian Batch Creation with Compliance ===");
        
        // Step 1: Create batch as cooperative using batch manager
        vm.startPrank(cooperative);
        
        // Create Ethiopian batch using coffee token directly
        testBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            testQuantity,
            50 * 1e18, // $50 per unit
            testOrigin,
            "60kg bags",
            "ipfs://test-ethiopian-batch"
        );
        vm.stopPrank();

        // Verify batch exists
        assertTrue(coffeeToken.isBatchCreated(testBatchId));
        console.log("Ethiopian batch created successfully");
    }

    function test_AddEthiopianComplianceDocuments() public {
        // First create the batch
        test_CreateEthiopianBatchWithCompliance();

        console.log("\n=== Adding Ethiopian Compliance Documents ===");

        // Step 2: Add ECTA permit
        vm.startPrank(processor);
        IEthiopianCompliance.ECTAPermit memory ectaPermit = IEthiopianCompliance.ECTAPermit({
            permitNumber: "ECTA-2025-001",
            exporterName: "Sidamo Coffee Export",
            exporterLicense: "LIC-001",
            issueDate: block.timestamp,
            expiryDate: block.timestamp + 180 days,
            isValid: true,
            permitDocumentHash: "QmECTAhash123"
        });
        
        batchManager.addECTAPermitDuringCreation(testBatchId, ectaPermit);
        console.log("[OK] ECTA permit added");

        // Step 3: Add quality certificate
        vm.startPrank(qualityInspector);
        IEthiopianCompliance.QualityCertificate memory qualityCert = IEthiopianCompliance.QualityCertificate({
            certificateNumber: "QC-2025-001",
            gradingResult: "Grade 1 Premium",
            moistureContent: 11, // 11% moisture
            screenSize: 16, // Screen size 16
            scaeCompliant: true,
            issueDate: block.timestamp,
            certificateHash: "QmQualityHash123",
            inspectorId: "INSP-001"
        });
        
        batchManager.addQualityCertificateDuringCreation(testBatchId, qualityCert);
        console.log("[OK] Quality certificate added");

        // Step 4: Add origin verification
        vm.startPrank(complianceOfficer);
        IEthiopianCompliance.OriginVerification memory originVerification = IEthiopianCompliance.OriginVerification({
            region: "Sidamo",
            woreda: "Bensa",
            kebele: "Bombe",
            cooperativeName: "Sidamo Coffee Cooperative Union",
            cooperativeLicense: "COOP-LIC-001",
            verified: true,
            verificationDate: block.timestamp,
            verificationDocumentHash: "QmOriginHash123"
        });
        
        batchManager.addOriginVerificationDuringCreation(testBatchId, originVerification);
        console.log("[OK] Origin verification added");
        vm.stopPrank();

        // Verify compliance status
        (bool hasECTA, bool hasQuality, bool hasOrigin, bool isFullyCompliant) = 
            ethiopianCompliance.getComplianceStatus(testBatchId);
        
        assertTrue(hasECTA);
        assertTrue(hasQuality);
        assertTrue(hasOrigin);
        assertTrue(isFullyCompliant);
        
        console.log("[OK] Full Ethiopian compliance achieved");
    }

    /* -------------------------------------------------------------------------- */
    /*                              ZK PRIVACY INTEGRATION                        */
    /* -------------------------------------------------------------------------- */

    function test_ZKPrivacyProtectionForComplianceData() public {
        // Setup batch with compliance
        test_AddEthiopianComplianceDocuments();

        console.log("\n=== Testing ZK Privacy Protection ===");

        // Check that compliance data is protected in privacy layer
        IPrivacyLayer.PrivacyConfig memory privacyConfig = 
            batchManager.getBatchPrivacyConfig(testBatchId);
        
        assertEq(uint256(privacyConfig.level), uint256(IPrivacyLayer.PrivacyLevel.SELECTIVE));
        assertEq(privacyConfig.supplyChainClaim, "Ethiopian Export Compliance");
        
        console.log("[OK] Compliance data protected with ZK privacy");
        console.log("  Privacy Level:", uint(privacyConfig.level));
        console.log("  Supply Chain Claim:", privacyConfig.supplyChainClaim);
    }

    function test_AddZKComplianceProofs() public {
        // Setup batch with compliance
        test_AddEthiopianComplianceDocuments();

        console.log("\n=== Adding ZK Compliance Proofs ===");

        // Add ZK proof for ECTA compliance via ZK Manager (proper integration test)
        bytes memory ectaZKProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            testBatchId,
            "ECTA_PERMIT",
            ectaZKProof,
            "ECTA Export Permit Verified"
        );
        console.log("[OK] ECTA ZK proof added");

        // Add ZK proof for quality compliance
        bytes memory qualityZKProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            testBatchId,
            "QUALITY_CERT",
            qualityZKProof,
            "Premium Quality Certified"
        );
        console.log("[OK] Quality ZK proof added");

        // Add ZK proof for origin compliance
        bytes memory originZKProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            testBatchId,
            "ORIGIN_VERIFICATION",
            originZKProof,
            "Single-Origin Sidamo Verified"
        );
        console.log("[OK] Origin ZK proof added");

        // Note: ZK proofs will fail cryptographic verification but should not revert
        // This is expected behavior when testing with mock proof data
        
        // Verify Ethiopian compliance status (this should still be true from earlier)
        (bool hasECTA, bool hasQuality, bool hasOrigin, bool hasFullCompliance) = 
            ethiopianCompliance.getComplianceStatus(testBatchId);
        
        assertTrue(hasECTA);
        assertTrue(hasQuality);
        assertTrue(hasOrigin);
        assertTrue(hasFullCompliance);
        
        console.log("[OK] Ethiopian compliance status confirmed");
        console.log("[OK] ZK proof integration test completed (proofs fail verification as expected with mock data)");

        // Test compliance claim generation
        string memory complianceClaim = zkManager.generateEthiopianComplianceClaim(testBatchId);
        console.log("  Compliance Claim:", complianceClaim);
        
        assertTrue(bytes(complianceClaim).length > 0);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ECX PRICING INTEGRATION                       */
    /* -------------------------------------------------------------------------- */

    function test_ECXPricingWithZKProofs() public {
        console.log("\n=== Testing ECX Pricing with ZK Proofs ===");

        vm.startPrank(admin);

        // Update ECX prices
        ecxOracle.updateECXPrice(
            WAGAECXPriceOracle.CoffeeGrade.LWSD4,  // Sidamo Grade 4
            WAGAECXPriceOracle.CoffeeOrigin.SC,    // Sidamo Coffee
            85000, // 85,000 Birr per 17kg
            WAGAECXPriceOracle.DataQuality.HIGH,
            "ECX_DAILY_REPORT",
            90 // 90% confidence
        );
        console.log("[OK] ECX price updated");

        // Get price benchmark
        (uint256 priceUSDPerKg, uint256 confidence, uint256 age) = 
            ecxOracle.getPriceBenchmark(
                WAGAECXPriceOracle.CoffeeGrade.LWSD4,
                WAGAECXPriceOracle.CoffeeOrigin.SC
            );
        
        console.log("  ECX Price (USD/kg):", priceUSDPerKg);
        console.log("  Confidence:", confidence);
        console.log("  Age (seconds):", age);

        assertTrue(priceUSDPerKg > 0);
        assertEq(confidence, 90);

        vm.stopPrank();

        // Add ZK price proof through ZK Manager
        vm.startPrank(address(zkManager));
        
        bytes memory priceZKProof = abi.encodePacked("competitive_price_zk_proof");
        ecxOracle.addZKPriceProof(
            testBatchId,
            WAGAECXPriceOracle.CoffeeGrade.LWSD4,
            WAGAECXPriceOracle.CoffeeOrigin.SC,
            priceZKProof,
            "Competitively Priced vs ECX"
        );
        console.log("[OK] ZK price proof added");

        vm.stopPrank();

        // Validate price competitiveness
        (bool isCompetitive, string memory claim) = 
            ecxOracle.validatePriceCompetitiveness(testBatchId);
        
        assertTrue(isCompetitive);
        assertEq(claim, "Competitively Priced vs ECX");
        
        console.log("[OK] Price competitiveness validated");
        console.log("  Claim:", claim);
    }

    /* -------------------------------------------------------------------------- */
    /*                              REDEMPTION WITH BOE                           */
    /* -------------------------------------------------------------------------- */

    function test_RedemptionWithBankOfEthiopiaCompliance() public {
        // Setup complete compliance and pricing
        test_AddEthiopianComplianceDocuments();
        test_AddZKComplianceProofs();
        test_ECXPricingWithZKProofs();

        console.log("\n=== Testing Redemption with Bank of Ethiopia Compliance ===");

        // CRITICAL: Mark batch as verified to enable redemption
        _markBatchAsVerified(testBatchId);

        // Mint tokens to buyer for redemption
        vm.startPrank(admin);
        coffeeToken.mintBatch(buyer, testBatchId, 100);
        vm.stopPrank();

                // Buyer requests redemption with banking details
        vm.startPrank(buyer);
        string memory bankingDetails = "CBE Account: 123456789, Swift: CBETETAA";
        
        // Approve redemption contract to transfer tokens
        coffeeToken.setApprovalForAll(address(redemption), true);
        
        redemption.requestRedemption(
            testBatchId,
            50, // Redeem 50 bags
            bankingDetails
        );
        console.log("[OK] Redemption requested with banking details");

        vm.stopPrank();

        // Check redemption details
        WAGACoffeeRedemption.RedemptionRequest memory redemptionRequest = 
            redemption.getRedemptionDetails(1000); // First redemption ID

        assertTrue(redemptionRequest.requiresEthiopianCompliance);
        assertEq(redemptionRequest.buyerBankDetails, bankingDetails);
        assertFalse(redemptionRequest.fiatTransferCompleted);
        
        console.log("[OK] Ethiopian compliance requirements detected");
        console.log("  Banking Details:", redemptionRequest.buyerBankDetails);

        // Banking partner confirms fiat transfer
        vm.startPrank(bankingPartner);
        redemption.confirmFiatTransfer(1000, "TXN-BOE-2025-001");
        console.log("[OK] Fiat transfer confirmed by banking partner");
        vm.stopPrank();

        // Verify fiat transfer completion
        (bool requiresCompliance, bool fiatCompleted, string memory transactionId) = 
            redemption.getEthiopianComplianceStatus(1000);
        
        assertTrue(requiresCompliance);
        assertTrue(fiatCompleted);
        assertEq(transactionId, "TXN-BOE-2025-001");
        
        console.log("[OK] Bank of Ethiopia compliance completed");
        console.log("  Transaction ID:", transactionId);
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTEGRATION TESTS                             */
    /* -------------------------------------------------------------------------- */

    function test_EndToEndEthiopianComplianceFlow() public {
        console.log("\n=== End-to-End Ethiopian Compliance Flow ===");

        // 1. Create Ethiopian batch
        test_CreateEthiopianBatchWithCompliance();
        console.log("1. [OK] Ethiopian batch created");

        // 2. Add compliance documents
        test_AddEthiopianComplianceDocuments();
        console.log("2. [OK] Compliance documents added");

        // 3. Add ZK privacy protection
        test_AddZKComplianceProofs();
        console.log("3. [OK] ZK privacy protection enabled");

        // 4. Setup ECX pricing
        test_ECXPricingWithZKProofs();
        console.log("4. [OK] ECX pricing with ZK proofs");

        // 5. Complete redemption with BoE
        test_RedemptionWithBankOfEthiopiaCompliance();
        console.log("5. [OK] Redemption with BoE compliance");

        // Final verification - check all systems are integrated
        assertTrue(batchManager.isReadyForExport(testBatchId));
        assertTrue(zkManager.validateEthiopianZKCompliance(testBatchId));
        
        (bool isCompetitive, ) = ecxOracle.validatePriceCompetitiveness(testBatchId);
        assertTrue(isCompetitive);

        console.log("\n[SUCCESS] COMPLETE ETHIOPIAN COMPLIANCE INTEGRATION SUCCESSFUL! [SUCCESS]");
        console.log("[OK] ZK Privacy: Compliance data protected");
        console.log("[OK] Ethiopian Export: Full ECTA/Quality/Origin compliance");
        console.log("[OK] ECX Pricing: Competitive pricing with privacy");
        console.log("[OK] Bank of Ethiopia: Fiat off-ramping integrated");
        console.log("[OK] End-to-End: Batch creation -> ZK compliance -> Redemption");
    }

    /* -------------------------------------------------------------------------- */
    /*                                EDGE CASES                                  */
    /* -------------------------------------------------------------------------- */

    function test_NonEthiopianBatchSkipsCompliance() public {
        console.log("\n=== Testing Non-Ethiopian Batch Behavior ===");

        // Create non-Ethiopian batch
        vm.startPrank(cooperative);
        uint256 colombianBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            testQuantity,
            30 * 1e18, // $30 per unit price
            "Colombia, Huila", // Non-Ethiopian origin
            "60kg bags",
            "ipfs://colombian-batch"
        );
        vm.stopPrank();

        // Check batch is not flagged as Ethiopian
        (,,,bool isEthiopian,,,) = batchManager.getBatchInfoWithCompliance(colombianBatchId);
        assertFalse(isEthiopian);
        
        // Verify it's ready for export without Ethiopian compliance
        assertTrue(batchManager.isReadyForExport(colombianBatchId));
        
        console.log("[OK] Non-Ethiopian batch bypasses Ethiopian compliance");
    }

    function test_IncompleteComplianceFailsRedemption() public {
        // Create batch but don't add all compliance
        test_CreateEthiopianBatchWithCompliance();

        // Only add ECTA permit, skip quality and origin
        vm.startPrank(processor);
        IEthiopianCompliance.ECTAPermit memory ectaPermit = IEthiopianCompliance.ECTAPermit({
            permitNumber: "ECTA-2025-001",
            exporterName: "Sidamo Coffee Export",
            exporterLicense: "LIC-001",
            issueDate: block.timestamp,
            expiryDate: block.timestamp + 180 days,
            isValid: true,
            permitDocumentHash: "QmECTAhash123"
        });
        
        batchManager.addECTAPermitDuringCreation(testBatchId, ectaPermit);
        vm.stopPrank();

        // Mint tokens and try redemption
        vm.startPrank(admin);
        coffeeToken.mintBatch(buyer, testBatchId, 100);
        vm.stopPrank();

        // Should fail due to incomplete compliance
        vm.startPrank(buyer);
        vm.expectRevert();
        redemption.requestRedemption(
            testBatchId,
            50,
            "CBE Account: 123456789"
        );
        vm.stopPrank();

        console.log("[OK] Incomplete compliance correctly blocks redemption");
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
    
    /**
     * @dev Helper function to create mock Groth16 proof data (256 bytes)
     * @notice This creates valid-length proof data for testing, but proofs will fail verification
     */
    function _createMockGroth16Proof() internal pure returns (bytes memory) {
        // Keep the old function for backwards compatibility if needed
        return _createValidMockGroth16Proof();
    }

    /**
     * @dev Helper function to mark batch as verified for redemption testing
     * @notice This simulates the Chainlink verification completion process
     */
    function _markBatchAsVerified(uint256 batchId) internal {
        vm.startPrank(admin);
        
        // Mark batch as verified (sets bit 0)
        batchManager.markBatchAsVerified(batchId);
        
        // Also verify metadata (sets bit 1) - required for redemption
        batchManager.verifyBatchMetadata(
            batchId,
            "60kg bags", // Mock verified packaging
            "QmMockMetadataHash123" // Mock verified metadata hash
        );
        
        vm.stopPrank();
    }
}
