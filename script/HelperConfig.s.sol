// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        // USDC token address for payments
        address usdcAddress;
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

    NetworkConfig public activeNetworkConfig;

    // Constants
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant BASE_MAINNET_CHAIN_ID = 8453;
    uint256 public constant BASE_SEPOLIA_CHAIN_ID = 84532;
    uint256 public constant ZKSYNC_MAINNET_CHAIN_ID = 324;
    uint256 public constant ZKSYNC_SEPOLIA_CHAIN_ID = 300;
    uint256 public constant LOCAL_CHAIN_ID = 31337;
    uint256 private constant DEFAULT_ANVIL_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    constructor() {
        activeNetworkConfig = getNetworkConfigByChainId(block.chainid);
    }

    function getNetworkConfigByChainId(uint256 chainId) public view returns (NetworkConfig memory) {
        if (chainId == SEPOLIA_CHAIN_ID) {
            return getSepoliaConfig();
        } else if (chainId == BASE_MAINNET_CHAIN_ID) {
            return getBaseMainnetConfig();
        } else if (chainId == BASE_SEPOLIA_CHAIN_ID) {
            return getBaseSepoliaConfig();
        } else if (chainId == ZKSYNC_MAINNET_CHAIN_ID) {
            return getZksyncMainnetConfig();
        } else if (chainId == ZKSYNC_SEPOLIA_CHAIN_ID) {
            return getZksyncSepoliaConfig();
        } else {
            return getOrCreateAnvilConfig();
        }
    }

    function getUsdcAddress() public view returns (address) {
        return activeNetworkConfig.usdcAddress;
    }

    function getRouterAddress() public view returns (address) {
        return activeNetworkConfig.router;
    }

    function getDeployerKey() public view returns (uint256) {
        return activeNetworkConfig.deployerKey;
    }

    /**
     * @dev Returns the active network configuration for deployment
     */
    function getActiveNetworkConfig() external view returns (NetworkConfig memory) {
        return activeNetworkConfig;
    }    function getSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                usdcAddress: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238, // Mock USDC for testing
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
                usdcAddress: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, // Base Mainnet USDC
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
                usdcAddress: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, // Using mainnet address for testing
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
                usdcAddress: address(0), // TODO: Add USDC address for ZkSync mainnet
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
                usdcAddress: address(0), // TODO: Add USDC address for ZkSync sepolia
                subscriptionId: 0, // TODO: ZkSync doesn't support Chainlink Functions yet
                donId: bytes32(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                router: address(0), // TODO: ZkSync doesn't support Chainlink Functions yet
                cdpSmartAccountFactory: address(0), // CDP not available on ZkSync yet
                cdpPaymaster: address(0), // CDP not available on ZkSync yet
                deployerKey: vm.envOr("PRIVATE_KEY_SEP", uint256(0))
            });
    }

    function getOrCreateAnvilConfig() public pure returns (NetworkConfig memory) {
        // For MVP testing, use mock addresses
        address mockRouter = address(0x1234567890123456789012345678901234567890);

        return
            NetworkConfig({
                usdcAddress: address(0x1234567890123456789012345678901234567890), // Mock USDC for local testing
                subscriptionId: 1, // Use default test subscription ID
                donId: 0x66756e2d6c6f63616c2d74657374000000000000000000000000000000000000, // "fun-local-test"
                router: mockRouter,
                cdpSmartAccountFactory: address(0), // No CDP in local testing
                cdpPaymaster: address(0), // No CDP in local testing
                deployerKey: DEFAULT_ANVIL_KEY
            });
    }
}
