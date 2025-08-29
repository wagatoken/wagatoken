// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IPrivacyLayer} from "../ZKCircuits/Interfaces/IPrivacyLayer.sol";

contract SelectiveTransparency is AccessControl, IPrivacyLayer {
    bytes32 public constant PRIVACY_ADMIN_ROLE = keccak256("PRIVACY_ADMIN_ROLE");
    bytes32 public constant DATA_MANAGER_ROLE = keccak256("DATA_MANAGER_ROLE");
    
    // Privacy configuration for each batch
    mapping(uint256 => PrivacyConfig) private s_batchPrivacyConfig;
    
    // Public data storage (what competitors can see)
    mapping(uint256 => mapping(string => string)) private s_publicData;
    
    // Private data hashes (encrypted/obfuscated data)
    mapping(uint256 => mapping(string => bytes32)) private s_privateDataHashes;
    
    // Events
    event PrivacyLevelChanged(uint256 indexed batchId, PrivacyLevel oldLevel, PrivacyLevel newLevel);
    event PublicDataUpdated(uint256 indexed batchId, string dataType, string publicValue);
    event PrivateDataHashUpdated(uint256 indexed batchId, string dataType, bytes32 dataHash);
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PRIVACY_ADMIN_ROLE, msg.sender);
        _grantRole(DATA_MANAGER_ROLE, msg.sender);
    }
    
    // Privacy layer interface implementation
    function getPrivacyConfig(uint256 batchId) external view override returns (PrivacyConfig memory) {
        return s_batchPrivacyConfig[batchId];
    }
    
    function updatePrivacyConfig(uint256 batchId, PrivacyConfig calldata config) external override onlyRole(DATA_MANAGER_ROLE) {
        PrivacyLevel oldLevel = s_batchPrivacyConfig[batchId].level;
        s_batchPrivacyConfig[batchId] = config;
        
        emit PrivacyLevelChanged(batchId, oldLevel, config.level);
    }
    
    function verifyPrivacyProofs(uint256 batchId) external override returns (bool) {
        PrivacyConfig memory config = s_batchPrivacyConfig[batchId];
        return config.pricingPrivate && config.qualityPrivate && config.supplyChainPrivate;
    }
    
    // Public data management
    function setPublicData(
        uint256 batchId,
        string calldata dataType,
        string calldata publicValue
    ) external onlyRole(DATA_MANAGER_ROLE) {
        s_publicData[batchId][dataType] = publicValue;
        emit PublicDataUpdated(batchId, dataType, publicValue);
    }
    
    function getPublicData(uint256 batchId, string calldata dataType) external view returns (string memory) {
        return s_publicData[batchId][dataType];
    }
    
    // Private data hash management
    function setPrivateDataHash(
        uint256 batchId,
        string calldata dataType,
        bytes32 dataHash
    ) external onlyRole(DATA_MANAGER_ROLE) {
        s_privateDataHashes[batchId][dataType] = dataHash;
        emit PrivateDataHashUpdated(batchId, dataType, dataHash);
    }
    
    function getPrivateDataHash(uint256 batchId, string calldata dataType) external view returns (bytes32) {
        return s_privateDataHashes[batchId][dataType];
    }
    
    // Privacy level management
    function setPrivacyLevel(uint256 batchId, PrivacyLevel level) external onlyRole(PRIVACY_ADMIN_ROLE) {
        PrivacyLevel oldLevel = s_batchPrivacyConfig[batchId].level;
        s_batchPrivacyConfig[batchId].level = level;
        
        emit PrivacyLevelChanged(batchId, oldLevel, level);
    }
    
    // Batch privacy status
    function getBatchPrivacyStatus(uint256 batchId) external view returns (
        PrivacyLevel level,
        bool pricingPrivate,
        bool qualityPrivate,
        bool supplyChainPrivate
    ) {
        PrivacyConfig memory config = s_batchPrivacyConfig[batchId];
        return (
            config.level,
            config.pricingPrivate,
            config.qualityPrivate,
            config.supplyChainPrivate
        );
    }
    
    // Privacy level validation
    function validatePrivacyLevel(PrivacyLevel level) external pure returns (bool) {
        return level == PrivacyLevel.Public || 
               level == PrivacyLevel.Selective || 
               level == PrivacyLevel.Private;
    }
    
    // Batch privacy summary
    function getBatchPrivacySummary(uint256 batchId) external view returns (
        PrivacyLevel level,
        uint256 totalPrivateFields,
        uint256 totalPublicFields
    ) {
        PrivacyConfig memory config = s_batchPrivacyConfig[batchId];
        
        uint256 privateFields = 0;
        if (config.pricingPrivate) privateFields++;
        if (config.qualityPrivate) privateFields++;
        if (config.supplyChainPrivate) privateFields++;
        
        uint256 publicFields = 3 - privateFields; // Total fields minus private ones
        
        return (config.level, privateFields, publicFields);
    }
    
    // Privacy compliance check
    function checkPrivacyCompliance(uint256 batchId) external view returns (bool) {
        PrivacyConfig memory config = s_batchPrivacyConfig[batchId];
        
        // Check if privacy level matches the number of private fields
        if (config.level == PrivacyLevel.Private) {
            return config.pricingPrivate && config.qualityPrivate && config.supplyChainPrivate;
        } else if (config.level == PrivacyLevel.Selective) {
            return config.pricingPrivate || config.qualityPrivate || config.supplyChainPrivate;
        } else { // Public
            return !config.pricingPrivate && !config.qualityPrivate && !config.supplyChainPrivate;
        }
    }
    
    // Admin functions
    function grantPrivacyAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(PRIVACY_ADMIN_ROLE, account);
    }
    
    function grantDataManagerRole(address account) external onlyRole(PRIVACY_ADMIN_ROLE) {
        _grantRole(DATA_MANAGER_ROLE, account);
    }
    
    function revokePrivacyAdminRole(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _revokeRole(PRIVACY_ADMIN_ROLE, account);
    }
    
    function revokeDataManagerRole(address account) external onlyRole(PRIVACY_ADMIN_ROLE) {
        _revokeRole(DATA_MANAGER_ROLE, account);
    }
    
    // Emergency functions
    function emergencySetPublic(uint256 batchId) external onlyRole(DEFAULT_ADMIN_ROLE) {
        // In emergency, make all data public
        s_batchPrivacyConfig[batchId] = PrivacyConfig({
            pricingPrivate: false,
            qualityPrivate: false,
            supplyChainPrivate: false,
            pricingProofHash: bytes32(0),
            qualityProofHash: bytes32(0),
            supplyChainProofHash: bytes32(0),
            level: PrivacyLevel.Public
        });
        
        emit PrivacyLevelChanged(batchId, PrivacyLevel.Private, PrivacyLevel.Public);
    }
}
