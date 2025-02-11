// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Redemption {
    using Address for address;

    IERC1155 public coffeeToken;

    event TokensRedeemed(uint256 batchId, uint256 amount);
    event TokensBurned(uint256 batchId, uint256 amount);

    constructor(address _coffeeToken) {
        coffeeToken = IERC1155(_coffeeToken);
    }

    // Redeem tokens for coffee and burn the tokens
    function redeemTokens(uint256 batchId, uint256 amount) external {
        require(coffeeToken.balanceOf(msg.sender, batchId) >= amount, "Insufficient balance");
        
        // Transfer the tokens from the sender to the contract (redeeming)
        coffeeToken.safeTransferFrom(msg.sender, address(this), batchId, amount, "");

        // Burn the tokens by transferring them to the zero address
        coffeeToken.safeTransferFrom(address(this), address(0), batchId, amount, "");

        // Emit events for redemption and burning
        emit TokensRedeemed(batchId, amount);
        emit TokensBurned(batchId, amount);
    }
}
