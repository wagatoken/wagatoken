// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {BaseWAGATest} from "../BaseWAGATest.t.sol";
import {console} from "forge-std/Test.sol";

/**
 * @title WAGAEthiopianComplianceStreamlinedTest
 * @dev Streamlined unit tests for Ethiopian compliance functionality
 */
contract WAGAEthiopianComplianceStreamlinedTest is BaseWAGATest {

    uint256 private testBatchId;

    function setUp() public override {
        super.setUp();
        testBatchId = createTestBatch(processor);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ECTA PERMIT TESTS                           */
    /* -------------------------------------------------------------------------- */

    function testAddECTAPermit_Success() public {
        vm.prank(complianceManager);
        ethiopianComplianceCore.addECTAPermit(testBatchId, testECTAPermit);
        
        // Verify permit was added (would need getter function)
        console.log("ECTA permit added successfully");
    }

    function testAddECTAPermit_OnlyComplianceManager() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        ethiopianComplianceCore.addECTAPermit(testBatchId, testECTAPermit);
    }

    /* -------------------------------------------------------------------------- */
    /*                              QUALITY CERTIFICATE TESTS                   */
    /* -------------------------------------------------------------------------- */

    function testAddQualityCertificate_Success() public {
        vm.prank(qualityInspector);
        ethiopianComplianceCore.addQualityCertificate(testBatchId, testQualityCert);
        
        console.log("Quality certificate added successfully");
    }

    /* -------------------------------------------------------------------------- */
    /*                              ORIGIN VERIFICATION TESTS                   */
    /* -------------------------------------------------------------------------- */

    function testAddOriginVerification_Success() public {
        vm.prank(originVerifier);
        ethiopianComplianceCore.addOriginVerification(testBatchId, testOriginVerification);
        
        console.log("Origin verification added successfully");
    }

    function testAddOriginVerification_OnlyOriginVerifier() public {
        vm.prank(unauthorized);
        vm.expectRevert();
        ethiopianComplianceCore.addOriginVerification(testBatchId, testOriginVerification);
    }

    /* -------------------------------------------------------------------------- */
    /*                              EUDR COMPLIANCE TESTS                       */
    /* -------------------------------------------------------------------------- */

    function testEUDRCompliance_Complete() public {
        vm.prank(complianceManager);
        ethiopianComplianceCore.addEUDRCertificate(testBatchId, testEUDRCert);
        
        vm.prank(originVerifier);
        ethiopianComplianceCore.addGeolocationData(testBatchId, testGeoData);
        
        bool isCompliant = ethiopianComplianceCore.validateEUDRCompliance(testBatchId);
        assertTrue(isCompliant);
    }

    /* -------------------------------------------------------------------------- */
    /*                              UPSTREAM COMPLIANCE TESTS                   */
    /* -------------------------------------------------------------------------- */

    function testUpstreamCompliance_Complete() public {
        addCompleteComplianceData(testBatchId);
        
        bool isCompliant = ethiopianComplianceCore.validateUpstreamCompliance(testBatchId);
        assertTrue(isCompliant);
    }

    /* -------------------------------------------------------------------------- */
    /*                              ROLE-BASED ACCESS TESTS                     */
    /* -------------------------------------------------------------------------- */

    function testComplianceManagerRole() public view{
        assertRoleGranted(keccak256("COMPLIANCE_MANAGER_ROLE"), complianceManager);
    }

    function testOriginVerifierRole() public view{
        assertRoleGranted(keccak256("ORIGIN_VERIFIER_ROLE"), originVerifier);
    }

    function testQualityInspectorRole() public view {
        assertRoleGranted(keccak256("QUALITY_INSPECTOR_ROLE"), qualityInspector);
    }
}