// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {WagaToken} from "../src/WagaToken.sol";
import {TokenShop} from "../src/TokenShop.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployTokenShop is Script {
    function run() external returns (WagaToken, TokenShop, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        (address ethUsdPriceFeed, uint256 deployerKey) = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerKey);
        
        // Deploy WagaToken
        WagaToken wagaToken = new WagaToken();

        // Deploy TokenShop
        TokenShop tokenShop = new TokenShop(address(wagaToken), ethUsdPriceFeed);

        // Grant MINTER_ROLE to TokenShop
        wagaToken.grantMinterRole(address(tokenShop));

        vm.stopBroadcast();

        return (wagaToken, tokenShop, helperConfig);
    }
}
