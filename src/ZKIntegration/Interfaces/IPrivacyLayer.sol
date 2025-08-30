// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title IPrivacyLayer
 * @dev Interface for privacy layer implementation
 * @dev Supports selective transparency and encrypted data storage
 */
interface IPrivacyLayer {
    /* -------------------------------------------------------------------------- */
    /*                                  Errors                                   */
    /* -------------------------------------------------------------------------- */
    error IPrivacyLayer__InvalidPrivacyLevel_configurePrivacy();
    error IPrivacyLayer__UnauthorizedCaller_configurePrivacy();
    error IPrivacyLayer__InvalidEncryptionKey_encryptData();
    error IPrivacyLayer__InvalidDecryptionKey_decryptData();
    error IPrivacyLayer__DataNotFound_getEncryptedData();
    error IPrivacyLayer__PrivacyConfigNotFound_getPrivacyConfig();

    /* -------------------------------------------------------------------------- */
    /*                              Type Declarations                             */
    /* -------------------------------------------------------------------------- */

    enum PrivacyLevel {
        PUBLIC,     // 0: All data visible to everyone
        SELECTIVE,  // 1: Data visible based on role and ZK proofs
        PRIVATE     // 2: Data hidden, only ZK proofs visible
    }

    struct PrivacyConfig {
        uint8 pricingSelective;      // 0=Public, 1=Selective, 2=Private
        uint8 qualitySelective;      // 0=Public, 1=Selective, 2=Private
        uint8 supplyChainSelective; // 0=Public, 1=Selective, 2=Private
        bytes32 pricingProofHash;    // Hash of ZK proof for pricing
        bytes32 qualityProofHash;     // Hash of ZK proof for quality
        bytes32 supplyChainProofHash; // Hash of ZK proof for supply chain
        bool pricingPrivate;         // Legacy field for backward compatibility
        bool qualityPrivate;         // Legacy field for backward compatibility
        bool supplyChainPrivate;     // Legacy field for backward compatibility
        PrivacyLevel level;          // Overall privacy level
    }

    struct EncryptedData {
        bytes32 dataHash;
        bytes encryptedData;
        bytes32 encryptionKeyHash;
        uint256 encryptionTimestamp;
        address dataOwner;
        bool isAccessible;
        string dataType; // "pricing", "quality", "supply_chain", "metadata"
    }

    struct SelectiveAccess {
        address user;
        PrivacyLevel accessLevel;
        uint256 accessTimestamp;
        uint256 expiryTimestamp;
        bool isActive;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event PrivacyConfigured(
        uint256 indexed batchId,
        PrivacyConfig privacyConfig,
        address indexed configurator
    );

    event DataEncrypted(
        uint256 indexed batchId,
        bytes32 indexed dataHash,
        string dataType,
        address indexed owner
    );

    event DataDecrypted(
        uint256 indexed batchId,
        bytes32 indexed dataHash,
        address indexed requester
    );

    event AccessGranted(
        uint256 indexed batchId,
        address indexed user,
        PrivacyLevel accessLevel,
        uint256 expiryTimestamp
    );

    event AccessRevoked(
        uint256 indexed batchId,
        address indexed user,
        address indexed revoker
    );

    /* -------------------------------------------------------------------------- */
    /*                              Core Functions                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Configure privacy settings for a batch
     * @param batchId Batch identifier
     * @param privacyConfig Privacy configuration
     */
    function configurePrivacy(
        uint256 batchId,
        PrivacyConfig calldata privacyConfig
    ) external;

    /**
     * @dev Get privacy configuration for a batch
     * @param batchId Batch identifier
     * @return privacyConfig Privacy configuration
     */
    function getPrivacyConfig(
        uint256 batchId
    ) external view returns (PrivacyConfig memory privacyConfig);

    /**
     * @dev Encrypt data for a batch
     * @param batchId Batch identifier
     * @param data Raw data to encrypt
     * @param encryptionKey Encryption key
     * @param dataType Type of data being encrypted
     * @return dataHash Hash of the encrypted data
     */
    function encryptData(
        uint256 batchId,
        bytes calldata data,
        bytes32 encryptionKey,
        string calldata dataType
    ) external returns (bytes32 dataHash);

    /**
     * @dev Decrypt data for a batch
     * @param batchId Batch identifier
     * @param dataHash Hash of the encrypted data
     * @param decryptionKey Decryption key
     * @return decryptedData Decrypted data
     */
    function decryptData(
        uint256 batchId,
        bytes32 dataHash,
        bytes32 decryptionKey
    ) external returns (bytes memory decryptedData);

    /**
     * @dev Get encrypted data metadata
     * @param batchId Batch identifier
     * @param dataHash Hash of the encrypted data
     * @return encryptedData Encrypted data metadata
     */
    function getEncryptedData(
        uint256 batchId,
        bytes32 dataHash
    ) external view returns (EncryptedData memory encryptedData);

    /* -------------------------------------------------------------------------- */
    /*                              Access Control                                */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Grant selective access to a user
     * @param batchId Batch identifier
     * @param user User address
     * @param accessLevel Access level granted
     * @param expiryTimestamp Access expiry timestamp
     */
    function grantAccess(
        uint256 batchId,
        address user,
        PrivacyLevel accessLevel,
        uint256 expiryTimestamp
    ) external;

    /**
     * @dev Revoke access for a user
     * @param batchId Batch identifier
     * @param user User address
     */
    function revokeAccess(
        uint256 batchId,
        address user
    ) external;

    /**
     * @dev Check if user has access to data
     * @param batchId Batch identifier
     * @param user User address
     * @param dataType Type of data being accessed
     * @return hasAccess Whether user has access
     */
    function hasAccess(
        uint256 batchId,
        address user,
        string calldata dataType
    ) external view returns (bool hasAccess);

    /**
     * @dev Get user's access level
     * @param batchId Batch identifier
     * @param user User address
     * @return accessLevel User's access level
     */
    function getUserAccessLevel(
        uint256 batchId,
        address user
    ) external view returns (PrivacyLevel accessLevel);

    /* -------------------------------------------------------------------------- */
    /*                              Selective Transparency                        */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get data with selective transparency
     * @param batchId Batch identifier
     * @param caller Caller address for access control
     * @param dataType Type of data requested
     * @return data Data with appropriate privacy applied
     * @return isVisible Whether the data is visible to caller
     */
    function getDataWithPrivacy(
        uint256 batchId,
        address caller,
        string calldata dataType
    ) external view returns (
        bytes memory data,
        bool isVisible
    );

    /**
     * @dev Verify data visibility based on privacy settings
     * @param batchId Batch identifier
     * @param caller Caller address
     * @param dataType Type of data
     * @return isVisible Whether data should be visible
     */
    function shouldShowData(
        uint256 batchId,
        address caller,
        string calldata dataType
    ) external view returns (bool isVisible);

    /**
     * @dev Get public data (always visible)
     * @param batchId Batch identifier
     * @return publicData Public data for the batch
     */
    function getPublicData(
        uint256 batchId
    ) external view returns (bytes memory publicData);

    /**
     * @dev Get selective data (visible based on role and proofs)
     * @param batchId Batch identifier
     * @param caller Caller address
     * @return selectiveData Selective data for the batch
     */
    function getSelectiveData(
        uint256 batchId,
        address caller
    ) external view returns (bytes memory selectiveData);

    /* -------------------------------------------------------------------------- */
    /*                              ZK Proof Integration                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Update ZK proof hash for a data type
     * @param batchId Batch identifier
     * @param dataType Type of data
     * @param proofHash Hash of the ZK proof
     */
    function updateZKProofHash(
        uint256 batchId,
        string calldata dataType,
        bytes32 proofHash
    ) external;

    /**
     * @dev Get ZK proof hash for a data type
     * @param batchId Batch identifier
     * @param dataType Type of data
     * @return proofHash Hash of the ZK proof
     */
    function getZKProofHash(
        uint256 batchId,
        string calldata dataType
    ) external view returns (bytes32 proofHash);

    /**
     * @dev Verify ZK proof for data access
     * @param batchId Batch identifier
     * @param dataType Type of data
     * @param proofData ZK proof data
     * @return isValid Whether the proof is valid
     */
    function verifyZKProofForAccess(
        uint256 batchId,
        string calldata dataType,
        bytes calldata proofData
    ) external returns (bool isValid);

    /* -------------------------------------------------------------------------- */
    /*                              Batch Management                              */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get all encrypted data for a batch
     * @param batchId Batch identifier
     * @return encryptedData Array of encrypted data
     */
    function getBatchEncryptedData(
        uint256 batchId
    ) external view returns (EncryptedData[] memory encryptedData);

    /**
     * @dev Get all access grants for a batch
     * @param batchId Batch identifier
     * @return accessGrants Array of access grants
     */
    function getBatchAccessGrants(
        uint256 batchId
    ) external view returns (SelectiveAccess[] memory accessGrants);

    /**
     * @dev Check if batch has privacy configured
     * @param batchId Batch identifier
     * @return hasPrivacy Whether privacy is configured
     */
    function hasPrivacyConfigured(
        uint256 batchId
    ) external view returns (bool hasPrivacy);

    /* -------------------------------------------------------------------------- */
    /*                              Admin Functions                               */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Set default privacy configuration (admin only)
     * @param defaultConfig Default privacy configuration
     */
    function setDefaultPrivacyConfig(
        PrivacyConfig calldata defaultConfig
    ) external;

    /**
     * @dev Get default privacy configuration
     * @return defaultConfig Default privacy configuration
     */
    function getDefaultPrivacyConfig() external view returns (PrivacyConfig memory defaultConfig);

    /**
     * @dev Emergency data access (admin only)
     * @param batchId Batch identifier
     * @param dataHash Hash of the encrypted data
     * @return decryptedData Decrypted data
     */
    function emergencyDataAccess(
        uint256 batchId,
        bytes32 dataHash
    ) external returns (bytes memory decryptedData);
}
