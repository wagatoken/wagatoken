// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IRedemption {
    function redeem(uint256 batchId, uint256 amount) external;
}
