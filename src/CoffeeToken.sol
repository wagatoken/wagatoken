// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";


contract CoffeeToken is ERC1155, Ownable  {
    using Strings for uint256;

    // Mapping to store metadata URI for each token
    mapping(uint256 => string) public tokenMetadata;

    event TokensMinted(uint256 batchId, uint256 amount);
    event TokensBurned(uint256 batchId, uint256 amount);

    constructor() ERC1155("https://ipfs.io/ipfs/{id}") Ownable(msg.sender){}

    // Mint tokens representing coffee batches
    function mintTokens(uint256 batchId, uint256 amount, string memory metadataUri) external onlyOwner {
        tokenMetadata[batchId] = metadataUri;
        _mint(msg.sender, batchId, amount, "");
        emit TokensMinted(batchId, amount);
    }

    // Burn tokens representing coffee batches (for redemption or sale)
    function burnTokens(uint256 batchId, uint256 amount) external onlyOwner {
        _burn(msg.sender, batchId, amount);
        emit TokensBurned(batchId, amount);
    }

    // Function to fetch the metadata URI for a specific batch
    function getMetadata(uint256 batchId) external view returns (string memory) {
        return tokenMetadata[batchId];
    }
}
