// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ZKVerificationLib
 * @dev Library to consolidate repetitive ZK verification patterns and reduce bytecode size
 * This library extracts common verification logic used across multiple CircomVerifier functions
 */
library ZKVerificationLib {
    // Optimized error names (shortened for size efficiency)
    error EmptyProofData();
    error EmptyPublicClaim();
    error InvalidProofData();
    error ProofVerificationFailed();

    /**
     * @dev Validates input parameters for ZK proof verification
     * @param proofData The proof data to validate
     * @param publicClaim The public claim to validate
     */
    function validateInputs(
        uint256[] memory proofData,
        uint256[] memory publicClaim
    ) internal pure {
        if (proofData.length == 0) {
            revert EmptyProofData();
        }
        if (publicClaim.length == 0) {
            revert EmptyPublicClaim();
        }
        // Additional validation for proof structure
        if (proofData.length < 8) { // Minimum proof size for circom proofs
            revert InvalidProofData();
        }
    }

    /**
     * @dev Performs common verification steps for all proof types
     * @param proofData The ZK proof data
     * @param publicClaim The public claim/inputs
     * @param verifierAddress The address of the specific verifier contract
     * @return success True if verification passes
     */
    function executeVerification(
        uint256[] memory proofData,
        uint256[] memory publicClaim,
        address verifierAddress
    ) internal view returns (bool success) {
        // Validate inputs first
        validateInputs(proofData, publicClaim);
        
        // Call the specific verifier contract
        (bool callSuccess, bytes memory returnData) = verifierAddress.staticcall(
            abi.encodeWithSignature(
                "verifyProof(uint256[],uint256[])",
                proofData,
                publicClaim
            )
        );
        
        if (!callSuccess) {
            revert ProofVerificationFailed();
        }
        
        // Decode the returned boolean
        success = abi.decode(returnData, (bool));
    }

    /**
     * @dev Validates batch-specific requirements for proof verification
     * @param batchId The batch identifier
     * @param expectedRange The expected range for validation
     * @return isValid True if batch validation passes
     */
    function validateBatchConstraints(
        uint256 batchId,
        uint256 expectedRange
    ) internal pure returns (bool isValid) {
        // Basic validation - batch ID should be within reasonable range
        isValid = batchId > 0 && batchId <= expectedRange;
    }
}