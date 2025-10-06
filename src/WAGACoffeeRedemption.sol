// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// AccessControl removed - using coffee token for role checks
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {IWAGATreasury} from "./Interfaces/IWAGATreasury.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGAEthiopianBanking} from "./Interfaces/IWAGAEthiopianBanking.sol";
import {IWAGABatchManager} from "./Interfaces/IWAGABatchManager.sol";
import {IWAGAZKManager} from "./Interfaces/IWAGAZKManager.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";

contract WAGACoffeeRedemption is ReentrancyGuard, ERC1155Holder {
    /* -------------------------------------------------------------------------- */
    /*                                CUSTOM ERRORS                               */
    /* -------------------------------------------------------------------------- */

    error WAGACoffeeRedemption__ZeroQuantity_requestRedemption();
    error WAGACoffeeRedemption__InsufficientTokenBalance_requestRedemption();
    error WAGACoffeeRedemption__BatchNotVerified_requestRedemption();
    error WAGACoffeeRedemption__BatchMetadataNotVerified_requestRedemption();
    error WAGACoffeeRedemption__RedemptionDoesNotExist_updateRedemptionStatus();
    error WAGACoffeeRedemption__CannotSetStatusBackToRequested_updateRedemptionStatus();
    error WAGACoffeeRedemption__RedemptionAlreadyFulfilled_updateRedemptionStatus();
    error WAGACoffeeRedemption__RedemptionAlreadyCancelled_updateRedemptionStatus();
    error WAGACoffeeRedemption__RedemptionDoesNotExist_getRedemptionDetails();
    error WAGACoffeeRedemption__AlreadyInitialized_initialize();
    error WAGACoffeeRedemption__ContractNotInitialized();
    error WAGACoffeeRedemption__BatchExpired_requestRedemption();
    error WAGACoffeeRedemption__BatchDoesNotExist_requestRedemption();
    error WAGACoffeeRedemption__statusMustBeDifferentFromCurrentStatus_updateRedemptionStatus(
        RedemptionStatus status
    );
    error WAGACoffeeRedemption__CallerDoesNotHaveRequiredRole_callHasRoleFromCoffeeToken();
    error WAGACoffeeRedemption__PaymentRequired_requestRedemption();
    error WAGACoffeeRedemption__PaymentNotReceived_requestRedemption();
    error WAGACoffeeRedemption__EthiopianComplianceNotMet_requestRedemption();
    error WAGACoffeeRedemption__FiatTransferNotCompleted_updateRedemptionStatus();
    error WAGACoffeeRedemption__InvalidBankingDetails_requestRedemption();
    error WAGACoffeeRedemption__EUDRComplianceNotMet_requestRedemption();
    error WAGACoffeeRedemption__ZKComplianceValidationFailed_requestRedemption();
    error WAGACoffeeRedemption__OfframpTransferNotExecuted_confirmFiatTransferStage();
    error WAGACoffeeRedemption__InvalidTransferStage_confirmFiatTransferStage();
    error WAGACoffeeRedemption__TransferAlreadyConfirmed_confirmFiatTransferStage();
    error WAGACoffeeRedemption__SellerNotFound_getRedemptionSellerId();
    error WAGACoffeeRedemption__SellerPaymentNotConfirmed_confirmSellerPayment();
    error WAGACoffeeRedemption__UnauthorizedSellerConfirmation_confirmSellerPayment();
    error WAGACoffeeRedemption__InvalidCoffeeTokenAddress_constructor();
    error WAGACoffeeRedemption__InvalidTreasuryAddress_constructor();
    error WAGACoffeeRedemption__InvalidEthiopianComplianceAddress_constructor();
    error WAGACoffeeRedemption__InvalidBatchManagerAddress_constructor();
    error WAGACoffeeRedemption__InvalidZKManagerAddress_constructor();
    error WAGACoffeeRedemption__Unauthorized_updateEthiopianCompliance();
    error WAGACoffeeRedemption__Unauthorized_setEthiopianComplianceAddress();
    error WAGACoffeeRedemption__InvalidEthiopianComplianceAddress_setEthiopianComplianceAddress();
    error WAGACoffeeRedemption__Unauthorized_setEthiopianBanking();
    error WAGACoffeeRedemption__InvalidEthiopianBankingAddress();
    error WAGACoffeeRedemption__InvalidTreasuryAddress();
    error WAGACoffeeRedemption__TreasuryNotConfigured();
    error WAGACoffeeRedemption__RedemptionDoesNotExist_confirmFiatTransferStage();
    error WAGACoffeeRedemption__NotEthiopianBatch_confirmFiatTransferStage();
    error WAGACoffeeRedemption__FiatTransferAlreadyCompleted_confirmFiatTransferStage();
    error WAGACoffeeRedemption__RedemptionDoesNotExist_getEnhancedRedemptionDetails();
    error WAGACoffeeRedemption__RedemptionDoesNotExist_getRedemptionSellerId();
    error WAGACoffeeRedemption__RedemptionDoesNotExist_confirmFiatTransfer();
    error WAGACoffeeRedemption__NotEthiopianBatch_confirmFiatTransfer();
    error WAGACoffeeRedemption__FiatTransferAlreadyCompleted_confirmFiatTransfer();
    error WAGACoffeeRedemption__NotAuthorizedBankingPartner_confirmFiatTransfer();
    error WAGACoffeeRedemption__RedemptionDoesNotExist_confirmSellerPayment();

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                             */
    /* -------------------------------------------------------------------------- */

    // Treasury contract for payment verification
    IWAGATreasury public treasury;
    
    // Ethiopian compliance contracts (split architecture)
    IEthiopianCompliance public ethiopianCompliance;           // For type definitions
    IWAGAEthiopianBanking public ethiopianBanking;             // For banking operations
    
    // Batch manager contract
    IWAGABatchManager public batchManager;

    // ZK manager for compliance validation
    IWAGAZKManager public zkManager;

    // Note: Access control is handled through coffeeToken (inherits from WAGAConfigManager)

    /* -------------------------------------------------------------------------- */
    /*                               TYPE DECLARATIONS                            */
    /* -------------------------------------------------------------------------- */

    // Redemption status enum
    enum RedemptionStatus {
        Requested,
        Processing, // Picking => Packing => Shipping (Tracking Number)
        Fulfilled,
        Cancelled
    }

    // Redemption request structure
    // Optimized struct layout for better storage packing
    struct RedemptionRequest {
        address consumer;                     // 20 bytes (slot 0)
        uint64 sellerId;                     // 8 bytes 
        RedemptionStatus status;             // 1 byte 
        bool requiresEthiopianCompliance;    // 1 byte
        bool requiresEUDRCompliance;         // 1 byte
        bool fiatTransferCompleted;          // 1 byte (slot 0 - 32 bytes total)
        uint256 batchId;                     // 32 bytes (slot 1)
        uint256 quantity;                    // 32 bytes (slot 2)
        uint256 requestDate;                 // 32 bytes (slot 3)
        uint256 fulfillmentDate;             // 32 bytes (slot 4)
        bytes11 offrampBankSwift;            // 11 bytes (slot 5)
        bytes11 receivingBankSwift;          // 11 bytes (slot 5 - 22 bytes total)
        string buyerBankDetails;             // variable (slot 6+)
        string bankTransactionId;            // variable
    }

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // ...existing code...
    WAGACoffeeTokenCore public coffeeToken;
    // Mapping from redemption ID to redemption request
    mapping(uint256 => RedemptionRequest) public redemptions;
    uint256 public nextRedemptionId; // 1000

    // Mapping from consumer address to their redemption IDs
    mapping(address consumer => uint256[] redemptionIds)
        private consumerRedemptions;

    // Mapping to track batches with pending redemptions
    mapping(uint256 batchId => uint256 countOfPendingRedemptions)
        private batchPendingRedemptions; // batchId to count of pending redemptions

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event RedemptionRequested(
        uint256 indexed redemptionId,
        address indexed consumer,
        uint256 batchId,
        uint256 quantity,
        string packagingInfo
    );
    event RedemptionStatusUpdated(
        uint256 indexed redemptionId,
        RedemptionStatus status
    );
    event RedemptionFulfilled(
        uint256 indexed redemptionId,
        uint256 fulfillmentDate // shipping date or delivery date ?
    );
    event EthiopianComplianceValidated(
        uint256 indexed batchId,
        uint256 indexed redemptionId
    );
    event BoETradeRegistered(
        uint256 indexed batchId,
        address indexed buyer,
        uint256 valueUSD,
        uint256 valueETB
    );

    event ZKTradeCompliant(
        uint256 indexed batchId,
        address indexed buyer,
        string complianceMethod
    );

    event FiatTransferConfirmed(
        uint256 indexed redemptionId,
        string bankTransactionId
    );

    // EUDR and ZK Compliance Events
    event EUDRComplianceValidated(
        uint256 indexed batchId,
        uint256 indexed redemptionId,
        bool deforestationCompliant,
        bool geolocationVerified
    );
    event ZKComplianceValidated(
        uint256 indexed batchId,
        uint256 indexed redemptionId,
        IZKVerifier.ProofType proofType,
        bool verified
    );

    // Enhanced Fiat Transfer Events
    event FiatTransferStageConfirmed(
        uint256 indexed redemptionId,
        IEthiopianCompliance.TransferStage stage,
        string transactionId,
        uint256 timestamp
    );
    event SellerPaymentConfirmed(
        uint256 indexed redemptionId,
        uint64 indexed sellerId,
        uint256 usdAmountReceived,
        string sellerTransactionId
    );

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!coffeeToken.hasRole(role, msg.sender)) {
            revert WAGACoffeeRedemption__CallerDoesNotHaveRequiredRole_callHasRoleFromCoffeeToken();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _coffeeToken,
        address _treasury,
        address _ethiopianCompliance,
        address _ethiopianBanking,
        address _batchManager,
        address _zkManager
    ) {
        if (_coffeeToken == address(0)) {
            revert WAGACoffeeRedemption__InvalidCoffeeTokenAddress_constructor();
        }
        if (_treasury == address(0)) {
            revert WAGACoffeeRedemption__InvalidTreasuryAddress_constructor();
        }
        if (_ethiopianCompliance == address(0)) {
            revert WAGACoffeeRedemption__InvalidEthiopianComplianceAddress_constructor();
        }
        if (_ethiopianBanking == address(0)) {
            revert("Invalid Ethiopian banking address");
        }
        if (_batchManager == address(0)) {
            revert WAGACoffeeRedemption__InvalidBatchManagerAddress_constructor();
        }
        if (_zkManager == address(0)) {
            revert WAGACoffeeRedemption__InvalidZKManagerAddress_constructor();
        }

        coffeeToken = WAGACoffeeTokenCore(_coffeeToken);
        treasury = IWAGATreasury(_treasury);
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
        ethiopianBanking = IWAGAEthiopianBanking(_ethiopianBanking);
        batchManager = IWAGABatchManager(_batchManager);
        zkManager = IWAGAZKManager(_zkManager);
        nextRedemptionId = 1000;
    }

    /**
     * @dev Verify system configuration is valid
     */
    function verifyConfiguration() external view returns (bool isValid, string memory reason) {
        if (address(treasury) == address(0)) {
            return (false, "Treasury not configured");
        }
        
        if (address(coffeeToken) == address(0)) {
            return (false, "Coffee token not configured");
        }
        
        if (address(ethiopianCompliance) == address(0)) {
            return (false, "Ethiopian compliance not configured");
        }

        if (address(ethiopianBanking) == address(0)) {
            return (false, "Ethiopian banking not configured");
        }
        
        return (true, "Configuration is valid");
    }

    /**
     * @dev Update treasury contract address (admin only)
     * @param _treasury New treasury contract address
     */
    function setTreasury(address _treasury) external {
        // FIXED: Removed self-reference bypass - only admin can update treasury
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            revert WAGACoffeeRedemption__Unauthorized_updateEthiopianCompliance();
        }
        if (_treasury == address(0)) {
            revert WAGACoffeeRedemption__InvalidTreasuryAddress();
        }
        treasury = IWAGATreasury(_treasury);
    }

    /**
     * @dev Update Ethiopian compliance contract address (admin only)
     * @param _ethiopianCompliance New Ethiopian compliance contract address
     */
    function setEthiopianCompliance(address _ethiopianCompliance) external {
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            revert WAGACoffeeRedemption__Unauthorized_setEthiopianComplianceAddress();
        }
        if (_ethiopianCompliance == address(0)) {
            revert WAGACoffeeRedemption__InvalidEthiopianComplianceAddress_setEthiopianComplianceAddress();
        }
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
    }

    /**
     * @dev Update Ethiopian banking contract address (admin only)
     * @param _ethiopianBanking New Ethiopian banking contract address
     */
    function setEthiopianBanking(address _ethiopianBanking) external {
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            revert WAGACoffeeRedemption__Unauthorized_setEthiopianBanking();
        }
        if (_ethiopianBanking == address(0)) {
            revert("Invalid Ethiopian banking address");
        }
        ethiopianBanking = IWAGAEthiopianBanking(_ethiopianBanking);
    }

    /* -------------------------------------------------------------------------- */
    /*                              EXTERNAL FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Requests redemption of coffee tokens for physical delivery
     * @param batchId Batch identifier
     * @param quantity Number of coffee bags to redeem
     * @param buyerBankDetails Bank details for fiat transfer (required for Ethiopian batches)
     * @return redemptionId Unique identifier for tracking this redemption request
     */
    function requestRedemption(
        uint256 batchId,
        uint256 quantity,
        string memory buyerBankDetails
    ) external nonReentrant returns (uint256 redemptionId) {
        // Ensure the batch exists
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGACoffeeRedemption__BatchDoesNotExist_requestRedemption();
        }
        // Ensure the quantity is greater than zero and consumer has enough tokens
        if (quantity == 0) {
            revert WAGACoffeeRedemption__ZeroQuantity_requestRedemption();
        }
        if (coffeeToken.balanceOf(msg.sender, batchId) < quantity) {
            revert WAGACoffeeRedemption__InsufficientTokenBalance_requestRedemption();
        }

        // Fetch batch info from coffee token (for expiry and packaging only)
        (
            ,
            uint256 expiryDate,
            ,
            ,
            string memory packagingInfo,
            ,
            // lastVerifiedTimestamp unused
        ) = coffeeToken.getBatchInfo(batchId);

        // Check batch verification status from batch manager (proper modular approach)
        bool isBatchVerified = batchManager.isBatchVerified(batchId);
        bool isMetadataVerified = batchManager.isBatchMetadataVerified(batchId);

        // Ensure the batch has not expired
        if (block.timestamp > expiryDate) {
            revert WAGACoffeeRedemption__BatchExpired_requestRedemption();
        }

        // Ensure the batch is verified and metadata is verified
        if (!isBatchVerified) {
            revert WAGACoffeeRedemption__BatchNotVerified_requestRedemption();
        }

        if (!isMetadataVerified) {
            revert WAGACoffeeRedemption__BatchMetadataNotVerified_requestRedemption();
        }

        // Check compliance requirements
        bool requiresEthiopianCompliance = _checkIfEthiopianBatch(batchId);
        bool requiresEUDRCompliance = _checkIfEUDRBatch(batchId);

        // Validate EUDR compliance if required
        if (requiresEUDRCompliance) {
            (bool deforestationCompliant, , ) = zkManager.validateEUDRZKCompliance(batchId);
            if (!deforestationCompliant) {
                revert WAGACoffeeRedemption__EUDRComplianceNotMet_requestRedemption();
            }
        }

        // Validate Ethiopian compliance if required
        if (requiresEthiopianCompliance) {
            if (bytes(buyerBankDetails).length == 0) {
                revert WAGACoffeeRedemption__InvalidBankingDetails_requestRedemption();
            }
            if (!ethiopianCompliance.validateUpstreamCompliance(batchId)) {
                revert WAGACoffeeRedemption__EthiopianComplianceNotMet_requestRedemption();
            }
        }

        // MANDATORY payment verification - no optional checks
        if (address(treasury) == address(0)) {
            revert WAGACoffeeRedemption__TreasuryNotConfigured();
        }
        
        // Check if payment is required for this batch
        (uint256 requiredPayment, ) = treasury.getBatchPaymentInfo(batchId);
        if (requiredPayment > 0) {
            // Verify payment has been made
            bool hasPaid = treasury.checkPaymentStatus(msg.sender, batchId);
            if (!hasPaid) {
                revert WAGACoffeeRedemption__PaymentNotReceived_requestRedemption();
            }
        }

        // Get seller ID for the batch creator (validate before token transfer)
        uint64 sellerId = _getBatchSellerId(batchId);

        // Create redemption ID (validate before token transfer)
        redemptionId = nextRedemptionId;
        nextRedemptionId++; // redemptionId = nextRedemptionId + 1;

        // FIXED: All validations passed - now safe to transfer tokens
        // Transfer tokens from consumer to this contract
        coffeeToken.safeTransferFrom(
            msg.sender,
            address(this),
            batchId,
            quantity,
            ""
        );

        // Update the redemption mapping
        redemptions[redemptionId] = RedemptionRequest({
            consumer: msg.sender,
            sellerId: sellerId,
            batchId: batchId,
            quantity: quantity,
            requestDate: block.timestamp,
            status: RedemptionStatus.Requested,
            fulfillmentDate: 0,
            buyerBankDetails: buyerBankDetails,
            requiresEthiopianCompliance: requiresEthiopianCompliance,
            requiresEUDRCompliance: requiresEUDRCompliance,
            fiatTransferCompleted: false,
            offrampBankSwift: 0,    // To be set during transfer initiation
            receivingBankSwift: 0,  // To be set during transfer initiation
            bankTransactionId: ""
        });

        // Track redemption for the consumer
        consumerRedemptions[msg.sender].push(redemptionId);

        // Increment pending redemptions counter for this batch
        batchPendingRedemptions[batchId]++;

        // Handle compliance validations and events
        if (requiresEUDRCompliance) {
            emit EUDRComplianceValidated(batchId, redemptionId, true, false);
        }
        if (requiresEthiopianCompliance) {
            _handleEthiopianCompliance(batchId, msg.sender, quantity, requiredPayment, buyerBankDetails);
            emit EthiopianComplianceValidated(batchId, redemptionId);
        }

        emit RedemptionRequested(
            redemptionId,
            msg.sender,
            batchId,
            quantity,
            packagingInfo
        );
        
        return redemptionId;
    }

    /**
     * @dev Updates the status of a redemption request
     * @param redemptionId Redemption identifier
     * @param status New status
     */
    function updateRedemptionStatus(
        uint256 redemptionId,
        RedemptionStatus status
    ) external callerHasRole(coffeeToken.FULFILLER_ROLE()) {
        // Check if redemption exists
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_updateRedemptionStatus();
        }
        // Ensure the status is different from the current status
        RedemptionStatus currentStatus = redemptions[redemptionId].status;
        if (currentStatus == status) {
            revert WAGACoffeeRedemption__statusMustBeDifferentFromCurrentStatus_updateRedemptionStatus(
                currentStatus
            );
        }

        RedemptionRequest storage request = redemptions[redemptionId];
        // Check if the request is already fulfilled or cancelled
        if (request.status == RedemptionStatus.Fulfilled) {
            revert WAGACoffeeRedemption__RedemptionAlreadyFulfilled_updateRedemptionStatus();
        }
        if (request.status == RedemptionStatus.Cancelled) {
            revert WAGACoffeeRedemption__RedemptionAlreadyCancelled_updateRedemptionStatus();
        }

        // For Ethiopian batches requiring fiat transfer, check completion before fulfillment
        if (status == RedemptionStatus.Fulfilled && request.requiresEthiopianCompliance) {
            if (!request.fiatTransferCompleted) {
                revert WAGACoffeeRedemption__FiatTransferNotCompleted_updateRedemptionStatus();
            }
        }

        // Fixed: Only decrement if status was previously Requested and we're moving to a final state
        if (
            request.status == RedemptionStatus.Requested &&
            (status == RedemptionStatus.Fulfilled ||
                status == RedemptionStatus.Cancelled)
        ) {
            // Ensure counter doesn't underflow
            if (batchPendingRedemptions[request.batchId] > 0) {
                batchPendingRedemptions[request.batchId]--;
            }
        }

        request.status = status;

        if (status == RedemptionStatus.Fulfilled) {
            request.fulfillmentDate = block.timestamp;

            // Burn the tokens as they've been redeemed
            coffeeToken.burnForRedemption(
                address(this),
                request.batchId,
                request.quantity
            );

            emit RedemptionFulfilled(redemptionId, request.fulfillmentDate);
        } else if (status == RedemptionStatus.Cancelled) {
            // Return tokens to the consumer
            coffeeToken.safeTransferFrom(
                address(this),
                request.consumer,
                request.batchId,
                request.quantity,
                ""
            );
        }

        emit RedemptionStatusUpdated(redemptionId, status);
    }

    /**
     * @dev Confirm fiat transfer completion for Ethiopian batches
     * @param redemptionId Redemption identifier
     * @param bankTransactionId Bank transaction identifier
     */
    function confirmFiatTransfer(
        uint256 redemptionId,
        string memory bankTransactionId
    ) external {
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_confirmFiatTransfer();
        }

        RedemptionRequest storage request = redemptions[redemptionId];
        if (!request.requiresEthiopianCompliance) {
            revert WAGACoffeeRedemption__NotEthiopianBatch_confirmFiatTransfer();
        }
        if (request.fiatTransferCompleted) {
            revert WAGACoffeeRedemption__FiatTransferAlreadyCompleted_confirmFiatTransfer();
        }

        // Only authorized banking partners can confirm fiat transfers
        if (!ethiopianBanking.isAuthorizedBank(msg.sender)) {
            revert WAGACoffeeRedemption__NotAuthorizedBankingPartner_confirmFiatTransfer();
        }
        
        request.fiatTransferCompleted = true;
        request.bankTransactionId = bankTransactionId;
        
        emit FiatTransferConfirmed(redemptionId, bankTransactionId);
    }

    /**
     * @dev Checks if a batch has pending redemption requests
     * @param batchId Batch identifier to check
     * @return True if batch has pending redemptions, false otherwise
     */
    function hasPendingRedemptions(
        uint256 batchId
    ) external view returns (bool) {
        return batchPendingRedemptions[batchId] > 0;
    }

    /**
     * @dev Returns redemption request details
     * @param redemptionId Redemption identifier
     * @return RedemptionRequest struct containing redemption details
     */
    function getRedemptionDetails(
        uint256 redemptionId
    ) external view returns (RedemptionRequest memory) {
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_getRedemptionDetails();
        }
        return redemptions[redemptionId];
    }

    /**
     * @dev Returns all redemption requests for a consumer
     * @param consumer Consumer address
     * @return Array of redemption IDs
     */
    function getConsumerRedemptions(
        address consumer
    ) external view returns (uint256[] memory) {
        return consumerRedemptions[consumer];
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(
        bytes4 interfaceId
    )
        public
        view
        virtual
        override(ERC1155Holder)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /* -------------------------------------------------------------------------- */
    /*                        ENHANCED FIAT TRANSFER FUNCTIONS                    */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Confirm a specific stage in the fiat transfer process
     * @param redemptionId Redemption identifier
     * @param stage Transfer stage to confirm
     * @param transactionId Transaction ID for this stage
     */
    function confirmFiatTransferStage(
        uint256 redemptionId,
        IEthiopianCompliance.TransferStage stage,
        string memory transactionId
    ) external {
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_confirmFiatTransferStage();
        }

        RedemptionRequest storage request = redemptions[redemptionId];

        // Only allow confirmation for redemptions that require Ethiopian compliance
        if (!request.requiresEthiopianCompliance) {
            revert WAGACoffeeRedemption__InvalidTransferStage_confirmFiatTransferStage();
        }

        // Check if offramp transfer was executed first (for USDC_SENT_TO_OFFRAMP stage)
        if (stage == IEthiopianCompliance.TransferStage.USDC_SENT_TO_OFFRAMP) {
            if (!treasury.hasOfframpTransferExecuted(request.batchId, request.consumer)) {
                revert WAGACoffeeRedemption__OfframpTransferNotExecuted_confirmFiatTransferStage();
            }
        }

        // Confirm the stage through the compliance contract
        ethiopianBanking.confirmFiatTransferStage(
            request.batchId,
            request.consumer,
            stage,
            transactionId
        );

        emit FiatTransferStageConfirmed(redemptionId, stage, transactionId, block.timestamp);
    }

    /**
     * @dev Confirm that the seller has received payment
     * @param redemptionId Redemption identifier
     * @param usdAmountReceived USD amount the seller actually received
     * @param sellerTransactionId Seller's transaction ID
     */
    function confirmSellerPayment(
        uint256 redemptionId,
        uint256 usdAmountReceived,
        string memory sellerTransactionId
    ) external {
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_confirmSellerPayment();
        }

        RedemptionRequest storage request = redemptions[redemptionId];

        // Only the seller or authorized banking partner can confirm seller payment
        if (msg.sender != _getSellerAddress(request.sellerId) &&
            !ethiopianBanking.isAuthorizedBank(msg.sender)) {
            revert WAGACoffeeRedemption__UnauthorizedSellerConfirmation_confirmSellerPayment();
        }

        // Confirm seller payment through compliance contract
        ethiopianBanking.confirmSellerPayment(
            request.batchId,
            request.consumer,
            usdAmountReceived,
            sellerTransactionId
        );

        emit SellerPaymentConfirmed(redemptionId, request.sellerId, usdAmountReceived, sellerTransactionId);
    }

    /**
     * @dev Get the seller ID for a redemption
     * @param redemptionId Redemption identifier
     * @return sellerId The seller's digital ID
     */
    function getRedemptionSellerId(uint256 redemptionId) external view returns (uint64 sellerId) {
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__SellerNotFound_getRedemptionSellerId();
        }
        return redemptions[redemptionId].sellerId;
    }

    /**
     * @dev Get enhanced redemption details including seller ID and SWIFT codes
     * @param redemptionId Redemption identifier
     * @return consumer Consumer address
     * @return sellerId Seller's digital ID
     * @return batchId Batch identifier
     * @return quantity Redemption quantity
     * @return status Redemption status
     * @return requiresEthiopianCompliance Whether Ethiopian compliance is required
     * @return requiresEUDRCompliance Whether EUDR compliance is required
     * @return fiatTransferCompleted Whether fiat transfer is completed
     * @return offrampBankSwift SWIFT code for offramp partner
     * @return receivingBankSwift SWIFT code for receiving bank
     */
    function getEnhancedRedemptionDetails(uint256 redemptionId) external view returns (
        address consumer,
        uint64 sellerId,
        uint256 batchId,
        uint256 quantity,
        RedemptionStatus status,
        bool requiresEthiopianCompliance,
        bool requiresEUDRCompliance,
        bool fiatTransferCompleted,
        bytes11 offrampBankSwift,
        bytes11 receivingBankSwift
    ) {
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_getRedemptionDetails();
        }

        RedemptionRequest memory request = redemptions[redemptionId];
        return (
            request.consumer,
            request.sellerId,
            request.batchId,
            request.quantity,
            request.status,
            request.requiresEthiopianCompliance,
            request.requiresEUDRCompliance,
            request.fiatTransferCompleted,
            request.offrampBankSwift,
            request.receivingBankSwift
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                            INTERNAL FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if a batch requires EUDR compliance
     * @param batchId Batch identifier
     * @return requiresCompliance True if EUDR compliance is required
     */
    function _checkIfEUDRBatch(uint256 batchId) internal view returns (bool requiresCompliance) {
        // Check if the batch has EUDR compliance data
        (bool deforestationCompliant, bool geolocationVerified, ) = zkManager.validateEUDRZKCompliance(batchId);
        // Require EUDR compliance if there's any EUDR compliance data present
        return deforestationCompliant || geolocationVerified;
    }

    /**
     * @dev Validate ZK compliance proofs for a batch
     * @param batchId Batch identifier
     * @return isValid True if all required ZK proofs are valid
     */
    function _validateZKCompliance(uint256 batchId) internal view returns (bool isValid) {
        if (address(zkManager) == address(0)) {
            return false;
        }

        // For now, return true if we have any ZK compliance proofs
        // This can be enhanced to check for specific required proof types
        return zkManager.hasComplianceProof(batchId, "EUDR_DEFORESTATION") ||
               zkManager.hasComplianceProof(batchId, "EUDR_GEOLOCATION") ||
               zkManager.hasComplianceProof(batchId, "ECTA_PERMIT") ||
               zkManager.hasComplianceProof(batchId, "QUALITY_CERT");
    }

    /**
     * @dev Validate Ethiopian ZK compliance proofs for a batch
     * @param batchId Batch identifier
     * @return isValid True if Ethiopian ZK proofs are valid
     */
    function _validateEthiopianZKCompliance(uint256 batchId) internal view returns (bool isValid) {
        if (address(zkManager) == address(0)) {
            return false;
        }

        // Check if batch has Ethiopian compliance proofs
        // At least one Ethiopian proof type should be present
        return zkManager.hasComplianceProof(batchId, "ECTA_PERMIT") ||
               zkManager.hasComplianceProof(batchId, "QUALITY_CERT") ||
               zkManager.hasComplianceProof(batchId, "ORIGIN_VERIFICATION");
    }

    /**
     * @dev Emit ZK compliance validation events for a redemption
     * @param batchId Batch identifier
     * @param redemptionId Redemption identifier
     */
    function _emitZKComplianceEvents(uint256 batchId, uint256 redemptionId) internal {
        // Simplified event emission
        emit ZKComplianceValidated(batchId, redemptionId, IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE, true);
    }

    /**
     * @dev Emit ZK compliance validation events for Ethiopian compliance types
     * @param batchId Batch identifier
     * @param redemptionId Redemption identifier
     */
    function _emitEthiopianZKComplianceEvents(uint256 batchId, uint256 redemptionId) internal {
        // Simplified Ethiopian ZK compliance event
        emit ZKComplianceValidated(batchId, redemptionId, IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY, true);
    }



    /**
     * @dev Check if a batch is from Ethiopia and requires compliance
     * @param batchId Batch identifier
     * @return requiresCompliance True if Ethiopian compliance is required
     */
    function _checkIfEthiopianBatch(uint256 batchId) internal view returns (bool requiresCompliance) {
        // Check if the batch has Ethiopian compliance data
        (bool hasECTA, bool hasQuality, bool hasOrigin, ) = ethiopianCompliance.getComplianceStatus(batchId);
        
        // Also check for Ethiopian ZK proofs
        bool hasEthiopianZKProofs = false;
        if (address(zkManager) != address(0)) {
            hasEthiopianZKProofs = zkManager.hasComplianceProof(batchId, "ECTA_PERMIT") ||
                                 zkManager.hasComplianceProof(batchId, "QUALITY_CERT") ||
                                 zkManager.hasComplianceProof(batchId, "ORIGIN_VERIFICATION") ||
                                 zkManager.hasComplianceProof(batchId, "BOE_FOREX");
        }
        
        return hasECTA || hasQuality || hasOrigin || hasEthiopianZKProofs;
    }

    /**
     * @dev Handle Ethiopian compliance registration and fiat transfer initiation
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param quantity Quantity being redeemed
     * @param valueUSD Value in USD
     * @param buyerBankDetails Buyer's banking information
     */
    function _handleEthiopianCompliance(
        uint256 batchId,
        address buyer,
        uint256 quantity,
        uint256 valueUSD,
        string memory buyerBankDetails
    ) internal {
        // Simplified compliance handling
        if (ethiopianCompliance.validateUpstreamCompliance(batchId)) {
            emit BoETradeRegistered(batchId, buyer, valueUSD, 0);
        } else {
            emit ZKTradeCompliant(batchId, buyer, "ZK compliance");
        }
    }

    /**
     * @dev Get the seller ID (digital ID) of a batch creator
     * @param batchId Batch identifier
     * @return sellerId Digital ID of the batch seller
     */
    function _getBatchSellerId(uint256 batchId) internal view returns (uint64 sellerId) {
        // Get batch creator address
        (, address creator, , , ) = batchManager.getBatchAdditionalInfo(batchId);

        // Convert address to seller ID using coffee token (which has access control)
        return coffeeToken.getSellerId(creator);
    }

    /**
     * @dev Get the seller address from seller ID
     * @param sellerId Digital seller ID
     * @return sellerAddress Ethereum address of the seller
     */
    function _getSellerAddress(uint64 sellerId) internal view returns (address sellerAddress) {
        // Convert seller ID to address using coffee token (which has access control)
        return coffeeToken.getSellerAddress(sellerId);
    }

    /**
     * @dev Get the seller (original creator) of a batch
     * @param batchId Batch identifier
     * @return seller Address of the batch seller
     */
    function _getBatchSeller(uint256 batchId) internal view returns (address seller) {
        // Get batch info from batch manager which includes the creator
        (
            ,
            address creator,
            ,
            ,

        ) = batchManager.getBatchAdditionalInfo(batchId);
        return creator;
    }

    /* -------------------------------------------------------------------------- */
    /*                            ADMIN FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Emergency function to update redemption details (admin only)
     * @param redemptionId Redemption identifier
     * @param fiatCompleted Whether fiat transfer is completed
     * @param transactionId Bank transaction ID
     */
    function emergencyUpdateRedemption(
        uint256 redemptionId,
        bool fiatCompleted,
        string memory transactionId
    ) external {
        bytes32 adminRole = keccak256("ADMIN_ROLE");
        if (!coffeeToken.hasRole(adminRole, msg.sender)) {
            return;
        }
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_confirmSellerPayment();
        }
        
        RedemptionRequest storage request = redemptions[redemptionId];
        request.fiatTransferCompleted = fiatCompleted;
        request.bankTransactionId = transactionId;
    }

    /**
     * @dev Get Ethiopian compliance details for a redemption
     * @param redemptionId Redemption identifier
     * @return requiresCompliance Whether Ethiopian compliance is required
     * @return fiatCompleted Whether fiat transfer is completed
     * @return transactionId Bank transaction ID
     */
    function getEthiopianComplianceStatus(uint256 redemptionId) external view returns (
        bool requiresCompliance,
        bool fiatCompleted,
        string memory transactionId
    ) {
        if (redemptionId >= nextRedemptionId) {
            revert WAGACoffeeRedemption__RedemptionDoesNotExist_getEnhancedRedemptionDetails();
        }
        
        RedemptionRequest memory request = redemptions[redemptionId];
        return (
            request.requiresEthiopianCompliance,
            request.fiatTransferCompleted,
            request.bankTransactionId
        );
    }
}
