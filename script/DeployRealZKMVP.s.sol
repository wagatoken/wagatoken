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
// WAGAAccessControl removed - functionality moved to WAGAConfigManager

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
import {EUDRDeforestationCircuitVerifier} from "../src/verifiers/EUDRDeforestationCircuitVerifier.sol";
import {EUDRGeolocationCircuitVerifier} from "../src/verifiers/EUDRGeolocationCircuitVerifier.sol";
import {EthiopianComplianceCircuitVerifier} from "../src/verifiers/EthiopianComplianceCircuitVerifier.sol";

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
    EUDRDeforestationCircuitVerifier public eudrDeforestationVerifier;
    EUDRGeolocationCircuitVerifier public eudrGeolocationVerifier;
    EthiopianComplianceCircuitVerifier public ethiopianComplianceVerifier;
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
        eudrDeforestationVerifier = new EUDRDeforestationCircuitVerifier();
        eudrGeolocationVerifier = new EUDRGeolocationCircuitVerifier();
        ethiopianComplianceVerifier = new EthiopianComplianceCircuitVerifier();
        circomVerifier = new CircomVerifier();

        // 2. Deploy WAGACoffeeTokenCore (baseURI will be updated later)
        console.log("Deploying Core Coffee Token...");
        coffeeToken = new WAGACoffeeTokenCore("");

        // 2b. [CoffeeViews deployment moved after BatchManager]

        // 3. Deploy Privacy Layer (with placeholder ZK Manager)
        console.log("Deploying Privacy Layer...");
        privacyLayer = new PrivacyLayer(address(coffeeToken), address(0));

        // 4. Deploy Treasury with network-specific USDC
        console.log("Deploying Treasury for USDC payments...");
        treasury = new WAGATreasury(networkConfig.usdcAddress);

        // 4b. Deploy Ethiopian Compliance System
        console.log("Deploying Ethiopian Compliance System...");
        ethiopianCompliance = new WAGAEthiopianCompliance();

        // Note: Access Control functionality moved to WAGAConfigManager (inherited by WAGACoffeeTokenCore)

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

        // 6a. Update Privacy Layer with actual ZK Manager
        console.log("Updating Privacy Layer with ZK Manager...");
        privacyLayer.setZKManager(address(zkManager));

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
        
        // Note: Ethiopian compliance now uses coffeeToken for access control

        // 8. Deploy Redemption with treasury and Ethiopian compliance integration
        console.log("Deploying Redemption with treasury and Ethiopian compliance integration...");
        redemptionManager = new WAGACoffeeRedemption(
            address(coffeeToken),
            address(treasury),
            address(ethiopianCompliance),
            address(batchManager),
            address(zkManager)
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

        // 12. Link contracts with setCoffeeToken (CRITICAL SECURITY)
        console.log("Linking contracts to coffee token for access control...");
        ethiopianCompliance.setCoffeeToken(address(coffeeToken));
        cdpIntegration.setCoffeeToken(address(coffeeToken));
        ecxOracle.setCoffeeToken(address(coffeeToken));
        circomVerifier.setCoffeeToken(address(coffeeToken));
        treasury.setCoffeeToken(address(coffeeToken));
        
        // Link PrivacyLayer to BatchManager for batch creator verification
        privacyLayer.setBatchManager(address(batchManager));
        
        // 13. Setup unified access control via ConfigManager (inherited by CoffeeToken)
        console.log("Setting up unified access control system...");
        
        // Grant system contract roles via ConfigManager functions
        coffeeToken.setProofOfReserveManager(address(proofOfReserve));  // Grants MINTER_ROLE + PROOF_OF_RESERVE_ROLE
        coffeeToken.setRedemptionManager(address(redemptionManager));   // Grants REDEMPTION_ROLE
        coffeeToken.setInventoryManager(address(inventoryManager));     // Grants INVENTORY_MANAGER_ROLE
        
        // Grant individual roles using new ConfigManager functions
        coffeeToken.grantVerifierRole(address(circomVerifier));
        coffeeToken.grantVerifierRole(address(zkManager));
        coffeeToken.grantZKVerifierRole(address(zkManager));
        coffeeToken.grantProcessorRole(msg.sender);  // Deployer can create batches
        coffeeToken.grantDistributorRole(msg.sender);
        
        // Grant payment system roles
        coffeeToken.grantPaymentProcessorRole(address(treasury));
        coffeeToken.grantPaymentHandlerRole(address(cdpIntegration));
        coffeeToken.grantOfframpExecutorRole(msg.sender);  // Deployer for testing
        
        // Grant compliance roles  
        coffeeToken.grantComplianceManagerRole(msg.sender);  // Deployer for setup
        coffeeToken.grantOriginVerifierRole(msg.sender);     // Deployer for testing
        coffeeToken.grantQualityInspectorRole(msg.sender);   // Deployer for testing
        
        // Grant price oracle roles
        coffeeToken.grantPriceUpdaterRole(msg.sender);       // Deployer for testing
        coffeeToken.grantPricingViewerRole(msg.sender);

        console.log("Unified access control setup completed!");
        console.log("All roles are now managed centrally via WAGAConfigManager (inherited by CoffeeToken)");
        
        // Grant additional system roles
        coffeeToken.grantComplianceManagerRole(address(redemptionManager));  // Redemption can manage compliance

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
        console.log("=== UNIFIED ACCESS CONTROL SYSTEM DEPLOYED ===");
        console.log("");
        console.log("ROLE MANAGEMENT:");
        console.log("All roles managed via: coffeeToken.grantXXXRole(address)");
        console.log("- coffeeToken.grantCooperativeRole(address) - Coffee cooperatives");
        console.log("- coffeeToken.grantProcessorRole(address) - Coffee processors");
        console.log("- coffeeToken.grantRoasterRole(address) - Coffee roasters");
        console.log("- coffeeToken.grantBankingPartnerRole(address) - Ethiopian banks");
        console.log("");
        console.log("BUSINESS OPERATIONS:");
        console.log("1. Register sellers: coffeeToken.registerSeller(address, type, name, registration, swift)");
        console.log("2. Grant banking roles: coffeeToken.grantBankingPartnerRole(bankAddress)");
        console.log("3. Update ECX prices: ecxOracle.updateECXPrice() [requires PRICE_UPDATER_ROLE]");
        console.log("4. Manage compliance: ethiopianCompliance functions [require COMPLIANCE_MANAGER_ROLE]");
        console.log("");
        console.log("SYSTEM STATUS:");
        console.log("- Unified access control active");
        console.log("- All contracts linked to coffee token");
        console.log("- Payment systems integrated");
        console.log("- Ethiopian compliance ready");
        console.log("- Price oracle configured");

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

    function getEUDRDeforestationVerifier() external view returns (EUDRDeforestationCircuitVerifier) {
        return eudrDeforestationVerifier;
    }

    function getEUDRGeolocationVerifier() external view returns (EUDRGeolocationCircuitVerifier) {
        return eudrGeolocationVerifier;
    }

    function getEthiopianComplianceVerifier() external view returns (EthiopianComplianceCircuitVerifier) {
        return ethiopianComplianceVerifier;
    }

    function getCoffeeViews() external view returns (WAGACoffeeViews) {
        return coffeeViews;
    }

    function getEthiopianCompliance() external view returns (WAGAEthiopianCompliance) {
        return ethiopianCompliance;
    }
}
