// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        // Chainlink Functions parameters
        uint64 subscriptionId;
        bytes32 donId;
        address router;
        // Coinbase Developer Platform parameters
        address cdpSmartAccountFactory;
        address cdpPaymaster;
        // Deployment parameters
        uint256 deployerKey;
    }

    mapping(uint256 => NetworkConfig) private networkConfigs;
    NetworkConfig public networkConfig;

    // Default values for local testing
    uint256 public DEFAULT_ANVIL_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
    uint64 public constant DEFAULT_SUBSCRIPTION_ID = 0;
    bytes32 public constant DEFAULT_DON_ID = bytes32(0);

    constructor() {
        // Initialize network configurations
        networkConfigs[11155111] = getSepoliaConfig(); // Ethereum Sepolia
        networkConfigs[8453] = getBaseMainnetConfig(); // Base Mainnet
        networkConfigs[84532] = getBaseSepoliaConfig(); // Base Sepolia
        networkConfigs[324] = getZksyncMainnetConfig(); // ZkSync Era Mainnet
        networkConfigs[300] = getZksyncSepoliaConfig(); // ZkSync Era Sepolia

        // Set the active network configuration
        networkConfig = networkConfigs[block.chainid];

        // If no configuration exists for the current chain, create a default one
        if (networkConfig.router == address(0)) {
            networkConfig = getOrCreateAnvilConfig();
        }
    }

    /**
     * @dev Returns the active network configuration values for deployment
     * @return usdcAddress The USDC contract address for the current network
     * @return router The Chainlink Functions router address
     * @return deployerKey The private key for deployment
     */
    function activeNetworkConfig()
        external
        view
        returns (address usdcAddress, address router, uint256 deployerKey)
    {
        return (
            getUSDCAddress(),
            networkConfig.router,
            networkConfig.deployerKey
        );
    }

    /**
     * @dev Get USDC address for the current network
     */
    function getUSDCAddress() public view returns (address) {
        uint256 chainId = block.chainid;

        if (chainId == 8453) {
            // Base Mainnet
            return 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        } else if (chainId == 84532) {
            // Base Sepolia - using mainnet address for testing
            return 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913;
        } else if (chainId == 11155111) {
            // Ethereum Sepolia (mock USDC)
            return 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238; // Mock USDC for testing
        } else {
            // Anvil/Local (mock USDC)
            return address(0x1234567890123456789012345678901234567890); // Mock USDC for local testing
        }
    }

    function getSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 5455,
                donId: 0x66756e2d657468657265756d2d7365706f6c69612d3100000000000000000000, // fun-ethereum-sepolia-1
                router: 0xb83E47C2bC239B3bf370bc41e1459A34b41238D0, // Sepolia Functions Router
                cdpSmartAccountFactory: address(0), // CDP not available on Sepolia yet
                cdpPaymaster: address(0), // CDP not available on Sepolia yet
                deployerKey: vm.envOr("PRIVATE_KEY_SEP", uint256(0))
            });
    }

    function getBaseMainnetConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: Replace with actual Base subscription ID
                donId: 0x66756e2d626173652d6d61696e6e65742d310000000000000000000000000000, // fun-base-mainnet-1
                router: 0xf9B8fc078197181C841c296C876945aaa425B278, // Base Functions Router
                cdpSmartAccountFactory: address(0), // TODO: Add CDP smart account factory for Base
                cdpPaymaster: address(0), // TODO: Add CDP paymaster for Base
                deployerKey: vm.envOr("PRIVATE_KEY_SEP", uint256(0))
            });
    }

    function getBaseSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 429,
                donId: 0x66756e2d626173652d7365706f6c69612d310000000000000000000000000000,
                router: 0xf9B8fc078197181C841c296C876945aaa425B278,
                cdpSmartAccountFactory: address(0), // CDP not available on Base Sepolia yet
                cdpPaymaster: address(0), // CDP not available on Base Sepolia yet
                deployerKey: vm.envOr("PRIVATE_KEY_SEP", uint256(0))
            });
    }

    function getZksyncMainnetConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: ZkSync doesn't support Chainlink Functions yet
                donId: bytes32(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                router: address(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                cdpSmartAccountFactory: address(0), // CDP not available on ZkSync yet
                cdpPaymaster: address(0), // CDP not available on ZkSync yet
                deployerKey: vm.envOr("PRIVATE_KEY_SEP", uint256(0))
            });
    }

    function getZksyncSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                subscriptionId: 0, // TODO: ZkSync doesn't support Chainlink Functions yet
                donId: bytes32(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                router: address(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                cdpSmartAccountFactory: address(0), // CDP not available on ZkSync yet
                cdpPaymaster: address(0), // CDP not available on ZkSync yet
                deployerKey: vm.envOr("PRIVATE_KEY_SEP", uint256(0))
            });
    }

    function getOrCreateAnvilConfig() public view returns (NetworkConfig memory) {
        // Check if we already deployed mocks
        if (networkConfig.router != address(0)) {
            return networkConfig;
        }

        // For MVP testing, use mock address
        address mockRouter = address(0x1234567890123456789012345678901234567890);

        return
            NetworkConfig({
                subscriptionId: 1, // Use default test subscription ID
                donId: 0x66756e2d6c6f63616c2d74657374000000000000000000000000000000000000, // "fun-local-test"
                router: mockRouter,
                cdpSmartAccountFactory: address(0), // No CDP in local testing
                cdpPaymaster: address(0), // No CDP in local testing
                deployerKey: DEFAULT_ANVIL_KEY
            });
    }

    function getActiveNetworkConfig() external view returns (NetworkConfig memory) {
        return networkConfig;
    }
}
