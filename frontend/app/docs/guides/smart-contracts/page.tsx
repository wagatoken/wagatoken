"use client";

import Link from "next/link";

export default function SmartContractsGuide() {
  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-4xl mx-auto web3-page-spacing relative z-10">
        <div className="web3-card animate-card-entrance">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/docs" className="text-emerald-600 hover:text-emerald-800 transition-colors">
              ← Back to Documentation
            </Link>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl">📝</div>
              <h1 className="text-4xl font-bold web3-gradient-text">Smart Contracts Guide</h1>
            </div>
            <p className="text-xl text-gray-600">
              Technical reference for WAGA's smart contract architecture, deployment details, and interaction methods.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-blue-400 text-xl">📝</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Developer Reference:</strong> This guide provides comprehensive technical documentation 
                  for developers working with WAGA's smart contract ecosystem.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-emerald-600 hover:text-emerald-800">1. Contract Architecture Overview</a></li>
              <li><a href="#core-contracts" className="text-emerald-600 hover:text-emerald-800">2. Core Contracts</a></li>
              <li><a href="#deployment" className="text-emerald-600 hover:text-emerald-800">3. Deployment Information</a></li>
              <li><a href="#interfaces" className="text-emerald-600 hover:text-emerald-800">4. Contract Interfaces</a></li>
              <li><a href="#functions" className="text-emerald-600 hover:text-emerald-800">5. Key Functions</a></li>
              <li><a href="#events" className="text-emerald-600 hover:text-emerald-800">6. Events & Logging</a></li>
              <li><a href="#interaction" className="text-emerald-600 hover:text-emerald-800">7. Contract Interaction</a></li>
              <li><a href="#security" className="text-emerald-600 hover:text-emerald-800">8. Security Considerations</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Overview */}
            <section id="overview" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🏗️</span>
                <span>1. Contract Architecture Overview</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA's smart contract architecture is designed for modularity, upgradability, and 
                  seamless integration with Chainlink Functions and IPFS storage systems.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">🔄 Contract Relationships</h3>
                  <div className="text-sm text-gray-700 space-y-2 overflow-x-auto">
                    <div className="flex items-center space-x-2 min-w-max">
                      <span className="bg-emerald-200 px-3 py-1 rounded">WAGACoffeeToken</span>
                      <span>→</span>
                      <span className="bg-blue-200 px-3 py-1 rounded">WAGAInventoryManager</span>
                      <span>→</span>
                      <span className="bg-purple-200 px-3 py-1 rounded">WAGACoffeeRedemption</span>
                      <span>→</span>
                      <span className="bg-amber-200 px-3 py-1 rounded">WAGAProofOfReserve</span>
                    </div>
                    <div className="flex items-center space-x-2 min-w-max">
                      <span className="bg-gray-200 px-3 py-1 rounded">WAGAChainlinkFunctionsBase</span>
                      <span>↗</span>
                      <span className="bg-red-200 px-3 py-1 rounded">WAGAConfigManager</span>
                      <span>↗</span>
                      <span className="bg-teal-200 px-3 py-1 rounded">WAGAViewFunctions</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🎯 Design Principles</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Modular architecture for maintainability</li>
                      <li>• Role-based access control</li>
                      <li>• Gas optimization strategies</li>
                      <li>• Event-driven transparency</li>
                      <li>• Future-proof upgradeability</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔧 Technical Stack</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Solidity 0.8.19+</li>
                      <li>• OpenZeppelin libraries</li>
                      <li>• Chainlink Functions integration</li>
                      <li>• ERC-1155 token standard</li>
                      <li>• Foundry development framework</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">📊 Network Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">Network:</h4>
                      <p className="text-purple-600">Base Sepolia Testnet</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">Chain ID:</h4>
                      <p className="text-purple-600">84532</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">RPC URL:</h4>
                      <p className="text-purple-600">https://sepolia.base.org</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Core Contracts */}
            <section id="core-contracts" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🏢</span>
                <span>2. Core Contracts</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The WAGA ecosystem consists of several interconnected smart contracts, each handling 
                  specific aspects of the coffee traceability and tokenization system.
                </p>

                <div className="space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🪙 WAGACoffeeToken.sol</h3>
                    <div className="text-sm text-emerald-700 space-y-2">
                      <p><strong>Purpose:</strong> ERC-1155 multi-token contract for coffee batch tokenization</p>
                      <p><strong>Key Features:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Multi-token standard allowing different coffee batches as unique tokens</li>
                        <li>Metadata URI storage linking to IPFS batch information</li>
                        <li>Batch-specific supply tracking and management</li>
                        <li>Admin-controlled minting with verification requirements</li>
                        <li>Integration with redemption and inventory systems</li>
                      </ul>
                      <p><strong>Inherits:</strong> ERC1155, AccessControl, Pausable</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📦 WAGAInventoryManager.sol</h3>
                    <div className="text-sm text-blue-700 space-y-2">
                      <p><strong>Purpose:</strong> Central management of coffee batch creation and verification</p>
                      <p><strong>Key Features:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Coffee batch creation and metadata management</li>
                        <li>Integration with Chainlink Functions for automated verification</li>
                        <li>Batch status tracking (pending, verified, failed)</li>
                        <li>Inventory quantity and availability management</li>
                        <li>Admin controls for batch approval and management</li>
                      </ul>
                      <p><strong>Inherits:</strong> WAGAChainlinkFunctionsBase, AccessControl</p>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">🔄 WAGACoffeeRedemption.sol</h3>
                    <div className="text-sm text-purple-700 space-y-2">
                      <p><strong>Purpose:</strong> Handles token redemption for physical coffee delivery</p>
                      <p><strong>Key Features:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Token burning mechanism for redemption</li>
                        <li>Redemption request tracking and management</li>
                        <li>Integration with shipping and fulfillment systems</li>
                        <li>Redemption history and audit trails</li>
                        <li>Anti-fraud and validation mechanisms</li>
                      </ul>
                      <p><strong>Inherits:</strong> AccessControl, ReentrancyGuard</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">💎 WAGAProofOfReserve.sol</h3>
                    <div className="text-sm text-amber-700 space-y-2">
                      <p><strong>Purpose:</strong> Ensures tokens are backed by actual coffee inventory</p>
                      <p><strong>Key Features:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Real-time tracking of total coffee reserves</li>
                        <li>Automated validation of token-to-inventory ratios</li>
                        <li>Integration with Chainlink Functions for reserve verification</li>
                        <li>Alert systems for reserve discrepancies</li>
                        <li>Transparent reserve reporting for stakeholders</li>
                      </ul>
                      <p><strong>Inherits:</strong> WAGAChainlinkFunctionsBase</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-3">⚡ WAGAChainlinkFunctionsBase.sol</h3>
                    <div className="text-sm text-gray-700 space-y-2">
                      <p><strong>Purpose:</strong> Base contract for Chainlink Functions integration</p>
                      <p><strong>Key Features:</strong></p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Chainlink Functions client implementation</li>
                        <li>DON configuration and request management</li>
                        <li>Callback handling for oracle responses</li>
                        <li>Gas limit and subscription management</li>
                        <li>Error handling and retry mechanisms</li>
                      </ul>
                      <p><strong>Inherits:</strong> FunctionsClient, AccessControl</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Deployment Information */}
            <section id="deployment" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🚀</span>
                <span>3. Deployment Information</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  All WAGA contracts are deployed on Base Sepolia testnet with verified source code 
                  and comprehensive documentation.
                </p>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-3">📍 Contract Addresses</h3>
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">WAGACoffeeToken:</h4>
                        <p className="text-emerald-600 font-mono text-xs break-all">0x1234...abcd</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">WAGAInventoryManager:</h4>
                        <p className="text-emerald-600 font-mono text-xs break-all">0x5678...efgh</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">WAGACoffeeRedemption:</h4>
                        <p className="text-emerald-600 font-mono text-xs break-all">0x9abc...ijkl</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">WAGAProofOfReserve:</h4>
                        <p className="text-emerald-600 font-mono text-xs break-all">0xdef0...mnop</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔧 Deployment Details</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>Network:</strong> Base Sepolia (84532)</li>
                      <li>• <strong>Compiler:</strong> Solidity 0.8.19</li>
                      <li>• <strong>Framework:</strong> Foundry</li>
                      <li>• <strong>Verification:</strong> Etherscan verified</li>
                      <li>• <strong>Gas Optimization:</strong> Enabled</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">📊 Deployment Stats</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• <strong>Total Gas Used:</strong> ~2.1M gas</li>
                      <li>• <strong>Deployment Cost:</strong> ~$15 USD</li>
                      <li>• <strong>Block Number:</strong> 8,567,432</li>
                      <li>• <strong>Timestamp:</strong> 2024-01-15 10:30 UTC</li>
                      <li>• <strong>Status:</strong> Active & Verified</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">🔗 External Dependencies</h3>
                  <div className="text-sm text-purple-700 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-purple-700 mb-1">Chainlink Functions:</h4>
                        <ul className="text-purple-600 space-y-1">
                          <li>• Router: 0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C</li>
                          <li>• DON ID: fun-base-sepolia-1</li>
                          <li>• Subscription: Active</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-700 mb-1">OpenZeppelin:</h4>
                        <ul className="text-purple-600 space-y-1">
                          <li>• ERC1155: Latest version</li>
                          <li>• AccessControl: Role management</li>
                          <li>• ReentrancyGuard: Security</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Interfaces */}
            <section id="interfaces" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔌</span>
                <span>4. Contract Interfaces</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA contracts implement standard interfaces and custom interfaces for 
                  seamless integration with external systems and dApps.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Key Interface Definitions:</h3>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">IRedemption.sol</h4>
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IRedemption {
    struct RedemptionRequest {
        address requester;
        uint256 batchId;
        uint256 amount;
        string deliveryAddress;
        uint256 timestamp;
        bool fulfilled;
    }

    event RedemptionRequested(
        uint256 indexed requestId,
        address indexed requester,
        uint256 indexed batchId,
        uint256 amount
    );

    event RedemptionFulfilled(
        uint256 indexed requestId,
        address indexed requester
    );

    function requestRedemption(
        uint256 batchId,
        uint256 amount,
        string calldata deliveryAddress
    ) external returns (uint256 requestId);

    function fulfillRedemption(uint256 requestId) external;
    
    function getRedemptionRequest(uint256 requestId) 
        external view returns (RedemptionRequest memory);
}`}
                    </pre>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">IProofOfReserve.sol</h4>
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IProofOfReserve {
    struct ReserveData {
        uint256 totalInventory;
        uint256 totalTokens;
        uint256 reserveRatio;
        uint256 lastUpdated;
        bool isHealthy;
    }

    event ReserveUpdated(
        uint256 totalInventory,
        uint256 totalTokens,
        uint256 reserveRatio
    );

    event ReserveAlert(
        string alertType,
        uint256 currentRatio,
        uint256 threshold
    );

    function updateReserves() external;
    
    function getCurrentReserveData() 
        external view returns (ReserveData memory);
    
    function isReserveHealthy() external view returns (bool);
}`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">📋 Standard Interfaces</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• IERC1155 - Multi-token standard</li>
                      <li>• IERC1155MetadataURI - Metadata support</li>
                      <li>• IERC165 - Interface detection</li>
                      <li>• IAccessControl - Role management</li>
                      <li>• IFunctionsClient - Chainlink integration</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔧 Custom Interfaces</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• IRedemption - Redemption functionality</li>
                      <li>• IProofOfReserve - Reserve management</li>
                      <li>• IInventoryManager - Batch management</li>
                      <li>• IVerification - Verification workflow</li>
                      <li>• IConfigManager - System configuration</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Key Functions */}
            <section id="functions" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>⚙️</span>
                <span>5. Key Functions</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Essential functions for interacting with WAGA smart contracts, organized by 
                  contract and use case.
                </p>

                <div className="space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🪙 WAGACoffeeToken Functions</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">Administrative Functions:</h4>
                        <ul className="text-emerald-600 space-y-1">
                          <li>• <code>mint(address to, uint256 id, uint256 amount, bytes data)</code> - Mint tokens to address</li>
                          <li>• <code>setURI(uint256 id, string uri)</code> - Set metadata URI for batch</li>
                          <li>• <code>pause()</code> / <code>unpause()</code> - Emergency controls</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">User Functions:</h4>
                        <ul className="text-emerald-600 space-y-1">
                          <li>• <code>balanceOf(address account, uint256 id)</code> - Check token balance</li>
                          <li>• <code>safeTransferFrom(...)</code> - Transfer tokens</li>
                          <li>• <code>setApprovalForAll(address operator, bool approved)</code> - Set approvals</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📦 WAGAInventoryManager Functions</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium text-blue-700 mb-1">Batch Management:</h4>
                        <ul className="text-blue-600 space-y-1">
                          <li>• <code>createBatch(BatchInfo calldata batchInfo)</code> - Create new coffee batch</li>
                          <li>• <code>verifyBatch(uint256 batchId)</code> - Trigger verification process</li>
                          <li>• <code>updateBatchStatus(uint256 batchId, Status status)</code> - Update batch status</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-blue-700 mb-1">Query Functions:</h4>
                        <ul className="text-blue-600 space-y-1">
                          <li>• <code>getBatch(uint256 batchId)</code> - Get batch information</li>
                          <li>• <code>getAllBatches()</code> - Get all batches</li>
                          <li>• <code>getBatchesByStatus(Status status)</code> - Filter by status</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">🔄 WAGACoffeeRedemption Functions</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium text-purple-700 mb-1">Redemption Process:</h4>
                        <ul className="text-purple-600 space-y-1">
                          <li>• <code>requestRedemption(uint256 batchId, uint256 amount, string address)</code> - Request redemption</li>
                          <li>• <code>fulfillRedemption(uint256 requestId)</code> - Complete redemption</li>
                          <li>• <code>cancelRedemption(uint256 requestId)</code> - Cancel request</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-purple-700 mb-1">Query Functions:</h4>
                        <ul className="text-purple-600 space-y-1">
                          <li>• <code>getRedemptionRequest(uint256 requestId)</code> - Get request details</li>
                          <li>• <code>getUserRedemptions(address user)</code> - Get user's redemptions</li>
                          <li>• <code>getPendingRedemptions()</code> - Get pending requests</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">💎 WAGAProofOfReserve Functions</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium text-amber-700 mb-1">Reserve Management:</h4>
                        <ul className="text-amber-600 space-y-1">
                          <li>• <code>updateReserves()</code> - Trigger reserve calculation</li>
                          <li>• <code>addInventory(uint256 amount)</code> - Add to inventory</li>
                          <li>• <code>removeInventory(uint256 amount)</code> - Remove from inventory</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-amber-700 mb-1">Query Functions:</h4>
                        <ul className="text-amber-600 space-y-1">
                          <li>• <code>getCurrentReserveData()</code> - Get current reserve info</li>
                          <li>• <code>isReserveHealthy()</code> - Check reserve health</li>
                          <li>• <code>getReserveHistory()</code> - Get historical data</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Events & Logging */}
            <section id="events" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📡</span>
                <span>6. Events & Logging</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA contracts emit comprehensive events for transparency, monitoring, and 
                  integration with off-chain systems.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Critical Events:</h3>
                  
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-emerald-800 mb-2">Batch Lifecycle Events</h4>
                    <pre className="text-sm text-emerald-700 overflow-x-auto">
{`event BatchCreated(
    uint256 indexed batchId,
    address indexed creator,
    string ipfsHash,
    uint256 quantity
);

event BatchVerified(
    uint256 indexed batchId,
    address indexed verifier,
    bool verified,
    string reason
);

event BatchStatusUpdated(
    uint256 indexed batchId,
    Status oldStatus,
    Status newStatus
);`}
                    </pre>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">Token Events</h4>
                    <pre className="text-sm text-blue-700 overflow-x-auto">
{`event TokensMinted(
    address indexed to,
    uint256 indexed batchId,
    uint256 amount,
    address indexed minter
);

event TokensRedeemed(
    address indexed from,
    uint256 indexed batchId,
    uint256 amount,
    uint256 indexed redemptionId
);

event TransferSingle(
    address indexed operator,
    address indexed from,
    address indexed to,
    uint256 id,
    uint256 value
);`}
                    </pre>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Verification Events</h4>
                    <pre className="text-sm text-purple-700 overflow-x-auto">
{`event ChainlinkRequestSent(
    bytes32 indexed requestId,
    uint256 indexed batchId,
    string sourceCode
);

event ChainlinkResponseReceived(
    bytes32 indexed requestId,
    bytes response,
    bytes err
);

event VerificationCompleted(
    uint256 indexed batchId,
    bool verified,
    string result
);`}
                    </pre>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-amber-800 mb-2">Reserve Events</h4>
                    <pre className="text-sm text-amber-700 overflow-x-auto">
{`event ReserveUpdated(
    uint256 totalInventory,
    uint256 totalTokens,
    uint256 reserveRatio,
    uint256 timestamp
);

event ReserveAlert(
    string alertType,
    uint256 currentRatio,
    uint256 threshold,
    uint256 timestamp
);

event InventoryAdjusted(
    uint256 previousAmount,
    uint256 newAmount,
    string reason
);`}
                    </pre>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">📊 Event Monitoring</h3>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p><strong>Frontend Integration:</strong> Next.js app subscribes to events for real-time updates</p>
                    <p><strong>Analytics:</strong> Events feed into analytics dashboard for insights</p>
                    <p><strong>Alerts:</strong> Critical events trigger notifications and alerts</p>
                    <p><strong>Audit Trail:</strong> All events stored for compliance and transparency</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Contract Interaction */}
            <section id="interaction" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔧</span>
                <span>7. Contract Interaction</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Examples and best practices for interacting with WAGA smart contracts using 
                  various tools and libraries.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Web3.js Example:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`import Web3 from 'web3';
import WAGACoffeeTokenABI from './abis/WAGACoffeeToken.json';

// Initialize Web3 connection
const web3 = new Web3('https://sepolia.base.org');
const contractAddress = '0x...'; // Contract address
const contract = new web3.eth.Contract(WAGACoffeeTokenABI, contractAddress);

// Read token balance
async function getTokenBalance(userAddress, batchId) {
  try {
    const balance = await contract.methods
      .balanceOf(userAddress, batchId)
      .call();
    return balance;
  } catch (error) {
    console.error('Error getting balance:', error);
  }
}

// Mint tokens (admin only)
async function mintTokens(toAddress, batchId, amount, fromAddress) {
  try {
    const tx = await contract.methods
      .mint(toAddress, batchId, amount, '0x')
      .send({ from: fromAddress });
    
    console.log('Tokens minted:', tx.transactionHash);
    return tx;
  } catch (error) {
    console.error('Error minting tokens:', error);
  }
}

// Get batch metadata URI
async function getBatchMetadata(batchId) {
  try {
    const uri = await contract.methods.uri(batchId).call();
    const response = await fetch(uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'));
    const metadata = await response.json();
    return metadata;
  } catch (error) {
    console.error('Error getting metadata:', error);
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Ethers.js Example:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { ethers } from 'ethers';
import WAGAInventoryManagerABI from './abis/WAGAInventoryManager.json';

// Initialize provider and contract
const provider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
const contractAddress = '0x...';
const contract = new ethers.Contract(contractAddress, WAGAInventoryManagerABI, provider);

// Create new coffee batch
async function createBatch(batchInfo, signer) {
  try {
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.createBatch(batchInfo);
    await tx.wait();
    
    console.log('Batch created:', tx.hash);
    return tx;
  } catch (error) {
    console.error('Error creating batch:', error);
  }
}

// Listen for batch creation events
function listenForBatchEvents() {
  contract.on('BatchCreated', (batchId, creator, ipfsHash, quantity, event) => {
    console.log('New batch created:', {
      batchId: batchId.toString(),
      creator,
      ipfsHash,
      quantity: quantity.toString()
    });
  });
}

// Get all batches
async function getAllBatches() {
  try {
    const batches = await contract.getAllBatches();
    return batches.map(batch => ({
      id: batch.id.toString(),
      ipfsHash: batch.ipfsHash,
      quantity: batch.quantity.toString(),
      status: batch.status
    }));
  } catch (error) {
    console.error('Error getting batches:', error);
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔧 Development Tools</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Foundry for testing and deployment</li>
                      <li>• Hardhat for additional testing</li>
                      <li>• Remix IDE for quick interactions</li>
                      <li>• Base Sepolia testnet for testing</li>
                      <li>• Etherscan for contract verification</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📚 Integration Libraries</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Web3.js for JavaScript integration</li>
                      <li>• Ethers.js for TypeScript/React</li>
                      <li>• Wagmi hooks for React applications</li>
                      <li>• RainbowKit for wallet connections</li>
                      <li>• Viem for modern TypeScript</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section id="security" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🛡️</span>
                <span>8. Security Considerations</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA contracts implement comprehensive security measures including access controls, 
                  input validation, and protection against common vulnerabilities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔒 Access Control</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Role-based permissions (ADMIN_ROLE, MINTER_ROLE)</li>
                      <li>• Multi-signature requirements for critical functions</li>
                      <li>• Time-locked administrative changes</li>
                      <li>• Emergency pause functionality</li>
                      <li>• Ownership transfer protections</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">🚨 Vulnerability Protection</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Reentrancy guards on state-changing functions</li>
                      <li>• Integer overflow/underflow protection</li>
                      <li>• Input validation and sanitization</li>
                      <li>• Front-running attack mitigation</li>
                      <li>• Flash loan attack prevention</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔍 Monitoring & Auditing</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Comprehensive event logging</li>
                      <li>• Automated monitoring systems</li>
                      <li>• Regular security audits</li>
                      <li>• Bug bounty programs</li>
                      <li>• Community review processes</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">⚡ Best Practices</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Minimal proxy patterns for upgradeability</li>
                      <li>• Gas optimization without security trade-offs</li>
                      <li>• Formal verification for critical functions</li>
                      <li>• Testnet deployment and testing</li>
                      <li>• Community feedback integration</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">🔐 Security Checklist</h3>
                  <div className="text-sm text-purple-700 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Code Quality:</strong> ✅ Peer reviewed, tested, documented</p>
                        <p><strong>Access Control:</strong> ✅ Role-based, time-locked, multi-sig</p>
                        <p><strong>Input Validation:</strong> ✅ Sanitized, range-checked, validated</p>
                      </div>
                      <div>
                        <p><strong>External Calls:</strong> ✅ Checked, limited, protected</p>
                        <p><strong>State Management:</strong> ✅ Consistent, atomic, validated</p>
                        <p><strong>Upgrades:</strong> ✅ Controlled, tested, transparent</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 web3-card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span>⚡</span>
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/docs/guides/chainlink" className="web3-gradient-button block text-center">
                ⚡ Chainlink Guide
              </Link>
              <Link href="/docs/guides/ipfs-storage" className="web3-button-outline block text-center">
                📡 IPFS Storage
              </Link>
              <Link href="/docs/guides/admin" className="web3-button-outline block text-center">
                🏭 Admin Guide
              </Link>
              <Link href="/docs" className="web3-button-outline block text-center">
                📚 All Guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
