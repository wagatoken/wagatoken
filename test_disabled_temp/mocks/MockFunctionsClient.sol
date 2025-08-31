// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_3_0/FunctionsClient.sol";

/**
 * @title MockFunctionsClient
 * @dev A mock client for testing Functions callbacks
 */
contract MockFunctionsClient is FunctionsClient {
    bytes32 public latestRequestId;
    bytes public latestResponse;
    bytes public latestError;
    bool public callbackReceived;

    event CallbackReceived(bytes32 indexed requestId, bytes response, bytes err);

    constructor(address router) FunctionsClient(router) {}

    /**
     * @dev Callback function for Chainlink Functions
     */
    function _fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        latestRequestId = requestId;
        latestResponse = response;
        latestError = err;
        callbackReceived = true;
        
        emit CallbackReceived(requestId, response, err);
    }

    /**
     * @dev Reset state for testing
     */
    function resetState() external {
        latestRequestId = bytes32(0);
        latestResponse = "";
        latestError = "";
        callbackReceived = false;
    }
}
