// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {WAGABankingCore} from "../../src/WAGABankingCore.sol";
import {WAGATradeCompliance} from "../../src/WAGATradeCompliance.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";

/**
 * @title MinimalBaseWAGATest
 * @dev Minimal test to debug BaseWAGATest issues
 */
contract MinimalBaseWAGATest is Test {
    
    DeployRealZKMVP internal deployer;
    WAGACoffeeTokenCore internal coffeeToken;
    WAGATreasury internal treasury;
    WAGABankingCore internal bankingCore;
    WAGATradeCompliance internal tradeCompliance;
    HelperConfig internal helperConfig;
    WAGAConfigManager internal configManager;
    
    HelperConfig.NetworkConfig internal networkConfig;
    address internal admin;
    
    function setUp() public virtual {
        console.log("Starting minimal BaseWAGATest setup...");
        
        // Deploy WAGA system
        deployer = new DeployRealZKMVP();
        
        (
            coffeeToken,
            treasury,
            bankingCore,
            tradeCompliance,
            helperConfig
        ) = deployer.run();
        
        // Access deployed contracts
        configManager = deployer.configManager();
        
        // Setup network config and admin
        networkConfig = helperConfig.getActiveNetworkConfig();
        admin = vm.addr(networkConfig.deployerKey);
        
        console.log("Minimal BaseWAGATest setup completed successfully");
        console.log("Admin address:", admin);
        console.log("CoffeeToken address:", address(coffeeToken));
        console.log("ConfigManager address:", address(configManager));
    }
    
    function testBasicDeployment() public view {
        // Verify contracts are deployed
        assertTrue(address(coffeeToken) != address(0), "CoffeeToken should be deployed");
        assertTrue(address(treasury) != address(0), "Treasury should be deployed");
        assertTrue(address(configManager) != address(0), "ConfigManager should be deployed");
        
        console.log("Basic deployment verification passed");
    }
    
    function testAdminRoleAccess() public {
        // Test if admin can call a basic role function
        vm.prank(admin);
        
        // Try a simple role check (this should not revert if roles are properly set)
        bool hasAdminRole = configManager.hasRole(configManager.ADMIN_ROLE(), admin);
        assertTrue(hasAdminRole, "Admin should have ADMIN_ROLE");
        
        console.log("Admin role access verification passed");
    }
}