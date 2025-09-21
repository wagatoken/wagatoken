// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {DeployRealZKMVP} from "../../script/DeployRealZKMVP.s.sol";
import {HelperConfig} from "../../script/HelperConfig.s.sol";
import {WAGACoffeeTokenCore} from "../../src/WAGACoffeeTokenCore.sol";
import {WAGABatchManager} from "../../src/WAGABatchManager.sol";
import {WAGAZKManager} from "../../src/WAGAZKManager.sol";
import {WAGAEthiopianCompliance} from "../../src/WAGAEthiopianCompliance.sol";
import {WAGACoffeeRedemption} from "../../src/WAGACoffeeRedemption.sol";
import {WAGATreasury} from "../../src/WAGATreasury.sol";
import {PrivacyLayer} from "../../src/PrivacyLayer.sol";
import {WAGAAccessControl} from "../../src/WAGAAccessControl.sol";
import {MockCircomVerifier} from "../../src/MockCircomVerifier.sol";
import {MockOfframpPartner} from "../../src/MockOfframpPartner.sol";
import {MockUSDC} from "../mocks/MockUSDC.sol";
import {TestHelperUtilities} from "../TestHelperUtilities.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IEthiopianCompliance} from "../../src/Interfaces/IEthiopianCompliance.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";
import {IPrivacyLayer} from "../../src/Interfaces/IPrivacyLayer.sol";

/**
 * @title CrossContractIntegrationTest
 * @dev Comprehensive cross-contract integration tests
 * @notice Validates data flow and interactions between all WAGA system contracts
 */
contract CrossContractIntegrationTest is Test {
    using TestHelperUtilities for *;

    /* -------------------------------------------------------------------------- */
    /*                              CONTRACT INSTANCES                            */
    /* -------------------------------------------------------------------------- */

    DeployRealZKMVP public deployer;
    HelperConfig public helperConfig;

    WAGACoffeeTokenCore public coffeeToken;
    WAGABatchManager public batchManager;
    WAGAZKManager public zkManager;
    WAGAEthiopianCompliance public ethiopianCompliance;
    WAGACoffeeRedemption public redemptionContract;
    WAGATreasury public treasury;
    PrivacyLayer public privacyLayer;
    WAGAAccessControl public accessControl;
    MockCircomVerifier public circomVerifier;
    MockUSDC public usdcToken;

    /* -------------------------------------------------------------------------- */
    /*                              TEST ACCOUNTS                                 */
    /* -------------------------------------------------------------------------- */

    address public admin;
    address public processor = makeAddr("processor");
    address public complianceManager = makeAddr("complianceManager");
    address public consumer = makeAddr("consumer");
    address public offrampPartner = makeAddr("offrampPartner");

    uint64 public sellerId;

    /* -------------------------------------------------------------------------- */
    /*                              SETUP FUNCTION                                */
    /* -------------------------------------------------------------------------- */

    function setUp() public {
        // Deploy the system
        deployer = new DeployRealZKMVP();
        (
            coffeeToken,
            batchManager,
            zkManager,
            privacyLayer,
            treasury,
            redemptionContract,
            , // cdpIntegration
            , // proofOfReserve
            , // inventoryManager
            ethiopianCompliance,
            , // ecxOracle
            circomVerifier,
            helperConfig
        ) = deployer.run();

        admin = vm.addr(helperConfig.getActiveNetworkConfig().deployerKey);
        accessControl = deployer.getAccessControl();
        usdcToken = MockUSDC(address(treasury.usdcToken()));

        // Setup roles and permissions
        vm.startPrank(admin);
        coffeeToken.grantRole(coffeeToken.PROCESSOR_ROLE(), processor);
        coffeeToken.grantRole(coffeeToken.COMPLIANCE_MANAGER_ROLE(), complianceManager);
        coffeeToken.grantRole(coffeeToken.ADMIN_ROLE(), admin);

        // Register seller
        sellerId = accessControl.registerSeller(
            processor,
            WAGAAccessControl.SellerType.PROCESSOR,
            "Integration Test Processor",
            "INT001",
            "integration@test.et",
            "+251911123456"
        );

        // Setup banking partners
        ethiopianCompliance.addBankingPartner(offrampPartner, "Integration Offramp Partner");
        ethiopianCompliance.updateBankingCapabilities(
            offrampPartner,
            IEthiopianCompliance.BankingCapabilities({
                swiftCode: bytes11("INTEGRATXXX"),
                bankName: "Integration Offramp Partner",
                country: "Singapore",
                canOfframp: true,
                canReceiveFiat: false,
                supportedCurrencies: "USD",
                dailyLimit: 1000000 * 1e6,
                isActive: true,
                regulatoryApproval: "INT-FIN-001"
            })
        );

        // Grant permissions
        treasury.grantRole(treasury.OFFRAMP_EXECUTOR_ROLE(), offrampPartner);
        circomVerifier.grantVerifierRole(processor);
        circomVerifier.grantVerifierRole(complianceManager);

        vm.stopPrank();

        // Fund accounts
        vm.deal(consumer, 1000 ether);
        usdcToken.mint(consumer, 10000 * 1e6); // 10,000 USDC
        usdcToken.mint(address(treasury), 10000 * 1e6); // Treasury funds

        vm.prank(consumer);
        usdcToken.approve(address(treasury), 10000 * 1e6);
    }

    /* -------------------------------------------------------------------------- */
    /*                     CROSS-CONTRACT DATA FLOW TESTS                        */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Test data flow from CoffeeToken -> BatchManager -> EthiopianCompliance
     */
    function testCoffeeTokenToBatchManagerToEthiopianComplianceFlow() public {
        console.log("=== TESTING COFFEETOKEN -> BATCHMANAGER -> ETHIOPIANCOMPLIANCE FLOW ===");

        uint256 batchId;

        // 1. Create batch in CoffeeToken
        vm.startPrank(processor);
        batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1 ether,
            "Yirgacheffe",
            "Washed",
            "ipfs://integration-batch"
        );
        vm.stopPrank();

        // Verify CoffeeToken has the batch
        assertTrue(coffeeToken.isBatchCreated(batchId), "CoffeeToken should have the batch");

        // 2. Add EUDR compliance through BatchManager
        vm.startPrank(complianceManager);
        batchManager.registerEUDRComplianceWithZK(
            batchId,
            "EUDR-CERT-INT-001",
            block.timestamp + 365 days,
            "High",
            "Deforestation-Free Verified",
            TestHelperUtilities.generateMockZKProof(),
            "Verified by satellite"
        );
        vm.stopPrank();

        // Verify EthiopianCompliance has the certificate
        assertTrue(ethiopianCompliance.hasEUDRCertificate(batchId), "EthiopianCompliance should have EUDR certificate");

        // Verify BatchManager knows about EUDR compliance
        (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) =
            batchManager.validateEUDRZKCompliance(batchId);
        assertTrue(fullyCompliant, "Batch should be fully EUDR compliant");

        console.log("CoffeeToken -> BatchManager -> EthiopianCompliance flow validated");
    }

    /**
     * @dev Test data flow from BatchManager -> ZKManager -> CircomVerifier
     */
    function testBatchManagerToZKManagerToCircomVerifierFlow() public {
        console.log("=== TESTING BATCHMANAGER -> ZKMANAGER -> CIRCOMVERIFIER FLOW ===");

        uint256 batchId;

        // 1. Create batch
        vm.startPrank(processor);
        batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1 ether,
            "Sidamo",
            "Natural",
            "ipfs://zk-integration-batch"
        );
        vm.stopPrank();

        // 2. Add ZK proof through ZKManager
        vm.startPrank(complianceManager);
        zkManager.addZKProof(
            batchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.PRICE_COMPETITIVENESS,
            "Competitively priced"
        );
        vm.stopPrank();

        // Verify ZKManager has the proof
        assertTrue(zkManager.hasAllRequiredProofs(batchId), "ZKManager should have the proof");

        // Verify CircomVerifier recorded the proof
        IZKVerifier.BatchProofStatus memory status = circomVerifier.getBatchProofStatus(batchId);
        assertTrue(status.hasPriceProof, "CircomVerifier should have recorded the price proof");

        console.log("BatchManager -> ZKManager -> CircomVerifier flow validated");
    }

    /**
     * @dev Test data flow from Treasury -> OfframpPartner -> EthiopianCompliance
     */
    function testTreasuryToOfframpPartnerToEthiopianComplianceFlow() public {
        console.log("=== TESTING TREASURY -> OFFRAMP PARTNER -> ETHIOPIAN COMPLIANCE FLOW ===");

        uint256 batchId;
        uint256 redemptionId;

        // 1. Setup batch and consumer payment
        vm.startPrank(processor);
        batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            100 * 1e6, // 100 USDC per unit
            "Yirgacheffe",
            "Washed",
            "ipfs://payment-flow-batch"
        );
        vm.stopPrank();

        // Consumer pays for batch
        vm.startPrank(consumer);
        treasury.payForBatch(batchId, 100 * 100 * 1e6); // 100 units * 100 USDC
        vm.stopPrank();

        // Mint tokens and request redemption
        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, 100);
        vm.stopPrank();

        vm.startPrank(consumer);
        redemptionId = redemptionContract.requestRedemption(batchId, 100, false);
        vm.stopPrank();

        // 2. Treasury transfers to offramp partner
        vm.startPrank(offrampPartner);
        treasury.transferToOfframpPartner(batchId, consumer, offrampPartner, 100 * 100 * 1e6);
        vm.stopPrank();

        // Verify Treasury recorded the transfer
        assertTrue(treasury.hasOfframpTransferExecuted(batchId, consumer), "Treasury should record offramp transfer");

        // 3. Setup offramp partner and record offramp
        MockOfframpPartner mockPartner = new MockOfframpPartner(address(usdcToken));

        vm.startPrank(admin);
        mockPartner.addSupportedSwiftCode(bytes11("CBETETAAXXX"), "Commercial Bank of Ethiopia");
        mockPartner.grantOfframpExecutorRole(offrampPartner);
        vm.stopPrank();

        vm.startPrank(offrampPartner);
        mockPartner.receiveOfframp(batchId, consumer, sellerId, 100 * 100 * 1e6, bytes11("CBETETAAXXX"));
        vm.stopPrank();

        // Verify offramp partner recorded the transaction
        (uint256 recordBatchId, address recordBuyer, uint256 recordSellerId, uint256 recordAmount, , , , ) =
            mockPartner.getOfframpRecord(sellerId);
        assertEq(recordBatchId, batchId, "Offramp partner should record batch ID");
        assertEq(recordBuyer, consumer, "Offramp partner should record buyer");
        assertEq(recordSellerId, sellerId, "Offramp partner should record seller ID");
        assertEq(recordAmount, 100 * 100 * 1e6, "Offramp partner should record amount");

        console.log("Treasury -> OfframpPartner -> EthiopianCompliance flow validated");
    }

    /**
     * @dev Test data flow from AccessControl -> EthiopianCompliance -> Redemption
     */
    function testAccessControlToEthiopianComplianceToRedemptionFlow() public {
        console.log("=== TESTING ACCESSCONTROL -> ETHIOPIANCOMPLIANCE -> REDEMPTION FLOW ===");

        uint256 batchId;
        uint256 redemptionId;

        // 1. Seller registration (AccessControl)
        assertEq(accessControl.getSellerId(processor), sellerId, "AccessControl should have seller registered");

        // 2. Create batch and register with BoE
        vm.startPrank(processor);
        batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            50,
            1 ether,
            "Yirgacheffe",
            "Washed",
            "ipfs://access-control-batch"
        );
        vm.stopPrank();

        vm.startPrank(complianceManager);
        ethiopianCompliance.registerTradeWithBoE(
            batchId,
            sellerId,
            consumer,
            processor,
            50,
            50 * 1e18,
            "Bank Transfer"
        );
        vm.stopPrank();

        // 3. Consumer payment and redemption
        vm.startPrank(consumer);
        treasury.payForBatch(batchId, 50 * 1e18);
        vm.stopPrank();

        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, 50);
        vm.stopPrank();

        vm.startPrank(consumer);
        redemptionId = redemptionContract.requestRedemption(batchId, 50, false);
        vm.stopPrank();

        // Verify seller ID flows through the system
        (
            address redemptionConsumer,
            uint64 redemptionSellerId,
            uint256 redemptionBatchId,
            uint256 quantity,
            ,
            ,
            ,
            ,
            ,
        ) = redemptionContract.getEnhancedRedemptionDetails(redemptionId);

        assertEq(redemptionSellerId, sellerId, "Redemption should have correct seller ID");
        assertEq(accessControl.getSellerAddress(redemptionSellerId), processor, "Seller address should resolve correctly");

        console.log("AccessControl -> EthiopianCompliance -> Redemption flow validated");
    }

    /**
     * @dev Test PrivacyLayer integration with all other contracts
     */
    function testPrivacyLayerIntegration() public {
        console.log("=== TESTING PRIVACY LAYER INTEGRATION ===");

        uint256 batchId;

        // 1. Create batch and configure privacy
        vm.startPrank(processor);
        batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            100,
            1 ether,
            "Sidamo",
            "Natural",
            "ipfs://privacy-batch"
        );
        vm.stopPrank();

        // 2. Configure privacy settings
        vm.startPrank(admin);
        privacyLayer.configurePrivacy(
            batchId,
            IPrivacyLayer.PrivacyLevel.PROCESSOR_ONLY,
            "ipfs://privacy-policy"
        );
        vm.stopPrank();

        // 3. Add compliance data that should be protected
        vm.startPrank(complianceManager);
        ethiopianCompliance.addEUDRCertificate(
            batchId,
            "EUDR-PRIVACY-001",
            block.timestamp + 365 days,
            "High",
            "Deforestation-Free"
        );
        vm.stopPrank();

        // 4. Test privacy access controls
        vm.startPrank(processor);
        bool processorAccess = privacyLayer.canAccessBatchData(processor, batchId);
        assertTrue(processorAccess, "Processor should have access to batch data");
        vm.stopPrank();

        vm.startPrank(consumer);
        bool consumerAccess = privacyLayer.canAccessBatchData(consumer, batchId);
        assertFalse(consumerAccess, "Consumer should not have access to batch data");
        vm.stopPrank();

        console.log("PrivacyLayer integration validated");
    }

    /**
     * @dev Test complete system state synchronization
     */
    function testCompleteSystemStateSynchronization() public {
        console.log("=== TESTING COMPLETE SYSTEM STATE SYNCHRONIZATION ===");

        uint256 batchId;
        uint256 redemptionId;

        // 1. Complete batch creation workflow
        vm.startPrank(processor);
        batchId = coffeeToken.createBatch(
            block.timestamp,
            block.timestamp + 365 days,
            200,
            2 ether,
            "Complete Test Region",
            "Complete Test Grade",
            "ipfs://complete-test-batch"
        );
        vm.stopPrank();

        // 2. Complete compliance registration
        vm.startPrank(complianceManager);
        ethiopianCompliance.addEUDRCertificate(
            batchId,
            "COMPLETE-EUDR-001",
            block.timestamp + 365 days,
            "High",
            "Deforestation-Free"
        );

        ethiopianCompliance.addECTAPermit(
            batchId,
            IEthiopianCompliance.ECTAPermit({
                permitNumber: "COMPLETE-ECTA-001",
                expiryDate: block.timestamp + 180 days,
                exportValue: 200 * 2e18,
                issuingAuthority: "ECTA"
            })
        );

        zkManager.addEUDRComplianceZKProof(
            batchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            "Deforestation-Free Verified"
        );

        zkManager.addEthiopianComplianceZKProof(
            batchId,
            TestHelperUtilities.generateMockZKProof(),
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            "ECTA Permit Valid"
        );
        vm.stopPrank();

        // 3. Register trade with BoE
        vm.startPrank(complianceManager);
        ethiopianCompliance.registerTradeWithBoE(
            batchId,
            sellerId,
            consumer,
            processor,
            200,
            200 * 2e18,
            "Complete Bank Transfer"
        );
        vm.stopPrank();

        // 4. Complete payment and redemption workflow
        vm.startPrank(consumer);
        treasury.payForBatch(batchId, 200 * 2e18);
        vm.stopPrank();

        vm.startPrank(admin);
        coffeeToken.mintBatch(consumer, batchId, 200);
        vm.stopPrank();

        vm.startPrank(consumer);
        redemptionId = redemptionContract.requestRedemption(batchId, 200, true);
        vm.stopPrank();

        // 5. Verify complete state synchronization
        // CoffeeToken state
        assertTrue(coffeeToken.isBatchCreated(batchId), "CoffeeToken should have batch");
        assertEq(coffeeToken.balanceOf(consumer, batchId), 200, "Consumer should have tokens");

        // EthiopianCompliance state
        assertTrue(ethiopianCompliance.hasEUDRCertificate(batchId), "Should have EUDR certificate");
        assertTrue(ethiopianCompliance.hasECTAPermit(batchId), "Should have ECTA permit");

        // ZKManager state
        assertTrue(zkManager.hasEUDRComplianceProofs(batchId), "Should have EUDR proofs");
        assertTrue(zkManager.hasEthiopianComplianceProofs(batchId), "Should have Ethiopian proofs");

        // Treasury state
        assertTrue(treasury.hasPaidForBatch(consumer, batchId), "Should have payment record");

        // Redemption state
        (
            address redemptionConsumer,
            uint64 redemptionSellerId,
            uint256 redemptionBatchId,
            uint256 quantity,
            ,
            ,
            ,
            bool requiresEUDRCompliance,
            ,
        ) = redemptionContract.getEnhancedRedemptionDetails(redemptionId);

        assertEq(redemptionConsumer, consumer, "Redemption consumer should match");
        assertEq(redemptionSellerId, sellerId, "Redemption seller ID should match");
        assertEq(redemptionBatchId, batchId, "Redemption batch ID should match");
        assertEq(quantity, 200, "Redemption quantity should match");
        assertTrue(requiresEUDRCompliance, "Redemption should require EUDR compliance");

        console.log("Complete system state synchronization validated");
        console.log("All contracts in sync");
        console.log("Data flows correctly between contracts");
        console.log("State transitions work as expected");
    }
}
