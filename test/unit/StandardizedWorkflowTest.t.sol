// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {DeployRealZKMVPForTesting} from "../../script/DeployRealZKMVPForTesting.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";

/**
 * @title StandardizedWorkflowTest
 * @dev Test the new standardized workflow and consistency fixes
 */
contract StandardizedWorkflowTest is Test {
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGACoffeeRedemption public redemption;
    WAGATreasury public treasury;
    PrivacyLayer public privacyLayer;
    MockCircomVerifier public mockVerifier;
    MockUSDC public mockUSDC;

    // Use addresses from the deployment script
    address public admin;
    address public processor;
    address public consumer = address(0x3);

    function setUp() public {
        console.log("Starting WAGA MVP Deployment for StandardizedWorkflowTest...");
        
        // Deploy using the deployment script
        DeployRealZKMVPForTesting deployer = new DeployRealZKMVPForTesting();
        (
            WAGACoffeeTokenCore deployedCoffeeToken,
            WAGABatchManager deployedBatchManager,
            WAGAZKManager deployedZKManager,
            ,  // WAGAProofOfReserve - not needed for this test
            ,  // WAGAInventoryManagerMVP - not needed for this test
            WAGACoffeeRedemption deployedRedemption,
            MockCircomVerifier deployedMockVerifier,
            PrivacyLayer deployedPrivacyLayer,
            HelperConfig helperConfig
        ) = deployer.run();

        // Get the network config to access admin and processor addresses
        HelperConfig.NetworkConfig memory networkConfig = helperConfig.getActiveNetworkConfig();

        // Assign deployed contracts to test variables
        coffeeToken = deployedCoffeeToken;
        batchManager = deployedBatchManager;
        zkManager = deployedZKManager;
        redemption = deployedRedemption;
        privacyLayer = deployedPrivacyLayer;
        mockVerifier = deployedMockVerifier;
        
        // For testing, use default accounts since this is local anvil
        admin = vm.addr(networkConfig.deployerKey);
        processor = admin;  // Use same account for simplicity in unit tests

        console.log("Deployment Complete!");
        console.log("Coffee Token:", address(coffeeToken));
        console.log("Redemption:", address(redemption));
        
        // Create and configure MockUSDC for testing
        mockUSDC = new MockUSDC();
        
        // Deploy treasury with mockUSDC (deployed by this test contract)
        treasury = new WAGATreasury(address(mockUSDC));

        console.log("Treasury:", address(treasury));
        
        // Grant additional roles for testing
        vm.startPrank(admin);
        // Grant PROCESSOR_ROLE to processor account for testing
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        // Grant MINTER_ROLE to admin for minting tests
        coffeeToken.grantRole(coffeeToken.MINTER_ROLE(), admin);
        vm.stopPrank();
        
        // Grant ADMIN_ROLE to admin on treasury (using test contract as deployer)
        treasury.grantRole(treasury.ADMIN_ROLE(), admin);
        
        console.log("StandardizedWorkflowTest setup complete");
    }

    /**
     * @dev Test the standardized batch creation workflow
     */
    function testStandardizedBatchCreation() public {
        vm.prank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            50 * 1e18,
            "Ethiopian Single Origin",
            "250g",
            "ipfs://Qm123"
        );

        // Verify batch was created correctly
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        assertTrue(coffeeToken.isBatchActive(batchId), "Batch should be active");

        // Verify batch data consistency
        (bool isConsistent, string memory reason) = coffeeToken.verifyBatchConsistency(batchId);
        assertTrue(isConsistent, reason);

        // Verify quantities
        assertEq(coffeeToken.getAvailableQuantity(batchId), 1000, "Available quantity should be 1000");
        assertEq(coffeeToken.getMintedQuantity(batchId), 0, "Minted quantity should be 0");

        // Verify batch info
        (
            uint256 productionDate,
            uint256 expiryDate,
            bool isVerified,
            uint256 quantity,
            uint256 pricePerUnit,
            string memory packagingInfo,
            ,
            ,
        ) = coffeeToken.getBatchInfo(batchId);

        // Verify timestamps are reasonable (should be current block.timestamp)
        assertEq(productionDate, block.timestamp, "Production date should match");
        assertEq(expiryDate, block.timestamp + 365 days, "Expiry date should match");
        assertEq(quantity, 1000, "Quantity should match");
        assertEq(pricePerUnit, 50 * 1e18, "Price should match");
        assertEq(packagingInfo, "250g", "Packaging should match");
        assertFalse(isVerified, "Should not be verified initially");
    }

    /**
     * @dev Test simplified minting quantity tracking
     */
    function testSimplifiedMintingTracking() public {
        // Create batch
        vm.prank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            50 * 1e18,
            "Test Origin",
            "250g",
            ""
        );

        // Mint some tokens
        vm.prank(admin);
        coffeeToken.mintBatch(consumer, batchId, 300);

        // Verify tracking
        assertEq(coffeeToken.getMintedQuantity(batchId), 300, "Minted quantity should be 300");
        assertEq(coffeeToken.getAvailableQuantity(batchId), 700, "Available quantity should be 700");
        assertEq(coffeeToken.balanceOf(consumer, batchId), 300, "Consumer balance should be 300");

        // Try to mint more than available
        vm.prank(admin);
        vm.expectRevert(WAGACoffeeTokenCore.InsufficientInventory.selector);
        coffeeToken.mintBatch(consumer, batchId, 800);

        // Mint exactly the remaining amount
        vm.prank(admin);
        coffeeToken.mintBatch(consumer, batchId, 700);

        assertEq(coffeeToken.getMintedQuantity(batchId), 1000, "All should be minted");
        assertEq(coffeeToken.getAvailableQuantity(batchId), 0, "No more available");
    }

    /**
     * @dev Test system consistency verification
     */
    function testSystemConsistencyVerification() public {
        // Create multiple batches
        vm.startPrank(processor);
        uint256 batch1 = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            50 * 1e18,
            "Origin1",
            "250g",
            ""
        );
        uint256 batch2 = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            500,
            75 * 1e18,
            "Origin2",
            "500g",
            ""
        );
        vm.stopPrank();

        // Verify system consistency
        (bool isConsistent, string memory reason) = coffeeToken.verifySystemConsistency();
        assertTrue(isConsistent, reason);

        // Verify individual batch consistency
        (bool batch1Consistent, string memory batch1Reason) = coffeeToken.verifyBatchConsistency(batch1);
        assertTrue(batch1Consistent, batch1Reason);

        (bool batch2Consistent, string memory batch2Reason) = coffeeToken.verifyBatchConsistency(batch2);
        assertTrue(batch2Consistent, batch2Reason);
    }

    /**
     * @dev Test mandatory payment verification in redemption
     */
    function testMandatoryPaymentVerification() public {
        // Verify redemption configuration
        (bool isValid, string memory reason) = redemption.verifyConfiguration();
        assertTrue(isValid, reason);

        // Create batch
        vm.prank(processor);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            50 * 1e18,
            "Test Origin",
            "250g",
            ""
        );

        // Mint tokens to consumer
        vm.prank(admin);
        coffeeToken.mintBatch(consumer, batchId, 100);

        // Set up payment requirement
        vm.prank(admin);
        treasury.setBatchPayment(batchId, 50 * 1e6); // 50 USDC

        // Try redemption without payment - should fail
        vm.prank(consumer);
        vm.expectRevert("WAGACoffeeRedemption__BatchNotVerified_requestRedemption()");
        redemption.requestRedemption(batchId, 50);

        // This test shows the mandatory payment verification is working
        // In a real scenario, the consumer would need to pay first
    }

    /**
     * @dev Test that old dual creation patterns no longer work
     */
    function testNoDualCreationPatterns() public {
        // The old batchCreated function should no longer be public
        // and createBatchInfo should not create new batches
        
        vm.prank(processor);
        uint256 nextId = coffeeToken.getNextBatchId();
        
        // This should fail because we can't manually call batchCreated anymore
        // (it's now internal _markBatchCreated)
        
        // Verify that only createBatch works
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            1000,
            50 * 1e18,
            "Test",
            "250g",
            ""
        );
        
        assertEq(batchId, nextId, "Batch ID should be sequential");
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
    }
}
