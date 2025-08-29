// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IComplianceVerifier {
    enum ComplianceType {
        Geographic,     // Origin and location compliance
        Quality,        // Quality standards compliance
        Processing,     // Processing method compliance
        Timeline,       // Production timeline compliance
        Certification   // Certification compliance
    }
    
    struct ComplianceProof {
        ComplianceType complianceType;
        bytes32 proofHash;
        bool verified;
        uint256 verifiedAt;
        string publicData;  // What competitors can see
    }
    
    function verifyCompliance(
        bytes calldata proof,
        uint256 batchId,
        ComplianceType complianceType,
        string calldata publicData
    ) external returns (bool);
    
    function getComplianceProof(
        uint256 batchId,
        ComplianceType complianceType
    ) external view returns (ComplianceProof memory);
}
