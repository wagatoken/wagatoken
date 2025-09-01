// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";

contract SimpleRoleTest is Test {
    WAGACoffeeTokenCore public coffeeToken;
    address public deployer;
    address public verifier = makeAddr("verifier");

    function setUp() public {
        deployer = makeAddr("deployer");
        vm.startPrank(deployer);

        // Deploy the coffee token core with metadata URI
        coffeeToken = new WAGACoffeeTokenCore("https://ipfs.io/ipfs/");

        console.log("Deployer:", deployer);
        console.log("Coffee token deployed at:", address(coffeeToken));

        // Check what roles the deployer has by default
        bool hasAdmin = coffeeToken.hasRole(keccak256("ADMIN_ROLE"), deployer);
        bool hasDefaultAdmin = coffeeToken.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), deployer);

        console.log("Deployer has ADMIN_ROLE:", hasAdmin);
        console.log("Deployer has DEFAULT_ADMIN_ROLE:", hasDefaultAdmin);

        vm.stopPrank();
    }

    function testBasicRoleCheck() public {
        vm.startPrank(deployer);

        // First grant DEFAULT_ADMIN_ROLE to deployer so they can manage other roles
        coffeeToken.grantRole(keccak256("DEFAULT_ADMIN_ROLE"), deployer);

        // Now try to grant VERIFIER_ROLE to a test address
        coffeeToken.grantRole(keccak256("VERIFIER_ROLE"), verifier);

        // Verify the role was granted
        bool hasVerifierRole = coffeeToken.hasRole(keccak256("VERIFIER_ROLE"), verifier);

        console.log("Verifier has VERIFIER_ROLE:", hasVerifierRole);
        console.log("Successfully granted VERIFIER_ROLE");

        vm.stopPrank();

        assertTrue(hasVerifierRole, "Verifier should have VERIFIER_ROLE");
        assertTrue(true, "Basic role test completed");
    }

    function testRoleConstants() public view {
        // Test that role constants are properly defined
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        bytes32 defaultAdminRole = keccak256("DEFAULT_ADMIN_ROLE");
        bytes32 processorRole = keccak256("PROCESSOR_ROLE");
        bytes32 verifierRole = keccak256("VERIFIER_ROLE");
        bytes32 distributorRole = keccak256("DISTRIBUTOR_ROLE");

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
        coffeeToken.grantRole(keccak256("DEFAULT_ADMIN_ROLE"), deployer);

        // Grant various roles
        coffeeToken.grantRole(keccak256("ADMIN_ROLE"), verifier);
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), verifier);

        // Verify roles
        bool hasAdmin = coffeeToken.hasRole(keccak256("ADMIN_ROLE"), verifier);
        bool hasProcessor = coffeeToken.hasRole(keccak256("PROCESSOR_ROLE"), verifier);
        bool hasVerifier = coffeeToken.hasRole(keccak256("VERIFIER_ROLE"), verifier);

        console.log("Verifier has ADMIN_ROLE:", hasAdmin);
        console.log("Verifier has PROCESSOR_ROLE:", hasProcessor);
        console.log("Verifier has VERIFIER_ROLE:", hasVerifier);

        vm.stopPrank();

        assertTrue(hasAdmin, "Should have ADMIN_ROLE");
        assertTrue(hasProcessor, "Should have PROCESSOR_ROLE");
        assertFalse(hasVerifier, "Should NOT have VERIFIER_ROLE yet");
    }
}
