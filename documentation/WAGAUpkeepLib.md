```solidity

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

/**
 * @title WAGAUpkeepLib
 * @dev Library for classifying and handling batch upkeep types
 */
library WAGAUpkeepLib {
    uint8 internal constant UPKEEP_EXPIRY_CHECK = 1;
    uint8 internal constant UPKEEP_INVENTORY_AUDIT = 2;
    uint8 internal constant UPKEEP_VERIFICATION_CHECK = 3;
    uint8 internal constant UPKEEP_LOW_INVENTORY_CHECK = 4;
    uint8 internal constant UPKEEP_LONG_STORAGE_CHECK = 5;

    /**
     * @dev Returns the name of the upkeep type
     * @param upkeepType The upkeep type identifier
     * @return The name of the upkeep type
     */
    function getUpkeepName(uint8 upkeepType) internal pure returns (string memory) {
        if (upkeepType == UPKEEP_EXPIRY_CHECK) return "Expiry Check";
        if (upkeepType == UPKEEP_INVENTORY_AUDIT) return "Inventory Audit";
        if (upkeepType == UPKEEP_VERIFICATION_CHECK) return "Verification Check";
        if (upkeepType == UPKEEP_LOW_INVENTORY_CHECK) return "Low Inventory Check";
        if (upkeepType == UPKEEP_LONG_STORAGE_CHECK) return "Long Storage Check";
        return "Unknown";
    }

    /**
     * @dev Determines if the upkeep type is critical
     * @param upkeepType The upkeep type identifier
     * @return True if the upkeep type is critical, false otherwise
     */
    function isCritical(uint8 upkeepType) internal pure returns (bool) {
        return upkeepType == UPKEEP_EXPIRY_CHECK || upkeepType == UPKEEP_VERIFICATION_CHECK;
    }

    /**
     * @dev Returns the priority of the upkeep type
     * @param upkeepType The upkeep type identifier
     * @return The priority of the upkeep type (lower is higher priority)
     */
    function priority(uint8 upkeepType) internal pure returns (uint8) {
        if (upkeepType == UPKEEP_EXPIRY_CHECK) return 1;
        if (upkeepType == UPKEEP_VERIFICATION_CHECK) return 2;
        if (upkeepType == UPKEEP_LOW_INVENTORY_CHECK) return 3;
        if (upkeepType == UPKEEP_LONG_STORAGE_CHECK) return 4;
        if (upkeepType == UPKEEP_INVENTORY_AUDIT) return 5;
        return 255; // Unknown = lowest priority
    }
}

```