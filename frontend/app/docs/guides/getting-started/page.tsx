"use client";

import Link from "next/link";

export default function GettingStartedGuide() {
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
              <div className="text-4xl">🚀</div>
              <h1 className="text-4xl font-bold web3-gradient-text">Getting Started with WAGA Coffee</h1>
            </div>
            <p className="text-xl text-gray-600">
              Learn how to navigate the WAGA platform, connect your wallet, and start trading tokenized Ethiopian coffee.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-emerald-600 hover:text-emerald-800">1. Platform Overview</a></li>
              <li><a href="#wallet" className="text-emerald-600 hover:text-emerald-800">2. Connecting Your Wallet</a></li>
              <li><a href="#browse" className="text-emerald-600 hover:text-emerald-800">3. Browsing Coffee Batches</a></li>
              <li><a href="#purchase" className="text-emerald-600 hover:text-emerald-800">4. Purchasing Coffee Tokens</a></li>
              <li><a href="#redeem" className="text-emerald-600 hover:text-emerald-800">5. Redeeming for Physical Coffee</a></li>
              <li><a href="#verification" className="text-emerald-600 hover:text-emerald-800">6. Understanding Verification</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Platform Overview */}
            <section id="overview" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🌍</span>
                <span>1. Platform Overview</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA Coffee Platform is a revolutionary blockchain-powered coffee traceability system that tokenizes premium Ethiopian coffee. 
                  Our platform ensures complete transparency from farm to cup through Web3 technology.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">🔗 Blockchain Technology</h3>
                    <p className="text-sm text-emerald-700">
                      Built on Base Sepolia with ERC-1155 tokens representing verified coffee batches.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-2">☕ Premium Coffee</h3>
                    <p className="text-sm text-amber-700">
                      Directly sourced from Ethiopian highlands with complete traceability documentation.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">⚡ Chainlink Verification</h3>
                    <p className="text-sm text-blue-700">
                      Automated inventory verification using Chainlink Functions for transparency.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">📦 IPFS Storage</h3>
                    <p className="text-sm text-purple-700">
                      Immutable metadata storage via Pinata for complete batch documentation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Connecting Wallet */}
            <section id="wallet" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔐</span>
                <span>2. Connecting Your Wallet</span>
              </h2>
              
              <div className="space-y-6">
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="text-amber-400 text-xl">⚠️</div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        <strong>Important:</strong> Make sure you're connected to the Base Sepolia testnet. 
                        You'll need testnet ETH for transaction fees.
                      </p>
                    </div>
                  </div>
                </div>

                <ol className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Install MetaMask</h3>
                      <p className="text-gray-700">Download and install MetaMask from <a href="https://metamask.io" target="_blank" className="text-emerald-600 hover:underline">metamask.io</a></p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Add Base Sepolia Network</h3>
                      <div className="text-gray-700">
                        <p>Add the Base Sepolia testnet to MetaMask:</p>
                        <div className="mt-2 bg-gray-100 p-3 rounded-md text-sm font-mono">
                          <div>Network Name: Base Sepolia</div>
                          <div>RPC URL: https://sepolia.base.org</div>
                          <div>Chain ID: 84532</div>
                          <div>Symbol: ETH</div>
                          <div>Block Explorer: https://sepolia-explorer.base.org</div>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Get Testnet ETH</h3>
                      <p className="text-gray-700">Visit the <a href="https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet" target="_blank" className="text-emerald-600 hover:underline">Base Sepolia faucet</a> to get free testnet ETH.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Connect to WAGA</h3>
                      <p className="text-gray-700">Click the "Connect Wallet" button on any WAGA platform page and approve the connection.</p>
                    </div>
                  </li>
                </ol>
              </div>
            </section>

            {/* Browsing Coffee Batches */}
            <section id="browse" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🌱</span>
                <span>3. Browsing Coffee Batches</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The Browse Coffee page allows you to explore all available verified coffee batches from Ethiopian farms.
                </p>

                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">🔍 Search & Filter</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Search by farm name, location, or batch ID</li>
                      <li>• Filter by packaging type (Washed, Natural, Honey)</li>
                      <li>• View only verified batches</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">📊 Batch Information</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Farm details and location</li>
                      <li>• Roast level and processing method</li>
                      <li>• Pricing and availability</li>
                      <li>• Verification status and date</li>
                      <li>• IPFS metadata links</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">✅ Verification Badges</h3>
                    <div className="text-sm text-purple-700 space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs">Verified</span>
                        <span>Batch has passed all verification checks</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">Pending</span>
                        <span>Verification in progress</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Failed</span>
                        <span>Verification failed - not available for purchase</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Purchasing Coffee Tokens */}
            <section id="purchase" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🛒</span>
                <span>4. Purchasing Coffee Tokens</span>
              </h2>
              
              <div className="space-y-6">
                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="text-emerald-400 text-xl">ℹ️</div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-emerald-700">
                        <strong>Note:</strong> Currently, coffee token purchases are managed through the WAGA admin portal. 
                        Consumer purchasing functionality is coming soon!
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Current Process:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Browse Available Batches</h4>
                        <p className="text-gray-700">Use the Browse Coffee page to find batches you're interested in.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Contact WAGA Admin</h4>
                        <p className="text-gray-700">Reach out to WAGA administrators to express interest in specific batches.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Admin Token Allocation</h4>
                        <p className="text-gray-700">WAGA admins will mint and transfer appropriate tokens to your connected wallet.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">🔮 Coming Soon</h3>
                  <p className="text-sm text-blue-700">
                    Direct consumer purchasing with ETH payments, automatic token minting, and integrated payment processing.
                  </p>
                </div>
              </div>
            </section>

            {/* Redeeming for Physical Coffee */}
            <section id="redeem" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📦</span>
                <span>5. Redeeming for Physical Coffee</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Once you have coffee tokens in your wallet, you can redeem them for physical coffee delivery through the Distributor Portal.
                </p>

                <ol className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Visit Distributor Portal</h3>
                      <p className="text-gray-700">Navigate to the Distributor Portal from the main navigation menu.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Connect Your Wallet</h3>
                      <p className="text-gray-700">Ensure your wallet is connected and contains coffee tokens.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Select Batch for Redemption</h3>
                      <p className="text-gray-700">Choose which coffee batch tokens you want to redeem from your available balance.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Specify Quantity</h3>
                      <p className="text-gray-700">Enter the amount of coffee you want to redeem (1 token = 1 unit of coffee).</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Provide Shipping Information</h3>
                      <p className="text-gray-700">Enter your complete shipping address and contact details.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Submit Redemption Request</h3>
                      <p className="text-gray-700">Confirm the transaction to burn your tokens and initiate the shipping process.</p>
                    </div>
                  </li>
                </ol>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">🚚 Shipping & Delivery</h3>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• Processing time: 1-2 business days</li>
                    <li>• Shipping: 5-10 business days (depends on location)</li>
                    <li>• Tracking information provided via email</li>
                    <li>• Fresh roasted coffee delivered to your doorstep</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Understanding Verification */}
            <section id="verification" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🛡️</span>
                <span>6. Understanding Verification</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA's verification system ensures every coffee batch meets our quality and authenticity standards 
                  before tokens can be minted or redeemed.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔗 Chainlink Functions</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Automated inventory verification</li>
                      <li>• Real-time proof of reserve checks</li>
                      <li>• Decentralized oracle network</li>
                      <li>• Tamper-proof verification</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📋 Manual Review</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Quality assessment by WAGA experts</li>
                      <li>• Farm certification verification</li>
                      <li>• Processing method validation</li>
                      <li>• Documentation completeness check</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">📦 IPFS Metadata</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Immutable batch documentation</li>
                      <li>• Farm photos and certificates</li>
                      <li>• Processing and quality reports</li>
                      <li>• Traceability information</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">🔐 Smart Contract</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• On-chain verification status</li>
                      <li>• Immutable audit trail</li>
                      <li>• Automated token minting rules</li>
                      <li>• Transparent verification process</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">🔄 Verification Process Flow</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <span className="bg-gray-200 px-2 py-1 rounded">Batch Created</span>
                    <span>→</span>
                    <span className="bg-amber-200 px-2 py-1 rounded">Pending Review</span>
                    <span>→</span>
                    <span className="bg-blue-200 px-2 py-1 rounded">Chainlink Check</span>
                    <span>→</span>
                    <span className="bg-emerald-200 px-2 py-1 rounded">Verified</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Next Steps */}
          <div className="mt-12 web3-card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span>🎯</span>
              <span>Next Steps</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/browse" className="web3-button-outline block text-center">
                🌱 Browse Coffee Batches
              </Link>
              <Link href="/distributor" className="web3-button-outline block text-center">
                📦 Visit Distributor Portal
              </Link>
              <Link href="/docs" className="web3-button-outline block text-center">
                📚 View All Guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
