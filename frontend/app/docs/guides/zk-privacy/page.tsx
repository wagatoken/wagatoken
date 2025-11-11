"use client";

import Link from "next/link";
import { MdLock, MdVisibility, MdSecurity, MdShield, MdVerified, MdBusiness, MdAnalytics, MdTrendingUp, MdLibraryBooks, MdCheckCircle, MdAttachMoney, MdStar, MdPublic, MdHandshake } from 'react-icons/md';
import { SiChainlink } from 'react-icons/si';

export default function ZKPrivacyGuide() {
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
              <MdLock className="text-4xl text-purple-600" />
              <h1 className="text-4xl font-bold web3-gradient-text">Zero-Knowledge Privacy Protection</h1>
            </div>
            <p className="text-xl text-gray-600">
              Learn how WAGA uses cutting-edge Zero-Knowledge proofs to protect sensitive business information while maintaining complete supply chain transparency. Privacy without sacrificing trust.
            </p>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#what-is-zk" className="text-emerald-600 hover:text-emerald-800">1. What is Zero-Knowledge Privacy?</a></li>
              <li><a href="#why-privacy" className="text-emerald-600 hover:text-emerald-800">2. Why Privacy Matters in Coffee</a></li>
              <li><a href="#zk-circuits" className="text-emerald-600 hover:text-emerald-800">3. Our ZK Circuit System</a></li>
              <li><a href="#privacy-levels" className="text-emerald-600 hover:text-emerald-800">4. Privacy Configuration Levels</a></li>
              <li><a href="#business-benefits" className="text-emerald-600 hover:text-emerald-800">5. Business Benefits</a></li>
              <li><a href="#how-it-works" className="text-emerald-600 hover:text-emerald-800">6. How It Works Technically</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* What is Zero-Knowledge Privacy */}
            <section id="what-is-zk" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <MdShield className="text-purple-600" />
                <span>1. What is Zero-Knowledge Privacy?</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Think of Zero-Knowledge proofs like a magic vault that can prove something is true without revealing what's inside. 
                  In the coffee world, this means you can prove your beans are high-quality and competitively priced without 
                  revealing your exact sourcing costs or supplier relationships to competitors.
                </p>

                <div className="bg-purple-50 border-l-4 border-purple-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <MdLock className="text-purple-400 text-xl" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-purple-700">
                        <strong>Real-World Example:</strong> A coffee roaster can prove to distributors that their beans 
                        are "competitively priced" and "premium quality" without revealing their exact farm prices or 
                        specific quality scores that could help competitors reverse-engineer their sourcing strategy.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-2 flex items-center">
                      <MdVisibility className="mr-2" />
                      What You Can Prove
                    </h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Your coffee is "premium quality" (without exact scores)</li>
                      <li>• Your pricing is "competitive" (without exact amounts)</li>
                      <li>• Your beans are "ethically sourced" (without supplier details)</li>
                      <li>• Your inventory is "verified authentic" (without quantities)</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-2 flex items-center">
                      <MdSecurity className="mr-2" />
                      What Stays Private
                    </h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Exact farm purchase prices</li>
                      <li>• Specific quality test scores</li>
                      <li>• Detailed supplier relationships</li>
                      <li>• Inventory quantities and margins</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-3">The Magic of ZK Proofs</h3>
                  <p className="text-sm text-blue-700 mb-3">
                    Imagine you have a secret recipe that makes the best coffee. With ZK proofs, you can:
                  </p>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">✓</span>
                      <span>Prove your coffee tastes amazing (customers can verify)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">✓</span>
                      <span>Keep your secret recipe completely private</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-200 px-2 py-1 rounded text-xs">✓</span>
                      <span>Build trust without giving away trade secrets</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Why Privacy Matters */}
            <section id="why-privacy" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <MdBusiness className="text-amber-600" />
                <span>2. Why Privacy Matters in Coffee</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The coffee industry is incredibly competitive. Every successful coffee business has trade secrets - 
                  special relationships with farmers, unique sourcing strategies, or proprietary quality assessments. 
                  Traditional blockchain systems force you to choose between transparency and protecting your business advantage. 
                  WAGA's ZK privacy lets you have both.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-amber-50 p-4 rounded-lg border-l-4 border-amber-300">
                    <h3 className="font-semibold text-amber-800 mb-3">For Coffee Roasters</h3>
                    <div className="space-y-2 text-sm text-amber-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-600">•</span>
                        <span>Protect your sourcing relationships with specific farms</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-600">•</span>
                        <span>Keep your profit margins private while proving fair trade</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-amber-600">•</span>
                        <span>Prove quality without revealing test methodologies</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg border-l-4 border-emerald-300">
                    <h3 className="font-semibold text-emerald-800 mb-3">For Distributors</h3>
                    <div className="space-y-2 text-sm text-emerald-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-emerald-600">•</span>
                        <span>Keep customer lists and pricing strategies confidential</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-emerald-600">•</span>
                        <span>Prove inventory authenticity without revealing quantities</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-emerald-600">•</span>
                        <span>Build trust while maintaining competitive advantage</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-300">
                    <h3 className="font-semibold text-blue-800 mb-3">For Farmers</h3>
                    <div className="space-y-2 text-sm text-blue-700">
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>Protect individual farm pricing negotiations</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>Prove sustainable practices without revealing specifics</span>
                      </div>
                      <div className="flex items-start space-x-2">
                        <span className="text-blue-600">•</span>
                        <span>Build reputation while keeping business details private</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <MdTrendingUp className="text-red-400 text-xl" />
                    </div>
                    <div className="ml-3">
                      <h3 className="font-semibold text-red-800 mb-2">The Competitive Intelligence Problem</h3>
                      <p className="text-sm text-red-700">
                        Without privacy protection, publishing all business data on a public blockchain is like 
                        giving your competitors a detailed playbook of your entire operation. They could see your 
                        exact costs, identify your suppliers, and undercut your strategies. ZK privacy solves this 
                        by proving legitimacy without revealing the details that matter for competition.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Ready to Enable Privacy Protection */}
            <div className="mt-12 web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>Ready to Enable Privacy Protection?</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/docs/guides/admin" className="web3-button-outline block text-center">
                  <MdLock className="mr-2" />
                  Configure ZK Privacy
                </Link>
                <Link href="/docs/guides/smart-contracts" className="web3-button-outline block text-center">
                  <MdAnalytics className="mr-2" />
                  Technical Details
                </Link>
                <Link href="/docs" className="web3-button-outline block text-center">
                  <MdLibraryBooks className="mr-2" />
                  View All Guides
                </Link>
              </div>
              
              <div className="mt-6 bg-purple-50 p-4 rounded-lg text-center">
                <p className="text-purple-700">
                  <strong>Questions about ZK Privacy?</strong> Our system is designed to be user-friendly. 
                  You can start with basic privacy settings and adjust them as you learn. 
                  <Link href="/docs/guides/getting-started" className="text-emerald-600 hover:text-emerald-800 font-semibold"> Check out our getting started guide</Link> 
                  to see how easy it is.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}