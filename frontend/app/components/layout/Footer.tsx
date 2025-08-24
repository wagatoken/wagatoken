"use client";

import Link from "next/link";
import { 
  NetworkEthereum, 
  NetworkBase, 
  TokenETH, 
  WalletMetamask
} from '@web3icons/react';
import { 
  FaTwitter, 
  FaTelegram, 
  FaLinkedin 
} from 'react-icons/fa';
import { 
  SiChainlink, 
  SiIpfs 
} from 'react-icons/si';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-green-900 via-green-800 to-amber-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="waga-navbar-logo transition-all duration-300 hover:scale-105">
                <img 
                  src="https://violet-rainy-toad-577.mypinata.cloud/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca" 
                  alt="WAGA Logo" 
                  className="w-10 h-10 object-contain rounded-lg"
                />
              </div>
              <div>
                <div className="text-white text-xl font-bold tracking-wide">WAGA</div>
                <div className="text-amber-200 text-sm font-semibold tracking-wide">Coffee</div>
              </div>
            </div>
            <p className="text-green-100 text-sm mb-4">
              Tokenizing premium roasted coffee from highland regions. Farm-to-cup traceability powered by blockchain technology.
            </p>
            <div className="flex items-center space-x-2 text-xs text-amber-200 mb-4">
              <span>🇪🇹</span>
              <span>Proudly Ethiopian</span>
            </div>
            <div className="flex space-x-2">
              <div className="web3-badge web3-badge-success flex items-center gap-1">
                <NetworkBase size={14} variant="branded" />
                <span>Base Testnet</span>
              </div>
              <div className="web3-badge web3-badge-warning flex items-center gap-1">
                <NetworkEthereum size={14} variant="branded" />
                <span>IPFS Active</span>
              </div>
            </div>
          </div>

          {/* Navigation & Resources */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Platform</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/browse" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Browse Coffee Batches
                </Link>
              </li>
              <li>
                <Link href="/distributor" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Distributor Portal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Admin Tools
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
              <li>
                <Link href="/docs/guides/distributor" className="text-green-100 hover:text-amber-300 text-sm transition-colors">
                  Distributor Guide
                </Link>
              </li>
            </ul>
          </div>

          {/* Community & Contact */}
          <div className="col-span-1">
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <div className="space-y-3 mb-6">
              <a
                href="https://x.com/Wagatoken?t=DJ-g5RE824iE4dpeTUHc7w&s=09"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <FaTwitter size={16} />
                <span>Twitter</span>
              </a>
              <a
                href="https://t.me/wagatoken"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <FaTelegram size={16} />
                <span>Telegram</span>
              </a>
              <a
                href="https://www.linkedin.com/company/wagaprotocol/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-green-100 hover:text-amber-300 text-sm transition-colors"
              >
                <FaLinkedin size={16} />
                <span>LinkedIn</span>
              </a>
            </div>
            
            <div className="border-t border-amber-500/20 pt-4">
              <h4 className="text-white font-medium mb-2 text-sm">Technology</h4>
              <div className="space-y-1 text-xs text-green-200">
                <a
                  href="https://docs.chain.link/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-amber-300 transition-colors"
                >
                  <SiChainlink size={12} />
                  <span>Powered by Chainlink</span>
                </a>
                <a
                  href="https://pinata.cloud/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-amber-300 transition-colors"
                >
                  <SiIpfs size={12} />
                  <span>Stored on IPFS</span>
                </a>
                <a
                  href="https://docs.base.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 hover:text-amber-300 transition-colors"
                >
                  <NetworkBase size={12} variant="branded" />
                  <span>Base Network</span>
                </a>
              </div>
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
