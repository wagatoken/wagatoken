// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenVesting.sol";
import "../src/WagaToken.sol";
import {HelperConfigVesting} from "./HelperConfigVesting.s.sol";


contract DeployTokenVesting is Script {
    HelperConfigVesting helperConfig;
    address wagaToken;
    uint256 deployerKey;
    function run() external returns (TokenVesting, HelperConfigVesting) {
       
        helperConfig = new HelperConfigVesting();
        (
            wagaToken,
            deployerKey
        ) = helperConfig.activeNetworkConfig();
        vm.startBroadcast(deployerKey);
        TokenVesting tokenVesting = new TokenVesting(IERC20Mintable(wagaToken));
        vm.stopBroadcast();

        return (tokenVesting, helperConfig);
    }
}
