// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACDPIntegration} from "../../src/WAGACDPIntegration.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGAECXPriceOracle} from "../../src/WAGAECXPriceOracle.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";

contract SimpleRoleTest is Test {
    // Deployment
    DeployRealZKMVP public deployRealZKMVP;
    HelperConfig public helperConfig;
    
    // Additional contracts from deployment (not used but needed for tuple)
    WAGACDPIntegration public cdpIntegration;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGAECXPriceOracle public ecxOracle;
    
    WAGACoffeeTokenCore public coffeeToken;
    address public deployer;
    address public verifier = makeAddr("verifier");

    function setUp() public {
        // Deploy using the deployment script
        deployRealZKMVP = new DeployRealZKMVP();
        
        (
            coffeeToken,
            , // batchManager
            , // zkManager
            , // privacyLayer
            , // treasury
            , // redemption
            cdpIntegration, // Now included in deployment
            proofOfReserve, // Now included in deployment
            inventoryManager, // Now included in deployment
            , // ethiopianCompliance
            ecxOracle, // Now included in deployment
            , // circomVerifier
            helperConfig
        ) = deployRealZKMVP.run();

        // Get deployer address from helper config
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        deployer = vm.addr(config.deployerKey);

        console.log("Deployer:", deployer);
        console.log("Coffee token deployed at:", address(coffeeToken));

        // Check what roles the deployer has by default
        bool hasAdmin = coffeeToken.hasRole(coffeeToken.ADMIN_ROLE(), deployer);
        bool hasDefaultAdmin = coffeeToken.hasRole(coffeeToken.DEFAULT_ADMIN_ROLE(), deployer);

        console.log("Deployer has ADMIN_ROLE:", hasAdmin);
        console.log("Deployer has DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);
    }

    function testBasicRoleCheck() public {
        vm.startPrank(deployer);

        // First grant DEFAULT_ADMIN_ROLE to deployer so they can manage other roles
        // DEFAULT_ADMIN_ROLE granted automatically in ConfigManager constructor

        // Now try to grant VERIFIER_ROLE to a test address
        coffeeToken.grantVerifierRole(verifier);

        // Verify the role was granted
        bool hasVerifierRole = coffeeToken.hasRole(coffeeToken.VERIFIER_ROLE(), verifier);

        console.log("Verifier has VERIFIER_ROLE:", hasVerifierRole);
        console.log("Successfully granted VERIFIER_ROLE");

        vm.stopPrank();

        assertTrue(hasVerifierRole, "Verifier should have VERIFIER_ROLE");
        assertTrue(true, "Basic role test completed");
    }

    function testRoleConstants() public view {
        // Test that role constants are properly defined
        bytes32 adminRole = coffeeToken.ADMIN_ROLE();
        bytes32 defaultAdminRole = coffeeToken.DEFAULT_ADMIN_ROLE();
        bytes32 processorRole = coffeeToken.PROCESSOR_ROLE();
        bytes32 verifierRole = coffeeToken.VERIFIER_ROLE();
        bytes32 distributorRole = coffeeToken.DISTRIBUTOR_ROLE();

        console.log("ADMIN_ROLE:", vm.toString(adminRole));
        console.log("DEFAULT_ADMIN_ROLE:", vm.toString(defaultAdminRole));
        console.log("PROCESSOR_ROLE:", vm.toString(processorRole));
        console.log("VERIFIER_ROLE:", vm.toString(verifierRole));
        console.log("DISTRIBUTOR_ROLE:", vm.toString(distributorRole));

        // Verify they are not zero
        assertTrue(adminRole != bytes32(0), "ADMIN_ROLE should not be zero");
        assertTrue(processorRole != bytes32(0), "PROCESSOR_ROLE should not be zero");
        assertTrue(verifierRole != bytes32(0), "VERIFIER_ROLE should not be zero");
    }

    function testRoleHierarchy() public {
        vm.startPrank(deployer);

        // Grant DEFAULT_ADMIN_ROLE first
        // DEFAULT_ADMIN_ROLE granted automatically in ConfigManager constructor

        // Grant various roles
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), verifier);
        coffeeToken.grantProcessorRole(verifier);

        // Verify roles
        bool hasAdmin = coffeeToken.hasRole(coffeeToken.ADMIN_ROLE(), verifier);
        bool hasProcessor = coffeeToken.hasRole(coffeeToken.PROCESSOR_ROLE(), verifier);
        bool hasVerifier = coffeeToken.hasRole(coffeeToken.VERIFIER_ROLE(), verifier);

        console.log("Verifier has ADMIN_ROLE:", hasAdmin);
        console.log("Verifier has PROCESSOR_ROLE:", hasProcessor);
        console.log("Verifier has VERIFIER_ROLE:", hasVerifier);

        vm.stopPrank();

        assertTrue(hasAdmin, "Should have ADMIN_ROLE");
        assertTrue(hasProcessor, "Should have PROCESSOR_ROLE");
        assertFalse(hasVerifier, "Should NOT have VERIFIER_ROLE yet");
    }
}
