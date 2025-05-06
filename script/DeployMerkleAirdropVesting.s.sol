// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/TokenVesting.sol";

contract DeployMerkleAirdropVesting is Script {
    function run() external {
        vm.startBroadcast();

        // TokenVesting tokenVesting = TokenVesting(0x1234567890123456789012345678901234567890); // Placeholder address
        // tokenVesting.updateMerkleRoot(bytes32(0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef));

        vm.stopBroadcast();
    }
}
