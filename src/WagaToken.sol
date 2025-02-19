// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract WagaToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    constructor() ERC20("WagaToken", "WAGA") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Admin Role
        _grantRole(MINTER_ROLE, msg.sender); // Initial minter is deployer
    }

    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 2; // 2 decimal places
    }

    function grantMinterRole(address tokenShop) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, tokenShop);
    }
}
