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
      { href: '/browse', label: '🌱 Browse Coffee', public: true },
      { href: '/about', label: 'About', public: true },
      { href: '/docs', label: 'Docs', public: true }
    ];

    if (pathname.startsWith('/producer')) {
      return [
        { href: '/producer', label: '🏪 Vendor Tools', active: true },
        { href: '/consumer', label: '👤 Consumer Portal' },
        ...baseItems
      ];
    }
    
    if (pathname.startsWith('/consumer')) {
      return [
        { href: '/consumer', label: '👤 Consumer Portal', active: true },
        { href: '/producer', label: '🏪 Vendor Tools' },
        ...baseItems
      ];
    }

    // Default navigation for home and other pages
    return [
      { href: '/producer', label: '🏪 Vendor Tools' },
      { href: '/consumer', label: '👤 Consumer Portal' },
      ...baseItems
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-800 backdrop-blur-md border-b border-amber-500/30 transition-all duration-300 shadow-lg shadow-emerald-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="waga-navbar-logo transition-all duration-300 group-hover:scale-105">
                <img 
                  src="https://violet-rainy-toad-577.mypinata.cloud/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca" 
                  alt="WAGA Logo" 
                  className="w-10 h-10 object-contain rounded-lg"
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-white tracking-wide">WAGA</span>
                <div className="hidden sm:flex flex-col">
                  <span className="text-amber-200 font-semibold text-sm tracking-wide">Coffee</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    ('active' in item && item.active) || pathname === item.href
                      ? 'bg-amber-500/20 text-amber-200 shadow-sm border border-amber-400/30'
                      : 'text-green-100 hover:text-amber-300 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center space-x-4">
              {/* Network Status */}
              <div className="bg-green-100/90 text-green-800 border border-green-300/50 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
                🌐 Base Sepolia
              </div>
              
              {/* Wallet Connect Component */}
              <WalletConnect />
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-green-100 hover:text-amber-300 hover:bg-white/10 p-2 rounded-lg transition-all duration-300"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
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
                  className={`block px-3 py-2 rounded-lg text-base font-medium transition-all duration-300 ${
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
                <div className="text-sm font-medium text-white mb-2">Wallet Connection</div>
                <div className="mb-2">
                  <div className="bg-green-100/90 text-green-800 border border-green-300/50 px-3 py-1 rounded-full text-xs font-medium shadow-sm mb-2 inline-block">
                    🌐 Base Sepolia
                  </div>
                </div>
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
