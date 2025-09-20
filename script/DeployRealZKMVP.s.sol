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
import {WAGAEthiopianCompliance} from "../src/WAGAEthiopianCompliance.sol";
import {WAGAECXPriceOracle} from "../src/WAGAECXPriceOracle.sol";

// Supporting Contracts
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../src/WAGAInventoryManagerMVP.sol";

// Verifiers
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {Groth16Verifier as PriceVerifier} from "../src/verifiers/PricePrivacyCircuitVerifier.sol";
import {Groth16Verifier as QualityVerifier} from "../src/verifiers/QualityTierCircuitVerifier.sol";
import {Groth16Verifier as SupplyChainVerifier} from "../src/verifiers/SupplyChainPrivacyCircuitVerifier.sol";

contract DeployRealZKMVP is Script {
    // Public state variables for testing access
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    PrivacyLayer public privacyLayer;
    WAGATreasury public treasury;
    WAGACoffeeRedemption public redemptionManager;
    WAGACDPIntegration public cdpIntegration;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGAEthiopianCompliance public ethiopianCompliance;
    WAGAECXPriceOracle public ecxOracle;
    CircomVerifier public circomVerifier;
    WAGACoffeeViews public coffeeViews;
    PriceVerifier public priceVerifier;
    QualityVerifier public qualityVerifier;
    SupplyChainVerifier public supplyChainVerifier;
    HelperConfig public helperConfig;

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
            WAGAEthiopianCompliance,
            WAGAECXPriceOracle,
            CircomVerifier,
            HelperConfig
        )
    {
        return _deploy(true);
    }

    function runForTesting()
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
            WAGAEthiopianCompliance,
            WAGAECXPriceOracle,
            CircomVerifier,
            HelperConfig
        )
    {
        return _deploy(false);
    }

    function _deploy(bool useBroadcast)
        internal
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
            WAGAEthiopianCompliance,
            WAGAECXPriceOracle,
            CircomVerifier,
            HelperConfig
        )
    {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();

        if (useBroadcast) {
            vm.startBroadcast(networkConfig.deployerKey);
        }

        console.log("Starting WAGA MVP Deployment with Coinbase Payment Integration...");

        // 1. Deploy ZK Verifiers
        console.log("Deploying ZK Verifiers...");
        priceVerifier = new PriceVerifier();
        qualityVerifier = new QualityVerifier();
        supplyChainVerifier = new SupplyChainVerifier();
        circomVerifier = new CircomVerifier();

        // 2. Deploy WAGACoffeeTokenCore (baseURI will be updated later)
        console.log("Deploying Core Coffee Token...");
        coffeeToken = new WAGACoffeeTokenCore("");

        // 2b. [CoffeeViews deployment moved after BatchManager]

        // 3. Deploy Privacy Layer
        console.log("Deploying Privacy Layer...");
        privacyLayer = new PrivacyLayer(address(coffeeToken));

        // 4. Deploy Treasury with network-specific USDC
        console.log("Deploying Treasury for USDC payments...");
        treasury = new WAGATreasury(networkConfig.usdcAddress);

        // 4b. Deploy Ethiopian Compliance System
        console.log("Deploying Ethiopian Compliance System...");
        ethiopianCompliance = new WAGAEthiopianCompliance();

        // 4c. Deploy ECX Price Oracle
        console.log("Deploying ECX Price Oracle...");
        ecxOracle = new WAGAECXPriceOracle();

        // 5. Deploy Batch Manager
        console.log("Deploying Batch Manager...");
        batchManager = new WAGABatchManager(
            address(coffeeToken),
            address(privacyLayer)
        );

        // 6. Deploy ZK Manager
        console.log("Deploying ZK Manager...");
        zkManager = new WAGAZKManager(
            address(coffeeToken),
            address(circomVerifier)
        );

        // 6b. Deploy WAGACoffeeViews for view functions (after BatchManager)
        console.log("Deploying Coffee Views...");
        WAGACoffeeViews deployedCoffeeViews = new WAGACoffeeViews(address(coffeeToken), address(batchManager));
        console.log("Coffee Views:", address(deployedCoffeeViews));
        coffeeViews = deployedCoffeeViews;

        // 7. Connect managers to token
        console.log("Connecting managers to token...");
        coffeeToken.setManagerAddresses(address(batchManager), address(zkManager));

        // 7b. Connect Ethiopian compliance to managers
        console.log("Integrating Ethiopian compliance with ZK framework...");
        batchManager.setEthiopianCompliance(address(ethiopianCompliance));
        zkManager.setEthiopianCompliance(address(ethiopianCompliance));

        // 8. Deploy Redemption with treasury and Ethiopian compliance integration
        console.log("Deploying Redemption with treasury and Ethiopian compliance integration...");
        redemptionManager = new WAGACoffeeRedemption(
            address(coffeeToken),
            address(treasury),
            address(ethiopianCompliance),
            address(batchManager)
        );

        // 9. Deploy CDP Integration
        console.log("Deploying CDP Integration...");
        cdpIntegration = new WAGACDPIntegration(
            networkConfig.usdcAddress,
            networkConfig.cdpSmartAccountFactory,
            networkConfig.cdpPaymaster
        );

        // 10. Deploy Proof of Reserve
        console.log("Deploying Proof of Reserve...");
        proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            address(batchManager),
            networkConfig.router,
            networkConfig.subscriptionId,
            networkConfig.donId
        );

        // 11. Deploy Inventory Manager
        console.log("Deploying Inventory Manager...");
        inventoryManager = new WAGAInventoryManagerMVP(
            address(coffeeToken),
            address(batchManager),
            address(proofOfReserve)
        );

        // 12. Grant roles
        console.log("Setting up roles and permissions...");
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(circomVerifier));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(zkManager));
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(proofOfReserve));
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), address(coffeeToken)); // Coffee token needs to call batch manager
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), msg.sender);
        coffeeToken.grantRole(coffeeToken.PROOF_OF_RESERVE_ROLE(), address(proofOfReserve)); // For batch verification
        coffeeToken.grantRole(coffeeToken.MINTER_ROLE(), address(proofOfReserve));
        coffeeToken.grantRole(coffeeToken.REDEMPTION_ROLE(), address(redemptionManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(batchManager));
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(zkManager));
        
        // Grant ADMIN_ROLE to deployer for role management
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), msg.sender);
        
        // Grant deployer ability to manage cooperative and roaster roles
        console.log("Granting role management permissions to deployer...");
        
        console.log("Deployment completed successfully!");
        console.log("Note: For tests, roles should be granted using the actual DEFAULT_ADMIN_ROLE holders from each contract");
        
        // Grant redemption contract permission to register BoE trades
        ethiopianCompliance.grantRole(ethiopianCompliance.COMPLIANCE_MANAGER_ROLE(), address(redemptionManager));

        // Setup ECX Price Oracle roles
        console.log("Setting up ECX Price Oracle roles...");
        ecxOracle.grantRole(ecxOracle.PRICE_UPDATER_ROLE(), msg.sender);
        ecxOracle.grantRole(ecxOracle.ZK_VERIFIER_ROLE(), address(zkManager));
        ecxOracle.grantRole(ecxOracle.PRICING_VIEWER_ROLE(), msg.sender);

        console.log("Note: ZK Manager roles managed via coffee token");

        if (useBroadcast) {
            vm.stopBroadcast();
        }

        console.log("Deployment Complete!");
        console.log("Coffee Token:", address(coffeeToken));
        console.log("Treasury:", address(treasury));
        console.log("Redemption:", address(redemptionManager));
        console.log("Ethiopian Compliance:", address(ethiopianCompliance));
        console.log("ECX Price Oracle:", address(ecxOracle));
        console.log("CDP Integration:", address(cdpIntegration));
        console.log("");
        console.log("IMPORTANT: After deployment, grant COOPERATIVE_ROLE and ROASTER_ROLE");
        console.log("to actual stakeholders using the coffee token's grantRole function.");
        console.log("All stakeholders with these roles can create batches.");
        console.log("");
        console.log("Ethiopian Compliance Setup:");
        console.log("1. Add banking partners using addBankingPartner()");
        console.log("2. Grant compliance roles to Ethiopian regulators");
        console.log("3. Configure ECTA permits, quality certificates, and origin verification");
        console.log("");
        console.log("ECX Price Oracle Setup:");
        console.log("1. Update ECX prices using updateECXPrice()");
        console.log("2. Configure exchange rates with updateExchangeRate()");
        console.log("3. Add ZK price proofs using addZKPriceProof()");

        return (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemptionManager,
            cdpIntegration,
            proofOfReserve,
            inventoryManager,
            ethiopianCompliance,
            ecxOracle,
            circomVerifier,
            helperConfig
        );
    }

    // Getter functions for the additional verifiers to work around stack too deep
    function getPriceVerifier() external view returns (PriceVerifier) {
        return priceVerifier;
    }

    function getQualityVerifier() external view returns (QualityVerifier) {
        return qualityVerifier;
    }

    function getSupplyChainVerifier() external view returns (SupplyChainVerifier) {
        return supplyChainVerifier;
    }

    function getCoffeeViews() external view returns (WAGACoffeeViews) {
        return coffeeViews;
    }
}
