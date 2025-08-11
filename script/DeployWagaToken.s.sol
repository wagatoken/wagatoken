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
