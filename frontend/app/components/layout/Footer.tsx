"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-r from-green-800 to-emerald-900 backdrop-blur-xl border-t border-amber-500/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">☕</span>
              </div>
              <div>
                <div className="text-white text-xl font-bold">WAGA</div>
                <div className="text-green-200 text-sm">Coffee Platform</div>
              </div>
            </div>
            <p className="text-green-100 text-sm mb-4">
              Tokenizing premium roasted coffee from the highlands of Ethiopia. Farm-to-cup traceability powered by blockchain technology.
            </p>
            <div className="flex items-center space-x-2 text-xs text-green-200">
              <span>🇪🇹</span>
              <span>Proudly Ethiopian</span>
            </div>
            <div className="flex space-x-2 mt-4">
              <div className="web3-badge web3-badge-success">
                ✅ Base Sepolia
              </div>
              <div className="web3-badge web3-badge-warning">
                📦 IPFS Active
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Browse Coffee Batches
                </Link>
              </li>
              <li>
                <Link href="/consumer" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Consumer Portal
                </Link>
              </li>
              <li>
                <Link href="/producer" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  WAGA Admin Tools
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Blockchain</h3>
            <ul className="space-y-2">
              <li>
                <a 
                  href="https://basescan.org/address/0xbAA584BDA90bF54fee155329e59C0E7e02A40FD2" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-100 hover:text-amber-300 text-sm transition-colors flex items-center space-x-1"
                >
                  <span>Smart Contracts</span>
                  <span>↗</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://functions.chain.link" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-100 hover:text-amber-300 text-sm transition-colors flex items-center space-x-1"
                >
                  <span>Chainlink Functions</span>
                  <span>↗</span>
                </a>
              </li>
              <li>
                <a 
                  href="https://pinata.cloud" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-100 hover:text-amber-300 text-sm transition-colors flex items-center space-x-1"
                >
                  <span>IPFS Storage</span>
                  <span>↗</span>
                </a>
              </li>
              <li>
                <Link href="/docs" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Integration Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Social & Community */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <div className="space-y-3">
              <a
                href="https://twitter.com/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <span>🐦</span>
                <span>Twitter</span>
              </a>
              <a
                href="https://t.me/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <span>📱</span>
                <span>Telegram</span>
              </a>
              <a
                href="https://linkedin.com/company/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <span>💼</span>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <span>💻</span>
                <span>GitHub</span>
              </a>
              <a
                href="https://discord.gg/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <span>🎮</span>
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-amber-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-green-100 text-sm mb-4 md:mb-0">
              © {currentYear} WAGA Coffee Platform. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-green-200">
              <span className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Powered by Chainlink</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📡</span>
                <span>Stored on IPFS</span>
              </span>
              <Link href="/privacy" className="hover:text-amber-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-amber-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
