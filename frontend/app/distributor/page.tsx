"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
// import { useAccount } from 'wagmi';
import { useWallet } from '../components/WalletProvider';
import {
  getActiveBatchIds,
  getBatchInfoWithMetadata,
  requestBatchVerification,
  getUserBatchBalance,
  requestCoffeeRedemption,
  getUserRoles,
  getBatchProductType,
  getBatchUnitWeight,
  createBatchRequest
} from "@/utils/smartContracts";
import { SiIpfs } from 'react-icons/si';
import { FaLink } from 'react-icons/fa';
import { MdCheck, MdClose, MdCoffee, MdVerified, MdStorefront, MdStorage, MdOutlineAssignment, MdLocalShipping, MdToken, MdNature, MdLocalFireDepartment, MdShoppingCart, MdFilterList, MdPayment } from 'react-icons/md';
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
  // const { isConnected, address } = useAccount();
  const { address, isConnected } = useWallet();
  
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

  // Batch request form state
  const [selectedBatchForRequestSubmission, setSelectedBatchForRequestSubmission] = useState<string>('');
  const [requestQuantity, setRequestQuantity] = useState<number>(1);
  const [requestDetails, setRequestDetails] = useState<string>('');
  const [requestSubmissionLoading, setRequestSubmissionLoading] = useState<boolean>(false);

  // Payment form state
  const [selectedBatchForPayment, setSelectedBatchForPayment] = useState<string>('');
  const [paymentLoading, setPaymentLoading] = useState<boolean>(false);
  const [usdcApprovalLoading, setUsdcApprovalLoading] = useState<boolean>(false);
  const [usdcApproved, setUsdcApproved] = useState<boolean>(false);
  const [paymentStatus, setPaymentStatus] = useState<{
    type: 'success' | 'error';
    message: string;
    transactionHash?: string;
  } | null>(null);

  // Connect wallet - handled by useWallet hook
  // Remove custom wallet connection logic since we're using useWallet

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
          address ? getUserBatchBalance(id, address) : Promise.resolve(0),
          getBatchProductType(id).catch(() => 0), // Default to RETAIL_BAGS (0) if error
          getBatchUnitWeight(id).catch(() => '') // Default to empty string if error
        ]);        // Convert product type number to string
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

  // Submit batch request (new workflow)
  const submitBatchRequest = async () => {
    try {
      setRequestSubmissionLoading(true);
      setError('');
      setSuccess('');

      if (!selectedBatchForRequestSubmission) {
        setError('Please select a batch to request');
        return;
      }

      if (requestQuantity <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }

      if (!requestDetails.trim()) {
        setError('Please provide request details');
        return;
      }

      // Submit the batch request
      const result = await createBatchRequest(
        selectedBatchForRequestSubmission,
        requestQuantity.toString(),
        requestDetails
      );

      if (result.success) {
        setSuccess(`✅ Batch request submitted successfully! Request Index: ${result.requestIndex}. Your request will be reviewed by WAGA administrators.`);
        
        // Reset form
        setSelectedBatchForRequestSubmission('');
        setRequestQuantity(1);
        setRequestDetails('');
        
        // Reload batches to show updated status
        await loadBatches();
      } else {
        setError(`Failed to submit request: ${result.error}`);
      }

    } catch (err) {
      console.error('Error submitting batch request:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit batch request');
    } finally {
      setRequestSubmissionLoading(false);
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

  // Payment handler functions
  const handleApproveUSDC = async (amount: number) => {
    try {
      setUsdcApprovalLoading(true);
      setPaymentStatus(null);

      // For now, simulate USDC approval
      // In a real implementation, you would call the USDC contract's approve function
      console.log(`Approving ${amount} USDC for treasury contract...`);
      
      // Simulate async approval process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUsdcApproved(true);
      setPaymentStatus({
        type: 'success',
        message: `Successfully approved ${amount.toFixed(2)} USDC for payment`
      });

    } catch (err) {
      console.error('Error approving USDC:', err);
      setPaymentStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to approve USDC'
      });
    } finally {
      setUsdcApprovalLoading(false);
    }
  };

  const handlePayForBatch = async (batchId: string, amount: number) => {
    try {
      setPaymentLoading(true);
      setPaymentStatus(null);

      if (!usdcApproved) {
        setPaymentStatus({
          type: 'error',
          message: 'Please approve USDC spending first'
        });
        return;
      }

      console.log(`Processing payment for batch ${batchId}: ${amount} USDC`);
      
      // For now, simulate payment processing
      // In a real implementation, you would call the WAGATreasury.payForBatch function
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate successful payment
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      
      setPaymentStatus({
        type: 'success',
        message: `Payment successful! You've purchased coffee tokens for batch ${batchId}`,
        transactionHash: mockTxHash
      });

      // Reset form
      setSelectedBatchForPayment('');
      setUsdcApproved(false);
      
      // Reload batches to show updated balances
      await loadBatches();

    } catch (err) {
      console.error('Error processing payment:', err);
      setPaymentStatus({
        type: 'error',
        message: err instanceof Error ? err.message : 'Payment failed'
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    // Wallet is handled by useWallet hook - no manual connection needed
  }, []);

  useEffect(() => {
    if (address) {
      loadUserRoles();
      loadBatches();
    }
  }, [address]);

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
    <div className="web3-page-content min-h-screen web3-section">
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
        {!address && (
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
            <p className="text-gray-600 text-sm">
              Use the wallet connection button in the navigation bar
            </p>
          </div>
        )}

        {address && (
          <>
            {/* Connected Wallet Info */}
            <div className="web3-card-dark animate-card-entrance mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Connected Wallet</h3>
                  <p className="text-gray-600 font-mono text-sm">
                    {address.substring(0, 6)}...{address.substring(address.length - 4)}
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

                {/* Batch Request Options */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Submit Batch Request (New Workflow) */}
                  <div className="web3-card animate-card-entrance">
                    <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
                      <MdOutlineAssignment size={24} className="text-emerald-600" />
                      Submit Batch Request
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Submit a request for coffee tokens. Your request will be reviewed by WAGA administrators 
                      who will verify off-chain data before approving token minting.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Batch
                        </label>
                        <select
                          value={selectedBatchForRequestSubmission}
                          onChange={(e) => setSelectedBatchForRequestSubmission(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        >
                          <option value="">Choose a batch...</option>
                          {batches.map((batch) => (
                            <option key={batch.batchId} value={batch.batchId}>
                              Batch #{batch.batchId} - {batch.name} ({batch.quantity} units) - {batch.pricePerUnit} ETH
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Requested Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={requestQuantity}
                          onChange={(e) => setRequestQuantity(parseInt(e.target.value) || 1)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          placeholder="Enter quantity to request"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Request Details
                        </label>
                        <textarea
                          value={requestDetails}
                          onChange={(e) => setRequestDetails(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                          rows={3}
                          placeholder="Provide details about your request (business purpose, timeline, etc.)"
                        />
                      </div>

                      {selectedBatchForRequestSubmission && (
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                          <h4 className="font-semibold text-emerald-900 mb-2">Request Workflow</h4>
                          <ol className="text-emerald-800 text-sm list-decimal list-inside space-y-1">
                            <li>Submit your batch request with details</li>
                            <li>WAGA administrators review and verify your request</li>
                            <li>Upon approval, Chainlink verification is triggered</li>
                            <li>Tokens are minted to your address after successful verification</li>
                          </ol>
                        </div>
                      )}

                      <button
                        onClick={submitBatchRequest}
                        disabled={requestSubmissionLoading || !selectedBatchForRequestSubmission || !requestDetails.trim()}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                          requestSubmissionLoading || !selectedBatchForRequestSubmission || !requestDetails.trim()
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:scale-105'
                        }`}
                      >
                        {requestSubmissionLoading ? 'Submitting Request...' : 'Submit Batch Request'}
                      </button>
                    </div>
                  </div>

                  {/* Direct Verification (Legacy Workflow) */}
                  <div className="web3-card animate-card-entrance">
                    <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
                      <MdVerified size={24} className="text-blue-600" />
                      Direct Verification (Legacy)
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Direct verification for batches. This triggers immediate Chainlink Functions verification 
                      and automatic token minting upon success.
                      {selectedBatchFromBrowse && (
                        <span className="block mt-2 text-blue-600 font-medium">
                          ✨ Pre-selected Batch #{selectedBatchFromBrowse}
                        </span>
                      )}
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Batch for Direct Verification
                        </label>
                        <select
                          value={selectedBatchForRequest}
                          onChange={(e) => setSelectedBatchForRequest(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Choose a batch...</option>
                          {batches.filter(b => !b.isVerified).map((batch) => (
                            <option key={batch.batchId} value={batch.batchId}>
                              Batch #{batch.batchId} - {batch.name} ({batch.quantity} units) - {batch.pricePerUnit} ETH
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedBatchForRequest && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-900 mb-2">Direct Verification Process</h4>
                          <ul className="text-blue-800 text-sm list-disc list-inside space-y-1">
                            <li>Triggers immediate Chainlink Functions verification</li>
                            <li>Batch verified against WAGA's off-chain database</li>
                            <li>Tokens automatically minted upon successful verification</li>
                            <li>No admin approval required</li>
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={requestBatch}
                        disabled={loading || !selectedBatchForRequest}
                        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                          loading || !selectedBatchForRequest
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                        }`}
                      >
                        {loading ? 'Requesting Verification...' : 'Request Direct Verification'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Payment for Tokens Section */}
                <div className="web3-card animate-card-entrance">
                  <h2 className="flex items-center gap-3 text-xl font-bold text-gray-900 mb-4">
                    <MdPayment size={24} className="text-purple-600" />
                    Pay for Coffee Tokens
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Purchase coffee tokens using USDC. Select a batch and pay the required amount to receive your tokens.
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Batch for Payment
                      </label>
                      <select
                        value={selectedBatchForPayment || ''}
                        onChange={(e) => setSelectedBatchForPayment(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Choose a batch to purchase...</option>
                        {batches.map((batch) => (
                          <option key={batch.batchId} value={batch.batchId}>
                            Batch #{batch.batchId} - {batch.name} ({batch.quantity} units) - ${(parseFloat(batch.pricePerUnit) * 2000).toFixed(2)} USDC
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedBatchForPayment && (() => {
                      const selectedBatch = batches.find(b => b.batchId === selectedBatchForPayment);
                      const usdcPrice = selectedBatch ? (parseFloat(selectedBatch.pricePerUnit) * 2000) : 0;
                      
                      return (
                        <div className="space-y-4">
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                            <h4 className="font-semibold text-purple-900 mb-2">Payment Details</h4>
                            <div className="space-y-2 text-purple-800 text-sm">
                              <div className="flex justify-between">
                                <span>Batch:</span>
                                <span className="font-medium">#{selectedBatch?.batchId} - {selectedBatch?.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Quantity:</span>
                                <span className="font-medium">{selectedBatch?.quantity} units</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Price per unit:</span>
                                <span className="font-medium">${(usdcPrice / (selectedBatch?.quantity || 1)).toFixed(2)} USDC</span>
                              </div>
                              <div className="flex justify-between font-bold text-base">
                                <span>Total Price:</span>
                                <span className="text-purple-900">${usdcPrice.toFixed(2)} USDC</span>
                              </div>
                            </div>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h4 className="font-semibold text-amber-900 mb-2">Payment Process</h4>
                            <ol className="text-amber-800 text-sm list-decimal list-inside space-y-1">
                              <li>Ensure you have sufficient USDC in your wallet</li>
                              <li>Approve USDC spending for the treasury contract</li>
                              <li>Complete the payment transaction</li>
                              <li>Receive your coffee tokens automatically</li>
                            </ol>
                          </div>

                          <div className="space-y-3">
                            <button
                              onClick={() => handleApproveUSDC(usdcPrice)}
                              disabled={paymentLoading || usdcApprovalLoading}
                              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                paymentLoading || usdcApprovalLoading
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105'
                              }`}
                            >
                              {usdcApprovalLoading ? 'Approving USDC...' : `Approve ${usdcPrice.toFixed(2)} USDC`}
                            </button>

                            <button
                              onClick={() => handlePayForBatch(selectedBatchForPayment, usdcPrice)}
                              disabled={paymentLoading || !usdcApproved}
                              className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                                paymentLoading || !usdcApproved
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-600 text-white hover:bg-purple-700 hover:scale-105'
                              }`}
                            >
                              {paymentLoading ? 'Processing Payment...' : `Pay ${usdcPrice.toFixed(2)} USDC`}
                            </button>
                          </div>

                          {paymentStatus && (
                            <div className={`p-4 rounded-lg ${
                              paymentStatus.type === 'success' 
                                ? 'bg-green-50 border border-green-200 text-green-800' 
                                : 'bg-red-50 border border-red-200 text-red-800'
                            }`}>
                              <p className="font-medium">
                                {paymentStatus.type === 'success' ? '✅ Payment Successful!' : '❌ Payment Failed'}
                              </p>
                              <p className="text-sm mt-1">{paymentStatus.message}</p>
                              {paymentStatus.transactionHash && (
                                <p className="text-xs mt-2">
                                  Transaction: {paymentStatus.transactionHash.slice(0, 10)}...{paymentStatus.transactionHash.slice(-8)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
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
                                    <div className="text-gray-700">
                                      {batch.pricePerUnit !== 'Hidden'
                                        ? `${batch.pricePerUnit} ETH`
                                        : batch.productType === 'GREEN_BEANS' || batch.productType === 'ROASTED_BEANS'
                                        ? 'Premium Tier: $15-50 (Indicative Range)'
                                        : 'Premium Tier: $15-50 (Indicative Range)'
                                      }
                                    </div>
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
