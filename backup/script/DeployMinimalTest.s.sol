// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WAGACoffeeToken} from "../src/WAGACoffeeToken.sol";
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";

/**
 * @title DeployMinimalTest
 * @dev Minimal deployment to test individual contracts
 */
contract DeployMinimalTest is Script {
    
    function run() external {
        vm.startBroadcast();

        // Test deploy just CircomVerifier
        console.log("Deploying CircomVerifier...");
        CircomVerifier zkVerifier = new CircomVerifier();
        console.log("CircomVerifier deployed at:", address(zkVerifier));

        // Test deploy just PrivacyLayer  
        console.log("Deploying PrivacyLayer...");
        PrivacyLayer privacyLayer = new PrivacyLayer();
        console.log("PrivacyLayer deployed at:", address(privacyLayer));

        vm.stopBroadcast();
    }
}
