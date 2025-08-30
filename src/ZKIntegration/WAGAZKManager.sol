// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IZKVerifier} from "../ZKCircuits/Interfaces/IZKVerifier.sol";
import {IPrivacyLayer} from "../ZKCircuits/Interfaces/IPrivacyLayer.sol";
import {IComplianceVerifier} from "../ZKCircuits/Interfaces/IComplianceVerifier.sol";

contract WAGAZKManager is AccessControl, IPrivacyLayer {
    bytes32 public constant ZK_ADMIN_ROLE = keccak256("ZK_ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // ZK verifier contracts
    IZKVerifier public circomVerifier;
    IComplianceVerifier public complianceVerifier;
    
    // Privacy configuration for each batch
    mapping(uint256 => PrivacyConfig) public batchPrivacyConfig;
    
    // ZK proof registry
    mapping(bytes32 => bool) public verifiedProofs;
    mapping(uint256 => bytes32[]) public batchProofs;
    
    // Events
    event PrivacyProofVerified(
        uint256 indexed batchId,
        string proofType,
        bool verified,
        bytes32 proofHash
    );
    
    event PrivacyConfigUpdated(
        uint256 indexed batchId,
        PrivacyLevel level,
        bool pricingPrivate,
        bool qualityPrivate,
        bool supplyChainPrivate
    );
    
    event ZKVerifierUpdated(address indexed oldVerifier, address indexed newVerifier);
    
    constructor(address _coffeeToken, address _circomVerifier, address _privacyLayer) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ZK_ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
        
        circomVerifier = IZKVerifier(_circomVerifier);
        // Note: complianceVerifier will be set separately after deployment
    }
    
    // Verify all privacy proofs for a batch
    function verifyBatchPrivacyProofs(
        uint256 batchId,
        bytes calldata pricingProof,
        bytes calldata qualityProof,
        bytes calldata supplyChainProof
    ) external onlyRole(VERIFIER_ROLE) returns (bool) {
        bool pricingVerified = false;
        bool qualityVerified = false;
        bool supplyChainVerified = false;
        
        bytes32 pricingProofHash = bytes32(0);
        bytes32 qualityProofHash = bytes32(0);
        bytes32 supplyChainProofHash = bytes32(0);
        
        // Verify pricing privacy proof
        if (pricingProof.length > 0) {
            pricingProofHash = keccak256(pricingProof);
            pricingVerified = _verifyPricingProof(pricingProof, batchId);
            if (pricingVerified) {
                verifiedProofs[pricingProofHash] = true;
                batchProofs[batchId].push(pricingProofHash);
            }
        }
        
        // Verify quality privacy proof
        if (qualityProof.length > 0) {
            qualityProofHash = keccak256(qualityProof);
            qualityVerified = _verifyQualityProof(qualityProof, batchId);
            if (qualityVerified) {
                verifiedProofs[qualityProofHash] = true;
                batchProofs[batchId].push(qualityProofHash);
            }
        }
        
        // Verify supply chain privacy proof
        if (supplyChainProof.length > 0) {
            supplyChainProofHash = keccak256(supplyChainProof);
            supplyChainVerified = _verifySupplyChainProof(supplyChainProof, batchId);
            if (supplyChainVerified) {
                verifiedProofs[supplyChainProofHash] = true;
                batchProofs[batchId].push(supplyChainProofHash);
            }
        }
        
        // Update privacy configuration
        batchPrivacyConfig[batchId] = PrivacyConfig({
            pricingPrivate: pricingVerified,
            qualityPrivate: qualityVerified,
            supplyChainPrivate: supplyChainVerified,
            pricingSelective: false, // Set based on business logic
            qualitySelective: false,
            supplyChainSelective: false,
            pricingProofHash: pricingProofHash,
            qualityProofHash: qualityProofHash,
            supplyChainProofHash: supplyChainProofHash,
            level: _determinePrivacyLevel(pricingVerified, qualityVerified, supplyChainVerified)
        });
        
        emit PrivacyProofVerified(batchId, "all", 
            pricingVerified && qualityVerified && supplyChainVerified,
            keccak256(abi.encodePacked(pricingProofHash, qualityProofHash, supplyChainProofHash))
        );
        
        return pricingVerified && qualityVerified && supplyChainVerified;
    }
    
    // Verify individual proof types
    function verifyPricingProof(
        uint256 batchId,
        bytes calldata proof,
        string calldata marketSegment,
        bool isCompetitive
    ) external onlyRole(VERIFIER_ROLE) returns (bool) {
        bool verified = _verifyPricingProof(proof, batchId);
        if (verified) {
            bytes32 proofHash = keccak256(proof);
            verifiedProofs[proofHash] = true;
            batchProofs[batchId].push(proofHash);
            
            // Update privacy config
            batchPrivacyConfig[batchId].pricingPrivate = true;
            batchPrivacyConfig[batchId].pricingProofHash = proofHash;
        }
        
        emit PrivacyProofVerified(batchId, "pricing", verified, keccak256(proof));
        return verified;
    }
    
    function verifyQualityProof(
        uint256 batchId,
        bytes calldata proof,
        string calldata tier,
        bool meetsRequirements
    ) external onlyRole(VERIFIER_ROLE) returns (bool) {
        bool verified = _verifyQualityProof(proof, batchId);
        if (verified) {
            bytes32 proofHash = keccak256(proof);
            verifiedProofs[proofHash] = true;
            batchProofs[batchId].push(proofHash);
            
            // Update privacy config
            batchPrivacyConfig[batchId].qualityPrivate = true;
            batchPrivacyConfig[batchId].qualityProofHash = proofHash;
        }
        
        emit PrivacyProofVerified(batchId, "quality", verified, keccak256(proof));
        return verified;
    }
    
    function verifySupplyChainProof(
        uint256 batchId,
        bytes calldata proof,
        string calldata complianceType,
        bool meetsCompliance
    ) external onlyRole(VERIFIER_ROLE) returns (bool) {
        bool verified = _verifySupplyChainProof(proof, batchId);
        if (verified) {
            bytes32 proofHash = keccak256(proof);
            verifiedProofs[proofHash] = true;
            batchProofs[batchId].push(proofHash);
            
            // Update privacy config
            batchPrivacyConfig[batchId].supplyChainPrivate = true;
            batchPrivacyConfig[batchId].supplyChainProofHash = proofHash;
        }
        
        emit PrivacyProofVerified(batchId, "supply_chain", verified, keccak256(proof));
        return verified;
    }
    
    // Privacy layer interface implementation
    function getPrivacyConfig(uint256 batchId) external view override returns (PrivacyConfig memory) {
        return batchPrivacyConfig[batchId];
    }
    
    function updatePrivacyConfig(uint256 batchId, PrivacyConfig calldata config) external override onlyRole(VERIFIER_ROLE) {
        batchPrivacyConfig[batchId] = config;
        
        emit PrivacyConfigUpdated(
            batchId,
            config.level,
            config.pricingPrivate,
            config.qualityPrivate,
            config.supplyChainPrivate
        );
    }
    
    function verifyPrivacyProofs(uint256 batchId) external override returns (bool) {
        PrivacyConfig memory config = batchPrivacyConfig[batchId];
        return config.pricingPrivate && config.qualityPrivate && config.supplyChainPrivate;
    }
    
    // Internal verification functions
    function _verifyPricingProof(bytes calldata proof, uint256 batchId) internal returns (bool) {
        // In a real implementation, this would call the Circom verifier
        // For now, we'll simulate verification
        return true;
    }
    
    function _verifyQualityProof(bytes calldata proof, uint256 batchId) internal returns (bool) {
        // In a real implementation, this would call the Circom verifier
        // For now, we'll simulate verification
        return true;
    }
    
    function _verifySupplyChainProof(bytes calldata proof, uint256 batchId) internal returns (bool) {
        // In a real implementation, this would call the Circom verifier
        // For now, we'll simulate verification
        return true;
    }
    
    function _determinePrivacyLevel(bool pricing, bool quality, bool supplyChain) internal pure returns (PrivacyLevel) {
        if (pricing && quality && supplyChain) {
            return PrivacyLevel.Private;
        } else if (pricing || quality || supplyChain) {
            return PrivacyLevel.Selective;
        } else {
            return PrivacyLevel.Public;
        }
    }
    
    // Admin functions
    function updateCircomVerifier(address newVerifier) external onlyRole(ZK_ADMIN_ROLE) {
        address oldVerifier = address(circomVerifier);
        circomVerifier = IZKVerifier(newVerifier);
        emit ZKVerifierUpdated(oldVerifier, newVerifier);
    }
    
    function updateComplianceVerifier(address newVerifier) external onlyRole(ZK_ADMIN_ROLE) {
        address oldVerifier = address(complianceVerifier);
        complianceVerifier = IComplianceVerifier(newVerifier);
        emit ZKVerifierUpdated(oldVerifier, newVerifier);
    }
    
    function grantVerifierRole(address account) external onlyRole(ZK_ADMIN_ROLE) {
        _grantRole(VERIFIER_ROLE, account);
    }
    
    function revokeVerifierRole(address account) external onlyRole(ZK_ADMIN_ROLE) {
        _revokeRole(VERIFIER_ROLE, account);
    }
    
    // View functions
    function getBatchProofs(uint256 batchId) external view returns (bytes32[] memory) {
        return batchProofs[batchId];
    }
    
    function isProofVerified(bytes32 proofHash) external view returns (bool) {
        return verifiedProofs[proofHash];
    }
    
    function getBatchPrivacyLevel(uint256 batchId) external view returns (PrivacyLevel) {
        return batchPrivacyConfig[batchId].level;
    }
}
