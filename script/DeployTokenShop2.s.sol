// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {WagaToken} from "../src/WagaToken.sol";
import {TokenShop2} from "src/TokenShop2.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {TokenVesting} from "src/TokenVesting.sol";



contract DeployTokenShop2 is Script {
    HelperConfig public helperConfig;

    function run() external returns (WagaToken, TokenShop2, HelperConfig) {
        helperConfig = new HelperConfig();
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
       
        // 4. Grant MINTER_ROLE to TokenShop
        wagaToken.grantMinterRole(address(tokenShop));

        // 5. Transfer ownership of WagaToken to TokenShop
        //wagaToken.transferOwnership(address(tokenShop));
        // 6. Grant OWNER_ROLE to TokenShop
        // tokenShop.grantRole(tokenShop.OWNER_ROLE(), address(tokenShop));
        vm.stopBroadcast();

        return (wagaToken, tokenShop, helperConfig);
    }
}

// == Return == Base Sepolia
// 0: contract WagaToken 0xCDE269fEa8d66B8010BBffd8b780e89116513565 => 0x10afC70CF4Aa8f9569Bc9cB5B68D21AC4B6E996d (verified)
// 1: contract TokenShop2 0x1be420294e6508c189427C85C68E3f7D030d7e13 => 0x5b3908847dC4eBf1AdD6c6A195382ee196559923 (verified)
// 2: contract HelperConfig 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141

// == Return == Arbitrum Sepolia Sepolia
// 0: contract WagaToken 0xC6B7243C164367a7b272c2E97C597914E8CC39a5   
// 1: contract TokenShop2 0x4E1adAE483AdcaF0E02666eFc06B8746B30CEca2  
// 2: contract HelperConfig 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141

// == Return == Ethereum Sepolia
// 0: contract WagaToken 0xa6219432B8dDc60df9374fF9080606e77aAA61e8
// 1: contract TokenShop2 0xe73Af0fE5F7A5F63d02c27C5CeCe36d89bbF7285
// 2: contract HelperConfig 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141

// == Return == Ethereum Sepolia II
// 0: contract WagaToken 0x3A45D07AE8907A875ACc3DF24a86F154CB1ABBAa
// 1: contract TokenShop2 0x02BD2582178b467002e945001D327FB13cb8A8c4
// 2: contract HelperConfig 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141
                         
// == Return == Ethereum Sepolia III
// 0: contract WagaToken 0x0f9E53dB46EcDA28689f643De470529c5B7F703F
// 1: contract TokenShop2 0x2435D814B8f1583Dd4a5444fbB9943803f31C03F
// 2: contract HelperConfig 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141 


// == Return == Base Sepolia II
// 0: contract WagaToken 0xC7687295395597CFa014C7f7A47179bC3d2674BD
// 1: contract TokenShop2 0xFd366a14FbeAa467Ea2179952107a5Ecc90af7fD
// 2: contract HelperConfig 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141