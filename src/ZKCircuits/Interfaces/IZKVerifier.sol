// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IZKVerifier {
    function verifyProof(
        bytes calldata proof,
        bytes32[] calldata publicInputs
    ) external view returns (bool);
    
    function verifyBatchProofs(
        bytes32[] calldata proofHashes,
        uint256[] calldata batchIds
    ) external returns (bool[] memory results);
}
