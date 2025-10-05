// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

// Import individual contracts for isolated testing
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGACoffeeBatchOperations} from "../../src/WAGACoffeeBatchOperations.sol";
import {Groth16Verifier as PriceVerifier} from "../../src/verifiers/PricePrivacyCircuitVerifier.sol";

contract GasDebugTest is Test {
    function testStepByStepDeployment() public {
        console.log("=== TESTING STEP-BY-STEP DEPLOYMENT ===");
        
        uint256 gasBefore;
        uint256 gasAfter;
        
        // Step 1: Deploy HelperConfig
        gasBefore = gasleft();
        HelperConfig helperConfig = new HelperConfig();
        gasAfter = gasleft();
        console.log("HelperConfig gas used:", gasBefore - gasAfter);
        
        // Step 2: Deploy first ZK verifier
        gasBefore = gasleft();
        PriceVerifier priceVerifier = new PriceVerifier();
        gasAfter = gasleft();
        console.log("PriceVerifier gas used:", gasBefore - gasAfter);
        
        // Step 3: Deploy WAGAConfigManager
        gasBefore = gasleft();
        WAGAConfigManager configManager = new WAGAConfigManager();
        gasAfter = gasleft();
        console.log("WAGAConfigManager gas used:", gasBefore - gasAfter);
        
        // Step 4: Deploy WAGACoffeeTokenCore
        gasBefore = gasleft();
        WAGACoffeeTokenCore coffeeToken = new WAGACoffeeTokenCore("", address(configManager), address(0));
        gasAfter = gasleft();
        console.log("WAGACoffeeTokenCore gas used:", gasBefore - gasAfter);
        
        // Step 5: Deploy WAGACoffeeBatchOperations  
        gasBefore = gasleft();
        WAGACoffeeBatchOperations batchOps = new WAGACoffeeBatchOperations(address(configManager), address(coffeeToken));
        gasAfter = gasleft();
        console.log("WAGACoffeeBatchOperations gas used:", gasBefore - gasAfter);
        
        // Step 6: Connect them
        gasBefore = gasleft();
        coffeeToken.setBatchOperations(address(batchOps));
        gasAfter = gasleft();
        console.log("setBatchOperations gas used:", gasBefore - gasAfter);
        
        console.log("=== INDIVIDUAL DEPLOYMENTS SUCCESSFUL ===");
    }
    
    function testFullDeploymentWithGasTracking() public {
        console.log("=== TESTING FULL DEPLOYMENT WITH GAS TRACKING ===");
        
        uint256 gasBefore = gasleft();
        
        DeployRealZKMVP deployer = new DeployRealZKMVP();
        deployer.run();
        
        uint256 gasAfter = gasleft();
        console.log("Full deployment gas used:", gasBefore - gasAfter);
    }
    
    function testRoleGrantingGas() public {
        console.log("=== TESTING ROLE GRANTING GAS ===");
        
        WAGAConfigManager configManager = new WAGAConfigManager();
        
        uint256 gasBefore = gasleft();
        configManager.grantProcessorRole(address(this));
        uint256 gasAfter = gasleft();
        console.log("Single role grant gas used:", gasBefore - gasAfter);
        
        // Test multiple role grants
        gasBefore = gasleft();
        for (uint i = 0; i < 10; i++) {
            configManager.grantDistributorRole(address(uint160(i + 1000)));
        }
        gasAfter = gasleft();
        console.log("10 role grants gas used:", gasBefore - gasAfter);
    }
}