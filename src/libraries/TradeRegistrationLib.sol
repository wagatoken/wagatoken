// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IEthiopianCompliance} from "../Interfaces/IEthiopianCompliance.sol";
import {IWAGACoffeeToken} from "../Interfaces/IWAGACoffeeToken.sol";

/**
 * @title TradeRegistrationLib
 * @dev Library for Bank of Ethiopia trade registration and related operations
 * @notice Extracted from WAGAEthiopianBanking to reduce contract size
 */
library TradeRegistrationLib {
    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error UpstreamComplianceNotMet();
    error FailedToGetECTAPermit();
    error FailedToGetQualityCertificate();
    error InvalidTradeRegistration();
    error TradeRegistrationNotFound();

    /* -------------------------------------------------------------------------- */
    /*                                CONSTANTS                                   */
    /* -------------------------------------------------------------------------- */

    uint256 private constant RATE_PRECISION = 10**8;
    bytes11 private constant DEFAULT_BANKING_PARTNER = "CBETETAAXXX"; // Commercial Bank of Ethiopia

    /* -------------------------------------------------------------------------- */
    /*                          TRADE REGISTRATION FUNCTIONS                     */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates upstream compliance for trade registration
     * @param complianceCore Address of compliance core contract
     * @param batchId Batch ID to validate
     */
    function validateUpstreamCompliance(
        address complianceCore,
        uint256 batchId
    ) external view returns (bool isValid) {
        (bool success, bytes memory result) = complianceCore.staticcall(
            abi.encodeWithSignature("validateUpstreamCompliance(uint256)", batchId)
        );
        if (!success) {
            revert UpstreamComplianceNotMet();
        }
        return abi.decode(result, (bool));
    }

    /**
     * @dev Gets ECTA permit from compliance core
     * @param complianceCore Address of compliance core contract
     * @param batchId Batch ID
     * @return permit ECTA permit details
     */
    function getECTAPermit(
        address complianceCore,
        uint256 batchId
    ) external view returns (IEthiopianCompliance.ECTAPermit memory permit) {
        (bool success, bytes memory result) = complianceCore.staticcall(
            abi.encodeWithSignature("getECTAPermit(uint256)", batchId)
        );
        if (!success) {
            revert FailedToGetECTAPermit();
        }
        return abi.decode(result, (IEthiopianCompliance.ECTAPermit));
    }

    /**
     * @dev Gets quality certificate from compliance core
     * @param complianceCore Address of compliance core contract
     * @param batchId Batch ID
     * @return certificate Quality certificate details
     */
    function getQualityCertificate(
        address complianceCore,
        uint256 batchId
    ) external view returns (IEthiopianCompliance.QualityCertificate memory certificate) {
        (bool success, bytes memory result) = complianceCore.staticcall(
            abi.encodeWithSignature("getQualityCertificate(uint256)", batchId)
        );
        if (!success) {
            revert FailedToGetQualityCertificate();
        }
        return abi.decode(result, (IEthiopianCompliance.QualityCertificate));
    }

    /**
     * @dev Converts USD to ETB using provided rate
     * @param usdAmount Amount in USD
     * @param usdToEtbRate Exchange rate (multiplied by RATE_PRECISION)
     * @return etbAmount Amount in ETB
     */
    function convertUSDToETB(
        uint256 usdAmount,
        uint256 usdToEtbRate
    ) external pure returns (uint256 etbAmount) {
        return (usdAmount * usdToEtbRate) / RATE_PRECISION;
    }

    /**
     * @dev Creates a BoE trade registration
     * @param batchId Batch ID
     * @param sellerId Seller ID
     * @param buyer Buyer address
     * @param quantity Coffee quantity
     * @param valueUSD Value in USD
     * @param permit ECTA permit
     * @param certificate Quality certificate
     * @param assignedOfframpSwift Assigned offramp partner SWIFT
     * @param assignedPartnerType Assigned partner type
     * @return registration Complete trade registration
     */
    function createTradeRegistration(
        uint256 batchId,
        uint64 sellerId,
        address buyer,
        uint256 quantity,
        uint256 valueUSD,
        IEthiopianCompliance.ECTAPermit memory permit,
        IEthiopianCompliance.QualityCertificate memory certificate,
        bytes11 assignedOfframpSwift,
        IEthiopianCompliance.OfframpPartnerType assignedPartnerType
    ) external view returns (IEthiopianCompliance.BoETradeRegistration memory registration) {
        registration = IEthiopianCompliance.BoETradeRegistration({
            batchId: batchId,
            sellerId: sellerId,
            buyer: buyer,
            quantity: quantity,
            valueUSD: valueUSD,
            ectaPermitNumber: permit.permitNumber,
            qualityCertificate: certificate.certificateNumber,
            exportDocuments: permit.permitDocumentHash,
            registrationTimestamp: block.timestamp,
            boERegistered: true,
            assignedOfframpPartner: assignedOfframpSwift,
            assignedBankingPartner: DEFAULT_BANKING_PARTNER,
            offrampType: assignedPartnerType,
            fiatTransferInitiated: true,
            fiatTransferCompleted: false,
            bankTransactionId: "",
            sellerPaymentConfirmed: 0
        });
    }

    /**
     * @dev Generates trade ID for BoE registration
     * @param batchId Batch ID
     * @param buyer Buyer address
     * @param timestamp Block timestamp
     * @return tradeId Generated trade ID
     */
    function generateTradeId(
        uint256 batchId,
        address buyer,
        uint256 timestamp
    ) external pure returns (uint256 tradeId) {
        return uint256(keccak256(abi.encodePacked(batchId, buyer, timestamp)));
    }

    /**
     * @dev Validates trade registration data
     * @param registration Trade registration to validate
     */
    function validateTradeRegistration(
        IEthiopianCompliance.BoETradeRegistration memory registration
    ) external pure {
        if (registration.batchId == 0) {
            revert InvalidTradeRegistration();
        }
        if (registration.buyer == address(0)) {
            revert InvalidTradeRegistration();
        }
        if (registration.quantity == 0) {
            revert InvalidTradeRegistration();
        }
        if (registration.valueUSD == 0) {
            revert InvalidTradeRegistration();
        }
        if (bytes(registration.ectaPermitNumber).length == 0) {
            revert InvalidTradeRegistration();
        }
    }

    /**
     * @dev Updates trade registration status
     * @param registration Trade registration to update
     * @param fiatTransferCompleted Whether fiat transfer is completed
     * @param bankTransactionId Bank transaction ID
     * @param sellerPaymentConfirmed Seller payment confirmation timestamp
     * @return updatedRegistration Updated registration
     */
    function updateTradeRegistrationStatus(
        IEthiopianCompliance.BoETradeRegistration memory registration,
        bool fiatTransferCompleted,
        string memory bankTransactionId,
        uint256 sellerPaymentConfirmed
    ) external pure returns (IEthiopianCompliance.BoETradeRegistration memory updatedRegistration) {
        updatedRegistration = registration;
        updatedRegistration.fiatTransferCompleted = fiatTransferCompleted;
        updatedRegistration.bankTransactionId = bankTransactionId;
        updatedRegistration.sellerPaymentConfirmed = sellerPaymentConfirmed;
    }
}