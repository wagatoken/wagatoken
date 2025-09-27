// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";
import {IZKVerifier} from "../../src/Interfaces/IZKVerifier.sol";

/**
 * @title WAGACoffeeRedemptionStreamlinedTest
 * @dev Streamlined unit tests for coffee redemption functionality
 */
contract WAGACoffeeRedemptionStreamlinedTest is BaseWAGATest {

    uint256 private testBatchId;

    function setUp() public override {
        super.setUp();
        
        testBatchId = createTestBatch(processor);
        addCompleteComplianceData(testBatchId);
        verifyBatchWithZK(testBatchId);
        
        // Set up payment
        vm.prank(admin);
        treasury.setBatchPayment(testBatchId, TEST_PAYMENT_AMOUNT);
    }

    /* -------------------------------------------------------------------------- */
    /*                              REDEMPTION TESTS                            */
    /* -------------------------------------------------------------------------- */

    function testRedemption_WithPayment() public {
        // Buyer pays first
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        // Verify payment status
        assertTrue(treasury.checkPaymentStatus(buyer, testBatchId));
        
        console.log("Redemption prerequisites satisfied");
    }

    function testRedemption_ComplianceRequired() public {
        // Verify compliance data is required
        assertTrue(ethiopianCompliance.validateUpstreamCompliance(testBatchId));
        assertTrue(ethiopianCompliance.validateEUDRCompliance(testBatchId));
    }

    function testRedemption_ZKProofRequired() public {
                // Verify ZK proof was processed (using correct interface)
        bool hasQualityProof = zkManager.hasComplianceProof(testBatchId, "QUALITY_STANDARDS");
        assertTrue(hasQualityProof);
    }

    /* -------------------------------------------------------------------------- */
    /*                              FIAT TRANSFER TESTS                         */
    /* -------------------------------------------------------------------------- */

    function testFiatTransfer_Offramp() public {
        // Pay for batch first
        vm.prank(buyer);
        treasury.payForBatch(testBatchId, TEST_PAYMENT_AMOUNT);
        
        uint256 initialSellerBalance = usdc.balanceOf(seller);
        
        // Execute offramp transfer
        vm.prank(offrampExecutor);
        treasury.transferToOfframpPartner(testBatchId, buyer, seller, TEST_PAYMENT_AMOUNT);
        
        assertUSDCBalance(seller, initialSellerBalance + TEST_PAYMENT_AMOUNT);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ROLE-BASED ACCESS TESTS                     */
    /* -------------------------------------------------------------------------- */

    function testRedemptionRole() public {
        assertRoleGranted(keccak256("REDEMPTION_ROLE"), address(redemption));
    }

    function testMinterRole() public {
        assertRoleGranted(keccak256("MINTER_ROLE"), minter);
    }
}