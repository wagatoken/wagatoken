```solidity

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {OracleLib} from "./OracleLib.sol";
import {WagaToken} from "./WagaToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {console} from "forge-std/console.sol"; // For testing 

contract TokenShop2 is Ownable, AccessControl, Pausable {
    using OracleLib for AggregatorV3Interface;

    error TokenShop2__NoEthSent();
    error TokenShop2__NoUSDCsent();
    error TokenShop2__InvalidPriceData();
    error TokenShop2__InsufficientFunds();
    error TokenShop2__InsufficientUSDC();
    error TokenShop2__UsdcTransferFailed();

    bytes32 public constant OWNER_ROLE = keccak256("OWNER_ROLE");

    WagaToken public wagaToken;
    AggregatorV3Interface internal priceFeed;
    IERC20 public usdc;
    uint256 private constant USDC_PRECISION = 1e12; // USDC has 6 decimals, so we use 1e12 for conversion

    uint256 public tokenPriceUsd = 1e17; // 0.1 USD
    uint256 public minPurchaseUsd = 10e18;

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
    }

    modifier onlyAdmin() {
        require(hasRole(OWNER_ROLE, msg.sender), "Not authorized");
        _;
    }

    function getEthUsdPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.stalePriceCheckLatestRoundData();
        // Check ==> Data Validation
        //require(price > 0, "Invalid price data");
        if (price <= 0) {
            revert TokenShop2__InvalidPriceData();
        }
        return uint256(price * 1e10); // USD 8 decimals ==> 18 decimals
    }

    function ethToUsd(uint256 ethAmount) internal view returns (uint256) {
        // Check ==> Data Validation
        if (ethAmount <= 0) {
            revert TokenShop2__NoEthSent(); // revert TokenShop2__NotEnoughEth_ethToUSD();
        }
        //uint256 ethUsd = getEthUsdPrice(); // 18 decimals
        return ((ethAmount * getEthUsdPrice()) / 1e18);
        // return (ethAmount * ethUsd) / 1e18;
    }

    function usdToTokens(uint256 usdAmount) internal view returns (uint256) {
        return ((usdAmount * 1e18) / tokenPriceUsd); //token price = 1e17
    }

    function buyWithEth() public payable whenNotPaused {
        // Check ==> Data Validation
        // require(msg.value > 0, "Must send ETH"); // Error

        if (msg.value <= 0) {
            revert TokenShop2__NoEthSent();
        }

        uint256 usdValue = ethToUsd(msg.value);
        // Check ==> Data Validation
        if (usdValue <= minPurchaseUsd) {
            revert TokenShop2__InsufficientFunds();
        }
        //  require(usdValue >= minPurchaseUsd, "Min $10 required");

        uint256 tokensToMint = usdToTokens(usdValue);
        if (tokensToMint <= 0) {
            revert TokenShop2__InsufficientUSDC(); // revert TokenShop2__InsufficientUSDC_tokensToMint();
        }
        // require(tokensToMint > 0, "Insufficient ETH for tokens");

        wagaToken.mint(msg.sender, tokensToMint);
        emit TokensPurchased(msg.sender, msg.value, tokensToMint, "ETH");
    }

    receive() external payable whenNotPaused {
        buyWithEth();
    }

    function buyWithUSDC(uint256 usdcAmount) external payable whenNotPaused {
        // Check ==> Data Validation
        if (usdcAmount <= 0) {
            revert TokenShop2__NoUSDCsent(); // revert TokenShop2__NoUSDCsent();
        }
        // require(usdcAmount > 0, "Must send USDC");

        if (usdcAmount * USDC_PRECISION < minPurchaseUsd) {
            revert TokenShop2__InsufficientFunds();
        } // revert TokenShop2__InsufficientFunds_buyWithUSDC();
        // if (usdcAmount < 10 * 1e6) {
        //     revert TokenShop2__InsufficientFunds(); // revert TokenShop2__InsufficientFunds_buyWithUSDC();
        // }
        // require(usdcAmount >= 10 * 1e6, "Min $10 in USDC");
        // Effects = Update ==> State
        // approve transfer
        usdc.approve(address(this), usdcAmount);
        bool success = usdc.transferFrom(msg.sender, address(this), usdcAmount);

        if (!success) {
            revert TokenShop2__UsdcTransferFailed(); // revert TokenShop2__InsufficientUSDC_transferFrom();
        }
        // require(success, "Transfer failed");

        uint256 usdAmount = usdcAmount * USDC_PRECISION; // 
        // require(usdAmount >= minPurchaseUsd, "Min $10 in USDC");

        uint256 tokensToMint = usdToTokens(usdAmount);
        if (tokensToMint <= 0) {
            revert TokenShop2__InsufficientUSDC(); // revert TokenShop2__InsufficientUSDC_tokensToMint();
        }
        console.log("tokensToMint", tokensToMint);
        //require(tokensToMint > 0, "Insufficient USDC for tokens");

        wagaToken.mint(msg.sender, tokensToMint);
        emit TokensPurchased(msg.sender, usdcAmount, tokensToMint, "USDC");
    }

    function setTokenPriceUsd(uint256 newPrice) external onlyAdmin {
        if (newPrice <= 0) {
            revert TokenShop2__InvalidPriceData(); // revert TokenShop2__InvalidPriceData_setTokenPrinceUsd();
        }
      //  require(newPrice > 0, "Invalid price");
        tokenPriceUsd = newPrice;
        emit TokenPriceUpdated(newPrice);
    }

    function setMinPurchaseUsd(uint256 newMin) external onlyAdmin {
        if (newMin <= 0) {
            revert TokenShop2__InvalidPriceData(); // revert TokenShop2__InvalidPriceData_setMinPurchaseUsd();
        }
       // require(newMin > 0, "Invalid min");
        minPurchaseUsd = newMin;
        emit MinPurchaseUpdated(newMin);
    }

    function pause() external onlyAdmin {
        _pause();
    }

    function unpause() external onlyAdmin {
        _unpause();
    }

    function withdrawEth() external onlyAdmin {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH");
        payable(owner()).transfer(balance);
        emit Withdrawn(owner(), address(0), balance);
    }

    function withdrawUsdc() external onlyAdmin {
        uint256 balance = usdc.balanceOf(address(this));
        require(balance > 0, "No USDC");
        bool success = usdc.transfer(owner(), balance);
        require(success, "USDC withdraw failed");
        emit Withdrawn(owner(), address(usdc), balance);
    }
}
