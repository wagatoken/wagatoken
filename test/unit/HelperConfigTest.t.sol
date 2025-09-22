// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";

contract HelperConfigTest is Test {
    HelperConfig public helperConfig;

    function testHelperConfigDeployment() public {
        console.log("Creating HelperConfig...");
        helperConfig = new HelperConfig();
        console.log("HelperConfig created");

        console.log("Getting active network config...");
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        console.log("Got config");

        console.log("Chain ID:", block.chainid);
        console.log("Router address:", config.router);
        console.log("USDC address:", config.usdcAddress);
        console.log("Deployer key:", config.deployerKey);

        // Verify USDC and router are different
        assertTrue(config.usdcAddress != config.router, "USDC and router should be different addresses");
        
        // Verify USDC has code deployed
        assertTrue(config.usdcAddress.code.length > 0, "USDC should have contract code deployed");
        
        // Test MockUSDC functionality
        MockUSDC mockUSDC = MockUSDC(config.usdcAddress);
        console.log("MockUSDC name:", mockUSDC.name());
        console.log("MockUSDC symbol:", mockUSDC.symbol());
        console.log("MockUSDC decimals:", mockUSDC.decimals());
        
        // Test minting
        address testUser = makeAddr("testUser");
        mockUSDC.mint(testUser, 1000e6);
        assertEq(mockUSDC.balanceOf(testUser), 1000e6, "Minting should work");
        
        console.log("All HelperConfig tests passed!");
    }
}
