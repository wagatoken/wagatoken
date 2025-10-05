// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";

/**
 * @title TestBatchCreation
 * @dev Test to debug batch creation issues
 */
contract TestBatchCreation is BaseWAGATest {
    
    function testRoleCheck() public view {
        console.log("Testing role assignments...");
        
        // Check if cooperative has required roles
        bool hasCooperativeRole = configManager.hasRole(configManager.COOPERATIVE_ROLE(), cooperative);
        bool hasProcessorRole = configManager.hasRole(configManager.PROCESSOR_ROLE(), cooperative);
        
        console.log("Cooperative address:", cooperative);
        console.log("Has COOPERATIVE_ROLE:", hasCooperativeRole);
        console.log("Has PROCESSOR_ROLE:", hasProcessorRole);
        
        assertTrue(hasCooperativeRole, "Cooperative should have COOPERATIVE_ROLE");
        assertTrue(hasProcessorRole, "Cooperative should have PROCESSOR_ROLE");
    }
    
    function testBatchCreationSimple() public {
        console.log("Testing simple batch creation...");
        
        // Check contract addresses
        console.log("CoffeeToken address:", address(coffeeToken));
        assertTrue(address(coffeeToken) != address(0), "CoffeeToken should not be zero address");
        
        // Try to create a batch as cooperative
        vm.prank(cooperative);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            50e6,
            "Test Origin",
            "Test Packaging",
            "ipfs://test"
        );
        
        console.log("Created batch ID:", batchId);
        assertTrue(batchId > 0, "Batch ID should be greater than 0");
    }
}