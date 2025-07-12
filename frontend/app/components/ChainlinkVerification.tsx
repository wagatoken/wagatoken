"use client";

import { useState, useEffect } from "react";

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
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'pending': return '🔄';
      case 'requesting': return '📡';
      default: return '⚪';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Chainlink Functions Verification
        </h3>
        <div className="text-sm text-gray-500">
          Batch #{batchId}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => triggerVerification('inventory')}
            disabled={verifying}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {verifying && status === 'requesting' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Requesting...
              </span>
            ) : verifying ? 'Verifying...' : 'Verify Inventory'}
          </button>
          
          <button
            onClick={() => triggerVerification('reserve')}
            disabled={verifying}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {verifying && status === 'requesting' ? 'Requesting...' : verifying ? 'Verifying...' : 'Verify & Mint Tokens'}
          </button>
        </div>

        {/* Progress Bar */}
        {verifying && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Request ID */}
        {requestId && (
          <div className="text-sm bg-gray-50 p-3 rounded-md">
            <div className="font-medium text-gray-700 mb-1">Request ID:</div>
            <div className="font-mono text-xs text-gray-600 break-all">{requestId}</div>
          </div>
        )}

        {/* Status Display */}
        {status !== 'idle' && (
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon(status)}</span>
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
            <div className="font-medium mb-1">❌ Verification Failed</div>
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
            <div className="font-medium text-green-800 mb-2">✅ Verification Successful!</div>
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
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
          <div className="font-medium mb-1">How it works:</div>
          <ul className="space-y-1">
            <li>• <strong>Verify Inventory:</strong> Checks current stock without minting tokens</li>
            <li>• <strong>Verify & Mint:</strong> Verifies inventory and mints tokens to recipient</li>
            <li>• Uses Chainlink Functions to fetch data from your IPFS-stored batch information</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
