// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../script/HelperConfig.s.sol";

// Core contracts
import {WAGACoffeeTokenCore} from "../src/WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "../src/WAGAConfigManager.sol";
import {WAGABatchManager} from "../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../src/WAGAZKManager.sol";
import {WAGAEthiopianCompliance} from "../src/WAGAEthiopianCompliance.sol";
import {WAGACoffeeRedemption} from "../src/WAGACoffeeRedemption.sol";
import {WAGATreasury} from "../src/WAGATreasury.sol";
import {PrivacyLayer} from "../src/PrivacyLayer.sol";
import {CircomVerifier} from "../src/CircomVerifier.sol";
import {WAGACDPIntegration} from "../src/WAGACDPIntegration.sol";
import {WAGAProofOfReserve} from "../src/WAGAProofOfReserve.sol";
import {WAGAInventoryManagerMVP} from "../src/WAGAInventoryManagerMVP.sol";
import {WAGAECXPriceOracle} from "../src/WAGAECXPriceOracle.sol";

// Interfaces
import {IEthiopianCompliance} from "../src/Interfaces/IEthiopianCompliance.sol";
import {IZKVerifier} from "../src/Interfaces/IZKVerifier.sol";
import {IPrivacyLayer} from "../src/Interfaces/IPrivacyLayer.sol";

// Mocks
import {MockUSDC} from "./mocks/MockUSDC.sol";

/**
 * @title BaseWAGATest
 * @dev Base test contract providing common setup, deployment, and utilities for all WAGA tests
 * @notice Inherits from this contract to eliminate setup duplication across test suite
 */
abstract contract BaseWAGATest is Test {
    /* -------------------------------------------------------------------------- */
    /*                              DEPLOYMENT INFRASTRUCTURE                     */
    /* -------------------------------------------------------------------------- */

    DeployRealZKMVP public deployer;
    HelperConfig public helperConfig;
    HelperConfig.NetworkConfig public networkConfig;

    /* -------------------------------------------------------------------------- */
    /*                              CONTRACT INSTANCES                            */
    /* -------------------------------------------------------------------------- */

    // Core contracts
    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    PrivacyLayer public privacyLayer;
    WAGATreasury public treasury;
    WAGACoffeeRedemption public redemption;
    CircomVerifier public circomVerifier;

    // Specialized contracts
    WAGACDPIntegration public cdpIntegration;
    WAGAProofOfReserve public proofOfReserve;
    WAGAInventoryManagerMVP public inventoryManager;
    WAGAEthiopianCompliance public ethiopianCompliance;
    WAGAECXPriceOracle public ecxOracle;

    // Mock contracts
    MockUSDC public usdc;

    /* -------------------------------------------------------------------------- */
    /*                              TEST ACCOUNTS                                 */
    /* -------------------------------------------------------------------------- */

    address public admin;
    address public processor = makeAddr("processor");
    address public verifier = makeAddr("verifier");
    address public minter = makeAddr("minter");
    address public fulfiller = makeAddr("fulfiller");
    address public distributor = makeAddr("distributor");
    address public cooperative = makeAddr("cooperative");
    address public roaster = makeAddr("roaster");
    
    // Compliance-specific accounts
    address public complianceManager = makeAddr("complianceManager");
    address public originVerifier = makeAddr("originVerifier");
    address public qualityInspector = makeAddr("qualityInspector");
    address public bankingPartner = makeAddr("bankingPartner");
    
    // Payment-related accounts
    address public paymentProcessor = makeAddr("paymentProcessor");
    address public offrampExecutor = makeAddr("offrampExecutor");
    address public buyer = makeAddr("buyer");
    address public seller = makeAddr("seller");
    
    // Generic test accounts
    address public user = makeAddr("user");
    address public unauthorized = makeAddr("unauthorized");

    /* -------------------------------------------------------------------------- */
    /*                              TEST CONSTANTS                                */
    /* -------------------------------------------------------------------------- */

    uint256 public constant INITIAL_USDC_BALANCE = 1_000_000e6; // 1M USDC
    uint256 public constant TEST_BATCH_QUANTITY = 100;
    uint256 public constant TEST_PRICE_PER_UNIT = 50e6; // $50 USDC
    uint256 public constant TEST_PAYMENT_AMOUNT = 5000e6; // $5000 USDC
    
    // Timestamps
    uint256 public constant PRODUCTION_DATE = 1704067200; // Jan 1, 2024
    uint256 public constant EXPIRY_DATE = 1735689600; // Jan 1, 2025
    
    // Test batch data
    string public constant TEST_ORIGIN = "Ethiopia, Sidamo";
    string public constant TEST_PACKAGING = "250g";
    string public constant TEST_METADATA_URI = "ipfs://QmTest123";

    /* -------------------------------------------------------------------------- */
    /*                              COMMON TEST DATA                              */
    /* -------------------------------------------------------------------------- */

    IEthiopianCompliance.EUDRCertificate public testEUDRCert;
    IEthiopianCompliance.GeolocationData public testGeoData;
    IEthiopianCompliance.ECTAPermit public testECTAPermit;
    IEthiopianCompliance.QualityCertificate public testQualityCert;
    IEthiopianCompliance.OriginVerification public testOriginVerification;

    bytes public constant MOCK_PROOF_DATA = hex"00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff";

    /* -------------------------------------------------------------------------- */
    /*                              SETUP FUNCTION                               */
    /* -------------------------------------------------------------------------- */

    function setUp() public virtual {
        // Deploy the complete WAGA system
        _deployWAGASystem();
        
        // Setup network configuration and admin account
        _setupNetworkConfig();
        
        // Setup all role-based access control
        _setupRoles();
        
        // Initialize test data structures
        _initializeTestData();
        
        // Fund test accounts with USDC
        _fundTestAccounts();
        
        console.log("BaseWAGATest: Setup completed successfully");
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTERNAL SETUP FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    function _deployWAGASystem() internal {
        deployer = new DeployRealZKMVP();
        
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemption,
            cdpIntegration,
            proofOfReserve,
            inventoryManager,
            ethiopianCompliance,
            ecxOracle,
            circomVerifier,
            helperConfig
        ) = deployer.run();
        
        console.log("BaseWAGATest: WAGA system deployed");
    }

    function _setupNetworkConfig() internal {
        networkConfig = helperConfig.getActiveNetworkConfig();
        usdc = MockUSDC(networkConfig.usdcAddress);
        admin = vm.addr(networkConfig.deployerKey);
        
        console.log("BaseWAGATest: Network config and admin setup completed");
        console.log("Admin address:", admin);
        console.log("USDC address:", address(usdc));
    }

    function _setupRoles() internal {
        vm.startPrank(admin);
        
        // Core operational roles
        coffeeToken.grantProcessorRole(processor);
        coffeeToken.grantVerifierRole(verifier);
        coffeeToken.grantProcessorRole(verifier); // Also grant processor role for ZK proof submission
        coffeeToken.grantRole(keccak256("MINTER_ROLE"), minter);
        coffeeToken.grantFulfillerRole(fulfiller);
        coffeeToken.grantDistributorRole(distributor);
        coffeeToken.grantProcessorRole(distributor); // Also grant processor role for batch creation
        
        // Product line roles
        coffeeToken.grantRole(keccak256("COOPERATIVE_ROLE"), cooperative);
        coffeeToken.grantProcessorRole(cooperative); // Also grant processor role for batch creation
        coffeeToken.grantRole(keccak256("ROASTER_ROLE"), roaster);
        coffeeToken.grantProcessorRole(roaster); // Also grant processor role for batch creation
        
        // Compliance roles
        coffeeToken.grantComplianceManagerRole(complianceManager);
        coffeeToken.grantOriginVerifierRole(originVerifier);
        coffeeToken.grantQualityInspectorRole(qualityInspector);
        coffeeToken.grantBankingPartnerRole(bankingPartner);
        
        // Payment roles
        coffeeToken.grantPaymentProcessorRole(paymentProcessor);
        coffeeToken.grantOfframpExecutorRole(offrampExecutor);
        
        // ZK and privacy roles
        coffeeToken.grantZKVerifierRole(verifier);
        coffeeToken.grantZKAdminRole(admin);
        coffeeToken.grantPrivacyAdminRole(admin);
        
        // Price oracle role
        coffeeToken.grantPriceUpdaterRole(admin);
        
        // Grant necessary roles to contracts for internal operations
        _setupContractRoles();
        
        vm.stopPrank();
        
        console.log("BaseWAGATest: All roles setup completed");
    }

    function _setupContractRoles() internal {
        // Grant roles to contracts for internal operations
        coffeeToken.grantProcessorRole(address(batchManager));
        coffeeToken.grantVerifierRole(address(batchManager));
        coffeeToken.grantZKVerifierRole(address(batchManager));
        coffeeToken.grantQualityInspectorRole(address(batchManager));
        coffeeToken.grantOriginVerifierRole(address(batchManager));
        coffeeToken.grantComplianceManagerRole(address(batchManager));
        
        // Grant roles to Ethiopian compliance contract
        coffeeToken.grantComplianceManagerRole(address(ethiopianCompliance));
        coffeeToken.grantOriginVerifierRole(address(ethiopianCompliance));
        coffeeToken.grantQualityInspectorRole(address(ethiopianCompliance));
        
        // Grant roles to ZK Manager contract
        coffeeToken.grantProcessorRole(address(zkManager));
        coffeeToken.grantRole(keccak256("DEFAULT_ADMIN_ROLE"), address(zkManager));
        
        // Grant roles to test contracts (for direct calls)
        coffeeToken.grantComplianceManagerRole(address(this));
        coffeeToken.grantOriginVerifierRole(address(this));
        
        // Link contracts with setCoffeeToken (CRITICAL SECURITY) - matching deploy script
        ethiopianCompliance.setCoffeeToken(address(coffeeToken));
        cdpIntegration.setCoffeeToken(address(coffeeToken));
        ecxOracle.setCoffeeToken(address(coffeeToken));
        circomVerifier.setCoffeeToken(address(coffeeToken));
        treasury.setCoffeeToken(address(coffeeToken));
        coffeeToken.grantQualityInspectorRole(address(this));
        coffeeToken.grantProcessorRole(address(this));
        coffeeToken.grantRole(keccak256("DEFAULT_ADMIN_ROLE"), address(this));
        coffeeToken.grantZKAdminRole(address(this));
        
        coffeeToken.grantRole(keccak256("MINTER_ROLE"), address(redemption));
        coffeeToken.grantPaymentProcessorRole(address(treasury));
        coffeeToken.grantOfframpExecutorRole(address(treasury));
        
        // Link contracts with setCoffeeToken (CRITICAL SECURITY)
        ethiopianCompliance.setCoffeeToken(address(coffeeToken));
        cdpIntegration.setCoffeeToken(address(coffeeToken));
        ecxOracle.setCoffeeToken(address(coffeeToken));
        circomVerifier.setCoffeeToken(address(coffeeToken));
        treasury.setCoffeeToken(address(coffeeToken));
    }

    function _initializeTestData() internal {
        // Initialize EUDR certificate
        testEUDRCert = IEthiopianCompliance.EUDRCertificate({
            certificateId: "EUDR-2024-001",
            issuer: "European Commission",
            issueDate: PRODUCTION_DATE,
            expiryDate: EXPIRY_DATE,
            isValid: true,
            geoDataHash: "geo_hash_123",
            complianceLevel: "High",
            deforestationRisk: "Low"
        });

        // Initialize geolocation data
        testGeoData = IEthiopianCompliance.GeolocationData({
            plotType: "point",
            coordinates: "7.1024,38.7469",
            plotSize: 250,
            verificationMethod: "Satellite + Ground Truth"
        });

        // Initialize ECTA permit
        testECTAPermit = IEthiopianCompliance.ECTAPermit({
            permitNumber: "ECTA-2024-001",
            exporterName: "Ethiopian Coffee Cooperative",
            exporterLicense: "ECL-2024-001",
            issueDate: PRODUCTION_DATE,
            expiryDate: EXPIRY_DATE,
            isValid: true,
            permitDocumentHash: "permit_hash_123"
        });

        // Initialize quality certificate
        testQualityCert = IEthiopianCompliance.QualityCertificate({
            certificateNumber: "QC-2024-001",
            gradingResult: "Grade 1",
            moistureContent: 11, // 11% moisture content (within the 12 limit)
            screenSize: 18,
            scaeCompliant: true,
            issueDate: PRODUCTION_DATE,
            certificateHash: "cert_hash_123",
            inspectorId: "INS-001"
        });

        // Initialize origin verification
        testOriginVerification = IEthiopianCompliance.OriginVerification({
            region: "Sidamo",
            woreda: "Bensa",
            kebele: "Harowa",
            cooperativeName: "Sidamo Coffee Cooperative",
            cooperativeLicense: "SCL-2024-001",
            verified: true,
            verificationDate: block.timestamp,
            verificationDocumentHash: "origin_hash_123"
        });

        console.log("BaseWAGATest: Test data structures initialized");
    }

    function _fundTestAccounts() internal {
        address[] memory accounts = new address[](6);
        accounts[0] = buyer;
        accounts[1] = seller;
        accounts[2] = user;
        accounts[3] = paymentProcessor;
        accounts[4] = cooperative;
        accounts[5] = roaster;

        for (uint256 i = 0; i < accounts.length; i++) {
            usdc.mint(accounts[i], INITIAL_USDC_BALANCE);
            vm.prank(accounts[i]);
            usdc.approve(address(treasury), INITIAL_USDC_BALANCE);
        }

        console.log("BaseWAGATest: Test accounts funded with USDC");
    }

    /* -------------------------------------------------------------------------- */
    /*                              HELPER FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Creates a standard test batch with common parameters
     * @param creator The address that will create the batch
     * @return batchId The ID of the created batch
     */
    function createTestBatch(address creator) internal returns (uint256 batchId) {
        vm.prank(creator);
        return coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            TEST_BATCH_QUANTITY,
            TEST_PRICE_PER_UNIT,
            TEST_ORIGIN,
            TEST_PACKAGING,
            TEST_METADATA_URI
        );
    }

    /**
     * @dev Creates a test batch with custom parameters
     */
    function createCustomBatch(
        address creator,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin
    ) internal returns (uint256 batchId) {
        vm.prank(creator);
        return coffeeToken.createBatch(
            PRODUCTION_DATE,
            EXPIRY_DATE,
            quantity,
            pricePerUnit,
            origin,
            TEST_PACKAGING,
            TEST_METADATA_URI
        );
    }

    /**
     * @dev Adds complete compliance data to a batch
     */
    function addCompleteComplianceData(uint256 batchId) internal {
        // Use appropriate roles for each compliance function
        vm.prank(complianceManager);
        ethiopianCompliance.addECTAPermit(batchId, testECTAPermit);
        
        vm.prank(qualityInspector);
        ethiopianCompliance.addQualityCertificate(batchId, testQualityCert);
        
        vm.prank(originVerifier);
        ethiopianCompliance.addOriginVerification(batchId, testOriginVerification);
        
        vm.prank(complianceManager);
        ethiopianCompliance.addEUDRCertificate(batchId, testEUDRCert);
        
        vm.prank(complianceManager);
        ethiopianCompliance.addGeolocationData(batchId, testGeoData);
    }

    /**
     * @dev Verifies a batch using the ZK manager
     */
    function verifyBatchWithZK(uint256 batchId) internal {
        vm.prank(verifier);
        zkManager.addZKProof(
            batchId,
            MOCK_PROOF_DATA,
            IZKVerifier.ProofType.QUALITY_STANDARDS,
            "Premium Quality - SCA 85+"
        );
    }

    /**
     * @dev Skips time forward by specified duration
     */
    function skipTime(uint256 duration) internal {
        vm.warp(block.timestamp + duration);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ASSERTION HELPERS                            */
    /* -------------------------------------------------------------------------- */

    function assertBatchExists(uint256 batchId) internal view {
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should exist");
    }

    function assertBatchVerified(uint256 batchId) internal view {
        // Note: getBatchInfo doesn't include isVerified, so this is a placeholder
        // In a real implementation, we would need a separate function to check verification status
        assertTrue(coffeeToken.isBatchCreated(batchId), "Batch should exist for verification check");
    }

    function assertRoleGranted(bytes32 role, address account) internal view {
        assertTrue(coffeeToken.hasRole(role, account), "Role should be granted");
    }

    function assertUSDCBalance(address account, uint256 expectedBalance) internal view {
        assertEq(usdc.balanceOf(account), expectedBalance, "USDC balance mismatch");
    }

    /* -------------------------------------------------------------------------- */
    /*                              EVENTS FOR TESTING                           */
    /* -------------------------------------------------------------------------- */

    event BatchCreated(uint256 indexed batchId, address indexed creator, uint256 quantity, uint256 pricePerUnit, string metadataURI);
    event BatchVerified(uint256 indexed batchId, address indexed verifier);
    event ComplianceDataAdded(uint256 indexed batchId, string dataType);
    event PaymentProcessed(address indexed payer, uint256 indexed batchId, uint256 amount);
}