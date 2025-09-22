// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IWAGAAccessControl
 * @dev Interface for WAGA access control and seller management
 */
interface IWAGAAccessControl {
    /* -------------------------------------------------------------------------- */
    /*                                   STRUCTS                                  */
    /* -------------------------------------------------------------------------- */

    struct SellerProfile {
        uint64 sellerId;
        SellerType sellerType;
        string sellerName;
        string businessRegistration;
        string contactEmail;
        bytes11 preferredBankSwift;
        uint256 registrationTimestamp;
        bool isActive;
    }

    enum SellerType {
        COOPERATIVE,
        PROCESSOR,
        ROASTER
    }

    /* -------------------------------------------------------------------------- */
    /*                                   EVENTS                                   */
    /* -------------------------------------------------------------------------- */

    event SellerRegistered(uint64 indexed sellerId, address indexed sellerAddress, SellerType sellerType);
    event SellerProfileUpdated(uint64 indexed sellerId, string sellerName);

    /* -------------------------------------------------------------------------- */
    /*                              SELLER MANAGEMENT FUNCTIONS                  */
    /* -------------------------------------------------------------------------- */

    /**
     * @dev Register a new seller with digital ID assignment
     * @param sellerAddress The Ethereum address of the seller
     * @param sellerType Type of seller (COOPERATIVE, PROCESSOR, ROASTER)
     * @param sellerName Business name of the seller
     * @param businessRegistration Business registration details
     * @param preferredBankSwift Preferred banking partner SWIFT code
     */
    function registerSeller(
        address sellerAddress,
        SellerType sellerType,
        string memory sellerName,
        string memory businessRegistration,
        bytes11 preferredBankSwift
    ) external returns (uint64 sellerId);

    /**
     * @dev Get seller ID from address
     * @param sellerAddress Seller's Ethereum address
     * @return sellerId Digital seller ID
     */
    function getSellerId(address sellerAddress) external view returns (uint64 sellerId);

    /**
     * @dev Get seller address from ID
     * @param sellerId Digital seller ID
     * @return sellerAddress Seller's Ethereum address
     */
    function getSellerAddress(uint64 sellerId) external view returns (address sellerAddress);

    /**
     * @dev Get seller profile by ID
     * @param sellerId Digital seller ID
     * @return profile Seller profile struct
     */
    function getSellerProfile(uint64 sellerId) external view returns (SellerProfile memory profile);

    /**
     * @dev Get seller profile by address
     * @param sellerAddress Seller's Ethereum address
     * @return profile Seller profile struct
     */
    function getSellerProfileByAddress(address sellerAddress) external view returns (SellerProfile memory profile);

    /**
     * @dev Check if address is a registered seller
     * @param account Address to check
     * @return True if registered seller
     */
    function isRegisteredSeller(address account) external view returns (bool);

    /**
     * @dev Update seller contact information
     * @param sellerId Digital seller ID
     * @param contactEmail New contact email
     */
    function updateSellerContact(uint64 sellerId, string memory contactEmail) external;

    /**
     * @dev Get total number of registered sellers
     * @return Total number of sellers
     */
    function getTotalSellers() external view returns (uint64);
}
