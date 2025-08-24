"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { NetworkEthereum, TokenETH } from '@web3icons/react';
import { 
  CoffeeBeanIcon,
  VerificationIcon,
  CoffeeStorageIcon,
  DistributorNetworkIcon,
  TraceabilityIcon,
  BatchCreationIcon
} from './components/icons/WagaIcons';
import { CoffeeBatch } from "@/utils/types";

export default function HomePage() {
  const [featuredBatches, setFeaturedBatches] = useState<CoffeeBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { label: "Smart Contracts Deployed", value: "4", icon: <NetworkEthereum size={24} variant="branded" />, theme: "blockchain" },
    { label: "Coffee Batches Tracked", value: "Loading...", icon: <CoffeeBeanIcon size={24} className="waga-icon-coffee" />, theme: "coffee" },
    { label: "Verified Batches", value: "Loading...", icon: <VerificationIcon size={24} className="waga-icon-verification" />, theme: "verification" },
    { label: "IPFS Storage", value: "Active", icon: <CoffeeStorageIcon size={24} className="waga-icon-storage" />, theme: "storage" },
  ]);

  const features = [
    {
      title: "Admin Portal",
      description: "Administrative interface for WAGA staff to create, verify, and manage coffee batches",
      icon: <BatchCreationIcon size={32} className="waga-icon-batch" />,
      href: "/admin",
      color: "emerald"
    },
    {
      title: "Distributor Portal",
      description: "Request verified coffee batches and redeem tokens for physical coffee delivery",
      icon: <DistributorNetworkIcon size={32} className="waga-icon-network" />,
      href: "/distributor",
      color: "blue"
    },
    {
      title: "Browse Coffee",
      description: "Explore verified Ethiopian coffee batches managed by WAGA",
      icon: <CoffeeBeanIcon size={32} className="waga-icon-coffee" />,
      href: "/browse",
      color: "green"
    },
    {
      title: "Documentation",
      description: "Learn about our blockchain coffee traceability system",
      icon: <TraceabilityIcon size={32} className="waga-icon-trace" />,
      href: "/docs",
      color: "purple"
    }
  ];

  const fetchFeaturedBatches = async () => {
    try {
      const response = await fetch('/api/batches');
      if (response.ok) {
        const data = await response.json();
        const allBatches = data.batches || [];
        
        // Show only verified batches as featured
        const verified = allBatches.filter((b: CoffeeBatch) => b.verification.verificationStatus === 'verified').slice(0, 3);
        setFeaturedBatches(verified);
        
        // Update stats with real data
        const totalBatches = allBatches.length;
        const verifiedBatches = allBatches.filter((b: CoffeeBatch) => b.verification.verificationStatus === 'verified').length;
        const verificationRate = totalBatches > 0 ? Math.round((verifiedBatches / totalBatches) * 100) : 0;
        
        setStats([
          { label: "Smart Contracts Deployed", value: "4", icon: <NetworkEthereum size={24} variant="branded" />, theme: "blockchain" },
          { label: "Coffee Batches Tracked", value: `${totalBatches}`, icon: <CoffeeBeanIcon size={24} className="waga-icon-coffee" />, theme: "coffee" },
          { label: "Verification Rate", value: `${verificationRate}%`, icon: <VerificationIcon size={24} className="waga-icon-verification" />, theme: "verification" },
          { label: "IPFS Storage", value: "Active", icon: <CoffeeStorageIcon size={24} className="waga-icon-storage" />, theme: "storage" },
        ]);
      }
    } catch (error) {
      console.error('Error fetching featured batches:', error);
      // Keep default stats if fetch fails
      setStats([
        { label: "Smart Contracts Deployed", value: "4", icon: <NetworkEthereum size={24} variant="branded" />, theme: "blockchain" },
        { label: "Coffee Batches Tracked", value: "12+", icon: <CoffeeBeanIcon size={24} className="waga-icon-coffee" />, theme: "coffee" },
        { label: "Verification Rate", value: "85%", icon: <VerificationIcon size={24} className="waga-icon-verification" />, theme: "verification" },
        { label: "IPFS Storage", value: "Active", icon: <CoffeeStorageIcon size={24} className="waga-icon-storage" />, theme: "storage" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeaturedBatches();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="web3-hero web3-hero-spacing web3-neural-network">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="mb-6 sm:mb-8">
            <div className="mb-4 sm:mb-6 flex justify-center">
              <div className="waga-logo-container animate-gentle-float transition-all duration-300">
                <img 
                  src="https://violet-rainy-toad-577.mypinata.cloud/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca" 
                  alt="WAGA Coffee Logo" 
                  className="h-16 sm:h-20 lg:h-24 w-auto rounded-lg sm:rounded-xl"
                />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 web3-hero-title">
              WAGA 
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl mb-6 sm:mb-8 opacity-90 web3-hero-subtitle-animated">
              Onchain Coffee - OffChain Impact
            </p>
            <p className="text-lg sm:text-xl md:text-2xl mb-8 sm:mb-10 opacity-80 max-w-3xl mx-auto text-white">
                Fair and Transparent From farm to cup 
            </p>
            
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
              <Link 
                href="/admin" 
                className="web3-gradient-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 web3-button-stable web3-subtle-glow min-h-[44px]"
              >
                Admin Portal
              </Link>
              <Link 
                href="/distributor" 
                className="web3-button-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 web3-holographic-border web3-button-stable min-h-[44px]"
              >
                Distributor Portal
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 web3-section web3-data-grid-static">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, index) => (
              <div key={index} className={`web3-stat-card stat-card-${stat.theme} group ${
                index % 2 === 0 ? 'animate-gentle-sway' : 'animate-gentle-sway-reverse'
              }`} style={{ animationDelay: `${index * 0.5}s` }}>
                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">
                  <span>{stat.icon}</span>
                </div>
                <div className="text-2xl sm:text-3xl font-bold web3-gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium text-sm sm:text-base">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Batches */}
      {featuredBatches.length > 0 && (
        <section className="py-12 sm:py-16 web3-section-alt web3-matrix-rain">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 web3-text-stable">Featured Coffee Batches</h2>
              <p className="text-lg sm:text-xl text-gray-600">Discover the latest verified coffee from our partner farms</p>
            </div>

            {loading ? (
              <div className="flex justify-center py-8 sm:py-12">
                <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-emerald-600 web3-cyber-glow"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {featuredBatches.map((batch, index) => (
                  <div key={batch.batchId} className="web3-card web3-holographic-border-enhanced web3-card-stable web3-coffee-particles" style={{ animationDelay: `${index * 200}ms` }}>
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-1">
                        {batch.batchDetails.farmName}
                      </h3>
                      <div className="text-emerald-600 text-sm font-medium">
                        {batch.batchDetails.location}
                      </div>
                    </div>

                    <div className="space-y-2 mb-6 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Batch:</span>
                        <span className="text-gray-900 font-medium">#{batch.batchId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Packaging:</span>
                        <span className="text-emerald-600 font-medium">{batch.packaging}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="text-gray-900 font-bold">${batch.price}/bag</span>
                      </div>
                    </div>

                    <Link
                      href="/browse"
                      className="w-full web3-gradient-button-secondary text-sm py-2 block text-center web3-button-stable"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 sm:py-20 web3-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 web3-text-stable">
              Complete Coffee Ecosystem
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              From production to consumption, every step is verified and transparent 
              through our decentralized platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href}>
                <div className={`web3-card-feature group cursor-pointer h-full web3-quantum-blur web3-card-stable ${
                  index % 2 === 0 ? 'animate-slide-left' : 'animate-slide-right'
                }`} style={{ animationDelay: `${index * 300}ms` }}>
                  <div className="text-5xl mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {feature.description}
                  </p>
                  <div className="text-emerald-600 font-medium group-hover:text-emerald-700 transition-colors">
                    Explore →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-16 sm:py-20 web3-section-alt web3-neural-network">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="waga-logo-container transition-all duration-300 opacity-90 hover:opacity-100">
                <img 
                  src="https://violet-rainy-toad-577.mypinata.cloud/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca" 
                  alt="WAGA Coffee Logo" 
                  className="h-12 sm:h-14 lg:h-16 w-auto rounded-lg"
                />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 web3-gradient-text-harmonized">
              Powered by Web3 Technology
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Built on cutting-edge blockchain infrastructure for maximum security and transparency
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="web3-card text-center web3-glass-morphism web3-card-stable">
              <div className="flex justify-center mb-4 web3-subtle-glow">
                <NetworkEthereum size={48} variant="branded" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Contracts</h3>
              <p className="text-gray-600 mb-4">
                ERC-1155 tokens represent verified coffee batches 
              </p>
              <div className="web3-badge web3-badge-success">
                ✅ Deployed & Verified
              </div>
            </div>

            <div className="web3-card text-center web3-glass-morphism web3-card-stable" style={{ animationDelay: '0.2s' }}>
              <div className="flex justify-center mb-4 web3-subtle-glow">
                <NetworkEthereum size={48} variant="branded" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Chainlink Oracles</h3>
              <p className="text-gray-600 mb-4">
                Decentralized verification of coffee inventory through Chainlink Functions
              </p>
              <div className="web3-badge web3-badge-info">
                Base Testnet Active
              </div>
            </div>

            <div className="web3-card text-center web3-glass-morphism web3-card-stable" style={{ animationDelay: '0.4s' }}>
              <div className="text-4xl mb-4 web3-subtle-glow">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">IPFS Storage</h3>
              <p className="text-gray-600 mb-4">
                Immutable metadata storage via Pinata for complete transparency
              </p>
              <div className="web3-badge web3-badge-warning">
                Pinata Integrated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 sm:py-20 web3-hero web3-data-grid-subtle">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 web3-text-stable">
            Ready to Transform the Coffee Value Chain?
          </h2>
          <p className="text-lg sm:text-xl mb-8 sm:mb-10 opacity-90">
            Join the future of coffee supply chain management with decentralized technology
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center">
            <Link 
              href="/producer" 
              className="web3-button-outline text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 web3-holographic-border web3-clickable-stable min-h-[44px]"
            >
              🏛️ WAGA Admin Access
            </Link>
            <Link 
              href="/docs" 
              className="web3-gradient-button text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 web3-clickable-stable min-h-[44px]"
            >
              📚 Read Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
