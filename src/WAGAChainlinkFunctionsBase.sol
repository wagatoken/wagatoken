// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {FunctionsClient} from "@chainlink/contracts/src/v0.8/functions/v1_3_0/FunctionsClient.sol";
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

/**
 * @title WAGAChainlinkFunctionsBase
 * @dev Base contract for Chainlink Functions integration in the WAGA Coffee Traceability System
 * This contract provides common functionality for contracts that use Chainlink Functions
 */
abstract contract WAGAChainlinkFunctionsBase is AccessControl, FunctionsClient, ConfirmedOwner {
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
    ) FunctionsClient(router) ConfirmedOwner(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        subscriptionId = _subscriptionId;
        donId = _donId;
    }

    /**
     * @dev Parses the response from Chainlink Functions
     * @param response Response from Chainlink Functions
     * @return uint256 Parsed quantity
     */
    function _parseResponse(
        bytes memory response
    ) internal pure returns (uint256) {
        if (response.length == 0) {
            return 0;
        }

        // Convert bytes to uint256
        uint256 result;
        assembly {
            result := mload(add(response, 32))
        }

        return result;
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
}

