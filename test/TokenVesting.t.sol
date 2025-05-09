// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {DeployTokenShop2} from "script/DeployTokenShop2.s.sol";
import {WagaToken} from "src/WagaToken.sol";
import {TokenVesting, IERC20Mintable} from "src/TokenVesting.sol";

contract TokenVestingTest is Test {
    DeployTokenShop2 public deployer;
    WagaToken public wagaToken;
    TokenVesting public tokenVesting;
    address public user;
    address public owner;
    uint256 public categoryAllocation = 100_000_000 ether; // 100 million tokens
    uint256 public beneficiaryAllocation = 1000000e18; // 1 million tokens
    uint256 public vestingDuration = 365 days; // 1 year vesting duration
    uint256 public cliffDuration = 365 days; // 1 year cliff duration
    uint256 timeElapsed = 60 days;

    function setUp() public {
        deployer = new DeployTokenShop2();
        (wagaToken, , tokenVesting, ) = deployer.run();
        owner = tokenVesting.getOwner();
        user = makeAddr("user");
    }

    modifier initializeCategory() {
        uint256 allocation = categoryAllocation; // 100 million tokens
        vm.startPrank(owner);
        tokenVesting.initializeCategory(
            TokenVesting.Category.devTeam,
            allocation
        );
        vm.stopPrank();
        _;
    }

    function testInitializeCategory() public initializeCategory {
        // //Arrange
        uint256 allocation = categoryAllocation; // 100 million tokens

        //Assert
        assertEq(
            tokenVesting.getCategoryBalance(TokenVesting.Category.devTeam),
            allocation,
            "Category balance should be equal to the allocation"
        );
    }

    function testOnlyOwnerCanInitializeCategory() public {
        // Arrange
        uint256 allocation = 100_000_000 ether; // 100 million tokens
        // Act/Assert
        vm.startPrank(user);
        vm.expectRevert();
        tokenVesting.initializeCategory(
            TokenVesting.Category.devFund,
            allocation
        );
        vm.stopPrank();
    }

    function testCreateVestingSchedule() public initializeCategory {
        // Arrange
        address beneficiary = user;
        TokenVesting.Category category = TokenVesting.Category.devTeam;
        uint256 allocation = beneficiaryAllocation; // 1 million tokens
        uint256 start;
 

        // check if the category is initialized
        uint256 categoryBalance = tokenVesting.getCategoryBalance(category);
        console.log("categoryBalance", categoryBalance);

        // Act
        vm.startPrank(owner);
        tokenVesting.createVestingSchedule(
            beneficiary,
            category,
            allocation,
            start,
            cliffDuration,
            vestingDuration
        );
        vm.stopPrank();
        // Assert
        // Check if the vesting schedule is created
        TokenVesting.VestingSchedule memory schedule = tokenVesting
            .getVestingSchedule(beneficiary);
        assertEq(
            uint256(schedule.category), // expected to be TokenVesting.Category.devTeam
            uint256(category), // expected to be TokenVesting.Category.devTeam,
            "Category should be devTeam"
        );
        assertEq(
            schedule.beneficiaryAllocation,
            allocation,
            "Beneficiary allocation should be equal to the allocation"
        );
    }

    modifier createVestingSchedule() {
        address beneficiary = user;
        TokenVesting.Category category = TokenVesting.Category.devTeam;
        uint256 allocation = beneficiaryAllocation; // 1 million tokens
        uint256 start = block.timestamp; // Set start to the current block timestamp
   

        vm.startPrank(owner);
        tokenVesting.createVestingSchedule(
            beneficiary,
            category,
            allocation,
            start,
            cliffDuration,
            vestingDuration
        );
        vm.stopPrank();
        _;
    }

    function testReleaseTokensBeforeCliff()
        public
        initializeCategory
        createVestingSchedule
    {
        // Arrange
        address beneficiary = user;
        vm.expectRevert();
        vm.startPrank(beneficiary);
        tokenVesting.releaseTokens(beneficiary);
        vm.stopPrank();
    }

    function testZeroAddressReverts()
        public
        initializeCategory
        createVestingSchedule
    {
        // Arrange
        address beneficiary = user;
        vm.expectRevert();
        vm.startPrank(beneficiary);
        tokenVesting.releaseTokens(address(0));
        vm.stopPrank();
    }

    function testUserCannotReleaseAfterRevoking()
        public
        initializeCategory
        createVestingSchedule
    {
        // Arrange
        address beneficiary = user;
        // advance time to after the cliff
        vm.warp(block.timestamp + 365 days);
        //vm.roll(block.number + 100);
        // Act
        // revoke the vesting schedule
        vm.startPrank(owner);
        tokenVesting.revokeVesting(beneficiary);
        vm.stopPrank();
        // Assert
        vm.startPrank(beneficiary);
        vm.expectRevert();
        tokenVesting.releaseTokens(beneficiary);
        vm.stopPrank();
    }

    function testReleaseTokensAfterCliff()
        public
        initializeCategory
        createVestingSchedule
    {
        // Arrange
        uint256 t_cliffDuration = block.timestamp + cliffDuration; // 1 year cliff
        address beneficiary = user;
        vm.warp(t_cliffDuration + timeElapsed); // Advance time to 60 days after the cliff   // Act
        vm.startPrank(beneficiary);
        tokenVesting.releaseTokens(beneficiary);
        vm.stopPrank();
        console.log(
            "released tokens",
            tokenVesting.getVestingSchedule(beneficiary).released
        );
        // Assert
        assertEq(
            tokenVesting.getVestingSchedule(beneficiary).released, (beneficiaryAllocation * timeElapsed) /
                vestingDuration,
            "Tokens should be released after the cliff"
        );
    }

    function testReleaseTokensAfterVestingDuration() public initializeCategory createVestingSchedule {}

    function testDistributeTokens() public {}
}

// 1000000,000000000000000000
// 1000000,000000000000000000
// 1000000,000000000000000000
//  released tokens 164383,561643835616438356

/* 
n



*/
