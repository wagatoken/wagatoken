// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "src/Interfaces/IProofOfReserve.sol";
import "src/Interfaces/IRedemption.sol";
import {IPFSMetadata} from "src/IPFSMetadata.sol";

contract CoffeeTraceability is ERC1155, Ownable {
    mapping(uint256 => string) public batchMetadataURIs;
    mapping(uint256 => uint256) public batchTotalSupply;
    IProofOfReserve public proofOfReserveContract;
    IRedemption public coffeeRedemptionContract;

    event BatchMinted(uint256 indexed batchId, uint256 amount, string metadataURI);
    event TokenBurned(address indexed user, uint256 indexed batchId, uint256 amount);

    constructor(address _proofOfReserve, address _coffeeRedemption) ERC1155("") Ownable(msg.sender) {
        proofOfReserveContract = IProofOfReserve(_proofOfReserve);
        coffeeRedemptionContract = IRedemption(_coffeeRedemption);
    }

    function mintBatch(address to, uint256 batchId, uint256 amount, string memory metadataURI) public onlyOwner {
        require(amount > 0, "Amount must be greater than zero");
        proofOfReserveContract.verifyInventory(batchId, amount);
        batchMetadataURIs[batchId] = metadataURI;
        //batchMetadataURIs[batchId] = IPFSMetadata.toIPFSUri(metadataURI);
        batchTotalSupply[batchId] += amount;
        _mint(to, batchId, amount, "");
        emit BatchMinted(batchId, amount, metadataURI);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return batchMetadataURIs[tokenId];
    }

    function burn(address account, uint256 batchId, uint256 amount) external {
        require(msg.sender == account || msg.sender == owner(), "Unauthorized burn request");
        _burn(account, batchId, amount);
        emit TokenBurned(account, batchId, amount);
    }

    function redeem(uint256 batchId, uint256 amount) public {
        require(address(coffeeRedemptionContract) != address(0), "Redemption contract not set");
        coffeeRedemptionContract.redeem(batchId, amount);
    }
}
