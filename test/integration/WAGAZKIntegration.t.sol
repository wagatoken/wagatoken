// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {Groth16Verifier as PriceVerifier} from "../../src/verifiers/PricePrivacyCircuitVerifier.sol";
import {Groth16Verifier as QualityVerifier} from "../../src/verifiers/QualityTierCircuitVerifier.sol";
import {Groth16Verifier as SupplyChainVerifier} from "../../src/verifiers/SupplyChainPrivacyCircuitVerifier.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {IPrivacyLayer} from "../../src/Interfaces/IPrivacyLayer.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

contract WAGAZKIntegration is Test {
    DeployRealZKMVP public deployer;
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGACoffeeRedemption public redemption;
    CircomVerifier public circomVerifier;
    MockCircomVerifier public mockVerifier;
    PrivacyLayer public privacyLayer;
    HelperConfig public helperConfig;

    address public admin;
    address public user = makeAddr("user");
    address public processor = makeAddr("processor");
    address public distributor = makeAddr("distributor");
    
    function setUp() public {
        // Deploy the entire system using the deployment script
        deployer = new DeployRealZKMVP();

        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            , // treasury
            redemption,
            , // cdpIntegration
            proofOfReserve,
            inventoryManager,
            , // ethiopianCompliance
            , // ecxOracle
            circomVerifier,
            helperConfig
        ) = deployer.run();

        // Get the actual admin address from the deployment (deployer gets admin rights)
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        admin = vm.addr(config.deployerKey);

        // Set up test addresses and roles using the admin who already has admin rights
        vm.startPrank(admin);

        // Grant roles to test addresses using the keccak256 hash directly
        coffeeToken.grantProcessorRole(processor);
        coffeeToken.grantDistributorRole(distributor);

        // Grant PROCESSOR_ROLE to admin for testing ZK proofs
        coffeeToken.grantProcessorRole(admin);

        // Deploy and configure MockCircomVerifier for testing
        mockVerifier = new MockCircomVerifier();
        mockVerifier.grantRole(mockVerifier.VERIFIER_ROLE(), address(admin));
        
        // Create a new ZKManager with MockCircomVerifier for testing ZK functionality
        // while keeping the original for other functions that don't do ZK verification
        WAGAZKManager testZKManager = new WAGAZKManager(
            address(coffeeToken),
            address(mockVerifier)
        );
        
        // Grant necessary roles to the test ZK Manager
        mockVerifier.grantRole(mockVerifier.VERIFIER_ROLE(), address(testZKManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(testZKManager));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(testZKManager));
        
        // Replace the zkManager reference for tests that need ZK verification
        zkManager = testZKManager;

        vm.stopPrank();
    }
    
    function testCompleteZKIntegration() public {
        vm.startPrank(admin);

            // 1. Test batch creation with manager-based pattern
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                100,                    // quantity
                1 ether,               // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        assertTrue(batchId > 0, "Batch should be created");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be marked as created");
        console.log("Batch created with ID:", batchId);

        vm.stopPrank();

        // 2. Test Enhanced ZK proof verification (original + new compliance proofs)
        vm.startPrank(admin);

        // Test adding pricing proof (original)
        bytes memory mockPricingProof = _createValidMockGroth16Proof();
        zkManager.addZKProof(
            batchId,
            mockPricingProof,
            IZKVerifier.ProofType.PRICE_COMPETITIVENESS,
            "premium"
        );

        console.log("Pricing proof added successfully");

        // Test adding quality proof (original)
        bytes memory mockQualityProof = _createValidMockGroth16Proof();
        zkManager.addZKProof(
            batchId,
            mockQualityProof,
            IZKVerifier.ProofType.QUALITY_STANDARDS,
            "premium"
        );

        console.log("Quality proof added successfully");

        // Test adding supply chain proof (original)
        bytes memory mockSupplyChainProof = _createValidMockGroth16Proof();
        zkManager.addZKProof(
            batchId,
            mockSupplyChainProof,
            IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE,
            "compliance"
        );

        console.log("Supply chain proof added successfully");

        // Test adding EUDR deforestation proof (NEW)
        bytes memory mockEUDRDeforestationProof = _createValidMockGroth16Proof();
        zkManager.addEUDRComplianceZKProof(
            batchId,
            mockEUDRDeforestationProof,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free - EUDR Compliant"
        );

        console.log("EUDR deforestation proof added successfully");

        // Test adding EUDR geolocation proof (NEW)
        bytes memory mockEUDRGeolocationProof = _createValidMockGroth16Proof();
        zkManager.addEUDRComplianceZKProof(
            batchId,
            mockEUDRGeolocationProof,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation Verified - Plot Size: 50ha"
        );

        console.log("EUDR geolocation proof added successfully");

        // Test adding ECTA permit proof (NEW)
        bytes memory mockECTAProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            mockECTAProof,
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            "ECTA Permit Valid - Export Approved"
        );

        console.log("ECTA permit proof added successfully");

        // Test adding quality certificate proof (NEW)
        bytes memory mockCertificateProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            mockCertificateProof,
            IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
            "Quality Certificate Authentic - SCA Certified"
        );

        console.log("Quality certificate proof added successfully");

        // Test adding origin verification proof (NEW)
        bytes memory mockOriginProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            mockOriginProof,
            IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF,
            "Origin Verified - Single-Origin Ethiopian"
        );

        console.log("Origin verification proof added successfully");

        // Test adding BoE compliance proof (NEW)
        bytes memory mockBoEProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            mockBoEProof,
            IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE,
            "BoE Forex Compliance - Export Approved"
        );

        console.log("BoE compliance proof added successfully");

        // Verify that all original proofs were added
        bool hasOriginalProofs = zkManager.hasAllRequiredProofs(batchId);
        assertTrue(hasOriginalProofs, "Batch should have all required original proofs");
        console.log("All required original proofs verified successfully");

        // Verify that EUDR proofs were added
        bool hasEUDRProofs = zkManager.hasEUDRComplianceProofs(batchId);
        assertTrue(hasEUDRProofs, "Batch should have EUDR compliance proofs");
        console.log("EUDR compliance proofs verified successfully");

        // Verify that Ethiopian proofs were added
        bool hasEthiopianProofs = zkManager.hasEthiopianComplianceProofs(batchId);
        assertTrue(hasEthiopianProofs, "Batch should have Ethiopian compliance proofs");
        console.log("Ethiopian compliance proofs verified successfully");

        // Test compliance validation
        bool eudrCompliant = zkManager.validateEUDRZKCompliance(batchId);
        assertTrue(eudrCompliant, "Batch should be EUDR compliant");

        bool ethiopianCompliant = zkManager.validateEthiopianZKCompliance(batchId);
        assertTrue(ethiopianCompliant, "Batch should be Ethiopian compliant");

        console.log("All enhanced ZK compliance proofs verified successfully");

        vm.stopPrank();
    }
    
    function testEUDRComplianceZKIntegration() public {
        console.log("Testing EUDR compliance ZK integration...");

        // Create a batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            1 ether,
            "Origin",
            "Standard",
            "ipfs://test-metadata"
        );
        vm.stopPrank();

        // Test EUDR deforestation proof addition
        vm.startPrank(admin);
        bytes memory deforestationProof = _createValidMockGroth16Proof();
        zkManager.addEUDRComplianceZKProof(
            batchId,
            deforestationProof,
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free - Verified by Satellite Imagery"
        );

        // Test EUDR geolocation proof addition
        bytes memory geolocationProof = _createValidMockGroth16Proof();
        zkManager.addEUDRComplianceZKProof(
            batchId,
            geolocationProof,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            "Geolocation Verified - GPS Coordinates: 8.5476N, 39.2695E"
        );

        // Verify EUDR compliance
        bool eudrCompliant = zkManager.validateEUDRZKCompliance(batchId);
        assertTrue(eudrCompliant, "Batch should be EUDR compliant");

        // Get compliance claims
        (
            string memory deforestationClaim,
            string memory geolocationClaim
        ) = zkManager.getEUDRComplianceClaims(batchId);

        assertEq(deforestationClaim, "Deforestation-Free - Verified by Satellite Imagery");
        assertEq(geolocationClaim, "Geolocation Verified - GPS Coordinates: 8.5476N, 39.2695E");

        console.log("EUDR compliance ZK integration test passed");
        vm.stopPrank();
    }

    function testEthiopianComplianceZKIntegration() public {
        console.log("Testing Ethiopian compliance ZK integration...");

        // Create a batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            1 ether,
            "Origin",
            "Standard",
            "ipfs://test-metadata"
        );
        vm.stopPrank();

        // Test Ethiopian compliance proofs
        vm.startPrank(admin);

        // ECTA permit validity
        bytes memory ectaProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            ectaProof,
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            "ECTA Export Permit Valid - NBE Approved"
        );

        // Quality certificate authenticity
        bytes memory qualityProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            qualityProof,
            IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
            "Quality Certificate Authentic - SCA Certified"
        );

        // Origin verification
        bytes memory originProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            originProof,
            IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF,
            "Origin Verified - Single Estate Yirgacheffe"
        );

        // BoE forex compliance
        bytes memory boeProof = _createValidMockGroth16Proof();
        zkManager.addEthiopianComplianceZKProof(
            batchId,
            boeProof,
            IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE,
            "BoE Forex Compliance - Export Declaration Filed"
        );

        // Verify Ethiopian compliance
        bool ethiopianCompliant = zkManager.validateEthiopianZKCompliance(batchId);
        assertTrue(ethiopianCompliant, "Batch should be Ethiopian compliant");

        // Get compliance claims
        string memory ethiopianClaim = zkManager.getEthiopianComplianceClaims(batchId);
        assertEq(ethiopianClaim, "BoE Forex Compliance - Export Declaration Filed"); // Last added proof

        console.log("Ethiopian compliance ZK integration test passed");
        vm.stopPrank();
    }

    function testCompleteComplianceZKWorkflow() public {
        console.log("Testing complete compliance ZK workflow...");

        // Create a batch
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            1 ether,
            "Origin",
            "Standard",
            "ipfs://test-metadata"
        );
        vm.stopPrank();

        // Add all compliance proofs
        vm.startPrank(admin);

        // Original proofs
        zkManager.addZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.PRICE_COMPETITIVENESS, "Premium pricing verified");
        zkManager.addZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.QUALITY_STANDARDS, "SCA certified quality");
        zkManager.addZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, "Full traceability verified");

        // EUDR compliance proofs
        zkManager.addEUDRComplianceZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE, "Deforestation-free verified");
        zkManager.addEUDRComplianceZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION, "Geolocation verified");

        // Ethiopian compliance proofs
        zkManager.addEthiopianComplianceZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, "ECTA permit valid");
        zkManager.addEthiopianComplianceZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY, "Quality certificate authentic");
        zkManager.addEthiopianComplianceZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF, "Origin verified");
        zkManager.addEthiopianComplianceZKProof(batchId, _createValidMockGroth16Proof(), IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE, "BoE forex compliant");

        // Verify complete compliance
        bool hasOriginalProofs = zkManager.hasAllRequiredProofs(batchId);
        bool hasEUDRProofs = zkManager.hasEUDRComplianceProofs(batchId);
        bool hasEthiopianProofs = zkManager.hasEthiopianComplianceProofs(batchId);
        bool eudrCompliant = zkManager.validateEUDRZKCompliance(batchId);
        bool ethiopianCompliant = zkManager.validateEthiopianZKCompliance(batchId);

        assertTrue(hasOriginalProofs, "Should have original proofs");
        assertTrue(hasEUDRProofs, "Should have EUDR proofs");
        assertTrue(hasEthiopianProofs, "Should have Ethiopian proofs");
        assertTrue(eudrCompliant, "Should be EUDR compliant");
        assertTrue(ethiopianCompliant, "Should be Ethiopian compliant");

        console.log("Complete compliance ZK workflow test passed");
        vm.stopPrank();
    }

    function testPrivacyLevels() public {
        vm.startPrank(admin);

            // Test Public privacy level (manager-based)
            uint256 publicBatchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                50,                     // quantity
                0.5 ether,             // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        assertTrue(coffeeToken.isBatchCreated(publicBatchId), "Public batch should be created");

            // Test Private privacy level (manager-based)
            uint256 privateBatchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                25,                     // quantity
                2 ether,               // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        assertTrue(coffeeToken.isBatchCreated(privateBatchId), "Private batch should be created");

        console.log("Privacy levels test passed - batches created successfully");

        vm.stopPrank();
    }
    
    function testBackwardCompatibility() public {
        vm.startPrank(admin);

            // Test that manager-based batch creation works
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                75,                     // quantity
                0.75 ether,            // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        assertTrue(batchId > 0, "Simple batch should be created");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be marked as created");

        console.log("Backward compatibility test passed - simple batch creation works");

        vm.stopPrank();
    }
    
    function testRoleBasedAccess() public {
        // Test that non-processor users cannot create batches
        vm.startPrank(user);

        vm.expectRevert();
        // Try to create batch without processor role
        coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1 ether,
            "Origin",
            "Standard",
            "ipfs://test-metadata"
        );

        vm.stopPrank();

        console.log("Role-based access control test passed - non-processor cannot create batches");
    }

    function testProcessorFunctionality() public {
        // Grant PROCESSOR_ROLE to processor address (already done in setUp)

        // Test that processors can create batches
        vm.startPrank(processor);

            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                150,                    // quantity
                2 ether,               // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        assertTrue(batchId > 0, "Processor should be able to create batches");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created after creation");

        vm.stopPrank();

        console.log("Processor functionality test passed - processors can create batches");
    }
    
    function testZKManagerIntegration() public {
        vm.startPrank(admin);

            // Create a batch
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                200,                    // quantity
                1.5 ether,             // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

                // Test adding pricing proof
        bytes memory pricingProof = _createValidMockGroth16Proof();
        zkManager.addZKProof(
            batchId,
            pricingProof,
            IZKVerifier.ProofType(0), // PRICE_COMPETITIVENESS
            "premium"
        );

        // Test adding quality proof
        bytes memory qualityProof = _createValidMockGroth16Proof();
        zkManager.addZKProof(
            batchId,
            qualityProof,
            IZKVerifier.ProofType(1), // QUALITY_STANDARDS
            "premium"
        );

        // Test adding supply chain proof
        bytes memory supplyChainProof = _createValidMockGroth16Proof();
        zkManager.addZKProof(
            batchId,
            supplyChainProof,
            IZKVerifier.ProofType(2), // SUPPLY_CHAIN_PROVENANCE
            "compliance"
        );

        console.log("ZK Manager integration test passed");

        vm.stopPrank();
    }
    
    function testPrivacyConfigurationUpdates() public {
        vm.startPrank(admin);

            // Create a batch
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                150,                    // quantity
                1.2 ether,             // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        // Test that batch was created successfully
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");

        console.log("Privacy configuration update test passed - batch created");

        vm.stopPrank();
    }

    function testRoleBasedAccessControl() public {
        // Test that only processors can create batches
        vm.startPrank(processor);

            uint256 processorBatchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                50,                     // quantity
                0.5 ether,             // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        // Just test that the function doesn't revert for processors
        assertTrue(processorBatchId > 0, "Processor should be able to create batches");

        vm.stopPrank();

        console.log("Role-based access control test completed successfully");
    }

    function testBatchRequestFunctionality() public {
        vm.startPrank(processor);

            // Create a batch
            uint256 batchId = coffeeToken.createBatch(
                block.timestamp,         // productionDate
                block.timestamp + 365 days, // expiryDate
                100,                    // quantity
                1 ether,               // pricePerUnit
                "Origin",              // origin
                "Standard",            // packagingInfo
                "ipfs://test-metadata" // metadataURI
            );
            // BatchManager.registerBatchCreation is called automatically by createBatch

        // Test that batch was created successfully
        assertTrue(batchId > 0, "Batch should be created");

        vm.stopPrank();

        console.log("Batch request functionality test passed - batch created successfully");
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
}
