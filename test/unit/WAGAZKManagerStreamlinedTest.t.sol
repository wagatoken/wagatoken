// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGAZKManagerStreamlinedTest
 * @dev Streamlined unit tests for WAGA ZK Manager functionality
 */
contract WAGAZKManagerStreamlinedTest is BaseWAGATest {

    uint256 private testBatchId;

    function setUp() public override {
        super.setUp();
        testBatchId = createTestBatch(processor);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ZK PROOF SUBMISSION TESTS                    */
    /* -------------------------------------------------------------------------- */

    function testSubmitZKProof_Success() public {
        verifyBatchWithZK(testBatchId);
        
        // Verify proof exists using correct interface
        bool hasProof = zkManager.hasComplianceProof(testBatchId, "QUALITY_STANDARDS");
        assertTrue(hasProof);
    }

    function testSubmitZKProof_UnauthorizedVerifier() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        zkManager.addZKProof(
            testBatchId, 
            MOCK_PROOF_DATA, 
            IZKVerifier.ProofType.QUALITY_STANDARDS, 
            "Premium Quality - SCA 85+"
        );
    }

    function testSubmitZKProof_MultipleTypes() public {
        // Submit quality proof
        vm.prank(verifier);
        zkManager.addZKProof(testBatchId, MOCK_PROOF_DATA, IZKVerifier.ProofType.QUALITY_STANDARDS, "Premium Quality - SCA 85+");
        
        // Submit supply chain proof
        vm.prank(verifier);
        zkManager.addZKProof(testBatchId, MOCK_PROOF_DATA, IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE, "Single-Origin Ethiopian - Traceable");
        
        // Verify both proofs exist using correct interface
        bool hasQuality = zkManager.hasComplianceProof(testBatchId, "QUALITY_STANDARDS");
        bool hasSupplyChain = zkManager.hasComplianceProof(testBatchId, "SUPPLY_CHAIN_PROVENANCE");
        
        assertTrue(hasQuality);
        assertTrue(hasSupplyChain);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ZK VERIFICATION TESTS                        */
    /* -------------------------------------------------------------------------- */

    function testVerifyZKProof_ValidProof() public {
        verifyBatchWithZK(testBatchId);
        
        bool isValid = zkManager.hasComplianceProof(testBatchId, "QUALITY_STANDARDS");
        assertTrue(isValid);
    }

    function testGetZKProofStatus_NonExistentProof() public {
        // Check for proof that doesn't exist
        bool hasProof = zkManager.hasComplianceProof(testBatchId, "PRICE_COMPETITIVENESS");
        assertFalse(hasProof);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ROLE-BASED ACCESS TESTS                      */
    /* -------------------------------------------------------------------------- */

    function testZKVerifierRole_Access() public {
        assertRoleGranted(keccak256("ZK_VERIFIER_ROLE"), verifier);
    }

    function testZKAdminRole_Access() public {
        assertRoleGranted(keccak256("ZK_ADMIN_ROLE"), admin);
    }
}