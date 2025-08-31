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
    /*                              MVP Role System                               */
    /* -------------------------------------------------------------------------- */
    
    // Core Business Roles (3 roles only for MVP)
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");        // WAGA admins
    bytes32 public constant PROCESSOR_ROLE = keccak256("PROCESSOR_ROLE"); // Coffee processors
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
        require(
            hasRole(ADMIN_ROLE, msg.sender) || hasRole(PROCESSOR_ROLE, msg.sender),
            "WAGAAccessControl: Must be admin or processor"
        );
        _;
    }
    
    /**
     * @dev Only ZK verifiers can submit proofs
     */
    modifier onlyZKVerifier() {
        require(
            hasRole(ZK_VERIFIER_ROLE, msg.sender),
            "WAGAAccessControl: Must have ZK verifier role"
        );
        _;
    }
    
    /**
     * @dev Admin-only functions
     */
    modifier onlyAdmin() {
        require(
            hasRole(ADMIN_ROLE, msg.sender),
            "WAGAAccessControl: Must be admin"
        );
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
}
