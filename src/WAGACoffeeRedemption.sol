// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {IWAGATreasury} from "./Interfaces/IWAGATreasury.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGABatchManager} from "./Interfaces/IWAGABatchManager.sol";
import {IWAGAZKManager} from "./Interfaces/IWAGAZKManager.sol";
import {IWAGAAccessControl} from "./Interfaces/IWAGAAccessControl.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";

contract WAGACoffeeRedemption is AccessControl, ReentrancyGuard, ERC1155Holder {
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
    error WAGACoffeeRedemption__InvalidAccessControlAddress_constructor();
    error WAGACoffeeRedemption__Unauthorized_updateEthiopianCompliance();
    error WAGACoffeeRedemption__Unauthorized_setEthiopianComplianceAddress();
    error WAGACoffeeRedemption__InvalidEthiopianComplianceAddress_setEthiopianComplianceAddress();
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
    
    // Ethiopian compliance contract
    IEthiopianCompliance public ethiopianCompliance;
    
    // Batch manager contract
    IWAGABatchManager public batchManager;

    // ZK manager for compliance validation
    IWAGAZKManager public zkManager;

    // Access control for seller ID resolution
    IWAGAAccessControl public accessControl;

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
    struct RedemptionRequest {
        address consumer;
        uint64 sellerId;              // Digital seller ID (8 bytes vs 20 bytes)
        uint256 batchId;
        uint256 quantity;
        uint256 requestDate;
        RedemptionStatus status;
        uint256 fulfillmentDate;
        string buyerBankDetails;
        bool requiresEthiopianCompliance;
        bool requiresEUDRCompliance;
        bool fiatTransferCompleted;
        bytes11 offrampBankSwift;     // SWIFT code for offramp partner
        bytes11 receivingBankSwift;   // SWIFT code for receiving bank
        string bankTransactionId;
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

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        if (!coffeeToken.hasRole(roleType, msg.sender)) {
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
        address _batchManager,
        address _zkManager,
        address _accessControl
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
        if (_batchManager == address(0)) {
            revert WAGACoffeeRedemption__InvalidBatchManagerAddress_constructor();
        }
        if (_zkManager == address(0)) {
            revert WAGACoffeeRedemption__InvalidZKManagerAddress_constructor();
        }
        if (_accessControl == address(0)) {
            revert WAGACoffeeRedemption__InvalidAccessControlAddress_constructor();
        }

        coffeeToken = WAGACoffeeTokenCore(_coffeeToken);
        treasury = IWAGATreasury(_treasury);
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
        batchManager = IWAGABatchManager(_batchManager);
        zkManager = IWAGAZKManager(_zkManager);
        accessControl = IWAGAAccessControl(_accessControl);
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
        
        return (true, "Configuration is valid");
    }

    /**
     * @dev Update treasury contract address (admin only)
     * @param _treasury New treasury contract address
     */
    function setTreasury(address _treasury) external {
        // Only allow admin or the contract itself to update treasury
        if (!(msg.sender == address(this) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender))) {
            revert WAGACoffeeRedemption__Unauthorized_updateEthiopianCompliance();
        }
        treasury = IWAGATreasury(_treasury);
    }

    /**
     * @dev Update Ethiopian compliance contract address (admin only)
     * @param _ethiopianCompliance New Ethiopian compliance contract address
     */
    function setEthiopianCompliance(address _ethiopianCompliance) external {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) {
            revert WAGACoffeeRedemption__Unauthorized_setEthiopianComplianceAddress();
        }
        if (_ethiopianCompliance == address(0)) {
            revert WAGACoffeeRedemption__InvalidEthiopianComplianceAddress_setEthiopianComplianceAddress();
        }
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
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
            (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = zkManager.validateEUDRZKCompliance(batchId);
            if (!fullyCompliant) {
                revert WAGACoffeeRedemption__EUDRComplianceNotMet_requestRedemption();
            }

            // Validate ZK compliance proofs
            if (!_validateZKCompliance(batchId)) {
                revert WAGACoffeeRedemption__ZKComplianceValidationFailed_requestRedemption();
            }
        }

        // Validate Ethiopian compliance if required
        if (requiresEthiopianCompliance) {
            // Validate banking details are provided
            if (bytes(buyerBankDetails).length == 0) {
                revert WAGACoffeeRedemption__InvalidBankingDetails_requestRedemption();
            }

            // Validate Ethiopian compliance
            if (!ethiopianCompliance.validateUpstreamCompliance(batchId)) {
                revert WAGACoffeeRedemption__EthiopianComplianceNotMet_requestRedemption();
            }
        }

        // MANDATORY payment verification - no optional checks
        if (address(treasury) == address(0)) {
            revert("Treasury contract not configured");
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

        // Transfer tokens from consumer to this contract
        coffeeToken.safeTransferFrom(
            msg.sender,
            address(this),
            batchId,
            quantity,
            ""
        );

        // Get seller ID for the batch creator
        uint64 sellerId = _getBatchSellerId(batchId);

        // Create redemption request
        redemptionId = nextRedemptionId;
        nextRedemptionId++; // redemptionId = nextRedemptionId + 1;

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
            (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant) = zkManager.validateEUDRZKCompliance(batchId);
            emit EUDRComplianceValidated(batchId, redemptionId, deforestationCompliant, geolocationVerified);

            // Emit ZK compliance validation events
            _emitZKComplianceEvents(batchId, redemptionId);
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
    ) external callerHasRoleFromCoffeeToken(coffeeToken.FULFILLER_ROLE()) {
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
        if (request.requiresEthiopianCompliance && status == RedemptionStatus.Fulfilled) {
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
        if (!ethiopianCompliance.isAuthorizedBank(msg.sender)) {
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
        override(AccessControl, ERC1155Holder)
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
        ethiopianCompliance.confirmFiatTransferStage(
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
            !ethiopianCompliance.isAuthorizedBank(msg.sender)) {
            revert WAGACoffeeRedemption__UnauthorizedSellerConfirmation_confirmSellerPayment();
        }

        // Confirm seller payment through compliance contract
        ethiopianCompliance.confirmSellerPayment(
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
        (, , bool fullyCompliant) = zkManager.validateEUDRZKCompliance(batchId);
        return fullyCompliant;
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

        // Check if batch has all required proofs
        return zkManager.hasAllRequiredProofs(batchId);
    }

    /**
     * @dev Emit ZK compliance validation events for a redemption
     * @param batchId Batch identifier
     * @param redemptionId Redemption identifier
     */
    function _emitZKComplianceEvents(uint256 batchId, uint256 redemptionId) internal {
        // Emit events for different proof types
        IZKVerifier.ProofType[6] memory proofTypes = [
            IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE,
            IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION,
            IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY,
            IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY,
            IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF,
            IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE
        ];

        for (uint256 i = 0; i < proofTypes.length; i++) {
            // Since we reached this point, all validations passed
            emit ZKComplianceValidated(batchId, redemptionId, proofTypes[i], true);
        }
    }

    /**
     * @dev Check if a batch is from Ethiopia and requires compliance
     * @param batchId Batch identifier
     * @return requiresCompliance True if Ethiopian compliance is required
     */
    function _checkIfEthiopianBatch(uint256 batchId) internal view returns (bool requiresCompliance) {
        // Check if the batch has Ethiopian compliance data
        (bool hasECTA, bool hasQuality, bool hasOrigin, ) = ethiopianCompliance.getComplianceStatus(batchId);
        return hasECTA || hasQuality || hasOrigin;
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
        // Get the batch creator as seller (wallet address who owns the batch)
        address seller = _getBatchSeller(batchId);
        
        // Register trade with Bank of Ethiopia through the compliance contract
        // Note: This requires the redemption contract to have COMPLIANCE_MANAGER_ROLE
        // The compliance contract will internally convert seller address to sellerId for storage
        ethiopianCompliance.registerTradeWithBoE(
            batchId,
            buyer,
            seller,
            quantity,
            valueUSD,
            buyerBankDetails
        );
        
        // Emit event after successful registration
        uint256 valueETB = ethiopianCompliance.convertUSDToETB(valueUSD);
        emit BoETradeRegistered(batchId, buyer, valueUSD, valueETB);
    }

    /**
     * @dev Get the seller ID (digital ID) of a batch creator
     * @param batchId Batch identifier
     * @return sellerId Digital ID of the batch seller
     */
    function _getBatchSellerId(uint256 batchId) internal view returns (uint64 sellerId) {
        // Get batch creator address
        (, address creator, , , ) = batchManager.getBatchAdditionalInfo(batchId);

        // Convert address to seller ID using access control contract
        if (address(accessControl) != address(0)) {
            return accessControl.getSellerId(creator);
        }

        return 0; // Return 0 if access control not configured
    }

    /**
     * @dev Get the seller address from seller ID
     * @param sellerId Digital seller ID
     * @return sellerAddress Ethereum address of the seller
     */
    function _getSellerAddress(uint64 sellerId) internal view returns (address sellerAddress) {
        // Convert seller ID to address using access control contract
        if (address(accessControl) != address(0)) {
            return accessControl.getSellerAddress(sellerId);
        }

        return address(0); // Return zero address if access control not configured
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
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
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
