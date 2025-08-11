// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {WAGACoffeeToken} from "../src/WAGACoffeeToken.sol";
import {WAGAConfigManager} from "../src/WAGAConfigManager.sol";
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
            WAGAConfigManager,
            WAGAInventoryManager,
            WAGACoffeeRedemption,
            WAGAProofOfReserve,
            HelperConfig
        )
    {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();

        vm.startBroadcast(config.deployerKey);

        // 1. Deploy WAGAConfigManager first (central role management)
        WAGAConfigManager configManager = new WAGAConfigManager();

        // 2. Deploy WAGACoffeeToken with ConfigManager address
        WAGACoffeeToken coffeeToken = new WAGACoffeeToken(address(configManager));

        // 3. Deploy WAGAInventoryManager with required parameters
        WAGAInventoryManager inventoryManager = new WAGAInventoryManager(
            address(coffeeToken),
            config.intervalSeconds,
            config.maxBatchesPerUpkeep,
            config.lowInventoryThreshold,
            config.longStorageThreshold
        );

        // 4. Deploy WAGACoffeeRedemption
        WAGACoffeeRedemption redemptionContract = new WAGACoffeeRedemption();

        // 5. Deploy WAGAProofOfReserve with Chainlink Functions parameters
        WAGAProofOfReserve proofOfReserve;
        if (config.router != address(0)) {
            // Deploy with Chainlink Functions support
            proofOfReserve = new WAGAProofOfReserve(
                address(coffeeToken),
                config.router,
                config.subscriptionId,
                config.donId
            );
        } else {
            // Deploy without Chainlink Functions (for ZkSync or local testing)
            // You might need a different constructor or initialization method
            proofOfReserve = new WAGAProofOfReserve(
                address(coffeeToken),
                address(0), // No router
                0, // No subscription
                bytes32(0) // No DON ID
            );
        }

        // 6. Initialize contracts that require two-phase deployment
        redemptionContract.initialize(address(coffeeToken));
        
        // 7. Set up contract addresses in ConfigManager
        configManager.setInventoryManager(address(inventoryManager));
        configManager.setRedemptionManager(address(redemptionContract));
        // Note: You'll need to implement setProofOfReserveManager in WAGAConfigManager
        // configManager.setProofOfReserveManager(address(proofOfReserve));

        // 8. Grant necessary roles through ConfigManager
        // The ConfigManager will handle role assignments to the contracts
        
        // 9. Set up CoffeeToken with contract addresses (if needed)
        // coffeeToken.setInventoryManager(address(inventoryManager));
        // coffeeToken.setRedemptionContract(address(redemptionContract));
        // coffeeToken.setProofOfReserveContract(address(proofOfReserve));

        vm.stopBroadcast();

        return (
            coffeeToken,
            configManager,
            inventoryManager,
            redemptionContract,
            proofOfReserve,
            helperConfig
        );
    }

    // Helper function to deploy just the core contracts for testing
    function deployCore() 
        external 
        returns (WAGACoffeeToken, WAGAConfigManager, HelperConfig) 
    {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();

        vm.startBroadcast(config.deployerKey);

        WAGAConfigManager configManager = new WAGAConfigManager();
        WAGACoffeeToken coffeeToken = new WAGACoffeeToken(address(configManager));

        vm.stopBroadcast();

        return (coffeeToken, configManager, helperConfig);
    }
}
