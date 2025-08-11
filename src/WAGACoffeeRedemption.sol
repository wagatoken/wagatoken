// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol"; // why
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";

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

    /* -------------------------------------------------------------------------- */
    /*                               TYPE DECLARATIONS                            */
    /* -------------------------------------------------------------------------- */

    // Redemption status enum
    enum RedemptionStatus {
        Requested,
        Processing,
        Fulfilled,
        Cancelled
    }

    // Redemption request structure
    struct RedemptionRequest {
        address consumer;
        uint256 batchId;
        uint256 quantity;
        string deliveryAddress;
        uint256 requestDate;
        RedemptionStatus status;
        uint256 fulfillmentDate;
    }

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // bytes32 public constant FULFILLER_ROLE = keccak256("FULFILLER_ROLE");
    // bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    WAGACoffeeToken public coffeeToken;
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

    constructor(address _coffeeToken) /*address coffeeTokenAddress*/ {
        coffeeToken = WAGACoffeeToken(_coffeeToken);
        nextRedemptionId = 1000; // Do we need to initialize this?
    }

    /* -------------------------------------------------------------------------- */
    /*                              EXTERNAL FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Requests redemption of coffee tokens for physical delivery
     * @param batchId Batch identifier
     * @param quantity Number of coffee bags to redeem
     * @param deliveryAddress Physical delivery address
     */
    function requestRedemption(
        uint256 batchId,
        uint256 quantity,
        string memory deliveryAddress
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

        // Fetch batch info
        (
            ,
            uint256 expiryDate,
            bool isVerified,
            ,
            ,
            string memory packagingInfo,
            ,
            bool isMetadataVerified,

        ) = coffeeToken.s_batchInfo(batchId);

        // Ensure the batch has not expired
        if (block.timestamp > expiryDate) {
            revert WAGACoffeeRedemption__BatchExpired_requestRedemption();
        }

        // Ensure the batch is verified and metadata is verified
        if (!isVerified) {
            revert WAGACoffeeRedemption__BatchNotVerified_requestRedemption();
        }

        if (!isMetadataVerified) {
            revert WAGACoffeeRedemption__BatchMetadataNotVerified_requestRedemption();
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
        // Update the redemption mapping:   mapping(uint256 => RedemptionRequest) public redemptions;
        redemptions[redemptionId] = RedemptionRequest({
            consumer: msg.sender,
            batchId: batchId,
            quantity: quantity,
            deliveryAddress: deliveryAddress,
            requestDate: block.timestamp,
            status: RedemptionStatus.Requested,
            fulfillmentDate: 0
        });

        // Track redemption for the consumer
        consumerRedemptions[msg.sender].push(redemptionId); // mapping(address => uint256[]) private consumerRedemptions;

        // Increment pending redemptions counter for this batch
        batchPendingRedemptions[batchId]++;

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
}
