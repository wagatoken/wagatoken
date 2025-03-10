// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IProofOfReserve {
    function verifyInventory(uint256 batchId, uint256 amount) external;
    function requestReserveData() external;
    function reportedReserve() external view returns (uint256);
    function lastUpdated() external view returns (uint256);
}
