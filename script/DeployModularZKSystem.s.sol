// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../src/WAGAZKManager.sol";
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../src/WAGAInventoryManagerMVP.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";

/**
 * @title DeployModularZKSystem
 * @dev Updated deployment script for modular ZK-enabled WAGA system
 * @notice Deploys contracts in proper dependency order with enhanced ZK functionality
 */
contract DeployModularZKSystem is Script {

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Contract addresses  
    address public coffeeTokenAddress;
    address public batchManagerAddress;
    address public zkManagerAddress;
    address public proofOfReserveAddress;
    address public inventoryManagerAddress;
    address public redemptionAddress;
    address public zkVerifierAddress;
    address public privacyLayerAddress;

    // Helper configuration
    HelperConfig public helperConfig;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ContractDeployed(string contractName, address contractAddress);
    event RoleGranted(string role, address user, address contractAddress);
    event SystemConfigured(string component);
    event DeploymentCompleted(uint256 totalContracts);

    /* -------------------------------------------------------------------------- */
    /*                              Main Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Main deployment function
     */
    function run() external returns (
        WAGACoffeeTokenCore coffeeToken,
        WAGABatchManager batchManager,
        WAGAZKManager zkManager,
        WAGAProofOfReserve proofOfReserve,
        WAGAInventoryManagerMVP inventoryManager,
        WAGACoffeeRedemption redemption,
        CircomVerifier zkVerifier,
        PrivacyLayer privacyLayer,
        HelperConfig config
    ) {
        console.log("Starting Modular ZK System Deployment...");
        console.log("=========================================");

        // Initialize configuration
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
        
        vm.startBroadcast(networkConfig.deployerKey);

        // Deploy in dependency order
        deployInfrastructure();
        deployCoreContracts(networkConfig);
        deployManagerContracts();
        configureSystemIntegration();
        setupRolesAndPermissions();

        vm.stopBroadcast();

        console.log("Deployment completed successfully!");
        printDeploymentSummary();

        // Return all deployed contracts
        return (
            WAGACoffeeTokenCore(coffeeTokenAddress),
            WAGABatchManager(batchManagerAddress),
            WAGAZKManager(zkManagerAddress),
            WAGAProofOfReserve(proofOfReserveAddress),
            WAGAInventoryManagerMVP(inventoryManagerAddress),
            WAGACoffeeRedemption(redemptionAddress),
            CircomVerifier(zkVerifierAddress),
            PrivacyLayer(privacyLayerAddress),
            helperConfig
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                           Deployment Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Deploy infrastructure contracts (ZK and Privacy)
     */
    function deployInfrastructure() internal {
        console.log("\n1. Deploying Infrastructure...");
        console.log("-------------------------------");

        // Deploy ZK Verifier
        console.log("Deploying CircomVerifier...");
        zkVerifierAddress = address(new CircomVerifier());
        emit ContractDeployed("CircomVerifier", zkVerifierAddress);
        console.log(" CircomVerifier deployed at:", zkVerifierAddress);

        // Note: PrivacyLayer is now deployed in deployCoreContracts after coffee token

        emit SystemConfigured("Infrastructure");
    }

    /**
     * @dev Deploy core contracts (Token and Managers)
     */
    function deployCoreContracts(HelperConfig.NetworkConfig memory networkConfig) internal {
        console.log("\n2. Deploying Core Contracts...");
        console.log("-------------------------------");

        // Deploy Coffee Token Core (ERC1155 only)
        console.log("Deploying WAGACoffeeTokenCore...");
        coffeeTokenAddress = address(new WAGACoffeeTokenCore("https://violet-rainy-toad-577.mypinata.cloud/ipfs/"));
        emit ContractDeployed("WAGACoffeeTokenCore", coffeeTokenAddress);
        console.log(" WAGACoffeeTokenCore deployed at:", coffeeTokenAddress);

        // Deploy Privacy Layer (after coffee token so it can reference it)
        console.log("Deploying PrivacyLayer...");
        privacyLayerAddress = address(new PrivacyLayer(coffeeTokenAddress));
        emit ContractDeployed("PrivacyLayer", privacyLayerAddress);
        console.log(" PrivacyLayer deployed at:", privacyLayerAddress);

        // Deploy Batch Manager (with ZK privacy)
        console.log("Deploying WAGABatchManager...");
        batchManagerAddress = address(new WAGABatchManager(coffeeTokenAddress, privacyLayerAddress));
        emit ContractDeployed("WAGABatchManager", batchManagerAddress);
        console.log(" WAGABatchManager deployed at:", batchManagerAddress);

        // Deploy ZK Manager
        console.log("Deploying WAGAZKManager...");
        zkManagerAddress = address(new WAGAZKManager(coffeeTokenAddress, zkVerifierAddress));
        emit ContractDeployed("WAGAZKManager", zkManagerAddress);
        console.log(" WAGAZKManager deployed at:", zkManagerAddress);

        // Deploy Proof of Reserve (Chainlink Functions)
        console.log("Deploying WAGAProofOfReserve...");
        proofOfReserveAddress = address(new WAGAProofOfReserve(
            coffeeTokenAddress,
            batchManagerAddress,
            networkConfig.router,
            networkConfig.subscriptionId,
            networkConfig.donId
        ));
        emit ContractDeployed("WAGAProofOfReserve", proofOfReserveAddress);
        console.log(" WAGAProofOfReserve deployed at:", proofOfReserveAddress);

        emit SystemConfigured("Core Contracts");
    }

    /**
     * @dev Deploy manager contracts
     */
    function deployManagerContracts() internal {
        console.log("\n3. Deploying Manager Contracts...");
        console.log("----------------------------------");

        // Deploy Inventory Manager MVP
        console.log("Deploying WAGAInventoryManagerMVP...");
        inventoryManagerAddress = address(new WAGAInventoryManagerMVP(
            coffeeTokenAddress,
            batchManagerAddress,
            proofOfReserveAddress
        ));
        emit ContractDeployed("WAGAInventoryManagerMVP", inventoryManagerAddress);
        console.log(" WAGAInventoryManagerMVP deployed at:", inventoryManagerAddress);

        // Deploy Redemption Manager
        console.log("Deploying WAGACoffeeRedemption...");
        redemptionAddress = address(new WAGACoffeeRedemption(
            coffeeTokenAddress
            
        ));
        emit ContractDeployed("WAGACoffeeRedemption", redemptionAddress);
        console.log(" WAGACoffeeRedemption deployed at:", redemptionAddress);

        emit SystemConfigured("Manager Contracts");
    }

    /**
     * @dev Configure system integration
     */
    function configureSystemIntegration() internal {
        console.log("\n4. Configuring System Integration...");
        console.log("------------------------------------");

        WAGACoffeeTokenCore coffeeToken = WAGACoffeeTokenCore(coffeeTokenAddress);

        // Connect managers to token
        console.log("Connecting managers to token...");
        coffeeToken.setManagers(batchManagerAddress, zkManagerAddress);
        console.log(" Managers connected to token");

        emit SystemConfigured("Integration");
    }

    /**
     * @dev Setup roles and permissions for ZK system
     */
    function setupRolesAndPermissions() internal {
        console.log("\n5. Setting up Roles and Permissions...");
        console.log("--------------------------------------");

        WAGACoffeeTokenCore coffeeToken = WAGACoffeeTokenCore(coffeeTokenAddress);

        // Core system roles
       // bytes32 adminRole = coffeeToken.DEFAULT_ADMIN_ROLE();
        bytes32 processorRole = coffeeToken.PROCESSOR_ROLE();
        bytes32 distributorRole = coffeeToken.DISTRIBUTOR_ROLE();
        bytes32 verifierRole = coffeeToken.VERIFIER_ROLE();
        bytes32 minterRole = coffeeToken.MINTER_ROLE();
        bytes32 redemptionRole = coffeeToken.REDEMPTION_ROLE();

        // Grant roles to contracts
        console.log("Granting contract roles...");
        
        // ZK Verifier can verify proofs
        coffeeToken.grantRole(verifierRole, zkVerifierAddress);
        emit RoleGranted("VERIFIER_ROLE", zkVerifierAddress, coffeeTokenAddress);
        
        // Proof of Reserve can mint tokens
        coffeeToken.grantRole(minterRole, proofOfReserveAddress);
        emit RoleGranted("MINTER_ROLE", proofOfReserveAddress, coffeeTokenAddress);
        
        // Redemption contract can burn tokens
        coffeeToken.grantRole(redemptionRole, redemptionAddress);
        emit RoleGranted("REDEMPTION_ROLE", redemptionAddress, coffeeTokenAddress);

        // Grant testing roles to deployer
        console.log("Granting deployer roles for testing...");
        coffeeToken.grantRole(processorRole, msg.sender);
        coffeeToken.grantRole(distributorRole, msg.sender);
        coffeeToken.grantRole(verifierRole, msg.sender);
        
        emit RoleGranted("PROCESSOR_ROLE", msg.sender, coffeeTokenAddress);
        emit RoleGranted("DISTRIBUTOR_ROLE", msg.sender, coffeeTokenAddress);
        emit RoleGranted("VERIFIER_ROLE", msg.sender, coffeeTokenAddress);

        console.log(" All roles configured successfully");
        emit SystemConfigured("Roles and Permissions");
    }

    /* -------------------------------------------------------------------------- */
    /*                              Utility Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Print comprehensive deployment summary
     */
    function printDeploymentSummary() internal {
        console.log("\n============================================================");
        console.log("           MODULAR ZK SYSTEM DEPLOYMENT SUMMARY");
        console.log("============================================================");
        console.log("");
        console.log(" INFRASTRUCTURE CONTRACTS:");
        console.log("   CircomVerifier:       ", zkVerifierAddress);
        console.log("   PrivacyLayer:         ", privacyLayerAddress);
        console.log("");
        console.log("  CORE CONTRACTS:");
        console.log("   WAGACoffeeTokenCore:  ", coffeeTokenAddress);
        console.log("   WAGABatchManager:     ", batchManagerAddress);
        console.log("   WAGAZKManager:        ", zkManagerAddress);
        console.log("   WAGAProofOfReserve:   ", proofOfReserveAddress);
        console.log("");
        console.log("  MANAGER CONTRACTS:");
        console.log("   InventoryManagerMVP:  ", inventoryManagerAddress);
        console.log("   CoffeeRedemption:     ", redemptionAddress);
        console.log("");
        console.log(" ZK PRIVACY FEATURES:");
        console.log(" Role-based privacy access control");
        console.log("   Modular ZK proof verification");
        console.log("   Privacy layer integration");
        console.log("   Stack depth optimized functions");
        console.log("   Preserved existing circuit compatibility");
        console.log("");
        console.log(" SYSTEM INTEGRATION:");
        console.log("   Managers connected to core token");
        console.log("   Chainlink Functions configured");
        console.log("   Role-based permissions setup");
        console.log("   ZK verification pipeline ready");
        console.log("");
        console.log(" NEXT STEPS:");
        console.log("   1. Test ZK proof generation with existing circuits");
        console.log("   2. Verify privacy layer role-based access");
        console.log("   3. Test batch creation with ZK privacy levels");
        console.log("   4. Validate Chainlink Functions integration");
        console.log("   5. Run end-to-end workflow tests");
        console.log("============================================================");
        
        emit DeploymentCompleted(8);
    }

    /**
     * @dev Get all contract addresses for external integration
     */
    function getContractAddresses() external view returns (
        address coffeeToken,
        address batchManager,
        address zkManager,
        address proofOfReserve,
        address inventoryManager,
        address redemption,
        address zkVerifier,
        address privacyLayer
    ) {
        return (
            coffeeTokenAddress,
            batchManagerAddress,
            zkManagerAddress,
            proofOfReserveAddress,
            inventoryManagerAddress,
            redemptionAddress,
            zkVerifierAddress,
            privacyLayerAddress
        );
    }

    /**
     * @dev Verify deployment integrity
     */
    function verifyDeployment() external view returns (bool) {
        return (
            coffeeTokenAddress != address(0) &&
            batchManagerAddress != address(0) &&
            zkManagerAddress != address(0) &&
            proofOfReserveAddress != address(0) &&
            inventoryManagerAddress != address(0) &&
            redemptionAddress != address(0) &&
            zkVerifierAddress != address(0) &&
            privacyLayerAddress != address(0)
        );
    }
}
