// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWAGACoffeeToken} from "../Interfaces/IWAGACoffeeToken.sol";
import {IPrivacyLayer} from "../Interfaces/IPrivacyLayer.sol";
import {WAGAConfigManager} from "../WAGAConfigManager.sol";

/**
 * @title MetadataManagementLib
 * @dev Library for metadata management operations to reduce contract size
 * @notice Contains metadata management logic extracted from WAGABatchManager
 */
library MetadataManagementLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchMetadataUpdated(uint256 indexed batchId, string metadataHash);

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error BatchDoesNotExist();

    /* -------------------------------------------------------------------------- */
    /*                                Core Functions                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify batch metadata - handles packaging and metadata verification
     */
    function verifyBatchMetadata(
        uint256 batchId,
        string calldata verifiedPackaging,
        string calldata verifiedMetadataHash,
        IWAGACoffeeToken coffeeToken,
        mapping(uint256 => string) storage additionalPackagingInfo,
        mapping(uint256 => string) storage verifiedMetadataHashes,
        mapping(uint256 => uint8) storage batchFlags
    ) internal {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        
        // Store the verified packaging info in additional metadata
        additionalPackagingInfo[batchId] = verifiedPackaging;
        
        // Validate that verifiedMetadataHash is provided
        require(bytes(verifiedMetadataHash).length > 0, "Verified metadata hash required");
        
        // Store the verified metadata hash for future reference
        verifiedMetadataHashes[batchId] = verifiedMetadataHash;
        
        // Mark metadata as verified using flag
        _setBatchFlag(batchFlags, batchId, 1, true); // isMetadataVerified
        
        emit BatchMetadataUpdated(batchId, verifiedMetadataHash);
    }

    /**
     * @dev Returns whether batch metadata is verified
     */
    function isBatchMetadataVerified(
        uint256 batchId,
        IWAGACoffeeToken coffeeToken,
        mapping(uint256 => uint8) storage batchFlags
    ) internal view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        return _getBatchFlag(batchFlags, batchId, 1); // isMetadataVerified flag
    }

    /**
     * @dev Get the verified metadata hash for a batch
     */
    function getVerifiedMetadataHash(
        uint256 batchId,
        IWAGACoffeeToken coffeeToken,
        mapping(uint256 => string) storage verifiedMetadataHashes
    ) internal view returns (string memory) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        return verifiedMetadataHashes[batchId];
    }

    /**
     * @dev Update ZK claims after proof verification
     */
    function updateZKClaims(
        uint256 batchId,
        string calldata pricingClaim,
        string calldata qualityClaim,
        string calldata supplyChainClaim,
        IWAGACoffeeToken coffeeToken,
        IPrivacyLayer privacyLayer
    ) internal {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        
        // Validate that claims are provided
        require(bytes(pricingClaim).length > 0, "Pricing claim required");
        require(bytes(qualityClaim).length > 0, "Quality claim required"); 
        require(bytes(supplyChainClaim).length > 0, "Supply chain claim required");
        
        // Update claims through privacy layer
        privacyLayer.updatePublicClaims(batchId, pricingClaim, qualityClaim, supplyChainClaim);
    }

    /**
     * @dev Check if viewer can access pricing data
     */
    function canViewPricingData(
        uint256 batchId,
        address viewer,
        address batchCreator,
        WAGAConfigManager authority
    ) internal view returns (bool) {
        return viewer == batchCreator || 
               authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), viewer) ||
               authority.hasRole(keccak256("VERIFIER_ROLE"), viewer);
    }

    /**
     * @dev Check if viewer can access supply chain data
     */
    function canViewSupplyChainData(
        uint256 batchId,
        address viewer,
        address batchCreator,
        WAGAConfigManager authority
    ) internal view returns (bool) {
        return viewer == batchCreator || 
               authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), viewer) ||
               authority.hasRole(keccak256("VERIFIER_ROLE"), viewer) ||
               authority.hasRole(keccak256("PROCESSOR_ROLE"), viewer);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set a specific flag for a batch
     */
    function _setBatchFlag(
        mapping(uint256 => uint8) storage batchFlags,
        uint256 batchId,
        uint8 flagBit,
        bool value
    ) internal {
        uint8 currentFlags = batchFlags[batchId];
        if (value) {
            batchFlags[batchId] = uint8(currentFlags | (1 << flagBit));
        } else {
            batchFlags[batchId] = uint8(currentFlags & ~(1 << flagBit));
        }
    }

    /**
     * @dev Get a specific flag for a batch
     */
    function _getBatchFlag(
        mapping(uint256 => uint8) storage batchFlags,
        uint256 batchId,
        uint8 flagBit
    ) internal view returns (bool) {
        uint8 currentFlags = batchFlags[batchId];
        return (currentFlags & (1 << flagBit)) != 0;
    }
}