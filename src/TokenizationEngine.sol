/// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ProofOfReserve} from "./ProofOfReserve.sol";
import {CoffeeToken} from "./CoffeeToken.sol";
import {Redemption} from "./Redemption.sol";

contract TokenizationEngine is Ownable {
    IERC1155 public coffeeToken;
    ProofOfReserve public proofOfReserve;

    event BatchCreated(uint256 batchId, uint256 amount);
    event TokensMinted(uint256 batchId, uint256 amount);
    event TokensBurned(uint256 batchId, uint256 amount);

    constructor(address _coffeeToken, address _proofOfReserve) Ownable(msg.sender) {
        coffeeToken = IERC1155(_coffeeToken);
        proofOfReserve = ProofOfReserve(_proofOfReserve);
    }

    // Create a new batch of coffee and mint tokens
    function createBatch(uint256 batchId, uint256 amount) external onlyOwner {
        proofOfReserve.verifyReserve(batchId, amount); // Verifying reserve before minting
        // Directly mint the tokens using the CoffeeToken contract
        CoffeeToken(address(coffeeToken)).mintTokens(batchId, amount, "coffee_metadata_uri");  // Mint the tokens
        emit BatchCreated(batchId, amount);
    }

    // Mint tokens representing coffee batches
    function mintTokens(uint256 batchId, uint256 amount) external onlyOwner {
        proofOfReserve.verifyReserve(batchId, amount); // Verifying reserve before minting
        // Directly mint the tokens using the CoffeeToken contract
        CoffeeToken(address(coffeeToken)).mintTokens(batchId, amount, "coffee_metadata_uri");  // Mint the tokens
        emit TokensMinted(batchId, amount);
    }

    // Burn tokens representing coffee batches (for redemption or sale)
    function burnTokens(uint256 batchId, uint256 amount) external onlyOwner {
        CoffeeToken(address(coffeeToken)).burnTokens(batchId, amount);  // Burn tokens using the CoffeeToken contract
        emit TokensBurned(batchId, amount);
    }
}
