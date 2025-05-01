// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";


contract HelperConfig is Script {
    struct NetworkConfig {
        address ethUsdPriceFeed;
        address usdcAddress;
        uint256 deployerKey;
    }

    mapping(uint256 => NetworkConfig) private networkConfigs;
    NetworkConfig public activeNetworkConfig;
    uint8 public constant DECIMALS = 8;
    int256 public constant ETH_USD_PRICE = 3000e8;
    uint256 public DEFAULT_ANVIL_KEY =
        0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;

    constructor() {
        // Initialize network configurations
        networkConfigs[11155111] = getSepoliaEthConfig();
        networkConfigs[1] = getMainnetEthConfig();
        networkConfigs[324] = getZksyncMainnetConfig();
        networkConfigs[300] = getZksyncSepoliaConfig();
        networkConfigs[10] = getOptimismMainnetConfig();
        networkConfigs[11155420] = getOptimismSepoliaConfig();
        networkConfigs[42161] = getArbitrumMainnetConfig();
        networkConfigs[421614] = getArbitrumSepoliaConfig();
        networkConfigs[137] = getPolygonMainnetConfig();
        networkConfigs[80002] = getPolygonAmoyConfig();
        networkConfigs[8453] = getBaseMainnetConfig();
        networkConfigs[84532] = getBaseSepoliaConfig();

        // Set the active network configuration
        activeNetworkConfig = networkConfigs[block.chainid];

        // If no configuration exists for the current chain, create a default one
        if (activeNetworkConfig.ethUsdPriceFeed == address(0)) {
            activeNetworkConfig = getOrCreateAnvilConfig();
        }
    }


    function getSepoliaEthConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x694AA1769357215DE4FAC081bf1f309aDC325306,
                usdcAddress: 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238,
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getMainnetEthConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419,
                usdcAddress: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48, // 
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getZksyncMainnetConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x6D41d1dc818112880b40e26BD6FD347E41008eDA,
                usdcAddress: 0x1d17CBcF0D6D143135aE902365D2E5e2A16538D4, // 
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getZksyncSepoliaConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0xfEefF7c3fB57d18C5C6Cdd71e45D2D0b4F9377bF,
                usdcAddress: 0xAe045DE5638162fa134807Cb558E15A3F5A7F853, // ← Replace with actual address
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getBaseMainnetConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70,
                usdcAddress: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, // ← Replace with actual address
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

        function getBaseSepoliaConfig() public view returns (NetworkConfig memory) {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x4aDC67696bA383F43DD60A9e78F2C97Fbbfc7cb1,
                usdcAddress: 0x036CbD53842c5426634e7929541eC2318f3dCF7e,
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getOptimismMainnetConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x13e3Ee699D1909E989722E753853AE30b17e08c5,
                usdcAddress: 0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85, 
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getOptimismSepoliaConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x61Ec26aA57019C486B10502285c5A3D4A4750AD7,
                usdcAddress: 0x5fd84259d66Cd46123540766Be93DFE6D43130D7,
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getArbitrumMainnetConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612,
                usdcAddress: 0xaf88d065e77c8cC2239327C5EDb3A432268e5831, 
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getArbitrumSepoliaConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0xd30e2101a97dcbAeBCBC04F14C3f624E67A35165,
                usdcAddress: 0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d,
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });        
    }

    function getPolygonMainnetConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0xF9680D99D6C9589e2a93a78A04A279e509205945,
                usdcAddress: 0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359, 
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }
    function getPolygonAmoyConfig()
        public
        view
        returns (NetworkConfig memory)
    {
        return
            NetworkConfig({
                ethUsdPriceFeed: 0xF0d50568e3A7e8259E16663972b11910F89BD8e7,
                usdcAddress: 0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582,
                deployerKey: vm.envUint("PRIVATE_KEY_SEP")
            });
    }

    function getOrCreateAnvilConfig() public returns (NetworkConfig memory) {
        if (activeNetworkConfig.ethUsdPriceFeed != address(0)) {
            return activeNetworkConfig;
        }

        vm.startBroadcast();

        // Mock ETH/USD price feed
        MockV3Aggregator ethUsdPriceFeed = new MockV3Aggregator(
            DECIMALS,
            ETH_USD_PRICE
        );

        // Mock USDC token
        ERC20Mock usdcMock = new ERC20Mock();

        vm.stopBroadcast();

        return
            NetworkConfig({
                ethUsdPriceFeed: address(ethUsdPriceFeed),
                usdcAddress: address(usdcMock),
                deployerKey: DEFAULT_ANVIL_KEY
            });
    }
}

// constructor() {
//         // Initialize network configurations
//         networkConfigs[11155111] = getSepoliaEthConfig();
//         networkConfigs[1] = getMainnetEthConfig();
//         networkConfigs[324] = getZksyncMainnetConfig();
//         networkConfigs[300] = getZksyncSepoliaConfig();
//         networkConfigs[10] = getOptimismMainnetConfig();
//         networkConfigs[11155420] = getOptimismSepoliaConfig();
//         networkConfigs[42161] = getArbitrumMainnetConfig();
//         networkConfigs[421614] = getArbitrumSepoliaConfig();
//         networkConfigs[137] = getPolygonMainnetConfig();
//         networkConfigs[80002] = getPolygonAmoyConfig();
//         networkConfigs[8453] = getBaseMainnetConfig();
//         networkConfigs[84532] = getBaseSepoliaConfig();

//         // Set the active network configuration
//         activeNetworkConfig = networkConfigs[block.chainid];

//         // If no configuration exists for the current chain, create a default one
//         if (activeNetworkConfig.ethUsdPriceFeed == address(0)) {
//             activeNetworkConfig = getOrCreateAnvilConfig();
//         }
//     }