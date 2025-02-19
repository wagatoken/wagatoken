// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import {OracleLib} from "./OracleLib.sol";
import {WagaToken} from "./WagaToken.sol";

contract TokenShop is Ownable {
    using OracleLib for AggregatorV3Interface;

    WagaToken public wagaToken;
    AggregatorV3Interface internal priceFeed;
    uint256 public tokenPriceUSD = 200; // 1 token = 2.00 USD (2 decimal places)

    event TokensPurchased(address indexed buyer, uint256 ethAmount, uint256 tokenAmount);
    event Withdrawn(address indexed owner, uint256 amount);

    constructor(address _wagaToken, address _priceFeed) Ownable(msg.sender) {
        wagaToken = WagaToken(_wagaToken);
        priceFeed = AggregatorV3Interface(_priceFeed);
    }

    function getEthUsdPrice() public view returns (uint256) {
        (, int256 price, , , ) = priceFeed.stalePriceCheckLatestRoundData();
        require(price > 0, "Invalid price data");
        return uint256(price);
    }

    function tokenAmount(uint256 ethAmount) public view returns (uint256) {
        uint256 ethUsd = getEthUsdPrice(); // ETH/USD price (8 decimals)
        uint256 amountUSD = (ethAmount * ethUsd) / 1e18; // Convert ETH to USD
        return (amountUSD * 100) / tokenPriceUSD; // Adjust for 2 decimal places
    }

    receive() external payable {
        require(msg.value > 0, "Must send ETH");
        uint256 amountToMint = tokenAmount(msg.value);
        require(amountToMint > 0, "Not enough ETH to buy tokens");

        wagaToken.mint(msg.sender, amountToMint);
        emit TokensPurchased(msg.sender, msg.value, amountToMint);
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No ETH to withdraw");
        payable(owner()).transfer(balance);
        emit Withdrawn(owner(), balance);
    }
}