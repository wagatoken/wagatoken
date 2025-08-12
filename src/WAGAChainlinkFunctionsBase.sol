// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_3_0/FunctionsClient.sol";
import {FunctionsRequest} from "@chainlink/contracts/src/v0.8/functions/v1_0_0/libraries/FunctionsRequest.sol";

/**
 * @title WAGAChainlinkFunctionsBase
 * @dev Base contract for Chainlink Functions integration in the WAGA Coffee Traceability System
 * This contract provides common functionality for contracts that use Chainlink Functions
 */
abstract contract WAGAChainlinkFunctionsBase is
    AccessControl,
    FunctionsClient
{
    using FunctionsRequest for FunctionsRequest.Request;

    error WAGAChainlinkFunctionsBase__OnlyRouterCanFulfill_handleOracleFulfillment();
    error WAGAChainlinkFunctionsBase__InvalidResponseLength_parseResponse();
    error WAGAChainlinkFunctionsBase__RequestAlreadyCompleted_fulfillRequest();
    // Chainlink Functions variables
    bytes32 public latestRequestId;
    bytes public latestResponse;
    bytes public latestError;
    uint64 public subscriptionId;
    bytes32 public donId;

    // Events
    event ChainlinkSubscriptionUpdated(uint64 newSubscriptionId);
    event ChainlinkDonIdUpdated(bytes32 newDonId);

    /**
     * @dev Initializes the contract with Chainlink Functions configuration
     * @param router Address of the Chainlink Functions router
     * @param _subscriptionId Chainlink Functions subscription ID
     * @param _donId Chainlink Functions DON ID
     */
    constructor(
        address router,
        uint64 _subscriptionId,
        bytes32 _donId
    ) FunctionsClient(router) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);

        subscriptionId = _subscriptionId;
        donId = _donId;
    }

    /*
     * @dev Parses the response from Chainlink Functions
     * @param response Response from Chainlink Functions
     * @return verifiedQuantity, price, packaging, metadataHash
     */
    function _parseResponse(
        bytes memory response
    ) internal pure returns (
        uint256 verifiedQuantity,
        uint256 price,
        string memory packaging,
        string memory metadataHash
    ) {
        if (response.length == 0) {
            return (0, 0, "", "");
        }
        // Expect ABI-encoded (uint256, uint256, string, string)
        (verifiedQuantity, price, packaging, metadataHash) = abi.decode(response, (uint256, uint256, string, string));
    }

    /**
     * @dev Updates the Chainlink subscription ID
     * @param _subscriptionId New subscription ID
     */
    function updateSubscriptionId(
        uint64 _subscriptionId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        subscriptionId = _subscriptionId;
        emit ChainlinkSubscriptionUpdated(_subscriptionId);
    }

    /**
     * @dev Updates the Chainlink DON ID
     * @param _donId New DON ID
     */
    function updateDonId(bytes32 _donId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        donId = _donId;
        emit ChainlinkDonIdUpdated(_donId);
    }

    /**
     * @dev Sends a request to Chainlink Functions with arguments
     */
    function _sendRequestWithArgs(
        bytes memory source,
        string[] memory args,
        uint64 _subscriptionId,
        uint32 gasLimit,
        bytes32 _donId
    ) internal returns (bytes32 requestId) {
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(string(source)); //@audit: What does this line do?
        if (args.length > 0) {
            req.setArgs(args);
        }
        
        return _sendRequest(req.encodeCBOR(), _subscriptionId, gasLimit, _donId);
    }

    /**
     * @dev Abstract function that must be implemented by inheriting contracts
     * This is the callback function that gets called when Chainlink Functions responds
     */
    function _fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal virtual override;
}

