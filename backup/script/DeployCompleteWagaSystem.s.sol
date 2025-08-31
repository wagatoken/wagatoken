// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WAGACoffeeToken} from "../src/WAGACoffeeToken.sol";
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManager2} from "../src/WAGAInventoryManager2.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {WAGAConfigManager} from "../src/WAGAConfigManager.sol";
import {WAGAViewFunctions} from "../src/WAGAViewFunctions.sol";
import {WAGAAccessControl} from "../src/WAGAAccessControl.sol";
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

/**
 * @title DeployCompleteWagaSystem
 * @dev Deployment script for the complete WAGA Coffee system with Real ZK MVP
 */
contract DeployCompleteWagaSystem is Script {
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Contract addresses
    address public coffeeTokenAddress;
    address public proofOfReserveAddress;
    address public inventoryManagerAddress;
    address public redemptionAddress;
    address public configManagerAddress;
    address public viewFunctionsAddress;
    address public accessControlAddress;
    address public zkVerifierAddress;
    address public privacyLayerAddress;

    // Helper configuration
    HelperConfig public helperConfig;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ContractDeployed(string contractName, address contractAddress);
    event RoleGranted(string role, address user);
    event SystemInitialized();

    /* -------------------------------------------------------------------------- */
    /*                              Main Functions                                */
    /* -------------------------------------------------------------------------- */

    function run() external returns (
        WAGACoffeeToken,
        WAGAProofOfReserve,
        WAGAInventoryManager2,
        CircomVerifier
    ) {
        // Initialize HelperConfig
        helperConfig = new HelperConfig();
        
        // Get network configuration and deployer key from HelperConfig
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
        uint256 deployerKey = networkConfig.deployerKey;
        
        vm.startBroadcast(deployerKey);

        // Step 1: Deploy Access Control
        deployAccessControl();

        // Step 2: Deploy Real ZK System
        deployCircomVerifier();
        deployPrivacyLayer();

        // Step 3: Deploy Core WAGA Contracts
        deployWAGACoffeeToken();
        deployProofOfReserve(networkConfig.router, networkConfig.subscriptionId, networkConfig.donId);
        deployInventoryManager();
        deployRedemptionContract();
        deployConfigManager();
        deployViewFunctions();

        // Step 4: Initialize system and set up roles
        initializeCompleteSystem();

        console.log("Complete WAGA System with Real ZK MVP deployed successfully!");
        printDeploymentSummary();

        vm.stopBroadcast();

        // Return main contracts
        return (
            WAGACoffeeToken(coffeeTokenAddress),
            WAGAProofOfReserve(proofOfReserveAddress),
            WAGAInventoryManager2(inventoryManagerAddress),
            CircomVerifier(zkVerifierAddress)
        );
    }

    /**
     * @dev Deploy Access Control system
     */
    function deployAccessControl() internal {
        console.log("Deploying Access Control...");

        WAGAAccessControl accessControl = new WAGAAccessControl();
        accessControlAddress = address(accessControl);

        emit ContractDeployed("WAGAAccessControl", accessControlAddress);
        console.log("WAGAAccessControl deployed at:", accessControlAddress);
    }

    /**
     * @dev Deploy CircomVerifier for Real ZK MVP
     */
    function deployCircomVerifier() internal {
        console.log("Deploying Real ZK CircomVerifier...");

        CircomVerifier zkVerifier = new CircomVerifier();
        zkVerifierAddress = address(zkVerifier);

        emit ContractDeployed("CircomVerifier", zkVerifierAddress);
        console.log("CircomVerifier deployed at:", zkVerifierAddress);
    }

    /**
     * @dev Deploy Privacy Layer
     */
    function deployPrivacyLayer() internal {
        console.log("Deploying Privacy Layer...");

        PrivacyLayer privacyLayer = new PrivacyLayer();
        privacyLayerAddress = address(privacyLayer);

        emit ContractDeployed("PrivacyLayer", privacyLayerAddress);
        console.log("PrivacyLayer deployed at:", privacyLayerAddress);
    }

    /**
     * @dev Deploy main WAGA Coffee Token
     */
    function deployWAGACoffeeToken() internal {
        console.log("Deploying WAGA Coffee Token with Real ZK...");

        WAGACoffeeToken coffeeToken = new WAGACoffeeToken(
            "https://ipfs.io/ipfs/", // Base URI for metadata
            zkVerifierAddress,
            privacyLayerAddress
        );
        coffeeTokenAddress = address(coffeeToken);

        emit ContractDeployed("WAGACoffeeToken", coffeeTokenAddress);
        console.log("WAGACoffeeToken deployed at:", coffeeTokenAddress);
    }

    /**
     * @dev Deploy Proof of Reserve with Chainlink Functions
     */
    function deployProofOfReserve(
        address _router,
        uint64 _subscriptionId,
        bytes32 _donId
    ) internal {
        console.log("Deploying Proof of Reserve...");

        WAGAProofOfReserve proofOfReserve = new WAGAProofOfReserve(
            coffeeTokenAddress,
            _router,
            _subscriptionId,
            _donId
        );
        proofOfReserveAddress = address(proofOfReserve);

        emit ContractDeployed("WAGAProofOfReserve", proofOfReserveAddress);
        console.log("WAGAProofOfReserve deployed at:", proofOfReserveAddress);
    }

    /**
     * @dev Deploy Inventory Manager
     */
    function deployInventoryManager() internal {
        console.log("Deploying Inventory Manager...");

        WAGAInventoryManager2 inventoryManager = new WAGAInventoryManager2(
            coffeeTokenAddress,
            proofOfReserveAddress
        );
        inventoryManagerAddress = address(inventoryManager);

        emit ContractDeployed("WAGAInventoryManager2", inventoryManagerAddress);
        console.log("WAGAInventoryManager2 deployed at:", inventoryManagerAddress);
    }

    /**
     * @dev Deploy Redemption contract
     */
    function deployRedemptionContract() internal {
        console.log("Deploying Redemption Contract...");

        WAGACoffeeRedemption redemption = new WAGACoffeeRedemption(
            coffeeTokenAddress
        );
        redemptionAddress = address(redemption);

        emit ContractDeployed("WAGACoffeeRedemption", redemptionAddress);
        console.log("WAGACoffeeRedemption deployed at:", redemptionAddress);
    }

    /**
     * @dev Deploy Config Manager
     */
    function deployConfigManager() internal {
        console.log("Deploying Config Manager...");

        WAGAConfigManager configManager = new WAGAConfigManager();
        configManagerAddress = address(configManager);

        emit ContractDeployed("WAGAConfigManager", configManagerAddress);
        console.log("WAGAConfigManager deployed at:", configManagerAddress);
    }

    /**
     * @dev Deploy View Functions
     */
    function deployViewFunctions() internal {
        console.log("Deploying View Functions...");

        WAGAViewFunctions viewFunctions = new WAGAViewFunctions();
        viewFunctionsAddress = address(viewFunctions);

        emit ContractDeployed("WAGAViewFunctions", viewFunctionsAddress);
        console.log("WAGAViewFunctions deployed at:", viewFunctionsAddress);
    }

    /**
     * @dev Initialize the complete system with Real ZK MVP
     */
    function initializeCompleteSystem() internal {
        console.log("Initializing Complete WAGA System with Real ZK MVP...");

        WAGACoffeeToken coffeeToken = WAGACoffeeToken(coffeeTokenAddress);

        // Grant CircomVerifier role to verify ZK proofs
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), zkVerifierAddress);

        // Grant roles to Proof of Reserve
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), proofOfReserveAddress);
        coffeeToken.grantRole(coffeeToken.MINTER_ROLE(), proofOfReserveAddress);

        // Grant roles to Inventory Manager
        coffeeToken.grantRole(coffeeToken.INVENTORY_MANAGER_ROLE(), inventoryManagerAddress);

        // Grant roles to Redemption contract
        coffeeToken.grantRole(coffeeToken.REDEMPTION_ROLE(), redemptionAddress);

        // Grant processor role to deployer for testing
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), msg.sender);
        
        // Grant distributor role to deployer for testing
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), msg.sender);

        emit RoleGranted("VERIFIER_ROLE", zkVerifierAddress);
        emit RoleGranted("VERIFIER_ROLE", proofOfReserveAddress);
        emit RoleGranted("MINTER_ROLE", proofOfReserveAddress);
        emit RoleGranted("INVENTORY_MANAGER_ROLE", inventoryManagerAddress);
        emit RoleGranted("REDEMPTION_ROLE", redemptionAddress);
        emit RoleGranted("PROCESSOR_ROLE", msg.sender);
        emit RoleGranted("DISTRIBUTOR_ROLE", msg.sender);

        console.log("Complete system initialization completed!");
        emit SystemInitialized();
    }

    /**
     * @dev Print deployment summary
     */
    function printDeploymentSummary() internal view {
        console.log("\n============================================================");
        console.log("         COMPLETE WAGA SYSTEM DEPLOYMENT SUMMARY");
        console.log("============================================================");
        
        console.log("\n Core Contracts:");
        console.log("WAGACoffeeToken:", coffeeTokenAddress);
        console.log("WAGAProofOfReserve:", proofOfReserveAddress);
        console.log("WAGAInventoryManager2:", inventoryManagerAddress);
        console.log("WAGACoffeeRedemption:", redemptionAddress);
        console.log("WAGAConfigManager:", configManagerAddress);
        console.log("WAGAViewFunctions:", viewFunctionsAddress);
        
        console.log("\n Real ZK MVP Contracts:");
        console.log("CircomVerifier:", zkVerifierAddress);
        console.log("PrivacyLayer:", privacyLayerAddress);
        console.log("WAGAAccessControl:", accessControlAddress);
        
        console.log("\n Real ZK Features:");
        console.log("1. Price Competitiveness Proofs (PricePrivacyCircuit)");
        console.log("2. Quality Standards Proofs (QualityTierCircuit)");
        console.log("3. Supply Chain Provenance Proofs (SupplyChainPrivacyCircuit)");
        console.log("4. Real Groth16 ZK Verification");
        console.log("5. Circom Circuit Integration");
        
        console.log("\n Core Features:");
        console.log("- Coffee Batch Management with ZK Proofs");
        console.log("- Chainlink Functions for Proof of Reserve");
        console.log("- Automated Inventory Management");
        console.log("- Physical Coffee Redemption");
        console.log("- Role-Based Access Control");
        console.log("- Privacy-Enhanced Data Management");
        
        console.log("\n Chainlink Configuration:");
        console.log("Router:", helperConfig.getActiveNetworkConfig().router);
        console.log("Subscription ID:", helperConfig.getActiveNetworkConfig().subscriptionId);
        console.log("DON ID:", vm.toString(helperConfig.getActiveNetworkConfig().donId));
        
        console.log("\n Next Steps:");
        console.log("1. Test coffee batch creation with ZK proofs");
        console.log("2. Test Chainlink Functions integration");
        console.log("3. Test inventory management automation");
        console.log("4. Test physical coffee redemption");
        console.log("5. Generate real ZK proofs with snarkjs");
        console.log("6. Test end-to-end coffee supply chain workflow");
        
        console.log("\n============================================================");
    }

    /**
     * @dev Get contract addresses for frontend integration
     */
    function getContractAddresses() external view returns (
        address coffeeToken,
        address proofOfReserve,
        address inventoryManager,
        address redemption,
        address zkVerifier,
        address privacyLayer
    ) {
        return (
            coffeeTokenAddress,
            proofOfReserveAddress,
            inventoryManagerAddress,
            redemptionAddress,
            zkVerifierAddress,
            privacyLayerAddress
        );
    }
}
