// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Test, console} from "forge-std/Test.sol";
import {WAGACoffeeToken} from "../../src/WAGACoffeeToken.sol";
import {WAGAProofOfReserve} from "../../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManager2} from "../../src/WAGAInventoryManager2.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGAZKManager} from "../../src/ZKIntegration/WAGAZKManager.sol";
import {IPrivacyLayer} from "../../src/ZKIntegration/Interfaces/IPrivacyLayer.sol";
import {IComplianceVerifier} from "../../src/ZKIntegration/Interfaces/IComplianceVerifier.sol";
import {SelectiveTransparency} from "../../src/PrivacyLayers/SelectiveTransparency.sol";
import {CircomVerifier} from "../../src/ZKIntegration/CircomVerifier.sol";
import {ComplianceVerifier} from "../../src/ZKIntegration/ComplianceVerifier.sol";

/**
 * @title WAGAPrivacyIntegration
 * @dev Comprehensive integration tests for the privacy-enhanced WAGA system
 */
contract WAGAPrivacyIntegration is Test {
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    WAGACoffeeToken public coffeeToken;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManager2 public inventoryManager;
    WAGACoffeeRedemption public redemption;
    WAGAZKManager public zkManager;
    SelectiveTransparency public privacyLayer;
    CircomVerifier public zkVerifier;
    ComplianceVerifier public complianceVerifier;

    // Test addresses
    address public admin = address(0x1);
    address public processor = address(0x2);
    address public distributor = address(0x3);
    address public publicUser = address(0x4);
    address public verifier = address(0x5);

    // Test data
    uint256 public batchId = 1;
    uint256 public productionDate = block.timestamp;
    uint256 public expiryDate = block.timestamp + 365 days;
    uint256 public quantity = 1000;
    uint256 public pricePerUnit = 1000000000000000000; // 1 ETH in wei
    string public packagingInfo = "250g";
    string public metadataHash = "QmTestMetadata123";

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(
        uint256 indexed batchId,
        address indexed creator,
        uint256 quantity,
        uint256 pricePerUnit,
        IPrivacyLayer.PrivacyConfig privacyConfig
    );

    event ZKProofAdded(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        string proofType,
        address indexed generator
    );

    event EncryptedDataStored(
        uint256 indexed batchId,
        bytes32 indexed dataHash,
        address indexed owner
    );

    /* -------------------------------------------------------------------------- */
    /*                                 Setup                                      */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        // Deploy privacy-enhanced system
        deployPrivacyEnhancedSystem();

        // Set up test roles
        setupTestRoles();
    }

    /**
     * @dev Deploy the complete privacy-enhanced system
     */
    function deployPrivacyEnhancedSystem() internal {
        // Deploy privacy layer first
        privacyLayer = new SelectiveTransparency();
        
        // Deploy main coffee token with privacy features (without ZK contracts initially)
        coffeeToken = new WAGACoffeeToken(
            "https://ipfs.io/ipfs/",
            address(0), // zkVerifier - will be set later
            address(privacyLayer),
            address(0) // complianceVerifier - will be set later
        );
        
        // Deploy ZK verification system (after coffeeToken)
        zkVerifier = new CircomVerifier(address(coffeeToken));
        
        // Deploy compliance verifier (after coffeeToken)
        complianceVerifier = new ComplianceVerifier(address(coffeeToken));
        
        // Deploy proof of reserve
        proofOfReserve = new WAGAProofOfReserve(
            address(coffeeToken),
            address(0), // Mock router
            1, // Mock subscription ID
            bytes32(0) // Mock DON ID
        );
        
        // Deploy inventory manager
        inventoryManager = new WAGAInventoryManager2(
            address(coffeeToken),
            address(proofOfReserve)
        );
        
        // Deploy redemption contract
        redemption = new WAGACoffeeRedemption(address(coffeeToken));
        
        // Deploy ZK manager
        zkManager = new WAGAZKManager(
            address(coffeeToken),
            address(zkVerifier),
            address(privacyLayer)
        );
    }

    /**
     * @dev Set up test roles
     */
    function setupTestRoles() internal {
        // Grant roles to test addresses
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), admin);
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        coffeeToken.grantRole(coffeeToken.DISTRIBUTOR_ROLE(), distributor);
        coffeeToken.grantRole(coffeeToken.VERIFIER_ROLE(), verifier);
        coffeeToken.grantRole(coffeeToken.INVENTORY_MANAGER_ROLE(), verifier);
        
        // Grant roles to ZK manager
        coffeeToken.grantRole(coffeeToken.ZK_ADMIN_ROLE(), address(zkManager));
        coffeeToken.grantRole(coffeeToken.PRIVACY_ADMIN_ROLE(), address(zkManager));
        coffeeToken.grantRole(coffeeToken.DATA_MANAGER_ROLE(), address(zkManager));
    }

    /* -------------------------------------------------------------------------- */
    /*                              Test Functions                                */
    /* -------------------------------------------------------------------------- */

    function testPrivacyEnhancedBatchCreation() public {
        console.log("Testing Privacy-Enhanced Batch Creation...");
        
        // Create privacy configuration
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer.PrivacyConfig({
            pricingSelective: 1, // Selective
            qualitySelective: 2, // Private
            supplyChainSelective: 1, // Selective
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            pricingPrivate: false,
            qualityPrivate: true,
            supplyChainPrivate: false,
            level: IPrivacyLayer.PrivacyLevel.SELECTIVE
        });

        // Create batch as processor
        vm.prank(processor);
        coffeeToken.createBatch(
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            packagingInfo,
            metadataHash,
            bytes32(0), // zkProofHash
            bytes32(0), // encryptedDataHash
            privacyConfig
        );

        // Verify batch was created
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should be created");
        
        // Verify privacy configuration
        IPrivacyLayer.PrivacyConfig memory storedConfig = coffeeToken.batchPrivacyConfig(batchId);
        assertEq(storedConfig.pricingSelective, 1, "Pricing should be selective");
        assertEq(storedConfig.qualitySelective, 2, "Quality should be private");
        assertEq(storedConfig.supplyChainSelective, 1, "Supply chain should be selective");
        
        console.log("Privacy-enhanced batch creation successful");
    }

    function testRoleBasedDataAccess() public {
        console.log("Testing Role-Based Data Access...");
        
        // Create batch first
        createTestBatch();
        
        // Test admin access (should see all data)
        vm.prank(admin);
        (
            uint256 prodDate,
            uint256 expDate,
            bool isVerified,
            uint256 qty,
            uint256 price,
            string memory packaging,
            string memory metadata,
            bool isMetadataVerified,
            uint256 lastVerified,
            IPrivacyLayer.PrivacyConfig memory privacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(batchId, admin);
        
        assertEq(price, pricePerUnit, "Admin should see price");
        assertEq(qty, quantity, "Admin should see quantity");
        
        // Test distributor access (should see price but not quality details)
        vm.prank(distributor);
        (
            ,,,
            uint256 distQty,
            uint256 distPrice,
            ,,,
            ,,
            IPrivacyLayer.PrivacyConfig memory distPrivacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(batchId, distributor);
        
        assertEq(distPrice, pricePerUnit, "Distributor should see price");
        assertEq(distQty, quantity, "Distributor should see quantity");
        
        // Test public access (should not see price)
        vm.prank(publicUser);
        (
            ,,,
            uint256 pubQty,
            uint256 pubPrice,
            ,,,
            ,,
            IPrivacyLayer.PrivacyConfig memory pubPrivacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(batchId, publicUser);
        
        assertEq(pubPrice, 0, "Public user should not see price");
        assertEq(pubQty, quantity, "Public user should see quantity");
        
        console.log("Role-based data access working correctly");
    }

    function testZKProofIntegration() public {
        console.log("Testing ZK Proof Integration...");
        
        // Create batch first
        createTestBatch();
        
        // Generate ZK proof data
        bytes memory zkProofData = abi.encodePacked("test_proof_data_", block.timestamp);
        string memory proofType = "price_competitiveness";
        
        // Update batch with ZK proof
        vm.prank(processor);
        coffeeToken.updateBatchIPFSWithZKProofs(
            batchId,
            "QmUpdatedMetadata",
            zkProofData,
            proofType
        );
        
        // Verify ZK proof was stored
        (
            bytes32 proofHash,
            bytes memory storedProofData,
            uint256 proofTimestamp,
            address proofGenerator,
            bool isValid,
            string memory storedProofType
        ) = coffeeToken.getZKProof(batchId);
        
        assertTrue(proofHash != bytes32(0), "ZK proof hash should be set");
        assertEq(proofGenerator, processor, "Proof generator should be processor");
        assertTrue(isValid, "ZK proof should be valid");
        assertEq(storedProofType, proofType, "Proof type should match");
        
        console.log("ZK proof integration successful");
    }

    function testEncryptedDataStorage() public {
        console.log("Testing Encrypted Data Storage...");
        
        // Create batch first
        createTestBatch();
        
        // Create encrypted data
        bytes memory encryptedData = abi.encodePacked("encrypted_sensitive_data_", block.timestamp);
        bytes32 encryptionKeyHash = keccak256(abi.encodePacked("test_encryption_key"));
        
        // Store encrypted data
        vm.prank(processor);
        coffeeToken.storeEncryptedBatchData(
            batchId,
            encryptedData,
            encryptionKeyHash
        );
        
        // Verify encrypted data was stored
        (
            bytes32 dataHash,
            bytes memory storedEncryptedData,
            bytes32 storedEncryptionKeyHash,
            uint256 encryptionTimestamp,
            address dataOwner
        ) = coffeeToken.getEncryptedBatchData(batchId, "test_encryption_key");
        
        assertTrue(dataHash != bytes32(0), "Encrypted data hash should be set");
        assertEq(dataOwner, processor, "Data owner should be processor");
        assertEq(storedEncryptionKeyHash, encryptionKeyHash, "Encryption key hash should match");
        
        console.log("Encrypted data storage successful");
    }

    function testBatchRequestFunctionality() public {
        console.log("Testing Batch Request Functionality...");
        
        // Create batch first
        createTestBatch();
        
        // Test that public user cannot request batch
        vm.prank(publicUser);
        vm.expectRevert();
        coffeeToken.requestBatch(batchId, 100, "Test request from public user");
        
        // Test that distributor can request batch
        vm.prank(distributor);
        coffeeToken.requestBatch(batchId, 500, "Test request from distributor"); // Request 500 out of 1000
        
        // Verify request was created
        uint256 requestCount = coffeeToken.getBatchRequestCount(batchId);
        assertEq(requestCount, 1, "Should have one request");
        
        // Get request details
        (
            uint256 requestBatchId,
            address requester,
            uint256 requestedQuantity,
            string memory requestDetails,
            uint256 requestTimestamp,
            bool isFulfilled,
            uint256 fulfilledQuantity,
            uint256 fulfilledTimestamp
        ) = coffeeToken.getBatchRequest(batchId, 0);
        
        assertEq(requester, distributor, "Requester should be distributor");
        assertEq(requestedQuantity, 500, "Requested quantity should be 500");
        assertEq(requestDetails, "Test request from distributor", "Request details should match");
        assertFalse(isFulfilled, "Request should not be fulfilled yet");
        
        console.log("Batch request functionality working correctly");
    }

    function testPrivacyLevels() public {
        console.log("Testing Privacy Levels...");
        
        // Test Public privacy level
        testPrivacyLevel(IPrivacyLayer.PrivacyLevel.PUBLIC, "Public");
        
        // Test Selective privacy level
        testPrivacyLevel(IPrivacyLayer.PrivacyLevel.SELECTIVE, "Selective");
        
        // Test Private privacy level
        testPrivacyLevel(IPrivacyLayer.PrivacyLevel.PRIVATE, "Private");
        
        console.log("All privacy levels working correctly");
    }

    function testPrivacyLevel(IPrivacyLayer.PrivacyLevel level, string memory levelName) internal {
        console.log("Testing", levelName, "privacy level...");
        
        // Create privacy configuration for this level
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer.PrivacyConfig({
            pricingSelective: uint8(level),
            qualitySelective: uint8(level),
            supplyChainSelective: uint8(level),
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            pricingPrivate: level == IPrivacyLayer.PrivacyLevel.PRIVATE,
            qualityPrivate: level == IPrivacyLayer.PrivacyLevel.PRIVATE,
            supplyChainPrivate: level == IPrivacyLayer.PrivacyLevel.PRIVATE,
            level: level
        });

        // Create batch
        vm.prank(processor);
        coffeeToken.createBatch(
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            packagingInfo,
            metadataHash,
            bytes32(0),
            bytes32(0),
            privacyConfig
        );

        uint256 testBatchId = coffeeToken.s_batchCounter();
        
        // Test data visibility based on privacy level
        vm.prank(publicUser);
        (
            ,,,
            uint256 pubQty,
            uint256 pubPrice,
            ,,,
            ,,
            IPrivacyLayer.PrivacyConfig memory storedConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(testBatchId, publicUser);
        
        if (level == IPrivacyLayer.PrivacyLevel.PUBLIC) {
            assertEq(pubPrice, pricePerUnit, "Public level: Price should be visible");
        } else {
            assertEq(pubPrice, 0, "Non-public level: Price should be hidden");
        }
        
        assertEq(storedConfig.level, level, "Privacy level should match");
    }

    function testZKProofVerification() public {
        console.log("Testing ZK Proof Verification...");
        
        // Create batch first
        createTestBatch();
        
        // Mock ZK proof verification
        bytes memory mockProof = abi.encodePacked("mock_zk_proof_", block.timestamp);
        
        // Test ZK proof verification through ZK manager
        vm.prank(processor);
        bool verificationResult = zkManager.verifyZKProof(
            batchId,
            mockProof,
            "price_competitiveness"
        );
        
        // Note: In a real implementation, this would use actual ZK verification
        // For testing, we're using mock verification
        assertTrue(verificationResult, "ZK proof verification should succeed");
        
        console.log("ZK proof verification successful");
    }

    function testComplianceVerification() public {
        console.log("Testing Compliance Verification...");
        
        // Create batch first
        createTestBatch();
        
        // Test compliance verification
        vm.prank(verifier);
        bool complianceResult = complianceVerifier.verifyCompliance(
            batchId,
            IComplianceVerifier.ComplianceType.QUALITY_STANDARDS,
            abi.encodePacked("compliance_proof_data")
        );
        
        // Note: In a real implementation, this would verify actual compliance
        // For testing, we're using mock verification
        assertTrue(complianceResult, "Compliance verification should succeed");
        
        console.log("Compliance verification successful");
    }

    function testPrivacyLayerIntegration() public {
        console.log("Testing Privacy Layer Integration...");
        
        // Create batch first
        createTestBatch();
        
        // Test privacy layer configuration
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer.PrivacyConfig({
            pricingSelective: 1,
            qualitySelective: 2,
            supplyChainSelective: 1,
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            pricingPrivate: false,
            qualityPrivate: true,
            supplyChainPrivate: false,
            level: IPrivacyLayer.PrivacyLevel.SELECTIVE
        });
        
        // Configure privacy through privacy layer
        vm.prank(processor);
        privacyLayer.configurePrivacy(batchId, privacyConfig);
        
        // Verify privacy configuration
        IPrivacyLayer.PrivacyConfig memory storedConfig = privacyLayer.getPrivacyConfig(batchId);
        assertEq(storedConfig.pricingSelective, 1, "Pricing should be selective");
        assertEq(storedConfig.qualitySelective, 2, "Quality should be private");
        assertEq(storedConfig.supplyChainSelective, 1, "Supply chain should be selective");
        
        console.log("Privacy layer integration successful");
    }

    function testCompletePrivacyWorkflow() public {
        console.log("Testing Complete Privacy Workflow...");
        
        // 1. Processor creates batch with privacy
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer.PrivacyConfig({
            pricingSelective: 1,
            qualitySelective: 2,
            supplyChainSelective: 1,
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            pricingPrivate: false,
            qualityPrivate: true,
            supplyChainPrivate: false,
            level: IPrivacyLayer.PrivacyLevel.SELECTIVE
        });

        vm.prank(processor);
        coffeeToken.createBatch(
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            packagingInfo,
            metadataHash,
            bytes32(0),
            bytes32(0),
            privacyConfig
        );

        uint256 testBatchId = coffeeToken.s_batchCounter();
        
        // 2. Add ZK proofs
        vm.prank(processor);
        coffeeToken.updateBatchIPFSWithZKProofs(
            testBatchId,
            "QmZKProofMetadata",
            abi.encodePacked("zk_proof_data"),
            "price_competitiveness"
        );
        
        // 3. Store encrypted data
        vm.prank(processor);
        coffeeToken.storeEncryptedBatchData(
            testBatchId,
            abi.encodePacked("encrypted_sensitive_data"),
            keccak256(abi.encodePacked("encryption_key"))
        );
        
        // 4. Distributor requests batch
        vm.prank(distributor);
        coffeeToken.requestBatch(testBatchId, "Request with privacy protection");
        
        // 5. Verify privacy is maintained
        vm.prank(publicUser);
        (
            ,,,
            uint256 pubQty,
            uint256 pubPrice,
            ,,,
            ,,
            IPrivacyLayer.PrivacyConfig memory finalPrivacyConfig
        ) = coffeeToken.getBatchInfoWithPrivacy(testBatchId, publicUser);
        
        assertEq(pubPrice, 0, "Price should be hidden from public");
        assertEq(pubQty, quantity, "Quantity should be visible");
        assertEq(finalPrivacyConfig.level, IPrivacyLayer.PrivacyLevel.SELECTIVE, "Privacy level should be selective");
        
        // 6. Verify distributor can see price
        vm.prank(distributor);
        (
            ,,,
            uint256 distQty,
            uint256 distPrice,
            ,,,
            ,,
        ) = coffeeToken.getBatchInfoWithPrivacy(testBatchId, distributor);
        
        assertEq(distPrice, pricePerUnit, "Distributor should see price");
        assertEq(distQty, quantity, "Distributor should see quantity");
        
        console.log("Complete privacy workflow successful");
    }

    /* -------------------------------------------------------------------------- */
    /*                              Helper Functions                               */
    /* -------------------------------------------------------------------------- */

    function createTestBatch() internal {
        IPrivacyLayer.PrivacyConfig memory privacyConfig = IPrivacyLayer.PrivacyConfig({
            pricingSelective: 1,
            qualitySelective: 1,
            supplyChainSelective: 1,
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            pricingPrivate: false,
            qualityPrivate: false,
            supplyChainPrivate: false,
            level: IPrivacyLayer.PrivacyLevel.SELECTIVE
        });

        vm.prank(processor);
        coffeeToken.createBatch(
            productionDate,
            expiryDate,
            quantity,
            pricePerUnit,
            packagingInfo,
            metadataHash,
            bytes32(0),
            bytes32(0),
            privacyConfig
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              Test Utilities                                 */
    /* -------------------------------------------------------------------------- */

    function testAllPrivacyFeatures() public {
        console.log("Running Complete Privacy Feature Test Suite...");
        
        testPrivacyEnhancedBatchCreation();
        testRoleBasedDataAccess();
        testZKProofIntegration();
        testEncryptedDataStorage();
        testBatchRequestFunctionality();
        testPrivacyLevels();
        testZKProofVerification();
        testComplianceVerification();
        testPrivacyLayerIntegration();
        testCompletePrivacyWorkflow();
        testInventoryTracking();
        
        console.log("All privacy features working correctly!");
    }

    function testInventoryTracking() public {
        console.log("Testing Inventory Tracking...");
        
        // Create batch
        createTestBatch();
        
        // Verify initial state
        (uint256 totalQuantity, uint256 mintedQuantity, uint256 availableQuantity) = coffeeToken.getBatchInventoryInfo(batchId);
        assertEq(totalQuantity, 1000, "Total quantity should be 1000");
        assertEq(mintedQuantity, 0, "Minted quantity should be 0 initially");
        assertEq(availableQuantity, 1000, "Available quantity should be 1000 initially");
        
        // Request batch
        vm.prank(distributor);
        coffeeToken.requestBatch(batchId, 500, "Test request 1");
        
        // Request another batch
        vm.prank(distributor);
        coffeeToken.requestBatch(batchId, 300, "Test request 2");
        
        // Mint tokens for first request
        vm.prank(admin);
        coffeeToken.mintBatch(distributor, batchId, 500);
        
        // Check inventory after minting
        (totalQuantity, mintedQuantity, availableQuantity) = coffeeToken.getBatchInventoryInfo(batchId);
        assertEq(totalQuantity, 1000, "Total quantity should remain 1000");
        assertEq(mintedQuantity, 500, "Minted quantity should be 500");
        assertEq(availableQuantity, 500, "Available quantity should be 500");
        
        // Mint tokens for second request
        vm.prank(admin);
        coffeeToken.mintBatch(distributor, batchId, 300);
        
        // Check inventory after second minting
        (totalQuantity, mintedQuantity, availableQuantity) = coffeeToken.getBatchInventoryInfo(batchId);
        assertEq(totalQuantity, 1000, "Total quantity should remain 1000");
        assertEq(mintedQuantity, 800, "Minted quantity should be 800");
        assertEq(availableQuantity, 200, "Available quantity should be 200");
        
        // Test that we can't mint more than available
        vm.prank(admin);
        vm.expectRevert();
        coffeeToken.mintBatch(distributor, batchId, 300); // Should fail, only 200 available
        
        console.log("Inventory tracking working correctly");
    }
}
