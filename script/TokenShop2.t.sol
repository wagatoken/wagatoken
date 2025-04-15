// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {TokenShop2} from  "../src/TokenShop2.sol";
import {WagaToken} from  "src/WagaToken.sol";
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from  "@openzeppelin/contracts/token/ERC20/ERC20.sol";



contract TokenShop2Test is Test {
    TokenShop2 public tokenShop;
    WagaToken public wagaToken;
    MockV3Aggregator public ethUsdFeed;
    IERC20 public usdc;
    address public user = makeAddr("user");
    address public owner;

    function setUp() public {
        owner = address(this);
        wagaToken = new WagaToken();
        ethUsdFeed = new MockV3Aggregator(8, 3000e8); // 8 decimals and $3000 ETH price
        tokenShop = new TokenShop2(address(wagaToken), address(ethUsdFeed), owner);
        
        // manually set dependencies (assuming setter or constructor omitted for simplicity)
        vm.prank(owner);
        tokenShop.grantRole(tokenShop.OWNER_ROLE(), owner);
        //tokenShop.setWagaToken(address(wagaToken));
        //tokenShop.setPriceFeed(address(ethUsdFeed));
        tokenShop.unpause();
        wagaToken.transferOwnership(address(tokenShop));
    }

    function testBuyWithEth() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        tokenShop.buyWithEth{value: 0.01 ether}(); // Should succeed
        assertGt(wagaToken.balanceOf(user), 0);
    }

    function testFailBuyWithLowEth() public {
        vm.deal(user, 1 ether);
        vm.prank(user);
        tokenShop.buyWithEth{value: 0.0001 ether}(); // Should revert: not enough ETH to meet min USD
    }

    function testPauseAndUnpause() public {
        tokenShop.pause();
        assert(tokenShop.paused());

        tokenShop.unpause();
        assert(!tokenShop.paused());
    }

    function testOnlyOwnerCanPause() public {
        vm.prank(user);
        vm.expectRevert("AccessControl: account 0x0000000000000000000000000000000000000001 is missing role");
        tokenShop.pause();
    }
}
