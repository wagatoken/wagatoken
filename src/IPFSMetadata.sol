// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

library IPFSMetadata {
    string private constant BASE_URI = "ipfs://";

    function toIPFSUri(string memory ipfsHash) internal pure returns (string memory) {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        return string(abi.encodePacked(BASE_URI, ipfsHash));
    }
}
