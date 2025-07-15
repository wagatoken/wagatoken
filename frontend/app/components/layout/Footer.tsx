"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900/95 backdrop-blur-xl border-t border-purple-500/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">☕</span>
              </div>
              <div>
                <div className="web3-gradient-text text-xl font-bold">WAGA</div>
                <div className="text-gray-400 text-sm">Coffee Platform</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Tokenizing premium roasted coffee from the highlands of Ethiopia. Farm-to-cup traceability powered by blockchain technology.
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>🇪🇹</span>
              <span>Proudly Ethiopian</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  Browse Coffee Batches
                </Link>
              </li>
              <li>
                <Link href="/dashboard/user" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  My Token Portfolio
                </Link>
              </li>
              <li>
                <Link href="/dashboard/user?tab=redemptions" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  Track Orders
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  Producer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/api-reference" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  API Reference
                </Link>
              </li>
              <li>
                <Link href="/chainlink" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  Chainlink Integration
                </Link>
              </li>
              <li>
                <Link href="/ipfs" className="text-gray-400 hover:text-purple-300 text-sm transition-colors">
                  IPFS Storage
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
                className="flex items-center space-x-2 text-gray-400 hover:text-purple-300 text-sm transition-colors"
              >
                <span>🐦</span>
                <span>Twitter</span>
              </a>
              <a
                href="https://t.me/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-purple-300 text-sm transition-colors"
              >
                <span>📱</span>
                <span>Telegram</span>
              </a>
              <a
                href="https://linkedin.com/company/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-purple-300 text-sm transition-colors"
              >
                <span>💼</span>
                <span>LinkedIn</span>
              </a>
              <a
                href="https://github.com/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-purple-300 text-sm transition-colors"
              >
                <span>💻</span>
                <span>GitHub</span>
              </a>
              <a
                href="https://discord.gg/wagacoffee"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-gray-400 hover:text-purple-300 text-sm transition-colors"
              >
                <span>🎮</span>
                <span>Discord</span>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-purple-500/20">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} WAGA Coffee Platform. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-xs text-gray-500">
              <span className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Powered by Chainlink</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📡</span>
                <span>Stored on IPFS</span>
              </span>
              <Link href="/privacy" className="hover:text-purple-300 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-purple-300 transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
