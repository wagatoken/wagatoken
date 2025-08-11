// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;


// import{Script, console} from "forge-std/Script.sol";
// import {DevOpsTools} from "lib/foundry-devops/src/DevOpsTools.sol";
// import {WAGACoffeeToken} from "src/WAGACoffeeToken.sol";
// import {WAGAConfigManager} from "src/WAGAConfigManager.sol";
// import {WAGAInventoryManager} from "src/WAGAInventoryManager2.sol";

// contract InitializeWAGACoffeeToken is Script{

//     function run() public{

//         // Get the latest WAGACoffeeToken contract address
//         // address coffeeTokenAddress = DevOpsTools.getLastDeployed(
//         //     "WAGACoffeeToken",
//         //     block.chainid
//         // );
//         // address configManagerAddress = DevOpsTools.getLastDeployed(
//         //     "WAGAConfigManager",
//         //     block.chainid
//         // );
//         address configManagerAddress = vm.envAddress("WAGACONFIGMANAGER_ADDRESS");// replace with last deployed address
//         console.log("WAGAConfigManager address: %s", configManagerAddress);
//         address coffeeTokenAddress = vm.envAddress("WAGACOFFEETOKEN_ADDRESS");// replace with last deployed address
//         console.log("WAGACoffeeToken address: %s", coffeeTokenAddress);

//         // vm.startBroadcast(deployerPrivateKey);
//        _initializeWAGACoffeeToken(configManagerAddress, coffeeTokenAddress);
//         // vm.stopBroadcast();
        
//     }

//     function _initializeWAGACoffeeToken(address configManagerAddress, address coffeeTokenAddress) internal {
//         uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
//         address deployer = vm.addr(deployerPrivateKey);
//         console.log("Deployer address: %s", deployer);


//         WAGAConfigManager configManager = WAGAConfigManager(configManagerAddress);

//         address inventoryManagerAddress = configManager.getInventoryManager();
//         address redemptionManagerAddress = configManager.getRedemptionManager();
//         address proofOfReserveManagerAddress = configManager.getProofOfReserveManager();


//         // Initialize the WAGACoffeeToken contract

//         WAGACoffeeToken coffeeToken = WAGACoffeeToken(coffeeTokenAddress);
//         vm.startBroadcast(deployerPrivateKey);
//         coffeeToken.initialize(
//             inventoryManagerAddress,
//             redemptionManagerAddress,
//             proofOfReserveManagerAddress
//         );
//         vm.stopBroadcast();
//     }

// }
// contract CreateBatch is Script {

//     function _createBatch(
//         address coffeeTokenAddress,
//         string memory _ipfsUri,
//         uint256 _productionDate,
//         uint256 _expiryDate,
//         uint256 _pricePerUnit,
//         string memory _packagingInfo,
//         string memory _metadataHash
//     ) internal {
//         WAGACoffeeToken coffeeToken = WAGACoffeeToken(coffeeTokenAddress);

//         uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
//         address deployer = vm.addr(deployerPrivateKey);
//         console.log("Deployer address: %s", deployer);

//         vm.startBroadcast(deployerPrivateKey);
//          coffeeToken.createBatch(
//             _ipfsUri,
//             _productionDate,
//             _expiryDate,
//             _pricePerUnit,
//             _packagingInfo,
//             _metadataHash
//         );
//         vm.stopBroadcast();
//     }

//     function run() external {


//     address coffeeTokenAddress = vm.envAddress("WAGACOFFEETOKEN_ADDRESS");// replace with last deployed address
//     console.log("WAGACoffeeToken address: %s", coffeeTokenAddress);


//     string memory ipfsUri = "ipfsUri";
//     uint256 productionDate = 1234;
//     uint256 expiryDate = 1234556;
//     uint256 pricePerUnit = 124;
//     string memory packagingInfo = "packagingInfo";
//     string memory metadataHash = "metadataHash";


//         _createBatch(
//             coffeeTokenAddress,
//             ipfsUri,
//             productionDate,
//             expiryDate,
//             pricePerUnit,
//             packagingInfo,
//             metadataHash
//         );
//     }

// }

// contract InitializeWAGAInventoryManager2 is Script {

//     function _initializeWAGAInventoryManager(address configManagerAddress, address coffeeTokenAddress) internal {
       
//        WAGAConfigManager configManager = WAGAConfigManager(configManagerAddress);
//         address inventoryManagerAddress = configManager.getInventoryManager();
//         WAGAInventoryManager inventoryManager = WAGAInventoryManager(inventoryManagerAddress);
//         address proofOfReserveAddress = configManager.getProofOfReserveManager();

//         uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

//         vm.startBroadcast(deployerPrivateKey);
//             inventoryManager.initialize(
//                 coffeeTokenAddress,
//                 proofOfReserveAddress
            
//             );
//         vm.stopBroadcast();
//     }
    
//     function run() public {
//         address configManagerAddress = vm.envAddress("WAGACONFIGMANAGER_ADDRESS");// replace with last deployed address
//         address coffeeTokenAddress = vm.envAddress("WAGACOFFEETOKEN_ADDRESS");// replace with last deployed address
//         _initializeWAGAInventoryManager(configManagerAddress, coffeeTokenAddress);
//     }
// }







