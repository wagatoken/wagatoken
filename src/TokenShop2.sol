// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {OracleLib} from "./OracleLib.sol";
import {WagaToken} from "./WagaToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "forge-std/console.sol"; // For testing

contract TokenShop2 is Ownable, AccessControl { 
    using OracleLib for AggregatorV3Interface;

    error TokenShop2__NoEthSent_ethToUsd();  
    error TokenShop2__NoEthSent_buyWithEth(); // test
    error TokenShop2__NoUSDCsent_buyWithUSDC(); // test
    error TokenShop2__InvalidPriceData_setTokenPriceUsd();
    error TokenShop2__InvalidPrice_setMinPurchaseUsd();
    error TokenShop2__InvalidPriceData_getEthUsdPrice();
    error TokenShop2__InsufficientFunds_buyWithUSDC(); // tested
    error TokenShop2__InsufficientFunds_buyWithEth(); // tested
    error TokenShop2__InsufficientUSD_buyWithEth(); // tokens to mint
    error TokenShop2__InsufficientUSDC_buyWithUSDC(); // tokens to mint
    error TokenShop2__UsdcTransferFailed_buyWithUSDC();
    error TokenShop2__InsufficientBalance_withdrawEth(); // test 
    error TokenShop2__WithdrawalFailed_withdrawEth(); 
    error TokenShop2__InsufficientBalance_withdrawUsdc(); // test
    error TokenShop2__WithdrawalFailed_withdrawUsdc();

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    WagaToken public wagaToken;
    AggregatorV3Interface internal priceFeed;
    IERC20 public usdc;
    uint256 private constant USDC_PRECISION = 1e12; // USDC has 6 decimals, so we use 1e12 for conversion (i.e usdcPrice * 1e12)
    address private immutable i_owner;

    uint256 public tokenPriceUsd = 1e17; // 0.1 USD
    uint256 public minPurchaseUsd = 2e18;
    mapping(address sender => uint256 ethSpent) private senderToEthSpent; // @audit: This is maybe redundant
    mapping(address sender => uint256 tokenAmt) private tokensPurchasedWithEth;
    mapping(address sender => uint256 usdcSpent) private senderToUSDCSpent; // @audit: This is maybe redundant
    mapping(address sender => uint256 amountPurchased)
        public tokensPurchasedWithUSDC;

    event TokensPurchased(
        address indexed buyer,
        uint256 paymentAmount,
        uint256 tokenAmount,
        string currency
    );
    event Withdrawn(address indexed owner, address asset, uint256 amount);
    event TokenPriceUpdated(uint256 newPrice);
    event MinPurchaseUpdated(uint256 newMin);

    constructor(
        address _wagaToken,
        address _priceFeed,
        address _usdc
    ) Ownable(msg.sender) {
        wagaToken = WagaToken(_wagaToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
        usdc = IERC20(_usdc);

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OWNER_ROLE, msg.sender);
        i_owner = msg.sender;
    }

    modifier onlyAdmin() {
        require(hasRole(OWNER_ROLE, msg.sender), "Not authorized");
        _;
    }

    receive() external payable {
        buyWithEth();
    }

    function buyWithEth() public payable {
        // Check ==> Data Validation
        if (msg.value <= 0) {
            revert TokenShop2__NoEthSent_buyWithEth();
        }
        //Effects: Record the amount of ETH spent by the sender
        senderToEthSpent[msg.sender] += msg.value;
        uint256 usdValue = _ethToUsd(msg.value);
        // Check ==> Data Validation
        if (usdValue <= minPurchaseUsd) {
            revert TokenShop2__InsufficientFunds_buyWithEth();
        }
        // @audit: This check may be redundant.
        uint256 tokensToMint = _usdToTokens(usdValue);
        if (tokensToMint <= 0) {
            revert TokenShop2__InsufficientUSD_buyWithEth();
        }
        //Effect: Record the amount of Tokens Minted to the sender
        tokensPurchasedWithEth[msg.sender] += tokensToMint;
        wagaToken.mint(msg.sender, tokensToMint);
        emit TokensPurchased(msg.sender, msg.value, tokensToMint, "ETH");
    }

    function buyWithUSDC(uint256 usdcAmount) public {
        // Check ==> Data Validation
        if (usdcAmount <= 0) {
            revert TokenShop2__NoUSDCsent_buyWithUSDC();
        }
        if (usdcAmount * USDC_PRECISION < minPurchaseUsd) {
            revert TokenShop2__InsufficientFunds_buyWithUSDC();
        }

        //approve USDC transfer
        //IERC20(usdc).approve(address(this), usdcAmount);
        // Transfer USDC from the user to the contract
        bool success = usdc.transferFrom(msg.sender, address(this), usdcAmount);
        if (!success) {
            revert TokenShop2__UsdcTransferFailed_buyWithUSDC();
        }

        // Effects: Update state
        senderToUSDCSpent[msg.sender] += usdcAmount;

        // Calculate tokens to mint
        uint256 tokensToMint = _usdToTokens(usdcAmount * USDC_PRECISION);
        if (tokensToMint <= 0) {
            revert TokenShop2__InsufficientUSDC_buyWithUSDC();
        }

        console.log("tokensToMint", tokensToMint);

        // Mint tokens to the user
        tokensPurchasedWithUSDC[msg.sender] += tokensToMint;
        wagaToken.mint(msg.sender, tokensToMint);
        emit TokensPurchased(msg.sender, usdcAmount, tokensToMint, "USDC");
    }

    function setTokenPriceUsd(uint256 newPrice) external onlyAdmin {
        if (newPrice <= 0) {
            revert TokenShop2__InvalidPriceData_setTokenPriceUsd();
        }
        //  require(newPrice > 0, "Invalid price");
        tokenPriceUsd = newPrice;
        emit TokenPriceUpdated(newPrice);
    }

    function setMinPurchaseUsd(uint256 newMin) external onlyAdmin {
        if (newMin <= 0) {
            revert TokenShop2__InvalidPrice_setMinPurchaseUsd();
        }
        minPurchaseUsd = newMin;
        emit MinPurchaseUpdated(newMin);
    }

    function withdrawEth() external onlyAdmin {
        uint256 balance = address(this).balance;
        if (balance <= 0) {
            revert TokenShop2__InsufficientBalance_withdrawEth();
        }
        (bool success, ) = payable(owner()).call{value: balance}("");
        if (!success) {
            revert TokenShop2__WithdrawalFailed_withdrawEth();
        }
        // payable(owner()).transfer(balance);

        emit Withdrawn(owner(), address(0), balance);
    }

    function withdrawUsdc() external onlyAdmin {
        uint256 balance = usdc.balanceOf(address(this));
        // require(balance > 0, "No USDC");
        if (balance <= 0) {
            revert TokenShop2__InsufficientBalance_withdrawUsdc();
        }
        // Transfer USDC to the owner
        bool success = usdc.transfer(owner(), balance);
        //require(success, "USDC withdraw failed");
        if (!success) {
            revert TokenShop2__WithdrawalFailed_withdrawUsdc();
        }
        emit Withdrawn(owner(), address(usdc), balance);
    }

    function _ethToUsd(uint256 ethAmount) internal view returns (uint256) {
        // Check ==> Data Validation
        if (ethAmount <= 0) {
            revert TokenShop2__NoEthSent_ethToUsd();
        }
        return ((ethAmount * _getEthUsdPrice()) / 1e18);
    }

    function _usdToTokens(uint256 usdAmount) internal view returns (uint256) {
        return ((usdAmount * 1e18) / tokenPriceUsd); //token price = 1e17
    }

    function _getEthUsdPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.stalePriceCheckLatestRoundData();
        // Check ==> Data Validation
        //require(price > 0, "Invalid price data");
        if (price <= 0) {
            revert TokenShop2__InvalidPriceData_getEthUsdPrice();
        }
        return uint256(price * 1e10); // USD 8 decimals ==> 18 decimals
    }

    /**
     * getter functions
     */

    function getTokensPurchasedWithEth(
        address sender
    ) external view returns (uint256) {
        return tokensPurchasedWithEth[sender];
    }

    function getTokensPurchasedWithUSDC(
        address sender
    ) external view returns (uint256) {
        return tokensPurchasedWithUSDC[sender];
    }

    function getEthSpent(address sender) external view returns (uint256) {
        return senderToEthSpent[sender];
    }

    function getUSDCSpent(address sender) external view returns (uint256) {
        return senderToUSDCSpent[sender];
    }

    function getOwner() external view returns (address) {
        return i_owner;
    }
}
