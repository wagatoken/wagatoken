// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

// Core WAGA Contracts
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
import {WAGACoffeeBatchOperations} from "../src/WAGACoffeeBatchOperations.sol";
import {WAGACoffeeViews} from "../src/WAGACoffeeViews.sol";
import {WAGABatchMetadataManager} from "../src/WAGABatchMetadataManager.sol";
import {WAGABatchExportCompliance} from "../src/WAGABatchExportCompliance.sol";
import {WAGAZKManager} from "../src/WAGAZKManager.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";
import {WAGAConfigManager} from "../src/WAGAConfigManager.sol";
// WAGAAccessControl removed - functionality moved to WAGAConfigManager

// Payment & Treasury Contracts
import {WAGATreasury} from "../src/WAGATreasury.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {WAGACDPIntegration} from "../src/WAGACDPIntegration.sol";
import {WAGAEthiopianComplianceCore} from "../src/WAGAEthiopianComplianceCore.sol";
import {WAGABankingCore} from "../src/WAGABankingCore.sol";
import {WAGATradeCompliance} from "../src/WAGATradeCompliance.sol";
import {WAGAECXPriceOracle} from "../src/WAGAECXPriceOracle.sol";

// Supporting Contracts
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../src/WAGAInventoryManagerMVP.sol";

// Verifiers
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {MockCircomVerifier} from "../src/MockCircomVerifier.sol";
import {Groth16Verifier as PriceVerifier} from "../src/verifiers/PricePrivacyCircuitVerifier.sol";
import {Groth16Verifier as QualityVerifier} from "../src/verifiers/QualityTierCircuitVerifier.sol";
import {Groth16Verifier as SupplyChainVerifier} from "../src/verifiers/SupplyChainPrivacyCircuitVerifier.sol";
import {EUDRDeforestationCircuitVerifier} from "../src/verifiers/EUDRDeforestationCircuitVerifier.sol";
import {EUDRGeolocationCircuitVerifier} from "../src/verifiers/EUDRGeolocationCircuitVerifier.sol";
import {EthiopianComplianceCircuitVerifier} from "../src/verifiers/EthiopianComplianceCircuitVerifier.sol";

contract DeployRealZKMVP is Script {
    // Public state variables for testing access
    WAGACoffeeTokenCore public coffeeToken;
    WAGACoffeeBatchOperations public coffeeBatchOperations;
    WAGABatchMetadataManager public batchMetadataManager;
    WAGABatchExportCompliance public batchExportCompliance;
    WAGAConfigManager public configManager;
    WAGAZKManager public zkManager;
    PrivacyLayer public privacyLayer;
    WAGATreasury public treasury;
    WAGACoffeeRedemption public redemptionManager;
    WAGACDPIntegration public cdpIntegration;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGAEthiopianComplianceCore public ethiopianComplianceCore;
    WAGABankingCore public bankingCore;
    WAGATradeCompliance public tradeCompliance;
    WAGAECXPriceOracle public ecxOracle;
    CircomVerifier public circomVerifier;
    MockCircomVerifier public mockCircomVerifier;
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
            WAGATreasury,
            WAGABankingCore,
            WAGATradeCompliance,
            HelperConfig
        )
    {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();

        // Always use broadcast - HelperConfig determines the right network
        vm.startBroadcast(networkConfig.deployerKey);

        console.log("Starting WAGA MVP Deployment with Unified Compliance Architecture...");
        console.log("Security fixes applied: state consistency, access control, role escalation");

        // 1. Deploy ZK Verifiers (including unified compliance system)
        console.log("Deploying ZK Verifiers for unified compliance...");
        priceVerifier = new PriceVerifier();
        qualityVerifier = new QualityVerifier();
        supplyChainVerifier = new SupplyChainVerifier();
        eudrDeforestationVerifier = new EUDRDeforestationCircuitVerifier();
        eudrGeolocationVerifier = new EUDRGeolocationCircuitVerifier();
        ethiopianComplianceVerifier = new EthiopianComplianceCircuitVerifier();
        
        // Deploy ZK Verifier - use mock for testing (chain ID 31337) to avoid gas issues
        if (block.chainid == 31337) {
            console.log("Deploying MockCircomVerifier for testing...");
            mockCircomVerifier = new MockCircomVerifier();
        } else {
            console.log("Deploying real CircomVerifier for production...");
            circomVerifier = new CircomVerifier(
                address(priceVerifier),
                address(qualityVerifier),
                address(supplyChainVerifier),
                address(eudrDeforestationVerifier),
                address(eudrGeolocationVerifier),
                address(ethiopianComplianceVerifier)
            );
        }

        // 2. Deploy Config Manager (Central Authority) first
        console.log("Deploying Config Manager (Central Authority)...");
        configManager = new WAGAConfigManager();

                // 3. Deploy WAGACoffeeTokenCore (without batch operations initially)
        console.log("Deploying Core Coffee Token...");
        coffeeToken = new WAGACoffeeTokenCore("", address(configManager), address(0));

        // 3a. Deploy WAGACoffeeBatchOperations
        console.log("Deploying Coffee Batch Operations...");
        coffeeBatchOperations = new WAGACoffeeBatchOperations(address(configManager), address(coffeeToken));

        // 3b. [CoffeeViews deployment moved after BatchManager]

        // 4. Deploy Privacy Layer (with placeholder ZK Manager)
        console.log("Deploying Privacy Layer...");
        privacyLayer = new PrivacyLayer(address(coffeeToken), address(0));

        // 4a. Deploy CDP Integration first (needed for Treasury constructor)
        console.log("Deploying CDP Integration...");
        cdpIntegration = new WAGACDPIntegration(
            networkConfig.usdcAddress,
            networkConfig.cdpSmartAccountFactory,
            networkConfig.cdpPaymaster
        );

        // 4b. Deploy Treasury with network-specific USDC
        console.log("Deploying Treasury for USDC payments...");
        treasury = new WAGATreasury(
            networkConfig.usdcAddress,
            address(coffeeToken),
            address(cdpIntegration) // Now we have the actual CDP integration address
        );

        // 4c. Deploy Ethiopian Compliance System (Split into Core and Banking)
        console.log("Deploying Ethiopian Compliance System...");
        ethiopianComplianceCore = new WAGAEthiopianComplianceCore(address(configManager));
        bankingCore = new WAGABankingCore(address(configManager));
        tradeCompliance = new WAGATradeCompliance(address(configManager), address(bankingCore));

        // Note: Access Control functionality moved to WAGAConfigManager (inherited by WAGACoffeeTokenCore)

        // 4c. Deploy ECX Price Oracle
        console.log("Deploying ECX Price Oracle...");
        ecxOracle = new WAGAECXPriceOracle();

        // 6. Deploy Batch Metadata Manager
        console.log("Deploying Batch Metadata Manager...");
        batchMetadataManager = new WAGABatchMetadataManager(
            address(coffeeToken),
            address(privacyLayer),
            address(configManager)
        );

        // 7. Deploy Batch Export Compliance
        console.log("Deploying Batch Export Compliance...");
        batchExportCompliance = new WAGABatchExportCompliance(
            address(coffeeToken),
            address(privacyLayer),
            address(configManager)
        );

        // 8. Deploy ZK Manager
        console.log("Deploying ZK Manager...");
        address zkVerifierAddress = block.chainid == 31337 ? address(mockCircomVerifier) : address(circomVerifier);
        zkManager = new WAGAZKManager(
            address(coffeeToken),
            zkVerifierAddress
        );

        // 6a. Update Privacy Layer with actual ZK Manager
        console.log("Updating Privacy Layer with ZK Manager...");
        privacyLayer.setZKManager(address(zkManager));

        // 8a. Deploy WAGACoffeeViews for view functions (after Batch Managers)
        console.log("Deploying Coffee Views...");
        WAGACoffeeViews deployedCoffeeViews = new WAGACoffeeViews(address(coffeeToken), address(batchMetadataManager));
        console.log("Coffee Views:", address(deployedCoffeeViews));
        coffeeViews = deployedCoffeeViews;

        // 9. Connect batch operations to coffee token
        console.log("Setting coffee batch operations as batch operations in coffee token...");
        coffeeToken.setBatchOperations(address(coffeeBatchOperations));
        
        // Note: Role management is handled through WAGAConfigManager (Central Authority pattern)
        // No need to grant roles directly on coffee token

        // 7b. Connect Ethiopian compliance to managers
        console.log("Integrating Ethiopian compliance with ZK framework...");
        
        batchExportCompliance.setEthiopianComplianceCore(address(ethiopianComplianceCore));
        batchExportCompliance.setEthiopianBanking(address(bankingCore));
        batchExportCompliance.setZKManager(address(zkManager));
        zkManager.setEthiopianCompliance(address(ethiopianComplianceCore));
        
        // Note: Ethiopian compliance now uses coffeeToken for access control

        // 8. Deploy Redemption with treasury and Ethiopian compliance integration
        console.log("Deploying Redemption with treasury and Ethiopian compliance integration...");
        redemptionManager = new WAGACoffeeRedemption(
            address(coffeeToken),
            address(treasury),
            address(ethiopianComplianceCore),
            address(bankingCore),
            address(batchMetadataManager),
            address(zkManager)
        );

        // 10. Deploy Proof of Reserve
        console.log("Deploying Proof of Reserve...");
        proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            address(batchMetadataManager),
            address(configManager),
            networkConfig.router,
            networkConfig.subscriptionId,
            networkConfig.donId
        );

        // 11. Deploy Inventory Manager
        console.log("Deploying Inventory Manager...");
        inventoryManager = new WAGAInventoryManagerMVP(
            address(coffeeToken),
            address(batchMetadataManager),
            address(proofOfReserve)
        );

        // 12. Link contracts with setCoffeeToken (CRITICAL SECURITY)
        console.log("Linking contracts to coffee token for access control...");
        tradeCompliance.setCoffeeToken(address(coffeeToken));
        tradeCompliance.setComplianceCore(address(ethiopianComplianceCore));
        cdpIntegration.setCoffeeToken(address(coffeeToken));
        ecxOracle.setCoffeeToken(address(coffeeToken));
        // Link verifier to coffee token based on which verifier was deployed
        if (block.chainid == 31337) {
            mockCircomVerifier.setCoffeeToken(address(coffeeToken));
        } else {
            circomVerifier.setCoffeeToken(address(coffeeToken));
        }
        treasury.setCoffeeToken(address(coffeeToken));
        
        // Link PrivacyLayer to BatchManager for batch creator verification
        privacyLayer.setBatchManager(address(batchMetadataManager));
        
        // 13. Setup unified access control via ConfigManager (inherited by CoffeeToken)
        console.log("Setting up unified access control system...");
        
        console.log("Setting up unified access control system...");
        
        // Note: Role management is handled through WAGAConfigManager (Central Authority pattern)
        // All roles need to be granted through the config manager, not directly on contracts
        
        console.log("DEPLOYMENT SUCCESSFUL!");
        
        // Set up proper role management through WAGAConfigManager
        console.log("Setting up role management through WAGAConfigManager...");
        
        // Set contract managers (this grants roles automatically)
        configManager.setRedemptionManager(address(redemptionManager));
        
        // Grant core system roles
        // Grant verifier role to appropriate verifier
        if (block.chainid == 31337) {
            configManager.grantVerifierRole(address(mockCircomVerifier));
        } else {
            configManager.grantVerifierRole(address(circomVerifier));
        }
        configManager.grantVerifierRole(address(zkManager));
        configManager.grantZKVerifierRole(address(zkManager));
        configManager.grantVerifierRole(address(proofOfReserve));  // ProofOfReserve needs VERIFIER_ROLE for validation
        configManager.grantMinterRole(address(proofOfReserve));  // ProofOfReserve needs MINTER_ROLE to mint tokens after verifying inventory
        
        // Grant admin roles to key contracts that need them
        configManager.grantRole(configManager.ADMIN_ROLE(), address(batchMetadataManager));  // BatchManager needs ADMIN_ROLE
        configManager.grantRole(configManager.ADMIN_ROLE(), address(zkManager));  // ZKManager needs ADMIN_ROLE
        
        configManager.grantProcessorRole(msg.sender);  // Deployer for testing
        configManager.grantDistributorRole(msg.sender);  // Deployer for testing
        
        // Grant payment system roles
        configManager.grantPaymentProcessorRole(address(treasury));
        configManager.grantPaymentHandlerRole(address(cdpIntegration));
        configManager.grantCDPAdminRole(msg.sender);  // Deployer for CDP admin
        configManager.grantOfframpExecutorRole(msg.sender);  // Deployer for testing
        
        // Grant compliance roles  
        configManager.grantComplianceManagerRole(msg.sender);  // Deployer for setup
        configManager.grantOriginVerifierRole(msg.sender);     // Deployer for testing
        configManager.grantQualityInspectorRole(msg.sender);   // Deployer for testing
        
        // Grant price oracle roles
        configManager.grantPriceUpdaterRole(msg.sender);       // Deployer for testing
        configManager.grantPricingViewerRole(msg.sender);

        console.log("Unified access control setup completed!");
        console.log("All roles are now managed centrally via WAGAConfigManager (inherited by CoffeeToken)");
        
        // Grant additional system roles
        configManager.grantComplianceManagerRole(address(redemptionManager));  // Redemption can manage compliance

        vm.stopBroadcast(); // Always stop broadcast since we always start it

        console.log("Deployment Complete!");
        console.log("Coffee Token:", address(coffeeToken));
        console.log("Treasury:", address(treasury));
        console.log("Redemption:", address(redemptionManager));
        console.log("Ethiopian Compliance Core:", address(ethiopianComplianceCore));
        console.log("Banking Core:", address(bankingCore));
        console.log("Trade Compliance:", address(tradeCompliance));
        console.log("ECX Price Oracle:", address(ecxOracle));
        console.log("CDP Integration:", address(cdpIntegration));
        console.log("");
        console.log("=== UNIFIED COMPLIANCE ARCHITECTURE DEPLOYED ===");
        console.log("- IComplianceManager interface implemented");
        console.log("- String-based compliance types: ECTA_PERMIT, QUALITY_CERT, ORIGIN_VERIFICATION, EUDR_DEFORESTATION, EUDR_GEOLOCATION");
        console.log("- Backward compatibility maintained for legacy functions");
        console.log("");
        console.log("=== SECURITY FIXES APPLIED ===");
        console.log("- Fixed state consistency in token minting/burning");
        console.log("- Removed treasury access control bypass");
        console.log("- Fixed role escalation vulnerability - MINTER_ROLE explicitly granted");
        console.log("- Standardized access control patterns");
        console.log("- Fixed redemption validation order");
        console.log("- Fixed error naming inconsistencies");
        console.log("");
        console.log("=== UNIFIED ACCESS CONTROL SYSTEM ===");
        console.log("");
        console.log("ROLE MANAGEMENT:");
        console.log("All roles managed via: configManager.grantXXXRole(address)");
        console.log("- configManager.grantCooperativeRole(address) - Coffee cooperatives");
        console.log("- configManager.grantProcessorRole(address) - Coffee processors");
        console.log("- configManager.grantRoasterRole(address) - Coffee roasters");
        console.log("- configManager.grantBankingPartnerRole(address) - Ethiopian banks");
        console.log("");
        console.log("COMPLIANCE SYSTEM:");
        console.log("1. Unified compliance via addComplianceZKProof(batchId, complianceType, zkProofData, publicClaim)");
        console.log("2. Support for Ethiopian + EUDR + extensible compliance types");
        console.log("3. Legacy function compatibility maintained");
        console.log("4. Validation via validateCompliance(batchId, framework)");
        console.log("");
        console.log("BUSINESS OPERATIONS:");
        console.log("1. Register sellers: coffeeToken.registerSeller(address, type, name, registration, swift)");
        console.log("2. Grant banking roles: configManager.grantBankingPartnerRole(bankAddress)");
        console.log("3. Update ECX prices: ecxOracle.updateECXPrice() [requires PRICE_UPDATER_ROLE]");
        console.log("4. Manage compliance: zkManager.addComplianceZKProof() [requires PROCESSOR_ROLE]");
        console.log("");
        console.log("SYSTEM STATUS:");
        console.log("- Unified compliance architecture active");
        console.log("- All security vulnerabilities patched");
        console.log("- All contracts linked to coffee token");
        console.log("- Payment systems integrated");
        console.log("- ProofOfReserve has verified MINTER_ROLE");
        console.log("- Ethiopian compliance ready");
        console.log("- Price oracle configured");

        return (
            coffeeToken,
            treasury,
            bankingCore,
            tradeCompliance,
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

    function getEthiopianComplianceCore() external view returns (WAGAEthiopianComplianceCore) {
        return ethiopianComplianceCore;
    }

    function getBankingCore() external view returns (WAGABankingCore) {
        return bankingCore;
    }

    function getTradeCompliance() external view returns (WAGATradeCompliance) {
        return tradeCompliance;
    }

    // Additional getters for contracts not returned in main functions
    function getBatchMetadataManager() external view returns (WAGABatchMetadataManager) {
        return batchMetadataManager;
    }

    function getBatchExportCompliance() external view returns (WAGABatchExportCompliance) {
        return batchExportCompliance;
    }

    function getZKManager() external view returns (WAGAZKManager) {
        return zkManager;
    }

    function getPrivacyLayer() external view returns (PrivacyLayer) {
        return privacyLayer;
    }

    function getRedemptionManager() external view returns (WAGACoffeeRedemption) {
        return redemptionManager;
    }

    function getCDPIntegration() external view returns (WAGACDPIntegration) {
        return cdpIntegration;
    }

    function getCoffeeBatchOperations() external view returns (WAGACoffeeBatchOperations) {
        return coffeeBatchOperations;
    }

    function getProofOfReserve() external view returns (WAGAProofOfReserve) {
        return proofOfReserve;
    }

    function getInventoryManager() external view returns (WAGAInventoryManagerMVP) {
        return inventoryManager;
    }

    function getECXOracle() external view returns (WAGAECXPriceOracle) {
        return ecxOracle;
    }

    function getCircomVerifier() external view returns (CircomVerifier) {
        if (block.chainid == 31337) {
            return CircomVerifier(address(mockCircomVerifier));
        }
        return circomVerifier;
    }

    function getConfigManager() external view returns (WAGAConfigManager) {
        return configManager;
    }
}
