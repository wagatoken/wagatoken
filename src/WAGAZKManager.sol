// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {IComplianceManager} from "./Interfaces/IComplianceManager.sol";
import {WAGACoffeeTokenCore} from "./WAGACoffeeTokenCore.sol";
import {IEthiopianCompliance} from "./Interfaces/IEthiopianCompliance.sol";

/**
 * @title WAGAZKManager
 * @dev Unified ZK proof verification system for all compliance types
 * @dev Supports Ethiopian, non-Ethiopian, and EUDR compliance requirements
 * @dev Gas-optimized with single storage mapping and unified functions
 */
contract WAGAZKManager is IComplianceManager {

    /* -------------------------------------------------------------------------- */
    /*                                 Constants                                  */
    /* -------------------------------------------------------------------------- */
    
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error WAGAZKManager__CallerDoesNotHaveRequiredRole();
    error WAGAZKManager__BatchDoesNotExist();
    error WAGAZKManager__ZKProofVerificationFailed();
    error WAGAZKManager__ZKProofNotFound();
    error WAGAZKManager__InvalidComplianceType();
    error WAGAZKManager__ComplianceNotConfigured();
    error WAGAZKManager__OnlyCoffeeTokenCanConfigurePrivacy();
    error WAGAZKManager__InvalidComplianceAddress();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    struct ZKProof {
        bytes32 proofHash;
        bytes proofData;
        uint256 proofTimestamp;
        address proofGenerator;
        bool isValid;
        IZKVerifier.ProofType proofType;
        string publicClaim;
    }

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    IWAGACoffeeToken public immutable COFFEE_TOKEN;
    WAGACoffeeTokenCore public immutable COFFEE_TOKEN_CONTRACT;
    IZKVerifier public immutable ZK_VERIFIER;
    IEthiopianCompliance public ethiopianCompliance;

    // Unified compliance proof storage - gas optimized
    mapping(uint256 => mapping(string => ZKProof)) public complianceProofs;
    mapping(uint256 => ZKProof) public batchZKProofs; // Legacy for backward compatibility
    mapping(bytes32 => bool) public zkProofExists;

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event ZKProofAdded(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        IZKVerifier.ProofType proofType,
        string publicClaim,
        address indexed generator
    );

    event ZKProofVerified(
        uint256 indexed batchId,
        bytes32 indexed proofHash,
        bool isValid
    );

    /* -------------------------------------------------------------------------- */
    /*                                Modifiers                                   */
    /* -------------------------------------------------------------------------- */

    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        _checkCallerHasRoleFromCoffeeToken(roleType, msg.sender);
        _;
    }

    function _checkCallerHasRoleFromCoffeeToken(bytes32 roleType, address caller) internal view {
        if (!COFFEE_TOKEN_CONTRACT.hasRole(roleType, caller)) {
            revert WAGAZKManager__CallerDoesNotHaveRequiredRole();
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        address _coffeeToken,
        address _zkVerifier
    ) {
        COFFEE_TOKEN = IWAGACoffeeToken(_coffeeToken);
        COFFEE_TOKEN_CONTRACT = WAGACoffeeTokenCore(_coffeeToken);
        ZK_VERIFIER = IZKVerifier(_zkVerifier);
    }

    /* -------------------------------------------------------------------------- */
    /*                          UNIFIED COMPLIANCE FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add compliance ZK proof for any origin and compliance type
     * @param batchId Batch identifier
     * @param proof ZK proof data
     * @param proofHash Hash of the proof
     */
    function verifyAndStoreZKProof(
        uint256 batchId,
        bytes calldata proof,
        IZKVerifier.ProofType proofType,
        bytes32 proofHash,
        uint256[] memory publicSignals,
        string calldata publicClaim
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) {
        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist();
        }

        // Verify ZK proof using the appropriate verifier method
        bool verified = _verifyZKProofByType(batchId, proofType, proof, publicSignals, publicClaim);

        if (!verified) {
            revert WAGAZKManager__ZKProofVerificationFailed();
        }

        // Store the ZK proof data for future reference
        bytes32 computedHash = keccak256(abi.encodePacked(proof, proofHash, block.timestamp));
        complianceProofs[batchId]["ZK_VERIFICATION"] = ZKProof({
            proofHash: computedHash,
            proofData: proof,
            proofTimestamp: block.timestamp,
            proofGenerator: msg.sender,
            isValid: true,
            proofType: proofType,
            publicClaim: publicClaim
        });

        zkProofExists[proofHash] = true;

        emit ZKProofAdded(batchId, computedHash, proofType, publicClaim, msg.sender);
    }

    /**
     * @dev Validate compliance for specific framework
     * @param batchId Batch identifier
     * @param complianceFramework Framework to validate ("ETHIOPIAN", "EUDR", "GLOBAL")
     * @return isCompliant Whether compliance requirements are met
     */
    function validateCompliance(
        uint256 batchId,
        string calldata complianceFramework
    ) external view returns (bool isCompliant) {
        bytes32 frameworkHash = keccak256(abi.encodePacked(complianceFramework));

        if (frameworkHash == keccak256(abi.encodePacked("ETHIOPIAN"))) {
            return _validateEthiopianCompliance(batchId);
        } else if (frameworkHash == keccak256(abi.encodePacked("EUDR"))) {
            return _validateEUDRCompliance(batchId);
        } else if (frameworkHash == keccak256(abi.encodePacked("GLOBAL"))) {
            return _validateGlobalCompliance(batchId);
        }

        return false;
    }

    /**
     * @dev Check if specific compliance type is satisfied
     */
    function hasComplianceProof(
        uint256 batchId,
        string calldata complianceType
    ) external view returns (bool hasCompliance) {
        return complianceProofs[batchId][complianceType].isValid;
    }

    /**
     * @dev Get compliance proof details
     */
    function getComplianceProof(
        uint256 batchId,
        string calldata complianceType
    ) external view returns (
        bytes32 proofHash,
        bool isVerified,
        uint256 timestamp,
        string memory publicClaim
    ) {
        ZKProof memory proof = complianceProofs[batchId][complianceType];
        return (proof.proofHash, proof.isValid, proof.proofTimestamp, proof.publicClaim);
    }

    /**
     * @dev Get required compliance types for origin
     */
    function getRequiredComplianceTypes(
        string calldata origin,
        bool isEUDestination
    ) external pure returns (string[] memory requiredTypes) {
        bool isEthiopian = _isEthiopianOrigin(origin);
        
        if (isEthiopian && isEUDestination) {
            requiredTypes = new string[](5);
            requiredTypes[0] = "ECTA_PERMIT";
            requiredTypes[1] = "QUALITY_CERT";
            requiredTypes[2] = "ORIGIN_VERIFICATION";
            requiredTypes[3] = "EUDR_DEFORESTATION";
            requiredTypes[4] = "EUDR_GEOLOCATION";
        } else if (isEthiopian && !isEUDestination) {
            requiredTypes = new string[](3);
            requiredTypes[0] = "ECTA_PERMIT";
            requiredTypes[1] = "QUALITY_CERT";
            requiredTypes[2] = "ORIGIN_VERIFICATION";
        } else if (!isEthiopian && isEUDestination) {
            requiredTypes = new string[](2);
            requiredTypes[0] = "EUDR_DEFORESTATION";
            requiredTypes[1] = "EUDR_GEOLOCATION";
        } else {
            requiredTypes = new string[](1);
            requiredTypes[0] = "ORIGIN_VERIFICATION";
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTERNAL HELPERS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Map compliance type string to ZK verifier proof type
     */
    function _getProofTypeFromCompliance(string memory complianceType) internal pure returns (IZKVerifier.ProofType) {
        bytes32 typeHash = keccak256(abi.encodePacked(complianceType));

        if (typeHash == keccak256(abi.encodePacked("ECTA_PERMIT"))) {
            return IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY;
        } else if (typeHash == keccak256(abi.encodePacked("QUALITY_CERT"))) {
            return IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY;
        } else if (typeHash == keccak256(abi.encodePacked("ORIGIN_VERIFICATION"))) {
            return IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF;
        } else if (typeHash == keccak256(abi.encodePacked("EUDR_DEFORESTATION"))) {
            return IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE;
        } else if (typeHash == keccak256(abi.encodePacked("EUDR_GEOLOCATION"))) {
            return IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION;
        } else if (typeHash == keccak256(abi.encodePacked("BOE_FOREX"))) {
            return IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE;
        } else if (typeHash == keccak256(abi.encodePacked("PRICE_COMPETITIVENESS"))) {
            return IZKVerifier.ProofType.PRICE_COMPETITIVENESS;
        } else if (typeHash == keccak256(abi.encodePacked("QUALITY_STANDARDS"))) {
            return IZKVerifier.ProofType.QUALITY_STANDARDS;
        } else if (typeHash == keccak256(abi.encodePacked("SUPPLY_CHAIN_PROVENANCE"))) {
            return IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE;
        }

        revert WAGAZKManager__InvalidComplianceType();
    }

    /**
     * @dev Map proof type to compliance string (for legacy compatibility)
     */
    function _getComplianceFromProofType(IZKVerifier.ProofType proofType) internal pure returns (string memory) {
        if (proofType == IZKVerifier.ProofType.PRICE_COMPETITIVENESS) {
            return "PRICE_COMPETITIVENESS";
        } else if (proofType == IZKVerifier.ProofType.QUALITY_STANDARDS) {
            return "QUALITY_STANDARDS";
        } else if (proofType == IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE) {
            return "SUPPLY_CHAIN_PROVENANCE";
        } else if (proofType == IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY) {
            return "ECTA_PERMIT";
        } else if (proofType == IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY) {
            return "QUALITY_CERT";
        } else if (proofType == IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF) {
            return "ORIGIN_VERIFICATION";
        } else if (proofType == IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE) {
            return "EUDR_DEFORESTATION";
        } else if (proofType == IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION) {
            return "EUDR_GEOLOCATION";
        } else if (proofType == IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE) {
            return "BOE_FOREX";
        }

        revert WAGAZKManager__InvalidComplianceType();
    }

    /**
     * @dev Validate Ethiopian compliance requirements
     */
    function _validateEthiopianCompliance(uint256 batchId) internal view returns (bool) {
        return complianceProofs[batchId]["ECTA_PERMIT"].isValid &&
               complianceProofs[batchId]["QUALITY_CERT"].isValid &&
               complianceProofs[batchId]["ORIGIN_VERIFICATION"].isValid;
    }

    /**
     * @dev Validate EUDR compliance requirements
     */
    function _validateEUDRCompliance(uint256 batchId) internal view returns (bool) {
        return complianceProofs[batchId]["EUDR_DEFORESTATION"].isValid &&
               complianceProofs[batchId]["EUDR_GEOLOCATION"].isValid;
    }

    /**
     * @dev Validate global compliance (Ethiopian + EUDR if applicable)
     */
    function _validateGlobalCompliance(uint256 batchId) internal view returns (bool) {
        // For global validation, require EUDR compliance at minimum
        return _validateEUDRCompliance(batchId);
    }

    /**
     * @dev Check if origin indicates Ethiopian coffee
     */
    function _isEthiopianOrigin(string calldata origin) internal pure returns (bool) {
        bytes memory originBytes = bytes(origin);
        return (_containsIgnoreCase(originBytes, "Sidamo") ||
                _containsIgnoreCase(originBytes, "Yirgacheffe") ||
                _containsIgnoreCase(originBytes, "Harrar") ||
                _containsIgnoreCase(originBytes, "Ethiopia") ||
                _containsIgnoreCase(originBytes, "Jimma") ||
                _containsIgnoreCase(originBytes, "Limu") ||
                _containsIgnoreCase(originBytes, "Kaffa"));
    }

    /**
     * @dev Case-insensitive substring search
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
                if (dataChar >= 0x41 && dataChar <= 0x5A) dataChar = bytes1(uint8(dataChar) + 32);
                if (searchChar >= 0x41 && searchChar <= 0x5A) searchChar = bytes1(uint8(searchChar) + 32);
                
                if (dataChar != searchChar) {
                    found = false;
                    break;
                }
            }
            if (found) return true;
        }
        return false;
    }

    /**
     * @dev Verify ZK proof by type using the appropriate verifier method
     */
    function _verifyZKProofByType(
        uint256 batchId,
        IZKVerifier.ProofType proofType,
        bytes calldata zkProofData,
        uint256[] memory publicSignals,
        string calldata publicClaim
    ) internal returns (bool) {
        if (proofType == IZKVerifier.ProofType.PRICE_COMPETITIVENESS) {
            return ZK_VERIFIER.verifyPriceCompetitiveness(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.QUALITY_STANDARDS) {
            return ZK_VERIFIER.verifyQualityStandards(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.SUPPLY_CHAIN_PROVENANCE) {
            return ZK_VERIFIER.verifySupplyChainProvenance(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.EUDR_DEFORESTATION_COMPLIANCE) {
            return ZK_VERIFIER.verifyEUDRDeforestationCompliance(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.EUDR_GEOLOCATION_VERIFICATION) {
            return ZK_VERIFIER.verifyEUDRGeolocation(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.ECTA_PERMIT_VALIDITY) {
            return ZK_VERIFIER.verifyECTAPermitValidity(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.QUALITY_CERTIFICATE_AUTHENTICITY) {
            return ZK_VERIFIER.verifyQualityCertificateAuthenticity(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.ORIGIN_VERIFICATION_PROOF) {
            return ZK_VERIFIER.verifyOrigin(batchId, zkProofData, publicSignals, publicClaim);
        } else if (proofType == IZKVerifier.ProofType.BOE_FOREX_COMPLIANCE) {
            return ZK_VERIFIER.verifyBoEForexCompliance(batchId, zkProofData, publicSignals, publicClaim);
        }
        
        revert WAGAZKManager__InvalidComplianceType();
    }

    /**
     * @dev Set Ethiopian compliance contract (admin only)
     */
    function setEthiopianCompliance(address _ethiopianCompliance) external {
        _checkCallerHasRoleFromCoffeeToken(DEFAULT_ADMIN_ROLE, msg.sender);
        if (_ethiopianCompliance == address(0)) {
            revert WAGAZKManager__InvalidComplianceAddress();
        }
        ethiopianCompliance = IEthiopianCompliance(_ethiopianCompliance);
    }

    /**
     * @dev Configure default privacy settings for a batch
     * Called by WAGACoffeeTokenCore during batch creation
     */
    function configureDefaultPrivacy(uint256 batchId) external {
        // This function is called internally by coffee token during batch creation
        // No role check needed as it's an internal configuration function
        // Default privacy configuration - can be extended
        // For now, this is a placeholder for future privacy settings
    }

    /* -------------------------------------------------------------------------- */
    /*                              LEGACY FUNCTIONS                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Legacy function for backward compatibility
     */
    function addZKProof(
        uint256 batchId,
        bytes calldata zkProofData,
        IZKVerifier.ProofType proofType,
        string calldata publicClaim
    ) external callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) returns (bool verified) {
        // Convert to unified compliance system
        string memory complianceType = _getComplianceFromProofType(proofType);
        return this.addComplianceZKProof(batchId, complianceType, zkProofData, publicClaim);
    }

    /**
     * @dev Add compliance ZK proof for specific compliance type
     */
    function addComplianceZKProof(
        uint256 batchId,
        string memory complianceType,
        bytes calldata zkProofData,
        string calldata publicClaim
    ) public callerHasRoleFromCoffeeToken(PROCESSOR_ROLE) returns (bool verified) {
        if (!COFFEE_TOKEN.isBatchCreated(batchId)) {
            revert WAGAZKManager__BatchDoesNotExist();
        }

        // Get the proof type from compliance type and verify through ZK verifier
        IZKVerifier.ProofType proofType = _getProofTypeFromCompliance(complianceType);
        uint256[] memory emptySignals = new uint256[](0);
        verified = _verifyZKProofByType(batchId, proofType, zkProofData, emptySignals, publicClaim);

        if (!verified) {
            revert WAGAZKManager__ZKProofVerificationFailed();
        }

        // Store compliance proof
        bytes32 proofHash = keccak256(abi.encodePacked(zkProofData, complianceType, block.timestamp));
        complianceProofs[batchId][complianceType] = ZKProof({
            proofHash: proofHash,
            proofData: zkProofData,
            proofTimestamp: block.timestamp,
            proofGenerator: msg.sender,
            isValid: true,
            proofType: proofType,
            publicClaim: publicClaim
        });

        zkProofExists[proofHash] = true;

        emit ComplianceProofAdded(batchId, complianceType, proofHash, publicClaim, msg.sender);
        
        return verified;
    }

    /**
     * @dev Legacy EUDR validation function (for backward compatibility)
     */
    function validateEUDRZKCompliance(uint256 batchId)
        external
        view
        returns (
            bool deforestationCompliant,
            bool geolocationVerified,
            bool fullyCompliant
        )
    {
        deforestationCompliant = this.hasComplianceProof(batchId, "EUDR_DEFORESTATION");
        geolocationVerified = this.hasComplianceProof(batchId, "EUDR_GEOLOCATION");
        fullyCompliant = deforestationCompliant && geolocationVerified;
    }
}