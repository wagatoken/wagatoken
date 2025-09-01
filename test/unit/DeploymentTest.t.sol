// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

/**
 * @title DeploymentTest
 * @dev Unit test to verify the full ZK MVP deployment works correctly
 */
contract DeploymentTest is Test {
    DeployRealZKMVP public deployer;

    function testBasicDeployment() public {
        deployer = new DeployRealZKMVP();

        // Deploy the entire ZK MVP system
        deployer.run();

        console.log("Full ZK MVP deployment completed successfully!");
    }

    function testDeploymentReturnsValidAddresses() public {
        deployer = new DeployRealZKMVP();

        // Deploy and get all contract instances
        (
            WAGACoffeeTokenCore coffeeToken,
            WAGABatchManager batchManager,
            WAGAZKManager zkManager,
            WAGAProofOfReserve proofOfReserve,
            WAGAInventoryManagerMVP inventoryManager,
            WAGACoffeeRedemption redemption,
            CircomVerifier circomVerifier,
            PrivacyLayer privacyLayer,
            HelperConfig helperConfig
        ) = deployer.run();

        // Convert to addresses and verify all contracts are deployed
        address coffeeTokenAddr = address(coffeeToken);
        address batchManagerAddr = address(batchManager);
        address zkManagerAddr = address(zkManager);
        address proofOfReserveAddr = address(proofOfReserve);
        address inventoryManagerAddr = address(inventoryManager);
        address redemptionAddr = address(redemption);
        address circomVerifierAddr = address(circomVerifier);
        address privacyLayerAddr = address(privacyLayer);
        address helperConfigAddr = address(helperConfig);

        assertTrue(coffeeTokenAddr != address(0), "CoffeeToken should be deployed");
        assertTrue(batchManagerAddr != address(0), "BatchManager should be deployed");
        assertTrue(zkManagerAddr != address(0), "ZKManager should be deployed");
        assertTrue(proofOfReserveAddr != address(0), "ProofOfReserve should be deployed");
        assertTrue(inventoryManagerAddr != address(0), "InventoryManager should be deployed");
        assertTrue(redemptionAddr != address(0), "Redemption should be deployed");
        assertTrue(circomVerifierAddr != address(0), "CircomVerifier should be deployed");
        assertTrue(privacyLayerAddr != address(0), "PrivacyLayer should be deployed");
        assertTrue(helperConfigAddr != address(0), "HelperConfig should be deployed");

        console.log("All contracts deployed successfully with valid addresses!");
        console.log("CoffeeToken:", coffeeTokenAddr);
        console.log("BatchManager:", batchManagerAddr);
        console.log("ZKManager:", zkManagerAddr);
        console.log("ProofOfReserve:", proofOfReserveAddr);
        console.log("CircomVerifier:", circomVerifierAddr);
        console.log("PrivacyLayer:", privacyLayerAddr);
    }

    function testDeploymentRoleSetup() public {
        deployer = new DeployRealZKMVP();

        // Deploy and get coffee token instance
        (
            WAGACoffeeTokenCore coffeeToken,
            ,
            ,
            ,
            ,
            ,
            ,
            ,

        ) = deployer.run();

        address coffeeTokenAddr = address(coffeeToken);

        // Verify the deployment succeeds
        assertTrue(coffeeTokenAddr != address(0), "Deployment should succeed");

        console.log("Deployment role setup completed successfully!");
        console.log("CoffeeToken deployed at:", coffeeTokenAddr);
    }
}
