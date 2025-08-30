// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {IComplianceVerifier} from "./Interfaces/IComplianceVerifier.sol";
import {IZKVerifier} from "./Interfaces/IZKVerifier.sol";
import {IPrivacyLayer} from "./Interfaces/IPrivacyLayer.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {WAGACoffeeToken} from "../WAGACoffeeToken.sol";

/**
 * @title ComplianceVerifier
 * @dev Regulatory compliance and quality standards verification
 * @dev Supports multiple compliance types: regulatory, quality, supply chain, certification
 * @dev Integrates with ZK proofs for privacy-preserving compliance verification
 */
contract ComplianceVerifier is IComplianceVerifier, AccessControl, ReentrancyGuard {
    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                   */
    /* -------------------------------------------------------------------------- */
    error ComplianceVerifier__InvalidComplianceType_verifyCompliance();
    error ComplianceVerifier__ComplianceVerificationFailed_verifyCompliance();
    error ComplianceVerifier__InvalidComplianceData_verifyCompliance();
    error ComplianceVerifier__ComplianceAlreadyVerified_verifyCompliance();
    error ComplianceVerifier__AccessControlUnauthorizedAccount_verifyCompliance();
    error ComplianceVerifier__InvalidComplianceStandard_verifyCompliance();
    error ComplianceVerifier__ComplianceExpired_verifyCompliance();
    error ComplianceVerifier__InvalidCertification_verifyCompliance();
    error ComplianceVerifier__QualityScoreOutOfRange_verifyCompliance();
    error ComplianceVerifier__SupplyChainVerificationFailed_verifyCompliance();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    // Compliance verification result
    struct ComplianceResult {
        bool isValid;
        uint256 verificationTimestamp;
        address verifier;
        string complianceType;
        bytes32 complianceHash;
        uint256 qualityScore;
        string certification;
        mapping(string => string) complianceDetails;
    }

    // Compliance standard configuration
    struct ComplianceStandard {
        string standardName;
        uint256 maxComplianceAge;
        bool isActive;
        uint256 minQualityScore;
        uint256 maxQualityScore;
        string[] requiredCertifications;
    }

    // Quality assessment criteria
    struct QualityCriteria {
        uint256 aromaScore;
        uint256 flavorScore;
        uint256 bodyScore;
        uint256 acidityScore;
        uint256 aftertasteScore;
        uint256 overallScore;
        string qualityNotes;
    }

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                               */
    /* -------------------------------------------------------------------------- */

    // Mapping from compliance hash to verification result
    mapping(bytes32 => ComplianceResult) private s_complianceResults;
    
    // Mapping from compliance type to standard configuration
    mapping(string => ComplianceStandard) private s_complianceStandards;
    
    // Mapping from compliance hash to compliance data
    mapping(bytes32 => bytes) private s_complianceData;
    
    // Mapping from compliance hash to quality criteria
    mapping(bytes32 => QualityCriteria) private s_qualityCriteria;
    
    // Set of verified compliance hashes
    mapping(bytes32 => bool) private s_verifiedCompliance;
    
    // Compliance statistics
    uint256 private s_totalComplianceVerified;
    uint256 private s_successfulCompliance;
    uint256 private s_failedCompliance;
    
    // Reference to WAGACoffeeToken for role checking
    WAGACoffeeToken public immutable coffeeToken;

    // Quality score ranges
    uint256 private constant MIN_QUALITY_SCORE = 0;
    uint256 private constant MAX_QUALITY_SCORE = 100;
    uint256 private constant EXCELLENT_THRESHOLD = 85;
    uint256 private constant GOOD_THRESHOLD = 70;
    uint256 private constant ACCEPTABLE_THRESHOLD = 60;

    /* -------------------------------------------------------------------------- */
    /*                                 Events                                     */
    /* -------------------------------------------------------------------------- */
    event ComplianceVerified(
        bytes32 indexed complianceHash,
        string complianceType,
        bool isValid,
        address verifier,
        uint256 qualityScore,
        uint256 timestamp
    );
    
    event ComplianceStandardUpdated(
        string indexed complianceType,
        string standardName,
        uint256 maxComplianceAge,
        bool isActive
    );
    
    event QualityAssessmentUpdated(
        bytes32 indexed complianceHash,
        uint256 overallScore,
        string qualityNotes
    );
    
    event CertificationVerified(
        bytes32 indexed complianceHash,
        string certification,
        bool isValid,
        uint256 timestamp
    );

    /* -------------------------------------------------------------------------- */
    /*                                 Constructor                                */
    /* -------------------------------------------------------------------------- */

    constructor(address coffeeTokenAddress) {
        require(coffeeTokenAddress != address(0), "Invalid coffee token address");
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Initialize default compliance standards
        _initializeDefaultStandards();
    }

    /* -------------------------------------------------------------------------- */
    /*                              Access Control                                */
    /* -------------------------------------------------------------------------- */
    
    modifier callerHasRoleFromCoffeeToken(bytes32 roleType) {
        if (!coffeeToken.hasRole(roleType, msg.sender)) {
            revert ComplianceVerifier__AccessControlUnauthorizedAccount_verifyCompliance();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Compliance Verification                       */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verify compliance for a batch
     * @param complianceType Type of compliance (regulatory, quality, supply_chain, certification)
     * @param complianceData Raw compliance data
     * @param qualityScore Quality score (0-100)
     * @param certification Certification details
     * @param zkProofHash Hash of ZK proof for privacy-preserving verification
     * @return isValid Whether compliance is valid
     * @return verificationDetails Additional verification details
     */
    function verifyCompliance(
        string calldata complianceType,
        bytes calldata complianceData,
        uint256 qualityScore,
        string calldata certification,
        bytes32 zkProofHash
    ) external override callerHasRoleFromCoffeeToken(coffeeToken.COMPLIANCE_VERIFIER_ROLE()) nonReentrant returns (
        bool isValid,
        string memory verificationDetails
    ) {
        // Validate compliance type
        if (!_isValidComplianceType(complianceType)) {
            revert ComplianceVerifier__InvalidComplianceType_verifyCompliance();
        }

        // Validate compliance standard
        ComplianceStandard storage standard = s_complianceStandards[complianceType];
        if (!standard.isActive) {
            revert ComplianceVerifier__InvalidComplianceStandard_verifyCompliance();
        }

        // Validate quality score range
        if (qualityScore < MIN_QUALITY_SCORE || qualityScore > MAX_QUALITY_SCORE) {
            revert ComplianceVerifier__QualityScoreOutOfRange_verifyCompliance();
        }

        // Generate compliance hash
        bytes32 complianceHash = keccak256(abi.encodePacked(
            complianceType,
            complianceData,
            qualityScore,
            certification,
            zkProofHash,
            block.timestamp
        ));

        // Check if compliance already verified
        if (s_verifiedCompliance[complianceHash]) {
            revert ComplianceVerifier__ComplianceAlreadyVerified_verifyCompliance();
        }

        // Store compliance data
        s_complianceData[complianceHash] = complianceData;

        // Perform compliance verification based on type
        bool verificationSuccess = _performComplianceVerification(
            complianceType,
            complianceData,
            qualityScore,
            certification,
            zkProofHash,
            standard
        );

        // Store compliance result
        ComplianceResult storage result = s_complianceResults[complianceHash];
        result.isValid = verificationSuccess;
        result.verificationTimestamp = block.timestamp;
        result.verifier = msg.sender;
        result.complianceType = complianceType;
        result.complianceHash = complianceHash;
        result.qualityScore = qualityScore;
        result.certification = certification;

        // Store quality criteria if provided
        if (complianceData.length > 0) {
            QualityCriteria storage criteria = s_qualityCriteria[complianceHash];
            criteria.overallScore = qualityScore;
            criteria.qualityNotes = certification;
        }

        // Mark compliance as verified
        s_verifiedCompliance[complianceHash] = true;

        // Update statistics
        s_totalComplianceVerified++;
        if (verificationSuccess) {
            s_successfulCompliance++;
            verificationDetails = "Compliance verified successfully";
        } else {
            s_failedCompliance++;
            verificationDetails = "Compliance verification failed";
        }

        emit ComplianceVerified(
            complianceHash,
            complianceType,
            verificationSuccess,
            msg.sender,
            qualityScore,
            block.timestamp
        );

        if (verificationSuccess) {
            emit QualityAssessmentUpdated(complianceHash, qualityScore, certification);
            emit CertificationVerified(complianceHash, certification, true, block.timestamp);
        }

        return (verificationSuccess, verificationDetails);
    }

    /**
     * @dev Get compliance result for a compliance hash
     * @param complianceHash Hash of the compliance verification
     * @return isValid Whether compliance is valid
     * @return verificationTimestamp When compliance was verified
     * @return verifier Who verified compliance
     * @return complianceType Type of compliance
     * @return qualityScore Quality score
     * @return certification Certification details
     */
    function getComplianceResult(
        bytes32 complianceHash
    ) external view override returns (
        bool isValid,
        uint256 verificationTimestamp,
        address verifier,
        string memory complianceType,
        uint256 qualityScore,
        string memory certification
    ) {
        ComplianceResult storage result = s_complianceResults[complianceHash];
        return (
            result.isValid,
            result.verificationTimestamp,
            result.verifier,
            result.complianceType,
            result.qualityScore,
            result.certification
        );
    }

    /**
     * @dev Check if a compliance hash has been verified
     * @param complianceHash Hash of the compliance verification
     * @return isVerified Whether compliance has been verified
     */
    function isComplianceVerified(
        bytes32 complianceHash
    ) external view override returns (bool isVerified) {
        return s_verifiedCompliance[complianceHash];
    }

    /**
     * @dev Get quality criteria for a compliance hash
     * @param complianceHash Hash of the compliance verification
     * @return overallScore Overall quality score
     * @return qualityNotes Quality assessment notes
     */
    function getQualityCriteria(
        bytes32 complianceHash
    ) external view returns (
        uint256 overallScore,
        string memory qualityNotes
    ) {
        QualityCriteria storage criteria = s_qualityCriteria[complianceHash];
        return (criteria.overallScore, criteria.qualityNotes);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Standard Management                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update compliance standard for a compliance type
     * @param complianceType Type of compliance
     * @param standardName Name of the standard
     * @param maxComplianceAge Maximum age of compliance in seconds
     * @param isActive Whether the standard is active
     * @param minQualityScore Minimum quality score required
     * @param maxQualityScore Maximum quality score allowed
     * @param requiredCertifications Array of required certifications
     */
    function updateComplianceStandard(
        string calldata complianceType,
        string calldata standardName,
        uint256 maxComplianceAge,
        bool isActive,
        uint256 minQualityScore,
        uint256 maxQualityScore,
        string[] calldata requiredCertifications
    ) external callerHasRoleFromCoffeeToken(coffeeToken.DEFAULT_ADMIN_ROLE()) {
        require(_isValidComplianceType(complianceType), "Invalid compliance type");
        require(maxComplianceAge > 0, "Max compliance age must be positive");
        require(minQualityScore <= maxQualityScore, "Invalid quality score range");

        s_complianceStandards[complianceType] = ComplianceStandard({
            standardName: standardName,
            maxComplianceAge: maxComplianceAge,
            isActive: isActive,
            minQualityScore: minQualityScore,
            maxQualityScore: maxQualityScore,
            requiredCertifications: requiredCertifications
        });

        emit ComplianceStandardUpdated(
            complianceType,
            standardName,
            maxComplianceAge,
            isActive
        );
    }

    /**
     * @dev Get compliance standard for a compliance type
     * @param complianceType Type of compliance
     * @return standardName Name of the standard
     * @return maxComplianceAge Maximum compliance age
     * @return isActive Whether standard is active
     * @return minQualityScore Minimum quality score
     * @return maxQualityScore Maximum quality score
     * @return requiredCertifications Required certifications
     */
    function getComplianceStandard(
        string calldata complianceType
    ) external view returns (
        string memory standardName,
        uint256 maxComplianceAge,
        bool isActive,
        uint256 minQualityScore,
        uint256 maxQualityScore,
        string[] memory requiredCertifications
    ) {
        ComplianceStandard storage standard = s_complianceStandards[complianceType];
        return (
            standard.standardName,
            standard.maxComplianceAge,
            standard.isActive,
            standard.minQualityScore,
            standard.maxQualityScore,
            standard.requiredCertifications
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              Quality Assessment                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update quality assessment for a compliance hash
     * @param complianceHash Hash of the compliance verification
     * @param aromaScore Aroma score (0-100)
     * @param flavorScore Flavor score (0-100)
     * @param bodyScore Body score (0-100)
     * @param acidityScore Acidity score (0-100)
     * @param aftertasteScore Aftertaste score (0-100)
     * @param qualityNotes Quality assessment notes
     */
    function updateQualityAssessment(
        bytes32 complianceHash,
        uint256 aromaScore,
        uint256 flavorScore,
        uint256 bodyScore,
        uint256 acidityScore,
        uint256 aftertasteScore,
        string calldata qualityNotes
    ) external callerHasRoleFromCoffeeToken(coffeeToken.QUALITY_ASSESSOR_ROLE()) {
        require(s_verifiedCompliance[complianceHash], "Compliance not verified");

        // Validate individual scores
        require(aromaScore <= MAX_QUALITY_SCORE, "Invalid aroma score");
        require(flavorScore <= MAX_QUALITY_SCORE, "Invalid flavor score");
        require(bodyScore <= MAX_QUALITY_SCORE, "Invalid body score");
        require(acidityScore <= MAX_QUALITY_SCORE, "Invalid acidity score");
        require(aftertasteScore <= MAX_QUALITY_SCORE, "Invalid aftertaste score");

        // Calculate overall score (weighted average)
        uint256 overallScore = _calculateOverallScore(
            aromaScore,
            flavorScore,
            bodyScore,
            acidityScore,
            aftertasteScore
        );

        QualityCriteria storage criteria = s_qualityCriteria[complianceHash];
        criteria.aromaScore = aromaScore;
        criteria.flavorScore = flavorScore;
        criteria.bodyScore = bodyScore;
        criteria.acidityScore = acidityScore;
        criteria.aftertasteScore = aftertasteScore;
        criteria.overallScore = overallScore;
        criteria.qualityNotes = qualityNotes;

        emit QualityAssessmentUpdated(complianceHash, overallScore, qualityNotes);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Statistics                                    */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get compliance verification statistics
     * @return totalCompliance Total compliance verified
     * @return successfulCompliance Successful compliance verifications
     * @return failedCompliance Failed compliance verifications
     */
    function getComplianceStats() external view returns (
        uint256 totalCompliance,
        uint256 successfulCompliance,
        uint256 failedCompliance
    ) {
        return (
            s_totalComplianceVerified,
            s_successfulCompliance,
            s_failedCompliance
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              Internal Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Initialize default compliance standards
     */
    function _initializeDefaultStandards() internal {
        // Regulatory compliance standard
        string[] memory regulatoryCerts = new string[](2);
        regulatoryCerts[0] = "FDA_APPROVED";
        regulatoryCerts[1] = "EU_COMPLIANT";
        
        s_complianceStandards["regulatory"] = ComplianceStandard({
            standardName: "International Coffee Standards",
            maxComplianceAge: 365 days,
            isActive: true,
            minQualityScore: 60,
            maxQualityScore: 100,
            requiredCertifications: regulatoryCerts
        });

        // Quality compliance standard
        string[] memory qualityCerts = new string[](1);
        qualityCerts[0] = "SCA_CERTIFIED";
        
        s_complianceStandards["quality"] = ComplianceStandard({
            standardName: "Specialty Coffee Association Standards",
            maxComplianceAge: 180 days,
            isActive: true,
            minQualityScore: 80,
            maxQualityScore: 100,
            requiredCertifications: qualityCerts
        });

        // Supply chain compliance standard
        string[] memory supplyChainCerts = new string[](3);
        supplyChainCerts[0] = "FAIR_TRADE_CERTIFIED";
        supplyChainCerts[1] = "ORGANIC_CERTIFIED";
        supplyChainCerts[2] = "SUSTAINABLE_CERTIFIED";
        
        s_complianceStandards["supply_chain"] = ComplianceStandard({
            standardName: "Sustainable Supply Chain Standards",
            maxComplianceAge: 730 days,
            isActive: true,
            minQualityScore: 70,
            maxQualityScore: 100,
            requiredCertifications: supplyChainCerts
        });

        // Certification compliance standard
        string[] memory certificationCerts = new string[](2);
        certificationCerts[0] = "ISO_22000";
        certificationCerts[1] = "HACCP_CERTIFIED";
        
        s_complianceStandards["certification"] = ComplianceStandard({
            standardName: "Food Safety Certification Standards",
            maxComplianceAge: 365 days,
            isActive: true,
            minQualityScore: 75,
            maxQualityScore: 100,
            requiredCertifications: certificationCerts
        });
    }

    /**
     * @dev Validate compliance type
     * @param complianceType Type of compliance to validate
     * @return isValid Whether the compliance type is valid
     */
    function _isValidComplianceType(
        string memory complianceType
    ) internal pure returns (bool isValid) {
        bytes memory typeBytes = bytes(complianceType);
        if (typeBytes.length == 0) return false;

        // Check against valid compliance types
        return (
            keccak256(typeBytes) == keccak256("regulatory") ||
            keccak256(typeBytes) == keccak256("quality") ||
            keccak256(typeBytes) == keccak256("supply_chain") ||
            keccak256(typeBytes) == keccak256("certification")
        );
    }

    /**
     * @dev Perform compliance verification
     * @param complianceType Type of compliance
     * @param complianceData Raw compliance data
     * @param qualityScore Quality score
     * @param certification Certification details
     * @param zkProofHash ZK proof hash
     * @param standard Compliance standard
     * @return isValid Whether verification succeeded
     */
    function _performComplianceVerification(
        string memory complianceType,
        bytes memory complianceData,
        uint256 qualityScore,
        string memory certification,
        bytes32 zkProofHash,
        ComplianceStandard storage standard
    ) internal view returns (bool isValid) {
        // Validate quality score against standard
        if (qualityScore < standard.minQualityScore || qualityScore > standard.maxQualityScore) {
            return false;
        }

        // Validate compliance data
        if (complianceData.length == 0) {
            return false;
        }

        // Validate certification if required
        if (standard.requiredCertifications.length > 0) {
            if (!_validateCertification(certification, standard.requiredCertifications)) {
                return false;
            }
        }

        // Simulate different verification logic based on compliance type
        if (keccak256(bytes(complianceType)) == keccak256("regulatory")) {
            return _verifyRegulatoryCompliance(complianceData, qualityScore, certification);
        } else if (keccak256(bytes(complianceType)) == keccak256("quality")) {
            return _verifyQualityCompliance(complianceData, qualityScore, certification);
        } else if (keccak256(bytes(complianceType)) == keccak256("supply_chain")) {
            return _verifySupplyChainCompliance(complianceData, qualityScore, certification);
        } else if (keccak256(bytes(complianceType)) == keccak256("certification")) {
            return _verifyCertificationCompliance(complianceData, qualityScore, certification);
        }

        return false;
    }

    /**
     * @dev Verify regulatory compliance
     */
    function _verifyRegulatoryCompliance(
        bytes memory complianceData,
        uint256 qualityScore,
        string memory certification
    ) internal pure returns (bool isValid) {
        // Simulate regulatory compliance verification
        return qualityScore >= 60 && bytes(certification).length > 0;
    }

    /**
     * @dev Verify quality compliance
     */
    function _verifyQualityCompliance(
        bytes memory complianceData,
        uint256 qualityScore,
        string memory certification
    ) internal pure returns (bool isValid) {
        // Simulate quality compliance verification
        return qualityScore >= 80 && bytes(certification).length > 0;
    }

    /**
     * @dev Verify supply chain compliance
     */
    function _verifySupplyChainCompliance(
        bytes memory complianceData,
        uint256 qualityScore,
        string memory certification
    ) internal pure returns (bool isValid) {
        // Simulate supply chain compliance verification
        return qualityScore >= 70 && bytes(certification).length > 0;
    }

    /**
     * @dev Verify certification compliance
     */
    function _verifyCertificationCompliance(
        bytes memory complianceData,
        uint256 qualityScore,
        string memory certification
    ) internal pure returns (bool isValid) {
        // Simulate certification compliance verification
        return qualityScore >= 75 && bytes(certification).length > 0;
    }

    /**
     * @dev Validate certification against required certifications
     * @param certification Certification to validate
     * @param requiredCertifications Array of required certifications
     * @return isValid Whether certification is valid
     */
    function _validateCertification(
        string memory certification,
        string[] memory requiredCertifications
    ) internal pure returns (bool isValid) {
        for (uint256 i = 0; i < requiredCertifications.length; i++) {
            if (keccak256(bytes(certification)) == keccak256(bytes(requiredCertifications[i]))) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Calculate overall quality score from individual scores
     * @param aromaScore Aroma score
     * @param flavorScore Flavor score
     * @param bodyScore Body score
     * @param acidityScore Acidity score
     * @param aftertasteScore Aftertaste score
     * @return overallScore Weighted overall score
     */
    function _calculateOverallScore(
        uint256 aromaScore,
        uint256 flavorScore,
        uint256 bodyScore,
        uint256 acidityScore,
        uint256 aftertasteScore
    ) internal pure returns (uint256 overallScore) {
        // Weighted average: Flavor (30%), Aroma (25%), Body (20%), Acidity (15%), Aftertaste (10%)
        uint256 weightedSum = (
            flavorScore * 30 +
            aromaScore * 25 +
            bodyScore * 20 +
            acidityScore * 15 +
            aftertasteScore * 10
        );
        
        return weightedSum / 100;
    }

    /**
     * @dev Update the coffee token reference (only admin)
     */
    function setCoffeeTokenAddress(address coffeeTokenAddress) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(coffeeTokenAddress != address(0), "Invalid coffee token address");
        coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
    }
}
