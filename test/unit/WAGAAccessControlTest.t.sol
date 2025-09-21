// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {WAGAAccessControl} from "../../src/WAGAAccessControl.sol";

/**
 * @title WAGAAccessControlTest
 * @dev Comprehensive unit tests for the enhanced WAGA Access Control system
 * Tests seller registration, digital ID management, and access control
 */
contract WAGAAccessControlTest is Test {
    WAGAAccessControl public accessControl;

    // Test accounts
    address public admin = makeAddr("admin");
    address public processor = makeAddr("processor");
    address public distributor = makeAddr("distributor");
    address public seller1 = makeAddr("seller1");
    address public seller2 = makeAddr("seller2");
    address public seller3 = makeAddr("seller3");

    // Test data
    string constant SELLER_NAME_1 = "Yirgacheffe Cooperative";
    string constant BUSINESS_REG_1 = "REG001";
    string constant EMAIL_1 = "contact@yirgacheffe.com";
    string constant PHONE_1 = "+251911123456";

    string constant SELLER_NAME_2 = "Sidamo Premium Roaster";
    string constant BUSINESS_REG_2 = "REG002";
    string constant EMAIL_2 = "contact@sidamo.com";
    string constant PHONE_2 = "+251922654321";

    event SellerRegistered(uint64 indexed sellerId, address indexed sellerAddress, WAGAAccessControl.SellerType sellerType);
    event SellerProfileUpdated(uint64 indexed sellerId, string sellerName);

    function setUp() public {
        vm.startPrank(admin);
        accessControl = new WAGAAccessControl();

        // Grant roles for testing
        accessControl.grantRole(accessControl.PROCESSOR_ROLE(), processor);
        accessControl.grantRole(accessControl.DISTRIBUTOR_ROLE(), distributor);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           SELLER REGISTRATION TESTS                       */
    /* -------------------------------------------------------------------------- */

    function test_SellerRegistration_SuccessfulRegistration() public {
        vm.startPrank(processor);

        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit SellerRegistered(1, seller1, WAGAAccessControl.SellerType.COOPERATIVE);

        // Register seller
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        // Verify seller ID assignment
        uint64 sellerId = accessControl.getSellerId(seller1);
        assertEq(sellerId, 1, "First seller should have ID 1");

        // Verify seller is registered
        assertTrue(accessControl.isRegisteredSeller(seller1), "Seller should be registered");

        // Verify bidirectional mapping
        address retrievedAddress = accessControl.getSellerAddress(sellerId);
        assertEq(retrievedAddress, seller1, "Bidirectional mapping should work");

        vm.stopPrank();
    }

    function test_SellerRegistration_MultipleSellers() public {
        vm.startPrank(processor);

        // Register first seller
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        // Register second seller
        vm.expectEmit(true, true, false, true);
        emit SellerRegistered(2, seller2, WAGAAccessControl.SellerType.PROCESSOR);

        accessControl.registerSeller(
            seller2,
            WAGAAccessControl.SellerType.PROCESSOR,
            SELLER_NAME_2,
            BUSINESS_REG_2,
            EMAIL_2,
            PHONE_2
        );

        // Verify IDs are unique and incremental
        assertEq(accessControl.getSellerId(seller1), 1);
        assertEq(accessControl.getSellerId(seller2), 2);
        assertEq(accessControl.getTotalSellers(), 2);

        vm.stopPrank();
    }

    function test_SellerRegistration_AllSellerTypes() public {
        vm.startPrank(processor);

        // Test COOPERATIVE
        accessControl.registerSeller(seller1, WAGAAccessControl.SellerType.COOPERATIVE, "Coop", "REG1", "email1", "phone1");
        WAGAAccessControl.SellerProfile memory profile1 = accessControl.getSellerProfile(seller1);
        assertEq(uint8(profile1.sellerType), uint8(WAGAAccessControl.SellerType.COOPERATIVE));

        // Test PROCESSOR
        accessControl.registerSeller(seller2, WAGAAccessControl.SellerType.PROCESSOR, "Proc", "REG2", "email2", "phone2");
        WAGAAccessControl.SellerProfile memory profile2 = accessControl.getSellerProfile(seller2);
        assertEq(uint8(profile2.sellerType), uint8(WAGAAccessControl.SellerType.PROCESSOR));

        // Test ROASTER
        accessControl.registerSeller(seller3, WAGAAccessControl.SellerType.ROASTER, "Roast", "REG3", "email3", "phone3");
        WAGAAccessControl.SellerProfile memory profile3 = accessControl.getSellerProfile(seller3);
        assertEq(uint8(profile3.sellerType), uint8(WAGAAccessControl.SellerType.ROASTER));

        vm.stopPrank();
    }

    function test_SellerRegistration_ProfileDataIntegrity() public {
        vm.startPrank(processor);

        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        WAGAAccessControl.SellerProfile memory profile = accessControl.getSellerProfile(seller1);

        assertEq(profile.sellerId, 1);
        assertEq(uint8(profile.sellerType), uint8(WAGAAccessControl.SellerType.COOPERATIVE));
        assertEq(profile.sellerName, SELLER_NAME_1);
        assertEq(profile.businessRegistration, BUSINESS_REG_1);
        assertEq(profile.contactEmail, EMAIL_1);
        assertEq(profile.contactPhone, PHONE_1);
        assertTrue(profile.isActive);
        assertGt(profile.registrationTimestamp, 0);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          SELLER REGISTRATION ERRORS                       */
    /* -------------------------------------------------------------------------- */

    function test_SellerRegistration_RevertIfAlreadyRegistered() public {
        vm.startPrank(processor);

        // Register seller first time
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        // Attempt to register same seller again
        vm.expectRevert("Seller already registered");
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.PROCESSOR,
            "Different Name",
            "REG002",
            "different@email.com",
            "+123456789"
        );

        vm.stopPrank();
    }

    function test_SellerRegistration_RevertIfEmptyName() public {
        vm.startPrank(processor);

        vm.expectRevert("Seller name cannot be empty");
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            "", // Empty name
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        vm.stopPrank();
    }

    function test_SellerRegistration_RevertIfEmptyBusinessReg() public {
        vm.startPrank(processor);

        vm.expectRevert("Business registration cannot be empty");
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            "", // Empty business registration
            EMAIL_1,
            PHONE_1
        );

        vm.stopPrank();
    }

    function test_SellerRegistration_RevertIfUnauthorized() public {
        // Try to register without PROCESSOR_ROLE
        vm.startPrank(seller1); // Random user without role

        vm.expectRevert("Caller does not have required role");
        accessControl.registerSeller(
            seller2,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           SELLER PROFILE MANAGEMENT                       */
    /* -------------------------------------------------------------------------- */

    function test_SellerProfile_UpdateContactInfo() public {
        vm.startPrank(processor);

        // Register seller
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        uint64 sellerId = accessControl.getSellerId(seller1);

        // Update contact info
        vm.expectEmit(true, false, false, true);
        emit SellerProfileUpdated(sellerId, SELLER_NAME_1);

        accessControl.updateSellerContact(sellerId, "new@email.com", "+987654321");

        // Verify update
        WAGAAccessControl.SellerProfile memory profile = accessControl.getSellerProfile(sellerId);
        assertEq(profile.contactEmail, "new@email.com");
        assertEq(profile.contactPhone, "+987654321");

        vm.stopPrank();
    }

    function test_SellerProfile_UpdateContactUnauthorized() public {
        vm.startPrank(processor);

        // Register seller
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        uint64 sellerId = accessControl.getSellerId(seller1);

        vm.stopPrank();

        // Try to update from unauthorized account
        vm.startPrank(seller2);

        vm.expectRevert("Unauthorized: Must be seller or admin");
        accessControl.updateSellerContact(sellerId, "new@email.com", "+987654321");

        vm.stopPrank();
    }

    function test_SellerProfile_GetByAddress() public {
        vm.startPrank(processor);

        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        WAGAAccessControl.SellerProfile memory profile = accessControl.getSellerProfileByAddress(seller1);

        assertEq(profile.sellerId, 1);
        assertEq(profile.sellerName, SELLER_NAME_1);
        assertEq(profile.businessRegistration, BUSINESS_REG_1);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                          DIGITAL ID SYSTEM TESTS                          */
    /* -------------------------------------------------------------------------- */

    function test_DigitalId_UniqueIncrementalAssignment() public {
        vm.startPrank(processor);

        // Register multiple sellers
        accessControl.registerSeller(seller1, WAGAAccessControl.SellerType.COOPERATIVE, "Seller1", "REG1", "email1", "phone1");
        accessControl.registerSeller(seller2, WAGAAccessControl.SellerType.PROCESSOR, "Seller2", "REG2", "email2", "phone2");
        accessControl.registerSeller(seller3, WAGAAccessControl.SellerType.ROASTER, "Seller3", "REG3", "email3", "phone3");

        // Verify unique IDs
        assertEq(accessControl.getSellerId(seller1), 1);
        assertEq(accessControl.getSellerId(seller2), 2);
        assertEq(accessControl.getSellerId(seller3), 3);

        // Verify reverse lookups
        assertEq(accessControl.getSellerAddress(1), seller1);
        assertEq(accessControl.getSellerAddress(2), seller2);
        assertEq(accessControl.getSellerAddress(3), seller3);

        vm.stopPrank();
    }

    function test_DigitalId_NonExistentSeller() public {
        // Non-registered seller should return 0
        assertEq(accessControl.getSellerId(seller1), 0);
        assertEq(accessControl.getSellerAddress(999), address(0));
        assertFalse(accessControl.isRegisteredSeller(seller1));
    }

    function test_DigitalId_TotalSellersCounter() public {
        vm.startPrank(processor);

        assertEq(accessControl.getTotalSellers(), 0);

        accessControl.registerSeller(seller1, WAGAAccessControl.SellerType.COOPERATIVE, "Seller1", "REG1", "email1", "phone1");
        assertEq(accessControl.getTotalSellers(), 1);

        accessControl.registerSeller(seller2, WAGAAccessControl.SellerType.PROCESSOR, "Seller2", "REG2", "email2", "phone2");
        assertEq(accessControl.getTotalSellers(), 2);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                           ACCESS CONTROL TESTS                            */
    /* -------------------------------------------------------------------------- */

    function test_AccessControl_InheritedRolesStillWork() public {
        // Test that inherited access control functionality still works
        vm.startPrank(admin);

        // Grant distributor role
        accessControl.grantRole(accessControl.DISTRIBUTOR_ROLE(), seller1);

        // Verify role
        assertTrue(accessControl.hasRole(accessControl.DISTRIBUTOR_ROLE(), seller1));

        vm.stopPrank();
    }

    function test_AccessControl_GetUserAccessLevel() public {
        vm.startPrank(admin);

        // Grant roles
        accessControl.grantRole(accessControl.PROCESSOR_ROLE(), processor);
        accessControl.grantRole(accessControl.DISTRIBUTOR_ROLE(), distributor);

        // Register seller
        vm.startPrank(processor);
        accessControl.registerSeller(seller1, WAGAAccessControl.SellerType.COOPERATIVE, "Seller", "REG", "email", "phone");
        vm.stopPrank();

        // Test access levels
        assertEq(accessControl.getUserAccessLevel(admin), "Admin");
        assertEq(accessControl.getUserAccessLevel(processor), "Processor");
        assertEq(accessControl.getUserAccessLevel(distributor), "Distributor");
        assertEq(accessControl.getUserAccessLevel(seller1), "Public"); // Registered sellers don't get special access level

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              EDGE CASE TESTS                              */
    /* -------------------------------------------------------------------------- */

    function test_EdgeCase_ZeroAddressRegistration() public {
        vm.startPrank(processor);

        vm.expectRevert("Invalid seller address");
        accessControl.registerSeller(
            address(0),
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        vm.stopPrank();
    }

    function test_EdgeCase_LongStrings() public {
        vm.startPrank(processor);

        string memory longName = "This is a very long seller name that exceeds normal limits to test string handling";
        string memory longEmail = "verylongemailaddress@verylongdomainname.com";
        string memory longPhone = "+123456789012345678901234567890";

        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            longName,
            BUSINESS_REG_1,
            longEmail,
            longPhone
        );

        WAGAAccessControl.SellerProfile memory profile = accessControl.getSellerProfile(seller1);
        assertEq(profile.sellerName, longName);
        assertEq(profile.contactEmail, longEmail);
        assertEq(profile.contactPhone, longPhone);

        vm.stopPrank();
    }

    function test_EdgeCase_SpecialCharacters() public {
        vm.startPrank(processor);

        string memory specialName = "Yirgacheffe Cafe & Cooperative";
        string memory specialEmail = "contact@yirgacheffe.cafe+tag@domain.com";
        string memory specialPhone = "+251-911-123-456";

        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            specialName,
            BUSINESS_REG_1,
            specialEmail,
            specialPhone
        );

        WAGAAccessControl.SellerProfile memory profile = accessControl.getSellerProfile(seller1);
        assertEq(profile.sellerName, specialName);
        assertEq(profile.contactEmail, specialEmail);
        assertEq(profile.contactPhone, specialPhone);

        vm.stopPrank();
    }

    /* -------------------------------------------------------------------------- */
    /*                              INTEGRATION TESTS                            */
    /* -------------------------------------------------------------------------- */

    function test_Integration_FullSellerLifecycle() public {
        vm.startPrank(processor);

        // 1. Register seller
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        uint64 sellerId = accessControl.getSellerId(seller1);
        assertEq(sellerId, 1);
        assertTrue(accessControl.isRegisteredSeller(seller1));

        // 2. Update contact info
        accessControl.updateSellerContact(sellerId, "updated@email.com", "+000000000");

        // 3. Verify all profile data
        WAGAAccessControl.SellerProfile memory profile = accessControl.getSellerProfile(sellerId);
        assertEq(profile.sellerName, SELLER_NAME_1);
        assertEq(profile.contactEmail, "updated@email.com");
        assertEq(profile.contactPhone, "+000000000");
        assertTrue(profile.isActive);

        // 4. Verify bidirectional mappings
        assertEq(accessControl.getSellerAddress(sellerId), seller1);
        assertEq(accessControl.getSellerId(accessControl.getSellerAddress(sellerId)), sellerId);

        vm.stopPrank();
    }

    function test_GasOptimization_DigitalIdVsAddress() public {
        vm.startPrank(processor);

        // Register seller to get ID
        accessControl.registerSeller(
            seller1,
            WAGAAccessControl.SellerType.COOPERATIVE,
            SELLER_NAME_1,
            BUSINESS_REG_1,
            EMAIL_1,
            PHONE_1
        );

        uint64 sellerId = accessControl.getSellerId(seller1);

        // Measure gas for ID-based lookup
        uint256 gasStart = gasleft();
        address addrFromId = accessControl.getSellerAddress(sellerId);
        uint256 gasUsedIdLookup = gasStart - gasleft();

        // Measure gas for address-based lookup
        gasStart = gasleft();
        uint64 idFromAddr = accessControl.getSellerId(seller1);
        uint256 gasUsedAddrLookup = gasStart - gasleft();

        // ID-based lookup should be more gas efficient for repeated operations
        console.log("Gas used for ID->Address lookup:", gasUsedIdLookup);
        console.log("Gas used for Address->ID lookup:", gasUsedAddrLookup);

        // Both should return correct values
        assertEq(addrFromId, seller1);
        assertEq(idFromAddr, sellerId);

        vm.stopPrank();
    }
}
