// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title MockOfframpPartner
 * @dev Mock contract simulating an offramp partner for testing purposes
 * @notice This contract simulates receiving USDC from treasury and converting to fiat
 * @notice It validates SWIFT codes and tracks offramp transactions for testing
 */
contract MockOfframpPartner is AccessControl, ReentrancyGuard {
    bytes32 public constant OFFRAMP_EXECUTOR_ROLE = keccak256("OFFRAMP_EXECUTOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                    */
    /* -------------------------------------------------------------------------- */

    error MockOfframpPartner__InvalidUSDCAddress_constructor();
    error MockOfframpPartner__InvalidRecipientAddress_receiveOfframp();
    error MockOfframpPartner__InvalidAmount_receiveOfframp();
    error MockOfframpPartner__TransferFailed_receiveOfframp();
    error MockOfframpPartner__UnauthorizedOfframpExecutor_receiveOfframp();
    error MockOfframpPartner__InvalidSwiftCode_validateSwiftCode();
    error MockOfframpPartner__SwiftCodeNotSupported_validateSwiftCode();
    error MockOfframpPartner__InvalidSellerId_getOfframpRecord();
    error MockOfframpPartner__NoOfframpRecordFound_getOfframpRecord();

    /* -------------------------------------------------------------------------- */
    /*                                  Events                                    */
    /* -------------------------------------------------------------------------- */

    event OfframpReceived(
        uint256 indexed batchId,
        address indexed buyer,
        uint256 indexed sellerId,
        uint256 usdAmount,
        bytes11 receivingBankSwift,
        uint256 timestamp
    );

    event FiatTransferInitiated(
        uint256 indexed batchId,
        uint256 indexed sellerId,
        bytes11 receivingBankSwift,
        uint256 usdAmount,
        string transactionId,
        uint256 timestamp
    );

    /* -------------------------------------------------------------------------- */
    /*                              State Variables                              */
    /* -------------------------------------------------------------------------- */

    // USDC token contract
    IERC20 public immutable usdcToken;

    // Supported SWIFT codes for receiving banks (Ethiopian banks)
    mapping(bytes11 => bool) public supportedSwiftCodes;
    mapping(bytes11 => string) public swiftToBankName;

    // Offramp transaction records
    struct OfframpRecord {
        uint256 batchId;
        address buyer;
        uint256 sellerId;
        uint256 usdAmount;
        bytes11 receivingBankSwift;
        string bankTransactionId;
        bool fiatTransferInitiated;
        uint256 timestamp;
    }

    mapping(uint256 => OfframpRecord) public offrampRecords; // sellerId => record
    uint256[] public processedSellerIds;

    // Fee configuration (simplified for testing)
    uint256 public constant OFFRAMP_FEE_BASIS_POINTS = 50; // 0.5%

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(address _usdcToken) {
        if (_usdcToken == address(0)) {
            revert MockOfframpPartner__InvalidUSDCAddress_constructor();
        }

        usdcToken = IERC20(_usdcToken);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);

        // Setup some default supported SWIFT codes for testing
        _setupDefaultSupportedSwiftCodes();
    }

    /* -------------------------------------------------------------------------- */
    /*                              External Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Receive USDC offramp from treasury (simulates offramp partner receiving funds)
     * @param batchId Batch identifier
     * @param buyer Buyer address
     * @param sellerId Seller digital ID
     * @param usdAmount Amount in USD (USDC with 6 decimals)
     * @param receivingBankSwift SWIFT code of Ethiopian receiving bank
     */
    function receiveOfframp(
        uint256 batchId,
        address buyer,
        uint256 sellerId,
        uint256 usdAmount,
        bytes11 receivingBankSwift
    ) external onlyRole(OFFRAMP_EXECUTOR_ROLE) nonReentrant {
        if (buyer == address(0)) {
            revert MockOfframpPartner__InvalidRecipientAddress_receiveOfframp();
        }
        if (usdAmount == 0) {
            revert MockOfframpPartner__InvalidAmount_receiveOfframp();
        }

        // Validate SWIFT code
        if (!_isValidSwiftCode(receivingBankSwift)) {
            revert MockOfframpPartner__InvalidSwiftCode_validateSwiftCode();
        }
        if (!supportedSwiftCodes[receivingBankSwift]) {
            revert MockOfframpPartner__SwiftCodeNotSupported_validateSwiftCode();
        }

        // Record the offramp transaction
        offrampRecords[sellerId] = OfframpRecord({
            batchId: batchId,
            buyer: buyer,
            sellerId: sellerId,
            usdAmount: usdAmount,
            receivingBankSwift: receivingBankSwift,
            bankTransactionId: "",
            fiatTransferInitiated: false,
            timestamp: block.timestamp
        });

        processedSellerIds.push(sellerId);

        emit OfframpReceived(batchId, buyer, sellerId, usdAmount, receivingBankSwift, block.timestamp);
    }

    /**
     * @dev Initiate fiat transfer to Ethiopian bank (simulates sending USD to Ethiopia)
     * @param sellerId Seller digital ID
     * @param transactionId Bank transaction identifier
     */
    function initiateFiatTransfer(
        uint256 sellerId,
        string calldata transactionId
    ) external onlyRole(ADMIN_ROLE) {
        OfframpRecord storage record = offrampRecords[sellerId];
        if (record.timestamp == 0) {
            revert MockOfframpPartner__NoOfframpRecordFound_getOfframpRecord();
        }

        record.fiatTransferInitiated = true;
        record.bankTransactionId = transactionId;

        emit FiatTransferInitiated(
            record.batchId,
            sellerId,
            record.receivingBankSwift,
            record.usdAmount,
            transactionId,
            block.timestamp
        );
    }

    /* -------------------------------------------------------------------------- */
    /*                              View Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get offramp record for a seller
     * @param sellerId Seller digital ID
     * @return record Complete offramp record
     */
    function getOfframpRecord(uint256 sellerId) external view returns (OfframpRecord memory record) {
        record = offrampRecords[sellerId];
        if (record.timestamp == 0) {
            revert MockOfframpPartner__NoOfframpRecordFound_getOfframpRecord();
        }
        return record;
    }

    /**
     * @dev Check if SWIFT code is supported
     * @param swiftCode SWIFT code to check
     * @return isSupported Whether the SWIFT code is supported
     */
    function isSupportedSwiftCode(bytes11 swiftCode) external view returns (bool isSupported) {
        return supportedSwiftCodes[swiftCode];
    }

    /**
     * @dev Get bank name for SWIFT code
     * @param swiftCode SWIFT code
     * @return bankName Bank name associated with SWIFT code
     */
    function getBankName(bytes11 swiftCode) external view returns (string memory bankName) {
        return swiftToBankName[swiftCode];
    }

    /**
     * @dev Calculate offramp fee for a given amount
     * @param usdAmount Amount in USD
     * @return fee Fee amount
     */
    function calculateOfframpFee(uint256 usdAmount) external pure returns (uint256 fee) {
        return (usdAmount * OFFRAMP_FEE_BASIS_POINTS) / 10000;
    }

    /**
     * @dev Get total processed seller IDs count
     * @return count Number of processed seller IDs
     */
    function getProcessedSellerIdsCount() external view returns (uint256 count) {
        return processedSellerIds.length;
    }

    /**
     * @dev Get processed seller ID by index
     * @param index Array index
     * @return sellerId Seller digital ID
     */
    function getProcessedSellerId(uint256 index) external view returns (uint256 sellerId) {
        return processedSellerIds[index];
    }

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Add support for a new SWIFT code
     * @param swiftCode SWIFT code to add
     * @param bankName Associated bank name
     */
    function addSupportedSwiftCode(bytes11 swiftCode, string calldata bankName) external onlyRole(ADMIN_ROLE) {
        supportedSwiftCodes[swiftCode] = true;
        swiftToBankName[swiftCode] = bankName;
    }

    /**
     * @dev Remove support for a SWIFT code
     * @param swiftCode SWIFT code to remove
     */
    function removeSupportedSwiftCode(bytes11 swiftCode) external onlyRole(ADMIN_ROLE) {
        supportedSwiftCodes[swiftCode] = false;
        delete swiftToBankName[swiftCode];
    }

    /**
     * @dev Grant OFFRAMP_EXECUTOR_ROLE to an address
     * @param executor Address to grant role to
     */
    function grantOfframpExecutorRole(address executor) external onlyRole(ADMIN_ROLE) {
        grantRole(OFFRAMP_EXECUTOR_ROLE, executor);
    }

    /* -------------------------------------------------------------------------- */
    /*                             Internal Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Setup default supported SWIFT codes for testing
     */
    function _setupDefaultSupportedSwiftCodes() internal {
        // Commercial Bank of Ethiopia
        supportedSwiftCodes[bytes11("CBETETAAXXX")] = true;
        swiftToBankName[bytes11("CBETETAAXXX")] = "Commercial Bank of Ethiopia";

        // Dashen Bank
        supportedSwiftCodes[bytes11("DASHETAAXXX")] = true;
        swiftToBankName[bytes11("DASHETAAXXX")] = "Dashen Bank";

        // Awash International Bank
        supportedSwiftCodes[bytes11("AWINETAAXXX")] = true;
        swiftToBankName[bytes11("AWINETAAXXX")] = "Awash International Bank";

        // Lion International Bank
        supportedSwiftCodes[bytes11("LIONETAAXXX")] = true;
        swiftToBankName[bytes11("LIONETAAXXX")] = "Lion International Bank";
    }

    /**
     * @dev Validate SWIFT code format (basic validation)
     * @param swiftCode SWIFT code to validate
     * @return isValid Whether the SWIFT code format is valid
     */
    function _isValidSwiftCode(bytes11 swiftCode) internal pure returns (bool isValid) {
        // Basic SWIFT code validation: 8 or 11 characters, alphanumeric
        uint256 length = 0;
        for (uint256 i = 0; i < 11; i++) {
            if (swiftCode[i] != 0) {
                length++;
                // Check if alphanumeric
                if (!((swiftCode[i] >= 0x30 && swiftCode[i] <= 0x39) || // 0-9
                      (swiftCode[i] >= 0x41 && swiftCode[i] <= 0x5A))) { // A-Z
                    return false;
                }
            }
        }
        return length == 8 || length == 11;
    }
}
