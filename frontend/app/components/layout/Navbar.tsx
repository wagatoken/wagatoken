"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "../WalletConnect";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getNavItems = () => {
    const baseItems = [
      { href: '/browse', label: 'Browse Coffee', public: true },
      { href: '/about', label: 'About', public: true },
      { href: '/docs', label: 'Docs', public: true }
    ];

    if (pathname.startsWith('/admin')) {
      return [
        { href: '/admin', label: 'Admin Portal', active: true },
        { href: '/distributor', label: 'Distributor Portal' },
        ...baseItems
      ];
    }
    
    if (pathname.startsWith('/distributor')) {
      return [
        { href: '/distributor', label: 'Distributor Portal', active: true },
        { href: '/admin', label: 'Admin Portal' },
        ...baseItems
      ];
    }

    // Default navigation for home and other pages
    return [
      { href: '/admin', label: 'Admin Portal' },
      { href: '/distributor', label: 'Distributor Portal' },
      ...baseItems
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="web3-mobile-nav bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-800 backdrop-blur-md border-b border-amber-500/30 transition-all duration-300 shadow-lg shadow-emerald-900/20">
      <div className="web3-container-mobile">
        <div className="flex justify-between items-center h-16 md:h-18 gap-6">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group sm:space-x-3">
              <div className="waga-logo-mobile transition-all duration-300 group-hover:scale-105">
                <img 
                  src="https://violet-rainy-toad-577.mypinata.cloud/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca" 
                  alt="WAGA Logo" 
                  className="w-8 h-8 object-contain rounded-lg sm:w-10 sm:h-10"
                />
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-lg font-bold text-white tracking-wide sm:text-2xl">WAGA</span>
                <div className="hidden sm:flex flex-col">
                  <span className="text-amber-200 font-semibold text-sm tracking-wide">Coffee</span>
                </div>
              </div>
            </Link>
            <div className="web3-blockchain-status ml-2 hidden lg:flex">
              <div className="bg-blue-500/20 border border-blue-400/40 px-2 py-1 rounded-md backdrop-blur-sm">
                <span className="text-blue-200 font-medium text-xs">🌐 Base Testnet</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap min-w-fit ${
                    ('active' in item && item.active) || pathname === item.href
                      ? 'bg-amber-500/20 text-amber-200 shadow-sm border border-amber-400/30'
                      : 'text-green-100 hover:text-amber-300 hover:bg-white/10 border border-transparent'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:flex items-center">
            <div className="max-w-xs shrink-0">
              <WalletConnect />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="web3-touch-target text-green-100 hover:text-amber-300 hover:bg-white/10 transition-all duration-300"
            >
              <svg className="h-5 w-5 sm:h-6 sm:w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-emerald-700/50 bg-gradient-to-r from-green-800/90 to-emerald-900/90">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`web3-touch-target justify-start px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 sm:text-base ${
                    ('active' in item && item.active) || pathname === item.href
                      ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                      : 'text-green-100 hover:text-amber-300 hover:bg-white/10'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Wallet Section */}
              <div className="px-3 py-3 border-t border-emerald-700/50 mt-4">
                <div className="text-xs font-medium text-white mb-2 sm:text-sm">Wallet Connection</div>
                <div className="mb-2">
                  <WalletConnect />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
