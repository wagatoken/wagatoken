"use client";

import { useState, useEffect } from "react";
import { SiChainlink } from 'react-icons/si';
import { MdCheck, MdClose, MdSync, MdWifi, MdAnalytics, MdAccountBalanceWallet, MdHelp, MdInventory } from 'react-icons/md';
import { TokenETH } from '@web3icons/react';
import { FaCircle } from 'react-icons/fa';

interface ChainlinkVerificationProps {
  batchId: number;
  onVerificationComplete?: (result: any) => void;
}

export default function ChainlinkVerification({ batchId, onVerificationComplete }: ChainlinkVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const triggerVerification = async (verificationType: 'reserve' | 'inventory') => {
    try {
      setVerifying(true);
      setError(null);
      setStatus('requesting');
      setProgress(10);

      const response = await fetch('/api/chainlink/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          batchId,
          verificationType,
          recipient: verificationType === 'reserve' ? '0x742d35Cc6634C0532925a3b8D581C2532D8b8132' : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to trigger verification');
      }

      const data = await response.json();
      setRequestId(data.requestId);
      setStatus('pending');
      setProgress(30);

      // Start polling for status updates
      pollVerificationStatus(data.requestId);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
      setVerifying(false);
      setStatus('failed');
      setProgress(0);
    }
  };

  const pollVerificationStatus = async (reqId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes with 5-second intervals

    const pollInterval = setInterval(async () => {
      try {
        attempts++;
        setProgress(30 + (attempts / maxAttempts) * 60); // Progress from 30% to 90%

        const response = await fetch(`/api/chainlink/status/${reqId}`);
        const statusData = await response.json();

        if (statusData.status === 'fulfilled') {
          setResult(statusData.result);
          setStatus('completed');
          setProgress(100);
          setVerifying(false);
          clearInterval(pollInterval);
          onVerificationComplete?.(statusData.result);
        } else if (statusData.status === 'failed') {
          setError(statusData.error || 'Verification failed');
          setStatus('failed');
          setProgress(0);
          setVerifying(false);
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error('Error polling status:', err);
        if (attempts >= maxAttempts) {
          setError('Verification timeout - please try again');
          setStatus('failed');
          setProgress(0);
          setVerifying(false);
          clearInterval(pollInterval);
        }
      }
    }, 5000); // Poll every 5 seconds
  };

  const getStatusColor = (currentStatus: string) => {
    switch (currentStatus) {
      case 'completed': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      case 'requesting': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (currentStatus: string) => {
    switch (currentStatus) {
      case 'completed': return <MdCheck className="text-green-600" />;
      case 'failed': return <MdClose className="text-red-600" />;
      case 'pending': return <MdSync className="text-yellow-600 animate-spin" />;
      case 'requesting': return <MdWifi className="text-blue-600" />;
      default: return <FaCircle className="text-gray-400" />;
    }
  };

  return (
    <div className="web3-card-dark">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold web3-gradient-text mb-1 flex items-center">
            <SiChainlink className="mr-2 text-blue-400" />
            Chainlink Functions Verification
          </h3>
          <p className="text-gray-400 text-sm">Decentralized verification powered by Chainlink oracles</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-purple-300 font-semibold"> Batch #{batchId}</div>
          <div className="text-xs text-gray-500">On-chain verification</div>
        </div>
      </div>
      
      <div className="space-y-6">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => triggerVerification('inventory')}
            disabled={verifying}
            className={`${verifying ? 'opacity-50 cursor-not-allowed' : 'web3-gradient-button'} relative overflow-hidden`}
          >
            {verifying && status === 'requesting' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Requesting...
              </span>
            ) : verifying ? (
              <span className="flex items-center justify-center">
                <MdSync className="animate-spin mr-2" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <MdAnalytics className="mr-2" />
                Verify Inventory
              </span>
            )}
          </button>
          
          <button
            onClick={() => triggerVerification('reserve')}
            disabled={verifying}
            className={`${verifying ? 'opacity-50 cursor-not-allowed' : 'web3-gradient-button-secondary'} relative overflow-hidden`}
          >
            {verifying && status === 'requesting' ? (
              <span className="flex items-center justify-center">
                <MdSync className="animate-spin mr-2" />
                Requesting...
              </span>
            ) : verifying ? (
              <span className="flex items-center justify-center">
                <TokenETH className="mr-2" />
                Verifying...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <TokenETH className="mr-2" />
                Verify & Mint Tokens
              </span>
            )}
          </button>
        </div>

        {/* Progress Bar */}
        {verifying && (
          <div className="relative">
            <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 h-3 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
            </div>
            <div className="text-center mt-2 text-purple-300 text-sm font-medium">{progress}% Complete</div>
          </div>
        )}

        {/* Request ID */}
        {requestId && (
          <div className="bg-gray-800/50 p-4 rounded-xl border border-purple-500/20">
            <div className="font-semibold text-purple-300 mb-2 flex items-center">
              <MdHelp className="mr-2" />
              Request ID:
            </div>
            <div className="font-mono text-xs text-gray-300 break-all bg-gray-900/50 p-2 rounded">{requestId}</div>
          </div>
        )}

        {/* Status Display */}
        {status !== 'idle' && (
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <div className={`text-sm font-medium ${getStatusColor(status)}`}>
              Status: {status.charAt(0).toUpperCase() + status.slice(1)}
            </div>
            {status === 'pending' && (
              <div className="text-xs text-gray-500">
                (This may take 1-2 minutes...)
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
            <div className="font-medium mb-1 flex items-center">
              <MdClose className="mr-2" />
              Verification Failed
            </div>
            <div>{error}</div>
            <button
              onClick={() => {
                setError(null);
                setStatus('idle');
                setRequestId(null);
                setProgress(0);
              }}
              className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
            >
              Clear Error
            </button>
          </div>
        )}

        {/* Success Result */}
        {result && status === 'completed' && (
          <div className="text-sm bg-green-50 border border-green-200 p-4 rounded-md">
            <div className="font-medium text-green-800 mb-2 flex items-center">
              <MdCheck className="mr-2" />
              Verification Successful!
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-medium">Quantity:</span> {result.verifiedQuantity}
              </div>
              <div>
                <span className="font-medium">Price:</span> ${result.verifiedPrice}
              </div>
              <div>
                <span className="font-medium">Packaging:</span> {result.verifiedPackaging}
              </div>
              <div>
                <span className="font-medium">Verified:</span> {result.verified ? 'Yes' : 'No'}
              </div>
            </div>
            {result.verifiedMetadataHash && (
              <div className="mt-2 text-xs">
                <span className="font-medium">Metadata Hash:</span>
                <div className="font-mono text-gray-600 break-all">{result.verifiedMetadataHash}</div>
              </div>
            )}
          </div>
        )}

        {/* Help Text */}
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 p-4 rounded-xl border border-purple-400/20">
          <div className="font-semibold mb-2 text-purple-300 flex items-center">
            <TokenETH className="mr-2" />
            How Chainlink Functions Works:
          </div>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start">
              <MdAnalytics className="text-purple-400 mr-2 mt-0.5" />
              <span><strong>Verify Inventory:</strong> Checks current coffee stock without minting tokens</span>
            </li>
            <li className="flex items-start">
              <TokenETH className="text-emerald-400 mr-2 mt-0.5" />
              <span><strong>Verify & Mint:</strong> Verifies inventory and mints tokens to recipient wallet</span>
            </li>
            <li className="flex items-start">
              <SiChainlink className="text-cyan-400 mr-2 mt-0.5" />
              <span>Uses decentralized Chainlink oracles to fetch data from your IPFS-stored batch information</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
