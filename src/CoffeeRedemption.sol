// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
// import "./interfaces/IRedemption.sol";
// import "./CoffeeTraceability.sol";

// contract CoffeeRedemption is ReentrancyGuard, IRedemption {
//     IERC1155 private coffeeToken;
//     address public logisticsOracle;
//     bytes32 public shipmentJobId;
//     uint256 public oracleFee;

//     event Redeemed(address indexed user, uint256 indexed batchId, uint256 amount);
//     event ShipmentRequested(address indexed user, uint256 indexed batchId, uint256 amount);

//     constructor(address _coffeeToken, address _logisticsOracle, bytes32 _shipmentJobId, uint256 _oracleFee) {
//         require(address(CoffeeTraceability(_coffeeToken)) == _coffeeToken, "Invalid CoffeeTraceability contract");
//         coffeeToken = IERC1155(_coffeeToken);
//         logisticsOracle = _logisticsOracle;
//         shipmentJobId = _shipmentJobId;
//         oracleFee = _oracleFee;
//     }

//     function redeem(uint256 batchId, uint256 amount) external nonReentrant {
//         require(amount > 0, "Amount must be greater than zero");
//         require(coffeeToken.balanceOf(msg.sender, batchId) >= amount, "Insufficient token balance");
//         CoffeeTraceability(address(coffeeToken)).burn(msg.sender, batchId, amount);

//         emit Redeemed(msg.sender, batchId, amount);
//         emit ShipmentRequested(msg.sender, batchId, amount);

//         requestShipment(msg.sender, batchId, amount);
//     }

//     function requestShipment(address user, uint256 batchId, uint256 amount) internal {
//         Chainlink.Request memory request = buildChainlinkRequest(shipmentJobId, address(this), this.fulfillShipment.selector);
//         request.add("user", toAsciiString(user));
//         request.addUint("batchId", batchId);
//         request.addUint("amount", amount);
//         sendChainlinkRequestTo(logisticsOracle, request, oracleFee);
//     }

//     function fulfillShipment(bytes32 _requestId, uint256 batchId) public recordChainlinkFulfillment(_requestId) {
//         // Placeholder for logistics confirmation.
//     }

//     function toAsciiString(address _addr) internal pure returns (string memory) {
//         bytes memory s = new bytes(42);
//         for (uint i = 0; i < 20; i++) {
//             uint8 b = uint8(uint256(uint160(_addr)) / (2**(8*(19 - i))));
//             s[2+i*2] = byte(uint8(b / 16) + 48);
//             s[3+i*2] = byte(uint8(b % 16) + 48);
//         }
//         return string(s);
//     }
// }
