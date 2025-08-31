// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../src/WAGAZKManager.sol";
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManager2} from "../src/WAGAInventoryManager2.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

/**
 * @title DeployModularWagaSystem
 * @dev Deployment script for modular WAGA Coffee system with Real ZK MVP
 */
contract DeployModularWagaSystem is Script {
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Core contract addresses
    address public coffeeTokenCoreAddress;
    address public batchManagerAddress;
    address public zkManagerAddress;
    address public zkVerifierAddress;
    address public privacyLayerAddress;

    // Supporting contract addresses
    address public proofOfReserveAddress;
    address public inventoryManagerAddress;
    address public redemptionAddress;

    // Helper configuration
    HelperConfig public helperConfig;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ContractDeployed(string contractName, address contractAddress);
    event SystemInitialized();

    /* -------------------------------------------------------------------------- */
    /*                              Main Functions                                */
    /* -------------------------------------------------------------------------- */

    function run() external returns (
        WAGACoffeeTokenCore,
        WAGABatchManager,
        WAGAZKManager,
        CircomVerifier
    ) {
        // Initialize HelperConfig
        helperConfig = new HelperConfig();
        
        // Get network configuration and deployer key from HelperConfig
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
        uint256 deployerKey = networkConfig.deployerKey;
        
        vm.startBroadcast(deployerKey);

        // Step 1: Deploy Real ZK System
        deployZKSystem();

        // Step 2: Deploy Core Token System
        deployCoreTokenSystem();

        // Step 3: Deploy Supporting Contracts
        deploySupportingContracts(networkConfig);

        // Step 4: Initialize system
        initializeModularSystem();

        console.log("Modular WAGA System with Real ZK MVP deployed successfully!");
        printModularDeploymentSummary();

        vm.stopBroadcast();

        // Return main contracts
        return (
            WAGACoffeeTokenCore(coffeeTokenCoreAddress),
            WAGABatchManager(batchManagerAddress),
            WAGAZKManager(zkManagerAddress),
            CircomVerifier(zkVerifierAddress)
        );
    }

    /**
     * @dev Deploy Real ZK System
     */
    function deployZKSystem() internal {
        console.log("Deploying Real ZK System...");

        // Deploy CircomVerifier
        CircomVerifier zkVerifier = new CircomVerifier();
        zkVerifierAddress = address(zkVerifier);
        emit ContractDeployed("CircomVerifier", zkVerifierAddress);

        // Deploy PrivacyLayer
        PrivacyLayer privacyLayer = new PrivacyLayer();
        privacyLayerAddress = address(privacyLayer);
        emit ContractDeployed("PrivacyLayer", privacyLayerAddress);

        console.log("Real ZK System deployed successfully!");
    }

    /**
     * @dev Deploy Core Token System
     */
    function deployCoreTokenSystem() internal {
        console.log("Deploying Core Token System...");

        // Deploy Core Token
        WAGACoffeeTokenCore coffeeTokenCore = new WAGACoffeeTokenCore(
            "https://ipfs.io/ipfs/"
        );
        coffeeTokenCoreAddress = address(coffeeTokenCore);
        emit ContractDeployed("WAGACoffeeTokenCore", coffeeTokenCoreAddress);

        // Deploy Batch Manager
        WAGABatchManager batchManager = new WAGABatchManager(
            coffeeTokenCoreAddress,
            privacyLayerAddress
        );
        batchManagerAddress = address(batchManager);
        emit ContractDeployed("WAGABatchManager", batchManagerAddress);

        // Deploy ZK Manager
        WAGAZKManager zkManager = new WAGAZKManager(
            coffeeTokenCoreAddress,
            zkVerifierAddress
        );
        zkManagerAddress = address(zkManager);
        emit ContractDeployed("WAGAZKManager", zkManagerAddress);

        console.log("Core Token System deployed successfully!");
    }

    /**
     * @dev Deploy Supporting Contracts
     */
    function deploySupportingContracts(HelperConfig.NetworkConfig memory networkConfig) internal {
        console.log("Deploying Supporting Contracts...");

        // Deploy Proof of Reserve
        WAGAProofOfReserve proofOfReserve = new WAGAProofOfReserve(
            coffeeTokenCoreAddress,
            networkConfig.router,
            networkConfig.subscriptionId,
            networkConfig.donId
        );
        proofOfReserveAddress = address(proofOfReserve);
        emit ContractDeployed("WAGAProofOfReserve", proofOfReserveAddress);

        // Deploy Inventory Manager
        WAGAInventoryManager2 inventoryManager = new WAGAInventoryManager2(
            coffeeTokenCoreAddress,
            proofOfReserveAddress
        );
        inventoryManagerAddress = address(inventoryManager);
        emit ContractDeployed("WAGAInventoryManager2", inventoryManagerAddress);

        // Deploy Redemption
        WAGACoffeeRedemption redemption = new WAGACoffeeRedemption(
            coffeeTokenCoreAddress
        );
        redemptionAddress = address(redemption);
        emit ContractDeployed("WAGACoffeeRedemption", redemptionAddress);

        console.log("Supporting Contracts deployed successfully!");
    }

    /**
     * @dev Initialize the modular system
     */
    function initializeModularSystem() internal {
        console.log("Initializing Modular System...");

        WAGACoffeeTokenCore coffeeTokenCore = WAGACoffeeTokenCore(coffeeTokenCoreAddress);

        // Grant roles to managers
        coffeeTokenCore.grantRole(coffeeTokenCore.VERIFIER_ROLE(), zkManagerAddress);
        coffeeTokenCore.grantRole(coffeeTokenCore.VERIFIER_ROLE(), proofOfReserveAddress);
        coffeeTokenCore.grantRole(coffeeTokenCore.MINTER_ROLE(), proofOfReserveAddress);
        coffeeTokenCore.grantRole(coffeeTokenCore.INVENTORY_MANAGER_ROLE(), inventoryManagerAddress);
        coffeeTokenCore.grantRole(coffeeTokenCore.REDEMPTION_ROLE(), redemptionAddress);

        // Grant processor role to deployer for testing
        coffeeTokenCore.grantRole(coffeeTokenCore.PROCESSOR_ROLE(), msg.sender);
        coffeeTokenCore.grantRole(coffeeTokenCore.DISTRIBUTOR_ROLE(), msg.sender);

        console.log("Modular system initialization completed!");
        emit SystemInitialized();
    }

    /**
     * @dev Print deployment summary
     */
    function printModularDeploymentSummary() internal view {
        console.log("\n============================================================");
        console.log("        MODULAR WAGA SYSTEM DEPLOYMENT SUMMARY");
        console.log("============================================================");
        
        console.log("\n Core Contracts:");
        console.log("WAGACoffeeTokenCore:", coffeeTokenCoreAddress);
        console.log("WAGABatchManager:", batchManagerAddress);
        console.log("WAGAZKManager:", zkManagerAddress);
        
        console.log("\n Real ZK MVP Contracts:");
        console.log("CircomVerifier:", zkVerifierAddress);
        console.log("PrivacyLayer:", privacyLayerAddress);
        
        console.log("\n Supporting Contracts:");
        console.log("WAGAProofOfReserve:", proofOfReserveAddress);
        console.log("WAGAInventoryManager2:", inventoryManagerAddress);
        console.log("WAGACoffeeRedemption:", redemptionAddress);
        
        console.log("\n Modular Benefits:");
        console.log("1. Reduced contract complexity");
        console.log("2. Better gas optimization");
        console.log("3. Easier maintenance and upgrades");
        console.log("4. Clear separation of concerns");
        
        console.log("\n Real ZK Features:");
        console.log("1. Price Competitiveness Proofs");
        console.log("2. Quality Standards Proofs");
        console.log("3. Supply Chain Provenance Proofs");
        console.log("4. Real Groth16 ZK Verification");
        
        console.log("\n Next Steps:");
        console.log("1. Test modular batch creation");
        console.log("2. Test ZK proof verification");
        console.log("3. Test inter-contract communication");
        console.log("4. Generate real ZK proofs with snarkjs");
        
        console.log("\n============================================================");
    }

    /**
     * @dev Get contract addresses for frontend integration
     */
    function getContractAddresses() external view returns (
        address coffeeTokenCore,
        address batchManager,
        address zkManager,
        address zkVerifier,
        address privacyLayer
    ) {
        return (
            coffeeTokenCoreAddress,
            batchManagerAddress,
            zkManagerAddress,
            zkVerifierAddress,
            privacyLayerAddress
        );
    }
}
