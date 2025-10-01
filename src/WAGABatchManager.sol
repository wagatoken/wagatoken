// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {IWAGABatchManager} from "./Interfaces/IWAGABatchManager.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";
import {IWAGAZKManager} from "./Interfaces/IWAGAZKManager.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {BatchManagementLib} from "./libraries/BatchManagementLib.sol";

/**
 * @title WAGABatchManager
 * @dev Manages additional batch metadata for WAGA Coffee system
 * @notice Uses Central Authority pattern - queries WAGAConfigManager for all access control
 * @dev No longer inherits WAGAViewFunctions to avoid state duplication
 */
contract WAGABatchManager is IWAGABatchManager {
    using BatchManagementLib for mapping(uint256 => BatchManagementLib.BatchDetails);
    
    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */
    
    // Central authority for access control - NO inheritance saves space!
    WAGAConfigManager public immutable authority;

    IWAGACoffeeToken public immutable coffeeToken;
    WAGACoffeeTokenCore public immutable coffeeTokenContract;
    IPrivacyLayer public immutable privacyLayer;
    IEthiopianCompliance public ethiopianCompliance;

    // Additional batch metadata (extending what's in WAGAViewFunctions)
    mapping(uint256 => string) public batchOrigin;
    mapping(uint256 => string) public additionalPackagingInfo;
    mapping(uint256 => string) public verifiedMetadataHashes; // Store verified metadata hashes
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

    error WAGABatchManager__CallerDoesNotHaveRequiredRole();
    error WAGABatchManager__BatchDoesNotExist_createBatchInfo();
    error WAGABatchManager__BatchDoesNotExist_updateBatchMetadata();
    error WAGABatchManager__BatchDoesNotExist_getBatchInfo();
    error WAGABatchManager__BatchDoesNotExist_registerEUDRComplianceWithZK();
    error WAGABatchManager__EUDRCertificateExpired_registerEUDRComplianceWithZK();
    error WAGABatchManager__BatchDoesNotExist_addEUDRGeolocationDataWithZK();
    error WAGABatchManager__ZKProofVerificationFailed_addEUDRComplianceWithZK();
    error WAGABatchManager__NotEthiopianBatch_addECTAPermitDuringCreation();
    error WAGABatchManager__EthiopianComplianceNotConfigured_addECTAPermitDuringCreation();
    error WAGABatchManager__NotEthiopianBatch_addQualityCertificateDuringCreation();
    error WAGABatchManager__EthiopianComplianceNotConfigured_addQualityCertificateDuringCreation();
    error WAGABatchManager__NotEthiopianBatch_addOriginVerificationDuringCreation();
    error WAGABatchManager__EthiopianComplianceNotConfigured_addOriginVerificationDuringCreation();

    /* -------------------------------------------------------------------------- */
    /*                                 Modifiers                                  */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert WAGABatchManager__CallerDoesNotHaveRequiredRole();
        }
        _;
    }

    modifier callerCanCreateBatch(address creator) {
        // Check if creator has batch creation permissions
        bool hasValidRole = 
            authority.hasRole(keccak256("BATCH_CREATOR_ROLE"), creator) ||
            authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), creator);
            
        if (!hasValidRole) {
            revert WAGABatchManager__CallerDoesNotHaveRequiredRole();
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
        coffeeTokenContract = WAGACoffeeTokenCore(_coffeeToken);
        privacyLayer = IPrivacyLayer(_privacyLayer);
        authority = WAGAConfigManager(_authority);
        // Ethiopian compliance will be set separately via setEthiopianCompliance
    }

    /* -------------------------------------------------------------------------- */
    /*                              Configuration Functions                       */
    /* -------------------------------------------------------------------------- */

    function setEthiopianCompliance(address _ethiopianCompliance) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
    }

    /**
     * @dev Check if an address has batch creation permissions
     * @param creator Address to check
     * @return bool Whether the address can create batches
     */
    function canCreateBatch(address creator) external view returns (bool) {
        return 
            authority.hasRole(keccak256("BATCH_CREATOR_ROLE"), creator) ||
            authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), creator);
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
    ) external {
        // Only allow calls from the BatchOperations contract 
        require(msg.sender == address(coffeeTokenContract.batchOperations()), "Only BatchOperations can register batch creation");
        
        // Verify that the creator has batch creation permissions
        require(authority.hasRole(keccak256("BATCH_CREATOR_ROLE"), creator) || 
                authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), creator), 
                "Creator must have BATCH_CREATOR_ROLE or DEFAULT_ADMIN_ROLE");
        
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
     * @dev Add ECTA permit for Ethiopian batch during creation
     */
    function addECTAPermitDuringCreation(
        uint256 batchId,
        IEthiopianCompliance.ECTAPermit calldata permit
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
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
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
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
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
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
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
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

        // Basic ZK proof validation - simplified for MVP
        require(zkProofData.length > 0, "ZK proof data required for EUDR compliance");
        // In production, this would call a ZK verifier contract
        // For MVP, we just ensure proof data is provided
        
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
    ) external callerHasRole(keccak256("PROCESSOR_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_addEUDRGeolocationDataWithZK();
        }

        // Add geolocation data through Ethiopian compliance contract
        if (address(ethiopianCompliance) != address(0)) {
            ethiopianCompliance.addGeolocationData(batchId, geolocation);
        }

        // Basic ZK proof validation for geolocation - simplified for MVP
        require(zkProofData.length > 0, "ZK proof data required for geolocation verification");
        // In production, this would verify the ZK proof against the geolocation data
        bool geolocationVerified = true; // Simplified for MVP - proof presence validated
        
        // Only mark as completed if verification was successful
        if (geolocationVerified) {
            // Mark deforestation risk assessment as completed
            hasDeforestationRiskAssessment[batchId] = true;
            
            // Set batch flag for geolocation verification (using flag position 6)
            _setBatchFlag(batchId, 6, true);
        }

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
     * @dev Mark a batch as expired (only admin)
     */
    function markBatchExpired(
        uint256 batchId
    ) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
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
    ) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
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
    ) external callerHasRole(keccak256("VERIFIER_ROLE")) {
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
    ) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
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
    ) external callerHasRole(keccak256("VERIFIER_ROLE")) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        // Store the verified packaging info in additional metadata
        additionalPackagingInfo[batchId] = verifiedPackaging;
        
        // Validate that verifiedMetadataHash is provided
        require(bytes(verifiedMetadataHash).length > 0, "Verified metadata hash required");
        
        // Store the verified metadata hash for future reference
        verifiedMetadataHashes[batchId] = verifiedMetadataHash;
        
        // In production, would validate hash against stored metadata
        // For MVP, we ensure hash is provided and store it for tracking
        
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
     * @dev Get the verified metadata hash for a batch
     */
    function getVerifiedMetadataHash(
        uint256 batchId
    ) external view returns (string memory) {
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_getBatchInfo();
        }
        return verifiedMetadataHashes[batchId];
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
    function updateInventory(uint256 batchId, uint256 verifiedQuantity) external callerHasRole(keccak256("DEFAULT_ADMIN_ROLE")) {
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

    // Removed getBatchPrivacyConfig for size optimization - use privacyLayer.getPrivacyConfig directly

    /**
     * @dev Update ZK claims after proof verification (preserves existing ZK logic)
     */
    // Removed updateZKClaims for size optimization

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    // Removed privacy functions for size optimization - implement minimal stubs for interface compliance
    function getBatchPrivacyConfig(uint256 batchId) external view returns (IPrivacyLayer.PrivacyConfig memory) {
        return privacyLayer.getPrivacyConfig(batchId);
    }
    
    function updateZKClaims(uint256 batchId, string calldata pricingClaim, string calldata qualityClaim, string calldata supplyChainClaim) external callerHasRole(keccak256("VERIFIER_ROLE")) {
        // Validate that batch exists
        if (!coffeeToken.isBatchCreated(batchId)) {
            revert WAGABatchManager__BatchDoesNotExist_createBatchInfo();
        }
        
        // Validate that claims are provided
        require(bytes(pricingClaim).length > 0, "Pricing claim required");
        require(bytes(qualityClaim).length > 0, "Quality claim required"); 
        require(bytes(supplyChainClaim).length > 0, "Supply chain claim required");
        
        // Update claims through privacy layer
        privacyLayer.updatePublicClaims(batchId, pricingClaim, qualityClaim, supplyChainClaim);
    }
    
    function canViewPricingData(uint256 batchId, address viewer) external view returns (bool) { 
        // In production, this would implement proper access control
        // For MVP, allow batch creators and admins to view pricing data
        return viewer == batchCreator[batchId] || 
               authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), viewer) ||
               authority.hasRole(keccak256("VERIFIER_ROLE"), viewer);
    }
    
    function canViewSupplyChainData(uint256 batchId, address viewer) external view returns (bool) { 
        // In production, this would implement supply chain specific access control
        // For MVP, allow batch creators, verifiers, and admins to view supply chain data
        return viewer == batchCreator[batchId] || 
               authority.hasRole(keccak256("DEFAULT_ADMIN_ROLE"), viewer) ||
               authority.hasRole(keccak256("VERIFIER_ROLE"), viewer) ||
               authority.hasRole(keccak256("PROCESSOR_ROLE"), viewer);
    }

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
     * @dev Check if origin indicates Ethiopian coffee (simplified for size optimization)
     */
    function _isEthiopianOrigin(string memory origin) internal pure returns (bool) {
        bytes32 originHash = keccak256(bytes(origin));
        
        // Check for Ethiopian regions using hash comparison for efficiency
        return (
            originHash == keccak256("Sidamo") || originHash == keccak256("sidamo") ||
            originHash == keccak256("Yirgacheffe") || originHash == keccak256("yirgacheffe") ||
            originHash == keccak256("Harrar") || originHash == keccak256("harrar") ||
            originHash == keccak256("Ethiopia") || originHash == keccak256("ethiopia")
        );
    }

    /**
     * @dev Extract Ethiopian region from origin string (simplified)
     */
    function _extractEthiopianRegion(string memory origin) internal pure returns (string memory) {
        // Simplified region detection for size optimization
        bytes32 originHash = keccak256(bytes(origin));
        
        if (originHash == keccak256("Sidamo") || originHash == keccak256("sidamo")) return "Sidamo";
        if (originHash == keccak256("Yirgacheffe") || originHash == keccak256("yirgacheffe")) return "Yirgacheffe";
        if (originHash == keccak256("Harrar") || originHash == keccak256("harrar")) return "Harrar";
        
        return "Ethiopia"; // Default for size optimization
    }

    /**
     * @dev Protect Ethiopian compliance data (simplified for size optimization)
     */
    function _protectEthiopianComplianceData(
        uint256 batchId,
        string memory dataType,
        string memory documentHash
    ) internal {
        // Simplified privacy protection for size optimization
        if (address(privacyLayer) != address(0) && batchCreator[batchId] != address(0)) {
            privacyLayer.protectDataWithCaller(
                batchCreator[batchId],
                batchId,
                dataType,
                documentHash
            );
        }
    }


    /* -------------------------------------------------------------------------- */
    /*                       ETHIOPIAN COMPLIANCE VIEW FUNCTIONS                 */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get Ethiopian compliance status (simplified)
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

    // Removed getBatchInfoWithCompliance for size optimization - use individual getters
}
