// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

// Core WAGA Contracts
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
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
        (
            address usdcAddress,
            address router,
            uint256 deployerKey
        ) = helperConfig.activeNetworkConfig();

        vm.startBroadcast(deployerKey);

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

        // 3. Deploy Privacy Layer
        console.log("Deploying Privacy Layer...");
        PrivacyLayer privacyLayer = new PrivacyLayer(address(coffeeToken));

        // 4. Deploy Treasury with network-specific USDC
        console.log("Deploying Treasury for USDC payments...");
        WAGATreasury treasury = new WAGATreasury(usdcAddress);

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
            address(priceVerifier)
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
            usdcAddress,
            helperConfig.getActiveNetworkConfig().cdpSmartAccountFactory,
            helperConfig.getActiveNetworkConfig().cdpPaymaster
        );

        // 10. Deploy Proof of Reserve
        console.log("Deploying Proof of Reserve...");
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
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
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.MINTER_ROLE(), address(proofOfReserve));
        coffeeToken.grantRole(coffeeToken.REDEMPTION_ROLE(), address(redemption));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(batchManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(zkManager));

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
