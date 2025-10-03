// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEthiopianCompliance} from "../Interfaces/IEthiopianCompliance.sol";
import {IPrivacyLayer} from "../Interfaces/IPrivacyLayer.sol";

/**
 * @title BatchEthiopianComplianceLib
 * @dev Library for Ethiopian compliance operations in batch management to reduce contract size
 * @notice Contains Ethiopian compliance logic extracted from WAGABatchManager
 */
library BatchEthiopianComplianceLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event EthiopianBatchRegistered(
        uint256 indexed batchId,
        string region,
        bool hasCompliance
    );
    
    event EthiopianComplianceAdded(
        uint256 indexed batchId,
        string complianceType,
        string documentHash
    );

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error NotEthiopianBatch();
    error EthiopianComplianceNotConfigured();

    /* -------------------------------------------------------------------------- */
    /*                                Core Functions                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if origin indicates Ethiopian coffee
     */
    function isEthiopianOrigin(string memory origin) internal pure returns (bool) {
        bytes32 originHash = keccak256(bytes(origin));
        
        return (
            originHash == keccak256("Sidamo") || originHash == keccak256("sidamo") ||
            originHash == keccak256("Yirgacheffe") || originHash == keccak256("yirgacheffe") ||
            originHash == keccak256("Harrar") || originHash == keccak256("harrar") ||
            originHash == keccak256("Ethiopia") || originHash == keccak256("ethiopia")
        );
    }

    /**
     * @dev Extract Ethiopian region from origin string
     */
    function extractEthiopianRegion(string memory origin) internal pure returns (string memory) {
        bytes32 originHash = keccak256(bytes(origin));
        
        if (originHash == keccak256("Sidamo") || originHash == keccak256("sidamo")) return "Sidamo";
        if (originHash == keccak256("Yirgacheffe") || originHash == keccak256("yirgacheffe")) return "Yirgacheffe";
        if (originHash == keccak256("Harrar") || originHash == keccak256("harrar")) return "Harrar";
        
        return "Ethiopia";
    }

    /**
     * @dev Protect Ethiopian compliance data through privacy layer
     */
    function protectEthiopianComplianceData(
        IPrivacyLayer privacyLayer,
        address batchCreator,
        uint256 batchId,
        string memory dataType,
        string memory documentHash
    ) internal {
        if (address(privacyLayer) != address(0) && batchCreator != address(0)) {
            privacyLayer.protectDataWithCaller(
                batchCreator,
                batchId,
                dataType,
                documentHash
            );
        }
    }

    /**
     * @dev Add ECTA permit for Ethiopian batch during creation
     */
    function addECTAPermitDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.ECTAPermit calldata permit,
        mapping(uint256 => bool) storage isEthiopianBatch,
        IEthiopianCompliance ethiopianCompliance,
        IPrivacyLayer privacyLayer,
        address batchCreator
    ) internal {
        if (!isEthiopianBatch[batchId]) {
            revert NotEthiopianBatch();
        }
        if (address(ethiopianCompliance) == address(0)) {
            revert EthiopianComplianceNotConfigured();
        }
        
        ethiopianCompliance.addECTAPermit(batchId, permit);
        protectEthiopianComplianceData(privacyLayer, batchCreator, batchId, "ECTA_PERMIT", permit.permitDocumentHash);
        
        emit EthiopianComplianceAdded(batchId, "ECTA_PERMIT", permit.permitDocumentHash);
    }

    /**
     * @dev Add quality certificate for Ethiopian batch during creation
     */
    function addQualityCertificateDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.QualityCertificate calldata certificate,
        mapping(uint256 => bool) storage isEthiopianBatch,
        IEthiopianCompliance ethiopianCompliance,
        IPrivacyLayer privacyLayer,
        address batchCreator
    ) internal {
        if (!isEthiopianBatch[batchId]) {
            revert NotEthiopianBatch();
        }
        if (address(ethiopianCompliance) == address(0)) {
            revert EthiopianComplianceNotConfigured();
        }
        
        ethiopianCompliance.addQualityCertificate(batchId, certificate);
        protectEthiopianComplianceData(privacyLayer, batchCreator, batchId, "QUALITY_CERT", certificate.certificateHash);
        
        emit EthiopianComplianceAdded(batchId, "QUALITY_CERT", certificate.certificateHash);
    }

    /**
     * @dev Add origin verification for Ethiopian batch during creation
     */
    function addOriginVerificationDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.OriginVerification calldata origin,
        mapping(uint256 => bool) storage isEthiopianBatch,
        mapping(uint256 => bool) storage hasEthiopianCompliance,
        mapping(uint256 => string) storage ethiopianRegion,
        IEthiopianCompliance ethiopianCompliance,
        IPrivacyLayer privacyLayer,
        address batchCreator
    ) internal {
        if (!isEthiopianBatch[batchId]) {
            revert NotEthiopianBatch();
        }
        if (address(ethiopianCompliance) == address(0)) {
            revert EthiopianComplianceNotConfigured();
        }
        
        ethiopianCompliance.addOriginVerification(batchId, origin);
        protectEthiopianComplianceData(privacyLayer, batchCreator, batchId, "ORIGIN_VERIFICATION", origin.verificationDocumentHash);
        
        // Mark batch as having Ethiopian compliance if all requirements are met
        bool hasCompliance = ethiopianCompliance.validateUpstreamCompliance(batchId);
        if (hasCompliance) {
            hasEthiopianCompliance[batchId] = true;
            emit EthiopianBatchRegistered(batchId, ethiopianRegion[batchId], true);
        }
        
        emit EthiopianComplianceAdded(batchId, "ORIGIN_VERIFICATION", origin.verificationDocumentHash);
    }

    /**
     * @dev Process Ethiopian batch registration logic
     */
    function processEthiopianBatchRegistration(
        uint256 batchId,
        string calldata origin,
        mapping(uint256 => bool) storage isEthiopianBatch,
        mapping(uint256 => string) storage ethiopianRegion
    ) internal {
        if (isEthiopianOrigin(origin)) {
            isEthiopianBatch[batchId] = true;
            ethiopianRegion[batchId] = extractEthiopianRegion(origin);
            emit EthiopianBatchRegistered(batchId, ethiopianRegion[batchId], false);
        }
    }
}