// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEthiopianCompliance} from "../Interfaces/IEthiopianCompliance.sol";
import {IWAGAZKManager} from "../Interfaces/IWAGAZKManager.sol";
import {IWAGACoffeeToken} from "../Interfaces/IWAGACoffeeToken.sol";

/**
 * @title EUDRComplianceLib
 * @dev Library for EUDR compliance operations to reduce contract size
 * @notice Contains EUDR compliance logic extracted from WAGABatchManager
 */
library EUDRComplianceLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event EUDRComplianceRegistered(
        uint256 indexed batchId,
        string complianceLevel,
        string certificateId,
        uint256 expiryDate
    );
    
    event EUDRGeolocationDataAdded(
        uint256 indexed batchId,
        string plotType,
        uint256 plotSize,
        string verificationMethod
    );

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error BatchDoesNotExist();
    error EUDRCertificateExpired();
    error ZKProofVerificationFailed();

    /* -------------------------------------------------------------------------- */
    /*                                Core Functions                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register EUDR compliance for a batch with ZK proof validation
     */
    function registerEUDRComplianceWithZK(
        uint256 batchId,
        IEthiopianCompliance.EUDRCertificate calldata certificate,
        bytes calldata zkProofData,
        IWAGACoffeeToken coffeeToken,
        IEthiopianCompliance ethiopianCompliance,
        IWAGAZKManager zkManager,
        mapping(uint256 => bool) storage hasEUDRCompliance,
        mapping(uint256 => string) storage eudrComplianceLevel,
        mapping(uint256 => uint256) storage eudrComplianceTimestamp,
        mapping(uint256 => uint8) storage batchFlags
    ) internal {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }
        if (certificate.expiryDate <= block.timestamp) {
            revert EUDRCertificateExpired();
        }

        // Add EUDR certificate through Ethiopian compliance contract
        if (address(ethiopianCompliance) != address(0)) {
            ethiopianCompliance.addEUDRCertificate(batchId, certificate);
        }

        // Verify ZK proof for deforestation compliance (if ZK manager available)
        if (address(zkManager) != address(0)) {
            bool deforestationVerified = zkManager.addComplianceZKProof(
                batchId,
                "EUDR_DEFORESTATION",
                zkProofData,
                "Deforestation compliance verified for EU export"
            );

            if (!deforestationVerified) {
                revert ZKProofVerificationFailed();
            }
        }
        
        // Update batch EUDR compliance status
        hasEUDRCompliance[batchId] = true;
        eudrComplianceLevel[batchId] = certificate.complianceLevel;
        eudrComplianceTimestamp[batchId] = block.timestamp;

        // Set batch flag for EUDR compliance (using flag position 5)
        _setBatchFlag(batchFlags, batchId, 5, true);

        emit EUDRComplianceRegistered(
            batchId,
            certificate.complianceLevel,
            certificate.certificateId,
            certificate.expiryDate
        );
    }

    /**
     * @dev Add EUDR geolocation data for a batch with ZK proof validation
     */
    function addEUDRGeolocationDataWithZK(
        uint256 batchId,
        IEthiopianCompliance.GeolocationData calldata geolocation,
        bytes calldata zkProofData,
        IWAGACoffeeToken coffeeToken,
        IEthiopianCompliance ethiopianCompliance,
        IWAGAZKManager zkManager,
        mapping(uint256 => bool) storage hasDeforestationRiskAssessment,
        mapping(uint256 => uint8) storage batchFlags
    ) internal {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }

        // Add geolocation data through Ethiopian compliance contract
        if (address(ethiopianCompliance) != address(0)) {
            ethiopianCompliance.addGeolocationData(batchId, geolocation);
        }

        // Verify ZK proof for geolocation (if ZK manager available)
        if (address(zkManager) != address(0)) {
            bool geolocationVerified = zkManager.addComplianceZKProof(
                batchId,
                "EUDR_GEOLOCATION",
                zkProofData,
                "Geolocation verification for EU export compliance"
            );

            if (!geolocationVerified) {
                revert ZKProofVerificationFailed();
            }
        }

        // Mark deforestation risk assessment as completed
        hasDeforestationRiskAssessment[batchId] = true;

        // Set batch flag for geolocation verification (using flag position 6)
        _setBatchFlag(batchFlags, batchId, 6, true);

        emit EUDRGeolocationDataAdded(
            batchId,
            geolocation.plotType,
            geolocation.plotSize,
            geolocation.verificationMethod
        );
    }

    /**
     * @dev Validate complete EUDR compliance for a batch using ZK proofs
     */
    function validateEUDRZKCompliance(
        uint256 batchId,
        IWAGACoffeeToken coffeeToken,
        mapping(uint256 => bool) storage hasEUDRCompliance,
        mapping(uint256 => bool) storage hasDeforestationRiskAssessment,
        mapping(uint256 => uint8) storage batchFlags
    ) internal view returns (
        bool deforestationCompliant,
        bool geolocationVerified,
        bool fullyCompliant
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert BatchDoesNotExist();
        }

        deforestationCompliant = hasEUDRCompliance[batchId] && _getBatchFlag(batchFlags, batchId, 5);
        geolocationVerified = hasDeforestationRiskAssessment[batchId] && _getBatchFlag(batchFlags, batchId, 6);

        // Full compliance requires both deforestation and geolocation verification
        fullyCompliant = deforestationCompliant && geolocationVerified;
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