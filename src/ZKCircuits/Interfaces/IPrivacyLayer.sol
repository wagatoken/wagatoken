// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IPrivacyLayer {
    enum PrivacyLevel {
        Public,     // Show all data
        Selective,  // Show ZK proof results only
        Private     // Show minimal verified data
    }
    
    struct PrivacyConfig {
        bool pricingPrivate;
        bool qualityPrivate;
        bool supplyChainPrivate;
        bool pricingSelective;
        bool qualitySelective;
        bool supplyChainSelective;
        bytes32 pricingProofHash;
        bytes32 qualityProofHash;
        bytes32 supplyChainProofHash;
        PrivacyLevel level;
    }
    
    function getPrivacyConfig(uint256 batchId) external view returns (PrivacyConfig memory);
    function updatePrivacyConfig(uint256 batchId, PrivacyConfig calldata config) external;
    function verifyPrivacyProofs(uint256 batchId) external returns (bool);
}
