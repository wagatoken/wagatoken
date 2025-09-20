// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {IWAGATreasury} from "./Interfaces/IWAGATreasury.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGABatchManager} from "./Interfaces/IWAGABatchManager.sol";

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

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                             */
    /* -------------------------------------------------------------------------- */

    // Treasury contract for payment verification
    IWAGATreasury public treasury;
    
    // Ethiopian compliance contract
    IEthiopianCompliance public ethiopianCompliance;
    
    // Batch manager contract
    IWAGABatchManager public batchManager;

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
        uint256 batchId;
        uint256 quantity;
        uint256 requestDate;
        RedemptionStatus status;
        uint256 fulfillmentDate;
        string buyerBankDetails;
        bool requiresEthiopianCompliance;
        bool fiatTransferCompleted;
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

    constructor(address _coffeeToken, address _treasury, address _ethiopianCompliance, address _batchManager) {
        require(_coffeeToken != address(0), "Invalid coffee token address");
        require(_treasury != address(0), "Invalid treasury address");
        require(_ethiopianCompliance != address(0), "Invalid Ethiopian compliance address");
        require(_batchManager != address(0), "Invalid batch manager address");
        
        coffeeToken = WAGACoffeeTokenCore(_coffeeToken);
        treasury = IWAGATreasury(_treasury);
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
        batchManager = IWAGABatchManager(_batchManager);
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
        require(msg.sender == address(this) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Unauthorized");
        treasury = IWAGATreasury(_treasury);
    }

    /**
     * @dev Update Ethiopian compliance contract address (admin only)
     * @param _ethiopianCompliance New Ethiopian compliance contract address
     */
    function setEthiopianCompliance(address _ethiopianCompliance) external {
        require(hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Unauthorized");
        require(_ethiopianCompliance != address(0), "Invalid address");
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
     */
    function requestRedemption(
        uint256 batchId,
        uint256 quantity,
        string memory buyerBankDetails
    ) external nonReentrant {
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

        // Check if this batch requires Ethiopian compliance
        bool requiresEthiopianCompliance = _checkIfEthiopianBatch(batchId);
        
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

        // Create redemption request
        uint256 redemptionId = nextRedemptionId;
        nextRedemptionId++; // redemptionId = nextRedemptionId + 1;
        
        // Update the redemption mapping
        redemptions[redemptionId] = RedemptionRequest({
            consumer: msg.sender,
            batchId: batchId,
            quantity: quantity,
            requestDate: block.timestamp,
            status: RedemptionStatus.Requested,
            fulfillmentDate: 0,
            buyerBankDetails: buyerBankDetails,
            requiresEthiopianCompliance: requiresEthiopianCompliance,
            fiatTransferCompleted: false,
            bankTransactionId: ""
        });

        // Track redemption for the consumer
        consumerRedemptions[msg.sender].push(redemptionId);

        // Increment pending redemptions counter for this batch
        batchPendingRedemptions[batchId]++;

        // Handle Ethiopian compliance if required
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
        require(redemptionId < nextRedemptionId, "Redemption does not exist");
        
        RedemptionRequest storage request = redemptions[redemptionId];
        require(request.requiresEthiopianCompliance, "Not an Ethiopian batch");
        require(!request.fiatTransferCompleted, "Fiat transfer already completed");
        
        // Only authorized banking partners can confirm fiat transfers
        require(
            ethiopianCompliance.isAuthorizedBank(msg.sender),
            "Not authorized banking partner"
        );
        
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
    /*                            INTERNAL FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

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
        // Get the batch creator as seller (this could be enhanced to track actual current holder)
        address seller = _getBatchSeller(batchId);
        
        // Register trade with Bank of Ethiopia through the compliance contract
        // Note: This requires the redemption contract to have COMPLIANCE_MANAGER_ROLE
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
        require(redemptionId < nextRedemptionId, "Redemption does not exist");
        
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
        require(redemptionId < nextRedemptionId, "Redemption does not exist");
        
        RedemptionRequest memory request = redemptions[redemptionId];
        return (
            request.requiresEthiopianCompliance,
            request.fiatTransferCompleted,
            request.bankTransactionId
        );
    }
}
