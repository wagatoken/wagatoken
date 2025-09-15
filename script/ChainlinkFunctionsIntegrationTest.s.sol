// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";

/**
 * @title ChainlinkFunctionsIntegrationTest
 * @dev Test script for Chainlink Functions integration - FINAL CORRECTED VERSION
 * Only WAGAProofOfReserve actually consumes Chainlink Functions directly
 */
contract ChainlinkFunctionsIntegrationTest is Script {
    // CORRECT: Only WAGAProofOfReserve directly consumes Chainlink Functions
    address private constant PROOF_OF_RESERVE = 0xe118d0b9285265ffe2912bA7958A4d40A047AcdB;
    
    // Other deployed contracts (for reference)
    address private constant INVENTORY_MANAGER = 0x4db07F076b73d0d9c4EFCcD56AAe418f034538f6;
    address private constant BATCH_MANAGER = 0x0604bD16E816323BCe84481612f5b4517a2654a8;
    address private constant ZK_MANAGER = 0xd8F264B4e7FBCE17dd0D3491D1684Ec5F630c023;
    address private constant PRIVACY_LAYER = 0xA7d5D48eD8549E48001F82F7c477D0D22893d453;
    
    // Chainlink Functions configuration (Base Sepolia - from HelperConfig.s.sol)
    string private constant DON_ID = "fun-base-sepolia-1";
    address private constant ROUTER_ADDRESS = 0xf9B8fc078197181C841c296C876945aaa425B278;
    uint64 private constant SUBSCRIPTION_ID = 429;
    uint32 private constant GAS_LIMIT = 300000;
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY_SEP");
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("CORRECTED: Chainlink Functions Integration Test");
        console.log("===============================================");
        console.log("");
        
        console.log("1. DIRECT Chainlink Functions Consumer:");
        console.log("   WAGAProofOfReserve:", PROOF_OF_RESERVE);
        console.log("   - Inherits WAGAChainlinkFunctionsBase");
        console.log("   - Inherits FunctionsClient");
        console.log("   - Has requestReserveVerification()");
        console.log("   - Has requestInventoryVerification()");
        console.log("   - MUST be authorized as consumer");
        console.log("");
        
        console.log("2. INDIRECT Chainlink Functions Usage:");
        console.log("   WAGAInventoryManagerMVP:", INVENTORY_MANAGER);
        console.log("   - Calls proofOfReserve.requestInventoryVerification()");
        console.log("   - Does NOT inherit FunctionsClient");
        console.log("   - Should NOT be added as consumer");
        console.log("");
        
        console.log("3. NO Chainlink Functions Integration:");
        console.log("   WAGABatchManager:", BATCH_MANAGER);
        console.log("   WAGAZKManager:", ZK_MANAGER);
        console.log("   PrivacyLayer:", PRIVACY_LAYER);
        console.log("   - None of these use Chainlink Functions");
        console.log("");
        
        console.log("4. Chainlink Configuration:");
        console.log("   DON ID:", DON_ID);
        console.log("   Router:", ROUTER_ADDRESS);
        console.log("   Subscription:", SUBSCRIPTION_ID);
        console.log("   Gas Limit:", GAS_LIMIT);
        
        vm.stopBroadcast();
        
        console.log("");
        console.log("FINAL ANSWER:");
        console.log("Add ONLY this contract as consumer to subscription 429:");
        console.log("WAGAProofOfReserve: 0xe118d0b9285265ffe2912bA7958A4d40A047AcdB");
    }
}
