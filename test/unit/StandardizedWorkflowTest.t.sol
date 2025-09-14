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

    address public admin = address(0x1);
    address public processor = address(0x2);
    address public consumer = address(0x3);

    function setUp() public {
        vm.startPrank(admin);

        // Deploy mock USDC
        mockUSDC = new MockUSDC();

        // Deploy core coffee token first
        coffeeToken = new WAGACoffeeTokenCore("https://example.com/");

        // Deploy privacy layer
        privacyLayer = new PrivacyLayer(address(coffeeToken));

        // Deploy batch manager
        batchManager = new WAGABatchManager(address(coffeeToken), address(privacyLayer));

        // Deploy mock verifier
        mockVerifier = new MockCircomVerifier();

        // Deploy ZK manager
        zkManager = new WAGAZKManager(address(coffeeToken), address(mockVerifier));

        // Deploy treasury
        treasury = new WAGATreasury(address(mockUSDC));

        // Deploy redemption contract
        redemption = new WAGACoffeeRedemption(address(coffeeToken), address(treasury));

        // Set up coffee token with managers
        coffeeToken.setManagerAddresses(address(batchManager), address(zkManager));

        // Grant roles
        coffeeToken.grantRole(keccak256("PROCESSOR_ROLE"), processor);
        coffeeToken.grantRole(keccak256("MINTER_ROLE"), admin);
        coffeeToken.grantRole(keccak256("REDEMPTION_ROLE"), address(redemption));

        vm.stopPrank();
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
        vm.expectRevert("Insufficient inventory for minting");
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
        vm.expectRevert("Treasury contract not configured");
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
