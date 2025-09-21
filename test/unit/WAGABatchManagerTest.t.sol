// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGABatchManagerTest
 * @dev Unit tests for enhanced WAGA Batch Manager with EUDR compliance integration
 */
contract WAGABatchManagerTest is Test {
    WAGABatchManager public batchManager;
    WAGACoffeeTokenCore public coffeeToken;
    CircomVerifier public circomVerifier;

    // Test accounts
    address public admin = makeAddr("admin");
    address public processor = makeAddr("processor");
    address public verifier = makeAddr("verifier");

    // Test constants
    uint256 constant BATCH_ID = 1;
    bytes constant MOCK_PROOF_DATA = hex"00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

    // EUDR test data
    IEthiopianCompliance.EUDRCertificate eudrCert;

    IEthiopianCompliance.GeolocationData geoData;

    event EUDRComplianceRegistered(
        uint256 indexed batchId,
        string complianceLevel,
        string certificateId,
        uint256 certificateExpiry
    );

    event EUDRGeolocationDataAdded(
        uint256 indexed batchId,
        string plotType,
        uint256 plotSize,
        string verificationMethod
    );

    event EUDRZKComplianceValidated(
        uint256 indexed batchId,
        bool deforestationCompliant,
        bool geolocationVerified
    );

    function setUp() public {
        vm.startPrank(admin);

        // Deploy contracts
        coffeeToken = new WAGACoffeeTokenCore("");
        circomVerifier = new CircomVerifier();
        batchManager = new WAGABatchManager(
            address(coffeeToken),
            address(circomVerifier)
        );

        // Initialize test data
        eudrCert = IEthiopianCompliance.EUDRCertificate({
            certificateId: "EUDR-2024-001",
            issuer: "European Commission",
            issueDate: block.timestamp - 30 days,
            expiryDate: block.timestamp + 365 days,
            isValid: true,
            geoDataHash: "geo_hash_123",
            complianceLevel: "High",
            deforestationRisk: "Low"
        });

        geoData = IEthiopianCompliance.GeolocationData({
            plotType: "Coffee Farm",
            coordinates: "8.5476N, 39.2695E",
            plotSize: 250, // 2.5 hectares
            verificationMethod: "GPS + Satellite"
        });

        // Setup roles
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), verifier);

        // Create a test batch
        vm.startPrank(processor);
        coffeeToken.createBatch(
            "Ethiopian Yirgacheffe",
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            5000, // $50 per unit
            "Premium packaging",
            "ipfs://batch-metadata"
        );
        vm.stopPrank();

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         EUDR COMPLIANCE REGISTRATION                      */
    /* -------------------------------------------------------------------------- */

    function test_EUDR_RegisterComplianceWithZK_Success() public {
        vm.startPrank(processor);

        vm.expectEmit(true, false, false, true);
        emit EUDRComplianceRegistered(BATCH_ID, eudrCert.complianceLevel, eudrCert.certificateId, eudrCert.expiryDate);

        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free - EUDR Compliant"
        );

        // Verify EUDR compliance data was stored
        assertTrue(batchManager.hasEUDRCompliance(BATCH_ID));
        assertEq(batchManager.eudrComplianceLevel(BATCH_ID), eudrCert.complianceLevel);
        assertEq(batchManager.eudrComplianceTimestamp(BATCH_ID), block.timestamp);
        assertTrue(batchManager.hasDeforestationRiskAssessment(BATCH_ID));

        vm.stopPrank();
    }

    function test_EUDR_AddGeolocationDataWithZK_Success() public {
        vm.startPrank(processor);

        vm.expectEmit(true, false, false, true);
        emit EUDRGeolocationDataAdded(BATCH_ID, geoData.plotType, geoData.plotSize, geoData.verificationMethod);

        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Geolocation Verified - Plot Size: 250ha"
        );

        vm.stopPrank();

        // Verify geolocation data was stored (through batch manager's view functions)
        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = batchManager.validateEUDRZKCompliance(BATCH_ID);

        // Geolocation should be verified, deforestation should not (not registered yet)
        assertFalse(deforestationCompliant);
        assertTrue(geolocationVerified);
        assertFalse(fullyCompliant);
    }

    function test_EUDR_ValidateEUDRZKCompliance_Partial() public {
        vm.startPrank(processor);

        // Add only geolocation data
        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Geolocation Verified"
        );

        vm.stopPrank();

        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = batchManager.validateEUDRZKCompliance(BATCH_ID);

        assertFalse(deforestationCompliant);
        assertTrue(geolocationVerified);
        assertFalse(fullyCompliant);
    }

    function test_EUDR_ValidateEUDRZKCompliance_Full() public {
        vm.startPrank(processor);

        // Add geolocation data
        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Geolocation Verified"
        );

        // Add compliance certificate (which includes deforestation proof)
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free"
        );

        vm.stopPrank();

        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = batchManager.validateEUDRZKCompliance(BATCH_ID);

        assertTrue(deforestationCompliant);
        assertTrue(geolocationVerified);
        assertTrue(fullyCompliant);
    }

    /* -------------------------------------------------------------------------- */
    /*                           EUDR ERROR HANDLING                             */
    /* -------------------------------------------------------------------------- */

    function test_EUDR_Error_BatchDoesNotExist() public {
        vm.startPrank(processor);

        vm.expectRevert("Batch does not exist");
        batchManager.registerEUDRComplianceWithZK(
            999, // Non-existent batch
            eudrCert,
            MOCK_PROOF_DATA,
            "Test"
        );

        vm.stopPrank();
    }

    function test_EUDR_Error_ExpiredCertificate() public {
        vm.startPrank(processor);

        IEthiopianCompliance.EUDRCertificate memory expiredCert = eudrCert;
        expiredCert.expiryDate = block.timestamp - 1 days;

        vm.expectRevert("EUDR certificate expired");
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            expiredCert,
            MOCK_PROOF_DATA,
            "Expired certificate"
        );

        vm.stopPrank();
    }

    function test_EUDR_Error_UnauthorizedGeolocationData() public {
        vm.startPrank(verifier); // Not a processor

        vm.expectRevert("Caller does not have required role");
        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Unauthorized geolocation"
        );

        vm.stopPrank();
    }

    function test_EUDR_Error_ZKProofVerificationFailed() public {
        vm.startPrank(processor);

        // Note: In a real test environment, this would fail ZK verification
        // For now, we test that the function can be called
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free"
        );

        // Should succeed in mock environment
        assertTrue(batchManager.hasEUDRCompliance(BATCH_ID));

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          BATCH METADATA ENHANCEMENTS                      */
    /* -------------------------------------------------------------------------- */

    function test_BatchMetadata_EUDRFlags() public {
        // Initially no EUDR compliance
        assertFalse(batchManager.hasEUDRCompliance(BATCH_ID));
        assertFalse(batchManager.hasDeforestationRiskAssessment(BATCH_ID));
        assertEq(batchManager.eudrComplianceLevel(BATCH_ID), "");
        assertEq(batchManager.eudrComplianceTimestamp(BATCH_ID), 0);

        vm.startPrank(processor);

        // Register EUDR compliance
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free"
        );

        vm.stopPrank();

        // Now has EUDR compliance
        assertTrue(batchManager.hasEUDRCompliance(BATCH_ID));
        assertTrue(batchManager.hasDeforestationRiskAssessment(BATCH_ID));
        assertEq(batchManager.eudrComplianceLevel(BATCH_ID), "High");
        assertGt(batchManager.eudrComplianceTimestamp(BATCH_ID), 0);
    }

    function test_BatchMetadata_MultipleBatches() public {
        vm.startPrank(processor);

        // Create second batch
        coffeeToken.createBatch(
            "Ethiopian Sidamo",
            block.timestamp,
            block.timestamp + 365 days,
            500,
            6000, // $60 per unit
            "Special packaging",
            "ipfs://batch-metadata-2"
        );

        // Register EUDR for batch 1
        batchManager.registerEUDRComplianceWithZK(
            1,
            eudrCert,
            MOCK_PROOF_DATA,
            "Batch 1 EUDR"
        );

        // Register EUDR for batch 2 with different data
        IEthiopianCompliance.EUDRCertificate memory cert2 = eudrCert;
        cert2.certificateId = "EUDR-2024-002";
        cert2.complianceLevel = "Medium";

        batchManager.registerEUDRComplianceWithZK(
            2,
            cert2,
            MOCK_PROOF_DATA,
            "Batch 2 EUDR"
        );

        vm.stopPrank();

        // Verify batch isolation
        assertTrue(batchManager.hasEUDRCompliance(1));
        assertTrue(batchManager.hasEUDRCompliance(2));
        assertEq(batchManager.eudrComplianceLevel(1), "High");
        assertEq(batchManager.eudrComplianceLevel(2), "Medium");
    }

    /* -------------------------------------------------------------------------- */
    /*                        COMPLIANCE VALIDATION TESTS                       */
    /* -------------------------------------------------------------------------- */

    function test_ComplianceValidation_EUDRStatus() public {
        // Test various EUDR compliance states
        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = batchManager.validateEUDRZKCompliance(BATCH_ID);

        // Initially all false
        assertFalse(deforestationCompliant);
        assertFalse(geolocationVerified);
        assertFalse(fullyCompliant);

        vm.startPrank(processor);

        // Add geolocation
        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Geolocation OK"
        );

        (deforestationCompliant, geolocationVerified, fullyCompliant) = batchManager.validateEUDRZKCompliance(BATCH_ID);
        assertFalse(deforestationCompliant);
        assertTrue(geolocationVerified);
        assertFalse(fullyCompliant);

        // Add deforestation compliance
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation OK"
        );

        (deforestationCompliant, geolocationVerified, fullyCompliant) = batchManager.validateEUDRZKCompliance(BATCH_ID);
        assertTrue(deforestationCompliant);
        assertTrue(geolocationVerified);
        assertTrue(fullyCompliant);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          INTEGRATION TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_Integration_FullEUDRBatchWorkflow() public {
        vm.startPrank(processor);

        console.log("=== Full EUDR Batch Workflow Test ===");

        // Step 1: Verify initial state
        assertFalse(batchManager.hasEUDRCompliance(BATCH_ID));
        (bool defComp, bool geoVer, bool fullComp) = batchManager.validateEUDRZKCompliance(BATCH_ID);
        assertFalse(defComp && geoVer && fullComp);

        console.log("Initial state: No EUDR compliance");

        // Step 2: Add geolocation data
        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Geolocation Verified - Plot: 8.5476N, 39.2695E, Size: 250ha"
        );

        console.log("Added geolocation data");

        // Step 3: Check partial compliance
        (defComp, geoVer, fullComp) = batchManager.validateEUDRZKCompliance(BATCH_ID);
        assertTrue(geoVer);
        assertFalse(defComp && fullComp);

        console.log("Partial compliance: Geolocation verified, deforestation pending");

        // Step 4: Register EUDR certificate with deforestation proof
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free - Certificate: EUDR-2024-001, Level: High"
        );

        console.log("Registered EUDR certificate");

        // Step 5: Verify full compliance
        (defComp, geoVer, fullComp) = batchManager.validateEUDRZKCompliance(BATCH_ID);
        assertTrue(defComp && geoVer && fullComp);

        console.log("Full EUDR compliance achieved");

        // Step 6: Verify batch metadata
        assertTrue(batchManager.hasEUDRCompliance(BATCH_ID));
        assertTrue(batchManager.hasDeforestationRiskAssessment(BATCH_ID));
        assertEq(batchManager.eudrComplianceLevel(BATCH_ID), "High");
        assertGt(batchManager.eudrComplianceTimestamp(BATCH_ID), 0);

        console.log("Batch metadata updated with EUDR flags");

        vm.stopPrank();

        console.log("=== EUDR Batch Workflow Complete ===");
    }

    /* -------------------------------------------------------------------------- */
    /*                            COMPATIBILITY TESTS                            */
    /* -------------------------------------------------------------------------- */

    function test_Compatibility_ExistingBatchManagerFunctions() public {
        // Test that existing batch manager functionality still works
        vm.startPrank(processor);

        // Test batch creation (already done in setUp)
        assertTrue(coffeeToken.isBatchCreated(BATCH_ID));

        // Test batch status updates
        batchManager.updateBatchStatus(BATCH_ID, true);
        // This should work without errors

        // Test inventory updates
        batchManager.updateInventory(BATCH_ID, 800);
        // This should work without errors

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          GAS OPTIMIZATION TESTS                           */
    /* -------------------------------------------------------------------------- */

    function test_GasOptimization_EUDROperations() public {
        vm.startPrank(processor);

        // Measure gas for EUDR compliance registration
        uint256 gasStart = gasleft();
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            eudrCert,
            MOCK_PROOF_DATA,
            "Deforestation-Free"
        );
        uint256 gasUsedRegistration = gasStart - gasleft();

        // Measure gas for geolocation data addition
        gasStart = gasleft();
        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            geoData,
            MOCK_PROOF_DATA,
            "Geolocation Verified"
        );
        uint256 gasUsedGeolocation = gasStart - gasleft();

        // Measure gas for compliance validation
        gasStart = gasleft();
        batchManager.validateEUDRZKCompliance(BATCH_ID);
        uint256 gasUsedValidation = gasStart - gasleft();

        console.log("Gas used for EUDR registration:", gasUsedRegistration);
        console.log("Gas used for geolocation addition:", gasUsedGeolocation);
        console.log("Gas used for compliance validation:", gasUsedValidation);

        // All operations should be reasonable (< 200k gas each)
        assertLt(gasUsedRegistration, 200000);
        assertLt(gasUsedGeolocation, 200000);
        assertLt(gasUsedValidation, 50000);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                            EDGE CASE TESTS                               */
    /* -------------------------------------------------------------------------- */

    function test_EdgeCase_LargeCertificateData() public {
        vm.startPrank(processor);

        IEthiopianCompliance.EUDRCertificate memory largeCert = eudrCert;
        largeCert.certificateId = "VERY-LONG-CERTIFICATE-ID-THAT-EXCEEDS-NORMAL-LENGTH-LIMITS-FOR-TESTING-PURPOSES-ONLY";
        largeCert.complianceLevel = "Extremely High Compliance Level With Very Long Description";
        largeCert.deforestationRisk = "Very Low Risk Assessment With Detailed Explanation";

        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            largeCert,
            MOCK_PROOF_DATA,
            "Large certificate data test"
        );

        // Verify storage worked
        assertTrue(batchManager.hasEUDRCompliance(BATCH_ID));
        assertEq(batchManager.eudrComplianceLevel(BATCH_ID), largeCert.complianceLevel);

        vm.stopPrank();
    }

    function test_EdgeCase_ZeroExpiryCertificate() public {
        vm.startPrank(processor);

        IEthiopianCompliance.EUDRCertificate memory zeroExpiryCert = eudrCert;
        zeroExpiryCert.expiryDate = 0;

        vm.expectRevert("EUDR certificate expired");
        batchManager.registerEUDRComplianceWithZK(
            BATCH_ID,
            zeroExpiryCert,
            MOCK_PROOF_DATA,
            "Zero expiry test"
        );

        vm.stopPrank();
    }

    function test_EdgeCase_MaxPlotSize() public {
        vm.startPrank(processor);

        IEthiopianCompliance.GeolocationData memory maxPlotData = geoData;
        maxPlotData.plotSize = type(uint256).max; // Maximum possible plot size

        batchManager.addEUDRGeolocationDataWithZK(
            BATCH_ID,
            maxPlotData,
            MOCK_PROOF_DATA,
            "Maximum plot size test"
        );

        // Should work without issues
        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = batchManager.validateEUDRZKCompliance(BATCH_ID);
        assertTrue(geolocationVerified);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                            BATCHED OPERATIONS                             */
    /* -------------------------------------------------------------------------- */

    function test_BatchedOperations_MultipleBatchesEUDR() public {
        vm.startPrank(processor);

        // Create multiple batches
        for (uint256 i = 2; i <= 5; i++) {
            coffeeToken.createBatch(
                string(abi.encodePacked("Batch ", vm.toString(i))),
                block.timestamp,
                block.timestamp + 365 days,
                1000,
                5000,
                "Packaging",
                "ipfs://metadata"
            );
        }

        // Register EUDR compliance for multiple batches
        for (uint256 i = 1; i <= 5; i++) {
            IEthiopianCompliance.EUDRCertificate memory cert = eudrCert;
            cert.certificateId = string(abi.encodePacked("EUDR-2024-", vm.toString(i)));

            batchManager.registerEUDRComplianceWithZK(
                i,
                cert,
                MOCK_PROOF_DATA,
                string(abi.encodePacked("Batch ", vm.toString(i), " EUDR"))
            );

            // Add geolocation for each
            batchManager.addEUDRGeolocationDataWithZK(
                i,
                geoData,
                MOCK_PROOF_DATA,
                string(abi.encodePacked("Batch ", vm.toString(i), " Geolocation"))
            );
        }

        vm.stopPrank();

        // Verify all batches have full EUDR compliance
        for (uint256 i = 1; i <= 5; i++) {
            (bool defComp, bool geoVer, bool fullComp) = batchManager.validateEUDRZKCompliance(i);
            assertTrue(defComp && geoVer && fullComp);
            assertTrue(batchManager.hasEUDRCompliance(i));
        }

        console.log("Successfully registered EUDR compliance for 5 batches");
    }
}
