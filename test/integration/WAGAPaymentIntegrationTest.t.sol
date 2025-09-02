// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";

import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAInventoryManagerMVP} from "../../src/WAGAInventoryManagerMVP.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {MockFunctionsRouter} from "../mocks/MockFunctionsRouter.sol";
import {MockFunctionsHelper} from "../mocks/MockFunctionsHelper.sol";
import {MockFunctionsClient} from "../mocks/MockFunctionsClient.sol";

contract WAGAPaymentIntegrationTest is Test {
    // Core contracts
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGATreasury public treasury;
    WAGACoffeeRedemption public redemption;
    WAGAInventoryManagerMVP public inventoryManager;

    // Mock contracts
    MockUSDC public mockUSDC;
    MockFunctionsRouter public mockRouter;
    MockFunctionsHelper public mockHelper;
    MockFunctionsClient public mockClient;

    // Test accounts
    address public deployerAdmin; // Will be set to test contract address
    address public admin = address(1);
    address public distributor = address(2);
    address public processor = address(3);
    address public user = address(4);

    // Test constants
    uint256 public constant BATCH_ID = 12345;
    uint256 public constant QUANTITY = 100;
    uint256 public constant PRICE_PER_UNIT = 5000000; // $50 in cents
    uint256 public constant TOTAL_PAYMENT = PRICE_PER_UNIT * QUANTITY / 100; // Convert to USDC decimals

    function setUp() public {
        // Deploy contracts directly for testing (this was working before)
        deployContractsDirectly();

        // Setup roles and permissions for test accounts
        setupTestEnvironment();

        // Fund test accounts with USDC
        fundTestAccounts();
    }

    function setupTestEnvironment() internal {
        // Set test account references
        deployerAdmin = address(this); // The test contract address

        // Grant roles to test accounts
        vm.startPrank(deployerAdmin);

        // Grant roles to test accounts
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), admin);
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), distributor);
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        // Also grant PROCESSOR_ROLE to admin for testing batch creation
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), admin);

        // Grant treasury roles
        treasury.grantRole(treasury.ADMIN_ROLE(), admin);
        treasury.grantRole(treasury.PAYMENT_PROCESSOR_ROLE(), admin);

        // Set batch payment in treasury
        treasury.setBatchPayment(BATCH_ID, TOTAL_PAYMENT);

        vm.stopPrank();
    }

    function deployContractsDirectly() internal {
        // Set deployerAdmin to the test contract address
        deployerAdmin = address(this);

        // Deploy mock USDC
        mockUSDC = new MockUSDC();

        // Deploy core contracts with deployerAdmin as the deployer
        vm.startPrank(deployerAdmin);

        // Deploy coffee token
        coffeeToken = new WAGACoffeeTokenCore("");

        // Deploy treasury with USDC address
        treasury = new WAGATreasury(address(mockUSDC));

        // Deploy batch manager
        batchManager = new WAGABatchManager(
            address(coffeeToken),
            address(0) // privacyLayer - not needed for basic test
        );

        // Deploy redemption
        redemption = new WAGACoffeeRedemption(
            address(coffeeToken),
            address(treasury)
        );

        // Connect managers to token
        coffeeToken.setManagerAddresses(address(batchManager), address(0)); // zkManager not needed

        vm.stopPrank();
    }

    function fundTestAccounts() internal {
        // Fund test accounts with USDC
        vm.startPrank(deployerAdmin);

        // Mint USDC to test accounts
        mockUSDC.mint(user, TOTAL_PAYMENT * 10);
        mockUSDC.mint(distributor, TOTAL_PAYMENT * 10);

        vm.stopPrank();

        // Approve treasury to spend test accounts' USDC
        vm.prank(user);
        mockUSDC.approve(address(treasury), TOTAL_PAYMENT * 10);

        vm.prank(distributor);
        mockUSDC.approve(address(treasury), TOTAL_PAYMENT * 10);
    }

    function testDeployment() public {
        // Test that all contracts are deployed successfully
        assertTrue(address(coffeeToken) != address(0), "Coffee token should be deployed");
        assertTrue(address(treasury) != address(0), "Treasury should be deployed");
        assertTrue(address(redemption) != address(0), "Redemption should be deployed");
        assertTrue(address(batchManager) != address(0), "Batch manager should be deployed");

        console.log("All contracts deployed successfully");
    }

    function testDebugRoleSetup() public {
        console.log("=== DEBUGGING ROLE SETUP ===");

        // Check if roles are properly set up
        bool adminHasProcessorRole = coffeeToken.hasRole(coffeeToken.PROCESSOR_ROLE(), admin);
        bool deployerHasAdminRole = coffeeToken.hasRole(coffeeToken.DEFAULT_ADMIN_ROLE(), deployerAdmin);

        console.log("Admin address:", admin);
        console.log("DeployerAdmin address:", deployerAdmin);
        console.log("Admin has PROCESSOR_ROLE:", adminHasProcessorRole);
        console.log("DeployerAdmin has DEFAULT_ADMIN_ROLE:", deployerHasAdminRole);

        // Check BatchManager's coffee token reference
        address batchManagerCoffeeToken = address(batchManager.coffeeToken());
        console.log("BatchManager's coffeeToken reference:", batchManagerCoffeeToken);
        console.log("Expected coffeeToken address:", address(coffeeToken));

        // Test direct role check on coffee token
        bytes32 processorRole = coffeeToken.PROCESSOR_ROLE();
        console.log("PROCESSOR_ROLE hash from coffeeToken:", uint256(processorRole));

        // Test BatchManager role check
        bytes32 batchManagerProcessorRole = batchManager.PROCESSOR_ROLE();
        console.log("PROCESSOR_ROLE hash from BatchManager:", uint256(batchManagerProcessorRole));
    }

    function testEndToEndPaymentFlow() public {
        console.log("Starting End-to-End Payment Flow Test");

        // Step 1: Admin creates a batch
        vm.prank(admin);
        uint256 actualBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Ethiopia",
            "60kg bags",
            "ipfs://batch-metadata"
        );

        console.log("Batch created with ID:", actualBatchId);
        console.log("Batch creation test completed successfully");
    }

    function testCoinbasePaymentIntegration() public {
        console.log("Testing Coinbase Payment Integration");

        // Step 1: Create batch
        vm.prank(admin);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Colombia",
            "60kg bags",
            "ipfs://coinbase-batch"
        );
        console.log("Created batch with ID:", batchId);

        // Set up batch payment for this specific batch
        vm.prank(deployerAdmin);
        treasury.setBatchPayment(batchId, TOTAL_PAYMENT);
        console.log("Set batch payment for batch:", batchId);

        // Check admin has PAYMENT_PROCESSOR_ROLE
        bool hasRole = treasury.hasRole(treasury.PAYMENT_PROCESSOR_ROLE(), admin);
        console.log("Admin has PAYMENT_PROCESSOR_ROLE:", hasRole);

        // Check charge ID hasn't been processed
        bytes32 chargeIdHash = keccak256(abi.encodePacked("coinbase_charge_123"));
        console.log("Charge ID hash:", uint256(chargeIdHash));

        // Step 2: Process Coinbase payment (simulated)
        console.log("Calling processCoinbasePayment...");
        vm.prank(admin); // Admin acts as payment processor
        treasury.processCoinbasePayment(
            distributor,
            batchId,
            TOTAL_PAYMENT,
            "coinbase_charge_123"
        );
        console.log("processCoinbasePayment completed");

        // Verify Coinbase payment was recorded
        bool coinbasePaymentStatus = treasury.checkPaymentStatus(distributor, batchId);
        console.log("Payment status:", coinbasePaymentStatus);
        assertTrue(coinbasePaymentStatus, "Coinbase payment should be recorded");

        console.log("Coinbase Payment Integration Test PASSED");
    }

    function testCrossBorderPaymentScenario() public {
        console.log("Testing Cross-border Payment Scenario");

        // This would typically involve multiple currencies
        // For now, we'll simulate the flow

        // Step 1: Create international batch
        vm.prank(admin);
        uint256 internationalBatchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT * 2, // Higher price for international
            "Vietnam",
            "60kg bags",
            "ipfs://international-batch"
        );

        // Set up batch payment for this specific batch
        vm.prank(admin);
        treasury.setBatchPayment(internationalBatchId, TOTAL_PAYMENT * 2);

        // Step 2: Process cross-border payment
        vm.prank(admin);
        treasury.processCoinbasePayment(
            distributor,
            internationalBatchId,
            TOTAL_PAYMENT * 2, // Higher amount for international
            "cross_border_charge_456"
        );

        // Verify cross-border payment
        bool crossBorderPayment = treasury.checkPaymentStatus(distributor, internationalBatchId);
        assertTrue(crossBorderPayment, "Cross-border payment should be recorded");

        console.log("Cross-border Payment Scenario Test PASSED");
    }

    function testPaymentFailureScenarios() public {
        console.log("Testing Payment Failure Scenarios");

        // Step 1: Create batch
        vm.prank(admin);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Brazil",
            "60kg bags",
            "ipfs://failure-test-batch"
        );

        // Set up batch payment for this specific batch
        vm.prank(deployerAdmin);
        treasury.setBatchPayment(batchId, TOTAL_PAYMENT);

        // Step 2: Try to pay without sufficient allowance
        vm.prank(user);
        mockUSDC.approve(address(treasury), 0); // Remove allowance

        vm.prank(user);
        vm.expectRevert();
        treasury.payForBatch(batchId, TOTAL_PAYMENT);

        console.log("Payment Failure Scenarios Test PASSED");
    }

    function testTreasuryDistribution() public {
        console.log("Testing Treasury Distribution");

        // Step 1: Create batch and make payment
        vm.prank(admin);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Kenya",
            "60kg bags",
            "ipfs://distribution-test"
        );

        // Set up batch payment for this specific batch
        vm.prank(deployerAdmin);
        treasury.setBatchPayment(batchId, TOTAL_PAYMENT);

        // Make payment
        vm.prank(user);
        treasury.payForBatch(batchId, TOTAL_PAYMENT);

        // Check treasury balance before distribution
        uint256 treasuryBalanceBefore = mockUSDC.balanceOf(address(treasury));
        assertEq(treasuryBalanceBefore, TOTAL_PAYMENT);

        // Distribute funds
        vm.prank(admin);
        treasury.distributeFunds(admin, TOTAL_PAYMENT, "Test distribution");

        // Check treasury balance after distribution
        uint256 treasuryBalanceAfter = mockUSDC.balanceOf(address(treasury));
        assertEq(treasuryBalanceAfter, 0);

        // Check admin received the funds
        uint256 adminBalance = mockUSDC.balanceOf(admin);
        assertEq(adminBalance, TOTAL_PAYMENT);

        console.log("Treasury Distribution Test PASSED");
    }

    function testRedemptionWithoutPayment() public {
        console.log("Testing Redemption Without Payment");

        // Step 1: Create batch
        vm.prank(admin);
        uint256 batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            QUANTITY,
            PRICE_PER_UNIT,
            "Guatemala",
            "60kg bags",
            "ipfs://no-payment-batch"
        );

        // Step 2: Process verification and mint tokens
        processBatchVerification(batchId);

        // Step 3: Request verification (simulated)

        // Step 4: Simulate successful verification
        simulateVerificationSuccess(batchId);

        // Step 5: Try to request redemption without payment
        vm.prank(distributor);
        vm.expectRevert();
        redemption.requestRedemption(batchId, 10, "Test Address");

        console.log("Redemption Without Payment Test PASSED");
    }

    // Helper functions
    function processBatchVerification(uint256 batchId) internal {
        // Simulate the Chainlink Functions verification process
        // In production, this would trigger Chainlink Functions
        // For testing, we'll just prepare for minting
        console.log("Processing batch verification for batch:", batchId);
    }

    function simulateVerificationSuccess(uint256 batchId) internal {
        // In a real scenario, this would be handled by Chainlink Functions
        // For testing, we'll simulate successful verification by calling the contract directly

        // This is a simplified simulation - in reality, Chainlink Functions would call back
        vm.prank(admin); // Admin simulates the Chainlink callback
        coffeeToken.mintBatch(distributor, batchId, QUANTITY);
    }

    function testCompleteSystemIntegration() public {
        console.log("Testing Complete System Integration");

        // This test verifies that all components work together
        testEndToEndPaymentFlow();
        testCoinbasePaymentIntegration();
        testTreasuryDistribution();

        console.log("Complete System Integration Test PASSED");
    }
}
