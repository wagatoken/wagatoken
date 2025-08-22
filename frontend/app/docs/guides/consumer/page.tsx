"use client";

import Link from "next/link";

export default function ConsumerGuide() {
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
              <div className="text-4xl">👥</div>
              <h1 className="text-4xl font-bold web3-gradient-text">Consumer Guide</h1>
            </div>
            <p className="text-xl text-gray-600">
              Everything you need to know about purchasing, owning, and redeeming WAGA coffee tokens as a consumer.
            </p>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-emerald-400 text-xl">☕</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-emerald-700">
                  <strong>Welcome to WAGA:</strong> Experience the future of coffee traceability with blockchain-verified, 
                  farm-to-cup transparency for every coffee bean.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-emerald-600 hover:text-emerald-800">1. What is WAGA Coffee?</a></li>
              <li><a href="#wallet-setup" className="text-emerald-600 hover:text-emerald-800">2. Setting Up Your Wallet</a></li>
              <li><a href="#browsing" className="text-emerald-600 hover:text-emerald-800">3. Browsing Coffee Batches</a></li>
              <li><a href="#purchasing" className="text-emerald-600 hover:text-emerald-800">4. Purchasing Coffee Tokens</a></li>
              <li><a href="#managing" className="text-emerald-600 hover:text-emerald-800">5. Managing Your Tokens</a></li>
              <li><a href="#redemption" className="text-emerald-600 hover:text-emerald-800">6. Redeeming for Physical Coffee</a></li>
              <li><a href="#verification" className="text-emerald-600 hover:text-emerald-800">7. Understanding Verification</a></li>
              <li><a href="#support" className="text-emerald-600 hover:text-emerald-800">8. Support & FAQs</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Overview */}
            <section id="overview" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>☕</span>
                <span>1. What is WAGA Coffee?</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA is a revolutionary coffee platform that uses blockchain technology to provide complete 
                  transparency from farm to cup. Every coffee batch is tokenized, verified, and traceable.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2 flex items-center space-x-2">
                      <span>🌱</span>
                      <span>Farm to Cup</span>
                    </h3>
                    <p className="text-sm text-emerald-700">
                      Track your coffee from the specific farm where it was grown through every step of processing and roasting.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                      <span>🔗</span>
                      <span>Blockchain Verified</span>
                    </h3>
                    <p className="text-sm text-blue-700">
                      Every batch is verified on the blockchain using Chainlink oracles for immutable proof of authenticity.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center space-x-2">
                      <span>🪙</span>
                      <span>Token Ownership</span>
                    </h3>
                    <p className="text-sm text-purple-700">
                      Own digital tokens representing real coffee that can be redeemed for physical delivery.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">🎯 Key Benefits for Consumers</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• <strong>Complete Transparency:</strong> Know exactly where your coffee comes from</li>
                    <li>• <strong>Quality Assurance:</strong> Every batch is professionally graded and verified</li>
                    <li>• <strong>Fair Trade:</strong> Direct connection between consumers and coffee farmers</li>
                    <li>• <strong>Freshness Guarantee:</strong> Precise tracking of roasting dates and processing</li>
                    <li>• <strong>Digital Ownership:</strong> Your tokens can be stored, traded, or redeemed</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Wallet Setup */}
            <section id="wallet-setup" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>👛</span>
                <span>2. Setting Up Your Wallet</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  To interact with WAGA, you'll need a Web3 wallet like MetaMask configured for the Base Sepolia network.
                </p>

                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">📱 Recommended Wallets</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>MetaMask:</strong> Most popular browser extension wallet</li>
                      <li>• <strong>WalletConnect:</strong> Mobile wallet integration</li>
                      <li>• <strong>Coinbase Wallet:</strong> Easy-to-use mobile option</li>
                      <li>• <strong>Trust Wallet:</strong> Multi-chain mobile wallet</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Step-by-Step Wallet Setup:</h3>
                    <ol className="space-y-4">
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Install MetaMask</h4>
                          <p className="text-gray-700">Download from metamask.io and install the browser extension or mobile app.</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Create or Import Wallet</h4>
                          <p className="text-gray-700">Set up a new wallet or import existing using your seed phrase.</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Add Base Sepolia Network</h4>
                          <p className="text-gray-700">Click "Connect Wallet" on WAGA to automatically add network settings.</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Get Testnet ETH</h4>
                          <p className="text-gray-700">Use Base Sepolia faucet to get testnet ETH for transactions.</p>
                        </div>
                      </li>
                    </ol>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">🔐 Security Best Practices</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Never share your seed phrase with anyone</li>
                      <li>• Always verify website URLs before connecting</li>
                      <li>• Use hardware wallets for large amounts</li>
                      <li>• Keep your wallet software updated</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Browsing */}
            <section id="browsing" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔍</span>
                <span>3. Browsing Coffee Batches</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Explore available coffee batches to find the perfect beans that match your taste preferences and values.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🏷️ Batch Information</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Farm name and location</li>
                      <li>• Processing method details</li>
                      <li>• Roasting date and level</li>
                      <li>• Quality scores and notes</li>
                      <li>• Price per unit</li>
                      <li>• Available quantity</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔍 Filter Options</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Processing method (washed, natural, honey)</li>
                      <li>• Roast level (light, medium, dark)</li>
                      <li>• Origin country or region</li>
                      <li>• Price range</li>
                      <li>• Verification status</li>
                      <li>• Availability</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Understanding Batch Cards:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center space-x-3">
                        <span className="bg-emerald-500 text-white px-2 py-1 rounded text-xs">✓ VERIFIED</span>
                        <span className="text-gray-700">Batch has passed all verification checks</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-amber-500 text-white px-2 py-1 rounded text-xs">⏳ PENDING</span>
                        <span className="text-gray-700">Verification in progress</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs">📦 AVAILABLE</span>
                        <span className="text-gray-700">Tokens available for purchase</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">💤 SOLD OUT</span>
                        <span className="text-gray-700">No tokens currently available</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">💡 Pro Tips for Browsing</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Click "View Details" to see complete batch information</li>
                    <li>• Check verification status before purchasing</li>
                    <li>• Review processing notes for flavor profiles</li>
                    <li>• Look for recent roasting dates for freshness</li>
                    <li>• Compare prices across similar batches</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Purchasing */}
            <section id="purchasing" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🛒</span>
                <span>4. Purchasing Coffee Tokens</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Purchase coffee tokens to own a verified piece of a specific coffee batch on the blockchain.
                </p>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">💰 What You're Buying</h3>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• ERC-1155 tokens representing real coffee units</li>
                    <li>• Right to redeem for physical coffee delivery</li>
                    <li>• Access to complete batch traceability data</li>
                    <li>• Blockchain-verified ownership certificate</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Purchase Process:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Select Your Batch</h4>
                        <p className="text-gray-700">Browse and choose a verified coffee batch that interests you.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Connect Your Wallet</h4>
                        <p className="text-gray-700">Connect your MetaMask or other Web3 wallet to the platform.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Specify Quantity</h4>
                        <p className="text-gray-700">Enter how many coffee units you want to purchase.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Review & Confirm</h4>
                        <p className="text-gray-700">Check total cost including gas fees and confirm the transaction.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Complete Purchase</h4>
                        <p className="text-gray-700">Sign the transaction in your wallet and wait for confirmation.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">⚠️ Important Notes</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Ensure you have enough ETH for gas fees</li>
                    <li>• Transactions are irreversible once confirmed</li>
                    <li>• Network congestion may affect gas prices</li>
                    <li>• Tokens appear in your wallet after confirmation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Managing Tokens */}
            <section id="managing" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📱</span>
                <span>5. Managing Your Tokens</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Once you own WAGA coffee tokens, you can view, track, and manage them through various interfaces.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">👛 In Your Wallet</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• View token balance by batch ID</li>
                      <li>• See token metadata and images</li>
                      <li>• Transfer to other addresses</li>
                      <li>• Connect to other DeFi platforms</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🌐 On WAGA Platform</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Access your token dashboard</li>
                      <li>• View detailed batch information</li>
                      <li>• Initiate redemption process</li>
                      <li>• Track transaction history</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dashboard Features:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">📊 Portfolio Overview</h4>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Total tokens owned</li>
                          <li>• Total value estimation</li>
                          <li>• Redemption status</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">📦 Batch Details</h4>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Farm information</li>
                          <li>• Processing details</li>
                          <li>• Quality assessments</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">🔄 Actions</h4>
                        <ul className="text-gray-600 space-y-1">
                          <li>• Redeem for coffee</li>
                          <li>• Transfer tokens</li>
                          <li>• View on blockchain</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">💎 Token Benefits</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Immutable ownership proof on blockchain</li>
                    <li>• Complete traceability to source farm</li>
                    <li>• Transferable to other wallets or users</li>
                    <li>• Redeemable for physical coffee delivery</li>
                    <li>• Access to exclusive batch information</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Redemption */}
            <section id="redemption" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📦</span>
                <span>6. Redeeming for Physical Coffee</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Convert your digital coffee tokens into physical coffee beans delivered to your address.
                </p>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">✨ Redemption Benefits</h3>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• Fresh coffee directly from verified batches</li>
                    <li>• Complete traceability documentation included</li>
                    <li>• Professionally roasted and packaged</li>
                    <li>• Blockchain certificate of authenticity</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Redemption Process:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Select Tokens to Redeem</h4>
                        <p className="text-gray-700">Choose which tokens you want to convert to physical coffee.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Provide Shipping Information</h4>
                        <p className="text-gray-700">Enter your delivery address and contact details.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Pay Shipping Costs</h4>
                        <p className="text-gray-700">Cover shipping and handling fees (tokens cover coffee cost).</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Confirm Redemption</h4>
                        <p className="text-gray-700">Submit redemption request and receive tracking information.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Receive Your Coffee</h4>
                        <p className="text-gray-700">Tokens are burned and coffee is shipped to your address.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">📋 What's Included</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Freshly roasted coffee beans</li>
                      <li>• Traceability certificate</li>
                      <li>• Farm information card</li>
                      <li>• Processing method details</li>
                      <li>• Brewing recommendations</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-2">⏱️ Timeline</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Redemption processing: 1-2 days</li>
                      <li>• Coffee preparation: 2-3 days</li>
                      <li>• Shipping time: 3-7 days</li>
                      <li>• Total delivery: 6-12 days</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Verification Understanding */}
            <section id="verification" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>✅</span>
                <span>7. Understanding Verification</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA's verification system ensures every coffee batch meets quality standards and authenticity requirements.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔍 What Gets Verified</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Farm location and ownership</li>
                      <li>• Processing method accuracy</li>
                      <li>• Quality assessment scores</li>
                      <li>• Inventory quantity matching</li>
                      <li>• Documentation completeness</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">⚡ Chainlink Integration</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Automated verification checks</li>
                      <li>• Oracle-based data validation</li>
                      <li>• Immutable verification records</li>
                      <li>• Continuous monitoring</li>
                      <li>• Proof of reserve validation</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Levels:</h3>
                  <div className="space-y-3">
                    <div className="bg-emerald-50 p-3 rounded-lg flex items-center space-x-3">
                      <span className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold">✓ VERIFIED</span>
                      <span className="text-sm text-emerald-700">
                        Complete verification passed - highest quality assurance
                      </span>
                    </div>
                    <div className="bg-amber-50 p-3 rounded-lg flex items-center space-x-3">
                      <span className="bg-amber-500 text-white px-2 py-1 rounded text-xs font-bold">⏳ PENDING</span>
                      <span className="text-sm text-amber-700">
                        Verification in progress - automated checks running
                      </span>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg flex items-center space-x-3">
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">❌ FAILED</span>
                      <span className="text-sm text-red-700">
                        Verification failed - batch requires review
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🛡️ Trust Indicators</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Blockchain transaction history viewable</li>
                    <li>• IPFS metadata permanently stored</li>
                    <li>• Chainlink oracle attestations recorded</li>
                    <li>• Multi-layer verification process</li>
                    <li>• Immutable audit trail maintained</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Support & FAQs */}
            <section id="support" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>❓</span>
                <span>8. Support & FAQs</span>
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions:</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Q: What happens if I lose access to my wallet?</h4>
                      <p className="text-sm text-gray-700">
                        Your tokens are stored on the blockchain, so you can recover them with your seed phrase. 
                        Always keep your seed phrase secure and backed up.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Q: Can I sell or transfer my coffee tokens?</h4>
                      <p className="text-sm text-gray-700">
                        Yes, WAGA tokens are standard ERC-1155 tokens that can be transferred to other wallets. 
                        However, check local regulations regarding token transfers.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Q: How long are tokens valid for redemption?</h4>
                      <p className="text-sm text-gray-700">
                        Tokens don't expire, but coffee quality is best within 6-12 months of roasting date. 
                        Check batch details for specific roasting dates.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Q: What if my redemption order is damaged during shipping?</h4>
                      <p className="text-sm text-gray-700">
                        Contact support with photos of damage. We'll replace damaged orders and work with 
                        shipping providers to resolve issues.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📧 Contact Support</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Email: support@wagacoffee.com</li>
                      <li>• Discord: WAGA Community</li>
                      <li>• Documentation: docs.wagacoffee.com</li>
                      <li>• Response time: 24-48 hours</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔗 Useful Links</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• <a href="/browse" className="underline hover:text-emerald-900">Browse Coffee Batches</a></li>
                      <li>• <a href="/dashboard" className="underline hover:text-emerald-900">Your Token Dashboard</a></li>
                      <li>• <a href="/docs" className="underline hover:text-emerald-900">Full Documentation</a></li>
                      <li>• <a href="/about" className="underline hover:text-emerald-900">About WAGA</a></li>
                    </ul>
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
              <Link href="/browse" className="web3-gradient-button block text-center">
                🌱 Browse Coffee
              </Link>
              <Link href="/dashboard" className="web3-button-outline block text-center">
                👛 Your Tokens
              </Link>
              <Link href="/docs/guides/getting-started" className="web3-button-outline block text-center">
                🚀 Getting Started
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
