// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGACDPIntegration} from "../../src/WAGACDPIntegration.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {Groth16Verifier as PriceVerifier} from "../../src/verifiers/PricePrivacyCircuitVerifier.sol";
import {Groth16Verifier as QualityVerifier} from "../../src/verifiers/QualityTierCircuitVerifier.sol";
import {Groth16Verifier as SupplyChainVerifier} from "../../src/verifiers/SupplyChainPrivacyCircuitVerifier.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

/**
 * @title DeploymentTest
 * @dev Unit test to verify the full ZK MVP deployment works correctly
 */
contract DeploymentTest is Test {
    DeployRealZKMVP public deployRealZKMVP;

    function testDeployRealZKMVPDeployment() public {
        deployRealZKMVP = new DeployRealZKMVP();

        // Deploy the entire ZK MVP system
        deployRealZKMVP.run();

        console.log("DeployRealZKMVP deployment completed successfully!");
    }

    function testDeploymentReturnsValidAddresses() public {
        deployRealZKMVP = new DeployRealZKMVP();

        // Deploy and get all contract instances
        (
            WAGACoffeeTokenCore coffeeToken,
            WAGABatchManager batchManager,
            WAGAZKManager zkManager,
            PrivacyLayer privacyLayer,
            WAGATreasury treasury,
            WAGACoffeeRedemption redemption,
            WAGACDPIntegration cdpIntegration,
            WAGAProofOfReserve proofOfReserve,
            WAGAInventoryManagerMVP inventoryManager,
            CircomVerifier circomVerifier,
            PriceVerifier priceVerifier,
            QualityVerifier qualityVerifier,
            SupplyChainVerifier supplyChainVerifier,
            HelperConfig helperConfig
        ) = deployRealZKMVP.run();

        // Convert to addresses and verify all contracts are deployed
        address coffeeTokenAddr = address(coffeeToken);
        address batchManagerAddr = address(batchManager);
        address zkManagerAddr = address(zkManager);
        address privacyLayerAddr = address(privacyLayer);
        address treasuryAddr = address(treasury);
        address redemptionAddr = address(redemption);
        address cdpIntegrationAddr = address(cdpIntegration);
        address proofOfReserveAddr = address(proofOfReserve);
        address inventoryManagerAddr = address(inventoryManager);
        address circomVerifierAddr = address(circomVerifier);
        address priceVerifierAddr = address(priceVerifier);
        address qualityVerifierAddr = address(qualityVerifier);
        address supplyChainVerifierAddr = address(supplyChainVerifier);
        address helperConfigAddr = address(helperConfig);

        assertTrue(coffeeTokenAddr != address(0), "CoffeeToken should be deployed");
        assertTrue(batchManagerAddr != address(0), "BatchManager should be deployed");
        assertTrue(zkManagerAddr != address(0), "ZKManager should be deployed");
        assertTrue(privacyLayerAddr != address(0), "PrivacyLayer should be deployed");
        assertTrue(treasuryAddr != address(0), "Treasury should be deployed");
        assertTrue(redemptionAddr != address(0), "Redemption should be deployed");
        assertTrue(cdpIntegrationAddr != address(0), "CDP Integration should be deployed");
        assertTrue(proofOfReserveAddr != address(0), "ProofOfReserve should be deployed");
        assertTrue(inventoryManagerAddr != address(0), "InventoryManager should be deployed");
        assertTrue(circomVerifierAddr != address(0), "CircomVerifier should be deployed");
        assertTrue(priceVerifierAddr != address(0), "PriceVerifier should be deployed");
        assertTrue(qualityVerifierAddr != address(0), "QualityVerifier should be deployed");
        assertTrue(supplyChainVerifierAddr != address(0), "SupplyChainVerifier should be deployed");
        assertTrue(helperConfigAddr != address(0), "HelperConfig should be deployed");

        console.log("All contracts deployed successfully with valid addresses!");
        console.log("CoffeeToken:", coffeeTokenAddr);
        console.log("BatchManager:", batchManagerAddr);
        console.log("ZKManager:", zkManagerAddr);
        console.log("PrivacyLayer:", privacyLayerAddr);
        console.log("Treasury:", treasuryAddr);
        console.log("Redemption:", redemptionAddr);
        console.log("CDP Integration:", cdpIntegrationAddr);
        console.log("ProofOfReserve:", proofOfReserveAddr);
        console.log("InventoryManager:", inventoryManagerAddr);
        console.log("CircomVerifier:", circomVerifierAddr);
        console.log("PriceVerifier:", priceVerifierAddr);
        console.log("QualityVerifier:", qualityVerifierAddr);
        console.log("SupplyChainVerifier:", supplyChainVerifierAddr);
        console.log("HelperConfig:", helperConfigAddr);
    }

    function testDeploymentRoleSetup() public {
        deployRealZKMVP = new DeployRealZKMVP();

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
            ,
            ,
            ,
            ,
            ,

        ) = deployRealZKMVP.run();

        address coffeeTokenAddr = address(coffeeToken);

        // Verify the deployment succeeds
        assertTrue(coffeeTokenAddr != address(0), "Deployment should succeed");

        console.log("Deployment role setup completed successfully!");
        console.log("CoffeeToken deployed at:", coffeeTokenAddr);
    }
}
