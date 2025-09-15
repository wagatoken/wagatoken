// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

// Core WAGA Contracts
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
import {WAGACoffeeViews} from "../src/WAGACoffeeViews.sol";
import {WAGABatchManager} from "../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../src/WAGAZKManager.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";

// Payment & Treasury Contracts
import {WAGATreasury} from "../src/WAGATreasury.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {WAGACDPIntegration} from "../src/WAGACDPIntegration.sol";

// Supporting Contracts
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../src/WAGAInventoryManagerMVP.sol";

// Verifiers
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {Groth16Verifier as PriceVerifier} from "../src/verifiers/PricePrivacyCircuitVerifier.sol";
import {Groth16Verifier as QualityVerifier} from "../src/verifiers/QualityTierCircuitVerifier.sol";
import {Groth16Verifier as SupplyChainVerifier} from "../src/verifiers/SupplyChainPrivacyCircuitVerifier.sol";

contract DeployRealZKMVP is Script {
    function run()
        external
        returns (
            WAGACoffeeTokenCore,
            WAGABatchManager,
            WAGAZKManager,
            PrivacyLayer,
            WAGATreasury,
            WAGACoffeeRedemption,
            WAGACDPIntegration,
            WAGAProofOfReserve,
            WAGAInventoryManagerMVP,
            CircomVerifier,
            PriceVerifier,
            QualityVerifier,
            SupplyChainVerifier,
            HelperConfig
        )
    {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();

        vm.startBroadcast(networkConfig.deployerKey);

        console.log("Starting WAGA MVP Deployment with Coinbase Payment Integration...");

        // 1. Deploy ZK Verifiers
        console.log("Deploying ZK Verifiers...");
        PriceVerifier priceVerifier = new PriceVerifier();
        QualityVerifier qualityVerifier = new QualityVerifier();
        SupplyChainVerifier supplyChainVerifier = new SupplyChainVerifier();
        CircomVerifier circomVerifier = new CircomVerifier();

        // 2. Deploy WAGACoffeeTokenCore (baseURI will be updated later)
        console.log("Deploying Core Coffee Token...");
        WAGACoffeeTokenCore coffeeToken = new WAGACoffeeTokenCore("");

        // 2b. Deploy WAGACoffeeViews for view functions
        console.log("Deploying Coffee Views...");
        WAGACoffeeViews coffeeViews = new WAGACoffeeViews(address(coffeeToken));
        console.log("Coffee Views:", address(coffeeViews));

        // 3. Deploy Privacy Layer
        console.log("Deploying Privacy Layer...");
        PrivacyLayer privacyLayer = new PrivacyLayer(address(coffeeToken));

        // 4. Deploy Treasury with network-specific USDC
        console.log("Deploying Treasury for USDC payments...");
        WAGATreasury treasury = new WAGATreasury(networkConfig.usdcAddress);

        // 5. Deploy Batch Manager
        console.log("Deploying Batch Manager...");
        WAGABatchManager batchManager = new WAGABatchManager(
            address(coffeeToken),
            address(privacyLayer)
        );

        // 6. Deploy ZK Manager
        console.log("Deploying ZK Manager...");
        WAGAZKManager zkManager = new WAGAZKManager(
            address(coffeeToken),
            address(circomVerifier)
        );

        // 7. Connect managers to token
        console.log("Connecting managers to token...");
        coffeeToken.setManagerAddresses(address(batchManager), address(zkManager));

        // 8. Deploy Redemption with treasury integration
        console.log("Deploying Redemption with treasury integration...");
        WAGACoffeeRedemption redemption = new WAGACoffeeRedemption(
            address(coffeeToken),
            address(treasury)
        );

        // 9. Deploy CDP Integration
        console.log("Deploying CDP Integration...");
        WAGACDPIntegration cdpIntegration = new WAGACDPIntegration(
            networkConfig.usdcAddress,
            networkConfig.cdpSmartAccountFactory,
            networkConfig.cdpPaymaster
        );

        // 10. Deploy Proof of Reserve
        console.log("Deploying Proof of Reserve...");
        WAGAProofOfReserve proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            address(batchManager),
            networkConfig.router,
            networkConfig.subscriptionId,
            networkConfig.donId
        );

        // 11. Deploy Inventory Manager
        console.log("Deploying Inventory Manager...");
        WAGAInventoryManagerMVP inventoryManager = new WAGAInventoryManagerMVP(
            address(coffeeToken),
            address(batchManager),
            address(proofOfReserve)
        );

        // 11. Grant roles
        console.log("Setting up roles and permissions...");
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(circomVerifier));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(zkManager));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(proofOfReserve));
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), address(coffeeToken)); // Coffee token needs to call batch manager
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.MINTER_ROLE(), address(proofOfReserve));
        coffeeToken.grantRole(coffeeToken.REDEMPTION_ROLE(), address(redemption));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(batchManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(zkManager));
        
        // Grant ADMIN_ROLE to deployer for role management
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), msg.sender);
        
        // Grant INVENTORY_MANAGER_ROLE to InventoryManager for inventory verification
        coffeeToken.grantRole(coffeeToken.INVENTORY_MANAGER_ROLE(), address(inventoryManager));
        
        // Grant deployer ability to manage cooperative and roaster roles
        // This allows the deployer to grant COOPERATIVE_ROLE and ROASTER_ROLE to actual stakeholders later
        console.log("Granting role management permissions to deployer...");
        // Note: ADMIN_ROLE already has permission to grant other roles
        
        // Grant VERIFIER_ROLE to ZK Manager on CircomVerifier so it can call verification functions
        circomVerifier.grantRole(circomVerifier.VERIFIER_ROLE(), address(zkManager));

        // Grant treasury admin role
        treasury.grantRole(treasury.ADMIN_ROLE(), msg.sender);
        treasury.grantRole(treasury.PAYMENT_PROCESSOR_ROLE(), msg.sender);

        // Grant CDP integration admin role
        cdpIntegration.grantRole(cdpIntegration.CDP_ADMIN_ROLE(), msg.sender);
        cdpIntegration.grantRole(cdpIntegration.PAYMENT_HANDLER_ROLE(), msg.sender);

        // Note: WAGAZKManager roles are managed through the coffee token
        console.log("Note: ZK Manager roles managed via coffee token");

        vm.stopBroadcast();

        console.log("Deployment Complete!");
        console.log("Coffee Token:", address(coffeeToken));
        console.log("Treasury:", address(treasury));
        console.log("Redemption:", address(redemption));
        console.log("CDP Integration:", address(cdpIntegration));
        console.log("");
        console.log("IMPORTANT: After deployment, grant COOPERATIVE_ROLE and ROASTER_ROLE");
        console.log("to actual stakeholders using the coffee token's grantRole function.");
        console.log("All stakeholders with these roles can create batches.");

        return (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemption,
            cdpIntegration,
            proofOfReserve,
            inventoryManager,
            circomVerifier,
            priceVerifier,
            qualityVerifier,
            supplyChainVerifier,
            helperConfig
        );
    }
}


/**

== Return ==
0: contract WAGACoffeeTokenCore 0x440146a5B87f28ab901D6268139181e07fb36e05
1: contract WAGABatchManager 0xa215A65CD9565d1c1336a8cB0DF3B9994f4f471F
2: contract WAGAZKManager 0x79f476822073d0B4075b980D21c3fC0977410e70
3: contract PrivacyLayer 0xf5259f49433d4dC6CFF2cAB77Cea707aF554f540
4: contract WAGATreasury 0x75E2C46DF97cC53e8A31a1A564B987790D685177
5: contract WAGACoffeeRedemption 0xb886AD129f764cDbD128f6B96d9345334842AA6d
6: contract WAGACDPIntegration 0x3C5d7c7472144523917c817d199e875d18fBAaBA
7: contract WAGAProofOfReserve 0xE794464994fC1084346C1643354Bbf7d8e3c0Ad3
8: contract WAGAInventoryManagerMVP 0x8A72F2d8Def334B0E99A3522126662bDf4Dd3AE1
9: contract CircomVerifier 0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776
10: contract Groth16Verifier 0x0c8431117460D5bA4c981861bfc7DE9FCcF8F632
11: contract Groth16Verifier 0x9b9692C019CC2E104F9E7189ccfdDAab6c7368b1
12: contract Groth16Verifier 0xD21a65E672Ad2BD4760A03EC23913Cfa61192811
13: contract HelperConfig 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141

 */