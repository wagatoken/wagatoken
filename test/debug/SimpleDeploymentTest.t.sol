// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {WAGABankingCore} from "../../src/WAGABankingCore.sol";
import {WAGATradeCompliance} from "../../src/WAGATradeCompliance.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

/**
 * @title SimpleDeploymentTest
 * @dev Simple test to verify deployment script works correctly
 */
contract SimpleDeploymentTest is Test {
    
    function testDeploymentScript() public {
        console.log("Starting simple deployment test...");
        
        DeployRealZKMVP deployer = new DeployRealZKMVP();
        
        (
            WAGACoffeeTokenCore coffeeToken,
            WAGATreasury treasury,
            WAGABankingCore bankingCore,
            WAGATradeCompliance tradeCompliance,
            HelperConfig helperConfig
        ) = deployer.run();
        
        // Verify contracts are deployed
        assertTrue(address(coffeeToken) != address(0), "CoffeeToken should be deployed");
        assertTrue(address(treasury) != address(0), "Treasury should be deployed");
        assertTrue(address(bankingCore) != address(0), "BankingCore should be deployed");
        assertTrue(address(tradeCompliance) != address(0), "TradeCompliance should be deployed");
        assertTrue(address(helperConfig) != address(0), "HelperConfig should be deployed");
        
        console.log("Simple deployment test completed successfully");
    }
}