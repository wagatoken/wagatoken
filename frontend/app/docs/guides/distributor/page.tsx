"use client";

import Link from "next/link";

export default function DistributorGuide() {
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
              <div className="text-4xl">🏢</div>
              <h1 className="text-4xl font-bold web3-gradient-text">Distributor Guide</h1>
            </div>
            <p className="text-xl text-gray-600">
              Complete guide for verified distributors: staking, inventory-free operations, and customer fulfillment in the WAGA ecosystem.
            </p>
          </div>

          <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-emerald-400 text-xl">🎯</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-emerald-700">
                  <strong>Revolutionary Model:</strong> Distributors manage coffee tokens and redeem them when customers 
                  place orders and pay. End customers receive physical coffee without handling blockchain tokens directly.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-emerald-600 hover:text-emerald-800">1. Distributor Model Overview</a></li>
              <li><a href="#requirements" className="text-emerald-600 hover:text-emerald-800">2. Distributor Requirements</a></li>
              <li><a href="#staking" className="text-emerald-600 hover:text-emerald-800">3. WAGA Token Staking</a></li>
              <li><a href="#verification" className="text-emerald-600 hover:text-emerald-800">4. ERC3643 Verification Process</a></li>
              <li><a href="#operations" className="text-emerald-600 hover:text-emerald-800">5. Inventory-Free Operations</a></li>
              <li><a href="#customer-flow" className="text-emerald-600 hover:text-emerald-800">6. Customer Fulfillment Process</a></li>
              <li><a href="#payments" className="text-emerald-600 hover:text-emerald-800">7. Payment & Redemption System</a></li>
              <li><a href="#wallet-management" className="text-emerald-600 hover:text-emerald-800">8. Distributor Token Management</a></li>
              <li><a href="#horeca" className="text-emerald-600 hover:text-emerald-800">9. HORECA & End-User Distributors</a></li>
              <li><a href="#compliance" className="text-emerald-600 hover:text-emerald-800">10. Compliance & Reporting</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Overview */}
            <section id="overview" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🎯</span>
                <span>1. Distributor Model Overview</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA's distributor network operates on a transformative inventory-free model where distributors hold 
                  coffee tokens and redeem them when customers place orders. End customers receive traditional coffee 
                  purchases without needing blockchain knowledge, while distributors handle all token operations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2 flex items-center space-x-2">
                      <span>🏦</span>
                      <span>Zero Inventory</span>
                    </h3>
                    <p className="text-sm text-emerald-700">
                      No need to purchase or store physical coffee inventory. Tokens are minted on request and inventory verification.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                      <span>💰</span>
                      <span>Pay on Redemption</span>
                    </h3>
                    <p className="text-sm text-blue-700">
                      Payment in USDC/ETH only occurs when distributors redeem tokens after receiving customer orders and payments.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center space-x-2">
                      <span>🔒</span>
                      <span>Staking Commitment</span>
                    </h3>
                    <p className="text-sm text-purple-700">
                      Stake WAGA utility tokens to demonstrate commitment and gain access to distributor privileges.
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">🎯 Key Benefits for Distributors</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• <strong>Zero Inventory Risk:</strong> No physical storage or spoilage concerns</li>
                    <li>• <strong>Minimal Capital Requirements:</strong> Only stake WAGA utility tokens, no inventory investment</li>
                    <li>• <strong>Verified Network:</strong> ERC3643 compliance ensures legitimate operators</li>
                    <li>• <strong>Automated Fulfillment:</strong> Smart contracts handle redemption process</li>
                    <li>• <strong>Global Reach:</strong> Serve customers worldwide without shipping infrastructure</li>
                    <li>• <strong>Commission Structure:</strong> Earn from customer orders and successful On Time In Full deliveries</li>
                    <li>• <strong>B2B & HORECA Focus:</strong> Perfect for retailers, cafes, restaurants, and hotels</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Requirements */}
            <section id="requirements" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📋</span>
                <span>2. Distributor Requirements</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  To become a WAGA distributor, you must meet specific requirements for verification (KYC), staking, and operational capability.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🏢 Business Requirements</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Valid business (sole proprietorship or LLC) and license</li>
                      <li>• Compliance with local regulations</li>
                      <li>• Business and/or personal insurance coverage</li>
                      <li>• Established customer service capabilities</li>
                      <li>• Marketing and customer acquisition plan</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔐 Technical Requirements</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Web3 wallet with multi-sig capability</li>
                      <li>• Understanding of blockchain operations</li>
                      <li>• Ability to manage customer onboarding</li>
                      <li>• Integration with WAGA platform APIs</li>
                      <li>• Customer support infrastructure</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">💎 Financial Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">Minimum Staking (TBD)</h4>
                      <ul className="text-purple-700 space-y-1">
                        <li>• WAGA utility tokens to be determined</li>
                        <li>• Based on anticipated transaction volume</li>
                        <li>• Demonstrates commitment to network</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">Operational Capital</h4>
                      <ul className="text-purple-700 space-y-1">
                        <li>• USDC/ETH for customer redemptions</li>
                        <li>• Gas fees for blockchain transactions</li>
                        <li>• Customer service operational costs</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">⚠️ Compliance Requirements</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• ERC3643 compliant identity verification</li>
                    <li>• KYC/AML documentation submitted</li>
                    <li>• Local food distribution licenses (if applicable)</li>
                    <li>• Tax registration and reporting capability</li>
                    <li>• Agreement to WAGA distributor terms</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Staking */}
            <section id="staking" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔒</span>
                <span>3. WAGA Token Staking</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Staking WAGA utility tokens demonstrates commitment to the network and provides economic security for distributor operations.
                </p>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">🎯 Why Staking is Required</h3>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• <strong>Commitment Guarantee:</strong> Financial stake ensures serious participation</li>
                    <li>• <strong>Network Security:</strong> Aligned incentives protect all participants</li>
                    <li>• <strong>Dispute Resolution:</strong> Staked tokens can cover customer issues</li>
                    <li>• <strong>Quality Control:</strong> Economic incentive to maintain service standards</li>
                    <li>• <strong>Scalability Proof:</strong> Demonstrates capacity for anticipated volume</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Staking Process:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Acquire WAGA Tokens</h4>
                        <p className="text-gray-700">Purchase the required amount of WAGA utility tokens from supported exchanges.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Connect Wallet</h4>
                        <p className="text-gray-700">Connect your verified distributor wallet to the WAGA staking platform.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Stake Tokens</h4>
                        <p className="text-gray-700">Deposit tokens into the distributor staking contract with specified lock period.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Receive Credentials</h4>
                        <p className="text-gray-700">Get distributor NFT and access to exclusive platform features.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">🎁 Staking Benefits</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Access to distributor dashboard</li>
                      <li>• Reduced transaction fees</li>
                      <li>• Priority customer support</li>
                      <li>• Early access to new features</li>
                      <li>• Governance voting rights</li>
                      <li>• Potential staking rewards</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-2">⚠️ Staking Considerations</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Tokens locked for minimum period</li>
                      <li>• Slashing risk for policy violations</li>
                      <li>• Market volatility affects value</li>
                      <li>• Withdrawal delays may apply</li>
                      <li>• Performance requirements must be met</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* ERC3643 Verification */}
            <section id="verification" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🛡️</span>
                <span>4. ERC3643 Verification Process</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA uses the ERC3643 standard for compliant identity verification, ensuring all distributors meet 
                  regulatory requirements and maintain network integrity.
                </p>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">🔍 What is ERC3643?</h3>
                  <p className="text-sm text-emerald-700">
                    ERC3643 is a standard for compliant tokenization that includes built-in compliance rules, 
                    identity verification, and regulatory reporting capabilities. It ensures only verified entities 
                    can participate in token operations.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Steps:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Submit Application</h4>
                        <p className="text-gray-700">Complete distributor application with business documentation and if applicable, compliance certificates.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Identity Verification</h4>
                        <p className="text-gray-700">Complete KYC/AML verification through our Identity Registry Process.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Compliance Review</h4>
                        <p className="text-gray-700">WAGA compliance team reviews application and supporting documentation.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Whitelist Approval</h4>
                        <p className="text-gray-700">Approved distributors receive ERC3643 compliant identity token and whitelist status.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📋 Required Documentation</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Business Plan</li>
                      <li>• Tax identification documents</li>
                      <li>• Proof of address and/or operations</li>
                      <li>• Financial statements (if required)</li>
                      <li>• Compliance certifications</li>
                      <li>• Authorized signatory identification</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">✅ Verification Benefits</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Regulatory compliance assurance</li>
                      <li>• Enhanced customer trust</li>
                      <li>• Access to institutional features</li>
                      <li>• Higher transaction limits</li>
                      <li>• Priority dispute resolution</li>
                      <li>• Governance participation rights</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">⏱️ Verification Timeline</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Application submission: 1-2 hours</li>
                    <li>• Document review: 3-5 business days</li>
                    <li>• KYC verification: 2-3 business days</li>
                    <li>• Final approval: 1-2 business days</li>
                    <li>• <strong>Total timeline: 7-12 business days</strong></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Operations */}
            <section id="operations" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>⚙️</span>
                <span>5. Inventory-Free Operations</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The revolutionary aspect of WAGA's distributor model is the complete elimination of inventory overhead 
                  and advance capital requirements through smart contract automation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2 flex items-center space-x-2">
                      <span>📦</span>
                      <span>No Physical Storage</span>
                    </h3>
                    <p className="text-sm text-emerald-700">
                      Zero warehouse or storage requirements. Coffee remains with farms and roasters until customer redemption.
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2 flex items-center space-x-2">
                      <span>💰</span>
                      <span>No Advance Payments</span>
                    </h3>
                    <p className="text-sm text-blue-700">
                      Pay only when customers order and you redeem tokens. No upfront capital tied up in coffee inventory.
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center space-x-2">
                      <span>🤖</span>
                      <span>Automated Fulfillment</span>
                    </h3>
                    <p className="text-sm text-purple-700">
                      Smart contracts handle entire redemption process from payment to shipping coordination.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Operational Flow:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Customer Acquisition</h4>
                          <p className="text-sm text-gray-600">Market WAGA coffee to customers (B2B, HORECA, or end consumers)</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Customer Orders</h4>
                          <p className="text-sm text-gray-600">Customer places order and pays distributor directly (traditional payment)</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Token Redemption</h4>
                          <p className="text-sm text-gray-600">Distributor redeems allocated coffee tokens for physical delivery</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Payment Processing</h4>
                          <p className="text-sm text-gray-600">Distributor pays WAGA in USDC/ETH to complete redemption</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Automated Fulfillment</h4>
                          <p className="text-sm text-gray-600">Coffee is prepared and shipped directly to customer's address</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">💡 Operational Advantages</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• <strong>Scalability:</strong> Serve unlimited customers without infrastructure scaling</li>
                    <li>• <strong>Risk Reduction:</strong> No spoilage, theft, or storage insurance costs</li>
                    <li>• <strong>Cash Flow:</strong> Positive cash flow as customers pay before distributor does</li>
                    <li>• <strong>Global Reach:</strong> Serve international customers without shipping logistics</li>
                    <li>• <strong>Focus:</strong> Concentrate on marketing and customer service, not logistics</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Customer Flow */}
            <section id="customer-flow" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>👥</span>
                <span>6. Customer Fulfillment Process</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Distributors operate as intermediaries who hold coffee tokens and provide traditional coffee purchases 
                  to their customers. End customers don't need blockchain knowledge - they simply order and pay for coffee 
                  through normal channels while distributors handle the token redemption behind the scenes.
                </p>

                <div className="space-y-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔄 Customer Order Process</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                          <h4 className="font-medium text-blue-800">Customer Places Order</h4>
                          <p className="text-blue-700">Customer orders coffee through distributor's normal sales channels</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                          <h4 className="font-medium text-blue-800">Traditional Payment</h4>
                          <p className="text-blue-700">Customer pays distributor using normal payment methods (cash, card, transfer)</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                          <h4 className="font-medium text-blue-800">Token Redemption</h4>
                          <p className="text-blue-700">Distributor redeems coffee tokens to fulfill the customer order</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                        <div>
                          <h4 className="font-medium text-blue-800">Blockchain Payment</h4>
                          <p className="text-blue-700">Distributor pays WAGA in USDC/ETH for the redeemed tokens</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">5</span>
                        <div>
                          <h4 className="font-medium text-blue-800">Direct Fulfillment</h4>
                          <p className="text-blue-700">Coffee is shipped directly from source to customer's address</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">6</span>
                        <div>
                          <h4 className="font-medium text-blue-800">Customer Satisfaction</h4>
                          <p className="text-blue-700">Customer receives traceable, verified coffee without blockchain complexity</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-emerald-800 mb-3">🎯 Distributor Responsibilities</h3>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• Customer sales and relationship management</li>
                        <li>• Coffee selection and recommendations</li>
                        <li>• Order processing and payment collection</li>
                        <li>• Token redemption management</li>
                        <li>• Customer support and satisfaction</li>
                        <li>• Marketing and brand representation</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-800 mb-3">🤖 Automated by WAGA System</h3>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Token allocation and management</li>
                        <li>• Blockchain payment processing</li>
                        <li>• Coffee sourcing and preparation</li>
                        <li>• Direct-to-customer shipping</li>
                        <li>• Quality verification and traceability</li>
                        <li>• Transaction recording and audit trail</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">📞 Customer Support Best Practices</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Provide clear product information and traceability benefits</li>
                    <li>• Create educational content about coffee origins and quality</li>
                    <li>• Offer multiple communication channels (chat, email, phone)</li>
                    <li>• Maintain FAQ section for delivery and product questions</li>
                    <li>• Proactively communicate during order fulfillment</li>
                    <li>• Follow up post-delivery for customer satisfaction and repeat orders</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Payments */}
            <section id="payments" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>💳</span>
                <span>7. Payment & Redemption System</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Understand the payment flow where distributors only pay WAGA in USDC or ETH when they redeem tokens 
                  after receiving customer orders and payments through traditional channels.
                </p>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">💡 Payment Model Innovation</h3>
                  <p className="text-sm text-emerald-700">
                    This model eliminates distributor cash flow risks by only requiring payment to WAGA when distributors 
                    redeem tokens after customers have already ordered and paid them. Distributors maintain positive cash flow.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Flow Sequence:</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        <h4 className="font-semibold text-gray-900">Customer Places Order</h4>
                      </div>
                      <p className="text-sm text-gray-700 ml-11">
                        Customer orders coffee through distributor's sales channels and pays via traditional methods.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        <h4 className="font-semibold text-gray-900">Distributor Initiates Redemption</h4>
                      </div>
                      <p className="text-sm text-gray-700 ml-11">
                        Distributor redeems allocated coffee tokens through WAGA platform for customer fulfillment.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        <h4 className="font-semibold text-gray-900">Smart Contract Verification</h4>
                      </div>
                      <p className="text-sm text-gray-700 ml-11">
                        Smart contract verifies token ownership, batch availability, and distributor credentials.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        <h4 className="font-semibold text-gray-900">USDC/ETH Payment</h4>
                      </div>
                      <p className="text-sm text-gray-700 ml-11">
                        Distributor pays WAGA the required USDC/ETH amount to complete token redemption.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="bg-purple-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                        <h4 className="font-semibold text-gray-900">Automated Fulfillment</h4>
                      </div>
                      <p className="text-sm text-gray-700 ml-11">
                        Payment triggers coffee preparation and direct shipping to the customer's address.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">💰 Accepted Payment Methods</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• <strong>USDC:</strong> Preferred stablecoin for price stability</li>
                      <li>• <strong>ETH:</strong> Native Ethereum token</li>
                      <li>• <strong>Other Stablecoins:</strong> USDT, DAI (if supported)</li>
                      <li>• <strong>Gas Fees:</strong> Paid in ETH for transaction processing</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">⚠️ Payment Considerations</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Payment required within specified timeframe</li>
                      <li>• Failed payments may forfeit customer order</li>
                      <li>• Exchange rate fluctuations affect costs</li>
                      <li>• Gas fees vary with network congestion</li>
                      <li>• Maintain sufficient wallet balance</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">💎 Financial Benefits</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• <strong>Positive Cash Flow:</strong> Customers pay you before you pay WAGA for token redemption</li>
                    <li>• <strong>No Inventory Risk:</strong> Zero financial exposure to unsold inventory</li>
                    <li>• <strong>Predictable Costs:</strong> Know exact payment amount before committing to customer orders</li>
                    <li>• <strong>Scalable Model:</strong> Handle more customers without proportional capital increase</li>
                    <li>• <strong>Commission Structure:</strong> Earn margin between customer payments and WAGA costs</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Wallet Management */}
            <section id="wallet-management" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>👛</span>
                <span>8. Distributor Token Management</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  As a distributor, you manage coffee tokens on behalf of your customers. End customers never need to 
                  handle tokens directly - they simply place orders and receive coffee through traditional channels.
                </p>

                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <div className="text-emerald-400 text-xl">💡</div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-semibold text-emerald-800">Distributor-Managed Model</h3>
                      <p className="text-sm text-emerald-700 mt-1">
                        Coffee tokens are allocated to distributor wallets and managed entirely by the distributor. 
                        End customers enjoy the benefits of traceable, verified coffee without blockchain complexity.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">How Distributors Manage Tokens:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-3 flex items-center space-x-2">
                        <span>🌐</span>
                        <span>WAGA Platform Dashboard</span>
                      </h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Connect distributor wallet to WAGA platform</li>
                        <li>• View allocated token inventory</li>
                        <li>• Access batch details and metadata</li>
                        <li>• Initiate token redemptions for customer orders</li>
                        <li>• Track redemption history and status</li>
                        <li>• Monitor token allocation and availability</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center space-x-2">
                        <span>🔍</span>
                        <span>Blockchain Verification</span>
                      </h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Check distributor wallet on Base Sepolia explorer</li>
                        <li>• View ERC-1155 token holdings</li>
                        <li>• Verify token authenticity and origin</li>
                        <li>• Track redemption transactions</li>
                        <li>• Monitor contract interactions</li>
                        <li>• Validate compliance and audit trails</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Customer-Facing Benefits:</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">📱 No Blockchain Knowledge Required</h4>
                      <p className="text-sm text-gray-700">
                        Customers order coffee through normal channels without needing to understand blockchain technology.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">� Transparency Without Complexity</h4>
                      <p className="text-sm text-gray-700">
                        Customers can access traceability information through simple web interfaces you provide.
                      </p>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">🎯 Traditional Shopping Experience</h4>
                      <p className="text-sm text-gray-700">
                        Customers enjoy familiar ordering, payment, and delivery processes while getting verified coffee.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">💡 Best Practices for Token Management</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Monitor token allocation to ensure adequate inventory</li>
                    <li>• Track customer orders against available token batches</li>
                    <li>• Maintain backup plans for high-demand periods</li>
                    <li>• Keep customers informed about coffee origins and quality</li>
                    <li>• Use traceability data as a competitive advantage</li>
                    <li>• Coordinate with WAGA for special requests or bulk orders</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* HORECA Section */}
            <section id="horeca" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🏨</span>
                <span>9. HORECA & End-User Distributors</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Some distributors also serve as end customers (Hotels, Restaurants, Cafes - HORECA). These distributors 
                  redeem tokens when they need coffee delivered for their own operations, following the same payment model.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">🏨 HORECA Use Cases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Hotels</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Guest room coffee service</li>
                        <li>• Restaurant and breakfast service</li>
                        <li>• Conference and event catering</li>
                        <li>• Gift shop retail sales</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Restaurants & Cafes</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Daily coffee service operations</li>
                        <li>• Specialty coffee menu items</li>
                        <li>• Take-away and retail sales</li>
                        <li>• Catering services</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-blue-800 mb-2">Distributors + End Users</h4>
                      <ul className="text-blue-700 space-y-1">
                        <li>• Resell to other businesses</li>
                        <li>• Use for own operations</li>
                        <li>• Flexible redemption timing</li>
                        <li>• Dual revenue streams</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">HORECA Operational Model:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Inventory Planning</h4>
                          <p className="text-sm text-gray-600">HORECA business plans coffee needs for operations</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Token Allocation</h4>
                          <p className="text-sm text-gray-600">Receive allocated coffee tokens based on anticipated needs</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Flexible Redemption</h4>
                          <p className="text-sm text-gray-600">Redeem tokens when coffee is needed for operations</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Payment on Delivery</h4>
                          <p className="text-sm text-gray-600">Pay WAGA in USDC/ETH only when coffee is shipped</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="bg-green-500 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">5</span>
                        <div>
                          <h4 className="font-medium text-gray-900">Direct Operations Use</h4>
                          <p className="text-sm text-gray-600">Coffee delivered directly to business for immediate use</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🎯 HORECA Benefits</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Guaranteed coffee quality and traceability</li>
                      <li>• Just-in-time inventory management</li>
                      <li>• No storage costs or spoilage risk</li>
                      <li>• Transparent sourcing for customer appeal</li>
                      <li>• Flexible ordering based on actual demand</li>
                      <li>• Premium product positioning</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">💰 Dual Revenue Model</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Resell tokens to other businesses</li>
                      <li>• Use tokens for own coffee needs</li>
                      <li>• Earn distributor commissions</li>
                      <li>• Reduce operational coffee costs</li>
                      <li>• Offer premium coffee experiences</li>
                      <li>• Market transparency to customers</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">💡 HORECA Best Practices</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Plan redemptions based on seasonal demand patterns</li>
                    <li>• Use coffee origin stories as marketing content</li>
                    <li>• Coordinate with WAGA for special event requirements</li>
                    <li>• Train staff on coffee quality and traceability benefits</li>
                    <li>• Maintain customer-facing information about coffee sources</li>
                    <li>• Consider bulk orders for cost optimization</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Compliance */}
            <section id="compliance" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>⚖️</span>
                <span>10. Compliance & Reporting</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Maintain regulatory compliance through proper reporting, record keeping, and adherence to local and international regulations.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📋 Reporting Requirements</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Monthly transaction reports</li>
                      <li>• Customer onboarding logs</li>
                      <li>• Redemption fulfillment records</li>
                      <li>• Financial transaction summaries</li>
                      <li>• Compliance incident reports</li>
                      <li>• Tax documentation preparation</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔐 Data Protection</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• GDPR compliance for EU customers</li>
                      <li>• Secure customer data storage</li>
                      <li>• Privacy policy implementation</li>
                      <li>• Data retention policies</li>
                      <li>• Right to erasure procedures</li>
                      <li>• Breach notification protocols</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">⚖️ Regulatory Compliance Framework</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">Financial Regulations</h4>
                      <ul className="text-purple-700 space-y-1">
                        <li>• Anti-money laundering (AML)</li>
                        <li>• Know your customer (KYC)</li>
                        <li>• Securities regulations compliance</li>
                        <li>• Cross-border payment rules</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-800 mb-2">Operational Compliance</h4>
                      <ul className="text-purple-700 space-y-1">
                        <li>• Food safety regulations</li>
                        <li>• Consumer protection laws</li>
                        <li>• Digital asset regulations</li>
                        <li>• International trade requirements</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">📊 Automated Compliance Tools</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Blockchain transaction monitoring</li>
                    <li>• Automated reporting generation</li>
                    <li>• Real-time compliance checking</li>
                    <li>• Smart contract audit trails</li>
                    <li>• Regulatory update notifications</li>
                    <li>• Documentation management system</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 web3-card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span>⚡</span>
              <span>Distributor Quick Actions</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/distributor" className="web3-gradient-button block text-center">
                🏢 Apply Now
              </Link>
              <Link href="/docs/guides/admin" className="web3-button-outline block text-center">
                ⚙️ Admin Guide
              </Link>
              <Link href="/docs/guides/smart-contracts" className="web3-button-outline block text-center">
                📄 Smart Contracts
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
