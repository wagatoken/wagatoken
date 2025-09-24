// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title TestProofData
 * @dev Contains valid ZK proof structures for testing
 * @notice Provides both valid and invalid proof examples
 */
library TestProofData {
    
    struct ProofComponents {
        uint256[2] a;
        uint256[2][2] b;
        uint256[2] c;
    }
    
    /**
     * @dev Returns a structurally valid Groth16 proof (will fail crypto verification)
     * @notice This proof has valid elliptic curve points but wrong cryptographic content
     */
    function getValidStructureProof() internal pure returns (ProofComponents memory) {
        return ProofComponents({
            a: [
                uint256(0x0000000000000000000000000000000000000000000000000000000000000001),
                uint256(0x0000000000000000000000000000000000000000000000000000000000000002)
            ],
            b: [
                [
                    uint256(0x0000000000000000000000000000000000000000000000000000000000000003),
                    uint256(0x0000000000000000000000000000000000000000000000000000000000000004)
                ],
                [
                    uint256(0x0000000000000000000000000000000000000000000000000000000000000005),
                    uint256(0x0000000000000000000000000000000000000000000000000000000000000006)
                ]
            ],
            c: [
                uint256(0x0000000000000000000000000000000000000000000000000000000000000007),
                uint256(0x0000000000000000000000000000000000000000000000000000000000000008)
            ]
        });
    }
    
    /**
     * @dev Returns a structurally valid proof as bytes (256 bytes)
     */
    function getValidStructureProofBytes() internal pure returns (bytes memory) {
        return hex"0000000000000000000000000000000000000000000000000000000000000001"
               hex"0000000000000000000000000000000000000000000000000000000000000002"
               hex"0000000000000000000000000000000000000000000000000000000000000003"
               hex"0000000000000000000000000000000000000000000000000000000000000004"
               hex"0000000000000000000000000000000000000000000000000000000000000005"
               hex"0000000000000000000000000000000000000000000000000000000000000006"
               hex"0000000000000000000000000000000000000000000000000000000000000007"
               hex"0000000000000000000000000000000000000000000000000000000000000008";
    }
    
    /**
     * @dev Returns an invalid proof with all zeros (invalid elliptic curve points)
     */
    function getInvalidZeroProof() internal pure returns (ProofComponents memory) {
        return ProofComponents({
            a: [uint256(0), uint256(0)],
            b: [[uint256(0), uint256(0)], [uint256(0), uint256(0)]],
            c: [uint256(0), uint256(0)]
        });
    }
    
    /**
     * @dev Returns an invalid proof as bytes (all zeros)
     */
    function getInvalidZeroProofBytes() internal pure returns (bytes memory) {
        return new bytes(256); // All zeros
    }
    
    /**
     * @dev Returns malformed proof with invalid field elements
     */
    function getMalformedProof() internal pure returns (ProofComponents memory) {
        // Use values larger than BN254 field modulus to make invalid points
        return ProofComponents({
            a: [
                uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF),
                uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
            ],
            b: [
                [
                    uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF),
                    uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
                ],
                [
                    uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF),
                    uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
                ]
            ],
            c: [
                uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF),
                uint256(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF)
            ]
        });
    }
    
    /**
     * @dev Returns malformed proof as bytes
     */
    function getMalformedProofBytes() internal pure returns (bytes memory) {
        bytes memory malformedProof = new bytes(256);
        for (uint256 i = 0; i < 256; i++) {
            malformedProof[i] = 0xFF;
        }
        return malformedProof;
    }
    
    /**
     * @dev Returns proof with wrong length (128 bytes instead of 256)
     */
    function getWrongLengthProofBytes() internal pure returns (bytes memory) {
        return new bytes(128);
    }
    
    /**
     * @dev Sample public signals for price circuit (3 elements)
     */
    function getSamplePricePublicSignals() internal pure returns (uint256[] memory) {
        uint256[] memory signals = new uint256[](3);
        signals[0] = 1; // isCompetitive
        signals[1] = 150; // priceRange
        signals[2] = 12345; // commitmentHash
        return signals;
    }
    
    /**
     * @dev Sample public signals for quality circuit (4 elements)
     */
    function getSampleQualityPublicSignals() internal pure returns (uint256[] memory) {
        uint256[] memory signals = new uint256[](4);
        signals[0] = 1; // meetsStandards
        signals[1] = 85; // qualityScore
        signals[2] = 1; // hasCertification
        signals[3] = 54321; // commitmentHash
        return signals;
    }
    
    /**
     * @dev Sample public signals for supply chain circuit (5 elements)
     */
    function getSampleSupplyChainPublicSignals() internal pure returns (uint256[] memory) {
        uint256[] memory signals = new uint256[](5);
        signals[0] = 1; // hasProvenance
        signals[1] = 95; // traceabilityScore
        signals[2] = 5; // stepCount
        signals[3] = 123456789; // originCommitment
        signals[4] = 98765; // commitmentHash
        return signals;
    }
}