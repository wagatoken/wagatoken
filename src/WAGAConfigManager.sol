// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract WAGAConfigManager is AccessControl, Ownable {
    /* -------------------------------------------------------------------------- */
    /*                                   Errors                                   */
    /* -------------------------------------------------------------------------- */
    error WAGAConfigManager__InvalidInventoryManagerAddress_setInventoryManager();
    error WAGAConfigManager__InvalidRedemptionContractAddress_setRedemptionContract();
    error WAGAConfigManager__InvalidProofOfReserveManagerAddress_setProofOfReserveManager();
    
    // Seller registration errors
    error WAGAConfigManager__InvalidSellerAddress_registerSeller();
    error WAGAConfigManager__InvalidSellerName_registerSeller();
    error WAGAConfigManager__SellerAlreadyRegistered_registerSeller();
    error WAGAConfigManager__SellerNotFound_updateSellerContact();
    error WAGAConfigManager__UnauthorizedAccess_updateSellerContact();
    error WAGAConfigManager__SellerNotFound_deactivateSeller();
    error WAGAConfigManager__SellerNotFound_getSellerProfile();
    error WAGAConfigManager__SellerNotFound_getSellerAddress();
    error WAGAConfigManager__MustBeAdminOrProcessor_onlyBatchCreator();
    error WAGAConfigManager__MustHaveZKVerifierRole_onlyZKVerifier();
    error WAGAConfigManager__MustBeAdmin_onlyAdmin();

    /* -------------------------------------------------------------------------- */
    /*                               STATE VARIABLES                              */
    /* -------------------------------------------------------------------------- */

    // Role definitions

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant INVENTORY_MANAGER_ROLE =
        keccak256("INVENTORY_MANAGER_ROLE");
    bytes32 public constant REDEMPTION_ROLE = keccak256("REDEMPTION_ROLE");
    bytes32 public constant PROOF_OF_RESERVE_ROLE =
        keccak256("PROOF_OF_RESERVE_ROLE");

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant FULFILLER_ROLE = keccak256("FULFILLER_ROLE");
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE");
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");

    // New roles for expanded product lines
    bytes32 public constant COOPERATIVE_ROLE = keccak256("COOPERATIVE_ROLE");
    bytes32 public constant ROASTER_ROLE = keccak256("ROASTER_ROLE");
    
    // ZK and Privacy related roles
    bytes32 public constant ZK_ADMIN_ROLE = keccak256("ZK_ADMIN_ROLE");
    bytes32 public constant PRIVACY_ADMIN_ROLE = keccak256("PRIVACY_ADMIN_ROLE");
    bytes32 public constant DATA_MANAGER_ROLE = keccak256("DATA_MANAGER_ROLE");
    bytes32 public constant COMPETITIVE_ADMIN_ROLE = keccak256("COMPETITIVE_ADMIN_ROLE");
    bytes32 public constant MARKET_ANALYST_ROLE = keccak256("MARKET_ANALYST_ROLE");
    bytes32 public constant COMPLIANCE_VERIFIER_ROLE = keccak256("COMPLIANCE_VERIFIER_ROLE");
    bytes32 public constant QUALITY_ASSESSOR_ROLE = keccak256("QUALITY_ASSESSOR_ROLE");
    bytes32 public constant CERTIFICATION_VERIFIER_ROLE = keccak256("CERTIFICATION_VERIFIER_ROLE");
    
    // Additional roles from consolidated access control
    bytes32 public constant ZK_VERIFIER_ROLE = keccak256("ZK_VERIFIER_ROLE"); // ZK proof verification
    
    // Ethiopian Compliance roles
    bytes32 public constant COMPLIANCE_MANAGER_ROLE = keccak256("COMPLIANCE_MANAGER_ROLE");
    bytes32 public constant ORIGIN_VERIFIER_ROLE = keccak256("ORIGIN_VERIFIER_ROLE");
    bytes32 public constant QUALITY_INSPECTOR_ROLE = keccak256("QUALITY_INSPECTOR_ROLE");
    bytes32 public constant BANKING_PARTNER_ROLE = keccak256("BANKING_PARTNER_ROLE");
    
    // Price Oracle roles
    bytes32 public constant PRICE_UPDATER_ROLE = keccak256("PRICE_UPDATER_ROLE");
    bytes32 public constant PRICING_VIEWER_ROLE = keccak256("PRICING_VIEWER_ROLE");
    
    // Treasury and Payment roles
    bytes32 public constant PAYMENT_PROCESSOR_ROLE = keccak256("PAYMENT_PROCESSOR_ROLE");
    bytes32 public constant OFFRAMP_EXECUTOR_ROLE = keccak256("OFFRAMP_EXECUTOR_ROLE");
    
    // CDP Integration roles
    bytes32 public constant CDP_ADMIN_ROLE = keccak256("CDP_ADMIN_ROLE");
    bytes32 public constant PAYMENT_HANDLER_ROLE = keccak256("PAYMENT_HANDLER_ROLE");

    address private s_inventoryManager;
    address private s_redemptionManager;
    address private s_proofOfReserveManager;
    address private immutable i_owner;

    /* -------------------------------------------------------------------------- */
    /*                           SELLER REGISTRATION SYSTEM                       */
    /* -------------------------------------------------------------------------- */

    struct SellerProfile {
        uint64 sellerId;                    // Digital ID (8 bytes vs 20 bytes)
        SellerType sellerType;              // COOPERATIVE, PROCESSOR, ROASTER
        string sellerName;
        string businessRegistration;        // Ethiopian business registration
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
    /*                                   Events                                   */
    /* -------------------------------------------------------------------------- */
    event InventoryManagerUpdated(
        address indexed newInventoryManager,
        address indexed updatedBy
    );
    event RedemptionMangerUpdated(
        address indexed newRedemptionManager,
        address indexed updatedBy
    );
    event ProofOfReserveManagerUpdated(
        address indexed newProofOfReserveManager,
        address indexed updatedBy
    );
    event CoffeeTokenUpdated(
        address indexed newCoffeeToken,
        address indexed updatedBy
    );

    // Seller registration events
    event SellerRegistered(
        uint64 indexed sellerId,
        address indexed sellerAddress,
        string sellerName,
        SellerType sellerType
    );
    event SellerContactUpdated(uint64 indexed sellerId, string contactEmail);
    event SellerDeactivated(uint64 indexed sellerId, address indexed sellerAddress);

    constructor() Ownable(msg.sender) {
        i_owner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant DEFAULT_ADMIN_ROLE first
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(ZK_VERIFIER_ROLE, msg.sender); // Deployer can verify ZK proofs for testing
    }

    /* -------------------------------------------------------------------------- */
    /*                              ACCESS MODIFIERS                              */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Only WAGA admins or processors can create/modify batches
     */
    modifier onlyBatchCreator() virtual {
        if (!(hasRole(ADMIN_ROLE, msg.sender) || hasRole(PROCESSOR_ROLE, msg.sender))) {
            revert WAGAConfigManager__MustBeAdminOrProcessor_onlyBatchCreator();
        }
        _;
    }
    
    /**
     * @dev Only ZK verifiers can submit proofs
     */
    modifier onlyZKVerifier() {
        if (!hasRole(ZK_VERIFIER_ROLE, msg.sender)) {
            revert WAGAConfigManager__MustHaveZKVerifierRole_onlyZKVerifier();
        }
        _;
    }
    
    /**
     * @dev Admin-only functions
     */
    modifier onlyAdmin() {
        if (!hasRole(ADMIN_ROLE, msg.sender)) {
            revert WAGAConfigManager__MustBeAdmin_onlyAdmin();
        }
        _;
    }

    /* -------------------------------------------------------------------------- */
    /*                              Public Functions                              */
    /* -------------------------------------------------------------------------- */
    /**
     * @notice Sets or updates the inventory manager address
     * @param _inventoryManager New inventory manager address
     */
    function setInventoryManager(
        address _inventoryManager
    ) public onlyRole(ADMIN_ROLE) {
        if (_inventoryManager == address(0)) {
            revert WAGAConfigManager__InvalidInventoryManagerAddress_setInventoryManager();
        }
        if (s_inventoryManager != address(0)) {
            _revokeRole(INVENTORY_MANAGER_ROLE, s_inventoryManager);
        }
        s_inventoryManager = _inventoryManager;
        _grantRole(INVENTORY_MANAGER_ROLE, _inventoryManager);
        emit InventoryManagerUpdated(_inventoryManager, msg.sender);
    }

    /**
     * @notice Sets or updates the redemption contract address
     * @param _redemptionContract New redemption contract address
     */

    function setRedemptionManager(
        address _redemptionContract
    ) public onlyRole(ADMIN_ROLE) {
        if (_redemptionContract == address(0)) {
            revert WAGAConfigManager__InvalidRedemptionContractAddress_setRedemptionContract();
        }
        if (s_redemptionManager != address(0)) {
            _revokeRole(REDEMPTION_ROLE, s_redemptionManager);
        }
        s_redemptionManager = _redemptionContract;
        _grantRole(REDEMPTION_ROLE, _redemptionContract);
        emit RedemptionMangerUpdated(_redemptionContract, msg.sender);
    }

    /**
     * @notice Sets or updates the proof of reserve manager address
     * @param _proofOfReserveManager New proof of reserve manager address
     */
    function setProofOfReserveManager(
        address _proofOfReserveManager
    ) public onlyRole(ADMIN_ROLE) {
        if (_proofOfReserveManager == address(0)) {
            revert WAGAConfigManager__InvalidProofOfReserveManagerAddress_setProofOfReserveManager();
        }
        if (s_proofOfReserveManager != address(0)) {
            _revokeRole(PROOF_OF_RESERVE_ROLE, s_proofOfReserveManager);
        }
        s_proofOfReserveManager = _proofOfReserveManager;
        _grantRole(PROOF_OF_RESERVE_ROLE, _proofOfReserveManager);
        _grantRole(MINTER_ROLE, _proofOfReserveManager);
        emit ProofOfReserveManagerUpdated(_proofOfReserveManager, msg.sender);
    }

    /* -------------------------------------------------------------------------- */
    /*                                   Getters                                  */
    /* -------------------------------------------------------------------------- */

    function getInventoryManager() external view returns (address) {
        return s_inventoryManager;
    }

    /**
     * @notice Returns the redemption manager address
     * @return Current redemption manager address
     */
    function getRedemptionManager() external view returns (address) {
        return s_redemptionManager;
    }

    function getProofOfReserveManager() external view returns (address) {
        return s_proofOfReserveManager;
    }

    /* -------------------------------------------------------------------------- */
    /*                           ROLE MANAGEMENT FUNCTIONS                        */
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
    /*                        COMPLIANCE ROLE MANAGEMENT FUNCTIONS                */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Grant compliance manager role for Ethiopian export compliance
     */
    function grantComplianceManagerRole(address manager) external onlyAdmin {
        _grantRole(COMPLIANCE_MANAGER_ROLE, manager);
    }
    
    /**
     * @dev Grant origin verifier role for coffee origin verification
     */
    function grantOriginVerifierRole(address verifier) external onlyAdmin {
        _grantRole(ORIGIN_VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Grant quality inspector role for coffee quality assessment
     */
    function grantQualityInspectorRole(address inspector) external onlyAdmin {
        _grantRole(QUALITY_INSPECTOR_ROLE, inspector);
    }
    
    /**
     * @dev Grant banking partner role for Ethiopian banking integration
     */
    function grantBankingPartnerRole(address bank) external onlyAdmin {
        _grantRole(BANKING_PARTNER_ROLE, bank);
    }

    /* -------------------------------------------------------------------------- */
    /*                         PAYMENT ROLE MANAGEMENT FUNCTIONS                  */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Grant CDP admin role for Coinbase Developer Platform administration
     */
    function grantCDPAdminRole(address admin) external onlyAdmin {
        _grantRole(CDP_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Grant payment handler role for CDP payment processing
     */
    function grantPaymentHandlerRole(address handler) external onlyAdmin {
        _grantRole(PAYMENT_HANDLER_ROLE, handler);
    }
    
    /**
     * @dev Grant payment processor role for treasury operations
     */
    function grantPaymentProcessorRole(address processor) external onlyAdmin {
        _grantRole(PAYMENT_PROCESSOR_ROLE, processor);
    }
    
    /**
     * @dev Grant offramp executor role for fiat currency offramp operations
     */
    function grantOfframpExecutorRole(address executor) external onlyAdmin {
        _grantRole(OFFRAMP_EXECUTOR_ROLE, executor);
    }

    /* -------------------------------------------------------------------------- */
    /*                         ORACLE ROLE MANAGEMENT FUNCTIONS                   */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Grant price updater role for ECX price oracle updates
     */
    function grantPriceUpdaterRole(address updater) external onlyAdmin {
        _grantRole(PRICE_UPDATER_ROLE, updater);
    }
    
    /**
     * @dev Grant pricing viewer role for price data access
     */
    function grantPricingViewerRole(address viewer) external onlyAdmin {
        _grantRole(PRICING_VIEWER_ROLE, viewer);
    }

    /* -------------------------------------------------------------------------- */
    /*                         SYSTEM ROLE MANAGEMENT FUNCTIONS                   */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Grant verifier role for general verification operations
     */
    function grantVerifierRole(address verifier) external onlyAdmin {
        _grantRole(VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Grant fulfiller role for order fulfillment operations
     */
    function grantFulfillerRole(address fulfiller) external onlyAdmin {
        _grantRole(FULFILLER_ROLE, fulfiller);
    }

    /* -------------------------------------------------------------------------- */
    /*                      ADVANCED ROLE MANAGEMENT FUNCTIONS                    */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Grant ZK admin role for zero-knowledge system administration
     */
    function grantZKAdminRole(address admin) external onlyAdmin {
        _grantRole(ZK_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Grant privacy admin role for privacy layer administration
     */
    function grantPrivacyAdminRole(address admin) external onlyAdmin {
        _grantRole(PRIVACY_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Grant data manager role for data management operations
     */
    function grantDataManagerRole(address manager) external onlyAdmin {
        _grantRole(DATA_MANAGER_ROLE, manager);
    }
    
    /**
     * @dev Grant competitive admin role for competitive data access
     */
    function grantCompetitiveAdminRole(address admin) external onlyAdmin {
        _grantRole(COMPETITIVE_ADMIN_ROLE, admin);
    }
    
    /**
     * @dev Grant market analyst role for market analysis operations
     */
    function grantMarketAnalystRole(address analyst) external onlyAdmin {
        _grantRole(MARKET_ANALYST_ROLE, analyst);
    }
    
    /**
     * @dev Grant compliance verifier role for general compliance verification
     */
    function grantComplianceVerifierRole(address verifier) external onlyAdmin {
        _grantRole(COMPLIANCE_VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Grant quality assessor role for quality assessment operations
     */
    function grantQualityAssessorRole(address assessor) external onlyAdmin {
        _grantRole(QUALITY_ASSESSOR_ROLE, assessor);
    }
    
    /**
     * @dev Grant certification verifier role for certification verification
     */
    function grantCertificationVerifierRole(address verifier) external onlyAdmin {
        _grantRole(CERTIFICATION_VERIFIER_ROLE, verifier);
    }

    /* -------------------------------------------------------------------------- */
    /*                         ROLE REVOCATION FUNCTIONS                          */
    /* -------------------------------------------------------------------------- */
    
    /**
     * @dev Revoke any role from an address (emergency function)
     * @param role The role to revoke
     * @param account The account to revoke the role from
     */
    function revokeRole(bytes32 role, address account) public override onlyAdmin {
        _revokeRole(role, account);
    }
    
    /**
     * @dev Batch revoke multiple roles from an address
     * @param roles Array of roles to revoke
     * @param account The account to revoke roles from
     */
    function batchRevokeRoles(bytes32[] calldata roles, address account) external onlyAdmin {
        for (uint256 i = 0; i < roles.length; i++) {
            _revokeRole(roles[i], account);
        }
    }

    /* -------------------------------------------------------------------------- */
    /*                           SELLER REGISTRATION FUNCTIONS                    */
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
            revert WAGAConfigManager__InvalidSellerAddress_registerSeller();
        }
        if (bytes(sellerName).length == 0) {
            revert WAGAConfigManager__InvalidSellerName_registerSeller();
        }
        if (addressToSellerId[sellerAddress] != 0) {
            revert WAGAConfigManager__SellerAlreadyRegistered_registerSeller();
        }

        sellerId = ++nextSellerId;

        sellersById[sellerId] = SellerProfile({
            sellerId: sellerId,
            sellerType: sellerType,
            sellerName: sellerName,
            businessRegistration: businessRegistration,
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
     * @dev Get seller ID from address
     * @param sellerAddress The seller's Ethereum address
     * @return sellerId The seller's digital ID
     */
    function getSellerId(address sellerAddress) external view returns (uint64 sellerId) {
        return addressToSellerId[sellerAddress];
    }

    /**
     * @dev Get seller address from ID
     * @param sellerId The seller's digital ID
     * @return sellerAddress The seller's Ethereum address
     */
    function getSellerAddress(uint64 sellerId) external view returns (address sellerAddress) {
        if (sellersById[sellerId].sellerId != sellerId) {
            revert WAGAConfigManager__SellerNotFound_getSellerAddress();
        }
        return sellerIdToAddress[sellerId];
    }

    /**
     * @dev Get seller profile
     * @param sellerId The seller's digital ID
     * @return profile The seller's profile information
     */
    function getSellerProfile(uint64 sellerId) external view returns (SellerProfile memory profile) {
        if (sellersById[sellerId].sellerId != sellerId) {
            revert WAGAConfigManager__SellerNotFound_getSellerProfile();
        }
        return sellersById[sellerId];
    }

    /**
     * @dev Check if address is registered seller
     * @param account The address to check
     * @return isRegistered True if the address is a registered seller
     */
    function isRegisteredSeller(address account) external view returns (bool isRegistered) {
        return addressToSellerId[account] != 0;
    }

    /**
     * @dev Deactivate a seller account
     * @param sellerId The seller's digital ID
     */
    function deactivateSeller(uint64 sellerId) external onlyAdmin {
        if (sellersById[sellerId].sellerId != sellerId) {
            revert WAGAConfigManager__SellerNotFound_deactivateSeller();
        }

        sellersById[sellerId].isActive = false;
        address sellerAddress = sellerIdToAddress[sellerId];

        emit SellerDeactivated(sellerId, sellerAddress);
    }
}
