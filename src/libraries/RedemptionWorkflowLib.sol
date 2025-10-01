// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RedemptionWorkflowLib
 * @dev Library for coffee redemption workflow operations
 * @notice Extracted from WAGACoffeeRedemption to reduce contract size
 */
library RedemptionWorkflowLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    
    event RedemptionRequested(uint256 indexed requestId, address indexed redeemer, uint256[] batchIds, uint256[] quantities);
    event RedemptionApproved(uint256 indexed requestId, address indexed approver);
    event RedemptionFulfilled(uint256 indexed requestId, address indexed fulfiller, string trackingNumber);
    event RedemptionCancelled(uint256 indexed requestId, string reason);
    event ShippingUpdated(uint256 indexed requestId, string status, string location);
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error RedemptionWorkflowLib__InvalidRequestId();
    error RedemptionWorkflowLib__UnauthorizedAccess();
    error RedemptionWorkflowLib__InvalidRedemptionData();
    error RedemptionWorkflowLib__InsufficientTokens();
    error RedemptionWorkflowLib__RequestAlreadyProcessed();
    error RedemptionWorkflowLib__InvalidStatusTransition();
    error RedemptionWorkflowLib__ExpiredRequest();

    /* -------------------------------------------------------------------------- */
    /*                                   Enums                                   */
    /* -------------------------------------------------------------------------- */

    enum RedemptionStatus {
        PENDING,         // Initial request
        APPROVED,        // Approved by admin
        PREPARING,       // Being prepared for shipping
        SHIPPED,         // Shipped to customer
        DELIVERED,       // Delivered to customer
        COMPLETED,       // Redemption completed
        CANCELLED,       // Cancelled
        REFUNDED         // Refunded to customer
    }

    enum ShippingMethod {
        STANDARD,        // Standard shipping
        EXPRESS,         // Express shipping
        OVERNIGHT,       // Overnight delivery
        PICKUP          // Customer pickup
    }

    /* -------------------------------------------------------------------------- */
    /*                                  Structs                                  */
    /* -------------------------------------------------------------------------- */

    struct RedemptionRequest {
        uint256 requestId;
        address redeemer;
        uint256[] batchIds;
        uint256[] quantities;
        RedemptionStatus status;
        ShippingMethod shippingMethod;
        string deliveryAddress;
        string contactInfo;
        uint256 requestDate;
        uint256 approvalDate;
        uint256 fulfillmentDate;
        uint256 expiryDate;
        address approvedBy;
        address fulfilledBy;
        string specialInstructions;
        uint256 estimatedValue;
    }

    struct ShippingInfo {
        uint256 requestId;
        string trackingNumber;
        string carrier;
        string currentStatus;
        string currentLocation;
        uint256 shippingDate;
        uint256 estimatedDelivery;
        uint256 actualDelivery;
        string[] statusHistory;
        uint256[] statusTimestamps;
    }

    struct RedemptionBatch {
        uint256 batchId;
        uint256 quantity;
        uint256 pricePerUnit;
        string origin;
        string qualityGrade;
        bool isRedeemed;
    }

    /* -------------------------------------------------------------------------- */
    /*                           Redemption Requests                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Creates a new redemption request
     * @param requests Storage reference to redemption requests mapping
     * @param nextRequestId Reference to next request ID counter
     * @param redeemer Address making the redemption request
     * @param batchIds Array of batch IDs to redeem
     * @param quantities Array of quantities for each batch
     * @param shippingMethod Preferred shipping method
     * @param deliveryAddress Delivery address
     * @param contactInfo Contact information
     * @param specialInstructions Special delivery instructions
     * @return requestId Generated request ID
     */
    function createRedemptionRequest(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 nextRequestId,
        address redeemer,
        uint256[] memory batchIds,
        uint256[] memory quantities,
        ShippingMethod shippingMethod,
        string memory deliveryAddress,
        string memory contactInfo,
        string memory specialInstructions
    ) external returns (uint256 requestId) {
        // Validation
        if (redeemer == address(0)) revert RedemptionWorkflowLib__InvalidRedemptionData();
        if (batchIds.length == 0 || batchIds.length != quantities.length) {
            revert RedemptionWorkflowLib__InvalidRedemptionData();
        }
        if (bytes(deliveryAddress).length == 0) revert RedemptionWorkflowLib__InvalidRedemptionData();

        requestId = nextRequestId;

        // Create redemption request
        requests[requestId] = RedemptionRequest({
            requestId: requestId,
            redeemer: redeemer,
            batchIds: batchIds,
            quantities: quantities,
            status: RedemptionStatus.PENDING,
            shippingMethod: shippingMethod,
            deliveryAddress: deliveryAddress,
            contactInfo: contactInfo,
            requestDate: block.timestamp,
            approvalDate: 0,
            fulfillmentDate: 0,
            expiryDate: block.timestamp + 30 days, // 30 day expiry
            approvedBy: address(0),
            fulfilledBy: address(0),
            specialInstructions: specialInstructions,
            estimatedValue: 0 // To be calculated separately
        });

        emit RedemptionRequested(requestId, redeemer, batchIds, quantities);
        return requestId;
    }

    /**
     * @dev Approves a redemption request
     * @param requests Storage reference to redemption requests mapping
     * @param requestId The request ID to approve
     * @param approver Address approving the request
     * @param estimatedValue Estimated value of the redemption
     */
    function approveRedemptionRequest(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 requestId,
        address approver,
        uint256 estimatedValue
    ) external {
        RedemptionRequest storage request = requests[requestId];
        
        if (request.requestId == 0) revert RedemptionWorkflowLib__InvalidRequestId();
        if (request.status != RedemptionStatus.PENDING) {
            revert RedemptionWorkflowLib__InvalidStatusTransition();
        }
        if (block.timestamp > request.expiryDate) revert RedemptionWorkflowLib__ExpiredRequest();

        request.status = RedemptionStatus.APPROVED;
        request.approvalDate = block.timestamp;
        request.approvedBy = approver;
        request.estimatedValue = estimatedValue;

        emit RedemptionApproved(requestId, approver);
    }

    /* -------------------------------------------------------------------------- */
    /*                            Fulfillment Process                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Fulfills a redemption request by burning tokens and initiating shipping
     * @param requests Storage reference to redemption requests mapping
     * @param shipping Storage reference to shipping info mapping
     * @param requestId The request ID to fulfill
     * @param fulfiller Address fulfilling the request
     * @param trackingNumber Shipping tracking number
     * @param carrier Shipping carrier
     * @param estimatedDelivery Estimated delivery timestamp
     */
    function fulfillRedemptionRequest(
        mapping(uint256 => RedemptionRequest) storage requests,
        mapping(uint256 => ShippingInfo) storage shipping,
        uint256 requestId,
        address fulfiller,
        string memory trackingNumber,
        string memory carrier,
        uint256 estimatedDelivery
    ) external {
        RedemptionRequest storage request = requests[requestId];
        
        if (request.requestId == 0) revert RedemptionWorkflowLib__InvalidRequestId();
        if (request.status != RedemptionStatus.APPROVED) {
            revert RedemptionWorkflowLib__InvalidStatusTransition();
        }

        // Update request status
        request.status = RedemptionStatus.PREPARING;
        request.fulfillmentDate = block.timestamp;
        request.fulfilledBy = fulfiller;

        // Initialize shipping info
        string[] memory statusHistory = new string[](1);
        statusHistory[0] = "Order Confirmed";
        uint256[] memory statusTimestamps = new uint256[](1);
        statusTimestamps[0] = block.timestamp;

        shipping[requestId] = ShippingInfo({
            requestId: requestId,
            trackingNumber: trackingNumber,
            carrier: carrier,
            currentStatus: "Order Confirmed",
            currentLocation: "Warehouse",
            shippingDate: 0,
            estimatedDelivery: estimatedDelivery,
            actualDelivery: 0,
            statusHistory: statusHistory,
            statusTimestamps: statusTimestamps
        });

        emit RedemptionFulfilled(requestId, fulfiller, trackingNumber);
    }

    /* -------------------------------------------------------------------------- */
    /*                             Shipping Management                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Updates shipping status for a redemption
     * @param requests Storage reference to redemption requests mapping
     * @param shipping Storage reference to shipping info mapping
     * @param requestId The request ID
     * @param newStatus New shipping status
     * @param location Current location
     */
    function updateShippingStatus(
        mapping(uint256 => RedemptionRequest) storage requests,
        mapping(uint256 => ShippingInfo) storage shipping,
        uint256 requestId,
        string memory newStatus,
        string memory location
    ) external {
        RedemptionRequest storage request = requests[requestId];
        ShippingInfo storage shipInfo = shipping[requestId];
        
        if (request.requestId == 0) revert RedemptionWorkflowLib__InvalidRequestId();

        // Update shipping info
        shipInfo.currentStatus = newStatus;
        shipInfo.currentLocation = location;

        // Add to history
        shipInfo.statusHistory.push(newStatus);
        shipInfo.statusTimestamps.push(block.timestamp);

        // Update request status based on shipping status
        if (keccak256(bytes(newStatus)) == keccak256(bytes("Shipped"))) {
            request.status = RedemptionStatus.SHIPPED;
            shipInfo.shippingDate = block.timestamp;
        } else if (keccak256(bytes(newStatus)) == keccak256(bytes("Delivered"))) {
            request.status = RedemptionStatus.DELIVERED;
            shipInfo.actualDelivery = block.timestamp;
        }

        emit ShippingUpdated(requestId, newStatus, location);
    }

    /**
     * @dev Marks a redemption as completed
     * @param requests Storage reference to redemption requests mapping
     * @param requestId The request ID to complete
     */
    function completeRedemption(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 requestId
    ) external {
        RedemptionRequest storage request = requests[requestId];
        
        if (request.requestId == 0) revert RedemptionWorkflowLib__InvalidRequestId();
        if (request.status != RedemptionStatus.DELIVERED) {
            revert RedemptionWorkflowLib__InvalidStatusTransition();
        }

        request.status = RedemptionStatus.COMPLETED;
    }

    /* -------------------------------------------------------------------------- */
    /*                           Cancellation & Refunds                         */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Cancels a redemption request
     * @param requests Storage reference to redemption requests mapping
     * @param requestId The request ID to cancel
     * @param reason Reason for cancellation
     */
    function cancelRedemptionRequest(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 requestId,
        string memory reason
    ) external {
        RedemptionRequest storage request = requests[requestId];
        
        if (request.requestId == 0) revert RedemptionWorkflowLib__InvalidRequestId();
        if (request.status == RedemptionStatus.SHIPPED || 
            request.status == RedemptionStatus.DELIVERED ||
            request.status == RedemptionStatus.COMPLETED) {
            revert RedemptionWorkflowLib__InvalidStatusTransition();
        }

        request.status = RedemptionStatus.CANCELLED;

        emit RedemptionCancelled(requestId, reason);
    }

    /**
     * @dev Processes a refund for a cancelled redemption
     * @param requests Storage reference to redemption requests mapping
     * @param requestId The request ID to refund
     */
    function processRefund(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 requestId
    ) external {
        RedemptionRequest storage request = requests[requestId];
        
        if (request.requestId == 0) revert RedemptionWorkflowLib__InvalidRequestId();
        if (request.status != RedemptionStatus.CANCELLED) {
            revert RedemptionWorkflowLib__InvalidStatusTransition();
        }

        request.status = RedemptionStatus.REFUNDED;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Utility Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Gets redemption request details
     * @param requests Storage reference to redemption requests mapping
     * @param requestId The request ID
     * @return request The redemption request
     */
    function getRedemptionRequest(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 requestId
    ) external view returns (RedemptionRequest memory request) {
        return requests[requestId];
    }

    /**
     * @dev Gets shipping information
     * @param shipping Storage reference to shipping info mapping
     * @param requestId The request ID
     * @return shipInfo The shipping information
     */
    function getShippingInfo(
        mapping(uint256 => ShippingInfo) storage shipping,
        uint256 requestId
    ) external view returns (ShippingInfo memory shipInfo) {
        return shipping[requestId];
    }

    /**
     * @dev Calculates total quantity across all batches in a request
     * @param requests Storage reference to redemption requests mapping
     * @param requestId The request ID
     * @return totalQuantity Total quantity in the request
     */
    function calculateTotalQuantity(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 requestId
    ) external view returns (uint256 totalQuantity) {
        RedemptionRequest storage request = requests[requestId];
        
        for (uint256 i = 0; i < request.quantities.length; i++) {
            totalQuantity += request.quantities[i];
        }
        
        return totalQuantity;
    }

    /**
     * @dev Checks if a redemption request is expired
     * @param requests Storage reference to redemption requests mapping
     * @param requestId The request ID
     * @return expired True if request is expired
     */
    function isRequestExpired(
        mapping(uint256 => RedemptionRequest) storage requests,
        uint256 requestId
    ) external view returns (bool expired) {
        RedemptionRequest storage request = requests[requestId];
        return block.timestamp > request.expiryDate;
    }

    /**
     * @dev Gets status history for shipping
     * @param shipping Storage reference to shipping info mapping
     * @param requestId The request ID
     * @return statuses Array of status strings
     * @return timestamps Array of timestamps
     */
    function getShippingHistory(
        mapping(uint256 => ShippingInfo) storage shipping,
        uint256 requestId
    ) external view returns (string[] memory statuses, uint256[] memory timestamps) {
        ShippingInfo storage shipInfo = shipping[requestId];
        return (shipInfo.statusHistory, shipInfo.statusTimestamps);
    }

    /**
     * @dev Validates redemption request data
     * @param batchIds Array of batch IDs
     * @param quantities Array of quantities
     * @param deliveryAddress Delivery address
     * @return valid True if data is valid
     */
    function validateRedemptionData(
        uint256[] memory batchIds,
        uint256[] memory quantities,
        string memory deliveryAddress
    ) external pure returns (bool valid) {
        if (batchIds.length == 0 || batchIds.length != quantities.length) {
            return false;
        }
        
        if (bytes(deliveryAddress).length == 0) {
            return false;
        }

        for (uint256 i = 0; i < quantities.length; i++) {
            if (quantities[i] == 0) {
                return false;
            }
        }

        return true;
    }
}