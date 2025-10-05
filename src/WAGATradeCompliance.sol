// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGATradeCompliance} from "./Interfaces/IWAGATradeCompliance.sol";
import {IWAGABankingCore} from "./Interfaces/IWAGABankingCore.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {TradeRegistrationLib} from "./libraries/TradeRegistrationLib.sol";

// Import DEFAULT_ADMIN_ROLE constant
bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;

/**
 * @title WAGATradeCompliance
 * @dev Ethiopian trade compliance and Bank of Ethiopia integration
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
 * @author WAGA Team
 */
contract WAGATradeCompliance is IWAGATradeCompliance, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error OfframpPartnerNotAssigned();
    error UnauthorizedOfframpConfirmation();
    error UnauthorizedBankConfirmation();
    error InvalidTransferStage();
    error UnauthorizedSellerConfirmation();
    error SellerNotRegistered();
    error PaymentAlreadyConfirmed();
    error TransferNotFound();
    error TransferAlreadyExists();
    error InvalidSellerId();
    error CallerDoesNotHaveRequiredRole();
    error InvalidAccessControlAddress();
    error TradeRegistrationNotFound();
    error FiatTransferAlreadyInitiated();
    error FiatTransferAlreadyCompleted();
    error UpstreamComplianceNotMet();

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // Central Authority
    WAGAConfigManager public immutable authority;

    // Contract dependencies
    IWAGABankingCore public bankingCore;
    IWAGACoffeeToken public coffeeToken;
    address public complianceCore;

    // Trade registration tracking
    mapping(uint256 => mapping(address => IEthiopianCompliance.BoETradeRegistration)) private tradeRegistrations;
    
    // Multi-stage fiat transfer tracking
    mapping(uint256 => mapping(uint64 => IEthiopianCompliance.FiatTransfer)) private fiatTransfers;
    mapping(uint256 => mapping(uint64 => IEthiopianCompliance.OfframpTransfer)) private offrampTransfers;

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event OfframpPartnerAssigned(uint256 indexed batchId, bytes11 indexed offrampSwift, IEthiopianCompliance.OfframpPartnerType partnerType);
    event FiatTransferStageConfirmed(uint256 indexed batchId, address indexed buyer, IEthiopianCompliance.TransferStage stage, string transactionId);
    event SellerPaymentConfirmed(uint256 indexed batchId, address indexed buyer, uint64 indexed sellerId, uint256 usdAmountReceived, string transactionId);
    event OfframpTransferExecuted(uint256 indexed batchId, address indexed buyer, bytes11 indexed offrampSwift, uint256 usdAmount, uint256 timestamp);
    event TradeRegisteredWithBoE(uint256 indexed batchId, address indexed buyer, uint256 tradeId);
    event FiatTransferRequested(
        uint256 indexed batchId,
        address indexed buyer,
        address indexed seller,
        uint256 valueUSD,
        string buyerBankDetails,
        string ectaPermitNumber
    );
    event FiatTransferCompleted(uint256 indexed batchId, address indexed buyer, string bankTransactionId);
    event PhysicalShipmentAuthorized(uint256 indexed batchId, address indexed buyer);

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert CallerDoesNotHaveRequiredRole();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _authority,
        address _bankingCore
    ) {
        if (_authority == address(0)) {
            revert InvalidAccessControlAddress();
        }
        if (_bankingCore == address(0)) {
            revert InvalidAccessControlAddress();
        }
        
        authority = WAGAConfigManager(_authority);
        bankingCore = IWAGABankingCore(_bankingCore);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Configuration                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function setBankingCore(address _bankingCore) external override callerHasRole(DEFAULT_ADMIN_ROLE) {
        if (_bankingCore == address(0)) {
            revert InvalidAccessControlAddress();
        }
        bankingCore = IWAGABankingCore(_bankingCore);
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function setCoffeeToken(address _coffeeToken) external override callerHasRole(DEFAULT_ADMIN_ROLE) {
        if (_coffeeToken == address(0)) {
            revert InvalidAccessControlAddress();
        }
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function setComplianceCore(address _complianceCore) external override callerHasRole(DEFAULT_ADMIN_ROLE) {
        if (_complianceCore == address(0)) {
            revert InvalidAccessControlAddress();
        }
        complianceCore = _complianceCore;
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function getBankingCore() external view override returns (address) {
        return address(bankingCore);
    }

    /* -------------------------------------------------------------------------- */
    /*                           MULTI-STAGE TRANSFER FUNCTIONS                   */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function confirmFiatTransferStage(
        uint256 batchId,
        address buyer,
        IEthiopianCompliance.TransferStage stage,
        string memory transactionId
    ) external override callerHasRole(keccak256("COMPLIANCE_MANAGER_ROLE")) {
        // Convert buyer address to sellerId for lookup
        uint64 sellerId = coffeeToken.getSellerId(buyer);
        
        IEthiopianCompliance.FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];
        
        if (transfer.offrampBankSwift == bytes11(0)) {
            revert TransferNotFound();
        }
        
        // Validate stage progression
        if (stage == IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP) {
            revert InvalidTransferStage(); // Cannot confirm initiation
        }
        
        transfer.currentStage = stage;
        transfer.stageTransactionIds[stage] = transactionId;
        transfer.stageTimestamps[stage] = block.timestamp;
        
        emit FiatTransferStageConfirmed(batchId, buyer, stage, transactionId);
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function confirmSellerPayment(
        uint256 batchId,
        address buyer,
        uint256 usdAmountReceived,
        string memory sellerTransactionId
    ) external override callerHasRole(keccak256("COMPLIANCE_MANAGER_ROLE")) {
        uint64 sellerId = coffeeToken.getSellerId(buyer);
        
        IEthiopianCompliance.FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];
        
        if (transfer.offrampBankSwift == bytes11(0)) {
            revert TransferNotFound();
        }
        
        if (transfer.sellerPaymentConfirmed) {
            revert PaymentAlreadyConfirmed();
        }
        
        transfer.usdAmountReceivedBySeller = usdAmountReceived;
        transfer.sellerPaymentConfirmed = true;
        transfer.stageTransactionIds[IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED] = sellerTransactionId;
        
        emit SellerPaymentConfirmed(batchId, buyer, sellerId, usdAmountReceived, sellerTransactionId);
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function recordOfframpTransferInitiated(
        uint256 batchId,
        address buyer,
        bytes11 offrampSwift,
        uint256 usdAmount
    ) external override callerHasRole(keccak256("OFFRAMP_EXECUTOR_ROLE")) {
        uint64 sellerId = coffeeToken.getSellerId(buyer);
        
        IEthiopianCompliance.OfframpTransfer storage offrampTransfer = offrampTransfers[batchId][sellerId];
        
        if (offrampTransfer.transferCompleted) {
            revert TransferAlreadyExists();
        }
        
        offrampTransfer.offrampPartner = offrampSwift;
        offrampTransfer.usdAmount = usdAmount;
        offrampTransfer.transferTimestamp = block.timestamp;
        offrampTransfer.transferCompleted = true;
        
        // Also update the fiat transfer tracking
        IEthiopianCompliance.FiatTransfer storage fiatTransfer = fiatTransfers[batchId][sellerId];
        fiatTransfer.offrampBankSwift = offrampSwift;
        fiatTransfer.usdAmountPaid = usdAmount;
        fiatTransfer.currentStage = IEthiopianCompliance.TransferStage.USDC_CONFIRMED_BY_OFFRAMP;
        
        emit OfframpTransferExecuted(batchId, buyer, offrampSwift, usdAmount, block.timestamp);
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function getFiatTransfer(uint256 batchId, address buyer) external view override returns (
        uint64 sellerId,
        bytes11 offrampBankSwift,
        bytes11 receivingBankSwift,
        uint256 usdAmountPaid,
        uint256 usdAmountReceivedBySeller,
        IEthiopianCompliance.TransferStage currentStage,
        bool sellerPaymentConfirmed
    ) {
        sellerId = coffeeToken.getSellerId(buyer);
        IEthiopianCompliance.FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];
        
        return (
            sellerId,
            transfer.offrampBankSwift,
            transfer.receivingBankSwift,
            transfer.usdAmountPaid,
            transfer.usdAmountReceivedBySeller,
            transfer.currentStage,
            transfer.sellerPaymentConfirmed
        );
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function getTransferStageStatus(
        uint256 batchId,
        address buyer,
        IEthiopianCompliance.TransferStage stage
    ) external view override returns (bool completed, string memory transactionId, uint256 timestamp) {
        uint64 sellerId = coffeeToken.getSellerId(buyer);
        IEthiopianCompliance.FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];
        
        completed = transfer.stageTimestamps[stage] > 0;
        transactionId = transfer.stageTransactionIds[stage];
        timestamp = transfer.stageTimestamps[stage];
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function confirmFiatTransfer(
        uint256 batchId,
        address buyer,
        string memory bankTransactionId
    ) external override {
        // Verify caller is authorized bank
        if (!bankingCore.isAuthorizedBank(msg.sender)) {
            revert UnauthorizedBankConfirmation();
        }
        
        uint64 sellerId = coffeeToken.getSellerId(buyer);
        IEthiopianCompliance.FiatTransfer storage transfer = fiatTransfers[batchId][sellerId];
        
        if (transfer.offrampBankSwift == bytes11(0)) {
            revert TransferNotFound();
        }
        
        if (transfer.currentStage == IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED) {
            revert FiatTransferAlreadyCompleted();
        }
        
        transfer.currentStage = IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED;
        transfer.stageTransactionIds[IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED] = bankTransactionId;
        transfer.stageTimestamps[IEthiopianCompliance.TransferStage.SELLER_PAYMENT_CONFIRMED] = block.timestamp;
        
        emit FiatTransferCompleted(batchId, buyer, bankTransactionId);
        emit PhysicalShipmentAuthorized(batchId, buyer);
    }

    /* -------------------------------------------------------------------------- */
    /*                         BANK OF ETHIOPIA INTEGRATION                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function registerTradeWithBoE(
        uint256 batchId,
        address buyer,
        address seller,
        uint256 quantity,
        uint256 valueUSD,
        string memory buyerBankDetails
    ) external override callerHasRole(keccak256("COMPLIANCE_MANAGER_ROLE")) {
        // Validate upstream compliance using library
        bool isValid = TradeRegistrationLib.validateUpstreamCompliance(complianceCore, batchId);
        if (!isValid) {
            revert UpstreamComplianceNotMet();
        }
        
        // Get compliance documents using library
        IEthiopianCompliance.ECTAPermit memory permit = TradeRegistrationLib.getECTAPermit(complianceCore, batchId);
        IEthiopianCompliance.QualityCertificate memory certificate = TradeRegistrationLib.getQualityCertificate(complianceCore, batchId);
        
        // Convert seller address to sellerId for gas-efficient storage
        uint64 sellerId = coffeeToken.getSellerId(seller);

        // Assign offramp partner dynamically
        (bytes11 assignedOfframpSwift, IEthiopianCompliance.OfframpPartnerType assignedPartnerType) = bankingCore.assignOfframpPartner(batchId);

        // Create registration using library
        IEthiopianCompliance.BoETradeRegistration memory registration = TradeRegistrationLib.createTradeRegistration(
            batchId,
            sellerId,
            buyer,
            quantity,
            valueUSD,
            permit,
            certificate,
            assignedOfframpSwift,
            assignedPartnerType
        );
        
        // Validate registration using library
        TradeRegistrationLib.validateTradeRegistration(registration);
        
        // Store registration
        tradeRegistrations[batchId][buyer] = registration;
        
        // Generate trade ID using library
        uint256 tradeId = TradeRegistrationLib.generateTradeId(batchId, buyer, block.timestamp);
        
        emit TradeRegisteredWithBoE(batchId, buyer, tradeId);
        emit FiatTransferRequested(
            batchId,
            buyer,
            seller,
            valueUSD,
            buyerBankDetails,
            permit.permitNumber
        );
    }

    /**
     * @inheritdoc IWAGATradeCompliance
     */
    function getBoETradeRegistration(
        uint256 batchId,
        address buyer
    ) external view override returns (IEthiopianCompliance.BoETradeRegistration memory registration) {
        registration = tradeRegistrations[batchId][buyer];
        if (registration.batchId == 0) {
            revert TradeRegistrationNotFound();
        }
        return registration;
    }
}