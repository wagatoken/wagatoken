// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script, console} from "forge-std/Script.sol";
import {WAGAConfigManager} from "../src/WAGAConfigManager.sol";
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
import {WAGACoffeeBatchOperations} from "../src/WAGACoffeeBatchOperations.sol";

/**
 * @title ValidateAccessControlFixes
 * @dev Script to validate that the access control fixes work correctly
 */
contract ValidateAccessControlFixes is Script {
    function run() external {
        // Deploy config manager first
        vm.startBroadcast();
        
        WAGAConfigManager configManager = new WAGAConfigManager();
        
        console.log("=== Access Control Validation ===");
        console.log("Config Manager deployed at:", address(configManager));
        
        // Test role validation helper functions
        console.log("\n=== Testing Role Validation Helpers ===");
        
        // Grant roles to deployer for testing
        configManager.grantProcessorRole(msg.sender);
        configManager.grantBatchCreatorRole(msg.sender);
        configManager.grantDistributorRole(msg.sender);
        
        // Test helper functions
        bool canCreate = configManager.canCreateBatches(msg.sender);
        bool canDistribute = configManager.canDistributeTokens(msg.sender);
        bool canVerify = configManager.canVerifyBatches(msg.sender);
        bool canVerifyZK = configManager.canVerifyZKProofs(msg.sender);
        bool canProcessPayments = configManager.canProcessPayments(msg.sender);
        
        console.log("Can create batches:", canCreate);
        console.log("Can distribute tokens:", canDistribute);
        console.log("Can verify batches:", canVerify);
        console.log("Can verify ZK proofs:", canVerifyZK);
        console.log("Can process payments:", canProcessPayments);
        
        // Expected results validation
        require(canCreate == true, "Should be able to create batches (has PROCESSOR_ROLE and BATCH_CREATOR_ROLE)");
        require(canDistribute == true, "Should be able to distribute tokens (has DISTRIBUTOR_ROLE)");
        require(canVerify == true, "Should be able to verify batches (has ADMIN_ROLE)");
        require(canVerifyZK == true, "Should be able to verify ZK proofs (has ZK_VERIFIER_ROLE from constructor)");
        require(canProcessPayments == true, "Should be able to process payments (has ADMIN_ROLE which includes payment processing)");
        
        console.log("\n=== Testing Individual Role Checks ===");
        
        // Test individual role checks
        bool hasCooperativeRole = configManager.hasRole(configManager.COOPERATIVE_ROLE(), msg.sender);
        bool hasProcessorRole = configManager.hasRole(configManager.PROCESSOR_ROLE(), msg.sender);
        bool hasBatchCreatorRole = configManager.hasRole(configManager.BATCH_CREATOR_ROLE(), msg.sender);
        bool hasDistributorRole = configManager.hasRole(configManager.DISTRIBUTOR_ROLE(), msg.sender);
        bool hasAdminRole = configManager.hasRole(configManager.DEFAULT_ADMIN_ROLE(), msg.sender);
        
        console.log("Has COOPERATIVE_ROLE:", hasCooperativeRole);
        console.log("Has PROCESSOR_ROLE:", hasProcessorRole);
        console.log("Has BATCH_CREATOR_ROLE:", hasBatchCreatorRole);
        console.log("Has DISTRIBUTOR_ROLE:", hasDistributorRole);
        console.log("Has DEFAULT_ADMIN_ROLE:", hasAdminRole);
        
        // Validate expected role assignments
        require(hasCooperativeRole == false, "Should NOT have COOPERATIVE_ROLE");
        require(hasProcessorRole == true, "Should have PROCESSOR_ROLE");
        require(hasBatchCreatorRole == true, "Should have BATCH_CREATOR_ROLE");
        require(hasDistributorRole == true, "Should have DISTRIBUTOR_ROLE");
        require(hasAdminRole == true, "Should have DEFAULT_ADMIN_ROLE (deployer)");
        
        console.log("\n=== All Access Control Tests Passed! ===");
        console.log("[PASS] Role validation helper functions work correctly");
        console.log("[PASS] BATCH_CREATOR_ROLE is properly implemented");
        console.log("[PASS] Role assignment functions work as expected");
        console.log("[PASS] Access control consistency fixes are successful");
        
        vm.stopBroadcast();
    }
}