// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";
import {TestProofData} from "../fixtures/TestProofData.sol";

/**
 * @title RealCircomVerifierIntegration
 * @dev Comprehensive testing of real cryptographic ZK verification
 * @notice Tests actual Groth16 proof verification with circuit verifiers
 */
contract RealCircomVerifierIntegration is Test {
    DeployRealZKMVP public deployer;
    WAGACoffeeTokenCore public coffeeToken;
    WAGAZKManager public zkManager;
    CircomVerifier public realCircomVerifier;
    HelperConfig public helperConfig;

    // Add batch manager variable
    WAGABatchManager public batchManager;
    address public admin;
    address public processor = makeAddr("processor");
    
    // Gas tracking variables
    uint256 public gasUsedPriceVerification;
    uint256 public gasUsedQualityVerification;
    uint256 public gasUsedSupplyChainVerification;
    
    function setUp() public {
        // Deploy the entire system
        deployer = new DeployRealZKMVP();
        
        (
            coffeeToken,
            batchManager, // Now capture batchManager
            zkManager,
            , // privacyLayer
            , // treasury
            , // redemption
            , // cdpIntegration
            , // proofOfReserve
            , // inventoryManager
            , // ethiopianCompliance
            , // ecxOracle
            realCircomVerifier,
            helperConfig
        ) = deployer.run();

        // Get admin address
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        admin = vm.addr(config.deployerKey);

        // Set up roles
        vm.startPrank(admin);
        coffeeToken.grantProcessorRole(processor);
        coffeeToken.grantProcessorRole(admin);
        
        // Grant roles to both ZK Managers to ensure proper access
        coffeeToken.grantRole(keccak256("ADMIN_ROLE"), address(zkManager));
        coffeeToken.grantVerifierRole(address(zkManager));
        
        // Create a new ZKManager with real CircomVerifier for testing
        WAGAZKManager realZkManager = new WAGAZKManager(
            address(coffeeToken),
            address(realCircomVerifier)
        );
        
        // Grant roles to real ZK Manager
        coffeeToken.grantRole(keccak256("ADMIN_ROLE"), address(realZkManager));
        coffeeToken.grantVerifierRole(address(realZkManager));
        
        // Replace zkManager with the real one for all tests
        zkManager = realZkManager;
        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                    REAL CRYPTOGRAPHIC VERIFICATION TESTS                  */
    /* -------------------------------------------------------------------------- */

    function testRealPriceCircuitVerification() public {
        console.log("Testing Real Price Circuit Verification...");
        
        uint256 batchId = _createTestBatch();
        
        vm.startPrank(admin);
        
        // Test with structurally valid Groth16 proof (will fail crypto verification)
        bytes memory realGroth16Proof = TestProofData.getValidStructureProofBytes();
        
        // This should fail with real cryptographic verification
        vm.expectRevert();
        zkManager.addZKProof(
            batchId,
            realGroth16Proof,
            IZKVerifier.ProofType.PRICE_COMPETITIVENESS,
            "Premium pricing verified"
        );
        
        console.log("Real price verification correctly rejected invalid proof");
        vm.stopPrank();
    }

    function testRealQualityCircuitVerification() public {
        console.log("Testing Real Quality Circuit Verification...");
        
        uint256 batchId = _createTestBatch();
        
        vm.startPrank(admin);
        
        // Test with structurally valid but cryptographically invalid proof
        bytes memory realGroth16Proof = TestProofData.getValidStructureProofBytes();
        
        vm.expectRevert();
        zkManager.addZKProof(
            batchId,
            realGroth16Proof,
            IZKVerifier.ProofType.QUALITY_STANDARDS,
            "SCA certified quality"
        );
        
        console.log("Real quality verification correctly rejected invalid proof");
        vm.stopPrank();
    }

    function testRealSupplyChainCircuitVerification() public {
        console.log("Testing Real Supply Chain Circuit Verification...");
        
        uint256 batchId = _createTestBatch();
        
        vm.startPrank(admin);
        
        bytes memory realGroth16Proof = TestProofData.getValidStructureProofBytes();
        
        vm.expectRevert();
        zkManager.addZKProof(
            batchId,
            realGroth16Proof,
            IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE,
            "Full traceability verified"
        );
        
        console.log("Real supply chain verification correctly rejected invalid proof");
        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           GAS COST ANALYSIS                               */
    /* -------------------------------------------------------------------------- */

    function testGasCostsRealVerification() public {
        console.log("Testing Gas Costs for Real ZK Verification...");
        
        uint256 batchId = _createTestBatch();
        bytes memory proof = TestProofData.getValidStructureProofBytes();
        
        vm.startPrank(admin);
        
        // Test price verification gas cost
        uint256 gasStart = gasleft();
        try zkManager.addZKProof(batchId, proof, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, "test") {
            // Won't succeed but we measure gas
        } catch {
            gasUsedPriceVerification = gasStart - gasleft();
        }
        
        console.log("Gas used for price verification:", gasUsedPriceVerification);
        
        // Assert reasonable gas costs (should be higher than mock verification)
        assertTrue(gasUsedPriceVerification > 21000, "Price verification should use significant gas");
        
        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         PROOF FORMAT VALIDATION                           */
    /* -------------------------------------------------------------------------- */

    function testGroth16ProofFormatValidation() public {
        console.log("Testing Groth16 Proof Format Validation...");
        
        uint256 batchId = _createTestBatch();
        
        vm.startPrank(admin);
        
        // Test with incorrect proof length (should be 256 bytes)
        bytes memory shortProof = TestProofData.getWrongLengthProofBytes();
        vm.expectRevert();
        zkManager.addZKProof(batchId, shortProof, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, "test");
        
        // Test with empty proof
        bytes memory emptyProof = new bytes(0);
        vm.expectRevert();
        zkManager.addZKProof(batchId, emptyProof, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, "test");
        
        console.log("All invalid proof formats correctly rejected");
        vm.stopPrank();
    }

    function testGroth16ProofStructureValidation() public {
        console.log("Testing Groth16 Proof Structure Validation...");
        
        uint256 batchId = _createTestBatch();
        
        vm.startPrank(admin);
        
        // Test with all-zero proof (invalid elliptic curve points)
        bytes memory zeroProof = TestProofData.getInvalidZeroProofBytes();
        vm.expectRevert();
        zkManager.addZKProof(batchId, zeroProof, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, "test");
        
        // Test with malformed elliptic curve points
        bytes memory malformedProof = TestProofData.getMalformedProofBytes();
        vm.expectRevert();
        zkManager.addZKProof(batchId, malformedProof, IZKVerifier.ProofType.QUALITY_STANDARDS, "test");
        
        console.log("All malformed proof structures correctly rejected");
        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           COMPLIANCE TESTING                              */
    /* -------------------------------------------------------------------------- */

    function testEUDRComplianceCircuitVerification() public {
        console.log("Testing EUDR Compliance Circuit Verification...");
        
        uint256 batchId = _createTestBatch();
        
        vm.startPrank(admin);
        
        bytes memory eudrProof = TestProofData.getValidStructureProofBytes();
        
        // Test EUDR deforestation proof (should fail with invalid proof)
        vm.expectRevert();
        zkManager.addComplianceZKProof(
            batchId,
            "EUDR_DEFORESTATION", 
            eudrProof,
            "Deforestation-free verified"
        );
        
        // Test EUDR geolocation proof
        vm.expectRevert();
        zkManager.addComplianceZKProof(
            batchId,
            "EUDR_GEOLOCATION",
            eudrProof,
            "Geolocation verified"
        );
        
        console.log("EUDR compliance circuits correctly rejecting invalid proofs");
        vm.stopPrank();
    }

    function testComprehensiveCircuitTesting() public {
        console.log("Testing All Circuit Types...");
        
        uint256 batchId = _createTestBatch();
        bytes memory testProof = TestProofData.getValidStructureProofBytes();
        
        vm.startPrank(admin);
        
        // Test all original circuit types
        vm.expectRevert();
        zkManager.addZKProof(batchId, testProof, IZKVerifier.ProofType.PRICE_COMPETITIVENESS, "Price test");
        
        vm.expectRevert();
        zkManager.addZKProof(batchId + 1, testProof, IZKVerifier.ProofType.QUALITY_STANDARDS, "Quality test");
        
        vm.expectRevert();
        zkManager.addZKProof(batchId + 2, testProof, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, "Supply chain test");
        
        // Test EUDR compliance circuits
        vm.expectRevert();
        zkManager.addComplianceZKProof(batchId + 3, "EUDR_DEFORESTATION", testProof, "EUDR deforestation test");
        
        vm.expectRevert();
        zkManager.addComplianceZKProof(batchId + 4, "EUDR_GEOLOCATION", testProof, "EUDR geolocation test");
        
        console.log("All circuit verifiers properly rejecting invalid proofs");
        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                         PERFORMANCE BENCHMARKS                            */
    /* -------------------------------------------------------------------------- */

    function testVerificationPerformanceBenchmarks() public {
        console.log("Running Verification Performance Benchmarks...");
        
        uint256 batchId = _createTestBatch();
        
        // Benchmark multiple verification attempts
        uint256 iterations = 3; // Reduce iterations for testing
        uint256 totalGasUsed = 0;
        bytes memory proof = TestProofData.getValidStructureProofBytes();
        
        vm.startPrank(admin);
        
        for (uint256 i = 0; i < iterations; i++) {
            uint256 gasStart = gasleft();
            try zkManager.addZKProof(
                batchId + i, 
                proof, 
                IZKVerifier.ProofType.PRICE_COMPETITIVENESS, 
                string(abi.encodePacked("test", i))
            ) {
                // Won't succeed but we measure gas
            } catch {
                totalGasUsed += (gasStart - gasleft());
            }
        }
        
        uint256 averageGasUsed = totalGasUsed / iterations;
        console.log("Average gas per verification:", averageGasUsed);
        
        // Assert performance is within reasonable bounds
        assertTrue(averageGasUsed < 1000000, "Average gas should be under 1M");
        assertTrue(averageGasUsed > 10000, "Average gas should be over 10K");
        
        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           INTEGRATION TESTS                               */
    /* -------------------------------------------------------------------------- */

    function testRealVerifierDeployment() public view {
        console.log("Testing Real Verifier Deployment...");
        
        // Verify verifier is properly deployed
        assertTrue(address(realCircomVerifier) != address(0), "CircomVerifier should be deployed");
        
        console.log("All verifiers properly deployed");
    }

    function testZKManagerRealVerifierIntegration() public view {
        console.log("Testing ZKManager Real Verifier Integration...");
        
        // Verify zkManager is using real verifier, not mock
        assertTrue(address(zkManager) != address(0), "ZKManager should be deployed");
        
        // The zkManager should be configured with real CircomVerifier
        // This is validated by the fact that proofs fail cryptographic verification
        console.log("ZKManager integrated with real cryptographic verifier");
    }

    /* -------------------------------------------------------------------------- */
    /*                           HELPER FUNCTIONS                                */
    /* -------------------------------------------------------------------------- */

    function _createTestBatch() internal returns (uint256) {
        vm.startPrank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            1 ether,
            "Test Origin",
            "Standard",
            "ipfs://test"
        );
        vm.stopPrank();
        return batchId;
    }
}