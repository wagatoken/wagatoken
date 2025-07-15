"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userAddress] = useState("0x742d35Cc6634C0532925a3b8D581C2532D8b8132"); // Mock wallet
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const getNavItems = () => {
    const baseItems = [
      { href: '/browse', label: '🌱 Browse Batches', public: true },
      { href: '/about', label: 'About', public: true },
      { href: '/docs', label: 'Docs', public: true }
    ];

    if (pathname.startsWith('/producer')) {
      return [
        { href: '/producer', label: '🏭 Producer Dashboard', active: true },
        { href: '/consumer', label: '👤 Consumer Portal' },
        ...baseItems
      ];
    }
    
    if (pathname.startsWith('/consumer')) {
      return [
        { href: '/consumer', label: '👤 Consumer Portal', active: true },
        { href: '/producer', label: '🏭 Producer Tools' },
        ...baseItems
      ];
    }

    // Default navigation for home and other pages
    return [
      { href: '/producer', label: '🏭 Producer Tools' },
      { href: '/consumer', label: '👤 Consumer Portal' },
      ...baseItems
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-gray-900/95 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">☕</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="web3-gradient-text text-xl font-bold">WAGA</span>
                <span className="text-white font-medium">Coffee Platform</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    ('active' in item && item.active) || pathname === item.href
                      ? 'bg-purple-500/30 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-purple-500/20'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="web3-card p-2 flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="text-xs">
                  <div className="text-gray-400">Connected</div>
                  <div className="font-mono text-white text-xs">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-400 hover:text-white hover:bg-gray-700 px-2 py-2 rounded-md"
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
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-purple-500/20">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    ('active' in item && item.active) || pathname === item.href
                      ? 'bg-purple-500/30 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-purple-500/20'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Mobile Wallet Info */}
              <div className="px-3 py-2 border-t border-purple-500/20 mt-4">
                <div className="text-xs text-gray-400 mb-1">Connected Wallet</div>
                <div className="font-mono text-white text-xs">
                  {userAddress.slice(0, 10)}...{userAddress.slice(-6)}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

