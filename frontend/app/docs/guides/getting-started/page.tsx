"use client";

import Link from "next/link";
import { MdRocket, MdAnalytics, MdPerson, MdLocationOn, MdSecurity, MdQrCode, MdLibraryBooks } from 'react-icons/md';
import { SiChainlink } from 'react-icons/si';
import { CoffeeBeanIcon, FarmOriginIcon } from '../../../components/icons/WagaIcons';
import { NetworkEthereum } from '@web3icons/react';

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
              <MdRocket className="text-4xl text-emerald-600" />
              <h1 className="text-4xl font-bold web3-gradient-text">Getting Started with WAGA Coffee</h1>
            </div>
            <p className="text-xl text-gray-600">
              Learn how to navigate the WAGA platform and understand our distributor-managed tokenized Ethiopian coffee system.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-emerald-600 hover:text-emerald-800">1. Platform Overview</a></li>
              <li><a href="#browse" className="text-emerald-600 hover:text-emerald-800">2. Browsing Coffee Batches</a></li>
              <li><a href="#vmi-model" className="text-emerald-600 hover:text-emerald-800">3. Vendor Managed Inventory Model</a></li>
              <li><a href="#distributor-role" className="text-emerald-600 hover:text-emerald-800">4. Understanding Distributor Role</a></li>
              <li><a href="#customer-experience" className="text-emerald-600 hover:text-emerald-800">5. Customer Experience</a></li>
              <li><a href="#verification" className="text-emerald-600 hover:text-emerald-800">6. Understanding Verification</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Platform Overview */}
            <section id="overview" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>1. Platform Overview</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA Coffee Platform is a transformative blockchain-powered coffee traceability system that tokenizes premium Ethiopian coffee. 
                  Our platform ensures complete transparency from farm to cup through Web3 technology.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">Blockchain Technology</h3>
                    <p className="text-sm text-emerald-700">
                      Built on Base Testnet with ERC-1155 tokens representing verified coffee batches.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-2 flex items-center">
                      <CoffeeBeanIcon size={16} className="mr-2 waga-icon-coffee" />
                      Premium Coffee
                    </h3>
                    <p className="text-sm text-amber-700">
                      Directly sourced from Ethiopian highlands with complete traceability documentation.
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Chainlink Verification</h3>
                    <p className="text-sm text-blue-700">
                      Automated inventory verification using Chainlink Functions for transparency.
                    </p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">IPFS Storage</h3>
                    <p className="text-sm text-purple-700">
                      Immutable metadata storage via Pinata for complete batch documentation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Browsing Coffee Batches */}
            <section id="browse" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>2. Browsing Coffee Batches</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The Browse Coffee page allows you to explore all available verified coffee batches from Ethiopian farms. 
                  This transparency tool shows what inventory is available through our distributor network.
                </p>

                <div className="space-y-4">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">Search & Filter</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Search by farm name, location, or batch ID</li>
                      <li>• Filter by packaging type (Washed, Natural, Honey)</li>
                      <li>• View verified batches available through distributors</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">Batch Information</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Farm details and location</li>
                      <li>• Roast level and processing method</li>
                      <li>• Distributor availability</li>
                      <li>• Verification status and date</li>
                      <li>• IPFS metadata links</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">Verification Badges</h3>
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
                        <span>Verification failed - not available for distribution</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Vendor Managed Inventory Model */}
            <section id="vmi-model" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>3. Vendor Managed Inventory Model</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA operates on a Vendor Managed Inventory (VMI) model where verified distributors handle all blockchain 
                  operations on behalf of end customers. This ensures a seamless coffee experience without requiring 
                  customers to interact directly with Web3 technology.
                </p>

                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        <strong>Key Concept:</strong> End customers purchase coffee normally through distributors. 
                        The blockchain technology operates transparently in the background to ensure quality and traceability.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2">Customer Benefits</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• No need for crypto wallets or technical knowledge</li>
                      <li>• Traditional payment methods (credit cards, cash)</li>
                      <li>• Full traceability without complexity</li>
                      <li>• Guaranteed authentic Ethiopian coffee</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2 flex items-center">
                      <NetworkEthereum size={16} variant="branded" className="mr-2" />
                      Blockchain Benefits
                    </h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Immutable traceability records</li>
                      <li>• Automated quality verification</li>
                      <li>• Transparent supply chain</li>
                      <li>• Proof of authenticity</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">How It Works</h3>
                  <div className="space-y-2 text-sm text-amber-700">
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-200 px-2 py-1 rounded text-xs">1</span>
                      <span>Customer orders coffee through distributor (cafe, roastery, retailer)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-200 px-2 py-1 rounded text-xs">2</span>
                      <span>Distributor manages blockchain tokens behind the scenes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-200 px-2 py-1 rounded text-xs">3</span>
                      <span>Customer receives verified, traceable coffee</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-amber-200 px-2 py-1 rounded text-xs">4</span>
                      <span>Full traceability available through QR codes or receipts</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Understanding Distributor Role */}
            <section id="distributor-role" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>4. Understanding Distributor Role</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Distributors are the bridge between WAGA's blockchain-verified coffee inventory and end customers. 
                  They handle all technical aspects while providing familiar customer service.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Distributor Types:</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-coffee-50 p-4 rounded-lg border-l-4 border-coffee-300">
                      <h4 className="font-semibold text-coffee-800 mb-2 flex items-center">
                        <CoffeeBeanIcon size={16} className="mr-2 waga-icon-coffee" />
                        Coffee Shops
                      </h4>
                      <ul className="text-sm text-coffee-700 space-y-1">
                        <li>• Serve verified coffee to customers</li>
                        <li>• Provide traceability information</li>
                        <li>• Manage inventory tokens</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-300">
                      <h4 className="font-semibold text-amber-800 mb-2">Roasteries</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• Roast and package verified coffee</li>
                        <li>• Wholesale to other businesses</li>
                        <li>• Maintain chain of custody</li>
                      </ul>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-300">
                      <h4 className="font-semibold text-emerald-800 mb-2">Retailers</h4>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• Sell packaged coffee to consumers</li>
                        <li>• Provide authenticity guarantees</li>
                        <li>• Handle customer inquiries</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">Distributor Responsibilities</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
                      <div>
                        <h4 className="font-semibold mb-2">Blockchain Operations:</h4>
                        <ul className="space-y-1">
                          <li>• Manage crypto wallets and transactions</li>
                          <li>• Redeem tokens for physical coffee</li>
                          <li>• Track inventory on blockchain</li>
                          <li>• Handle staking and yield mechanisms</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Customer Service:</h4>
                        <ul className="space-y-1">
                          <li>• Process traditional payments</li>
                          <li>• Provide traceability information</li>
                          <li>• Handle customer inquiries</li>
                          <li>• Ensure quality standards</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Customer Experience */}
            <section id="customer-experience" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>�</span>
                <span>5. Customer Experience</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  From the customer perspective, purchasing WAGA coffee is as simple as buying any premium coffee, 
                  with the added benefit of complete traceability and authenticity verification.
                </p>

                <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <MdSecurity className="text-emerald-400 text-xl" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-emerald-700">
                        <strong>Seamless Experience:</strong> Customers enjoy all the benefits of blockchain verification 
                        without needing to understand or interact with the technology directly.
                      </p>
                    </div>
                  </div>
                </div>

                <ol className="space-y-4">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Visit Distributor Location</h3>
                      <p className="text-gray-700">Go to any WAGA-certified coffee shop, roastery, or retailer.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Choose WAGA Coffee</h3>
                      <p className="text-gray-700">Select from available verified Ethiopian coffee batches.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Pay Normally</h3>
                      <p className="text-gray-700">Use credit card, cash, or any payment method accepted by the distributor.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Receive Traceability Info</h3>
                      <p className="text-gray-700">Get QR code or receipt with complete farm-to-cup traceability details.</p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">Enjoy Verified Coffee</h3>
                      <p className="text-gray-700">Experience authentic Ethiopian coffee with guaranteed provenance.</p>
                    </div>
                  </li>
                </ol>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-3">� Traceability Access</h3>
                  <p className="text-sm text-amber-700 mb-3">
                    Customers can access complete traceability information without any technical knowledge:
                  </p>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Scan QR code with smartphone camera</li>
                    <li>• View farm location and farmer details</li>
                    <li>• See processing method and roast profile</li>
                    <li>• Access quality certifications</li>
                    <li>• View blockchain verification status</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Understanding Verification */}
            <section id="verification" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>6. Understanding Verification</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA's verification system ensures every coffee batch meets our quality and authenticity standards 
                  before tokens can be minted or redeemed.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">Chainlink Functions</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Automated inventory verification</li>
                      <li>• Real-time proof of reserve checks</li>
                      <li>• Decentralized oracle network</li>
                      <li>• Tamper-proof verification</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">Manual Review</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Quality assessment by WAGA experts</li>
                      <li>• Farm certification verification</li>
                      <li>• Processing method validation</li>
                      <li>• Documentation completeness check</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">IPFS Metadata</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Immutable batch documentation</li>
                      <li>• Farm photos and certificates</li>
                      <li>• Processing and quality reports</li>
                      <li>• Traceability information</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3 flex items-center">
                      <MdSecurity className="mr-2" />
                      Smart Contract
                    </h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• On-chain verification status</li>
                      <li>• Immutable audit trail</li>
                      <li>• Automated token minting rules</li>
                      <li>• Transparent verification process</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">Verification Process Flow</h3>
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
              <span>Next Steps</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/browse" className="web3-button-outline block text-center">
                Browse Coffee Batches
              </Link>
              <Link href="/docs/guides/distributor" className="web3-button-outline block text-center">
                Become a Distributor
              </Link>
              <Link href="/docs" className="web3-button-outline block text-center">
                <MdLibraryBooks className="mr-2" />
                View All Guides
              </Link>
            </div>
            
            <div className="mt-6 bg-coffee-50 p-4 rounded-lg text-center">
              <p className="text-coffee-700">
                <strong>Looking for WAGA Coffee?</strong> Find verified distributors in your area through our 
                <Link href="/browse" className="text-emerald-600 hover:text-emerald-800 font-semibold"> distributor network</Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
