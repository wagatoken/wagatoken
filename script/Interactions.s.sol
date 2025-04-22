// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import{Script, console} from "forge-std/Script.sol";
import {DevOpsTools} from "lib/foundry-devops/src/DevOpsTools.sol";
import {TokenShop2} from "../src/TokenShop2.sol";


contract FundTokenShop2 is Script {
    uint256 constant SEND_VALUE = 0.01 ether;

    function fundTokenShop2(address tokenShop) public {
        //vm.startBroadcast();
        TokenShop2(payable(tokenShop)).buyWithEth{value: SEND_VALUE}();
        //vm.stopBroadcast();
        console.log("Funded TokenShop2 with %s ETH", SEND_VALUE);
      
    }
    function run() external {
        address tokenShop = DevOpsTools.get_most_recent_deployment(
            "TokenShop2",
            block.chainid
        );
        vm.startBroadcast();
        FundTokenShop2(tokenShop);
        vm.stopBroadcast();
        console.log("Funded TokenShop2 with %s ETH", SEND_VALUE);
    }
}

contract WithdrawTokenShop2 is Script {
    function withdrawTokenShop2(address tokenShop) public {
        vm.startBroadcast();
        TokenShop2(payable(tokenShop)).withdrawEth();
        vm.stopBroadcast();
        console.log("Withdrawn from TokenShop2");
    }
    function run() external {
        address tokenShop = DevOpsTools.get_most_recent_deployment(
            "TokenShop2",
            block.chainid
        );
        vm.startBroadcast();
        withdrawTokenShop2(tokenShop);
        vm.stopBroadcast();
        console.log("Withdrawn from TokenShop2");
    }
}