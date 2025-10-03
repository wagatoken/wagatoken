// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";

/**
 * @title WAGAEthiopianComplianceCore
 * @dev Manages core Ethiopian coffee export compliance (ECTA, Quality, Origin, EUDR)
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
 * @author WAGA Team
 */
contract WAGAEthiopianComplianceCore is ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error EUDRCertificateExpired();
    error InvalidGeolocationData();
    error EUDRComplianceNotMet();
    error CallerDoesNotHaveRequiredRole();
    error InvalidAccessControlAddress();
    error InvalidPermitNumber();
    error PermitExpired();
    error InvalidCertificateNumber();
    error MoistureContentTooHigh();
    error ScreenSizeTooSmall();
    error InvalidRegion();
    error InvalidCooperativeName();
    error InvalidCooperativeLicense();

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // Central Authority
    WAGAConfigManager public immutable authority;

    // Compliance data mappings
    mapping(uint256 => IEthiopianCompliance.ECTAPermit) private ectaPermits;
    mapping(uint256 => IEthiopianCompliance.QualityCertificate) private qualityCertificates;
    mapping(uint256 => IEthiopianCompliance.OriginVerification) private originVerifications;
    
    // EUDR compliance data
    mapping(uint256 => IEthiopianCompliance.EUDRCertificate) private eudrCertificates;
    mapping(uint256 => IEthiopianCompliance.GeolocationData) private geolocationData;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ECTAPermitAdded(uint256 indexed batchId, string permitNumber);
    event QualityCertificateAdded(uint256 indexed batchId, string certificateNumber);
    event OriginVerified(uint256 indexed batchId, string region, string cooperativeName);
    event EUDRCertificateAdded(uint256 indexed batchId, string certificateId, string issuer);
    event GeolocationDataAdded(uint256 indexed batchId, string plotType, uint256 plotSize);

    /* -------------------------------------------------------------------------- */
    /*                                 MODIFIERS                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert CallerDoesNotHaveRequiredRole();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                CONSTRUCTOR                                 */
    /* -------------------------------------------------------------------------- */

    constructor(address _authority) {
        if (_authority == address(0)) {
            revert InvalidAccessControlAddress();
        }
        authority = WAGAConfigManager(_authority);
    }

    /* -------------------------------------------------------------------------- */
    /*                            COMPLIANCE FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add ECTA permit information for a batch
     * @param batchId Batch identifier
     * @param permit ECTA permit details
     */
    function addECTAPermit(
        uint256 batchId,
        IEthiopianCompliance.ECTAPermit memory permit
    ) external callerHasRole(keccak256("COMPLIANCE_MANAGER_ROLE")) {
        if (bytes(permit.permitNumber).length == 0) {
            revert InvalidPermitNumber();
        }
        if (permit.expiryDate <= block.timestamp) {
            revert PermitExpired();
        }

        ectaPermits[batchId] = permit;
        emit ECTAPermitAdded(batchId, permit.permitNumber);
    }

    /**
     * @dev Add quality certificate for a batch
     * @param batchId Batch identifier
     * @param certificate Quality certificate details
     */
    function addQualityCertificate(
        uint256 batchId,
        IEthiopianCompliance.QualityCertificate memory certificate
    ) external callerHasRole(keccak256("QUALITY_INSPECTOR_ROLE")) {
        if (bytes(certificate.certificateNumber).length == 0) {
            revert InvalidCertificateNumber();
        }
        if (certificate.moistureContent > 12) {
            revert MoistureContentTooHigh();
        }
        if (certificate.screenSize < 14) {
            revert ScreenSizeTooSmall();
        }

        qualityCertificates[batchId] = certificate;
        emit QualityCertificateAdded(batchId, certificate.certificateNumber);
    }

    /**
     * @dev Add origin verification for a batch
     * @param batchId Batch identifier
     * @param origin Origin verification details
     */
    function addOriginVerification(
        uint256 batchId,
        IEthiopianCompliance.OriginVerification memory origin
    ) external callerHasRole(keccak256("ORIGIN_VERIFIER_ROLE")) {
        if (bytes(origin.region).length == 0) {
            revert InvalidRegion();
        }
        if (bytes(origin.cooperativeName).length == 0) {
            revert InvalidCooperativeName();
        }
        if (bytes(origin.cooperativeLicense).length == 0) {
            revert InvalidCooperativeLicense();
        }

        originVerifications[batchId] = origin;
        emit OriginVerified(batchId, origin.region, origin.cooperativeName);
    }

    /**
     * @dev Validate all upstream compliance for a batch
     * @param batchId Batch identifier
     * @return isCompliant True if all compliance requirements are met
     */
    function validateUpstreamCompliance(uint256 batchId) external view returns (bool isCompliant) {
        IEthiopianCompliance.ECTAPermit memory permit = ectaPermits[batchId];
        IEthiopianCompliance.QualityCertificate memory certificate = qualityCertificates[batchId];
        IEthiopianCompliance.OriginVerification memory origin = originVerifications[batchId];

        return (
            permit.isValid &&
            permit.expiryDate > block.timestamp &&
            certificate.scaeCompliant &&
            origin.verified
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add EUDR certificate for a batch
     * @param batchId Batch identifier
     * @param certificate EUDR certificate details
     */
    function addEUDRCertificate(uint256 batchId, IEthiopianCompliance.EUDRCertificate calldata certificate) external callerHasRole(keccak256("COMPLIANCE_MANAGER_ROLE")) {
        if (certificate.expiryDate <= block.timestamp) {
            revert EUDRCertificateExpired();
        }
        eudrCertificates[batchId] = certificate;
        emit EUDRCertificateAdded(batchId, certificate.certificateId, certificate.issuer);
    }

    /**
     * @dev Add geolocation data for a batch
     * @param batchId Batch identifier
     * @param geoData Geolocation data for EUDR compliance
     */
    function addGeolocationData(uint256 batchId, IEthiopianCompliance.GeolocationData calldata geoData) external callerHasRole(keccak256("ORIGIN_VERIFIER_ROLE")) {
        if (bytes(geoData.coordinates).length == 0) {
            revert InvalidGeolocationData();
        }
        geolocationData[batchId] = geoData;
        emit GeolocationDataAdded(batchId, geoData.plotType, geoData.plotSize);
    }

    /**
     * @dev Validate EUDR compliance for a batch
     * @param batchId Batch identifier
     * @return isCompliant Whether batch meets EUDR requirements
     */
    function validateEUDRCompliance(uint256 batchId) external view returns (bool isCompliant) {
        IEthiopianCompliance.EUDRCertificate memory cert = eudrCertificates[batchId];
        IEthiopianCompliance.GeolocationData memory geo = geolocationData[batchId];

        if (!cert.isValid || cert.expiryDate <= block.timestamp) {
            revert EUDRComplianceNotMet();
        }

        return bytes(geo.coordinates).length > 0 && geo.plotSize > 0;
    }

    /* -------------------------------------------------------------------------- */
    /*                                VIEW FUNCTIONS                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get ECTA permit information for a batch
     * @param batchId Batch identifier
     * @return permit ECTA permit details
     */
    function getECTAPermit(uint256 batchId) external view returns (IEthiopianCompliance.ECTAPermit memory permit) {
        return ectaPermits[batchId];
    }

    /**
     * @dev Get quality certificate for a batch
     * @param batchId Batch identifier
     * @return certificate Quality certificate details
     */
    function getQualityCertificate(uint256 batchId) external view returns (IEthiopianCompliance.QualityCertificate memory certificate) {
        return qualityCertificates[batchId];
    }

    /**
     * @dev Get origin verification for a batch
     * @param batchId Batch identifier
     * @return origin Origin verification details
     */
    function getOriginVerification(uint256 batchId) external view returns (IEthiopianCompliance.OriginVerification memory origin) {
        return originVerifications[batchId];
    }

    /**
     * @dev Get compliance status summary for a batch
     * @param batchId Batch identifier
     * @return hasECTA Has valid ECTA permit
     * @return hasQuality Has valid quality certificate
     * @return hasOrigin Has verified origin
     * @return isFullyCompliant All compliance requirements met
     */
    function getComplianceStatus(uint256 batchId) external view returns (
        bool hasECTA,
        bool hasQuality,
        bool hasOrigin,
        bool isFullyCompliant
    ) {
        IEthiopianCompliance.ECTAPermit memory permit = ectaPermits[batchId];
        IEthiopianCompliance.QualityCertificate memory certificate = qualityCertificates[batchId];
        IEthiopianCompliance.OriginVerification memory origin = originVerifications[batchId];
        
        hasECTA = permit.isValid && permit.expiryDate > block.timestamp;
        hasQuality = certificate.scaeCompliant;
        hasOrigin = origin.verified;
        isFullyCompliant = hasECTA && hasQuality && hasOrigin;
    }

    /**
     * @dev Get EUDR certificate for a batch
     * @param batchId Batch identifier
     * @return certificate EUDR certificate details
     */
    function getEUDRCertificate(uint256 batchId) external view returns (IEthiopianCompliance.EUDRCertificate memory certificate) {
        return eudrCertificates[batchId];
    }

    /**
     * @dev Get geolocation data for a batch
     * @param batchId Batch identifier
     * @return geoData Geolocation data
     */
    function getGeolocationData(uint256 batchId) external view returns (IEthiopianCompliance.GeolocationData memory geoData) {
        return geolocationData[batchId];
    }
}