"use client";

import Link from "next/link";
import { MdAdminPanelSettings, MdSecurity, MdOutlineAssignment, MdBarChart, MdTrendingUp, MdSettings, MdSearch, MdEdit, MdWarning, MdGpsFixed, MdSync, MdLink } from 'react-icons/md';
import { NetworkEthereum } from '@web3icons/react';
import { SiChainlink } from 'react-icons/si';
import { CoffeeBeanIcon } from '../../../components/icons/WagaIcons';

export default function AdminGuide() {
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
              <MdAdminPanelSettings className="text-4xl text-blue-600" />
              <h1 className="text-4xl font-bold web3-gradient-text">WAGA Admin Guide</h1>
            </div>
            <p className="text-xl text-gray-600">
              Comprehensive guide for WAGA administrators on creating, verifying, and managing coffee batches on the blockchain.
            </p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <MdSecurity className="text-red-400 text-xl" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  <strong>Restricted Access:</strong> This guide is for authorized WAGA administrators only. 
                  Admin functions require special wallet permissions and access rights.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
              <MdOutlineAssignment className="mr-2" />
              Table of Contents
            </h2>
            <ul className="space-y-2">
              <li><a href="#access" className="text-emerald-600 hover:text-emerald-800">1. Admin Access & Permissions</a></li>
              <li><a href="#dashboard" className="text-emerald-600 hover:text-emerald-800">2. Admin Dashboard Overview</a></li>
              <li><a href="#create-batch" className="text-emerald-600 hover:text-emerald-800">3. Creating Coffee Batches</a></li>
              <li><a href="#ipfs-upload" className="text-emerald-600 hover:text-emerald-800">4. IPFS Metadata Management</a></li>
              <li><a href="#verification" className="text-emerald-600 hover:text-emerald-800">5. Verification Process</a></li>
              <li><a href="#token-management" className="text-emerald-600 hover:text-emerald-800">6. Token Minting & Management</a></li>
              <li><a href="#chainlink" className="text-emerald-600 hover:text-emerald-800">7. Chainlink Integration</a></li>
              <li><a href="#troubleshooting" className="text-emerald-600 hover:text-emerald-800">8. Troubleshooting</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Admin Access */}
            <section id="access" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔐</span>
                <span>1. Admin Access & Permissions</span>
              </h2>
              
              <div className="space-y-6">
                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">🔑 Required Permissions</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• ADMIN_ROLE in smart contracts</li>
                    <li>• Access to WAGA Admin Portal</li>
                    <li>• Pinata IPFS account credentials</li>
                    <li>• Base Sepolia testnet setup</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Setup Requirements:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Wallet Configuration</h4>
                        <p className="text-gray-700">Connect MetaMask with Base Sepolia network and ensure admin wallet address has proper roles.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Environment Variables</h4>
                        <p className="text-gray-700">Ensure .env.local file contains all required API keys and contract addresses.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Test Access</h4>
                        <p className="text-gray-700">Verify admin portal loads correctly and displays admin-only features.</p>
                      </div>
                    </li>
                  </ol>
                </div>
              </div>
            </section>

            {/* Dashboard Overview */}
            <section id="dashboard" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <MdBarChart className="mr-1" />
                <span>2. Admin Dashboard Overview</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The Admin Portal provides a comprehensive interface for managing all aspects of the WAGA coffee platform.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2 flex items-center">
                      <MdTrendingUp className="mr-2" />
                      Quick Stats
                    </h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Total coffee batches created</li>
                      <li>• Verification status summary</li>
                      <li>• Recent activity timeline</li>
                      <li>• System health indicators</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">⚙️ Admin Actions</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Create new coffee batches</li>
                      <li>• Upload IPFS metadata</li>
                      <li>• Trigger Chainlink verification</li>
                      <li>• Mint tokens to distributors</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-2">📋 Batch Management</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• View all created batches</li>
                      <li>• Filter by status and date</li>
                      <li>• Generate QR codes</li>
                      <li>• Export batch data</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-2">🔍 Monitoring</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Transaction history</li>
                      <li>• Verification logs</li>
                      <li>• Error notifications</li>
                      <li>• System performance</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Creating Coffee Batches */}
            <section id="create-batch" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>☕</span>
                <span>3. Creating Coffee Batches</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Creating a new coffee batch involves multiple steps to ensure complete traceability and verification.
                </p>

                <div className="space-y-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">📝 Required Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">Farm Details:</h4>
                        <ul className="text-emerald-600 space-y-1">
                          <li>• Farm name and location</li>
                          <li>• Farmer contact information</li>
                          <li>• Farm size and coordinates</li>
                          <li>• Certification details</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-emerald-700 mb-1">Coffee Details:</h4>
                        <ul className="text-emerald-600 space-y-1">
                          <li>• Processing method</li>
                          <li>• Roast level and date</li>
                          <li>• Quantity and packaging</li>
                          <li>• Quality scores</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Step-by-Step Process:</h3>
                    <ol className="space-y-4">
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Access Batch Creation Form</h4>
                          <p className="text-gray-700">Navigate to Admin Portal and click "Create New Batch" button.</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Fill Batch Information</h4>
                          <p className="text-gray-700">Complete all required fields including farm details, coffee specifications, and pricing.</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Upload Supporting Documents</h4>
                          <p className="text-gray-700">Add farm photos, certificates, and quality reports to IPFS.</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Create Batch on Blockchain</h4>
                          <p className="text-gray-700">Submit transaction to create the batch record on smart contract.</p>
                        </div>
                      </li>
                      <li className="flex items-start space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">Generate QR Code</h4>
                          <p className="text-gray-700">Create QR code linking to batch information for physical packaging.</p>
                        </div>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* IPFS Management */}
            <section id="ipfs-upload" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📡</span>
                <span>4. IPFS Metadata Management</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  IPFS storage via Pinata ensures immutable and decentralized storage of all batch metadata and documentation.
                </p>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">📦 What Gets Stored</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Complete batch metadata JSON</li>
                    <li>• Farm photos and certificates</li>
                    <li>• Quality assessment reports</li>
                    <li>• Processing documentation</li>
                    <li>• Traceability records</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Upload Process:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Prepare Documents</h4>
                        <p className="text-gray-700">Gather all relevant files in supported formats (JPG, PNG, PDF).</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Upload via Admin Portal</h4>
                        <p className="text-gray-700">Use the integrated upload interface in the batch creation form.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Automatic Processing</h4>
                        <p className="text-gray-700">System automatically generates metadata JSON and uploads to Pinata.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">IPFS Hash Storage</h4>
                        <p className="text-gray-700">Resulting IPFS hash is stored on-chain for permanent reference.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">⚠️ Best Practices</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• Ensure high-quality images (min 1024x768)</li>
                    <li>• Keep file sizes reasonable (&lt; 10MB each)</li>
                    <li>• Verify all information before upload</li>
                    <li>• Test IPFS links after upload completion</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Verification Process */}
            <section id="verification" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>✅</span>
                <span>5. Verification Process</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The verification process combines manual admin review with automated Chainlink Functions to ensure 
                  batch authenticity and quality before token minting.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔍 Manual Verification</h3>
                    <ul className="text-sm text-emerald-700 space-y-2">
                      <li className="flex items-start space-x-2">
                        <span>✓</span>
                        <span>Review farm documentation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>✓</span>
                        <span>Validate quality assessments</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>✓</span>
                        <span>Verify processing methods</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>✓</span>
                        <span>Check certification validity</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">⚡ Chainlink Automation</h3>
                    <ul className="text-sm text-blue-700 space-y-2">
                      <li className="flex items-start space-x-2">
                        <span>⚡</span>
                        <span>Inventory verification</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>⚡</span>
                        <span>Proof of reserve validation</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>⚡</span>
                        <span>IPFS accessibility check</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <span>⚡</span>
                        <span>Smart contract compliance</span>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Verification Workflow:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-700 overflow-x-auto">
                      <span className="bg-gray-200 px-3 py-1 rounded whitespace-nowrap">Batch Created</span>
                      <span>→</span>
                      <span className="bg-amber-200 px-3 py-1 rounded whitespace-nowrap">Admin Review</span>
                      <span>→</span>
                      <span className="bg-blue-200 px-3 py-1 rounded whitespace-nowrap">Chainlink Check</span>
                      <span>→</span>
                      <span className="bg-emerald-200 px-3 py-1 rounded whitespace-nowrap">Verified</span>
                      <span>→</span>
                      <span className="bg-purple-200 px-3 py-1 rounded whitespace-nowrap">Ready for Minting</span>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-red-800 mb-2">🚨 Verification Failures</h3>
                  <p className="text-sm text-red-700 mb-2">Common issues that cause verification failures:</p>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Incomplete or invalid documentation</li>
                    <li>• IPFS upload failures or inaccessible files</li>
                    <li>• Inventory discrepancies detected by Chainlink</li>
                    <li>• Smart contract validation errors</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Token Management */}
            <section id="token-management" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🪙</span>
                <span>6. Token Minting & Management</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Once a batch is verified, admins can mint ERC-1155 tokens representing ownership of specific coffee quantities.
                </p>

                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-emerald-800 mb-2">🎯 Token Standards</h3>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>• ERC-1155 multi-token standard</li>
                    <li>• One token = One unit of coffee</li>
                    <li>• Batch-specific token IDs</li>
                    <li>• Immutable batch metadata URI</li>
                  </ul>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Minting Process:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Verify Batch Status</h4>
                        <p className="text-gray-700">Ensure batch has passed all verification checks and is marked as "Verified".</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Specify Minting Details</h4>
                        <p className="text-gray-700">Enter recipient address, quantity, and confirm batch ID for minting.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Execute Mint Transaction</h4>
                        <p className="text-gray-700">Submit blockchain transaction to mint tokens to specified distributor wallet.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Confirm Transaction</h4>
                        <p className="text-gray-700">Verify successful minting and update internal records.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">🔄 Token Lifecycle</h3>
                  <div className="text-sm text-amber-700 space-y-2">
                    <div className="flex items-center space-x-2">
                      <span className="bg-gray-200 px-2 py-1 rounded text-xs">Minted</span>
                      <span>→</span>
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">Distributed</span>
                      <span>→</span>
                      <span className="bg-emerald-200 px-2 py-1 rounded text-xs">Redeemed</span>
                      <span>→</span>
                      <span className="bg-red-200 px-2 py-1 rounded text-xs">Burned</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Chainlink Integration */}
            <section id="chainlink" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>⚡</span>
                <span>7. Chainlink Integration</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA uses Chainlink Functions for automated verification and proof of reserve validation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔗 Functions Setup</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Custom JavaScript source code</li>
                      <li>• DON (Decentralized Oracle Network)</li>
                      <li>• Automated execution triggers</li>
                      <li>• Gas-efficient operations</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">✅ Verification Checks</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Inventory quantity validation</li>
                      <li>• IPFS metadata accessibility</li>
                      <li>• Smart contract state consistency</li>
                      <li>• External data source validation</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">🔄 Automation Features</h3>
                  <p className="text-sm text-purple-700 mb-2">
                    Chainlink Functions automatically trigger verification when:
                  </p>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• New batch is created by admin</li>
                    <li>• Inventory levels change</li>
                    <li>• Periodic proof of reserve checks</li>
                    <li>• Manual verification requests</li>
                  </ul>
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
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">❌ Common Issues</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <h4 className="font-medium text-red-700">Transaction Failures:</h4>
                        <p className="text-red-600">• Check wallet connection and Base Sepolia network</p>
                        <p className="text-red-600">• Ensure sufficient ETH for gas fees</p>
                        <p className="text-red-600">• Verify admin permissions on smart contract</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700">IPFS Upload Issues:</h4>
                        <p className="text-red-600">• Verify Pinata API keys in environment</p>
                        <p className="text-red-600">• Check file size and format restrictions</p>
                        <p className="text-red-600">• Test network connectivity</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-red-700">Verification Failures:</h4>
                        <p className="text-red-600">• Review batch information completeness</p>
                        <p className="text-red-600">• Check Chainlink Functions execution logs</p>
                        <p className="text-red-600">• Validate IPFS metadata accessibility</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">✅ Solutions & Best Practices</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Always test on staging environment first</li>
                      <li>• Keep backup of all batch documentation</li>
                      <li>• Monitor gas prices during high network activity</li>
                      <li>• Regularly update IPFS pinning status</li>
                      <li>• Document any custom batch requirements</li>
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
              <Link href="/admin" className="web3-gradient-button block text-center">
                ⚙️ Admin Portal
              </Link>
              <Link href="/browse" className="web3-button-outline block text-center">
                🌱 View Batches
              </Link>
              <Link href="/docs/guides/chainlink" className="web3-button-outline block text-center">
                ⚡ Chainlink Guide
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
