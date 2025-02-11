// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC1155} from "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import {ChainlinkRequestInterface} from "@chainlink/contracts/src/v0.8/interfaces/ChainlinkRequestInterface.sol"; // For external data requests


contract ProofOfReserve is Ownable {
    IERC1155 public coffeeToken;

    // Mapping to track the reserve for each coffee batch ID
    mapping(uint256 => uint256) public reserves;
    // FIFO queue to track coffee batches for processing
    mapping(uint256 => uint256) public fifoQueue;

    // External Adapter for coffee price feed
    address public coffeePriceOracle;  // Address for the custom-built coffee price oracle
    // https://medium.com/linkwell-nodes/how-to-request-a-custom-any-api-chainlink-data-feed-a-7-step-guide-for-web3-developers-5f45d2f170ab by https://linkwellnodes.io/

    // External Adapter for verifying batch presence
    address public batchPresenceOracle;  // Address for the custom-built oracle for batch presence verification

    event ReserveVerified(uint256 batchId, uint256 amount);
    event ReserveUpdated(uint256 batchId, uint256 amount);
    event FIFOProcessed(uint256 batchId, uint256 amount);
    event BatchVerifiedExternally(uint256 batchId, bool exists);
    event PriceVerified(uint256 price);

    constructor(address _coffeeToken, address _coffeePriceOracle, address _batchPresenceOracle) Ownable(msg.sender) {
        coffeeToken = IERC1155(_coffeeToken);
        coffeePriceOracle = _coffeePriceOracle;  // Custom oracle for coffee prices
        batchPresenceOracle = _batchPresenceOracle;  // Custom oracle for batch presence
    }

    // Verifies reserve by adding the specified amount to the reserve for a given batch
    function verifyReserve(uint256 batchId, uint256 amount) external onlyOwner {
        // Verify the actual physical presence of the coffee batch before minting
        bool batchExists = verifyBatchPresence(batchId);
        require(batchExists, "Batch verification failed");

        // Fetch the coffee price from the custom oracle
        uint256 currentPrice = getCoffeePrice(); // Fetch coffee price from external oracle
        uint256 priceThreshold = 100;  // Example threshold check for coffee price

        require(currentPrice >= priceThreshold, "Coffee price is too low to mint tokens");

        reserves[batchId] += amount; // Add the amount to the batch reserve
        emit ReserveVerified(batchId, amount);
    }

    // Update reserve and FIFO queue with given batch ID and amount
    function updateReserve(uint256 batchId, uint256 amount) external onlyOwner {
        reserves[batchId] += amount; 
        fifoQueue[batchId] += amount; 
        emit ReserveUpdated(batchId, amount);
    }

    // Process the FIFO queue, updating the reserve and burning the processed batch tokens
    function processFIFO(uint256 batchId) external onlyOwner {
        uint256 amountToProcess = fifoQueue[batchId];
        require(amountToProcess > 0, "No batches to process");
        fifoQueue[batchId] = 0;
        reserves[batchId] -= amountToProcess;
        emit FIFOProcessed(batchId, amountToProcess);
    }

    // Returns the current reserve status for a specific batch ID
    function getReserveStatus(uint256 batchId) external view returns (uint256) {
        return reserves[batchId];
    }

    // Function to fetch coffee price from the custom oracle (off-chain service)
    function getCoffeePrice() internal returns (uint256) {
        // Implement logic to fetch coffee price from external oracle (could be an API call, IoT data, etc.)
        // Example: Request price from an off-chain oracle via Chainlink External Adapter
        uint256 price = 150;  // Example, to be replaced by actual oracle data
        emit PriceVerified(price);
        return price;
    }

    // Function to verify coffee batch presence using the custom oracle (e.g., IoT or warehouse verification)
    function verifyBatchPresence(uint256 batchId) internal returns (bool) {
        // Example: Call external oracle for batch verification (check physical presence in the warehouse)
        // This could trigger an off-chain oracle that verifies batch status
        bool exists = true;  // Dummy value for illustration; replace with actual oracle call
        emit BatchVerifiedExternally(batchId, exists);
        return exists;
    }
}
