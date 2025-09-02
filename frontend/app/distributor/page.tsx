"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import {
  getActiveBatchIds,
  getBatchInfoWithMetadata,
  requestBatchVerification,
  getUserBatchBalance,
  requestCoffeeRedemption,
  getUserRoles,
  getBatchProductType,
  getBatchUnitWeight
} from "@/utils/smartContracts";
import { SiIpfs } from 'react-icons/si';
import { FaLink } from 'react-icons/fa';
import { MdCheck, MdClose, MdCoffee, MdVerified, MdStorefront, MdStorage, MdOutlineAssignment, MdLocalShipping, MdToken, MdNature, MdLocalFireDepartment, MdShoppingCart, MdFilterList } from 'react-icons/md';
import { CoffeeBatchMetadata } from "@/utils/ipfsMetadata";

interface BatchDisplay {
  batchId: string;
  name: string;
  origin: string;
  farmer: string;
  quantity: number;
  packagingInfo: string;
  pricePerUnit: string;
  isVerified: boolean;
  isMetadataVerified: boolean;
  userBalance: number;
  metadata?: CoffeeBatchMetadata;
  productType?: 'RETAIL_BAGS' | 'GREEN_BEANS' | 'ROASTED_BEANS';
  unitWeight?: string;
}

// Product type definitions
const PRODUCT_TYPES = {
  ALL: { label: 'All Products', icon: MdCoffee, color: 'text-gray-600' },
  RETAIL_BAGS: { label: 'Retail Coffee Bags', icon: MdShoppingCart, color: 'text-blue-600' },
  GREEN_BEANS: { label: 'Green Coffee Beans', icon: MdNature, color: 'text-green-600' },
  ROASTED_BEANS: { label: 'Roasted Coffee Beans', icon: MdLocalFireDepartment, color: 'text-orange-600' }
};

function DistributorPageContent() {
  const searchParams = useSearchParams();
  const selectedBatchFromBrowse = searchParams.get('batchId');
  
  const [activeTab, setActiveTab] = useState<'request' | 'redeem'>('request');
  const [userAddress, setUserAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [batches, setBatches] = useState<BatchDisplay[]>([]);
  const [filteredBatches, setFilteredBatches] = useState<BatchDisplay[]>([]);
  const [userRoles, setUserRoles] = useState({
    isAdmin: false,
    isVerifier: false,
    isMinter: false,
    isRedemption: false,
    isFulfiller: false
  });

  // Product type filtering
  const [selectedProductType, setSelectedProductType] = useState<'ALL' | 'RETAIL_BAGS' | 'GREEN_BEANS' | 'ROASTED_BEANS'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'quantity' | 'date'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Request form state
  const [selectedBatchForRequest, setSelectedBatchForRequest] = useState<string>(selectedBatchFromBrowse || '');
  
  // Redemption form state
  const [selectedBatchForRedemption, setSelectedBatchForRedemption] = useState<string>('');
  const [redemptionQuantity, setRedemptionQuantity] = useState<number>(1);
  const [shippingInfo, setShippingInfo] = useState<string>('');

  // Connect wallet
  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        setUserAddress(accounts[0]);
      } catch (error) {
        setError('Error connecting wallet');
        console.error('Error connecting wallet:', error);
      }
    } else {
      setError('MetaMask not found. Please install MetaMask.');
    }
  };

  // Load user roles
  const loadUserRoles = async () => {
    try {
      const roles = await getUserRoles();
      setUserRoles(roles);
    } catch (err) {
      console.error('Error loading user roles:', err);
    }
  };

  // Load batches with user balances and product types
  const loadBatches = async () => {
    try {
      setLoading(true);
      const batchIds = await getActiveBatchIds();

      const batchPromises = batchIds.map(async (id) => {
        const [batchInfo, userBalance, productType, unitWeight] = await Promise.all([
          getBatchInfoWithMetadata(id),
          userAddress ? getUserBatchBalance(id, userAddress) : Promise.resolve(0),
          getBatchProductType(id).catch(() => 0), // Default to RETAIL_BAGS (0) if error
          getBatchUnitWeight(id).catch(() => '') // Default to empty string if error
        ]);

        // Convert product type number to string
        let productTypeString: 'RETAIL_BAGS' | 'GREEN_BEANS' | 'ROASTED_BEANS' = 'RETAIL_BAGS';
        if (productType === 1) productTypeString = 'GREEN_BEANS';
        else if (productType === 2) productTypeString = 'ROASTED_BEANS';

        return {
          batchId: id,
          name: batchInfo.metadata?.name || `Batch ${id}`,
          origin: batchInfo.metadata?.properties.origin || 'Unknown',
          farmer: batchInfo.metadata?.properties.farmer || 'Unknown',
          quantity: batchInfo.quantity,
          packagingInfo: batchInfo.packagingInfo,
          pricePerUnit: (parseFloat(batchInfo.pricePerUnit) / 1e18).toFixed(4),
          isVerified: batchInfo.isVerified,
          isMetadataVerified: batchInfo.isMetadataVerified,
          userBalance,
          metadata: batchInfo.metadata,
          productType: productTypeString,
          unitWeight: unitWeight || batchInfo.packagingInfo
        };
      });

      const batchDisplays = await Promise.all(batchPromises);
      setBatches(batchDisplays);
      setFilteredBatches(batchDisplays);
    } catch (err) {
      setError('Failed to load batches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort batches
  const applyFilters = () => {
    let filtered = batches;

    // Filter by product type
    if (selectedProductType !== 'ALL') {
      filtered = filtered.filter(batch => batch.productType === selectedProductType);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(batch =>
        batch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        batch.farmer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort batches
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = parseFloat(a.pricePerUnit);
          bValue = parseFloat(b.pricePerUnit);
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBatches(filtered);
  };

  // Apply filters when dependencies change
  useEffect(() => {
    applyFilters();
  }, [batches, selectedProductType, searchQuery, sortBy, sortOrder]);

  // Request batch verification and auto-minting
  const requestBatch = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!selectedBatchForRequest) {
        setError('Please select a batch to request');
        return;
      }

      const javascriptSource = `
        // Chainlink Functions verification script for WAGA Coffee
        const batchId = args[0];
        const expectedQuantity = parseInt(args[1]);
        const expectedPrice = args[2];
        const expectedPackaging = args[3];
        const expectedMetadataHash = args[4];

        // In production, this would make an API call to verify batch data
        // against the WAGA coffee database
        console.log('Verifying batch:', batchId);
        console.log('Expected quantity:', expectedQuantity);
        console.log('Expected price:', expectedPrice);
        console.log('Expected packaging:', expectedPackaging);

        // Simulate successful verification
        const verificationResult = {
          verified: true,
          quantity: expectedQuantity,
          price: expectedPrice,
          packaging: expectedPackaging,
          metadataHash: expectedMetadataHash,
          timestamp: Math.floor(Date.now() / 1000)
        };

        return Functions.encodeString(JSON.stringify(verificationResult));
      `;

      const requestId = await requestBatchVerification(selectedBatchForRequest, javascriptSource);
      
      setSuccess(`Batch request submitted successfully! Request ID: ${requestId}. Tokens will be minted upon successful verification.`);
      setSelectedBatchForRequest('');
      
      // Reload batches to show updated status
      await loadBatches();

    } catch (err) {
      console.error('Error requesting batch:', err);
      setError(err instanceof Error ? err.message : 'Failed to request batch');
    } finally {
      setLoading(false);
    }
  };

  // Request coffee redemption
  const redeemTokens = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (!selectedBatchForRedemption) {
        setError('Please select a batch for redemption');
        return;
      }

      if (redemptionQuantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }

      if (!shippingInfo.trim()) {
        setError('Please provide shipping information');
        return;
      }

      // Check if user has enough tokens
      const selectedBatch = batches.find(b => b.batchId === selectedBatchForRedemption);
      if (!selectedBatch || selectedBatch.userBalance < redemptionQuantity) {
        setError(`Insufficient tokens. You have ${selectedBatch?.userBalance || 0} but need ${redemptionQuantity}.`);
        return;
      }

      const redemptionId = await requestCoffeeRedemption(
        selectedBatchForRedemption,
        redemptionQuantity,
        shippingInfo
      );
      
      setSuccess(`Redemption request submitted! Redemption ID: ${redemptionId}. Your physical coffee will be shipped soon.`);
      
      // Reset form
      setSelectedBatchForRedemption('');
      setRedemptionQuantity(1);
      setShippingInfo('');
      
      // Reload batches to show updated balances
      await loadBatches();

    } catch (err) {
      console.error('Error redeeming tokens:', err);
      setError(err instanceof Error ? err.message : 'Failed to redeem tokens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    connectWallet();
  }, []);

  useEffect(() => {
    if (userAddress) {
      loadUserRoles();
      loadBatches();
    }
  }, [userAddress]);

  const TabButton = ({ tab, label, icon }: { tab: string; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab as any)}
      className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
        activeTab === tab
          ? 'bg-emerald-600 text-white shadow-lg'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-7xl mx-auto web3-page-spacing relative z-10">
        {/* Header */}
        <div className="mb-12 animate-card-entrance">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-float web3-cyber-glow flex justify-center">
              <MdLocalShipping size={96} className="text-emerald-600" />
            </div>
            <h1 className="text-5xl font-bold web3-gradient-text mb-4">
              WAGA Distributor Portal
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Request verified coffee batches and redeem tokens for physical coffee delivery. 
              Verification triggers automatic token minting to your address.
            </p>
          </div>

          {/* Enhanced Quick Stats */}
          <div className="web3-stats-grid">
            <div className="web3-enhanced-stat-card group">
              <div className="flex justify-center mb-4 group-hover:animate-pulse">
                <SiIpfs size={48} />
              </div>
              <div className="text-4xl font-bold web3-gradient-text mb-2">
                {batches.filter(b => b.isVerified).length}
              </div>
              <div className="text-gray-600 font-semibold">Available Batches</div>
              <div className="mt-2 text-sm text-emerald-600">
                Ready for distribution
              </div>
            </div>
            <div className="web3-enhanced-stat-card group" style={{ animationDelay: '100ms' }}>
              <div className="flex justify-center mb-4 group-hover:animate-pulse">
                <MdToken size={80} className="text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {batches.reduce((sum, b) => sum + b.userBalance, 0)}
              </div>
              <div className="text-emerald-600 font-semibold">Your Tokens</div>
              <div className="mt-2 text-sm text-gray-600">
                Redeemable for coffee
              </div>
            </div>
            <div className="web3-enhanced-stat-card group" style={{ animationDelay: '200ms' }}>
              <div className="flex justify-center mb-4 group-hover:animate-pulse">
                <MdCoffee size={48} className="text-emerald-600" />
              </div>
              <div className="text-4xl font-bold text-emerald-700 mb-2">
                {batches.filter(b => b.userBalance > 0).length}
              </div>
              <div className="text-emerald-700 font-semibold">Owned Batches</div>
              <div className="mt-2 text-sm text-gray-600">
                From verified sources
              </div>
            </div>
          </div>
        </div>

        {/* Wallet Connection */}
        {!userAddress && (
          <div className="web3-card text-center animate-card-entrance">
            <div className="mb-4">
              <div className="flex justify-center mb-2">
                <FaLink size={48} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Wallet</h3>
              <p className="text-gray-600 mb-4">
                Connect your wallet to access distributor functions
              </p>
            </div>
            <button
              onClick={connectWallet}
              className="web3-metamask-button"
            >
              🦊 Connect MetaMask
            </button>
          </div>
        )}

        {userAddress && (
          <>
            {/* Connected Wallet Info */}
            <div className="web3-card-dark animate-card-entrance mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Connected Wallet</h3>
                  <p className="text-gray-600 font-mono text-sm">
                    {userAddress.substring(0, 6)}...{userAddress.substring(userAddress.length - 4)}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {userRoles.isVerifier && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Verifier
                      </span>
                    )}
                    {userRoles.isFulfiller && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        Fulfiller
                      </span>
                    )}
                  </div>
                </div>
                <MdLocalShipping size={32} className="text-emerald-600" />
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 animate-card-entrance">
              <TabButton tab="request" label="Request Batches" icon={<MdOutlineAssignment />} />
              <TabButton tab="redeem" label="Redeem Tokens" icon={<MdCoffee />} />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="web3-card bg-red-50 border border-red-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <MdClose size={20} className="text-red-500" />
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="web3-card bg-green-50 border border-green-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <MdCheck size={20} className="text-green-500" />
                  <span className="text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'request' && (
              <div className="space-y-6">
                {/* Advanced Filtering */}
                <div className="web3-card animate-card-entrance">
                  <div className="flex items-center gap-2 mb-4">
                    <MdFilterList size={20} className="text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Filter & Search</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Product Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Type
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(PRODUCT_TYPES).map(([key, product]) => {
                          const Icon = product.icon;
                          return (
                            <button
                              key={key}
                              onClick={() => setSelectedProductType(key as any)}
                              className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedProductType === key
                                  ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-300'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
                              }`}
                            >
                              <Icon size={16} />
                              {product.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Search Input */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Search
                      </label>
                      <input
                        type="text"
                        placeholder="Search by name, origin, or farmer..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>

                    {/* Sort Options */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="name">Name</option>
                        <option value="price">Price</option>
                        <option value="quantity">Quantity</option>
                      </select>
                    </div>

                    {/* Sort Order */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Order
                      </label>
                      <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value as any)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter Results Summary */}
                  <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                    <span>
                      Showing {filteredBatches.length} of {batches.length} batches
                    </span>
                    <button
                      onClick={() => {
                        setSelectedProductType('ALL');
                        setSearchQuery('');
                        setSortBy('name');
                        setSortOrder('asc');
                      }}
                      className="text-emerald-600 hover:text-emerald-800 underline"
                    >
                      Clear filters
                    </button>
                  </div>
                </div>

                {/* Batch Request Form */}
                <div className="web3-card animate-card-entrance">
                  <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                    <MdVerified size={24} />
                    Request Coffee Batch Verification
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Select a batch to request verification. Upon successful verification via Chainlink Functions, 
                    tokens will be automatically minted to your address.
                    {selectedBatchFromBrowse && (
                      <span className="block mt-2 text-emerald-600 font-medium">
                        ✨ Pre-selected Batch #{selectedBatchFromBrowse} from Browse page
                      </span>
                    )}
                  </p>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Batch to Request
                    </label>
                    <select
                      value={selectedBatchForRequest}
                      onChange={(e) => setSelectedBatchForRequest(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Choose a batch...</option>
                      {batches.filter(b => !b.isVerified).map((batch) => (
                        <option key={batch.batchId} value={batch.batchId}>
                          Batch #{batch.batchId} - {batch.name} ({batch.quantity} bags) - {batch.pricePerUnit} ETH
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedBatchForRequest && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                      <h3 className="font-semibold text-blue-900 mb-2">Verification Process</h3>
                      <p className="text-blue-800 text-sm mb-2">
                        This will trigger Chainlink Functions to verify the batch against WAGA's database. 
                        Upon successful verification:
                      </p>
                      <ul className="text-blue-800 text-sm list-disc list-inside">
                        <li>Batch will be marked as verified</li>
                        <li>Tokens equal to batch quantity will be minted to your address</li>
                        <li>You can then redeem tokens for physical coffee delivery</li>
                      </ul>
                    </div>
                  )}

                  <button
                    onClick={requestBatch}
                    disabled={loading || !selectedBatchForRequest}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                      loading || !selectedBatchForRequest
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'web3-gradient-button hover:scale-105'
                    }`}
                  >
                    {loading ? 'Requesting Verification...' : 'Request Batch Verification & Minting'}
                  </button>
                </div>

                {/* Available Batches Display */}
                <div className="web3-card animate-card-entrance">
                  <h3 className="flex items-center gap-2 text-xl font-bold text-gray-900 mb-4">
                    <MdCoffee size={20} />
                    Available Coffee Batches
                  </h3>

                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                      <p>Loading batches...</p>
                    </div>
                  ) : filteredBatches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-6xl mb-4">📦</div>
                      <p>{batches.length === 0 ? 'No batches available.' : 'No batches match your filters.'}</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {filteredBatches.map((batch) => {
                        const productTypeInfo = PRODUCT_TYPES[batch.productType || 'RETAIL_BAGS'];
                        const Icon = productTypeInfo.icon;

                        return (
                          <div
                            key={batch.batchId}
                            className={`border rounded-lg p-4 hover:shadow-md transition-all duration-300 ${
                              batch.productType === 'GREEN_BEANS'
                                ? 'border-green-200 bg-green-50/30'
                                : batch.productType === 'ROASTED_BEANS'
                                ? 'border-orange-200 bg-orange-50/30'
                                : 'border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  <h4 className="font-semibold text-lg">Batch #{batch.batchId}</h4>

                                  {/* Product Type Badge */}
                                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${productTypeInfo.color} bg-current bg-opacity-10`}>
                                    <Icon size={12} />
                                    {batch.productType?.replace('_', ' ') || 'Retail Bags'}
                                  </span>

                                  {/* Verification Status */}
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    batch.isVerified
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {batch.isVerified ? 'Verified' : 'Unverified'}
                                  </span>

                                  {/* User Balance */}
                                  {batch.userBalance > 0 && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                      You own {batch.userBalance} tokens
                                    </span>
                                  )}
                                </div>

                                <p className="text-gray-600 mb-2">{batch.name}</p>

                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                  <div>
                                    <span className="font-medium">Origin:</span>
                                    <div className="text-gray-700">{batch.origin}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Farmer:</span>
                                    <div className="text-gray-700">{batch.farmer}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Quantity:</span>
                                    <div className="text-gray-700">{batch.quantity} {batch.unitWeight || batch.packagingInfo}</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Price:</span>
                                    <div className="text-gray-700">{batch.pricePerUnit} ETH</div>
                                  </div>
                                  <div>
                                    <span className="font-medium">Unit:</span>
                                    <div className="text-gray-700">{batch.unitWeight || batch.packagingInfo}</div>
                                  </div>
                                </div>

                                {/* Additional Info for Green/Roasted Beans */}
                                {batch.productType && batch.productType !== 'RETAIL_BAGS' && batch.metadata?.properties && (
                                  <div className="mt-3 pt-3 border-t border-gray-200">
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
                                      {batch.metadata.properties.moisture_content && (
                                        <div>
                                          <span className="font-medium">Moisture:</span> {batch.metadata.properties.moisture_content}%
                                        </div>
                                      )}
                                      {batch.metadata.properties.density && (
                                        <div>
                                          <span className="font-medium">Density:</span> {batch.metadata.properties.density} g/cm³
                                        </div>
                                      )}
                                      {batch.metadata.properties.certifications && (
                                        <div>
                                          <span className="font-medium">Certs:</span> {batch.metadata.properties.certifications.length}
                                        </div>
                                      )}
                                      {batch.metadata.properties.altitude && (
                                        <div>
                                          <span className="font-medium">Altitude:</span> {batch.metadata.properties.altitude}m
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Request Button */}
                              <div className="ml-4 flex-shrink-0">
                                <button
                                  onClick={() => setSelectedBatchForRequest(batch.batchId)}
                                  disabled={!batch.isVerified}
                                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                                    selectedBatchForRequest === batch.batchId
                                      ? 'bg-emerald-600 text-white'
                                      : batch.isVerified
                                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  }`}
                                >
                                  {selectedBatchForRequest === batch.batchId ? 'Selected' : 'Select for Request'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'redeem' && (
              <div className="web3-card animate-card-entrance">
                <h2 className="flex items-center gap-3 text-2xl font-bold text-gray-900 mb-6">
                  <MdStorage size={24} />
                  Redeem Tokens for Physical Coffee
                </h2>
                <p className="text-gray-600 mb-6">
                  Redeem your verified coffee tokens for physical coffee delivery. 
                  Only tokens from verified batches can be redeemed.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Batch to Redeem
                    </label>
                    <select
                      value={selectedBatchForRedemption}
                      onChange={(e) => setSelectedBatchForRedemption(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    >
                      <option value="">Choose a batch...</option>
                      {batches.filter(b => b.userBalance > 0).map((batch) => (
                        <option key={batch.batchId} value={batch.batchId}>
                          Batch #{batch.batchId} - {batch.name} (You own {batch.userBalance} tokens)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity to Redeem
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={redemptionQuantity}
                      onChange={(e) => setRedemptionQuantity(parseInt(e.target.value) || 1)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Number of bags"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Shipping Information
                  </label>
                  <textarea
                    value={shippingInfo}
                    onChange={(e) => setShippingInfo(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="Full shipping address, contact details, and any special delivery instructions..."
                  />
                </div>

                {selectedBatchForRedemption && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-emerald-900 mb-2">Redemption Details</h3>
                    <p className="text-emerald-800 text-sm">
                      You are redeeming {redemptionQuantity} token(s) for {redemptionQuantity} bag(s) of 
                      {batches.find(b => b.batchId === selectedBatchForRedemption)?.packagingInfo || ''} coffee 
                      from {batches.find(b => b.batchId === selectedBatchForRedemption)?.name || ''}.
                    </p>
                  </div>
                )}

                <button
                  onClick={redeemTokens}
                  disabled={loading || !selectedBatchForRedemption || !shippingInfo.trim()}
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-300 ${
                    loading || !selectedBatchForRedemption || !shippingInfo.trim()
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'web3-gradient-button hover:scale-105'
                  }`}
                >
                  {loading ? 'Processing Redemption...' : 'Redeem Tokens for Physical Coffee'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function DistributorPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading distributor portal...</p>
        </div>
      </div>
    </div>
  );
}

// Main export with Suspense wrapper
export default function DistributorPage() {
  return (
    <Suspense fallback={<DistributorPageLoading />}>
      <DistributorPageContent />
    </Suspense>
  );
}
