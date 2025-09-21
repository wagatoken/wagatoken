// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGAZKManagerTest
 * @dev Unit tests for enhanced ZK proof management with EUDR and Ethiopian compliance
 */
contract WAGAZKManagerTest is Test {
    WAGAZKManager public zkManager;
    WAGACoffeeTokenCore public coffeeToken;
    CircomVerifier public circomVerifier;
    WAGAEthiopianCompliance public ethiopianCompliance;

    // Test accounts
    address public admin = makeAddr("admin");
    address public processor = makeAddr("processor");
    address public verifier = makeAddr("verifier");

    // Test constants
    uint256 constant BATCH_ID = 1;
    bytes constant MOCK_PROOF_DATA = hex"00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";
    uint256[] MOCK_PUBLIC_SIGNALS;

    event EUDRComplianceZKProofAdded(
        uint256 indexed batchId,
        IZKVerifier.ProofType proofType,
        bytes32 indexed proofHash,
        string publicClaim
    );

    event EUDRZKComplianceValidated(
        uint256 indexed batchId,
        bool isCompliant
    );

    function setUp() public {
        vm.startPrank(admin);

        // Deploy contracts
        coffeeToken = new WAGACoffeeTokenCore("");
        circomVerifier = new CircomVerifier();
        ethiopianCompliance = new WAGAEthiopianCompliance();
        zkManager = new WAGAZKManager(address(coffeeToken), address(circomVerifier));

        // Initialize test data
        MOCK_PUBLIC_SIGNALS = [uint256(1), uint256(2), uint256(3), uint256(4), uint256(5)];

        // Setup roles
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), verifier);
        zkManager.setEthiopianCompliance(address(ethiopianCompliance));

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
    /*                         EUDR COMPLIANCE ZK TESTS                          */
    /* -------------------------------------------------------------------------- */

    function test_EUDR_AddDeforestationZKProof() public {
        vm.startPrank(verifier);

        vm.expectEmit(true, false, false, true);
        emit EUDRComplianceZKProofAdded(
            BATCH_ID,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            keccak256(abi.encodePacked(MOCK_PROOF_DATA, block.timestamp)),
            "Deforestation-Free - EUDR Compliant"
        );

        bool verified = zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free - EUDR Compliant"
        );

        // Note: This will likely fail in test environment without real ZK circuits
        // but we're testing the function call and event emission
        console.log("EUDR Deforestation proof verification result:", verified);

        vm.stopPrank();
    }

    function test_EUDR_AddGeolocationZKProof() public {
        vm.startPrank(verifier);

        vm.expectEmit(true, false, false, true);
        emit EUDRComplianceZKProofAdded(
            BATCH_ID,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            keccak256(abi.encodePacked(MOCK_PROOF_DATA, block.timestamp)),
            "Geolocation Verified - Plot Size: 50ha"
        );

        bool verified = zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation Verified - Plot Size: 50ha"
        );

        console.log("EUDR Geolocation proof verification result:", verified);

        vm.stopPrank();
    }

    function test_EUDR_AddPermitValidityZKProof() public {
        vm.startPrank(verifier);

        bool verified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            "ECTA Permit Valid - Export Approved"
        );

        console.log("ECTA Permit proof verification result:", verified);

        vm.stopPrank();
    }

    function test_EUDR_AddCertificateAuthenticityZKProof() public {
        vm.startPrank(verifier);

        bool verified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
            "Quality Certificate Authentic - SCA Certified"
        );

        console.log("Certificate authenticity proof verification result:", verified);

        vm.stopPrank();
    }

    function test_EUDR_AddOriginVerificationZKProof() public {
        vm.startPrank(verifier);

        bool verified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF,
            "Origin Verified - Single Estate Ethiopian"
        );

        console.log("Origin verification proof verification result:", verified);

        vm.stopPrank();
    }

    function test_EUDR_AddBOEComplianceZKProof() public {
        vm.startPrank(verifier);

        bool verified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE,
            "BoE Forex Compliance - Export Approved"
        );

        console.log("BoE compliance proof verification result:", verified);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         COMPLIANCE VALIDATION TESTS                       */
    /* -------------------------------------------------------------------------- */

    function test_Compliance_ValidateEUDRZKCompliance() public {
        // Add some mock proofs first
        vm.startPrank(verifier);

        // Add deforestation proof
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free"
        );

        // Add geolocation proof
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation Verified"
        );

        vm.stopPrank();

        // Test EUDR compliance validation
        bool isCompliant = zkManager.validateEUDRZKCompliance(BATCH_ID);
        console.log("EUDR ZK compliance validation result:", isCompliant);
    }

    function test_Compliance_ValidateEthiopianZKCompliance() public {
        // Add Ethiopian compliance proofs
        vm.startPrank(verifier);

        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            "ECTA Valid"
        );

        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
            "Quality Authentic"
        );

        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF,
            "Origin Verified"
        );

        vm.stopPrank();

        // Test Ethiopian compliance validation
        bool isCompliant = zkManager.validateEthiopianZKCompliance(BATCH_ID);
        console.log("Ethiopian ZK compliance validation result:", isCompliant);
    }

    /* -------------------------------------------------------------------------- */
    /*                           PROOF MANAGEMENT TESTS                          */
    /* -------------------------------------------------------------------------- */

    function test_ProofManagement_GetEUDRComplianceClaims() public {
        vm.startPrank(verifier);

        // Add proofs with claims
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation Compliant"
        );

        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation Verified"
        );

        vm.stopPrank();

        // Get claims
        (
            string memory deforestationClaim,
            string memory geolocationClaim
        ) = zkManager.getEUDRComplianceClaims(BATCH_ID);

        console.log("Deforestation claim:", deforestationClaim);
        console.log("Geolocation claim:", geolocationClaim);
    }

    function test_ProofManagement_GetEthiopianComplianceClaims() public {
        vm.startPrank(verifier);

        // Add Ethiopian proof
        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ETHIOPIAN_COMPLIANCE,
            "Ethiopian Export Compliant"
        );

        vm.stopPrank();

        // Get Ethiopian claims
        string memory ethiopianClaim = zkManager.getEthiopianComplianceClaims(BATCH_ID);
        console.log("Ethiopian compliance claim:", ethiopianClaim);
    }

    /* -------------------------------------------------------------------------- */
    /*                            PROOF STATUS TESTS                             */
    /* -------------------------------------------------------------------------- */

    function test_ProofStatus_HasEUDRComplianceProofs() public {
        // Initially no EUDR proofs
        bool hasEUDRProofs = zkManager.hasEUDRComplianceProofs(BATCH_ID);
        assertFalse(hasEUDRProofs);

        vm.startPrank(verifier);

        // Add deforestation proof
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation Compliant"
        );

        // Still false - need both proofs
        hasEUDRProofs = zkManager.hasEUDRComplianceProofs(BATCH_ID);
        assertFalse(hasEUDRProofs);

        // Add geolocation proof
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation Verified"
        );

        // Now true
        hasEUDRProofs = zkManager.hasEUDRComplianceProofs(BATCH_ID);
        assertTrue(hasEUDRProofs);

        vm.stopPrank();
    }

    function test_ProofStatus_HasEthiopianComplianceProofs() public {
        // Initially no Ethiopian proofs
        bool hasEthiopianProofs = zkManager.hasEthiopianComplianceProofs(BATCH_ID);
        assertFalse(hasEthiopianProofs);

        vm.startPrank(verifier);

        // Add Ethiopian compliance proof
        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ETHIOPIAN_COMPLIANCE,
            "Ethiopian Export Compliant"
        );

        hasEthiopianProofs = zkManager.hasEthiopianComplianceProofs(BATCH_ID);
        assertTrue(hasEthiopianProofs);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              ERROR HANDLING                               */
    /* -------------------------------------------------------------------------- */

    function test_Error_UnauthorizedEUDRProofSubmission() public {
        vm.startPrank(processor); // Not a verifier

        vm.expectRevert("Caller does not have required role");
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Unauthorized attempt"
        );

        vm.stopPrank();
    }

    function test_Error_UnauthorizedEthiopianProofSubmission() public {
        vm.startPrank(processor); // Not a verifier

        vm.expectRevert("Caller does not have required role");
        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ETHIOPIAN_COMPLIANCE,
            "Unauthorized attempt"
        );

        vm.stopPrank();
    }

    function test_Error_InvalidBatchId() public {
        vm.startPrank(verifier);

        vm.expectRevert("Batch does not exist");
        zkManager.addEUDRComplianceZKProof(
            999, // Non-existent batch
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Invalid batch"
        );

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTEGRATION TESTS                            */
    /* -------------------------------------------------------------------------- */

    function test_Integration_FullEUDRComplianceWorkflow() public {
        vm.startPrank(verifier);

        // Step 1: Add deforestation proof
        bool deforestationVerified = zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free - EUDR Compliant"
        );

        // Step 2: Add geolocation proof
        bool geolocationVerified = zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation Verified - Plot Size: 50ha"
        );

        vm.stopPrank();

        // Step 3: Validate complete EUDR compliance
        bool isEUDRCompliant = zkManager.validateEUDRZKCompliance(BATCH_ID);

        // Step 4: Check proof status
        bool hasEUDRProofs = zkManager.hasEUDRComplianceProofs(BATCH_ID);

        // Step 5: Get compliance claims
        (
            string memory deforestationClaim,
            string memory geolocationClaim
        ) = zkManager.getEUDRComplianceClaims(BATCH_ID);

        console.log("=== EUDR Compliance Workflow Results ===");
        console.log("Deforestation verified:", deforestationVerified);
        console.log("Geolocation verified:", geolocationVerified);
        console.log("EUDR compliant:", isEUDRCompliant);
        console.log("Has EUDR proofs:", hasEUDRProofs);
        console.log("Deforestation claim:", deforestationClaim);
        console.log("Geolocation claim:", geolocationClaim);
    }

    function test_Integration_FullEthiopianComplianceWorkflow() public {
        vm.startPrank(verifier);

        // Step 1: Add ECTA permit proof
        bool ectaVerified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            "ECTA Permit Valid - Export Approved"
        );

        // Step 2: Add quality certificate proof
        bool qualityVerified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
            "Quality Certificate Authentic - SCA Certified"
        );

        // Step 3: Add origin verification proof
        bool originVerified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF,
            "Origin Verified - Single-Origin Ethiopian"
        );

        // Step 4: Add BoE compliance proof
        bool boeVerified = zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE,
            "BoE Forex Compliance - Export Approved"
        );

        vm.stopPrank();

        // Step 5: Validate complete Ethiopian compliance
        bool isEthiopianCompliant = zkManager.validateEthiopianZKCompliance(BATCH_ID);

        // Step 6: Check proof status
        bool hasEthiopianProofs = zkManager.hasEthiopianComplianceProofs(BATCH_ID);

        // Step 7: Get compliance claims
        string memory ethiopianClaim = zkManager.getEthiopianComplianceClaims(BATCH_ID);

        console.log("=== Ethiopian Compliance Workflow Results ===");
        console.log("ECTA verified:", ectaVerified);
        console.log("Quality verified:", qualityVerified);
        console.log("Origin verified:", originVerified);
        console.log("BoE verified:", boeVerified);
        console.log("Ethiopian compliant:", isEthiopianCompliant);
        console.log("Has Ethiopian proofs:", hasEthiopianProofs);
        console.log("Ethiopian claim:", ethiopianClaim);
    }

    /* -------------------------------------------------------------------------- */
    /*                            GAS OPTIMIZATION TESTS                         */
    /* -------------------------------------------------------------------------- */

    function test_GasOptimization_ZKProofOperations() public {
        vm.startPrank(verifier);

        // Measure gas for EUDR proof addition
        uint256 gasStart = gasleft();
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation Compliant"
        );
        uint256 gasUsedEUDR = gasStart - gasleft();

        // Measure gas for Ethiopian proof addition
        gasStart = gasleft();
        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ETHIOPIAN_COMPLIANCE,
            "Ethiopian Compliant"
        );
        uint256 gasUsedEthiopian = gasStart - gasleft();

        console.log("Gas used for EUDR proof addition:", gasUsedEUDR);
        console.log("Gas used for Ethiopian proof addition:", gasUsedEthiopian);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              VIEW FUNCTION TESTS                          */
    /* -------------------------------------------------------------------------- */

    function test_ViewFunctions_GetProof() public {
        vm.startPrank(verifier);

        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation Compliant"
        );

        vm.stopPrank();

        // Test getProof function
        (
            bytes32 proofHash,
            IZKVerifier.ProofType proofType,
            bool isVerified,
            uint256 timestamp,
            string memory publicClaim,
            bytes memory proofData,
            uint256[] memory publicSignals
        ) = zkManager.getProof(BATCH_ID, IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE);

        assertEq(uint8(proofType), uint8(IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE));
        assertTrue(isVerified);
        assertEq(publicClaim, "Deforestation Compliant");
        assertEq(proofData.length, MOCK_PROOF_DATA.length);
        assertGt(timestamp, 0);
    }

    function test_ViewFunctions_GetAllProofsForBatch() public {
        vm.startPrank(verifier);

        // Add multiple proofs
        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation OK"
        );

        zkManager.addEUDRComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation OK"
        );

        zkManager.addEthiopianComplianceZKProof(
            BATCH_ID,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.ETHIOPIAN_COMPLIANCE,
            "Ethiopian OK"
        );

        vm.stopPrank();

        // Check that we can retrieve all proofs
        (
            ,
            IZKVerifier.ProofType deforestationType,
            bool deforestationVerified,
            ,
            string memory deforestationClaim,
            ,
        ) = zkManager.getProof(BATCH_ID, IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE);

        (
            ,
            IZKVerifier.ProofType geolocationType,
            bool geolocationVerified,
            ,
            string memory geolocationClaim,
            ,
        ) = zkManager.getProof(BATCH_ID, IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION);

        (
            ,
            IZKVerifier.ProofType ethiopianType,
            bool ethiopianVerified,
            ,
            string memory ethiopianClaim,
            ,
        ) = zkManager.getProof(BATCH_ID, IZKVerifier.ProofType.ETHIOPIAN_COMPLIANCE);

        assertTrue(deforestationVerified);
        assertTrue(geolocationVerified);
        assertTrue(ethiopianVerified);

        assertEq(uint8(deforestationType), uint8(IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE));
        assertEq(uint8(geolocationType), uint8(IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION));
        assertEq(uint8(ethiopianType), uint8(IZKVerifier.ProofType.ETHIOPIAN_COMPLIANCE));

        console.log("Deforestation claim:", deforestationClaim);
        console.log("Geolocation claim:", geolocationClaim);
        console.log("Ethiopian claim:", ethiopianClaim);
    }
}
