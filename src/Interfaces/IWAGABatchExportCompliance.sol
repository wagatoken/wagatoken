// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEthiopianCompliance} from "./IEthiopianCompliance.sol";

/**
 * @title IWAGABatchExportCompliance
 * @dev Interface for WAGABatchExportCompliance contract - manages Ethiopian and EUDR export compliance
 */
interface IWAGABatchExportCompliance {
    /**
     * @dev Ethiopian compliance functions
     */
    function registerEthiopianBatch(uint256 batchId, string calldata origin) external;
    function addECTAPermitDuringCreation(uint256 batchId, IEthiopianCompliance.ECTAPermit calldata permit) external;
    function addQualityCertificateDuringCreation(uint256 batchId, IEthiopianCompliance.QualityCertificate calldata certificate) external;
    function addOriginVerificationDuringCreation(uint256 batchId, IEthiopianCompliance.OriginVerification calldata origin) external;

    /**
     * @dev EUDR compliance functions
     */
    function registerEUDRComplianceWithZK(uint256 batchId, IEthiopianCompliance.EUDRCertificate calldata certificate, bytes calldata zkProofData) external;
    function addEUDRGeolocationDataWithZK(uint256 batchId, IEthiopianCompliance.GeolocationData calldata geolocation, bytes calldata zkProofData) external;

    /**
     * @dev View functions for compliance status
     */
    function getEthiopianComplianceStatus(uint256 batchId) external view returns (bool isEthiopian, string memory region, bool hasCompliance);
    function getEUDRComplianceStatus(uint256 batchId) external view returns (bool hasCompliance, string memory complianceLevel, uint256 timestamp, bool hasDeforestationAssessment);
    function isReadyForExport(uint256 batchId) external view returns (bool);
    function validateEUDRZKCompliance(uint256 batchId) external view returns (bool deforestationCompliant, bool geolocationVerified, bool fullyCompliant);

    /**
     * @dev Export compliance summary
     */
    function getExportComplianceSummary(uint256 batchId) external view returns (
        bool isEthiopian,
        bool hasEthiopianComplianceStatus,
        bool hasEUDRComplianceStatus,
        bool isExportReady
    );
}