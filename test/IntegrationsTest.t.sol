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
import {FundTokenShop2, WithdrawTokenShop2} from "script/Interactions.s.sol";

contract IntegrationsTest is Test {
    TokenShop2 public tokenShop;
    WagaToken public wagaToken;
    //MockV3Aggregator public ethUsdFeed;
    HelperConfig public config;
    //IERC20 public usdc;
    address usdc;
    address public user = makeAddr("user");
    // address public owner;
    DeployTokenShop2 public deployer;
    uint256 public constant USDC_PRECISION = 1e12; // USDC has 6 decimals, so we use 1e12 for conversion (i.e usdcPrice * 1e12)
    uint256 public constant TOKEN_PRICE_USD = 1e17; // 0.1 USD
    uint256 public constant startingBalance = 30 ether; // 1 ETH
    uint256 public constant startingBalanceUsdc = 1000e6;
    FundTokenShop2 fundTokenShop = new FundTokenShop2();
    WithdrawTokenShop2 withdrawTokenShop = new WithdrawTokenShop2();

    function setUp() public {
        // Deploy the TokenShop2 contract
        deployer = new DeployTokenShop2();
        (wagaToken, tokenShop,, config) = deployer.run();
        (, usdc, ) = config.activeNetworkConfig();
        vm.deal(user, startingBalance);
        vm.deal(address(fundTokenShop), startingBalance);

        // Mint USDC to the user
        ERC20Mock(usdc).mint(user, startingBalanceUsdc);

        // Log the user's USDC balance
        console.log(
            "User USDC balance after minting:",
            ERC20Mock(usdc).balanceOf(user)
        ); // 1000000000000000000000
    }


    function testFundTokenShop2() public {
        fundTokenShop.fundTokenShop2(address(tokenShop));
        assertEq(address(tokenShop).balance, 0.01 ether);
    }

    modifier fundFundTokenshop() {
        fundTokenShop.fundTokenShop2(address(tokenShop));
        _;
    }

    function testWithdrawTokenShop2() public fundFundTokenshop {
        console.log(
            "TokenShop2 balance before withdrawal: %s",
            address(tokenShop).balance
        );
        //vm.prank(tokenShop.getOwner());
        withdrawTokenShop.withdrawTokenShop2(address(tokenShop));
        assertEq(address(tokenShop).balance, 0);
    }
}
