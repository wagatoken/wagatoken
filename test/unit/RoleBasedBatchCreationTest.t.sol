// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "../../src/WAGAConfigManager.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {CircomVerifier} from "../../src/CircomVerifier.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACDPIntegration} from "../../src/WAGACDPIntegration.sol";
import {WAGAECXPriceOracle} from "../../src/WAGAECXPriceOracle.sol";

/**
 * @title RoleBasedBatchCreationTest
 * @dev Test the new role-based batch creation functionality
 * @notice Ensures cooperatives, roasters, and processors can all create batches
 */
contract RoleBasedBatchCreationTest is Test {
    DeployRealZKMVP deployer;
    HelperConfig helperConfig;
    
    WAGACoffeeTokenCore coffeeToken;
    WAGABatchManager batchManager;
    WAGAZKManager zkManager;
    WAGAProofOfReserve proofOfReserve;
    WAGAInventoryManagerMVP inventoryManager;
    WAGACoffeeRedemption public redemption;
    CircomVerifier public circomVerifier;
    PrivacyLayer public privacyLayer;
    
    // Additional contracts from deployment
    WAGACDPIntegration public cdpIntegration;
    WAGAECXPriceOracle public ecxOracle;

    // Test addresses - using makeAddr pattern
    address admin;
    address testUser = makeAddr("testUser");
    
    // Test constants
    uint256 constant PRODUCTION_DATE = 1700000000; // Nov 2023
    uint256 constant EXPIRY_DATE = 1731536000; // Nov 2024
    uint256 constant QUANTITY = 100;
    uint256 constant PRICE_PER_UNIT = 250; // $2.50
    string constant ORIGIN = "Ethiopia, Yirgacheffe";
    string constant PACKAGING_INFO = "60kg bags";
    string constant METADATA_URI = "ipfs://test-metadata-hash";

    function setUp() public {
        deployer = new DeployRealZKMVP();
        
        // Deploy the contracts
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            , // treasury
            redemption,
            cdpIntegration, // Now included in deployment
            proofOfReserve,
            inventoryManager,
            , // ethiopianCompliance
            ecxOracle, // Now included in deployment
            circomVerifier,
            helperConfig
        ) = deployer.run();
        
        // Get admin address from deployer key (already has all admin roles from deployment)
        HelperConfig.NetworkConfig memory config = helperConfig.getActiveNetworkConfig();
        admin = vm.addr(config.deployerKey);
        
        // Note: testUser is created with makeAddr and has no roles initially
    }
    
    function testCooperativeCanCreateBatch() public {
        // Grant cooperative role to testUser
        vm.prank(admin);
        // COOPERATIVE_ROLE is granted automatically when registering a seller as COOPERATIVE type
        coffeeToken.registerSeller(testUser, WAGAConfigManager.SellerType.COOPERATIVE, "Test Cooperative", "REG-001", bytes11("CBETETAAXXX"));
        
        // Cooperative creates batch
        vm.prank(testUser);
        uint256 batchId = coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            ORIGIN,
            PACKAGING_INFO,
            METADATA_URI
        );
        
        // Verify batch was created
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");
    }
    
    function testRoasterCanCreateBatch() public {
        // Grant roaster role to testUser
        vm.prank(admin);
        // ROASTER_ROLE is granted automatically when registering a seller as ROASTER type
        coffeeToken.registerSeller(testUser, WAGAConfigManager.SellerType.ROASTER, "Test Roaster", "REG-002", bytes11("CBETETAAXXX"));
        
        // Roaster creates batch
        vm.prank(testUser);
        uint256 batchId = coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            "Colombia, Huila",
            PACKAGING_INFO,
            METADATA_URI
        );
        
        // Verify batch was created
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");
    }
    
    function testProcessorCanCreateBatch() public {
        // Grant processor role to testUser
        vm.prank(admin);
        coffeeToken.grantProcessorRole(testUser);
        
        // Processor creates batch
        vm.prank(testUser);
        uint256 batchId = coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            "Brazil, Cerrado",
            PACKAGING_INFO,
            METADATA_URI
        );
        
        // Verify batch was created
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");
    }
    
    function testAdminCanCreateBatch() public {
        // Admin creates batch (already has admin role)
        vm.prank(admin);
        uint256 batchId = coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            "Guatemala, Antigua",
            PACKAGING_INFO,
            METADATA_URI
        );
        
        // Verify batch was created
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");
    }
    
    function testUnauthorizedUserCannotCreateBatch() public {
        // Unauthorized user tries to create batch (should fail)
        vm.expectRevert(WAGACoffeeTokenCore.CallerNotAuthorized.selector);
        vm.prank(testUser); // testUser has no role
        coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            "Kenya, Nyeri",
            PACKAGING_INFO,
            METADATA_URI
        );
    }
    
    function testRevokedRoleCannotCreateBatch() public {
        // Grant cooperative role to testUser
        vm.prank(admin);
        // COOPERATIVE_ROLE is granted automatically when registering a seller as COOPERATIVE type
        coffeeToken.registerSeller(testUser, WAGAConfigManager.SellerType.COOPERATIVE, "Test Cooperative", "REG-001", bytes11("CBETETAAXXX"));
        
        // Verify user can create batch
        vm.prank(testUser);
        uint256 batchId1 = coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            "Peru, Cajamarca",
            PACKAGING_INFO,
            METADATA_URI
        );
        assertTrue(coffeeToken.isBatchCreated(batchId1), "First batch should be created");
        
        // Revoke role
        vm.prank(admin);
        coffeeToken.revokeRole(keccak256("COOPERATIVE_ROLE"), testUser);
        
        // Try to create batch again (should fail)
        vm.expectRevert(WAGACoffeeTokenCore.CallerNotAuthorized.selector);
        vm.prank(testUser);
        coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            "Honduras, Copan",
            PACKAGING_INFO,
            METADATA_URI
        );
    }
    
    function testMultipleRolesCanCreateBatches() public {
        // Grant multiple roles to testUser
        vm.startPrank(admin);
        // COOPERATIVE_ROLE is granted automatically when registering a seller as COOPERATIVE type
        coffeeToken.registerSeller(testUser, WAGAConfigManager.SellerType.COOPERATIVE, "Test Cooperative", "REG-001", bytes11("CBETETAAXXX"));
        // ROASTER_ROLE is granted automatically when registering a seller as ROASTER type
        coffeeToken.registerSeller(testUser, WAGAConfigManager.SellerType.ROASTER, "Test Roaster", "REG-002", bytes11("CBETETAAXXX"));
        vm.stopPrank();
        
        // User with multiple roles can create batch
        vm.prank(testUser);
        uint256 batchId = coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            QUANTITY,
            PRICE_PER_UNIT,
            "Jamaica, Blue Mountain",
            PACKAGING_INFO,
            METADATA_URI
        );
        
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");
    }
}
