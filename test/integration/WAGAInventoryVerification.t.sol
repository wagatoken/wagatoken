// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WAGACoffeeToken} from "../../src/WAGACoffeeToken.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManager2} from "../../src/WAGAInventoryManager2.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {MockFunctionsRouter} from "../mocks/MockFunctionsRouter.sol";
import {MockFunctionsHelper} from "../mocks/MockFunctionsHelper.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {IPrivacyLayer} from "../../src/ZKIntegration/Interfaces/IPrivacyLayer.sol";

/**
 * @title WAGAInventoryVerification
 * @dev Comprehensive tests for inventory verification system using Chainlink Functions
 * @dev Tests both automated upkeep and manual verification flows
 */
contract WAGAInventoryVerification is Test {
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    WAGACoffeeToken public coffeeToken;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManager2 public inventoryManager;
    WAGACoffeeRedemption public redemption;
    MockFunctionsRouter public mockRouter;
    MockFunctionsHelper public mockHelper;
    HelperConfig public helperConfig;
    HelperConfig.NetworkConfig public config;

    // Test addresses
    address public admin = address(0x1);
    address public processor = address(0x2);
    address public distributor = address(0x3);
    address public verifier = address(0x4);

    // Test data
    uint256 public batchId = 1000;
    uint256 public productionDate = block.timestamp;
    uint256 public expiryDate = block.timestamp + 365 days;
    uint256 public quantity = 1000;
    uint256 public pricePerUnit = 1000000000000000000; // 1 ETH in wei
    string public packagingInfo = "250g";
    string public metadataHash = "QmTestMetadata123";

    // Chainlink Functions source code for testing
    string public constant INVENTORY_VERIFICATION_SOURCE = 
        'const batchId = args[0]; const verificationType = args[1]; const proofData = args[2]; const verificationKey = args[3]; const externalData = args[4]; console.log("Privacy-enhanced verification for batch:", batchId); console.log("Verification type:", verificationType); console.log("Proof data length:", proofData ? proofData.length : 0); try { let verificationResult = false; let verificationDetails = {}; switch (verificationType) { case "zk_proof": verificationResult = await verifyZKProof(batchId, proofData, verificationKey, externalData); break; case "encrypted_data": verificationResult = await verifyEncryptedData(batchId, proofData, verificationKey); break; case "compliance": verificationResult = await verifyCompliance(batchId, proofData, externalData); break; case "inventory": verificationResult = await verifyInventory(batchId, proofData, externalData); break; default: throw new Error(`Unknown verification type: ${verificationType}`); } return Functions.encodeString(verificationResult.toString()); } catch (error) { console.error("Privacy-enhanced verification error:", error); throw new Error(`Verification failed: ${error.message}`); } async function verifyInventory(batchId, inventoryProof, inventoryData) { console.log("Verifying inventory for batch:", batchId); try { const response = await Functions.makeHttpRequest({ url: `http://localhost:3001/api/inventory/${batchId}`, method: "GET", headers: { "Content-Type": "application/json" } }); if (response.error) { throw new Error(`API Error: ${response.error}`); } const inventoryData = response.data; const isValid = await verifyInventoryProof(inventoryProof, inventoryData); console.log("Inventory verification result:", isValid); return isValid; } catch (error) { console.error("Inventory verification error:", error); return false; } } async function verifyInventoryProof(inventoryProof, inventoryData) { try { if (!inventoryProof || inventoryProof.length === 0) { return false; } const isValid = await checkInventoryValidity(inventoryProof, inventoryData); return isValid; } catch (error) { console.error("Inventory proof verification error:", error); return false; } } async function checkInventoryValidity(inventoryProof, inventoryData) { return inventoryProof && inventoryData; }';

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(
        uint256 indexed batchId,
        address indexed creator,
        uint256 quantity,
        uint256 pricePerUnit
    );

    event InventoryVerificationRequested(
        bytes32 indexed requestId,
        uint256 indexed batchId
    );

    event UpkeepPerformed(uint8 upkeepType, uint256[] batchIds);
    event LowInventoryWarning(uint256 indexed batchId, uint256 currentQuantity);
    event LongStorageWarning(uint256 indexed batchId, uint256 daysInStorage);

    /* -------------------------------------------------------------------------- */
    /*                                 Setup                                      */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        // Deploy HelperConfig which will deploy MockFunctionsRouter for local chain
        helperConfig = new HelperConfig();
        config = helperConfig.getOrCreateAnvilConfig();
        
        // Get the mock router from the config
        mockRouter = MockFunctionsRouter(config.router);
        
        // Deploy the helper
        mockHelper = new MockFunctionsHelper(address(mockRouter));

        // Deploy WAGA contracts
        deployWAGAContracts();

        // Set up test roles
        setupTestRoles();

        // Set up source code for testing
        setupSourceCode();

        console.log("Test setup complete");
        console.log("MockFunctionsRouter deployed at:", address(mockRouter));
        console.log("WAGACoffeeToken deployed at:", address(coffeeToken));
        console.log("WAGAProofOfReserve deployed at:", address(proofOfReserve));
        console.log("WAGAInventoryManager2 deployed at:", address(inventoryManager));
    }

    /**
     * @dev Deploy all WAGA contracts
     */
    function deployWAGAContracts() internal {
        // Deploy WAGACoffeeToken
        coffeeToken = new WAGACoffeeToken();
        
        // Deploy WAGAProofOfReserve
        proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            config.subscriptionId,
            config.router,
            config.donId
        );
        
        // Deploy WAGAInventoryManager2
        inventoryManager = new WAGAInventoryManager2(
            address(coffeeToken),
            address(proofOfReserve)
        );
        
        // Deploy WAGACoffeeRedemption
        redemption = new WAGACoffeeRedemption(address(coffeeToken));
    }

    /**
     * @dev Set up test roles and permissions
     */
    function setupTestRoles() internal {
        // Grant roles to admin
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), admin);
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), distributor);
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), verifier);
        coffeeToken.grantRole(coffeeToken.REDEMPTION_ROLE(), address(redemption));

        // Grant roles to inventory manager
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), address(inventoryManager));
        
        // Grant roles to proof of reserve
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), address(proofOfReserve));
    }

    /**
     * @dev Set up source code for testing
     */
    function setupSourceCode() internal {
        // Set default source code in inventory manager
        inventoryManager.setDefaultSourceCode(INVENTORY_VERIFICATION_SOURCE);
        
        // Set batch-specific source code
        inventoryManager.setBatchSourceCode(batchId, INVENTORY_VERIFICATION_SOURCE);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Test Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Test complete inventory verification flow
     */
    function testCompleteInventoryVerificationFlow() public {
        console.log("Testing complete inventory verification flow...");
        
        // 1. Create batch
        createTestBatch();
        
        // 2. Request batch verification
        bytes32 requestId = requestBatchVerification();
        
        // 3. Simulate successful verification
        simulateSuccessfulVerification(requestId);
        
        // 4. Verify batch is now verified
        (,,,,,,,, bool isVerified,) = coffeeToken.getBatchInfoWithPrivacy(batchId, address(this));
        assertTrue(isVerified, "Batch should be verified");
        
        console.log("Complete inventory verification flow test passed");
    }

    /**
     * @dev Test automated upkeep for inventory verification
     */
    function testAutomatedUpkeepInventoryVerification() public {
        console.log("Testing automated upkeep for inventory verification...");
        
        // 1. Create batch
        createTestBatch();
        
        // 2. Set up inventory manager for automated verification
        setupAutomatedVerification();
        
        // 3. Trigger upkeep check
        (bool upkeepNeeded, bytes memory performData) = inventoryManager.checkUpkeep("");
        
        // 4. Verify upkeep is needed
        assertTrue(upkeepNeeded, "Upkeep should be needed");
        
        // 5. Perform upkeep
        inventoryManager.performUpkeep(performData);
        
        // 6. Verify batch verification was requested
        // Note: In real scenario, this would trigger Chainlink Functions
        console.log("Automated upkeep inventory verification test passed");
    }

    /**
     * @dev Test low inventory warnings
     */
    function testLowInventoryWarnings() public {
        console.log("Testing low inventory warnings...");
        
        // 1. Create batch with low quantity
        createTestBatchWithLowQuantity();
        
        // 2. Set low inventory threshold
        inventoryManager.updateLowInventoryThreshold(50);
        
        // 3. Trigger upkeep check
        (bool upkeepNeeded, bytes memory performData) = inventoryManager.checkUpkeep("");
        
        // 4. Verify upkeep is needed for low inventory
        assertTrue(upkeepNeeded, "Upkeep should be needed for low inventory");
        
        // 5. Perform upkeep and expect low inventory warning
        vm.expectEmit(true, true, false, true);
        emit LowInventoryWarning(batchId, 25);
        inventoryManager.performUpkeep(performData);
        
        console.log("Low inventory warnings test passed");
    }

    /**
     * @dev Test expiry warnings
     */
    function testExpiryWarnings() public {
        console.log("Testing expiry warnings...");
        
        // 1. Create batch with near expiry
        createTestBatchWithNearExpiry();
        
        // 2. Set expiry warning threshold
        inventoryManager.updateExpiryWarningThreshold(30 days);
        
        // 3. Trigger upkeep check
        (bool upkeepNeeded, bytes memory performData) = inventoryManager.checkUpkeep("");
        
        // 4. Verify upkeep is needed for expiry
        assertTrue(upkeepNeeded, "Upkeep should be needed for expiry");
        
        // 5. Perform upkeep
        inventoryManager.performUpkeep(performData);
        
        console.log("Expiry warnings test passed");
    }

    /**
     * @dev Test long storage warnings
     */
    function testLongStorageWarnings() public {
        console.log("Testing long storage warnings...");
        
        // 1. Create batch with old creation date
        createTestBatchWithOldCreation();
        
        // 2. Set long storage threshold
        inventoryManager.updateLongStorageThreshold(180 days);
        
        // 3. Trigger upkeep check
        (bool upkeepNeeded, bytes memory performData) = inventoryManager.checkUpkeep("");
        
        // 4. Verify upkeep is needed for long storage
        assertTrue(upkeepNeeded, "Upkeep should be needed for long storage");
        
        // 5. Perform upkeep and expect long storage warning
        vm.expectEmit(true, true, false, true);
        emit LongStorageWarning(batchId, 200);
        inventoryManager.performUpkeep(performData);
        
        console.log("Long storage warnings test passed");
    }

    /**
     * @dev Test batch data caching
     */
    function testBatchDataCaching() public {
        console.log("Testing batch data caching...");
        
        // 1. Create batch
        createTestBatch();
        
        // 2. Trigger checkUpkeep to populate cache
        inventoryManager.checkUpkeep("");
        
        // 3. Get cached data
        (
            uint256 expiryDate,
            uint256 lastVerified,
            uint256 quantity,
            uint256 creationDate,
            bool isActive,
            uint256 cacheTimestamp
        ) = inventoryManager.getCachedBatchData(batchId);
        
        // 4. Verify cached data
        assertEq(expiryDate, this.expiryDate(), "Cached expiry date should match");
        assertEq(quantity, this.quantity(), "Cached quantity should match");
        assertTrue(isActive, "Cached active status should be true");
        assertGt(cacheTimestamp, 0, "Cache timestamp should be set");
        
        console.log("Batch data caching test passed");
    }

    /**
     * @dev Test gas optimization in checkUpkeep
     */
    function testGasOptimizationInCheckUpkeep() public {
        console.log("Testing gas optimization in checkUpkeep...");
        
        // 1. Create multiple batches
        createMultipleTestBatches(10);
        
        // 2. Measure gas usage for checkUpkeep
        uint256 gasBefore = gasleft();
        (bool upkeepNeeded, bytes memory performData) = inventoryManager.checkUpkeep("");
        uint256 gasUsed = gasBefore - gasleft();
        
        // 3. Verify gas usage is reasonable (should be under 500K for 10 batches)
        assertLt(gasUsed, 500000, "Gas usage should be optimized");
        console.log("Gas used for checkUpkeep:", gasUsed);
        
        console.log("Gas optimization test passed");
    }

    /**
     * @dev Test source code validation
     */
    function testSourceCodeValidation() public {
        console.log("Testing source code validation...");
        
        // 1. Try to set empty source code (should fail)
        vm.expectRevert(WAGAInventoryManager2.WAGAInventoryManager__EmptySourceCode_performVerificationCheck.selector);
        inventoryManager.setDefaultSourceCode("");
        
        // 2. Try to set empty batch-specific source code (should fail)
        vm.expectRevert(WAGAInventoryManager2.WAGAInventoryManager__EmptySourceCode_performVerificationCheck.selector);
        inventoryManager.setBatchSourceCode(batchId, "");
        
        // 3. Set valid source code (should succeed)
        inventoryManager.setDefaultSourceCode(INVENTORY_VERIFICATION_SOURCE);
        
        // 4. Verify source code is set
        string memory retrievedSource = inventoryManager.getSourceCodeForBatch(batchId);
        assertEq(retrievedSource, INVENTORY_VERIFICATION_SOURCE, "Source code should be set correctly");
        
        console.log("Source code validation test passed");
    }

    /**
     * @dev Test inventory synchronization
     */
    function testInventorySynchronization() public {
        console.log("Testing inventory synchronization...");
        
        // 1. Create batch
        createTestBatch();
        
        // 2. Request batch (distributor wants 500 units)
        vm.prank(distributor);
        coffeeToken.requestBatch(batchId, 500, "Test request");
        
        // 3. Mint tokens for the request
        vm.prank(admin);
        coffeeToken.mintBatch(distributor, batchId, 500);
        
        // 4. Get inventory info
        (uint256 totalQuantity, uint256 mintedQuantity, uint256 availableQuantity) = coffeeToken.getBatchInventoryInfo(batchId);
        
        // 5. Verify inventory synchronization
        assertEq(totalQuantity, quantity, "Total quantity should match");
        assertEq(mintedQuantity, 500, "Minted quantity should be 500");
        assertEq(availableQuantity, 500, "Available quantity should be 500");
        
        // 6. Test inventory verification
        bool isSynchronized = coffeeToken.verifyInventorySynchronization(batchId, 500);
        assertTrue(isSynchronized, "Inventory should be synchronized");
        
        console.log("Inventory synchronization test passed");
    }

    /* -------------------------------------------------------------------------- */
    /*                              Helper Functions                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Create a test batch
     */
    function createTestBatch() internal {
        vm.prank(admin);
        coffeeToken.createBatch(
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            packagingInfo,
            metadataHash,
            IPrivacyLayer.PrivacyConfig({
                privacyLevel: IPrivacyLayer.PrivacyLevel.Public,
                priceVisibility: true,
                qualityVisibility: true,
                supplyChainVisibility: true
            })
        );
    }

    /**
     * @dev Create a test batch with low quantity
     */
    function createTestBatchWithLowQuantity() internal {
        vm.prank(admin);
        coffeeToken.createBatch(
            productionDate,
            expiryDate,
            25, // Low quantity
            pricePerUnit,
            packagingInfo,
            metadataHash,
            IPrivacyLayer.PrivacyConfig({
                privacyLevel: IPrivacyLayer.PrivacyLevel.Public,
                priceVisibility: true,
                qualityVisibility: true,
                supplyChainVisibility: true
            })
        );
    }

    /**
     * @dev Create a test batch with near expiry
     */
    function createTestBatchWithNearExpiry() internal {
        vm.prank(admin);
        coffeeToken.createBatch(
            productionDate,
            block.timestamp + 20 days, // Near expiry
            quantity,
            pricePerUnit,
            packagingInfo,
            metadataHash,
            IPrivacyLayer.PrivacyConfig({
                privacyLevel: IPrivacyLayer.PrivacyLevel.Public,
                priceVisibility: true,
                qualityVisibility: true,
                supplyChainVisibility: true
            })
        );
    }

    /**
     * @dev Create a test batch with old creation date
     */
    function createTestBatchWithOldCreation() internal {
        vm.prank(admin);
        coffeeToken.createBatch(
            block.timestamp - 200 days, // Old creation date
            expiryDate,
            quantity,
            pricePerUnit,
            packagingInfo,
            metadataHash,
            IPrivacyLayer.PrivacyConfig({
                privacyLevel: IPrivacyLayer.PrivacyLevel.Public,
                priceVisibility: true,
                qualityVisibility: true,
                supplyChainVisibility: true
            })
        );
    }

    /**
     * @dev Create multiple test batches
     */
    function createMultipleTestBatches(uint256 count) internal {
        for (uint256 i = 0; i < count; i++) {
            vm.prank(admin);
            coffeeToken.createBatch(
                productionDate,
                expiryDate,
                quantity,
                pricePerUnit,
                packagingInfo,
                string(abi.encodePacked("QmTestMetadata", vm.toString(i))),
                IPrivacyLayer.PrivacyConfig({
                    privacyLevel: IPrivacyLayer.PrivacyLevel.Public,
                    priceVisibility: true,
                    qualityVisibility: true,
                    supplyChainVisibility: true
                })
            );
        }
    }

    /**
     * @dev Request batch verification
     */
    function requestBatchVerification() internal returns (bytes32) {
        vm.prank(verifier);
        return proofOfReserve.requestReserveVerification(batchId);
    }

    /**
     * @dev Simulate successful verification
     */
    function simulateSuccessfulVerification(bytes32 requestId) internal {
        mockHelper.simulateSuccessfulVerification(
            requestId,
            address(proofOfReserve),
            quantity,
            pricePerUnit
        );
    }

    /**
     * @dev Set up automated verification
     */
    function setupAutomatedVerification() internal {
        // Set batch audit interval to trigger verification
        inventoryManager.updateBatchAuditInterval(1 days);
        
        // Set interval to trigger upkeep
        inventoryManager.setBatchAuditInterval(1 hours);
    }

    /**
     * @dev Test configuration getters
     */
    function testConfigurationGetters() public {
        console.log("Testing configuration getters...");
        
        // Test batch audit interval
        uint256 auditInterval = inventoryManager.s_batchAuditInterval();
        assertEq(auditInterval, 7 days, "Default audit interval should be 7 days");
        
        // Test expiry warning threshold
        uint256 expiryThreshold = inventoryManager.s_expiryWarningThreshold();
        assertEq(expiryThreshold, 60 days, "Default expiry threshold should be 60 days");
        
        // Test low inventory threshold
        uint256 lowInventoryThreshold = inventoryManager.s_lowInventoryThreshold();
        assertEq(lowInventoryThreshold, 10, "Default low inventory threshold should be 10");
        
        // Test long storage threshold
        uint256 longStorageThreshold = inventoryManager.s_longStorageThreshold();
        assertEq(longStorageThreshold, 180 days, "Default long storage threshold should be 180 days");
        
        // Test max batches per upkeep
        uint256 maxBatches = inventoryManager.s_maxBatchesPerUpkeep();
        assertEq(maxBatches, 50, "Default max batches should be 50");
        
        console.log("Configuration getters test passed");
    }

    /**
     * @dev Test configuration setters
     */
    function testConfigurationSetters() public {
        console.log("Testing configuration setters...");
        
        // Test updating batch audit interval
        inventoryManager.updateBatchAuditInterval(14 days);
        assertEq(inventoryManager.s_batchAuditInterval(), 14 days, "Audit interval should be updated");
        
        // Test updating expiry warning threshold
        inventoryManager.updateExpiryWarningThreshold(30 days);
        assertEq(inventoryManager.s_expiryWarningThreshold(), 30 days, "Expiry threshold should be updated");
        
        // Test updating low inventory threshold
        inventoryManager.updateLowInventoryThreshold(20);
        assertEq(inventoryManager.s_lowInventoryThreshold(), 20, "Low inventory threshold should be updated");
        
        // Test updating long storage threshold
        inventoryManager.updateLongStorageThreshold(90 days);
        assertEq(inventoryManager.s_longStorageThreshold(), 90 days, "Long storage threshold should be updated");
        
        // Test updating max batches per upkeep
        inventoryManager.updateMaxBatchesPerUpkeep(25);
        assertEq(inventoryManager.s_maxBatchesPerUpkeep(), 25, "Max batches should be updated");
        
        console.log("Configuration setters test passed");
    }

    /**
     * @dev Test invalid configuration values
     */
    function testInvalidConfigurationValues() public {
        console.log("Testing invalid configuration values...");
        
        // Test invalid max batches per upkeep (should fail)
        vm.expectRevert(WAGAInventoryManager2.WAGAInventoryManager__InvalidThresholdValue_updateThresholds.selector);
        inventoryManager.updateMaxBatchesPerUpkeep(0);
        
        vm.expectRevert(WAGAInventoryManager2.WAGAInventoryManager__InvalidThresholdValue_updateThresholds.selector);
        inventoryManager.updateMaxBatchesPerUpkeep(101);
        
        console.log("Invalid configuration values test passed");
    }
}
