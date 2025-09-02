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
import {WAGATreasury} from "../src/WAGATreasury.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";
import {MockCircomVerifier} from "../src/MockCircomVerifier.sol";

/**
 * @title DeployRealZKMVPForTesting
 * @dev Deployment script for testing with MockCircomVerifier following HelperConfig pattern
 * @notice This script deploys the full ZK MVP system using MockCircomVerifier for testing
 */
contract DeployRealZKMVPForTesting is Script {
    function run()
        external
        returns (
            WAGACoffeeTokenCore,
            WAGABatchManager,
            WAGAZKManager,
            WAGAProofOfReserve,
            WAGAInventoryManagerMVP,
            WAGACoffeeRedemption,
            MockCircomVerifier,
            PrivacyLayer,
            HelperConfig
        )
    {
        HelperConfig helperConfig = new HelperConfig();
        (
            address usdcAddress,
            address router,
            uint256 deployerKey
        ) = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerKey);

        // 1. Deploy MockCircomVerifier for testing
        MockCircomVerifier mockVerifier = new MockCircomVerifier();

        // 2. Deploy WAGACoffeeTokenCore first
        WAGACoffeeTokenCore coffeeToken = new WAGACoffeeTokenCore("https://ipfs.io/ipfs/");

        // 3. Deploy PrivacyLayer with coffee token reference
        PrivacyLayer privacyLayer = new PrivacyLayer(address(coffeeToken));

        // 4. Deploy WAGABatchManager
        WAGABatchManager batchManager = new WAGABatchManager(
            address(coffeeToken),
            address(privacyLayer)
        );

        // 5. Deploy WAGAZKManager
        WAGAZKManager zkManager = new WAGAZKManager(
            address(coffeeToken),
            address(mockVerifier)
        );

        // 6. Connect managers to token
        coffeeToken.setManagers(address(batchManager), address(zkManager));

        // 7. Deploy WAGAProofOfReserve
        WAGAProofOfReserve proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            address(batchManager),
            router,
            0, // subscriptionId - use default for testing
            bytes32(0) // donId - use default for testing
        );

        // 8. Deploy WAGAInventoryManagerMVP
        WAGAInventoryManagerMVP inventoryManager = new WAGAInventoryManagerMVP(
            address(coffeeToken),
            address(batchManager),
            address(proofOfReserve)
        );

        // 9. Deploy Treasury and Redemption
        WAGATreasury treasury = new WAGATreasury(usdcAddress);
        WAGACoffeeRedemption redemption = new WAGACoffeeRedemption(address(coffeeToken), address(treasury));

        // 10. Grant roles
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(mockVerifier));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(zkManager)); // ZK Manager needs to call verifier
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.MINTER_ROLE(), address(proofOfReserve));
        coffeeToken.grantRole(coffeeToken.REDEMPTION_ROLE(), address(redemption));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(batchManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(zkManager));

        // Grant VERIFIER_ROLE to MockCircomVerifier
        mockVerifier.grantVerifierRole(address(zkManager));

        vm.stopBroadcast();

        return (
            coffeeToken,
            batchManager,
            zkManager,
            proofOfReserve,
            inventoryManager,
            redemption,
            mockVerifier,
            privacyLayer,
            helperConfig
        );
    }
}
