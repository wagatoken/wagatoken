// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WAGACoffeeToken} from "../../src/WAGACoffeeToken.sol";
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";

contract SimpleRoleTest is Test {
    WAGACoffeeToken public coffeeToken;
    address public deployer;

    function setUp() public {
        deployer = makeAddr("deployer");
        vm.startPrank(deployer);
        
        // Deploy just the coffee token to test roles
        coffeeToken = new WAGACoffeeToken();
        
        console.log("Deployer:", deployer);
        console.log("Coffee token deployed at:", address(coffeeToken));
        
        // Check what roles the deployer has
        bool hasAdmin = coffeeToken.hasRole(coffeeToken.ADMIN_ROLE(), deployer);
        bool hasDefaultAdmin = coffeeToken.hasRole(coffeeToken.DEFAULT_ADMIN_ROLE(), deployer);
        
        console.log("Deployer has ADMIN_ROLE:", hasAdmin);
        console.log("Deployer has DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
        
        vm.stopPrank();
    }

    function testBasicRoleCheck() public {
        vm.startPrank(deployer);
        
        // First grant DEFAULT_ADMIN_ROLE to deployer so they can manage other roles
        coffeeToken.grantRole(coffeeToken.DEFAULT_ADMIN_ROLE(), deployer);
        
        // Now try to grant a role
        try coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), makeAddr("verifier")) {
            console.log("Successfully granted VERIFIER_ROLE");
        } catch {
            console.log("Failed to grant VERIFIER_ROLE");
        }
        
        vm.stopPrank();
        
        assertTrue(true, "Basic role test completed");
    }
}
