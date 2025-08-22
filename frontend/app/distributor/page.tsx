"use client";

import { useState, useEffect } from "react";
import { 
  getActiveBatchIds,
  getBatchInfoWithMetadata,
  requestBatchVerification,
  getUserBatchBalance,
  requestCoffeeRedemption,
  getUserRoles
} from "@/utils/smartContracts";
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
}

export default function DistributorPage() {
  const [activeTab, setActiveTab] = useState<'request' | 'redeem'>('request');
  const [userAddress, setUserAddress] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [batches, setBatches] = useState<BatchDisplay[]>([]);
  const [userRoles, setUserRoles] = useState({ isAdmin: false, isVerifier: false, isDistributor: false });
  
  // Request form state
  const [selectedBatchForRequest, setSelectedBatchForRequest] = useState<string>('');
  
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

  // Load batches with user balances
  const loadBatches = async () => {
    try {
      setLoading(true);
      const batchIds = await getActiveBatchIds();
      
      const batchPromises = batchIds.map(async (id) => {
        const [batchInfo, userBalance] = await Promise.all([
          getBatchInfoWithMetadata(id),
          userAddress ? getUserBatchBalance(id, userAddress) : Promise.resolve(0)
        ]);
        
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
          metadata: batchInfo.metadata
        };
      });
      
      const batchDisplays = await Promise.all(batchPromises);
      setBatches(batchDisplays);
    } catch (err) {
      setError('Failed to load batches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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

  const TabButton = ({ tab, label, icon }: { tab: string; label: string; icon: string }) => (
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        {/* Header */}
        <div className="mb-12 animate-card-entrance">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4 animate-float web3-cyber-glow">🚚</div>
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
              <div className="text-5xl mb-4 group-hover:animate-pulse">📦</div>
              <div className="text-4xl font-bold web3-gradient-text mb-2">
                {batches.filter(b => b.isVerified).length}
              </div>
              <div className="text-gray-600 font-semibold">Available Batches</div>
              <div className="mt-2 text-sm text-emerald-600">
                Ready for distribution
              </div>
            </div>
            <div className="web3-enhanced-stat-card group" style={{ animationDelay: '100ms' }}>
              <div className="text-5xl mb-4 group-hover:animate-pulse">🪙</div>
              <div className="text-4xl font-bold text-emerald-600 mb-2">
                {batches.reduce((sum, b) => sum + b.userBalance, 0)}
              </div>
              <div className="text-emerald-600 font-semibold">Your Tokens</div>
              <div className="mt-2 text-sm text-gray-600">
                Redeemable for coffee
              </div>
            </div>
            <div className="web3-enhanced-stat-card group" style={{ animationDelay: '200ms' }}>
              <div className="text-5xl mb-4 group-hover:animate-pulse">☕</div>
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
              <div className="text-4xl mb-2">🔗</div>
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
                    {userRoles.isDistributor && (
                      <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                        Distributor
                      </span>
                    )}
                    {userRoles.isVerifier && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                        Verifier
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-2xl">🚚</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 justify-center mb-8 animate-card-entrance">
              <TabButton tab="request" label="Request Batches" icon="📋" />
              <TabButton tab="redeem" label="Redeem Tokens" icon="☕" />
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="web3-card bg-red-50 border border-red-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <span className="text-red-500 text-xl">❌</span>
                  <span className="text-red-700">{error}</span>
                </div>
              </div>
            )}

            {success && (
              <div className="web3-card bg-green-50 border border-green-200 mb-6 animate-card-entrance">
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-xl">✅</span>
                  <span className="text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'request' && (
              <div className="space-y-6">
                {/* Batch Request Form */}
                <div className="web3-card animate-card-entrance">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Request Coffee Batch Verification</h2>
                  <p className="text-gray-600 mb-6">
                    Select a batch to request verification. Upon successful verification via Chainlink Functions, 
                    tokens will be automatically minted to your address.
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
                    {loading ? 'Requesting Verification...' : '📋 Request Batch Verification & Minting'}
                  </button>
                </div>

                {/* Available Batches Display */}
                <div className="web3-card animate-card-entrance">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Available Coffee Batches</h3>
                  
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                      <p>Loading batches...</p>
                    </div>
                  ) : batches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-6xl mb-4">📦</div>
                      <p>No batches available.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {batches.map((batch) => (
                        <div key={batch.batchId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="font-semibold text-lg">Batch #{batch.batchId}</h4>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  batch.isVerified 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {batch.isVerified ? 'Verified' : 'Unverified'}
                                </span>
                                {batch.userBalance > 0 && (
                                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                                    You own {batch.userBalance} tokens
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 mb-2">{batch.name}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="font-medium">Origin:</span> {batch.origin}
                                </div>
                                <div>
                                  <span className="font-medium">Farmer:</span> {batch.farmer}
                                </div>
                                <div>
                                  <span className="font-medium">Quantity:</span> {batch.quantity} bags
                                </div>
                                <div>
                                  <span className="font-medium">Price:</span> {batch.pricePerUnit} ETH
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'redeem' && (
              <div className="web3-card animate-card-entrance">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Redeem Tokens for Physical Coffee</h2>
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
                  {loading ? 'Processing Redemption...' : '☕ Redeem Tokens for Physical Coffee'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
