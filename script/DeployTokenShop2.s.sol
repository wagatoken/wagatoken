// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {WagaToken} from "../src/WagaToken.sol";
import {TokenShop2} from "src/TokenShop2.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployTokenShop2 is Script {
    function run() external returns (WagaToken, TokenShop2, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        (
            address ethUsdPriceFeed,
            address usdcAddress,
            uint256 deployerKey
        ) = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerKey);

        // 1. Deploy WagaToken
        WagaToken wagaToken = new WagaToken();

        // 2. Deploy TokenShop with priceFeed and USDC address
        TokenShop2 tokenShop = new TokenShop2(
            address(wagaToken),
            ethUsdPriceFeed,
            usdcAddress
        );

        // 3. Grant MINTER_ROLE to TokenShop
        wagaToken.grantMinterRole(address(tokenShop));

        vm.stopBroadcast();

        return (wagaToken, tokenShop, helperConfig);
    }
}
