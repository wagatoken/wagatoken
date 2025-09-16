"use client";

import Link from "next/link";
import { SiChainlink } from 'react-icons/si';

export default function ChainlinkGuide() {
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
              <SiChainlink className="text-4xl text-blue-500" />
              <h1 className="text-4xl font-bold web3-gradient-text">Chainlink Integration Guide</h1>
            </div>
            <p className="text-xl text-gray-600">
              Technical documentation on how WAGA leverages Chainlink Functions for automated verification, 
              proof of reserve, and oracle-based data validation.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-blue-400 text-xl">⚡</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  <strong>Technical Focus:</strong> This guide covers the technical implementation of Chainlink 
                  integration within the WAGA ecosystem for developers and technical stakeholders.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-emerald-600 hover:text-emerald-800">1. Chainlink Functions Overview</a></li>
              <li><a href="#architecture" className="text-emerald-600 hover:text-emerald-800">2. System Architecture</a></li>
              <li><a href="#verification" className="text-emerald-600 hover:text-emerald-800">3. Automated Verification</a></li>
              <li><a href="#proof-reserve" className="text-emerald-600 hover:text-emerald-800">4. Proof of Reserve</a></li>
              <li><a href="#functions-source" className="text-emerald-600 hover:text-emerald-800">5. Functions Source Code</a></li>
              <li><a href="#deployment" className="text-emerald-600 hover:text-emerald-800">6. Deployment & Configuration</a></li>
              <li><a href="#monitoring" className="text-emerald-600 hover:text-emerald-800">7. Monitoring & Maintenance</a></li>
              <li><a href="#troubleshooting" className="text-emerald-600 hover:text-emerald-800">8. Troubleshooting</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Overview */}
            <section id="overview" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>⚡</span>
                <span>1. Chainlink Functions Overview</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Chainlink Functions enables WAGA to execute custom JavaScript code in a decentralized oracle network, 
                  providing automated verification and data validation for coffee batches.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔧 Core Capabilities</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Execute custom JavaScript in DON</li>
                      <li>• Access external APIs and data sources</li>
                      <li>• Return verified data to smart contracts</li>
                      <li>• Automated execution triggers</li>
                      <li>• Gas-efficient oracle operations</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🎯 WAGA Use Cases</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Coffee batch verification</li>
                      <li>• Inventory quantity validation</li>
                      <li>• IPFS metadata accessibility checks</li>
                      <li>• External quality data validation</li>
                      <li>• Proof of reserve calculations</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">🌐 Network Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">Network:</h4>
                      <p className="text-purple-600">Base Sepolia Testnet</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">DON ID:</h4>
                      <p className="text-purple-600">fun-base-sepolia-1</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">Gateway:</h4>
                      <p className="text-purple-600">0x234a5fb5Bd614a7AA2FfAB244D603abFA0Ac5C5C</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Architecture */}
            <section id="architecture" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🏗️</span>
                <span>2. System Architecture</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The Chainlink integration is built into WAGA's smart contract architecture to provide 
                  seamless automated verification workflows.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">🔄 Data Flow</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 overflow-x-auto pb-2">
                    <span className="bg-emerald-200 px-3 py-1 rounded whitespace-nowrap">Batch Created</span>
                    <span>→</span>
                    <span className="bg-blue-200 px-3 py-1 rounded whitespace-nowrap">Trigger Function</span>
                    <span>→</span>
                    <span className="bg-purple-200 px-3 py-1 rounded whitespace-nowrap">DON Execution</span>
                    <span>→</span>
                    <span className="bg-amber-200 px-3 py-1 rounded whitespace-nowrap">Data Validation</span>
                    <span>→</span>
                    <span className="bg-emerald-200 px-3 py-1 rounded whitespace-nowrap">Result Returned</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Smart Contract Integration:</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">WAGAChainlinkFunctionsBase.sol</h4>
                      <p className="text-sm text-blue-700 mb-2">Base contract handling Chainlink Functions integration:</p>
                      <ul className="text-sm text-blue-600 space-y-1">
                        <li>• Inherits from FunctionsClient</li>
                        <li>• Manages DON ID and gas limits</li>
                        <li>• Handles callback responses</li>
                        <li>• Implements access controls</li>
                      </ul>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 mb-2">WAGAProofOfReserve.sol</h4>
                      <p className="text-sm text-emerald-700 mb-2">Specialized contract for inventory validation:</p>
                      <ul className="text-sm text-emerald-600 space-y-1">
                        <li>• Tracks total coffee inventory</li>
                        <li>• Validates batch quantities</li>
                        <li>• Automated reserve calculations</li>
                        <li>• Integration with verification workflow</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">WAGAInventoryManager.sol</h4>
                      <p className="text-sm text-amber-700 mb-2">Core inventory management with Chainlink triggers:</p>
                      <ul className="text-sm text-amber-600 space-y-1">
                        <li>• Batch creation triggers verification</li>
                        <li>• Inventory updates trigger reserve checks</li>
                        <li>• Status updates based on oracle results</li>
                        <li>• Automated verification workflow</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Automated Verification */}
            <section id="verification" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>✅</span>
                <span>3. Automated Verification</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Chainlink Functions automate the verification process by executing custom JavaScript 
                  that validates batch data against multiple sources.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔍 Verification Checks</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• IPFS metadata accessibility</li>
                      <li>• Batch information completeness</li>
                      <li>• Farm certification validation</li>
                      <li>• Quality score verification</li>
                      <li>• Inventory quantity matching</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">⚡ Execution Triggers</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• New batch creation events</li>
                      <li>• Admin verification requests</li>
                      <li>• Scheduled periodic checks</li>
                      <li>• Inventory level changes</li>
                      <li>• Manual admin overrides</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Process Flow:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Trigger Detection</h4>
                        <p className="text-gray-700">Smart contract detects batch creation or verification request.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Function Request</h4>
                        <p className="text-gray-700">Contract submits request to Chainlink Functions with batch data.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">DON Execution</h4>
                        <p className="text-gray-700">Decentralized Oracle Network executes verification JavaScript.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Data Validation</h4>
                        <p className="text-gray-700">Function validates IPFS data, checks external sources, performs calculations.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Result Callback</h4>
                        <p className="text-gray-700">Verification result returned to smart contract and batch status updated.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🛡️ Security Features</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Multiple oracle nodes validate results</li>
                    <li>• Consensus mechanisms prevent manipulation</li>
                    <li>• Encrypted secrets for API access</li>
                    <li>• Fallback mechanisms for failures</li>
                    <li>• Audit trail for all verifications</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Proof of Reserve */}
            <section id="proof-reserve" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>💎</span>
                <span>4. Proof of Reserve</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The Proof of Reserve system ensures that all minted tokens are backed by actual coffee inventory, 
                  providing transparency and trust in the tokenization process.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">📊 Reserve Metrics</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Total coffee inventory (kg)</li>
                      <li>• Total tokens minted</li>
                      <li>• Reserve ratio (inventory/tokens)</li>
                      <li>• Batch-specific reserves</li>
                      <li>• Pending verification amounts</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔄 Validation Process</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Real-time inventory tracking</li>
                      <li>• Automated reconciliation checks</li>
                      <li>• External audit integration</li>
                      <li>• Discrepancy detection alerts</li>
                      <li>• Historical trend analysis</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Reserve Calculation Logic:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`// Simplified proof of reserve calculation
function calculateReserveRatio(totalInventory, totalTokens) {
  // Ensure 1:1 backing minimum
  const requiredInventory = totalTokens * 1.0; // 1 token = 1 unit coffee
  
  // Calculate current ratio
  const currentRatio = totalInventory / totalTokens;
  
  // Validate sufficient reserves
  const isFullyBacked = currentRatio >= 1.0;
  
  return {
    ratio: currentRatio,
    isFullyBacked: isFullyBacked,
    shortfall: isFullyBacked ? 0 : (requiredInventory - totalInventory)
  };
}`}
                    </pre>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">⚠️ Reserve Monitoring</h3>
                  <div className="text-sm text-amber-700 space-y-2">
                    <p><strong>Continuous Monitoring:</strong> Chainlink Functions run periodic checks every 24 hours</p>
                    <p><strong>Alert Thresholds:</strong> Notifications triggered if reserve ratio falls below 95%</p>
                    <p><strong>Emergency Procedures:</strong> Automatic token minting suspension if reserves insufficient</p>
                    <p><strong>Recovery Actions:</strong> Admin notifications and reconciliation workflows activated</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Functions Source Code */}
            <section id="functions-source" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>💻</span>
                <span>5. Functions Source Code</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The JavaScript source code executed by Chainlink Functions performs comprehensive 
                  validation and verification checks.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">📁 Source Code Structure</h3>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p><strong>Main Function:</strong> <code>chainlink/functions-source.js</code></p>
                    <p><strong>IPFS Validation:</strong> Checks metadata accessibility and structure</p>
                    <p><strong>Inventory Validation:</strong> Verifies quantity and availability</p>
                    <p><strong>Quality Checks:</strong> Validates assessment scores and documentation</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Key Function Components:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`// WAGA Coffee Batch Verification Function
// Validates batch data and returns verification status

const batchId = args[0];
const ipfsHash = args[1];
const expectedQuantity = parseInt(args[2]);

// 1. Validate IPFS metadata accessibility
const ipfsUrl = \`https://gateway.pinata.cloud/ipfs/\${ipfsHash}\`;
const ipfsResponse = await Functions.makeHttpRequest({
  url: ipfsUrl,
  method: "GET"
});

if (ipfsResponse.error) {
  return Functions.encodeString("IPFS_VALIDATION_FAILED");
}

// 2. Parse and validate metadata structure
const metadata = ipfsResponse.data;
const requiredFields = ['farmName', 'processingMethod', 'quantity'];
const isValidStructure = requiredFields.every(field => 
  metadata.hasOwnProperty(field) && metadata[field] !== null
);

if (!isValidStructure) {
  return Functions.encodeString("METADATA_STRUCTURE_INVALID");
}

// 3. Validate quantity consistency
const metadataQuantity = parseInt(metadata.quantity);
if (metadataQuantity !== expectedQuantity) {
  return Functions.encodeString("QUANTITY_MISMATCH");
}

// 4. Additional quality validations
const hasQualityScore = metadata.qualityScore && metadata.qualityScore > 0;
const hasValidOrigin = metadata.farmLocation && metadata.farmLocation.length > 0;

if (!hasQualityScore || !hasValidOrigin) {
  return Functions.encodeString("QUALITY_VALIDATION_FAILED");
}

// All validations passed
return Functions.encodeString("VERIFIED");`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">✅ Success Responses</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• <code>VERIFIED</code> - All checks passed</li>
                      <li>• <code>PARTIAL_VERIFIED</code> - Minor issues found</li>
                      <li>• <code>PENDING_REVIEW</code> - Manual review needed</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">❌ Error Responses</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• <code>IPFS_VALIDATION_FAILED</code> - IPFS unreachable</li>
                      <li>• <code>METADATA_STRUCTURE_INVALID</code> - Missing fields</li>
                      <li>• <code>QUANTITY_MISMATCH</code> - Inventory inconsistency</li>
                      <li>• <code>QUALITY_VALIDATION_FAILED</code> - Quality issues</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Deployment & Configuration */}
            <section id="deployment" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🚀</span>
                <span>6. Deployment & Configuration</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Proper deployment and configuration of Chainlink Functions integration requires 
                  careful setup of contracts, subscriptions, and monitoring systems.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Deployment Checklist:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Deploy Smart Contracts</h4>
                        <p className="text-gray-700">Deploy WAGAChainlinkFunctionsBase and related contracts to Base Sepolia.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Create Functions Subscription</h4>
                        <p className="text-gray-700">Set up Chainlink Functions subscription and fund with LINK tokens.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Configure DON Settings</h4>
                        <p className="text-gray-700">Set correct DON ID, gas limits, and callback gas limits.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Upload Source Code</h4>
                        <p className="text-gray-700">Upload JavaScript source code and configure secrets management.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Test Integration</h4>
                        <p className="text-gray-700">Execute test verification requests and validate responses.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔧 Configuration Parameters</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• DON ID: <code>fun-base-sepolia-1</code></li>
                      <li>• Gas Limit: <code>300,000</code></li>
                      <li>• Callback Gas Limit: <code>100,000</code></li>
                      <li>• Subscription ID: <code>[Generated]</code></li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">💰 Cost Considerations</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• LINK token costs per request</li>
                      <li>• Gas costs for callback transactions</li>
                      <li>• Subscription maintenance fees</li>
                      <li>• Monitoring and alerting costs</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Monitoring */}
            <section id="monitoring" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📊</span>
                <span>7. Monitoring & Maintenance</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Continuous monitoring ensures Chainlink Functions operate reliably and efficiently 
                  within the WAGA ecosystem.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📈 Key Metrics</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Request success rate</li>
                      <li>• Average response time</li>
                      <li>• LINK balance status</li>
                      <li>• Error frequency</li>
                      <li>• Gas usage trends</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔔 Alert Types</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Low LINK balance warnings</li>
                      <li>• Request failure alerts</li>
                      <li>• High latency notifications</li>
                      <li>• Reserve ratio warnings</li>
                      <li>• System health alerts</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">🔧 Maintenance Tasks</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Subscription funding</li>
                      <li>• Source code updates</li>
                      <li>• Configuration adjustments</li>
                      <li>• Performance optimization</li>
                      <li>• Security reviews</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">⏰ Recommended Monitoring Schedule</h3>
                  <div className="text-sm text-amber-700 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Daily:</strong> Check LINK balance, review error logs</p>
                        <p><strong>Weekly:</strong> Analyze performance metrics, update documentation</p>
                      </div>
                      <div>
                        <p><strong>Monthly:</strong> Review gas optimization, security audit</p>
                        <p><strong>Quarterly:</strong> Full system review, cost analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔧</span>
                <span>8. Troubleshooting</span>
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Common Issues & Solutions:</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">🚨 Request Failures</h4>
                      <div className="text-sm text-red-700 space-y-2">
                        <p><strong>Symptoms:</strong> Functions not executing, no callback received</p>
                        <p><strong>Causes:</strong> Insufficient LINK balance, incorrect DON ID, gas limit too low</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Check and fund LINK subscription balance</li>
                          <li>Verify DON ID configuration matches network</li>
                          <li>Increase gas limits if transactions are failing</li>
                          <li>Review source code for syntax errors</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">⚠️ Verification Errors</h4>
                      <div className="text-sm text-amber-700 space-y-2">
                        <p><strong>Symptoms:</strong> Batches failing verification unexpectedly</p>
                        <p><strong>Causes:</strong> IPFS accessibility issues, metadata format changes</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Test IPFS URLs manually for accessibility</li>
                          <li>Validate metadata structure against expected format</li>
                          <li>Check Pinata service status and API limits</li>
                          <li>Review and update validation logic if needed</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">🐌 Performance Issues</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <p><strong>Symptoms:</strong> Slow response times, high gas costs</p>
                        <p><strong>Causes:</strong> Network congestion, inefficient source code</p>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Optimize JavaScript code for efficiency</li>
                          <li>Reduce external API calls where possible</li>
                          <li>Implement caching for frequently accessed data</li>
                          <li>Monitor network conditions and adjust timing</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-3">🛠️ Debugging Tools</h3>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• Chainlink Functions Playground for testing</li>
                    <li>• Base Sepolia block explorer for transaction analysis</li>
                    <li>• Contract event logs for request tracking</li>
                    <li>• IPFS gateways for metadata validation</li>
                    <li>• Network monitoring tools for performance analysis</li>
                  </ul>
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
              <Link href="/docs/guides/smart-contracts" className="web3-gradient-button block text-center">
                📝 Smart Contracts
              </Link>
              <Link href="/docs/guides/admin" className="web3-button-outline block text-center">
                🏭 Admin Guide
              </Link>
              <Link href="/docs/guides/ipfs-storage" className="web3-button-outline block text-center">
                📡 IPFS Storage
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
