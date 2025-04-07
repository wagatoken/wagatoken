// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "USDT") {}

    // Override decimals to mimic USDT's 6 decimal places
    function decimals() public pure override returns (uint8) {
        return 6;
    }

    // Faucet function for testing
    function faucet(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
