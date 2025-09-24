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
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";
import {IPrivacyLayer} from "../../src/Interfaces/IPrivacyLayer.sol";

/**
 * @title EUDRComplianceIntegrationTest
 * @dev End-to-end integration tests for EUDR compliance workflows
 * Tests complete EUDR compliance process from batch creation to redemption
 */
contract EUDRComplianceIntegrationTest is Test {
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
    CircomVerifier public circomVerifier;
    MockCircomVerifier public mockVerifier;
    PrivacyLayer public privacyLayer;
    MockUSDC public usdc;

    // Test accounts
    address public admin = makeAddr("admin");
    address public processor = makeAddr("processor");
    address public verifier = makeAddr("verifier");
    address public consumer = makeAddr("consumer");
    address public offrampPartner = makeAddr("offrampPartner");
    address public seller = makeAddr("seller");

    // Test constants
    uint256 constant QUANTITY = 100;
    uint256 constant PRICE_PER_UNIT = 5000; // $50
    uint256 constant TOTAL_VALUE = QUANTITY * PRICE_PER_UNIT; // 500,000 USDC
    bytes11 constant OFFRAMP_SWIFT = "DBSSGB2LXXX"; // DBS Bank Singapore

    uint256 public testBatchId;

    /* -------------------------------------------------------------------------- */
    /*                                 Setup                                      */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        console.log("=== EUDR Compliance Integration Test Setup ===");

        // Deploy the entire system
        deployer = new DeployRealZKMVP();
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemption,
            ,  // cdpIntegration - not used in this test
            ,  // proofOfReserve - not used in this test
            ,  // inventoryManager - not used in this test
            ethiopianCompliance,
            ,  // ecxOracle - not used in this test
            circomVerifier,
            helperConfig
        ) = deployer.run();

        // Note: AccessControl functionality now in ConfigManager (inherited by CoffeeToken)
        
        // Get the actual admin address from the deployment
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        address deployerAddress = vm.addr(config.deployerKey);

        // Setup roles and test environment
        vm.startPrank(deployerAddress);

        // Grant roles using unified ConfigManager functions
        coffeeToken.grantProcessorRole(processor);
        coffeeToken.grantVerifierRole(verifier);
        coffeeToken.grantProcessorRole(admin); // Admin also gets processor role

        // Register seller using ConfigManager
        coffeeToken.registerSeller(
            seller,
            WAGAConfigManager.SellerType.COOPERATIVE,
            "Test Cooperative",
            "REG001",
            "TESTSWIFTXX"
        );

        // Setup banking
        ethiopianCompliance.addBankingPartner(offrampPartner, "Global Offramp");

        // Deploy MockUSDC and fund treasury
        usdc = new MockUSDC();
        usdc.mint(address(treasury), TOTAL_VALUE * 2);

        // Configure mock verifier for testing
        mockVerifier = new MockCircomVerifier();
        // Note: MockCircomVerifier doesn't require role setup - it's a mock for testing

        // Replace zkManager with test version using mock verifier
        WAGAZKManager testZKManager = new WAGAZKManager(address(coffeeToken), address(mockVerifier));
        coffeeToken.setManagerAddresses(address(batchManager), address(testZKManager));
        zkManager = testZKManager;

        vm.stopPrank();

        console.log("EUDR Compliance Integration Test Setup Complete");
    }

    /* -------------------------------------------------------------------------- */
    /*                           EUDR COMPLIANCE WORKFLOWS                       */
    /* -------------------------------------------------------------------------- */

    function testEndToEndEUDRComplianceWorkflow() public {
        console.log("=== Testing End-to-End EUDR Compliance Workflow ===");

        // Step 1: Create EUDR-compliant batch
        vm.startPrank(processor);
        testBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Ethiopian Yirgacheffe",
            "Premium EUDR Compliant",
            "ipfs://eudr-compliant-batch-metadata"
        );
        console.log("Created EUDR-compliant batch:", testBatchId);
        vm.stopPrank();

        // Step 2: Register EUDR compliance during batch creation
        vm.startPrank(processor);

        IEthiopianCompliance.EUDRCertificate memory eudrCert = IEthiopianCompliance.EUDRCertificate({
            certificateId: "EUDR-2024-001",
            issuer: "European Commission",
            issueDate: block.timestamp - 30 days,
            expiryDate: block.timestamp + 365 days,
            isValid: true,
            geoDataHash: "geo-hash-eudr-test",
            complianceLevel: "High",
            deforestationRisk: "Low"
        });

        IEthiopianCompliance.GeolocationData memory geoData = IEthiopianCompliance.GeolocationData({
            plotType: "Coffee Farm",
            coordinates: "8.5476N, 39.2695E",
            plotSize: 250, // 2.5 hectares
            verificationMethod: "GPS + Satellite"
        });

        // Register EUDR certificate
        batchManager.registerEUDRComplianceWithZK(
            testBatchId,
            eudrCert,
            _createValidMockGroth16Proof()
        );

        // Add geolocation data
        batchManager.addEUDRGeolocationDataWithZK(
            testBatchId,
            geoData,
            _createValidMockGroth16Proof()
        );

        vm.stopPrank();

        console.log("Registered EUDR compliance and geolocation data");

        // Step 3: Add ZK proofs for EUDR compliance
        vm.startPrank(admin);

        // Add EUDR deforestation proof
        zkManager.addComplianceZKProof(
            testBatchId,
            "EUDR_DEFORESTATION",
            _createValidMockGroth16Proof(),
            "Deforestation-Free - Satellite Verified"
        );

        // Add EUDR geolocation proof
        zkManager.addComplianceZKProof(
            testBatchId,
            "EUDR_GEOLOCATION",
            _createValidMockGroth16Proof(),
            "Geolocation Verified - GPS Confirmed"
        );

        vm.stopPrank();

        console.log("Added EUDR ZK proofs");

        // Step 4: Configure privacy settings for EUDR data
        vm.startPrank(admin);

        privacyLayer.configureEUDRDisclosureRules(
            testBatchId,
            PrivacyLayer.SelectiveDisclosureRules({
                deforestationPrivate: true,
                geolocationPrivate: true,
                permitDataPrivate: false,
                certificateDataPrivate: false,
                originDataPrivate: true,
                boeDataPrivate: true,
                minRoleLevel: 2 // PROCESSOR level
            })
        );

        // Add EUDR compliance claims
        PrivacyLayer.ZKComplianceClaims memory claims = PrivacyLayer.ZKComplianceClaims({
            deforestationClaim: "Deforestation-Free",
            geolocationClaim: "8.5476N, 39.2695E",
            permitValidityClaim: "Valid ECTA Permit",
            certificateAuthenticityClaim: "Authentic Quality Certificate",
            originVerificationClaim: "Ethiopian Origin Verified",
            boeComplianceClaim: "BoE Registration Complete",
            lastUpdated: block.timestamp
        });

        privacyLayer.updateEUDRComplianceClaims(testBatchId, claims);

        vm.stopPrank();

        console.log("Configured EUDR privacy settings and claims");

        // Step 5: Mint tokens to consumer
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, testBatchId, QUANTITY);
        vm.stopPrank();

        console.log("Minted tokens to consumer");

        // Step 6: Verify EUDR compliance status
        bool eudrCompliant = zkManager.validateCompliance(testBatchId, "EUDR");
        assertTrue(eudrCompliant, "Batch should be EUDR compliant");

        bool hasEUDRProofs = zkManager.validateCompliance(testBatchId, "EUDR");
        assertTrue(hasEUDRProofs, "Batch should have EUDR proofs");

        console.log("Verified EUDR compliance status");

        // Step 7: Test redemption with EUDR compliance requirement
        vm.startPrank(consumer);

        uint256 redemptionId = redemption.requestRedemption(
            testBatchId,
            QUANTITY,
            "EUDR Compliance Test Bank Details"
        );

        console.log("Requested redemption with EUDR compliance:", redemptionId);

        vm.stopPrank();

        // Step 8: Verify redemption details include EUDR compliance
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

        assertTrue(requiresEUDRCompliance, "Redemption should require EUDR compliance");

        console.log("Verified redemption includes EUDR compliance requirements");

        // Step 9: Test privacy access controls
        vm.startPrank(processor);
        bool processorAccess = privacyLayer.canAccessEUDRData(testBatchId, processor, "deforestation");
        assertTrue(processorAccess, "Processor should have access to EUDR data");

        PrivacyLayer.ZKComplianceClaims memory retrievedClaims = privacyLayer.getEUDRComplianceClaims(testBatchId, processor);
        assertEq(retrievedClaims.deforestationClaim, "Deforestation-Free");
        vm.stopPrank();

        console.log("Verified privacy access controls");

        console.log("=== End-to-End EUDR Compliance Workflow Complete ===");
    }

    function testEUDRComplianceWithEthiopianExportWorkflow() public {
        console.log("=== Testing EUDR + Ethiopian Export Compliance Workflow ===");

        // Step 1: Create compliant batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Ethiopian Sidamo",
            "EUDR + Export Compliant",
            "ipfs://dual-compliant-batch"
        );
        vm.stopPrank();

        // Step 2: Register EUDR compliance
        vm.startPrank(processor);

        IEthiopianCompliance.EUDRCertificate memory eudrCert = IEthiopianCompliance.EUDRCertificate({
            certificateId: "EUDR-2024-002",
            issuer: "European Commission",
            issueDate: block.timestamp - 15 days,
            expiryDate: block.timestamp + 395 days,
            isValid: true,
            geoDataHash: "geo-hash-batch-2-test",
            complianceLevel: "High",
            deforestationRisk: "Very Low"
        });

        batchManager.registerEUDRComplianceWithZK(
            batchId,
            eudrCert,
            _createValidMockGroth16Proof()
        );

        batchManager.addEUDRGeolocationDataWithZK(
            batchId,
            IEthiopianCompliance.GeolocationData({
                plotType: "Ethiopian Coffee Estate",
                coordinates: "7.1234N, 38.7654E",
                plotSize: 150,
                verificationMethod: "GPS + Drone Survey"
            }),
            _createValidMockGroth16Proof()
        );

        vm.stopPrank();

        // Step 3: Add Ethiopian compliance proofs
        vm.startPrank(admin);

        zkManager.addComplianceZKProof(
            batchId,
            "ECTA_PERMIT",
            _createValidMockGroth16Proof(),
            "ECTA Export Permit Valid - NBE Approved"
        );

        zkManager.addComplianceZKProof(
            batchId,
            "QUALITY_CERT",
            _createValidMockGroth16Proof(),
            "Quality Certificate Authentic - SCA Certified"
        );

        zkManager.addComplianceZKProof(
            batchId,
            "ORIGIN_VERIFICATION",
            _createValidMockGroth16Proof(),
            "Origin Verified - Sidamo Region"
        );

        zkManager.addComplianceZKProof(
            batchId,
            "ECTA_PERMIT",
            _createValidMockGroth16Proof(),
            "BoE Forex Compliance - Export Declaration Filed"
        );

        vm.stopPrank();

        console.log("Added both EUDR and Ethiopian compliance proofs");

        // Step 4: Verify dual compliance
        bool eudrCompliant = zkManager.validateCompliance(batchId, "EUDR");
        bool ethiopianCompliant = zkManager.validateCompliance(batchId, "ETHIOPIAN");

        assertTrue(eudrCompliant, "Should be EUDR compliant");
        assertTrue(ethiopianCompliant, "Should be Ethiopian compliant");

        console.log("Verified dual compliance status");

        // Step 5: Mint and redeem with compliance requirements
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, QUANTITY);
        vm.stopPrank();

        vm.startPrank(consumer);
        uint256 redemptionId = redemption.requestRedemption(batchId, QUANTITY, "Cross-Contract Test Bank Details");
        vm.stopPrank();

        // Step 6: Record offramp transfer
        vm.startPrank(offrampPartner);
        ethiopianCompliance.recordOfframpTransferInitiated(batchId, consumer, OFFRAMP_SWIFT, TOTAL_VALUE);
        vm.stopPrank();

        console.log("Completed redemption with dual compliance requirements");

        // Step 7: Verify complete workflow
        (
            ,
            ,
            ,
            ,
            ,
            bool requiresEthiopianCompliance,
            bool requiresEUDRCompliance,
            ,
            ,
        ) = redemption.getEnhancedRedemptionDetails(redemptionId);

        assertTrue(requiresEthiopianCompliance, "Should require Ethiopian compliance");
        assertTrue(requiresEUDRCompliance, "Should require EUDR compliance");

        console.log("=== EUDR + Ethiopian Export Compliance Workflow Complete ===");
    }

    function testEUDRPrivacyLevelsAndAccessControl() public {
        console.log("=== Testing EUDR Privacy Levels and Access Control ===");

        // Create multiple batches with different privacy levels
        vm.startPrank(processor);

        uint256[] memory batchIds = new uint256[](3);
        for (uint256 i = 0; i < 3; i++) {
            batchIds[i] = coffeeToken.createBatch(
                block.timestamp,
                block.timestamp + 365 days,
                QUANTITY,
                PRICE_PER_UNIT + i * 1000,
                "Test Origin",
                "Test Packaging",
                string(abi.encodePacked("ipfs://test-batch-", vm.toString(i)))
            );
        }

        vm.stopPrank();

        // Configure different privacy levels
        vm.startPrank(admin);

        IPrivacyLayer.PrivacyLevel[3] memory levels = [
            IPrivacyLayer.PrivacyLevel.PUBLIC,
            IPrivacyLayer.PrivacyLevel.SELECTIVE,
            IPrivacyLayer.PrivacyLevel.PRIVATE
        ];

        string[3] memory descriptions = [
            "Public EUDR disclosure",
            "Processor-only EUDR disclosure",
            "Private EUDR disclosure"
        ];

        for (uint256 i = 0; i < 3; i++) {
            // Create SelectiveDisclosureRules based on privacy level
            PrivacyLayer.SelectiveDisclosureRules memory rules;
            if (levels[i] == IPrivacyLayer.PrivacyLevel.PUBLIC) {
                rules = PrivacyLayer.SelectiveDisclosureRules({
                    deforestationPrivate: false,
                    geolocationPrivate: false,
                    permitDataPrivate: false,
                    certificateDataPrivate: false,
                    originDataPrivate: false,
                    boeDataPrivate: false,
                    minRoleLevel: 0
                });
            } else if (levels[i] == IPrivacyLayer.PrivacyLevel.SELECTIVE) {
                rules = PrivacyLayer.SelectiveDisclosureRules({
                    deforestationPrivate: true,
                    geolocationPrivate: true,
                    permitDataPrivate: false,
                    certificateDataPrivate: false,
                    originDataPrivate: true,
                    boeDataPrivate: true,
                    minRoleLevel: 2
                });
            } else { // PRIVATE
                rules = PrivacyLayer.SelectiveDisclosureRules({
                    deforestationPrivate: true,
                    geolocationPrivate: true,
                    permitDataPrivate: true,
                    certificateDataPrivate: true,
                    originDataPrivate: true,
                    boeDataPrivate: true,
                    minRoleLevel: 3
                });
            }
            
            privacyLayer.configureEUDRDisclosureRules(batchIds[i], rules);

            // Add EUDR claims to all batches
            PrivacyLayer.ZKComplianceClaims memory claims = PrivacyLayer.ZKComplianceClaims({
                deforestationClaim: "Compliant",
                geolocationClaim: string(abi.encodePacked("Location ", vm.toString(i))),
                permitValidityClaim: "Valid ECTA Permit",
                certificateAuthenticityClaim: "Authentic Certificate",
                originVerificationClaim: "Ethiopian Origin Verified",
                boeComplianceClaim: "BoE Registration Complete",
                lastUpdated: block.timestamp
            });

            privacyLayer.updateEUDRComplianceClaims(batchIds[i], claims);
        }

        vm.stopPrank();

        // Test access control for different user types
        address[3] memory testUsers = [consumer, processor, admin]; // consumer (no role), processor, admin
        string[3] memory userTypes = ["Consumer", "Processor", "Admin"];

        console.log("Testing access control for different user types:");

        for (uint256 batchIndex = 0; batchIndex < 3; batchIndex++) {
            string memory privacyLevel = batchIndex == 0 ? "PUBLIC" : batchIndex == 1 ? "PROCESSOR_ONLY" : "PRIVATE";

            console.log(string(abi.encodePacked("Batch ", vm.toString(batchIndex), " (", privacyLevel, "):")));

            for (uint256 userIndex = 0; userIndex < 3; userIndex++) {
                vm.startPrank(testUsers[userIndex]);

                bool canAccess = privacyLayer.canAccessEUDRData(batchIds[batchIndex], testUsers[userIndex], "deforestation");

                string memory accessResult = canAccess ? "YES" : "NO";

                console.log(string(abi.encodePacked(
                    "  ", userTypes[userIndex], ": ", accessResult
                )));

                // Verify expected access patterns
                if (batchIndex == 0) { // PUBLIC
                    assertTrue(canAccess, "Public batch should allow all access");
                } else if (batchIndex == 1) { // PROCESSOR_ONLY
                    bool expectedAccess = (testUsers[userIndex] == processor || testUsers[userIndex] == admin);
                    assertEq(canAccess, expectedAccess, "Processor-only batch should restrict access correctly");
                } else if (batchIndex == 2) { // PRIVATE
                    bool expectedAccess = (testUsers[userIndex] == admin);
                    assertEq(canAccess, expectedAccess, "Private batch should only allow admin access");
                }

                vm.stopPrank();
            }
        }

        console.log("=== EUDR Privacy Levels and Access Control Test Complete ===");
    }

    function testEUDRComplianceFailureScenarios() public {
        console.log("=== Testing EUDR Compliance Failure Scenarios ===");

        // Create a batch
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

        // Mint tokens to consumer
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, QUANTITY);
        vm.stopPrank();

        // Test 1: Redemption fails without EUDR compliance
        vm.startPrank(consumer);

        vm.expectRevert("EUDR compliance not met");
        redemption.requestRedemption(batchId, QUANTITY, "Comprehensive Test Bank Details");

        vm.stopPrank();

        console.log("Verified redemption fails without EUDR compliance");

        // Test 2: Partial EUDR compliance (only deforestation, no geolocation)
        vm.startPrank(processor);

        batchManager.registerEUDRComplianceWithZK(
            batchId,
            IEthiopianCompliance.EUDRCertificate({
                certificateId: "EUDR-2024-003",
                issuer: "European Commission",
                issueDate: block.timestamp - 10 days,
                expiryDate: block.timestamp + 355 days,
                isValid: true,
                geoDataHash: "geo-hash-comprehensive-test",
                complianceLevel: "Medium",
                deforestationRisk: "Low"
            }),
            _createValidMockGroth16Proof()
        );

        vm.stopPrank();

        // Add only deforestation proof (no geolocation)
        vm.startPrank(admin);
        zkManager.addComplianceZKProof(
            batchId,
            "EUDR_DEFORESTATION",
            _createValidMockGroth16Proof(),
            "Deforestation compliant"
        );
        vm.stopPrank();

        // Verify partial compliance
        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = batchManager.validateEUDRZKCompliance(batchId);
        assertTrue(deforestationCompliant, "Should have deforestation compliance");
        assertFalse(geolocationVerified, "Should not have geolocation verification");
        assertFalse(fullyCompliant, "Should not be fully compliant");

        // Redemption should still fail
        vm.startPrank(consumer);
        vm.expectRevert("EUDR compliance not met");
        redemption.requestRedemption(batchId, QUANTITY, "Comprehensive Test Bank Details");
        vm.stopPrank();

        console.log("Verified redemption fails with partial EUDR compliance");

        // Test 3: Expired certificate
        vm.startPrank(processor);

        vm.expectRevert("EUDR certificate expired");
        batchManager.registerEUDRComplianceWithZK(
            batchId,
            IEthiopianCompliance.EUDRCertificate({
                certificateId: "EUDR-2024-004",
                issuer: "European Commission",
                issueDate: block.timestamp - 400 days,
                expiryDate: block.timestamp - 30 days, // Expired
                isValid: true,
                geoDataHash: "geo-hash-expired-test",
                complianceLevel: "High",
                deforestationRisk: "Low"
            }),
            _createValidMockGroth16Proof()
        );

        vm.stopPrank();

        console.log("Verified expired certificate rejection");

        console.log("=== EUDR Compliance Failure Scenarios Test Complete ===");
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
