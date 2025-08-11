// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        // Chainlink Functions parameters
        uint64 subscriptionId;
        bytes32 donId;
        address router;
        // Deployment parameters
        uint256 deployerKey;
        // Additional parameters for your contracts
        // uint256 intervalSeconds;
        // uint256 maxBatchesPerUpkeep;
        // uint256 lowInventoryThreshold;
        // uint256 longStorageThreshold;
    }

    mapping(uint256 => NetworkConfig) private networkConfigs; // mapping of chain ID to network configuration
    NetworkConfig public activeNetworkConfig;
    
    // Default values for local testing
    uint256 public DEFAULT_ANVIL_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint64 public constant DEFAULT_SUBSCRIPTION_ID = 0;
    bytes32 public constant DEFAULT_DON_ID = bytes32(0);
    address public constant DEFAULT_ROUTER_ADDRESS = address(0);

    constructor() {
        // Initialize network configurations
        networkConfigs[11155111] = getSepoliaConfig(); // Ethereum Sepolia
        networkConfigs[8453] = getBaseMainnetConfig(); // Base Mainnet
        networkConfigs[84532] = getBaseSepoliaConfig(); // Base Sepolia
        networkConfigs[324] = getZksyncMainnetConfig(); // ZkSync Era Mainnet
        networkConfigs[300] = getZksyncSepoliaConfig(); // ZkSync Era Sepolia

        // Set the active network configuration
        activeNetworkConfig = networkConfigs[block.chainid];

        // If no configuration exists for the current chain, create a default one
        if (activeNetworkConfig.router == address(0)) {
            activeNetworkConfig = getOrCreateAnvilConfig();
        }
    }

    function getSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: Replace with actual Sepolia subscription ID
                donId: 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000, // fun-ethereum-sepolia-1
                router: 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0, // Sepolia Functions Router
                deployerKey: vm.envUint("PRIVATE_KEY_SEP"),
                // intervalSeconds: 300, // 5 minutes
                // maxBatchesPerUpkeep: 10,
                // lowInventoryThreshold: 100,
                // longStorageThreshold: 90 // 90 days
            });
    }

    function getBaseMainnetConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: Replace with actual Base subscription ID
                donId: 0x66756e2d626173652d6d61696e6e65742d310000000000000000000000000000, // fun-base-mainnet-1
                router: 0xf9B8fc078197181C841c296C876945aaa425B278, // Base Functions Router
                deployerKey: vm.envUint("PRIVATE_KEY_MAINNET"),
                // intervalSeconds: 300, // 5 minutes
                // maxBatchesPerUpkeep: 10,
                // lowInventoryThreshold: 100,
                // longStorageThreshold: 90 // 90 days
            });
    }

    function getBaseSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: Replace with actual Base Sepolia subscription ID
                donId: 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000, // fun-base-sepolia-1
                router: 0xf9B8fc078197181C841c296C876945aaa425B278, // Base Sepolia Functions Router
                deployerKey: vm.envUint("PRIVATE_KEY_SEP"),
                // intervalSeconds: 300, // 5 minutes
                // maxBatchesPerUpkeep: 10,
                // lowInventoryThreshold: 100,
                // longStorageThreshold: 90 // 90 days
            });
    }

    function getZksyncMainnetConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: ZkSync doesn't support Chainlink Functions yet
                donId: bytes32(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                router: address(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                deployerKey: vm.envUint("PRIVATE_KEY_MAINNET"),
                // intervalSeconds: 300, // 5 minutes
                // maxBatchesPerUpkeep: 10,
                // lowInventoryThreshold: 100,
                // longStorageThreshold: 90 // 90 days
            });
    }

    function getZksyncSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: ZkSync doesn't support Chainlink Functions yet
                donId: bytes32(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                router: address(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                deployerKey: vm.envUint("PRIVATE_KEY_SEP"),
                // intervalSeconds: 300, // 5 minutes
                // maxBatchesPerUpkeep: 10,
                // lowInventoryThreshold: 100,
                // longStorageThreshold: 90 // 90 days
            });
    }

    function getOrCreateAnvilConfig() public pure returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: DEFAULT_SUBSCRIPTION_ID,
                donId: DEFAULT_DON_ID,
                router: address(0), // No Chainlink Functions on local
                deployerKey: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80,
                // intervalSeconds: 60, // 1 minute for testing
                // maxBatchesPerUpkeep: 5,
                // lowInventoryThreshold: 10,
                // longStorageThreshold: 1 // 1 day for testing
            });
    }

    function getActiveNetworkConfig() external view returns (NetworkConfig memory) {
        return activeNetworkConfig;
    }
}
