// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title RedemptionLib  
 * @dev Library for common redemption validation patterns to reduce bytecode
 */
library RedemptionLib {
    // Compressed error names (saves ~2 bytes per character vs WAGACoffeeRedemption__)
    error ZeroQty();
    error LowBalance();
    error NotVerified();
    error MetadataNotVerified();
    error NotExists();
    error BackToRequested();
    error AlreadyFulfilled();
    error AlreadyCancelled();
    error AlreadyInit();
    error NotInit();
    error Expired();
    error SameStatus();
    error NoRole();
    error PaymentReq();
    error NoPayment();
    error EthComplianceReq();
    error NoFiatTransfer();
    error InvalidBanking();
    error EUDRReq();
    error ZKValidationFailed();
    error NoOfframpTransfer();
    error InvalidStage();
    error TransferConfirmed();
    error SellerNotFound();
    error SellerNotConfirmed();
    error UnauthorizedSeller();
    error InvalidToken();
    error InvalidTreasury();
    error InvalidEthCompliance();
    error InvalidBatchMgr();
    error InvalidZKMgr();
    error NoAuth();
    error InvalidAddr();
    error TreasuryNotSet();
    error NotEthBatch();
    error FiatCompleted();
    error NotAuthBanking();

    /**
     * @dev Validates basic address requirements
     */
    function validateAddress(address addr) internal pure {
        if (addr == address(0)) {
            revert InvalidAddr();
        }
    }

    /**
     * @dev Common validation for redemption operations
     */
    function validateRedemptionBasics(
        uint256 quantity,
        uint256 userBalance,
        bool batchExists
    ) internal pure {
        if (quantity == 0) {
            revert ZeroQty();
        }
        if (!batchExists) {
            revert NotExists();
        }
        if (userBalance < quantity) {
            revert LowBalance();
        }
    }

    /**
     * @dev Validation for batch verification status
     */
    function validateBatchStatus(
        bool isVerified,
        bool isMetadataVerified,
        uint256 expiryDate
    ) internal view {
        if (!isVerified) {
            revert NotVerified();
        }
        if (!isMetadataVerified) {
            revert MetadataNotVerified();
        }
        if (block.timestamp > expiryDate) {
            revert Expired();
        }
    }
}