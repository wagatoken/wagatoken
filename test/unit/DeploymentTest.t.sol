// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployWagaToken} from "../../script/DeployWagaToken.s.sol";

/**
 * @title DeploymentTest
 * @dev Simple test to debug deployment issues
 */
contract DeploymentTest is Test {
    function testBasicDeployment() public {
        DeployWagaToken deployer = new DeployWagaToken();
        
        // This should work without any role issues
        deployer.run();
        
        console.log("Deployment completed successfully!");
    }
}
