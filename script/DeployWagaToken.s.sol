// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {WAGACoffeeToken} from "../src/WAGACoffeeToken.sol";
import {WAGAInventoryManager} from "../src/WAGAInventoryManager2.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployWagaToken is Script {
    HelperConfig public helperConfig;

    function run()
        external
        returns (
            WAGACoffeeToken,
            WAGAInventoryManager,
            WAGACoffeeRedemption,
            WAGAProofOfReserve,
            HelperConfig
        )
    {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig
            .getActiveNetworkConfig();

        vm.startBroadcast(config.deployerKey);

        // 1. Deploy WAGACoffeeToken
        WAGACoffeeToken coffeeToken = new WAGACoffeeToken();

        // 2. Deploy WAGAProofOfReserve with Chainlink Functions parameters
        WAGAProofOfReserve proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            config.router,
            config.subscriptionId,
            config.donId
        );

        // 3. Deploy WAGAInventoryManager with required parameters
        WAGAInventoryManager inventoryManager = new WAGAInventoryManager(
            address(coffeeToken),
            address(proofOfReserve)
        );

        // 4. Deploy WAGACoffeeRedemption
        WAGACoffeeRedemption redemptionContract = new WAGACoffeeRedemption(
            address(coffeeToken)
        );

        // 6. Initialize coffeeToken contract

        coffeeToken.initialize(
            address(inventoryManager),
            address(redemptionContract),
            address(proofOfReserve)
        );

        vm.stopBroadcast();

        return (
            coffeeToken,
            inventoryManager,
            redemptionContract,
            proofOfReserve,
            helperConfig
        );
    }


}

// All WAGA Contracts Successfully Deployed & Verified on Base Sepolia:
// Contract Addresses:
// WAGACoffeeToken: 0xbAA584BDA90bF54fee155329e59C0E7e02A40FD2
// WAGAInventoryManager: 0xb9e41ab9c876B8281F8a286f4db1cFAFD6eFF25C
// WAGACoffeeRedemption: 0x82f57003c108d99337cc3E40D9DB86d2B3Fe6df2
// WAGAProofOfReserve: 0xf04e3F560DcFF5927aBDD0aa7755Dbaec56247ac
// HelperConfig: 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141