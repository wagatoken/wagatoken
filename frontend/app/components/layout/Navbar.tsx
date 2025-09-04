"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import WalletConnect from "../WalletConnect";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPortalsDropdownOpen, setIsPortalsDropdownOpen] = useState(false);
  const pathname = usePathname();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const togglePortalsDropdown = () => {
    setIsPortalsDropdownOpen(!isPortalsDropdownOpen);
  };

  // Portal items grouped by user type
  const portalItems = [
    { 
      href: '/admin', 
      label: 'Admin Portal', 
      description: 'Manage and verify batches',
      category: 'Management'
    },
    { 
      href: '/cooperatives', 
      label: 'Cooperatives Portal', 
      description: 'Create green bean batches',
      category: 'Production'
    },
    { 
      href: '/roaster', 
      label: 'Roaster Portal', 
      description: 'Create roasted bean batches',
      category: 'Production'
    },
    { 
      href: '/processor', 
      label: 'Processor Portal', 
      description: 'Create retail coffee batches',
      category: 'Production'
    },
    { 
      href: '/distributor', 
      label: 'Distributor Portal', 
      description: 'Request and redeem batches',
      category: 'Distribution'
    }
  ];

  const getNavItems = () => {
    const baseItems = [
      { href: '/browse', label: 'Browse Coffee', public: true },
      { href: '/about', label: 'About', public: true },
      { href: '/docs', label: 'Docs', public: true }
    ];

    return baseItems;
  };

  const navItems = getNavItems();

  // Check if current path is a portal
  const isPortalActive = portalItems.some(portal => pathname.startsWith(portal.href));
  const currentPortal = portalItems.find(portal => pathname.startsWith(portal.href));

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
                <span className="text-lg font-bold web3-navbar-brand tracking-wide sm:text-2xl">WAGA</span>
                <div className="hidden sm:flex flex-col">
                  <span className="web3-navbar-subtitle font-semibold text-sm tracking-wide">Coffee</span>
                </div>
              </div>
            </Link>
            <div className="web3-blockchain-status ml-2 hidden lg:flex">
              <div className="web3-blockchain-badge px-2 py-1 rounded-md backdrop-blur-sm">
                <span className="font-medium">🌐 Base Testnet</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex items-center space-x-4">
              {/* Portals Dropdown */}
              <div className="relative">
                <button
                  onClick={togglePortalsDropdown}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap min-w-fit ${
                    isPortalActive
                      ? 'web3-nav-link-active'
                      : 'web3-nav-link'
                  }`}
                >
                  {currentPortal ? currentPortal.label : 'User Portals'}
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isPortalsDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                        Coffee Value Chain Portals
                      </div>
                      {portalItems.map((portal) => (
                        <Link
                          key={portal.href}
                          href={portal.href}
                          onClick={() => setIsPortalsDropdownOpen(false)}
                          className={`block px-3 py-2 rounded-md text-sm transition-all duration-200 ${
                            pathname.startsWith(portal.href)
                              ? 'bg-emerald-50 text-emerald-700 border-l-4 border-emerald-500'
                              : 'text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <div className="font-medium">{portal.label}</div>
                          <div className="text-xs text-gray-500">{portal.description}</div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Regular Nav Items */}
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center whitespace-nowrap min-w-fit ${
                    pathname === item.href
                      ? 'web3-nav-link-active'
                      : 'web3-nav-link'
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
              className="web3-touch-target web3-nav-link transition-all duration-300"
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
              {/* Mobile Portals Section */}
              <div className="py-2">
                <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wide px-3 py-2">
                  User Portals
                </div>
                {portalItems.map((portal) => (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    className={`web3-touch-target justify-start px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 sm:text-base ${
                      pathname.startsWith(portal.href)
                        ? 'web3-mobile-nav-link-active'
                        : 'web3-mobile-nav-link'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <div>
                      <div>{portal.label}</div>
                      <div className="text-xs opacity-75">{portal.description}</div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Mobile Regular Nav Items */}
              <div className="border-t border-emerald-700/50 pt-2">
                <div className="text-xs font-semibold text-emerald-200 uppercase tracking-wide px-3 py-2">
                  Platform
                </div>
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`web3-touch-target justify-start px-3 py-3 rounded-lg text-sm font-medium transition-all duration-300 sm:text-base ${
                      pathname === item.href
                        ? 'web3-mobile-nav-link-active'
                        : 'web3-mobile-nav-link'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Mobile Wallet Section */}
              <div className="px-3 py-3 border-t border-emerald-700/50 mt-4">
                <div className="text-xs font-medium web3-navbar-subtitle mb-2 sm:text-sm">Wallet Connection</div>
                <div className="mb-2">
                  <WalletConnect />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown backdrop */}
      {isPortalsDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsPortalsDropdownOpen(false)}
        />
      )}
    </nav>
  );
}
