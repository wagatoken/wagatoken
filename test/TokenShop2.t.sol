// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {TokenShop2} from "../src/TokenShop2.sol";
import {WagaToken} from "src/WagaToken.sol";
import {MockV3Aggregator} from "../test/mocks/MockV3Aggregator.sol";
//import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {DeployTokenShop2} from "script/DeployTokenShop2.s.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract TokenShop2Test is Test {
    TokenShop2 public tokenShop;
    WagaToken public wagaToken;
    //MockV3Aggregator public ethUsdFeed;
    HelperConfig public config;
    //IERC20 public usdc;
    address usdc;
    address public user = makeAddr("user");
    //address public owner;
    DeployTokenShop2 public deployer;
    uint256 public constant USDC_PRECISION = 1e12; // USDC has 6 decimals, so we use 1e12 for conversion (i.e usdcPrice * 1e12)
    uint256 public constant TOKEN_PRICE_USD = 1e17; // 0.1 USD
    uint256 public constant startingBalance = 30 ether; // 1 ETH
    uint256 public constant startingBalanceUsdc = 1000e6;

    function setUp() public {
        // Deploy the TokenShop2 contract
        deployer = new DeployTokenShop2();

        (wagaToken, tokenShop,, config) = deployer.run();
        (, usdc, ) = config.activeNetworkConfig();
        vm.deal(user, startingBalance);

        // Mint USDC to the user
        ERC20Mock(usdc).mint(user, startingBalanceUsdc);

        // Log the user's USDC balance
        console.log(
            "User USDC balance after minting:",
            ERC20Mock(usdc).balanceOf(user)
        ); // 1000000000000000000000
    }

    modifier fundedEth() {
        vm.prank(user);
        tokenShop.buyWithEth{value: 0.01 ether}();

        _;
    }

    modifier fundedUSDC() {
        uint256 purchaseAmount = 10e6;
        vm.startPrank(user);
        ERC20Mock(usdc).approve(address(tokenShop), purchaseAmount);
        tokenShop.buyWithUSDC(10e6);
        vm.stopPrank();
        _;
    }

    function testBuyWithEth() public {
        console.log(
            "User WagaToken balance before purchase: %s",
            wagaToken.balanceOf(user)
        );
        vm.prank(user);
        tokenShop.buyWithEth{value: 0.01 ether}(); // Should succeed
        console.log(
            "User WagaToken balance after purchase: %s",
            wagaToken.balanceOf(user)
        );
        assertGt(wagaToken.balanceOf(user), 0);
    }

    function testBuyWithEthRevertsWhensAmountLessThanZero()public{
        vm.prank(user);
        vm.expectRevert(TokenShop2.TokenShop2__NoEthSent_buyWithEth.selector);
        tokenShop.buyWithEth{value: 0}();
    }

    
    function testBuyWithUSDC() public {
        console.log(
            "User WagaToken balance before purchase: %s",
            wagaToken.balanceOf(user)
        );
        uint256 purchaseAmount = 10e6;

        // // Log the user's USDC allowance for the TokenShop2 contract
        // console.log(
        //     "User USDC allowance before approval:",
        //     ERC20Mock(usdc).allowance(user, address(tokenShop))
        // );

        //Approve the TokenShop to spend USDC on behalf of the user
        vm.prank(user);
        ERC20Mock(usdc).approve(address(tokenShop), purchaseAmount);

        // // Log the user's USDC allowance after approval
        // console.log(
        //     "User USDC allowance after approval:",
        //     ERC20Mock(usdc).allowance(user, address(tokenShop))
        // );

        vm.prank(user);
        tokenShop.buyWithUSDC(purchaseAmount); // Should succeed
        console.log(
            "User WagaToken balance after purchase: %s",
            wagaToken.balanceOf(user)
        );
        assertGt(wagaToken.balanceOf(user), 0); // 100.000000000000000000
    }

    function testBuyWithLowEthFails() public {
        vm.deal(user, 1 ether);
        vm.expectRevert();
        vm.prank(user);
        tokenShop.buyWithEth{value: 0.0001 ether}(); // Should revert: not enough ETH to meet min USD
    }

    function testBuyWithLowUsdcFails() public {
        console.log("Starting testFailBuyWithLowUsdc...");

        // Log the user's initial WagaToken balance
        console.log(
            "User WagaToken balance before purchase: %s",
            wagaToken.balanceOf(user)
        );

        uint256 purchaseAmount = 1e6; // 1 USDC, less than the minimum purchase amount (2 USDC)

        // Log the user's USDC allowance for the TokenShop2 contract before approval
        console.log(
            "User USDC allowance before approval:",
            ERC20Mock(usdc).allowance(user, address(tokenShop))
        );

        // Approve the TokenShop to spend USDC on behalf of the user
        vm.prank(user);
        ERC20Mock(usdc).approve(address(tokenShop), purchaseAmount);

        // Log the user's USDC allowance after approval
        console.log(
            "User USDC allowance after approval:",
            ERC20Mock(usdc).allowance(user, address(tokenShop))
        );

        // Expect the custom error to be reverted
        vm.prank(user);
        // vm.expectRevert(TokenShop2.TokenShop2__InsufficientFunds_buyWithUSDC.selector);
        vm.expectRevert();
        // Attempt to buy with insufficient USDC, which should revert
        tokenShop.buyWithUSDC(purchaseAmount);

        // Log the user's WagaToken balance after the failed purchase attempt
        console.log(
            "User WagaToken balance after purchase attempt: %s",
            wagaToken.balanceOf(user)
        );

        console.log("testFailBuyWithLowUsdc completed.");
    }
    function testBuyWithZeroUsdcFails() public {
        uint256 purchaseAmount = 0;

        //Approve the TokenShop to spend USDC on behalf of the user
        vm.prank(user);
        ERC20Mock(usdc).approve(address(tokenShop), purchaseAmount);

        vm.prank(user);
        vm.expectRevert(TokenShop2.TokenShop2__NoUSDCsent_buyWithUSDC.selector);
        tokenShop.buyWithUSDC(purchaseAmount); // Should succeed

    }
    

    function testOwnerCanWithdrawEth() public fundedEth {
        //Arrange
        console.log("starting TokenShop Balance", address(tokenShop).balance);
        uint256 startingTokenShopBalance = address(tokenShop).balance;
        //console.log("tokenShopOwnerAddress", tokenShop.getOwner());
        uint256 startingOwnerBalance = address(tokenShop.getOwner()).balance;

        // Act
        vm.startPrank(tokenShop.getOwner());
        tokenShop.withdrawEth();
        vm.stopPrank();

        //Assert
        uint256 endingTokenShopBalance = address(tokenShop).balance;
        //console.log("endingTokenShopBalance", endingTokenShopBalance);
        assert(endingTokenShopBalance == 0);
        assert(
            startingTokenShopBalance + startingOwnerBalance ==
                address(tokenShop.getOwner()).balance
        );
    }
    function testWithdrawFailsWhenNoEth() public {
        vm.startPrank(tokenShop.getOwner());
        vm.expectRevert(TokenShop2.TokenShop2__InsufficientBalance_withdrawEth.selector);
        tokenShop.withdrawEth();
        vm.stopPrank();
    }

    

    function testOnlyOwnerCanWithdrawEth() public fundedEth {
        vm.startPrank(user);
        vm.expectRevert();
        tokenShop.withdrawEth();
        vm.stopPrank();
    }

    function testOwnerCanWithdrawUSDC() public fundedUSDC {
        //_Arrange
            console.log("starting TokenShop USDC Balance", ERC20Mock(usdc).balanceOf(address(tokenShop)));
            uint256 startingOwnerBalance = ERC20Mock(usdc).balanceOf(tokenShop.getOwner());
            uint256 startingTokenShopBalance = ERC20Mock(usdc).balanceOf(address(tokenShop));

        // Act
            vm.startPrank(tokenShop.getOwner());
            //ERC20Mock(usdc).approve(address(tokenShop.getOwner()), startingTokenShopBalance);
            tokenShop.withdrawUsdc();
            vm.stopPrank();
        //Assert
        uint256 endingTokenShopBalance = ERC20Mock(usdc).balanceOf(
            address(tokenShop)
        );
        console.log("endingTokenShopBalance", endingTokenShopBalance);
        assert(endingTokenShopBalance == 0);
        uint256 endingOwnerBalance = ERC20Mock(usdc).balanceOf(
            tokenShop.getOwner()
        );
        assert(
            startingTokenShopBalance + startingOwnerBalance ==
                endingOwnerBalance
        );

    }
    function testWithdrawFailsWhenNoUSDC() public {
        vm.startPrank(tokenShop.getOwner());
        vm.expectRevert(TokenShop2.TokenShop2__InsufficientBalance_withdrawUsdc.selector);
        tokenShop.withdrawUsdc();
        vm.stopPrank();
    }

    function testOnlyOwnerCanWithdrawUSDC() public fundedUSDC {
        vm.startPrank(user);
        vm.expectRevert();
        tokenShop.withdrawUsdc();
        vm.stopPrank();
    }

    function testOnlyOwnerCanSetTokenPrice() public {
        vm.startPrank(user);
        vm.expectRevert();
        tokenShop.setTokenPriceUsd(1e18);
        vm.stopPrank();

    }

    function testOnlyOwnerCanSetMinPurchase() public {
        vm.startPrank(user);
        vm.expectRevert();
        tokenShop.setMinPurchaseUsd(1e18);
        vm.stopPrank();
    }

    // function testEthToUsdConversion() public view {
        
    //     uint256 ethAmount = 1 ether; // 1 ETH
    //     uint256 expectedUsdValue = (ethAmount * tokenShop._getEthUsdPrice()) / 1e18; 

       
    //     uint256 usdValue = tokenShop._ethToUsd(ethAmount);
  
    //     assertEq(usdValue, expectedUsdValue, "ETH to USD conversion failed");
    // }

    // function testEthToUsdConversionFailsWhenNoEthSent() public {
    //     vm.expectRevert(TokenShop2.TokenShop2__NoEthSent_ethToUsd.selector);
    //     tokenShop._ethToUsd(0); // Should revert: no ETH sent
    // }
    function testReceiveFunction() public {
    uint256 amount = 1 ether;
    uint256 initialBalance = address(tokenShop).balance;

    // Send ETH directly to the contract (triggers receive())
    vm.prank(user);
    (bool sent, ) = address(tokenShop).call{value: amount}("");
    require(sent, "ETH transfer failed");

    // Assert contract balance increased
    assertEq(address(tokenShop).balance, initialBalance + amount);
}
    // function testSetTokenPriceUsd() public {
    //     uint256 newPrice = 3e18; 
    //     vm.startPrank(tokenShop.getOwner());
    //     tokenShop.setTokenPriceUsd(newPrice);
    //     vm.stopPrank();
    //     assertEq(tokenShop.tokenPriceUsd(), newPrice, "Token price should be updated");
    // }
    // function testSetMinPurchaseUsd() public {
    //     uint256 newMinUsd = 3e18;
    //     vm.startPrank(tokenShop.getOwner());
    //     tokenShop.setMinPurchaseUsd(newMinUsd);
    //     vm.stopPrank();
    //     assertEq(tokenShop.minPurchaseUsd(), newMinUsd);
    // }

}

