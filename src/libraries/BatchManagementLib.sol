// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title BatchManagementLib
 * @dev Library for advanced batch management operations
 * @notice Extracted from WAGABatchManager to reduce contract size
 */
library BatchManagementLib {
    
    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    
    event BatchRegistered(uint256 indexed batchId, address indexed registrar, uint256 timestamp);
    event BatchStatusUpdated(uint256 indexed batchId, uint8 oldStatus, uint8 newStatus);
    event BatchTransferred(uint256 indexed batchId, address indexed from, address indexed to);
    event BatchVerified(uint256 indexed batchId, address indexed verifier, bool verified);
    event BatchExpired(uint256 indexed batchId, uint256 expiryDate);
    
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    
    error BatchManagementLib__BatchNotFound();
    error BatchManagementLib__BatchAlreadyExists();
    error BatchManagementLib__UnauthorizedAccess();
    error BatchManagementLib__InvalidBatchData();
    error BatchManagementLib__BatchExpired();
    error BatchManagementLib__InvalidStatusTransition();
    error BatchManagementLib__InsufficientQuantity();

    /* -------------------------------------------------------------------------- */
    /*                                   Enums                                   */
    /* -------------------------------------------------------------------------- */

    enum BatchStatus {
        REGISTERED,      // Initial registration
        VERIFIED,        // Quality verified
        APPROVED,        // Approved for minting
        MINTING,         // Currently being minted
        MINTED,          // Fully minted
        EXPIRED,         // Past expiry date
        CANCELLED        // Cancelled/rejected
    }

    enum QualityTier {
        PREMIUM,         // Grade 1 - Highest quality
        STANDARD,        // Grade 2 - Standard quality
        COMMERCIAL,      // Grade 3 - Commercial grade
        SPECIALTY        // Specialty/organic grade
    }

    /* -------------------------------------------------------------------------- */
    /*                                  Structs                                  */
    /* -------------------------------------------------------------------------- */

    struct BatchDetails {
        uint256 batchId;
        address creator;
        address currentOwner;
        BatchStatus status;
        QualityTier qualityTier;
        uint256 totalQuantity;
        uint256 availableQuantity;
        uint256 reservedQuantity;
        uint256 mintedQuantity;
        uint256 registrationDate;
        uint256 verificationDate;
        uint256 expiryDate;
        string origin;
        string varietyInfo;
        string processingMethod;
        bytes32 qualityHash;
        bool isActive;
    }

    struct BatchTransfer {
        uint256 batchId;
        address from;
        address to;
        uint256 quantity;
        uint256 transferDate;
        string reason;
        bool isComplete;
    }

    struct BatchReservation {
        uint256 batchId;
        address reserver;
        uint256 quantity;
        uint256 reservationDate;
        uint256 expiryDate;
        bool isActive;
        string purpose;
    }

    /* -------------------------------------------------------------------------- */
    /*                             Batch Registration                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Registers a new batch with detailed information
     * @param batches Storage reference to batch details mapping
     * @param batchId The batch ID to register
     * @param creator Address creating the batch
     * @param qualityTier Quality tier of the batch
     * @param totalQuantity Total quantity in the batch
     * @param expiryDate Expiry date for the batch
     * @param origin Coffee origin information
     * @param varietyInfo Coffee variety information
     * @param processingMethod Processing method used
     */
    function registerBatch(
        mapping(uint256 => BatchDetails) storage batches,
        uint256 batchId,
        address creator,
        QualityTier qualityTier,
        uint256 totalQuantity,
        uint256 expiryDate,
        string memory origin,
        string memory varietyInfo,
        string memory processingMethod
    ) external {
        // Validation
        if (batchId == 0) revert BatchManagementLib__InvalidBatchData();
        if (creator == address(0)) revert BatchManagementLib__InvalidBatchData();
        if (totalQuantity == 0) revert BatchManagementLib__InvalidBatchData();
        if (expiryDate <= block.timestamp) revert BatchManagementLib__InvalidBatchData();
        if (batches[batchId].batchId != 0) revert BatchManagementLib__BatchAlreadyExists();

        // Generate quality hash
        bytes32 qualityHash = keccak256(
            abi.encodePacked(
                batchId,
                origin,
                varietyInfo,
                processingMethod,
                qualityTier,
                block.timestamp
            )
        );

        // Register batch
        batches[batchId] = BatchDetails({
            batchId: batchId,
            creator: creator,
            currentOwner: creator,
            status: BatchStatus.REGISTERED,
            qualityTier: qualityTier,
            totalQuantity: totalQuantity,
            availableQuantity: totalQuantity,
            reservedQuantity: 0,
            mintedQuantity: 0,
            registrationDate: block.timestamp,
            verificationDate: 0,
            expiryDate: expiryDate,
            origin: origin,
            varietyInfo: varietyInfo,
            processingMethod: processingMethod,
            qualityHash: qualityHash,
            isActive: true
        });

        emit BatchRegistered(batchId, creator, block.timestamp);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Batch Verification                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Verifies a batch for quality and authenticity
     * @param batches Storage reference to batch details mapping
     * @param batchId The batch ID to verify
     * @param verifier Address performing verification
     * @param approved Whether the batch is approved
     */
    function verifyBatch(
        mapping(uint256 => BatchDetails) storage batches,
        uint256 batchId,
        address verifier,
        bool approved
    ) external {
        BatchDetails storage batch = batches[batchId];
        
        if (batch.batchId == 0) revert BatchManagementLib__BatchNotFound();
        if (!batch.isActive) revert BatchManagementLib__BatchExpired();
        if (batch.status != BatchStatus.REGISTERED) {
            revert BatchManagementLib__InvalidStatusTransition();
        }

        // Update verification status
        batch.verificationDate = block.timestamp;
        
        if (approved) {
            batch.status = BatchStatus.VERIFIED;
        } else {
            batch.status = BatchStatus.CANCELLED;
            batch.isActive = false;
        }

        emit BatchVerified(batchId, verifier, approved);
        emit BatchStatusUpdated(batchId, uint8(BatchStatus.REGISTERED), uint8(batch.status));
    }

    /* -------------------------------------------------------------------------- */
    /*                             Quantity Management                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Reserves quantity from a batch
     * @param batches Storage reference to batch details mapping
     * @param reservations Storage reference to reservations mapping
     * @param batchId The batch ID
     * @param reserver Address making the reservation
     * @param quantity Quantity to reserve
     * @param purpose Purpose of the reservation
     * @param reservationDuration Duration of the reservation in seconds
     * @return reservationId Generated reservation ID
     */
    function reserveQuantity(
        mapping(uint256 => BatchDetails) storage batches,
        mapping(bytes32 => BatchReservation) storage reservations,
        uint256 batchId,
        address reserver,
        uint256 quantity,
        string memory purpose,
        uint256 reservationDuration
    ) external returns (bytes32 reservationId) {
        BatchDetails storage batch = batches[batchId];
        
        if (batch.batchId == 0) revert BatchManagementLib__BatchNotFound();
        if (!batch.isActive) revert BatchManagementLib__BatchExpired();
        if (batch.availableQuantity < quantity) revert BatchManagementLib__InsufficientQuantity();

        // Generate reservation ID
        reservationId = keccak256(
            abi.encodePacked(
                batchId,
                reserver,
                quantity,
                block.timestamp
            )
        );

        // Update batch quantities
        batch.availableQuantity -= quantity;
        batch.reservedQuantity += quantity;

        // Create reservation
        reservations[reservationId] = BatchReservation({
            batchId: batchId,
            reserver: reserver,
            quantity: quantity,
            reservationDate: block.timestamp,
            expiryDate: block.timestamp + reservationDuration,
            isActive: true,
            purpose: purpose
        });

        return reservationId;
    }

    /**
     * @dev Releases a reservation
     * @param batches Storage reference to batch details mapping
     * @param reservations Storage reference to reservations mapping
     * @param reservationId The reservation ID to release
     */
    function releaseReservation(
        mapping(uint256 => BatchDetails) storage batches,
        mapping(bytes32 => BatchReservation) storage reservations,
        bytes32 reservationId
    ) external {
        BatchReservation storage reservation = reservations[reservationId];
        
        if (!reservation.isActive) revert BatchManagementLib__BatchNotFound();

        BatchDetails storage batch = batches[reservation.batchId];
        
        // Update batch quantities
        batch.availableQuantity += reservation.quantity;
        batch.reservedQuantity -= reservation.quantity;

        // Deactivate reservation
        reservation.isActive = false;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Batch Transfers                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Transfers batch ownership
     * @param batches Storage reference to batch details mapping
     * @param transfers Storage reference to transfers mapping
     * @param batchId The batch ID to transfer
     * @param from Current owner
     * @param to New owner
     * @param quantity Quantity to transfer (0 for full batch)
     * @param reason Reason for transfer
     * @return transferId Generated transfer ID
     */
    function transferBatch(
        mapping(uint256 => BatchDetails) storage batches,
        mapping(bytes32 => BatchTransfer) storage transfers,
        uint256 batchId,
        address from,
        address to,
        uint256 quantity,
        string memory reason
    ) external returns (bytes32 transferId) {
        BatchDetails storage batch = batches[batchId];
        
        if (batch.batchId == 0) revert BatchManagementLib__BatchNotFound();
        if (batch.currentOwner != from) revert BatchManagementLib__UnauthorizedAccess();
        if (!batch.isActive) revert BatchManagementLib__BatchExpired();

        // If quantity is 0, transfer entire batch
        if (quantity == 0) {
            quantity = batch.totalQuantity;
        }

        if (quantity > batch.totalQuantity) revert BatchManagementLib__InsufficientQuantity();

        // Generate transfer ID
        transferId = keccak256(
            abi.encodePacked(
                batchId,
                from,
                to,
                quantity,
                block.timestamp
            )
        );

        // For full batch transfer, update owner
        if (quantity == batch.totalQuantity) {
            batch.currentOwner = to;
        }

        // Record transfer
        transfers[transferId] = BatchTransfer({
            batchId: batchId,
            from: from,
            to: to,
            quantity: quantity,
            transferDate: block.timestamp,
            reason: reason,
            isComplete: true
        });

        emit BatchTransferred(batchId, from, to);
        return transferId;
    }

    /* -------------------------------------------------------------------------- */
    /*                             Status Management                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Updates batch status with validation
     * @param batches Storage reference to batch details mapping
     * @param batchId The batch ID
     * @param newStatus New status to set
     */
    function updateBatchStatus(
        mapping(uint256 => BatchDetails) storage batches,
        uint256 batchId,
        BatchStatus newStatus,
        address /* updater */
    ) external {
        BatchDetails storage batch = batches[batchId];
        
        if (batch.batchId == 0) revert BatchManagementLib__BatchNotFound();
        
        BatchStatus oldStatus = batch.status;
        
        // Validate status transition
        if (!_isValidStatusTransition(oldStatus, newStatus)) {
            revert BatchManagementLib__InvalidStatusTransition();
        }

        batch.status = newStatus;

        emit BatchStatusUpdated(batchId, uint8(oldStatus), uint8(newStatus));
    }

    /**
     * @dev Marks a batch as expired
     * @param batches Storage reference to batch details mapping
     * @param batchId The batch ID to expire
     */
    function expireBatch(
        mapping(uint256 => BatchDetails) storage batches,
        uint256 batchId
    ) external {
        BatchDetails storage batch = batches[batchId];
        
        if (batch.batchId == 0) revert BatchManagementLib__BatchNotFound();
        if (block.timestamp <= batch.expiryDate) revert BatchManagementLib__InvalidBatchData();

        batch.status = BatchStatus.EXPIRED;
        batch.isActive = false;

        emit BatchExpired(batchId, batch.expiryDate);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Utility Functions                            */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Gets complete batch details
     * @param batches Storage reference to batch details mapping
     * @param batchId The batch ID
     * @return batch The batch details
     */
    function getBatchDetails(
        mapping(uint256 => BatchDetails) storage batches,
        uint256 batchId
    ) external view returns (BatchDetails memory batch) {
        return batches[batchId];
    }

    /**
     * @dev Checks if a batch is active and not expired
     * @param batches Storage reference to batch details mapping
     * @param batchId The batch ID
     * @return active True if batch is active
     */
    function isBatchActive(
        mapping(uint256 => BatchDetails) storage batches,
        uint256 batchId
    ) external view returns (bool active) {
        BatchDetails storage batch = batches[batchId];
        return batch.isActive && block.timestamp <= batch.expiryDate;
    }

    /**
     * @dev Gets available quantity for a batch
     * @param batches Storage reference to batch details mapping
     * @param batchId The batch ID
     * @return available Available quantity
     */
    function getAvailableQuantity(
        mapping(uint256 => BatchDetails) storage batches,
        uint256 batchId
    ) external view returns (uint256 available) {
        return batches[batchId].availableQuantity;
    }

    /* -------------------------------------------------------------------------- */
    /*                             Private Functions                             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Validates if a status transition is allowed
     * @param from Current status
     * @param to Target status
     * @return valid True if transition is valid
     */
    function _isValidStatusTransition(
        BatchStatus from,
        BatchStatus to
    ) private pure returns (bool valid) {
        // Define valid transitions
        if (from == BatchStatus.REGISTERED) {
            return to == BatchStatus.VERIFIED || to == BatchStatus.CANCELLED;
        }
        if (from == BatchStatus.VERIFIED) {
            return to == BatchStatus.APPROVED || to == BatchStatus.CANCELLED;
        }
        if (from == BatchStatus.APPROVED) {
            return to == BatchStatus.MINTING || to == BatchStatus.CANCELLED;
        }
        if (from == BatchStatus.MINTING) {
            return to == BatchStatus.MINTED || to == BatchStatus.CANCELLED;
        }
        
        // Once minted, expired, or cancelled, no further transitions
        return false;
    }
}