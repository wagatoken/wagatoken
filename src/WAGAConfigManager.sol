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

    address private s_inventoryManager;
    address private s_redemptionManager;
    address private s_proofOfReserveManager;
    address private immutable i_owner;

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

    constructor() Ownable(msg.sender) {
        i_owner = msg.sender;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // Grant DEFAULT_ADMIN_ROLE first
        _grantRole(ADMIN_ROLE, msg.sender);
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
            revert WAGAConfigManager__InvalidRedemptionContractAddress_setRedemptionContract();
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
}
