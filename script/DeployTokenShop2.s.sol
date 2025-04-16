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

        // 3. Unpause TokenShop
        // tokenShop.unpause();
        // 4. Grant MINTER_ROLE to TokenShop
        wagaToken.grantMinterRole(address(tokenShop));

        // 5. Transfer ownership of WagaToken to TokenShop
        wagaToken.transferOwnership(address(tokenShop));
        // 6. Grant OWNER_ROLE to TokenShop
        // tokenShop.grantRole(tokenShop.OWNER_ROLE(), address(tokenShop));
        vm.stopBroadcast();

        return (wagaToken, tokenShop, helperConfig);
    }
}
