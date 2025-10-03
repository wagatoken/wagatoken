// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGAEthiopianBanking} from "./Interfaces/IWAGAEthiopianBanking.sol";
import {IWAGAZKManager} from "./Interfaces/IWAGAZKManager.sol";

/**
 * @title WAGABatchExportCompliance
 * @dev Manages Ethiopian and EUDR export compliance for WAGA Coffee batches
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
/**
 * @title WAGABatchExportCompliance
 * @dev Manages Ethiopian and EUDR export compliance for WAGA Coffee batches
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
 * @dev Focused on export readiness through Ethiopian and EUDR compliance verification
 */
contract WAGABatchExportCompliance {
    
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */
    
    // Central authority for access control
    WAGAConfigManager public immutable authority;
    IWAGACoffeeToken public immutable coffeeToken;
    IPrivacyLayer public immutable privacyLayer;
    address public ethiopianComplianceCore;
    address public ethiopianBanking;
    IWAGAZKManager public zkManager;

    // Ethiopian compliance tracking
    mapping(uint256 => bool) public isEthiopianBatch;
    mapping(uint256 => string) public ethiopianRegion; // Sidamo, Yirgacheffe, Harrar
    mapping(uint256 => bool) public hasEthiopianCompliance;

    // EUDR compliance tracking
    mapping(uint256 => bool) public hasEUDRCompliance;
    mapping(uint256 => string) public eudrComplianceLevel; // High, Standard, Low
    mapping(uint256 => uint256) public eudrComplianceTimestamp;
    mapping(uint256 => bool) public hasDeforestationRiskAssessment;
    mapping(uint256 => uint8) public complianceFlags; // Bit-packed compliance flags

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event EthiopianBatchRegistered(uint256 indexed batchId, string region, bool hasCompliance);
    event EthiopianComplianceAdded(uint256 indexed batchId, string complianceType, string documentHash);
    event EUDRComplianceRegistered(uint256 indexed batchId, string complianceLevel, string certificateId, uint256 expiryDate);
    event EUDRGeolocationDataAdded(uint256 indexed batchId, string plotType, uint256 plotSize, string verificationMethod);

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error WAGABatchExportCompliance__CallerDoesNotHaveRequiredRole();
    error WAGABatchExportCompliance__BatchDoesNotExist();
    error WAGABatchExportCompliance__NotEthiopianBatch();
    error WAGABatchExportCompliance__EthiopianComplianceNotConfigured();
    error WAGABatchExportCompliance__EUDRCertificateExpired();
    error WAGABatchExportCompliance__ZKProofVerificationFailed();
    error WAGABatchExportCompliance__ECTAPermitFailed();
    error WAGABatchExportCompliance__QualityCertificateFailed();
    error WAGABatchExportCompliance__OriginVerificationFailed();
    error WAGABatchExportCompliance__EUDRRegistrationFailed();
    error WAGABatchExportCompliance__GeolocationDataFailed();

    /* -------------------------------------------------------------------------- */
    /*                                 Modifiers                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert WAGABatchExportCompliance__CallerDoesNotHaveRequiredRole();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _coffeeToken, 
        address _privacyLayer,
        address _authority
    ) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        privacyLayer = IPrivacyLayer(_privacyLayer);
        authority = WAGAConfigManager(_authority);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Configuration                                 */
    /* -------------------------------------------------------------------------- */

    function setEthiopianComplianceCore(address _ethiopianComplianceCore) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        ethiopianComplianceCore = _ethiopianComplianceCore;
    }

    function setEthiopianBanking(address _ethiopianBanking) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        ethiopianBanking = _ethiopianBanking;
    }

    function setZKManager(address _zkManager) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        zkManager = IWAGAZKManager(_zkManager);
    }

    /* -------------------------------------------------------------------------- */
    /*                         ETHIOPIAN COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register Ethiopian batch and determine region
     */
    function registerEthiopianBatch(uint256 batchId, string calldata origin) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }

        // Determine if batch is Ethiopian based on origin
        bool isEthiopian = _isEthiopianOrigin(origin);
        isEthiopianBatch[batchId] = isEthiopian;
        
        if (isEthiopian) {
            ethiopianRegion[batchId] = _determineEthiopianRegion(origin);
            emit EthiopianBatchRegistered(batchId, ethiopianRegion[batchId], false);
        }
    }

    /**
     * @dev Add ECTA permit for Ethiopian batch during creation
     */
    function addECTAPermitDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.ECTAPermit calldata permit
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }
        if (!isEthiopianBatch[batchId]) {
            revert WAGABatchExportCompliance__NotEthiopianBatch();
        }
        if (ethiopianComplianceCore == address(0)) {
            revert WAGABatchExportCompliance__EthiopianComplianceNotConfigured();
        }

        // Add permit through Ethiopian compliance core contract
        (bool success,) = ethiopianComplianceCore.call(
            abi.encodeWithSignature("addECTAPermit(uint256,(string,string,string,uint256,uint256,bool,string))", batchId, permit)
        );
        require(success, "Failed to add ECTA permit");
        
        // Update compliance status
        _setComplianceFlag(batchId, 0, true); // ECTA permit added
        
        emit EthiopianComplianceAdded(batchId, "ECTA_PERMIT", permit.permitDocumentHash);
    }

    /**
     * @dev Add quality certificate for Ethiopian batch during creation
     */
    function addQualityCertificateDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.QualityCertificate calldata certificate
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }
        if (!isEthiopianBatch[batchId]) {
            revert WAGABatchExportCompliance__NotEthiopianBatch();
        }
        if (ethiopianComplianceCore == address(0)) {
            revert WAGABatchExportCompliance__EthiopianComplianceNotConfigured();
        }

        // Add certificate through Ethiopian compliance core contract
        (bool success,) = ethiopianComplianceCore.call(
            abi.encodeWithSignature("addQualityCertificate(uint256,(string,string,uint256,uint256,bool,uint256,string,string))", batchId, certificate)
        );
        require(success, "Failed to add quality certificate");
        
        // Update compliance status
        _setComplianceFlag(batchId, 1, true); // Quality certificate added
        
        emit EthiopianComplianceAdded(batchId, "QUALITY_CERTIFICATE", certificate.certificateHash);
    }

    /**
     * @dev Add origin verification for Ethiopian batch during creation
     */
    function addOriginVerificationDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.OriginVerification calldata origin
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }
        if (!isEthiopianBatch[batchId]) {
            revert WAGABatchExportCompliance__NotEthiopianBatch();
        }
        if (ethiopianComplianceCore == address(0)) {
            revert WAGABatchExportCompliance__EthiopianComplianceNotConfigured();
        }

        // Add origin verification through Ethiopian compliance core contract
        (bool success,) = ethiopianComplianceCore.call(
            abi.encodeWithSignature("addOriginVerification(uint256,(string,string,string,string,string,bool,uint256,string))", batchId, origin)
        );
        require(success, "Failed to add origin verification");
        
        // Update compliance status
        _setComplianceFlag(batchId, 2, true); // Origin verification added
        hasEthiopianCompliance[batchId] = true;
        
        emit EthiopianComplianceAdded(batchId, "ORIGIN_VERIFICATION", origin.verificationDocumentHash);
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register EUDR compliance for a batch with ZK proof validation
     */
    function registerEUDRComplianceWithZK(
        uint256 batchId,
        IEthiopianCompliance.EUDRCertificate calldata certificate,
        bytes calldata zkProofData
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }
        if (certificate.expiryDate <= block.timestamp) {
            revert WAGABatchExportCompliance__EUDRCertificateExpired();
        }

        // For MVP, basic ZK proof validation would be done through other contracts
        // ZK proof verification can be enhanced in future versions
        if (address(zkManager) != address(0) && zkProofData.length == 0) {
            revert WAGABatchExportCompliance__ZKProofVerificationFailed();
        }

        // Register EUDR compliance through Ethiopian compliance core
        (bool success,) = ethiopianComplianceCore.call(
            abi.encodeWithSignature("registerEUDRCompliance(uint256,(string,string,uint256,uint256,bool,string,string,string))", batchId, certificate)
        );
        require(success, "Failed to register EUDR compliance");
        
        // Update EUDR tracking
        hasEUDRCompliance[batchId] = true;
        eudrComplianceLevel[batchId] = certificate.complianceLevel;
        eudrComplianceTimestamp[batchId] = block.timestamp;
        _setComplianceFlag(batchId, 3, true); // EUDR compliance added
        
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
        bytes calldata zkProofData
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }

        // For MVP, basic ZK proof validation would be done through other contracts
        // ZK proof verification can be enhanced in future versions
        if (address(zkManager) != address(0) && zkProofData.length == 0) {
            revert WAGABatchExportCompliance__ZKProofVerificationFailed();
        }

        // Add geolocation data through Ethiopian compliance core
        (bool success,) = ethiopianComplianceCore.call(
            abi.encodeWithSignature("addGeolocationData(uint256,(string,string,uint256,string))", batchId, geolocation)
        );
        require(success, "Failed to add geolocation data");
        
        // Update deforestation risk assessment status
        hasDeforestationRiskAssessment[batchId] = true;
        _setComplianceFlag(batchId, 4, true); // Geolocation data added
        
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
    function validateEUDRZKCompliance(uint256 batchId) external view returns (
        bool deforestationCompliant,
        bool geolocationVerified,
        bool fullyCompliant
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }

        deforestationCompliant = hasEUDRCompliance[batchId];
        geolocationVerified = hasDeforestationRiskAssessment[batchId];
        fullyCompliant = deforestationCompliant && geolocationVerified;
    }

    /* -------------------------------------------------------------------------- */
    /*                               View Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get Ethiopian compliance status
     */
    function getEthiopianComplianceStatus(uint256 batchId) external view returns (
        bool isEthiopian,
        string memory region,
        bool hasCompliance
    ) {
        isEthiopian = isEthiopianBatch[batchId];
        region = ethiopianRegion[batchId];
        hasCompliance = hasEthiopianCompliance[batchId];
    }

    /**
     * @dev Get EUDR compliance status
     */
    function getEUDRComplianceStatus(uint256 batchId) external view returns (
        bool hasCompliance,
        string memory complianceLevel,
        uint256 timestamp,
        bool hasDeforestationAssessment
    ) {
        hasCompliance = hasEUDRCompliance[batchId];
        complianceLevel = eudrComplianceLevel[batchId];
        timestamp = eudrComplianceTimestamp[batchId];
        hasDeforestationAssessment = hasDeforestationRiskAssessment[batchId];
    }

    /**
     * @dev Check if batch is ready for export
     */
    function isReadyForExport(uint256 batchId) external view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchExportCompliance__BatchDoesNotExist();
        }

        // Non-Ethiopian batches need only EUDR compliance
        if (!isEthiopianBatch[batchId]) {
            return hasEUDRCompliance[batchId];
        }
        
        // Ethiopian batches need both Ethiopian and EUDR compliance
        if (ethiopianComplianceCore == address(0)) {
            return false;
        }
        
        // Call validateUpstreamCompliance on the core contract
        (bool success, bytes memory result) = ethiopianComplianceCore.staticcall(
            abi.encodeWithSignature("validateUpstreamCompliance(uint256)", batchId)
        );
        bool upstreamValid = success && abi.decode(result, (bool));
        
        return hasEthiopianCompliance[batchId] && 
               hasEUDRCompliance[batchId] &&
               upstreamValid;
    }

    /**
     * @dev Get complete export compliance summary
     */
    function getExportComplianceSummary(uint256 batchId) external view returns (
        bool isEthiopian,
        bool hasEthiopianComplianceStatus,
        bool hasEUDRComplianceStatus,
        bool isExportReady
    ) {
        isEthiopian = isEthiopianBatch[batchId];
        hasEthiopianComplianceStatus = hasEthiopianCompliance[batchId];
        hasEUDRComplianceStatus = hasEUDRCompliance[batchId];
        isExportReady = this.isReadyForExport(batchId);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Determine if origin indicates Ethiopian coffee
     */
    function _isEthiopianOrigin(string memory origin) internal pure returns (bool) {
        bytes memory originBytes = bytes(origin);
        bytes memory sidamo = bytes("Sidamo");
        bytes memory yirgacheffe = bytes("Yirgacheffe");
        bytes memory harrar = bytes("Harrar");
        bytes memory ethiopia = bytes("Ethiopia");
        
        return _contains(originBytes, sidamo) || 
               _contains(originBytes, yirgacheffe) || 
               _contains(originBytes, harrar) ||
               _contains(originBytes, ethiopia);
    }

    /**
     * @dev Determine Ethiopian region from origin string
     */
    function _determineEthiopianRegion(string memory origin) internal pure returns (string memory) {
        bytes memory originBytes = bytes(origin);
        
        if (_contains(originBytes, bytes("Sidamo"))) return "Sidamo";
        if (_contains(originBytes, bytes("Yirgacheffe"))) return "Yirgacheffe";
        if (_contains(originBytes, bytes("Harrar"))) return "Harrar";
        
        return "Other Ethiopian";
    }

    /**
     * @dev Check if bytes array contains substring
     */
    function _contains(bytes memory source, bytes memory target) internal pure returns (bool) {
        if (target.length > source.length) return false;
        
        for (uint256 i = 0; i <= source.length - target.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < target.length; j++) {
                if (source[i + j] != target[j]) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }

    /**
     * @dev Set a specific compliance flag for a batch
     */
    function _setComplianceFlag(uint256 batchId, uint8 flagBit, bool value) internal {
        uint8 currentFlags = complianceFlags[batchId];
        if (value) {
            complianceFlags[batchId] = uint8(currentFlags | (1 << flagBit));
        } else {
            complianceFlags[batchId] = uint8(currentFlags & ~(1 << flagBit));
        }
    }

    /**
     * @dev Get a specific compliance flag for a batch
     */
    function getComplianceFlag(uint256 batchId, uint8 flagBit) public view returns (bool) {
        uint8 currentFlags = complianceFlags[batchId];
        return (currentFlags & (1 << flagBit)) != 0;
    }
}