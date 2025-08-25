"use client";

import { useState, useEffect } from 'react';
import { MdWarning, MdCheckCircle, MdError } from 'react-icons/md';

interface EnvStatus {
  environment: {
    hasJWT: boolean;
    gatewayUrl: string;
    nodeEnv: string;
    platform: string;
  };
  pinataAuth?: {
    status: number;
    ok: boolean;
    authenticated?: boolean;
  };
  gatewayAccess?: {
    status: number;
    ok: boolean;
  };
  success: boolean;
}

export default function EnvironmentStatus() {
  const [status, setStatus] = useState<EnvStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkEnvironment = async () => {
      try {
        const response = await fetch('/api/debug/pinata');
        if (!response.ok) {
          throw new Error(`Debug API failed: ${response.status}`);
        }
        const data = await response.json();
        setStatus(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    checkEnvironment();
  }, []);

  if (loading) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
          <span className="text-yellow-800 text-sm">Checking environment status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-center">
          <MdError className="text-red-600 mr-2" size={20} />
          <span className="text-red-800 text-sm font-medium">Environment check failed: {error}</span>
        </div>
      </div>
    );
  }

  if (!status) return null;

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <MdCheckCircle className="text-green-600" size={16} />
    ) : (
      <MdError className="text-red-600" size={16} />
    );
  };

  const isHealthy = status.environment.hasJWT && 
                   status.environment.gatewayUrl && 
                   status.pinataAuth?.authenticated;

  return (
    <div className={`border rounded-lg p-4 mb-6 ${
      isHealthy 
        ? 'bg-green-50 border-green-200' 
        : 'bg-red-50 border-red-200'
    }`}>
      <div className="flex items-center mb-3">
        {isHealthy ? (
          <MdCheckCircle className="text-green-600 mr-2" size={20} />
        ) : (
          <MdWarning className="text-red-600 mr-2" size={20} />
        )}
        <h3 className={`font-medium ${
          isHealthy ? 'text-green-800' : 'text-red-800'
        }`}>
          IPFS Environment Status
        </h3>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Environment:</span>
          <div className="flex items-center">
            <span className="text-gray-900 mr-2">{status.environment.nodeEnv} ({status.environment.platform})</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Pinata JWT:</span>
          <div className="flex items-center">
            <span className="text-gray-900 mr-2">{status.environment.hasJWT ? 'Configured' : 'Missing'}</span>
            {getStatusIcon(status.environment.hasJWT)}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-gray-700">Gateway URL:</span>
          <div className="flex items-center">
            <span className="text-gray-900 mr-2">{status.environment.gatewayUrl || 'Not set'}</span>
            {getStatusIcon(!!status.environment.gatewayUrl)}
          </div>
        </div>

        {status.pinataAuth && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Pinata Auth:</span>
            <div className="flex items-center">
              <span className="text-gray-900 mr-2">
                {status.pinataAuth.authenticated ? 'Connected' : `Failed (${status.pinataAuth.status})`}
              </span>
              {getStatusIcon(status.pinataAuth.authenticated || false)}
            </div>
          </div>
        )}

        {status.gatewayAccess && (
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Gateway Access:</span>
            <div className="flex items-center">
              <span className="text-gray-900 mr-2">
                {status.gatewayAccess.ok ? 'Accessible' : `Failed (${status.gatewayAccess.status})`}
              </span>
              {getStatusIcon(status.gatewayAccess.ok)}
            </div>
          </div>
        )}
      </div>

      {!isHealthy && (
        <div className="mt-3 p-3 bg-red-100 rounded text-sm text-red-800">
          <strong>Action Required:</strong> Please check your Netlify environment variables:
          <ul className="mt-1 ml-4 list-disc">
            {!status.environment.hasJWT && <li>Set PINATA_JWT environment variable</li>}
            {!status.environment.gatewayUrl && <li>Set NEXT_PUBLIC_GATEWAY_URL environment variable</li>}
            {!status.pinataAuth?.authenticated && <li>Verify Pinata JWT token is valid</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
