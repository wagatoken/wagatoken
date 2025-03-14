// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {ERC1155Holder} from "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";
import {WAGACoffeeToken} from "./WAGACoffeeToken.sol";

contract WAGACoffeeRedemption is AccessControl, ReentrancyGuard, ERC1155Holder {
    bytes32 public constant FULFILLER_ROLE = keccak256("FULFILLER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    WAGACoffeeToken public coffeeToken;

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

    // Mapping from redemption ID to redemption request
    mapping(uint256 => RedemptionRequest) public redemptions;
    uint256 public nextRedemptionId;

    // Events
    event RedemptionRequested(
        uint256 indexed redemptionId,
        address indexed consumer,
        uint256 batchId,
        uint256 quantity
    );
    event RedemptionStatusUpdated(
        uint256 indexed redemptionId,
        RedemptionStatus status
    );
    event RedemptionFulfilled(
        uint256 indexed redemptionId,
        uint256 fulfillmentDate
    );

    constructor(address coffeeTokenAddress) {
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(FULFILLER_ROLE, msg.sender);
        nextRedemptionId = 1;
    }

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
        require(quantity > 0, "Quantity must be greater than zero");
        require(
            coffeeToken.balanceOf(msg.sender, batchId) >= quantity,
            "Insufficient token balance"
        );

        // Transfer tokens from consumer to this contract
        coffeeToken.safeTransferFrom(
            msg.sender,
            address(this),
            batchId,
            quantity,
            ""
        );

        // Create redemption request
        uint256 redemptionId = nextRedemptionId++;
        redemptions[redemptionId] = RedemptionRequest({
            consumer: msg.sender,
            batchId: batchId,
            quantity: quantity,
            deliveryAddress: deliveryAddress,
            requestDate: block.timestamp,
            status: RedemptionStatus.Requested,
            fulfillmentDate: 0
        });

        emit RedemptionRequested(redemptionId, msg.sender, batchId, quantity);
    }

    /**
     * @dev Updates the status of a redemption request
     * @param redemptionId Redemption identifier
     * @param status New status
     */
    function updateRedemptionStatus(
        uint256 redemptionId,
        RedemptionStatus status
    ) external onlyRole(FULFILLER_ROLE) {
        require(redemptionId < nextRedemptionId, "Redemption does not exist");
        require(
            status != RedemptionStatus.Requested,
            "Cannot set status back to Requested"
        );

        RedemptionRequest storage request = redemptions[redemptionId];
        require(
            request.status != RedemptionStatus.Fulfilled,
            "Redemption already fulfilled"
        );
        require(
            request.status != RedemptionStatus.Cancelled,
            "Redemption already cancelled"
        );

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
     * @dev Returns redemption request details
     * @param redemptionId Redemption identifier
     * @return RedemptionRequest struct containing redemption details
     */
    function getRedemptionDetails(
        uint256 redemptionId
    ) external view returns (RedemptionRequest memory) {
        require(redemptionId < nextRedemptionId, "Redemption does not exist");
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
        uint256 count = 0;

        // Count redemptions for the consumer
        for (uint256 i = 1; i < nextRedemptionId; i++) {
            if (redemptions[i].consumer == consumer) {
                count++;
            }
        }

        // Create array of redemption IDs
        uint256[] memory result = new uint256[](count);
        uint256 index = 0;

        for (uint256 i = 1; i < nextRedemptionId; i++) {
            if (redemptions[i].consumer == consumer) {
                result[index] = i;
                index++;
            }
        }

        return result;
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

