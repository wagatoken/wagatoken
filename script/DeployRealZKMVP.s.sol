// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../src/WAGAZKManager.sol";
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../src/WAGAInventoryManagerMVP.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";

contract DeployRealZKMVP is Script {
    HelperConfig public helperConfig;

    function run()
        external
        returns (
            WAGACoffeeTokenCore,
            WAGABatchManager,
            WAGAZKManager,
            WAGAProofOfReserve,
            WAGAInventoryManagerMVP,
            WAGACoffeeRedemption,
            CircomVerifier,
            PrivacyLayer,
            HelperConfig
        )
    {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();

        vm.startBroadcast(config.deployerKey);

        // 1. Deploy CircomVerifier
        CircomVerifier zkVerifier = new CircomVerifier();

        // 2. Deploy PrivacyLayer
        PrivacyLayer privacyLayer = new PrivacyLayer();

        // 3. Deploy WAGACoffeeTokenCore
        WAGACoffeeTokenCore coffeeToken = new WAGACoffeeTokenCore("https://ipfs.io/ipfs/");

        // 4. Deploy WAGABatchManager
        WAGABatchManager batchManager = new WAGABatchManager(
            address(coffeeToken),
            address(privacyLayer)
        );

        // 5. Deploy WAGAZKManager
        WAGAZKManager zkManager = new WAGAZKManager(
            address(coffeeToken),
            address(zkVerifier)
        );

        // 6. Connect managers to token
        coffeeToken.setManagers(address(batchManager), address(zkManager));

        // 7. Deploy WAGAProofOfReserve
        WAGAProofOfReserve proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            address(batchManager),
            config.router,
            config.subscriptionId,
            config.donId
        );

        // 8. Deploy WAGAInventoryManagerMVP
        WAGAInventoryManagerMVP inventoryManager = new WAGAInventoryManagerMVP(
            address(coffeeToken),
            address(batchManager),
            address(proofOfReserve)
        );

        // 9. Deploy WAGACoffeeRedemption
        WAGACoffeeRedemption redemption = new WAGACoffeeRedemption(address(coffeeToken));

        // 10. Grant roles
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(zkVerifier));
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.MINTER_ROLE(), address(proofOfReserve));
        coffeeToken.grantRole(coffeeToken.REDEMPTION_ROLE(), address(redemption));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(batchManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(zkManager));

        vm.stopBroadcast();

        return (
            coffeeToken,
            batchManager,
            zkManager,
            proofOfReserve,
            inventoryManager,
            redemption,
            zkVerifier,
            privacyLayer,
            helperConfig
        );
    }
}
