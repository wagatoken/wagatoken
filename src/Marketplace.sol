// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MarketplaceIntegration is Ownable {
    IERC1155 public coffeeToken;

    event CoffeeListed(uint256 batchId, uint256 amount, uint256 price);
    event CoffeeBought(uint256 batchId, uint256 amount, address buyer);

    constructor(address _coffeeToken) Ownable(msg.sender) {
        coffeeToken = IERC1155(_coffeeToken);
    }

    // List coffee for sale
    function listCoffee(uint256 batchId, uint256 amount, uint256 price) external onlyOwner {
        // Here we could implement additional logic for price verification
        emit CoffeeListed(batchId, amount, price);
    }

    // Buy coffee from the marketplace
    function buyCoffee(uint256 batchId, uint256 amount) external payable {
        uint256 price = 1 ether; // Example price, should be dynamically set
        require(msg.value >= price * amount, "Insufficient funds");

        // Transfer the coffee tokens to the buyer
        coffeeToken.safeTransferFrom(address(this), msg.sender, batchId, amount, "");
        emit CoffeeBought(batchId, amount, msg.sender);
    }
}
