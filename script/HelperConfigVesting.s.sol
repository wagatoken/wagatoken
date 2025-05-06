// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract HelperConfigVesting is Script {
    struct NetworkConfig {
        address wagaToken;
        uint256 deployerKey;
    }

    mapping(uint256 => NetworkConfig) private networkConfigs;
    NetworkConfig public activeNetworkConfig;
    uint256 public constant DEFAULT_ANVIL_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    constructor() {
        // Initialize network configurations
        networkConfigs[11155111] = getSepoliaConfig();
        networkConfigs[1] = getBaseMainnetConfig();
        networkConfigs[31337] = getOrCreateAnvilConfig(); // Local Anvil network

        // Set the active network configuration
        activeNetworkConfig = networkConfigs[block.chainid];

        // If no configuration exists for the current chain, create a default one
        if (activeNetworkConfig.wagaToken == address(0)) {
            activeNetworkConfig = getOrCreateAnvilConfig();
        }
    }

    /**
     * @dev Returns the configuration for the Ethereum mainnet.
     */
    function getBaseSepoliaConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            wagaToken: 0x1234567890123456789012345678901234567890, // Replace with actual WagaToken address
            deployerKey: vm.envUint("PRIVATE_KEY_MAINNET")
        });
    }

    /**
     * @dev Returns the configuration for the Sepolia testnet.
     */
    function getSepoliaConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            wagaToken: 0x1234567890123456789012345678901234567890, // Replace with actual WagaToken address
            deployerKey: vm.envUint("PRIVATE_KEY_SEP")
        });
    }

    /**
     * @dev Returns the configuration for the Ethereum mainnet.
     */
    function getBaseMainnetConfig() public view returns (NetworkConfig memory) {
        return NetworkConfig({
            wagaToken: 0x9876543210987654321098765432109876543210, // Replace with actual WagaToken address
            deployerKey: vm.envUint("PRIVATE_KEY_MAINNET")
        });
    }

    /**
     * @dev Creates or retrieves the configuration for the local Anvil network.
     */
    function getOrCreateAnvilConfig() public returns (NetworkConfig memory) {
        if (activeNetworkConfig.wagaToken != address(0)) {
            return activeNetworkConfig;
        }

        vm.startBroadcast();

        // Deploy a mock WagaToken for local testing
        ERC20Mock wagaTokenMock = new ERC20Mock();
        wagaTokenMock.mint(msg.sender, 1_000_000_000 ether);

        vm.stopBroadcast();

        return NetworkConfig({
            wagaToken: address(wagaTokenMock),
            deployerKey: DEFAULT_ANVIL_KEY
        });
    }

    /**
     * @dev Retrieves the network configuration for a specific chain ID.
     * @param chainId The chain ID of the network.
     * @return The network configuration.
     */
    function getNetworkConfig(uint256 chainId) external view returns (NetworkConfig memory) {
        return networkConfigs[chainId];
    }
}
