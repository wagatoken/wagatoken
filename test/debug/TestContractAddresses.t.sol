// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";

/**
 * @title TestContractAddresses
 * @dev Test to check if all contract dependencies are properly set
 */
contract TestContractAddresses is BaseWAGATest {
    
    function testContractAddresses() public view {
        console.log("Testing contract address dependencies...");
        
        // Check main contracts
        console.log("CoffeeToken address:", address(coffeeToken));
        console.log("ConfigManager address:", address(configManager));
        
        // Check if CoffeeToken has proper manager references
        // The CoffeeToken should point to a batch operations contract
        address batchOpsFromToken = address(coffeeToken.batchOperations());
        console.log("CoffeeToken.batchOperations():", batchOpsFromToken);
        
        assertTrue(address(coffeeToken) != address(0), "CoffeeToken should not be zero");
        assertTrue(address(configManager) != address(0), "ConfigManager should not be zero");
        assertTrue(batchOpsFromToken != address(0), "CoffeeToken batchOperations should not be zero");
        
        console.log("All contract addresses are properly set");
    }
}