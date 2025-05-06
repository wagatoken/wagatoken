// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "murky/src/Merkle.sol";

contract GenerateMerkleProofVesting is Script {
    function run() external {
        Merkle merkle = new Merkle();
        bytes32[] memory leaves = new bytes32[](2);
        leaves[0] = keccak256(
            abi.encodePacked(address(0x123), uint256(100 ether))
        );
        leaves[1] = keccak256(
            abi.encodePacked(address(0x456), uint256(200 ether))
        );

        bytes32 root = merkle.getRoot(leaves);
        bytes32[] memory proof = merkle.getProof(leaves, 0);

        console.logBytes32(root);
        console.logBytes32(proof[0]);
    }
}
