// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title WAGAAccessControl
 * @dev Simplified access control for WAGA MVP with ZK integration
 * @dev Only essential roles for processors, WAGA admins, and ZK verification
 */
contract WAGAAccessControl is AccessControl {

    /* -------------------------------------------------------------------------- */
    /*                                   ERRORS                                   */
    /* -------------------------------------------------------------------------- */

    error WAGAAccessControl__InvalidSellerAddress_registerSeller();
    error WAGAAccessControl__InvalidSellerName_registerSeller();
    error WAGAAccessControl__SellerAlreadyRegistered_registerSeller();
    error WAGAAccessControl__SellerNotFound_updateSellerContact();
    error WAGAAccessControl__UnauthorizedAccess_updateSellerContact();
    error WAGAAccessControl__SellerNotFound_deactivateSeller();
    error WAGAAccessControl__SellerNotFound_getSellerProfile();
    error WAGAAccessControl__SellerNotFound_getSellerAddress();
    error WAGAAccessControl__MustBeAdminOrProcessor_onlyBatchCreator();
    error WAGAAccessControl__MustHaveZKVerifierRole_onlyZKVerifier();
    error WAGAAccessControl__MustBeAdmin_onlyAdmin();

    /* -------------------------------------------------------------------------- */
    /*                              SELLER REGISTRATION SYSTEM                    */
    /* -------------------------------------------------------------------------- */

    struct SellerProfile {
        uint64 sellerId;                    // Digital ID (8 bytes vs 20 bytes)
        SellerType sellerType;              // COOPERATIVE, PROCESSOR, ROASTER
        string sellerName;
        string businessRegistration;        // Ethiopian business registration
        string contactEmail;
        bytes11 preferredBankSwift;         // Preferred banking partner
        bool isActive;
        uint256 registrationTimestamp;
    }

    enum SellerType {
        COOPERATIVE,
        PROCESSOR,
        ROASTER
    }

    uint64 private nextSellerId = 1000; // Start at 1000 for seller IDs

    // Seller data storage
    mapping(uint64 => SellerProfile) private sellersById;
    mapping(address => uint64) private addressToSellerId;
    mapping(uint64 => address) private sellerIdToAddress;

    /* -------------------------------------------------------------------------- */
    /*                              MVP Role System                               */
    /* -------------------------------------------------------------------------- */
    
    // Core Business Roles (3 roles only for MVP)
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");        // WAGA admins
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE"); // Coffee processors
    bytes32 public constant COOPERATIVE_ROLE = keccak256("COOPERATIVE_ROLE"); // Cooperatives
    bytes32 public constant ROASTER_ROLE = keccak256("ROASTER_ROLE");     // Coffee roasters
    bytes32 public constant ZK_VERIFIER_ROLE = keccak256("ZK_VERIFIER_ROLE"); // ZK proof verification
    
    // Optional roles for ecosystem (can be added later)
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE"); // Distributors (read-only)

    /* -------------------------------------------------------------------------- */
    /*                              Access Modifiers                              */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Only WAGA admins or processors can create/modify batches
     */
    modifier onlyBatchCreator() {
        if (!(hasRole(ADMIN_ROLE, msg.sender) || hasRole(PROCESSOR_ROLE, msg.sender))) {
            revert WAGAAccessControl__MustBeAdminOrProcessor_onlyBatchCreator();
        }
        _;
    }
    
    /**
     * @dev Only ZK verifiers can submit proofs
     */
    modifier onlyZKVerifier() {
        if (!hasRole(ZK_VERIFIER_ROLE, msg.sender)) {
            revert WAGAAccessControl__MustHaveZKVerifierRole_onlyZKVerifier();
        }
        _;
    }
    
    /**
     * @dev Admin-only functions
     */
    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) {
            revert WAGAAccessControl__MustBeAdmin_onlyAdmin();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Initialization                                */
    /* -------------------------------------------------------------------------- */
    
    constructor() {
        // Grant DEFAULT_ADMIN_ROLE to deployer
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        
        // Grant ADMIN_ROLE to deployer
        _grantRole(ADMIN_ROLE, msg.sender);
        
        // Deployer can also verify ZK proofs for testing
        _grantRole(ZK_VERIFIER_ROLE, msg.sender);
    }
    
    /* -------------------------------------------------------------------------- */
    /*                              Role Management                               */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Grant processor role to coffee processors
     */
    function grantProcessorRole(address processor) external onlyAdmin {
        _grantRole(PROCESSOR_ROLE, processor);
    }
    
    /**
     * @dev Grant ZK verifier role (usually to ZK contracts)
     */
    function grantZKVerifierRole(address verifier) external onlyAdmin {
        _grantRole(ZK_VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Grant distributor role for read access
     */
    function grantDistributorRole(address distributor) external onlyAdmin {
        _grantRole(DISTRIBUTOR_ROLE, distributor);
    }

    /* -------------------------------------------------------------------------- */
    /*                              SELLER REGISTRATION                           */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register a new seller with digital ID assignment
     * @param sellerAddress The Ethereum address of the seller
     * @param sellerType Type of seller (COOPERATIVE, PROCESSOR, ROASTER)
     * @param sellerName Business name of the seller
     * @param businessRegistration Ethiopian business registration number
     * @param preferredBankSwift Preferred banking partner SWIFT code
     * @return sellerId The assigned digital ID for the seller
     */
    function registerSeller(
        address sellerAddress,
        SellerType sellerType,
        string memory sellerName,
        string memory businessRegistration,
        bytes11 preferredBankSwift
    ) external onlyAdmin returns (uint64 sellerId) {
        if (sellerAddress == address(0)) {
            revert WAGAAccessControl__InvalidSellerAddress_registerSeller();
        }
        if (bytes(sellerName).length == 0) {
            revert WAGAAccessControl__InvalidSellerName_registerSeller();
        }
        if (addressToSellerId[sellerAddress] != 0) {
            revert WAGAAccessControl__SellerAlreadyRegistered_registerSeller();
        }

        sellerId = ++nextSellerId;

        sellersById[sellerId] = SellerProfile({
            sellerId: sellerId,
            sellerType: sellerType,
            sellerName: sellerName,
            businessRegistration: businessRegistration,
            contactEmail: "",
            preferredBankSwift: preferredBankSwift,
            isActive: true,
            registrationTimestamp: block.timestamp
        });

        addressToSellerId[sellerAddress] = sellerId;
        sellerIdToAddress[sellerId] = sellerAddress;

        // Grant appropriate role based on seller type
        if (sellerType == SellerType.COOPERATIVE) {
            _grantRole(COOPERATIVE_ROLE, sellerAddress);
        } else if (sellerType == SellerType.PROCESSOR) {
            _grantRole(PROCESSOR_ROLE, sellerAddress);
        } else if (sellerType == SellerType.ROASTER) {
            _grantRole(ROASTER_ROLE, sellerAddress);
        }

        emit SellerRegistered(sellerId, sellerAddress, sellerName, sellerType);
    }

    /**
     * @dev Update seller contact email
     * @param sellerId The seller's digital ID
     * @param contactEmail New contact email
     */
    function updateSellerContact(uint64 sellerId, string memory contactEmail) external {
        if (sellersById[sellerId].sellerId != sellerId) {
            revert WAGAAccessControl__SellerNotFound_updateSellerContact();
        }
        if (msg.sender != sellerIdToAddress[sellerId] && !hasRole(ADMIN_ROLE, msg.sender)) {
            revert WAGAAccessControl__UnauthorizedAccess_updateSellerContact();
        }

        sellersById[sellerId].contactEmail = contactEmail;

        emit SellerContactUpdated(sellerId, contactEmail);
    }

    /**
     * @dev Deactivate a seller account
     * @param sellerId The seller's digital ID
     */
    function deactivateSeller(uint64 sellerId) external onlyAdmin {
        if (sellersById[sellerId].sellerId != sellerId) {
            revert WAGAAccessControl__SellerNotFound_deactivateSeller();
        }

        sellersById[sellerId].isActive = false;
        address sellerAddress = sellerIdToAddress[sellerId];

        // Revoke all seller roles
        _revokeRole(COOPERATIVE_ROLE, sellerAddress);
        _revokeRole(PROCESSOR_ROLE, sellerAddress);
        _revokeRole(ROASTER_ROLE, sellerAddress);

        emit SellerDeactivated(sellerId, sellerAddress);
    }
    
    /* -------------------------------------------------------------------------- */
    /*                              View Functions                                */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Check if address can create batches
     */
    function canCreateBatches(address account) external view returns (bool) {
        return hasRole(ADMIN_ROLE, account) || hasRole(PROCESSOR_ROLE, account);
    }
    
    /**
     * @dev Check if address can verify ZK proofs
     */
    function canVerifyZKProofs(address account) external view returns (bool) {
        return hasRole(ZK_VERIFIER_ROLE, account);
    }
    
    /**
     * @dev Get user's access level for display
     */
    function getUserAccessLevel(address account) external view returns (string memory) {
        if (hasRole(ADMIN_ROLE, account)) return "Admin";
        if (hasRole(PROCESSOR_ROLE, account)) return "Processor";
        if (hasRole(ZK_VERIFIER_ROLE, account)) return "ZK Verifier";
        if (hasRole(DISTRIBUTOR_ROLE, account)) return "Distributor";
        return "Public";
    }

    /* -------------------------------------------------------------------------- */
    /*                              SELLER VIEW FUNCTIONS                        */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Get seller profile by digital ID
     * @param sellerId The seller's digital ID
     * @return sellerName Business name
     * @return businessRegistration Ethiopian business registration number
     * @return sellerType Type of seller
     * @return preferredBankSwift Preferred banking partner SWIFT code
     * @return isActive Whether seller account is active
     */
    function getSellerProfile(uint64 sellerId) external view returns (
        string memory sellerName,
        string memory businessRegistration,
        SellerType sellerType,
        bytes11 preferredBankSwift,
        bool isActive
    ) {
        SellerProfile memory seller = sellersById[sellerId];
        if (seller.sellerId != sellerId) {
            revert WAGAAccessControl__SellerNotFound_getSellerProfile();
        }

        return (
            seller.sellerName,
            seller.businessRegistration,
            seller.sellerType,
            seller.preferredBankSwift,
            seller.isActive
        );
    }

    /**
     * @dev Get seller ID by address
     * @param sellerAddress The seller's Ethereum address
     * @return sellerId The seller's digital ID (0 if not registered)
     */
    function getSellerId(address sellerAddress) external view returns (uint64 sellerId) {
        return addressToSellerId[sellerAddress];
    }

    /**
     * @dev Get seller address by digital ID
     * @param sellerId The seller's digital ID
     * @return sellerAddress The seller's Ethereum address
     */
    function getSellerAddress(uint64 sellerId) external view returns (address sellerAddress) {
        sellerAddress = sellerIdToAddress[sellerId];
        if (sellerAddress == address(0)) {
            revert WAGAAccessControl__SellerNotFound_getSellerAddress();
        }
        return sellerAddress;
    }

    /**
     * @dev Check if address is a registered seller
     * @param account The address to check
     * @return isRegistered Whether the address is registered as a seller
     */
    function isRegisteredSeller(address account) external view returns (bool isRegistered) {
        return addressToSellerId[account] != 0 && sellersById[addressToSellerId[account]].isActive;
    }

    /**
     * @dev Get next available seller ID
     * @return nextId The next seller ID that will be assigned
     */
    function getNextSellerId() external view returns (uint64 nextId) {
        return nextSellerId + 1;
    }

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event SellerRegistered(
        uint64 indexed sellerId,
        address indexed sellerAddress,
        string sellerName,
        SellerType sellerType
    );

    event SellerContactUpdated(uint64 indexed sellerId, string contactEmail);
    event SellerDeactivated(uint64 indexed sellerId, address indexed sellerAddress);
}
