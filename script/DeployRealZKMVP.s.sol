// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script, console} from "forge-std/Script.sol";
import {WAGACoffeeToken} from "../src/WAGACoffeeToken.sol";
import {WAGAAccessControl} from "../src/WAGAAccessControl.sol";
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

/**
 * @title DeployRealZKMVP
 * @dev Deployment script for Real ZK MVP with 3 core proofs
 */
contract DeployRealZKMVP is Script {
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    // Contract addresses
    address public coffeeTokenAddress;
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
        CircomVerifier,
        PrivacyLayer,
        HelperConfig
    ) {
        // Initialize HelperConfig
        helperConfig = new HelperConfig();
        
        // Get network configuration and deployer key from HelperConfig
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();
        uint256 deployerKey = networkConfig.deployerKey;
        
        vm.startBroadcast(deployerKey);

        // Step 1: Deploy Access Control
        deployAccessControl();

        // Step 2: Deploy CircomVerifier with Real ZK proofs
        deployCircomVerifier();

        // Step 3: Deploy Privacy Layer
        deployPrivacyLayer();

        // Step 4: Deploy main WAGA Coffee Token
        deployWAGACoffeeToken();

        // Step 5: Setup basic roles
        setupBasicRoles();

        console.log("Real ZK MVP System deployed successfully!");
        printDeploymentSummary();

        vm.stopBroadcast();

        // Return deployed contracts
        return (
            WAGACoffeeToken(coffeeTokenAddress),
            CircomVerifier(zkVerifierAddress),
            PrivacyLayer(privacyLayerAddress),
            helperConfig
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
     * @dev Setup basic roles for Real ZK MVP
     */
    function setupBasicRoles() internal {
        console.log("Setting up basic roles for Real ZK MVP...");

        WAGACoffeeToken coffeeToken = WAGACoffeeToken(coffeeTokenAddress);

        // Grant verifier role to CircomVerifier contract
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), zkVerifierAddress);
        
        // Grant processor role to deployer for testing
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), msg.sender);
        
        // Grant distributor role to deployer for testing
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), msg.sender);
        
        emit RoleGranted("VERIFIER_ROLE", zkVerifierAddress);
        emit RoleGranted("PROCESSOR_ROLE", msg.sender);
        emit RoleGranted("DISTRIBUTOR_ROLE", msg.sender);
        
        console.log("Basic roles configured successfully");
        emit SystemInitialized();
    }

    /**
     * @dev Print deployment summary
     */
    function printDeploymentSummary() internal view {
        console.log("\n============================================================");
        console.log("              REAL ZK MVP DEPLOYMENT SUMMARY");
        console.log("============================================================");
        console.log("WAGACoffeeToken:", coffeeTokenAddress);
        console.log("WAGAAccessControl:", accessControlAddress);
        console.log("CircomVerifier:", zkVerifierAddress);
        console.log("PrivacyLayer:", privacyLayerAddress);
        console.log("============================================================");
        console.log("Real ZK Features:");
        console.log("1. Price Competitiveness Proofs (PricePrivacyCircuit)");
        console.log("2. Quality Standards Proofs (QualityTierCircuit)");
        console.log("3. Supply Chain Provenance Proofs (SupplyChainPrivacyCircuit)");
        console.log("4. Real Groth16 ZK Verification");
        console.log("5. Circom Circuit Integration");
        console.log("============================================================");
        console.log("Core Roles:");
        console.log("- ADMIN_ROLE: Full system access");
        console.log("- PROCESSOR_ROLE: Can create batches with ZK proofs");
        console.log("- VERIFIER_ROLE: Can verify ZK proofs");
        console.log("- DISTRIBUTOR_ROLE: Can request batches");
        console.log("============================================================");
        console.log("Next Steps:");
        console.log("1. Test Price Competitiveness verification");
        console.log("2. Test Quality Standards verification");
        console.log("3. Test Supply Chain Provenance verification");
        console.log("4. Generate real ZK proofs with snarkjs");
        console.log("5. Test end-to-end ZK workflow");
        console.log("============================================================");
    }

    /**
     * @dev Get contract addresses for testing
     */
    function getContractAddresses() external view returns (
        address coffeeToken,
        address accessControl,
        address zkVerifier,
        address privacyLayer
    ) {
        return (
            coffeeTokenAddress,
            accessControlAddress,
            zkVerifierAddress,
            privacyLayerAddress
        );
    }
}
