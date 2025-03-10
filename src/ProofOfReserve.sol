// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ChainlinkClient, Chainlink} from "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import {KeeperCompatibleInterface} from  "@chainlink/contracts/src/v0.8/automation/interfaces/KeeperCompatibleInterface.sol"; // lib/chainlink-brownie-contracts/contracts/src/v0.8/automation/interfaces/KeeperCompatibleInterface.sol
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IProofOfReserve} from "./Interfaces/IProofOfReserve.sol";
import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol"; 
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract ProofOfReserve is ChainlinkClient, KeeperCompatibleInterface, IProofOfReserve,Ownable {
    using Chainlink for Chainlink.Request;

    uint256 public reportedReserve;
    uint256 public lastUpdated;
    uint256 public updateInterval = 1 days;
    bytes32 private jobId;
    uint256 private fee;

    event ReserveUpdated(uint256 newReserve);
    event ReserveVerified(uint256 batchId, uint256 amount, uint256 reportedReserve);

    constructor(address linkToken, address oracle, bytes32 _jobId, uint256 _fee) Ownable(msg.sender) {
        _setChainlinkToken(linkToken);
        _setChainlinkOracle(oracle);
        jobId = _jobId;
        fee = _fee;
        lastUpdated = block.timestamp;
    }

    function requestReserveData() public onlyOwner {
        Chainlink.Request memory request = _buildChainlinkRequest(jobId, address(this), this.fulfill.selector);
        _sendChainlinkRequest(request, fee);
    }

    function fulfill(bytes32 _requestId, uint256 _reserve) public recordChainlinkFulfillment(_requestId) {
        require(_reserve >= 0, "Invalid reserve data");
        reportedReserve = _reserve;
        lastUpdated = block.timestamp;
        emit ReserveUpdated(_reserve);
    }

    function verifyInventory(uint256 batchId, uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(reportedReserve >= amount, "Insufficient reserve");
        require(block.timestamp - lastUpdated <= updateInterval, "Reserve data is too old");
        emit ReserveVerified(batchId, amount, reportedReserve);
    }

    function checkUpkeep(bytes calldata) external view override returns (bool upkeepNeeded, bytes memory) {
        upkeepNeeded = (block.timestamp - lastUpdated) > updateInterval;
        return (upkeepNeeded, "");
    }

    function performUpkeep(bytes calldata) external override {
        require((block.timestamp - lastUpdated) > updateInterval, "Too soon to update");
        requestReserveData();
    }
}
