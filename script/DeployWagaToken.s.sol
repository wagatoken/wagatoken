// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {WAGACoffeeToken} from "../src/WAGACoffeeToken.sol";
import {WAGAInventoryManager} from "../src/WAGAInventoryManager2.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAZKManager} from "../src/ZKIntegration/WAGAZKManager.sol";
import {CircomVerifier} from "../src/ZKVerifiers/CircomVerifier.sol";
import {SelectiveTransparency} from "../src/PrivacyLayers/SelectiveTransparency.sol";
import {CompetitiveProtection} from "../src/PrivacyLayers/CompetitiveProtection.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeployWagaToken is Script {
    HelperConfig public helperConfig;

    function run()
        external
        returns (
            WAGACoffeeToken,
            WAGAInventoryManager,
            WAGACoffeeRedemption,
            WAGAProofOfReserve,
            WAGAZKManager,
            CircomVerifier,
            SelectiveTransparency,
            CompetitiveProtection,
            HelperConfig
        )
    {
        helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig
            .getActiveNetworkConfig();

        vm.startBroadcast(config.deployerKey);

        console.log("🚀 Deploying WAGA Coffee System with ZK Privacy...");
        console.log("Deployer:", vm.addr(config.deployerKey));

        // 1. Deploy ZK System Components
        console.log("\n📋 Deploying ZK System Components...");
        
        CircomVerifier circomVerifier = new CircomVerifier();
        console.log("Circom Verifier deployed at:", address(circomVerifier));
        
        SelectiveTransparency selectiveTransparency = new SelectiveTransparency();
        console.log("Selective Transparency deployed at:", address(selectiveTransparency));
        
        CompetitiveProtection competitiveProtection = new CompetitiveProtection();
        console.log("Competitive Protection deployed at:", address(competitiveProtection));
        
        WAGAZKManager zkManager = new WAGAZKManager(
            address(circomVerifier),
            address(circomVerifier) // Using circomVerifier as compliance verifier for now
        );
        console.log("ZK Manager deployed at:", address(zkManager));

        // 2. Deploy Core WAGA Contracts
        console.log("\n☕ Deploying Core WAGA Contracts...");
        
        WAGACoffeeToken coffeeToken = new WAGACoffeeToken();
        console.log("WAGACoffeeToken deployed at:", address(coffeeToken));

        WAGAProofOfReserve proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            config.router,
            config.subscriptionId,
            config.donId
        );
        console.log("WAGAProofOfReserve deployed at:", address(proofOfReserve));

        WAGAInventoryManager inventoryManager = new WAGAInventoryManager(
            address(coffeeToken),
            address(proofOfReserve)
        );
        console.log("WAGAInventoryManager deployed at:", address(inventoryManager));

        WAGACoffeeRedemption redemptionContract = new WAGACoffeeRedemption(
            address(coffeeToken)
        );
        console.log("WAGACoffeeRedemption deployed at:", address(redemptionContract));

        // 3. Set up ZK System Roles and Permissions
        console.log("\n🔐 Setting up ZK System Roles...");
        
        selectiveTransparency.grantDataManagerRole(address(zkManager));
        competitiveProtection.grantMarketAnalystRole(address(zkManager));
        circomVerifier.grantVerifierRole(address(zkManager));
        
        console.log("✅ ZK System roles configured");

        // 4. Initialize Core Contracts
        console.log("\n🔧 Initializing Core Contracts...");
        
        coffeeToken.initialize(
            address(inventoryManager),
            address(redemptionContract),
            address(proofOfReserve),
            address(zkManager) // Add ZK manager to initialization
        );
        
        console.log("✅ Core contracts initialized with ZK integration");

        // 5. Verify Deployment
        console.log("\n🔍 Verifying Deployment...");
        
        bool zkManagerWorks = zkManager.hasRole(keccak256("ZK_ADMIN_ROLE"), vm.addr(config.deployerKey));
        bool selectiveTransparencyWorks = selectiveTransparency.hasRole(keccak256("PRIVACY_ADMIN_ROLE"), vm.addr(config.deployerKey));
        bool competitiveProtectionWorks = competitiveProtection.hasRole(keccak256("COMPETITIVE_ADMIN_ROLE"), vm.addr(config.deployerKey));
        bool coffeeTokenWorks = coffeeToken.hasRole(keccak256("ADMIN_ROLE"), vm.addr(config.deployerKey));
        
        console.log("ZK Manager:", zkManagerWorks ? "✅" : "❌");
        console.log("Selective Transparency:", selectiveTransparencyWorks ? "✅" : "❌");
        console.log("Competitive Protection:", competitiveProtectionWorks ? "✅" : "❌");
        console.log("WAGACoffeeToken:", coffeeTokenWorks ? "✅" : "❌");

        vm.stopBroadcast();

        // 6. Output Deployment Summary
        console.log("\n🎉 WAGA Coffee System with ZK Privacy Deployment Complete!");
        console.log("================================================================");
        console.log("Core Contracts:");
        console.log("  WAGACoffeeToken:", address(coffeeToken));
        console.log("  WAGAInventoryManager:", address(inventoryManager));
        console.log("  WAGACoffeeRedemption:", address(redemptionContract));
        console.log("  WAGAProofOfReserve:", address(proofOfReserve));
        console.log("\nZK System:");
        console.log("  ZK Manager:", address(zkManager));
        console.log("  Circom Verifier:", address(circomVerifier));
        console.log("  Selective Transparency:", address(selectiveTransparency));
        console.log("  Competitive Protection:", address(competitiveProtection));
        console.log("\n📝 Next Steps:");
        console.log("1. Test ZK proof verification workflows");
        console.log("2. Create batches with privacy levels");
        console.log("3. Integrate ZK proofs in batch creation");
        console.log("4. Test privacy-protected data display");

        // Save deployment addresses
        string memory deploymentData = string(abi.encodePacked(
            "WAGA Coffee System with ZK Privacy - ", 
            vm.toString(block.timestamp),
            "\n\n",
            "Core Contracts:",
            "\n  WAGACoffeeToken: ", vm.toString(address(coffeeToken)),
            "\n  WAGAInventoryManager: ", vm.toString(address(inventoryManager)),
            "\n  WAGACoffeeRedemption: ", vm.toString(address(redemptionContract)),
            "\n  WAGAProofOfReserve: ", vm.toString(address(proofOfReserve)),
            "\n\n",
            "ZK System:",
            "\n  ZK Manager: ", vm.toString(address(zkManager)),
            "\n  Circom Verifier: ", vm.toString(address(circomVerifier)),
            "\n  Selective Transparency: ", vm.toString(address(selectiveTransparency)),
            "\n  Competitive Protection: ", vm.toString(address(competitiveProtection)),
            "\n\n",
            "Deployer: ", vm.toString(vm.addr(config.deployerKey)),
            "\n",
            "Network: ", vm.toString(block.chainid)
        ));
        
        vm.writeFile("deployment-waga-zk-system.txt", deploymentData);
        console.log("\n💾 Deployment addresses saved to: deployment-waga-zk-system.txt");

        return (
            coffeeToken,
            inventoryManager,
            redemptionContract,
            proofOfReserve,
            zkManager,
            circomVerifier,
            selectiveTransparency,
            competitiveProtection,
            helperConfig
        );
    }
}

// All WAGA Contracts Successfully Deployed & Verified on Base Sepolia:
// Contract Addresses:
// WAGACoffeeToken: 0xbAA584BDA90bF54fee155329e59C0E7e02A40FD2
// WAGAInventoryManager: 0xb9e41ab9c876B8281F8a286f4db1cFAFD6eFF25C
// WAGACoffeeRedemption: 0x82f57003c108d99337cc3E40D9DB86d2B3Fe6df2
// WAGAProofOfReserve: 0xf04e3F560DcFF5927aBDD0aa7755Dbaec56247ac
// HelperConfig: 0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141