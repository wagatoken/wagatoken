// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {IWAGABatchManager} from "./Interfaces/IWAGABatchManager.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGAZKManager} from "./Interfaces/IWAGAZKManager.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";

/**
 * @title WAGABatchManager
 * @dev Manages additional batch metadata for WAGA Coffee system
 * @dev No longer inherits WAGAViewFunctions to avoid state duplication
 */
contract WAGABatchManager is IWAGABatchManager {
    /* -------------------------------------------------------------------------- */
    /*                                   Constants                                */
    /* -------------------------------------------------------------------------- */
    
    bytes32 public constant PROOF_OF_RESERVE_ROLE = keccak256("PROOF_OF_RESERVE_ROLE");
    
    /* -------------------------------------------------------------------------- */
    /*                                   Constants                                */
    /* -------------------------------------------------------------------------- */

    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE"); // Align with WAGAConfigManager
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error WAGABatchManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
    error WAGABatchManager__BatchDoesNotExist_createBatchInfo();
    error WAGABatchManager__BatchDoesNotExist_updateBatchMetadata();
    error WAGABatchManager__BatchDoesNotExist_getBatchInfo();
    error WAGABatchManager__BatchDoesNotExist_registerEUDRComplianceWithZK();
    error WAGABatchManager__EUDRCertificateExpired_registerEUDRComplianceWithZK();
    error WAGABatchManager__BatchDoesNotExist_addEUDRGeolocationDataWithZK();
    error WAGABatchManager__ZKProofVerificationFailed_addEUDRComplianceWithZK();

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    IWAGACoffeeToken public immutable coffeeToken;
    WAGACoffeeTokenCore public immutable coffeeTokenContract;
    IPrivacyLayer public immutable privacyLayer;
    IEthiopianCompliance public ethiopianCompliance;

    // Additional batch metadata (extending what's in WAGAViewFunctions)
    mapping(uint256 => string) public batchOrigin;
    mapping(uint256 => string) public additionalPackagingInfo;
    mapping(uint256 => address) public batchCreator;
    mapping(uint256 => uint256) public batchCreationTimestamp;
    mapping(uint256 => uint8) public batchFlags; // Bit-packed flags
    
    // Ethiopian compliance integration
    mapping(uint256 => bool) public isEthiopianBatch;
    mapping(uint256 => string) public ethiopianRegion; // Sidamo, Yirgacheffe, Harrar
    mapping(uint256 => bool) public hasEthiopianCompliance;

    // EUDR compliance integration
    mapping(uint256 => bool) public hasEUDRCompliance;
    mapping(uint256 => string) public eudrComplianceLevel; // High, Standard, Low
    mapping(uint256 => uint256) public eudrComplianceTimestamp;
    mapping(uint256 => bool) public hasDeforestationRiskAssessment;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchInfoUpdated(
        uint256 indexed batchId,
        string origin,
        string packagingInfo
    );

    event BatchMetadataUpdated(uint256 indexed batchId, string metadataHash);
    event BatchInventoryUpdated(uint256 indexed batchId, uint256 verifiedQuantity);
    event BatchVerificationStatusChanged(uint256 indexed batchId, bool isVerified);
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

    // EUDR Events
    event EUDRComplianceRegistered(
        uint256 indexed batchId,
        string complianceLevel,
        string certificateId,
        uint256 certificateExpiry
    );
    event EUDRGeolocationDataAdded(
        uint256 indexed batchId,
        string plotType,
        uint256 plotSize,
        string verificationMethod
    );
    event EUDRZKComplianceValidated(
        uint256 indexed batchId,
        bool deforestationCompliant,
        bool geolocationVerified
    );

    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                    */
    /* -------------------------------------------------------------------------- */

    error WAGABatchManager__InvalidEthiopianComplianceAddress_setEthiopianCompliance();
    error WAGABatchManager__NotEthiopianBatch_addECTAPermitDuringCreation();
    error WAGABatchManager__EthiopianComplianceNotConfigured_addECTAPermitDuringCreation();
    error WAGABatchManager__NotEthiopianBatch_addQualityCertificateDuringCreation();
    error WAGABatchManager__EthiopianComplianceNotConfigured_addQualityCertificateDuringCreation();
    error WAGABatchManager__NotEthiopianBatch_addOriginVerificationDuringCreation();
    error WAGABatchManager__EthiopianComplianceNotConfigured_addOriginVerificationDuringCreation();

    /* -------------------------------------------------------------------------- */
    /*                                Modifiers                                   */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        _checkCallerHasRoleFromCoffeeToken(roleType, msg.sender);
        _;
    }

    modifier callerHasRoleFromCoffeeTokenWithCaller(bytes32 roleType, address caller) {
        _checkCallerHasRoleFromCoffeeToken(roleType, caller);
        _;
    }

    function _checkCallerHasRoleFromCoffeeToken(bytes32 roleType, address caller) internal view {
        // Use the actual contract for direct role checking
        if (!coffeeTokenContract.hasRole(roleType, caller)) {
            revert WAGABatchManager__CallerDoesNotHaveRequiredRole_callerHasRoleFromCoffeeToken();
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(address _coffeeToken, address _privacyLayer) {
        coffeeToken = IWAGACoffeeToken(_coffeeToken);
        coffeeTokenContract = WAGACoffeeTokenCore(_coffeeToken);
        privacyLayer = IPrivacyLayer(_privacyLayer);
        // Ethiopian compliance will be set separately via setEthiopianCompliance
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register additional batch metadata after creation
     * Called by WAGACoffeeTokenCore after batch creation
     */
    function registerBatchCreation(
        uint256 batchId,
        string calldata origin,
        address creator
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        batchOrigin[batchId] = origin;
        batchCreator[batchId] = creator;
        batchCreationTimestamp[batchId] = block.timestamp;
        
        // Check if this is an Ethiopian batch
        if (_isEthiopianOrigin(origin)) {
            isEthiopianBatch[batchId] = true;
            ethiopianRegion[batchId] = _extractEthiopianRegion(origin);
            emit EthiopianBatchRegistered(batchId, ethiopianRegion[batchId], false);
        }
        
        emit BatchInfoUpdated(batchId, origin, "");
    }

    /* -------------------------------------------------------------------------- */
    /*                         ETHIOPIAN COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set Ethiopian compliance contract address (admin only)
     */
    function setEthiopianCompliance(address _ethiopianCompliance) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (_ethiopianCompliance == address(0)) {
            revert WAGABatchManager__InvalidEthiopianComplianceAddress_setEthiopianCompliance();
        }
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
    }

    /**
     * @dev Add ECTA permit for Ethiopian batch during creation
     */
    function addECTAPermitDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.ECTAPermit calldata permit
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!isEthiopianBatch[batchId]) {
            revert WAGABatchManager__NotEthiopianBatch_addECTAPermitDuringCreation();
        }
        if (address(ethiopianCompliance) == address(0)) {
            revert WAGABatchManager__EthiopianComplianceNotConfigured_addECTAPermitDuringCreation();
        }
        
        // Add the permit through the compliance contract
        ethiopianCompliance.addECTAPermit(batchId, permit);
        
        // Protect sensitive permit data in privacy layer
        _protectEthiopianComplianceData(batchId, "ECTA_PERMIT", permit.permitDocumentHash);
        
        emit EthiopianComplianceAdded(batchId, "ECTA_PERMIT", permit.permitDocumentHash);
    }

    /**
     * @dev Add quality certificate for Ethiopian batch during creation
     */
    function addQualityCertificateDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.QualityCertificate calldata certificate
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!isEthiopianBatch[batchId]) {
            revert WAGABatchManager__NotEthiopianBatch_addQualityCertificateDuringCreation();
        }
        if (address(ethiopianCompliance) == address(0)) {
            revert WAGABatchManager__EthiopianComplianceNotConfigured_addQualityCertificateDuringCreation();
        }
        
        // Add the certificate through the compliance contract
        ethiopianCompliance.addQualityCertificate(batchId, certificate);
        
        // Protect sensitive certificate data in privacy layer
        _protectEthiopianComplianceData(batchId, "QUALITY_CERT", certificate.certificateHash);
        
        emit EthiopianComplianceAdded(batchId, "QUALITY_CERT", certificate.certificateHash);
    }

    /**
     * @dev Add origin verification for Ethiopian batch during creation
     */
    function addOriginVerificationDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.OriginVerification calldata origin
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!isEthiopianBatch[batchId]) {
            revert WAGABatchManager__NotEthiopianBatch_addOriginVerificationDuringCreation();
        }
        if (address(ethiopianCompliance) == address(0)) {
            revert WAGABatchManager__EthiopianComplianceNotConfigured_addOriginVerificationDuringCreation();
        }
        
        // Add the origin verification through the compliance contract
        ethiopianCompliance.addOriginVerification(batchId, origin);
        
        // Protect sensitive origin data in privacy layer
        _protectEthiopianComplianceData(batchId, "ORIGIN_VERIFICATION", origin.verificationDocumentHash);
        
        // Mark batch as having Ethiopian compliance if all requirements are met
        bool hasCompliance = ethiopianCompliance.validateUpstreamCompliance(batchId);
        if (hasCompliance) {
            hasEthiopianCompliance[batchId] = true;
            emit EthiopianBatchRegistered(batchId, ethiopianRegion[batchId], true);
        }
        
        emit EthiopianComplianceAdded(batchId, "ORIGIN_VERIFICATION", origin.verificationDocumentHash);
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register EUDR compliance for a batch with ZK proof validation
     * @param batchId The batch identifier
     * @param certificate EUDR certificate details
     * @param zkProofData ZK proof for deforestation compliance
     */
    function registerEUDRComplianceWithZK(
        uint256 batchId,
        IEthiopianCompliance.EUDRCertificate calldata certificate,
        bytes calldata zkProofData
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_registerEUDRComplianceWithZK();
        }
        if (certificate.expiryDate <= block.timestamp) {
            revert WAGABatchManager__EUDRCertificateExpired_registerEUDRComplianceWithZK();
        }

        // Add EUDR certificate through Ethiopian compliance contract
        if (address(ethiopianCompliance) != address(0)) {
            ethiopianCompliance.addEUDRCertificate(batchId, certificate);
        }

        // Verify ZK proof for deforestation compliance (if ZK manager available)
        if (address(coffeeTokenContract.getZKManager()) != address(0)) {
            IWAGAZKManager zkManager = IWAGAZKManager(address(coffeeTokenContract.getZKManager()));
            bool deforestationVerified = zkManager.addComplianceZKProof(
                batchId,
                "EUDR_DEFORESTATION",
                zkProofData,
                "Deforestation compliance verified for EU export"
            );

            if (!deforestationVerified) {
                revert WAGABatchManager__ZKProofVerificationFailed_addEUDRComplianceWithZK();
            }
        }

        // Update batch EUDR compliance status
        hasEUDRCompliance[batchId] = true;
        eudrComplianceLevel[batchId] = certificate.complianceLevel;
        eudrComplianceTimestamp[batchId] = block.timestamp;

        // Set batch flag for EUDR compliance (using flag position 5)
        _setBatchFlag(batchId, 5, true);

        emit EUDRComplianceRegistered(
            batchId,
            certificate.complianceLevel,
            certificate.certificateId,
            certificate.expiryDate
        );
    }

    /**
     * @dev Add EUDR geolocation data for a batch with ZK proof validation
     * @param batchId The batch identifier
     * @param geolocation Geolocation data for the batch
     * @param zkProofData ZK proof for geolocation verification
     */
    function addEUDRGeolocationDataWithZK(
        uint256 batchId,
        IEthiopianCompliance.GeolocationData calldata geolocation,
        bytes calldata zkProofData
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_addEUDRGeolocationDataWithZK();
        }

        // Add geolocation data through Ethiopian compliance contract
        if (address(ethiopianCompliance) != address(0)) {
            ethiopianCompliance.addGeolocationData(batchId, geolocation);
        }

        // Verify ZK proof for geolocation (if ZK manager available)
        if (address(coffeeTokenContract.getZKManager()) != address(0)) {
            IWAGAZKManager zkManager = IWAGAZKManager(address(coffeeTokenContract.getZKManager()));
            bool geolocationVerified = zkManager.addComplianceZKProof(
                batchId,
                "EUDR_GEOLOCATION",
                zkProofData,
                "Geolocation verification for EU export compliance"
            );

            if (!geolocationVerified) {
                revert WAGABatchManager__ZKProofVerificationFailed_addEUDRComplianceWithZK();
            }
        }

        // Mark deforestation risk assessment as completed
        hasDeforestationRiskAssessment[batchId] = true;

        // Set batch flag for geolocation verification (using flag position 6)
        _setBatchFlag(batchId, 6, true);

        emit EUDRGeolocationDataAdded(
            batchId,
            geolocation.plotType,
            geolocation.plotSize,
            geolocation.verificationMethod
        );
    }

    /**
     * @dev Validate complete EUDR compliance for a batch using ZK proofs
     * @param batchId The batch identifier
     */
    function validateEUDRZKCompliance(uint256 batchId) external view returns (
        bool deforestationCompliant,
        bool geolocationVerified,
        bool fullyCompliant
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }

        deforestationCompliant = hasEUDRCompliance[batchId] && getBatchFlag(batchId, 5);
        geolocationVerified = hasDeforestationRiskAssessment[batchId] && getBatchFlag(batchId, 6);

        // Full compliance requires both deforestation and geolocation verification
        fullyCompliant = deforestationCompliant && geolocationVerified;
    }

    /* -------------------------------------------------------------------------- */
    /*                               Helper Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if caller has a specific role from coffee token
     */
    function _hasRoleFromCoffeeToken(bytes32 roleType) internal view returns (bool) {
        return coffeeTokenContract.hasRole(roleType, msg.sender);
    }

    /**
     * @dev Mark a batch as expired (only admin)
     */
    function markBatchExpired(
        uint256 batchId
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        _setBatchFlag(batchId, 3, true); // Use bit 3 for expired
    }

    /**
     * @dev Reset verification flags for a batch (only admin)
     */
    function resetBatchVerificationFlags(
        uint256 batchId
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        _setBatchFlag(batchId, 0, false); // isVerified
        _setBatchFlag(batchId, 1, false); // isMetadataVerified
    }

    /**
     * @dev Update batch active status (only admin)
     * @dev Note: This only sets local flags - core status is managed by WAGACoffeeTokenCore
     */
    /**
     * @dev Mark a batch as verified after successful proof of reserve verification
     * @param batchId The batch to mark as verified
     */
    function markBatchAsVerified(
        uint256 batchId
    ) external callerHasRoleFromCoffeeToken(PROOF_OF_RESERVE_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        _setBatchFlag(batchId, 0, true); // isVerified
        
        emit BatchVerificationStatusChanged(batchId, true);
    }

    /**
     * @dev Update batch active status (for inventory management)
     */
    function updateBatchStatus(
        uint256 batchId,
        bool isActive
    ) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        _setBatchFlag(batchId, 2, isActive); // isActive flag (local tracking only)
    }

    /**
     * @dev Verify batch metadata (only admin) - handles packaging and metadata verification
     * @dev Price verification is handled by WAGACoffeeTokenCore
     */
    function verifyBatchMetadata(
        uint256 batchId,
        string calldata verifiedPackaging,
        string calldata verifiedMetadataHash
    ) external callerHasRoleFromCoffeeToken(PROOF_OF_RESERVE_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        // Store the verified packaging info in additional metadata
        additionalPackagingInfo[batchId] = verifiedPackaging;
        
        // Mark metadata as verified using flag
        _setBatchFlag(batchId, 1, true); // isMetadataVerified
        
        emit BatchMetadataUpdated(batchId, verifiedMetadataHash);
    }

    /**
     * @dev Returns whether batch metadata is verified
     */
    function isBatchMetadataVerified(
        uint256 batchId
    ) external view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        return getBatchFlag(batchId, 1); // isMetadataVerified flag
    }

    /**
     * @dev Check if batch is verified (for redemption eligibility)
     */
    function isBatchVerified(
        uint256 batchId
    ) external view returns (bool) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        return getBatchFlag(batchId, 0); // isVerified flag
    }

    /**
     * @dev Updates inventory after verification - minimal implementation for MVP
     */
    function updateInventory(uint256 batchId, uint256 verifiedQuantity) external callerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        // For MVP, just mark inventory as updated/verified - actual inventory is managed by core token
        _setBatchFlag(batchId, 4, true); // Using flag position 4 for inventory verification
        
        emit BatchInventoryUpdated(batchId, verifiedQuantity);
    }

    /**
     * @dev Get additional metadata managed by BatchManager only
     * @dev For core batch data, use WAGACoffeeTokenCore.getBasicBatchInfo() directly
     */
    function getBatchAdditionalInfo(
        uint256 batchId
    ) external view returns (
        string memory origin,
        address creator,
        uint256 timestamp,
        bool isExpired,
        bool isMetadataVerified
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }

        origin = batchOrigin[batchId];
        creator = batchCreator[batchId];
        timestamp = batchCreationTimestamp[batchId];
        isExpired = getBatchFlag(batchId, 3);
        isMetadataVerified = getBatchFlag(batchId, 1);
    }

    /* -------------------------------------------------------------------------- */
    /*                            ZK Privacy Functions                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get privacy configuration for a batch (ZK processing)
     */
    function getBatchPrivacyConfig(
        uint256 batchId
    ) external view returns (IPrivacyLayer.PrivacyConfig memory) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        return privacyLayer.getPrivacyConfig(batchId);
    }

    /**
     * @dev Update ZK claims after proof verification (preserves existing ZK logic)
     */
    function updateZKClaims(
        uint256 batchId,
        string calldata pricingClaim,
        string calldata qualityClaim,
        string calldata supplyChainClaim
    ) external callerHasRoleFromCoffeeToken(VERIFIER_ROLE) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        privacyLayer.updatePublicClaims(batchId, pricingClaim, qualityClaim, supplyChainClaim);
    }

    /**
     * @dev Check if caller can view pricing data (ZK role verification)
     */
    function canViewPricingData(
        uint256 batchId,
        address caller
    ) external view returns (bool) {
        IPrivacyLayer.PrivacyConfig memory config = privacyLayer.getPrivacyConfig(batchId);
        return !config.pricingPrivate || _hasSpecificRoleForAddress(caller, DISTRIBUTOR_ROLE) || 
               _hasSpecificRoleForAddress(caller, DEFAULT_ADMIN_ROLE);
    }

    /**
     * @dev Check if caller can view supply chain details (ZK role verification)
     */
    function canViewSupplyChainData(
        uint256 batchId,
        address caller
    ) external view returns (bool) {
        IPrivacyLayer.PrivacyConfig memory config = privacyLayer.getPrivacyConfig(batchId);
        return !config.supplyChainPrivate || _hasSpecificRoleForAddress(caller, VERIFIER_ROLE) || 
               _hasSpecificRoleForAddress(caller, DEFAULT_ADMIN_ROLE);
    }

    /**
     * @dev Internal helper for role checking with specific address
     */
    function _hasSpecificRoleForAddress(
        address account,
        bytes32 roleType
    ) internal view returns (bool) {
        return coffeeTokenContract.hasRole(roleType, account);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set a specific flag for a batch
     */
    function _setBatchFlag(
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
    function getBatchFlag(
        uint256 batchId,
        uint8 flagBit
    ) internal view returns (bool) {
        uint8 currentFlags = batchFlags[batchId];
        return (currentFlags & (1 << flagBit)) != 0;
    }

    /* -------------------------------------------------------------------------- */
    /*                         ETHIOPIAN COMPLIANCE INTERNAL                      */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if origin indicates Ethiopian coffee
     */
    function _isEthiopianOrigin(string memory origin) internal pure returns (bool) {
        bytes memory originBytes = bytes(origin);
        
        // Check for Ethiopian regions (case-insensitive)
        return (
            _containsIgnoreCase(originBytes, "Sidamo") ||
            _containsIgnoreCase(originBytes, "Yirgacheffe") ||
            _containsIgnoreCase(originBytes, "Harrar") ||
            _containsIgnoreCase(originBytes, "Ethiopia") ||
            _containsIgnoreCase(originBytes, "Jimma") ||
            _containsIgnoreCase(originBytes, "Limu") ||
            _containsIgnoreCase(originBytes, "Kaffa")
        );
    }

    /**
     * @dev Extract Ethiopian region from origin string
     */
    function _extractEthiopianRegion(string memory origin) internal pure returns (string memory) {
        bytes memory originBytes = bytes(origin);
        
        if (_containsIgnoreCase(originBytes, "Sidamo")) return "Sidamo";
        if (_containsIgnoreCase(originBytes, "Yirgacheffe")) return "Yirgacheffe";
        if (_containsIgnoreCase(originBytes, "Harrar")) return "Harrar";
        if (_containsIgnoreCase(originBytes, "Jimma")) return "Jimma";
        if (_containsIgnoreCase(originBytes, "Limu")) return "Limu";
        if (_containsIgnoreCase(originBytes, "Kaffa")) return "Kaffa";
        
        return "Ethiopia"; // Default if specific region not identified
    }

    /**
     * @dev Protect Ethiopian compliance data using privacy layer
     */
    function _protectEthiopianComplianceData(
        uint256 batchId,
        string memory dataType,
        string memory documentHash
    ) internal {
        // Create privacy config for Ethiopian compliance data
        IPrivacyLayer.PrivacyConfig memory config = IPrivacyLayer.PrivacyConfig({
            pricingPrivate: false,
            qualityPrivate: true,
            supplyChainPrivate: false,
            level: IPrivacyLayer.PrivacyLevel.SELECTIVE,
            pricingClaim: "",
            qualityClaim: dataType,
            supplyChainClaim: "Ethiopian Export Compliance"
        });
        
        // Configure privacy with the batch creator as the original caller
        privacyLayer.configurePrivacyWithCaller(
            batchCreator[batchId],
            batchId,
            config
        );
        
        // Protect the document hash data
        privacyLayer.protectDataWithCaller(
            batchCreator[batchId],
            batchId,
            dataType,
            documentHash
        );
    }

    /**
     * @dev Case-insensitive string contains check
     */
    function _containsIgnoreCase(bytes memory data, string memory search) internal pure returns (bool) {
        bytes memory searchBytes = bytes(search);
        if (searchBytes.length > data.length) return false;
        
        for (uint256 i = 0; i <= data.length - searchBytes.length; i++) {
            bool found = true;
            for (uint256 j = 0; j < searchBytes.length; j++) {
                bytes1 dataChar = data[i + j];
                bytes1 searchChar = searchBytes[j];
                
                // Convert to lowercase for comparison
                if (dataChar >= 0x41 && dataChar <= 0x5A) {
                    dataChar = bytes1(uint8(dataChar) + 32);
                }
                if (searchChar >= 0x41 && searchChar <= 0x5A) {
                    searchChar = bytes1(uint8(searchChar) + 32);
                }
                
                if (dataChar != searchChar) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }

    /* -------------------------------------------------------------------------- */
    /*                       ETHIOPIAN COMPLIANCE VIEW FUNCTIONS                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get Ethiopian compliance status for a batch
     */
    function getEthiopianComplianceStatus(uint256 batchId) external view returns (
        bool isEthiopian,
        string memory region,
        bool hasCompliance,
        bool hasECTA,
        bool hasQuality,
        bool hasOrigin
    ) {
        isEthiopian = isEthiopianBatch[batchId];
        region = ethiopianRegion[batchId];
        hasCompliance = hasEthiopianCompliance[batchId];
        
        if (isEthiopian && address(ethiopianCompliance) != address(0)) {
            (hasECTA, hasQuality, hasOrigin, ) = ethiopianCompliance.getComplianceStatus(batchId);
        }
    }

    /**
     * @dev Check if batch is ready for export (has all compliance)
     */
    function isReadyForExport(uint256 batchId) external view returns (bool) {
        if (!isEthiopianBatch[batchId]) {
            return true; // Non-Ethiopian batches don't need Ethiopian compliance
        }
        
        return hasEthiopianCompliance[batchId] && 
               address(ethiopianCompliance) != address(0) &&
               ethiopianCompliance.validateUpstreamCompliance(batchId);
    }

    /**
     * @dev Get enhanced batch info including Ethiopian compliance
     */
    function getBatchInfoWithCompliance(uint256 batchId) external view returns (
        string memory origin,
        address creator,
        uint256 creationTimestamp,
        bool isEthiopian,
        string memory region,
        bool hasCompliance,
        bool readyForExport
    ) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        
        return (
            batchOrigin[batchId],
            batchCreator[batchId],
            batchCreationTimestamp[batchId],
            isEthiopianBatch[batchId],
            ethiopianRegion[batchId],
            hasEthiopianCompliance[batchId],
            this.isReadyForExport(batchId)
        );
    }
}
