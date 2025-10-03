// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BankingWorkflowLib
 * @dev Library for banking workflow operations and validations
 * @notice Extracted from WAGAEthiopianBanking to reduce contract size
 */
library BankingWorkflowLib {
    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error InvalidBankingOperation();
    error InvalidTransferAmount();
    error InvalidRecipientDetails();
    error BankingOperationFailed();
    error InvalidBankingStage();
    error TransferAlreadyProcessed();
    error InsufficientBankingFunds();

    /* -------------------------------------------------------------------------- */
    /*                                   STRUCTS                                 */
    /* -------------------------------------------------------------------------- */

    struct BankingTransfer {
        uint256 transferId;
        address sender;
        uint256 amount;
        bytes11 recipientSWIFT;
        string recipientAccount;
        string transferReference;
        BankingStage stage;
        uint256 timestamp;
        bool processed;
    }

    enum BankingStage {
        Initiated,
        Validated,
        Approved,
        Processing,
        Completed,
        Failed
    }

    /* -------------------------------------------------------------------------- */
    /*                             VALIDATION FUNCTIONS                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates banking transfer parameters
     * @param amount Transfer amount
     * @param recipientSWIFT Recipient bank SWIFT code
     * @param recipientAccount Recipient account details
     */
    function validateBankingTransfer(
        uint256 amount,
        bytes11 recipientSWIFT,
        string memory recipientAccount
    ) external pure {
        if (amount == 0) {
            revert InvalidTransferAmount();
        }

        if (_isEmpty(recipientAccount)) {
            revert InvalidRecipientDetails();
        }

        // Basic SWIFT format check
        if (!_hasValidSWIFTLength(recipientSWIFT)) {
            revert InvalidRecipientDetails();
        }
    }

    /**
     * @dev Validates banking stage transition
     * @param currentStage Current banking stage
     * @param nextStage Proposed next stage
     */
    function validateStageTransition(
        BankingStage currentStage,
        BankingStage nextStage
    ) external pure {
        // Define valid stage transitions
        if (currentStage == BankingStage.Initiated) {
            if (nextStage != BankingStage.Validated && nextStage != BankingStage.Failed) {
                revert InvalidBankingStage();
            }
        } else if (currentStage == BankingStage.Validated) {
            if (nextStage != BankingStage.Approved && nextStage != BankingStage.Failed) {
                revert InvalidBankingStage();
            }
        } else if (currentStage == BankingStage.Approved) {
            if (nextStage != BankingStage.Processing && nextStage != BankingStage.Failed) {
                revert InvalidBankingStage();
            }
        } else if (currentStage == BankingStage.Processing) {
            if (nextStage != BankingStage.Completed && nextStage != BankingStage.Failed) {
                revert InvalidBankingStage();
            }
        } else if (currentStage == BankingStage.Completed || currentStage == BankingStage.Failed) {
            // Final states - no transitions allowed
            revert InvalidBankingStage();
        }
    }

    /**
     * @dev Calculates banking fees based on transfer amount and type
     * @param amount Transfer amount
     * @param isInternational Whether it's an international transfer
     * @param isDomestic Whether it's a domestic transfer
     * @return fee Calculated fee amount
     */
    function calculateBankingFee(
        uint256 amount,
        bool isInternational,
        bool isDomestic
    ) external pure returns (uint256 fee) {
        if (isInternational) {
            // International transfer: 0.5% with minimum $10 equivalent
            fee = (amount * 50) / 10000; // 0.5%
            uint256 minFee = 10 * 1e6; // $10 in USDC (6 decimals)
            if (fee < minFee) fee = minFee;
        } else if (isDomestic) {
            // Domestic transfer: 0.1% with minimum $2 equivalent
            fee = (amount * 10) / 10000; // 0.1%
            uint256 minFee = 2 * 1e6; // $2 in USDC (6 decimals)
            if (fee < minFee) fee = minFee;
        } else {
            // Default fee: 0.25%
            fee = (amount * 25) / 10000; // 0.25%
        }
    }

    /**
     * @dev Generates unique transfer reference
     * @param transferId Transfer ID
     * @param sender Sender address
     * @param timestamp Block timestamp
     * @return referenceString Generated reference string
     */
    function generateTransferReference(
        uint256 transferId,
        address sender,
        uint256 timestamp
    ) external pure returns (string memory referenceString) {
        // Generate reference: WAGA-{transferId}-{last4OfSender}-{timestamp}
        string memory senderHex = _addressToString(sender);
        string memory last4 = _substring(senderHex, 38, 42); // Last 4 chars of address
        
        referenceString = string(abi.encodePacked(
            "WAGA-",
            _uint256ToString(transferId),
            "-",
            last4,
            "-",
            _uint256ToString(timestamp)
        ));
    }

    /**
     * @dev Validates banking operation permissions
     * @param operator Address performing the operation
     * @param transferOwner Owner of the transfer
     * @param isAuthorizedOperator Whether operator is authorized
     */
    function validateBankingPermission(
        address operator,
        address transferOwner,
        bool isAuthorizedOperator
    ) external pure {
        if (operator != transferOwner && !isAuthorizedOperator) {
            revert InvalidBankingOperation();
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                               HELPER FUNCTIONS                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Checks if string is empty
     * @param str String to check
     * @return True if empty
     */
    function _isEmpty(string memory str) private pure returns (bool) {
        return bytes(str).length == 0;
    }

    /**
     * @dev Checks if SWIFT code has valid length
     * @param swiftCode SWIFT code to check
     * @return True if valid length
     */
    function _hasValidSWIFTLength(bytes11 swiftCode) private pure returns (bool) {
        // Check if it's 8 or 11 characters
        uint8 length = 0;
        for (uint8 i = 0; i < 11; i++) {
            if (swiftCode[i] != 0) {
                length++;
            } else {
                break;
            }
        }
        return length == 8 || length == 11;
    }

    /**
     * @dev Converts address to string
     * @param addr Address to convert
     * @return String representation
     */
    function _addressToString(address addr) private pure returns (string memory) {
        bytes32 value = bytes32(uint256(uint160(addr)));
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(42);
        str[0] = '0';
        str[1] = 'x';
        for (uint256 i = 0; i < 20; i++) {
            str[2 + i * 2] = alphabet[uint8(value[i + 12] >> 4)];
            str[3 + i * 2] = alphabet[uint8(value[i + 12] & 0x0f)];
        }
        return string(str);
    }

    /**
     * @dev Extracts substring
     * @param str Source string
     * @param startIndex Start index
     * @param endIndex End index
     * @return Substring
     */
    function _substring(
        string memory str,
        uint256 startIndex,
        uint256 endIndex
    ) private pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        bytes memory result = new bytes(endIndex - startIndex);
        for (uint256 i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = strBytes[i];
        }
        return string(result);
    }

    /**
     * @dev Converts uint256 to string
     * @param value Value to convert
     * @return String representation
     */
    function _uint256ToString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}