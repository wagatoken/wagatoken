// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

// Minimal mock interface for IFunctionsRouter
interface IFunctionsRouter {
    function sendRequest(
        uint64 subscriptionId,
        bytes calldata /* data */,
        uint16 dataVersion,
        uint32 callbackGasLimit,
        bytes32 donId
    ) external returns (bytes32);

    function getProposedContractSet() external view returns (bytes32, address[] memory, address[] memory);
    function proposeContractsUpdate(address[] memory proposedContractAddresses, bytes32 proposedContractSetId) external;
    function updateContracts(address proposedContractSetFromAddress) external;
    function pause() external;
    function unpause() external;
}

// Minimal mock interface for IFunctionsClient
interface IFunctionsClient {
    function handleOracleFulfillment(bytes32 requestId, bytes calldata response, bytes calldata err) external;
}

/**
 * @title MockFunctionsRouter
 * @dev A mock implementation of Chainlink Functions Router for local testing
 */
contract MockFunctionsRouter is IFunctionsRouter {
    error RequestNotFound(bytes32 requestId);

    mapping(bytes32 => bool) private s_pendingRequests;
    mapping(uint64 => bool) private s_validSubscriptions;
    uint32 private s_requestId;

    error InvalidSubscription(uint64 subscriptionId);

    event MockRequestSent(bytes32 indexed requestId, address indexed client);
    event MockResponseSent(bytes32 indexed requestId, bytes response, bytes err);

    error ClientCallbackFailed();

    constructor() {
        // Create some default valid subscriptions for testing
        s_validSubscriptions[1] = true;
        s_validSubscriptions[100] = true;
        s_validSubscriptions[1000] = true;
    }

    /**
     * @dev Simulates sending a Chainlink Functions request
     */
    function sendRequest(
        uint64 subscriptionId,
        bytes calldata /* data */,
        uint16 /* dataVersion */,
        uint32 /* callbackGasLimit */,
        bytes32 /* donId */
    ) external override returns (bytes32) {
        if (!s_validSubscriptions[subscriptionId]) {
            revert InvalidSubscription(subscriptionId);
        }
        
        bytes32 requestId = keccak256(abi.encodePacked(msg.sender, block.timestamp, s_requestId++));
        s_pendingRequests[requestId] = true;
        
        emit MockRequestSent(requestId, msg.sender);
        return requestId;
    }

    /**
     * @dev Simulates an oracle response (for testing purposes)
     * @param requestId The request ID to respond to
     * @param response The response data
     * @param err Any error data
     */
    function mockResponse(
        bytes32 requestId,
        bytes calldata response,
        bytes calldata err,
        address client
    ) public {
        if (!s_pendingRequests[requestId]) {
            revert RequestNotFound(requestId);
        }
        
        s_pendingRequests[requestId] = false;
        try IFunctionsClient(client).handleOracleFulfillment(requestId, response, err) {
            emit MockResponseSent(requestId, response, err);
        } catch {
            // Handle failed callback
            revert ClientCallbackFailed();
        }
    }

    /**
     * @dev Simulates a successful verification response for WAGA testing
     */
    error RequestNotPending(bytes32 requestId);

    function mockSuccessfulVerification(
        bytes32 requestId,
        address client,
        bool verified,
        uint256 actualQuantity,
        uint256 actualPrice
    ) external {
        if (!s_pendingRequests[requestId]) {
            revert RequestNotPending(requestId);
        }
        
        // Encode response data similar to what WAGA expects
        bytes memory response = abi.encode(verified, actualQuantity, actualPrice);
        bytes memory err = "";
        
        this.mockResponse(requestId, response, err, client);
    }

    /**
     * @dev Add a valid subscription for testing
     */
    function addValidSubscription(uint64 subscriptionId) external {
        s_validSubscriptions[subscriptionId] = true;
    }

    /**
     * @dev Check if a subscription is valid
     */
    function isValidSubscription(uint64 subscriptionId) external view returns (bool) {
        return s_validSubscriptions[subscriptionId];
    }

    /**
     * @dev Check if a request is pending
     */
    function isPendingRequest(bytes32 requestId) external view returns (bool) {
        return s_pendingRequests[requestId];
    }

    // Required by interface but not implemented for mock
    function getProposedContractSet() external pure override returns (bytes32, address[] memory, address[] memory) {
        return (bytes32(0), new address[](0), new address[](0));
    }

    error NotImplementedInMock();

    function proposeContractsUpdate(
        address[] memory /* proposedContractAddresses */,
        bytes32 /* proposedContractSetId */
    ) external pure override {
        revert NotImplementedInMock();
    }

    function updateContracts(address /* proposedContractSetFromAddress */) external pure override {
        revert NotImplementedInMock();
    }

    function pause() external pure override {
        revert NotImplementedInMock();
    }

    function unpause() external pure override {
        revert NotImplementedInMock();
    }
}
