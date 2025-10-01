// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import {ERC1155Supply} from "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import {WAGAConfigManager} from "./WAGAConfigManager.sol";
import {IWAGACoffeeToken} from "./Interfaces/IWAGACoffeeToken.sol";

/**
 * @title WAGACoffeeTokenCore
 * @dev ULTRA-LEAN ERC1155 token contract using Central Authority pattern
 * @notice This contract handles ONLY minting, burning, transfers, and basic storage
 * All business logic is delegated to WAGACoffeeBatchOperations contract
 * NO inheritance from WAGAConfigManager = MASSIVE size savings!
 */
contract WAGACoffeeTokenCore is ERC1155Supply, IWAGACoffeeToken {

    /* -------------------------------------------------------------------------- */
    /*                                Role Constants                              */
    /* -------------------------------------------------------------------------- */
    
    // Role constants for compatibility with existing contracts
    bytes32 public constant DEFAULT_ADMIN_ROLE = 0x00;
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant COOPERATIVE_ROLE = keccak256("COOPERATIVE_ROLE");
    bytes32 public constant ROASTER_ROLE = keccak256("ROASTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant REDEMPTION_ROLE = keccak256("REDEMPTION_ROLE");
    bytes32 public constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");
    bytes32 public constant ORIGIN_VERIFIER_ROLE = keccak256("ORIGIN_VERIFIER_ROLE");
    bytes32 public constant QUALITY_INSPECTOR_ROLE = keccak256("QUALITY_INSPECTOR_ROLE");
    bytes32 public constant PAYMENT_PROCESSOR_ROLE = keccak256("PAYMENT_PROCESSOR_ROLE");
    bytes32 public constant OFFRAMP_EXECUTOR_ROLE = keccak256("OFFRAMP_EXECUTOR_ROLE");
    bytes32 public constant FULFILLER_ROLE = keccak256("FULFILLER_ROLE");
    bytes32 public constant BATCH_CREATOR_ROLE = keccak256("BATCH_CREATOR_ROLE");
    bytes32 public constant PROOF_OF_RESERVE_ROLE = keccak256("PROOF_OF_RESERVE_ROLE");
    bytes32 public constant INVENTORY_MANAGER_ROLE = keccak256("INVENTORY_MANAGER_ROLE");

    /* -------------------------------------------------------------------------- */
    /*                               State Variables                              */
    /* -------------------------------------------------------------------------- */
    
    // Central authority for access control - NO inheritance saves 17KB+!
    WAGAConfigManager public immutable authority;
    
    // Operations contract that manages all business logic
    address public immutable batchOperations;
    
    // Minimal storage - only what's needed for tokens
    mapping(uint256 => string) public batchMetadata; // Token metadata URIs
    mapping(uint256 => bool) public batchExists; // Track which batches exist

    /* -------------------------------------------------------------------------- */
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */

    event BatchMinted(uint256 indexed batchId, address indexed to, uint256 amount, uint256 totalMinted);
    event BatchBurned(uint256 indexed batchId, address indexed from, uint256 amount, uint256 totalMinted);
    event BatchTransferred(uint256 indexed batchId, address indexed from, address indexed to, uint256 amount);

    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */

    error CallerNotAuthorized();
    error BatchDoesNotExist();
    error InvalidQuantity();
    error InsufficientBalance();

    /* -------------------------------------------------------------------------- */
    /*                                Constructor                                 */
    /* -------------------------------------------------------------------------- */

    constructor(
        string memory baseURI,
        address _authority,
        address _batchOperations
    ) ERC1155(baseURI) {
        authority = WAGAConfigManager(_authority);
        batchOperations = _batchOperations;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 Modifiers                                  */
    /* -------------------------------------------------------------------------- */

    modifier onlyRole(bytes32 role) {
        if (!authority.hasRole(role, msg.sender)) {
            revert CallerNotAuthorized();
        }
        _;
    }

    modifier onlyBatchOperations() {
        require(msg.sender == batchOperations, "Only batch operations contract");
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Core Token Functions                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Mint tokens - MINIMAL implementation
     */
    function mintBatch(address to, uint256 batchId, uint256 amount) external onlyRole(keccak256("MINTER_ROLE")) {
        if (!batchExists[batchId]) {
            revert BatchDoesNotExist();
        }
        if (amount == 0) {
            revert InvalidQuantity();
        }
        
        _mint(to, batchId, amount, "");
        
        // Notify batch operations of the mint
        (bool success,) = batchOperations.call(
            abi.encodeWithSignature("notifyMint(uint256,uint256)", batchId, amount)
        );
        require(success, "Failed to notify batch operations");
        
        emit BatchMinted(batchId, to, amount, totalSupply(batchId));
    }

    /**
     * @dev Burn tokens for redemption
     */
    function burnForRedemption(address from, uint256 batchId, uint256 amount) external onlyRole(keccak256("REDEMPTION_ROLE")) {
        if (balanceOf(from, batchId) < amount) {
            revert InsufficientBalance();
        }
        
        _burn(from, batchId, amount);
        
        // Notify batch operations of the burn
        (bool success,) = batchOperations.call(
            abi.encodeWithSignature("notifyBurn(uint256,uint256)", batchId, amount)
        );
        require(success, "Failed to notify batch operations");
        
        emit BatchBurned(batchId, from, amount, totalSupply(batchId));
    }

    /**
     * @dev Transfer batch tokens
     */
    function transferBatch(uint256 batchId, address from, address to, uint256 amount) external {
        if (!batchExists[batchId]) {
            revert BatchDoesNotExist();
        }
        if (balanceOf(from, batchId) < amount) {
            revert InsufficientBalance();
        }
        _safeTransferFrom(from, to, batchId, amount, "");
        emit BatchTransferred(batchId, from, to, amount);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Batch Management Functions                    */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register a new batch - called by batch operations contract
     */
    function registerBatch(uint256 batchId, string memory metadataURI) external onlyBatchOperations {
        batchExists[batchId] = true;
        if (bytes(metadataURI).length > 0) {
            batchMetadata[batchId] = metadataURI;
        }
    }

    /**
     * @dev Update batch IPFS URI
     */
    function updateBatchIPFS(uint256 batchId, string memory ipfsUri) external onlyRole(keccak256("ADMIN_ROLE")) {
        if (!batchExists[batchId]) {
            revert BatchDoesNotExist();
        }
        batchMetadata[batchId] = ipfsUri;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Delegation Functions                          */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Delegate batch creation to operations contract
     */
    function createBatch(
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory origin,
        string memory packagingInfo,
        string memory metadataURI
    ) external returns (uint256) {
        // Delegate to batch operations contract
        (bool success, bytes memory data) = batchOperations.call(
            abi.encodeWithSignature(
                "createBatch(uint256,uint256,uint256,uint256,string,string,string)",
                productionDate, expiryDate, quantity, pricePerUnit, origin, packagingInfo, metadataURI
            )
        );
        require(success, "Batch creation failed");
        return abi.decode(data, (uint256));
    }

    /**
     * @dev Delegate batch request creation to operations contract
     */
    function createBatchRequest(
        uint256 batchId,
        uint256 requestedQuantity,
        string memory requestDetails
    ) external returns (uint256) {
        (bool success, bytes memory data) = batchOperations.call(
            abi.encodeWithSignature(
                "createBatchRequest(uint256,uint256,string)",
                batchId, requestedQuantity, requestDetails
            )
        );
        require(success, "Batch request creation failed");
        return abi.decode(data, (uint256));
    }

    /* -------------------------------------------------------------------------- */
    /*                              View Functions (IWAGACoffeeToken)             */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if batch has been created
     */
    function isBatchCreated(uint256 batchId) external view returns (bool) {
        return batchExists[batchId];
    }

    /**
     * @dev Get batch information - delegate to operations contract
     */
    function getBatchInfo(uint256 batchId) external view returns (
        uint256 productionDate,
        uint256 expiryDate,
        uint256 quantity,
        uint256 pricePerUnit,
        string memory packagingInfo,
        string memory metadataHash,
        uint256 lastVerifiedTimestamp
    ) {
        (bool success, bytes memory data) = batchOperations.staticcall(
            abi.encodeWithSignature("getBatchInfo(uint256)", batchId)
        );
        require(success, "Failed to get batch info");
        return abi.decode(data, (uint256, uint256, uint256, uint256, string, string, uint256));
    }

    /**
     * @dev Get batch request - delegate to operations contract
     */
    function getBatchRequest(uint256 batchId, uint256 requestIndex) external view returns (
        uint256 requestBatchId,
        address requester,
        uint256 requestedQuantity,
        string memory requestDetails,
        uint256 requestTimestamp,
        bool isFulfilled,
        uint256 fulfilledQuantity,
        uint256 fulfilledTimestamp
    ) {
        (bool success, bytes memory data) = batchOperations.staticcall(
            abi.encodeWithSignature("getBatchRequest(uint256,uint256)", batchId, requestIndex)
        );
        require(success, "Failed to get batch request");
        return abi.decode(data, (uint256, address, uint256, string, uint256, bool, uint256, uint256));
    }

    /**
     * @dev Get batch quantity - delegate to operations contract
     */
    function getBatchQuantity(uint256 batchId) external view returns (uint256) {
        (bool success, bytes memory data) = batchOperations.staticcall(
            abi.encodeWithSignature("getBatchQuantity(uint256)", batchId)
        );
        require(success, "Failed to get batch quantity");
        return abi.decode(data, (uint256));
    }

    /**
     * @dev Get next batch ID - delegate to operations contract
     */
    function getNextBatchId() external view returns (uint256) {
        (bool success, bytes memory data) = batchOperations.staticcall(
            abi.encodeWithSignature("getNextBatchId()")
        );
        require(success, "Failed to get next batch ID");
        return abi.decode(data, (uint256));
    }

    /**
     * @dev Get minted quantity for a batch
     */
    function getMintedQuantity(uint256 batchId) external view returns (uint256) {
        return totalSupply(batchId);
    }

    /**
     * @dev Get available quantity for a batch - delegate to operations contract
     */
    function getAvailableQuantity(uint256 batchId) external view returns (uint256) {
        (bool success, bytes memory data) = batchOperations.staticcall(
            abi.encodeWithSignature("getAvailableQuantity(uint256)", batchId)
        );
        require(success, "Failed to get available quantity");
        return abi.decode(data, (uint256));
    }

    /* -------------------------------------------------------------------------- */
    /*                              Access Control Functions (IWAGACoffeeToken)   */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Check if an account has a specific role - delegate to authority
     */
    function hasRole(bytes32 role, address account) external view returns (bool) {
        return authority.hasRole(role, account);
    }

    /**
     * @dev Get seller ID for an address - delegate to authority
     */
    function getSellerId(address sellerAddress) external view returns (uint64) {
        return authority.getSellerId(sellerAddress);
    }

    /**
     * @dev Get seller address from ID - delegate to authority
     */
    function getSellerAddress(uint64 sellerId) external view returns (address) {
        return authority.getSellerAddress(sellerId);
    }

    /**
     * @dev Check if an address is a registered seller - delegate to authority
     */
    function isRegisteredSeller(address account) external view returns (bool) {
        return authority.isRegisteredSeller(account);
    }

    /* -------------------------------------------------------------------------- */
    /*                              Override Functions                            */
    /* -------------------------------------------------------------------------- */

    function uri(uint256 tokenId) public view override returns (string memory) {
        return batchMetadata[tokenId];
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC1155) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
