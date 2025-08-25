"use client";

import { useState, useEffect } from "react";
import MetaMaskSDK from '@metamask/sdk';
import { WalletMetamask, NetworkEthereum } from '@web3icons/react';
import { FaLink } from 'react-icons/fa';
import { MdAccessTime } from 'react-icons/md';

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [sdk, setSdk] = useState<MetaMaskSDK | null>(null);

  // Initialize MetaMask SDK
  useEffect(() => {
    const initSDK = async () => {
      try {
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: "WAGA Coffee Platform",
            url: typeof window !== 'undefined' ? window.location.host : '',
          },
          preferDesktop: false,
        });

        setSdk(MMSDK);
        
        // Check if already connected
        await checkConnection(MMSDK);
      } catch (error) {
        console.error("Failed to initialize MetaMask SDK:", error);
      }
    };

    initSDK();

    // Cleanup on unmount
    return () => {
      if (sdk) {
        sdk.terminate();
      }
    };
  }, []);

  const checkConnection = async (sdkInstance: MetaMaskSDK) => {
    try {
      // Check if disconnect was requested
      const disconnectRequested = localStorage.getItem('wallet_disconnect_requested');
      if (disconnectRequested === 'true') {
        localStorage.removeItem('wallet_disconnect_requested');
        return;
      }

      const provider = sdkInstance.getProvider();
      if (provider) {
        const accounts = await provider.request({ method: 'eth_accounts' }) as string[];
        
        if (accounts && accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error);
    }
  };

  const connectWallet = async () => {
    if (!sdk) {
      alert("MetaMask SDK not initialized");
      return;
    }

    try {
      setIsConnecting(true);
      
      const provider = sdk.getProvider();
      if (!provider) {
        throw new Error("Provider not available");
      }

      // Request account access
      const accounts = await provider.request({
        method: 'eth_requestAccounts',
      }) as string[];

      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        
        // Clear any previous disconnect flags
        localStorage.removeItem('wallet_disconnect_requested');
      } else {
        throw new Error("No accounts returned");
      }

    } catch (error: any) {
      console.error("Failed to connect wallet:", error);
      
      let errorMessage = "Failed to connect wallet. Please try again.";
      
      if (error?.code === 4001) {
        errorMessage = "Connection rejected by user.";
      } else if (error?.code === -32002) {
        errorMessage = "Connection request already pending. Check MetaMask.";
      } else if (error?.message) {
        errorMessage = `Connection failed: ${error.message}`;
      }
      
      alert(errorMessage);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsDisconnecting(true);
      
      // Disconnect using SDK if available
      if (sdk) {
        sdk.terminate();
      }
      
      // Clear local state immediately
      setIsConnected(false);
      setAddress(null);
      
      // Store disconnect flag in localStorage to prevent auto-reconnect
      localStorage.setItem('wallet_disconnect_requested', 'true');
      
      // Short delay for UX feedback, then refresh to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 800);
      
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setIsDisconnecting(false);
      // Fallback: still try to clear state
      setIsConnected(false);
      setAddress(null);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if ((isConnected && address) || isDisconnecting) {
    return (
      <div className="web3-wallet-container flex items-center space-x-2 rounded-xl px-3 py-1.5 shadow-sm">
        <div className="flex items-center space-x-1">
          <div className={`w-2 h-2 rounded-full web3-wallet-status-dot ${isDisconnecting ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
          <div className="web3-wallet-address text-sm">
            {isDisconnecting ? 'Disconnecting...' : formatAddress(address!)}
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          disabled={isDisconnecting}
          className={`web3-wallet-disconnect-btn font-bold transition-all duration-200 px-2 py-1 rounded-lg border-2 shadow-md ${
            isDisconnecting 
              ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
              : 'text-white hover:scale-105 active:scale-95'
          }`}
        >
          {isDisconnecting ? '⏳' : '🔓'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting || !sdk}
      className={`text-sm px-5 py-2.5 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300 ${
        isConnecting 
          ? 'web3-wallet-connecting' 
          : !sdk 
            ? 'web3-wallet-initializing'
            : 'web3-wallet-connect-btn'
      }`}
    >
      {isConnecting ? (
        <span className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </span>
      ) : !sdk ? (
        <span className="flex items-center space-x-2">
          <MdAccessTime size={16} />
          <span>Initializing...</span>
        </span>
      ) : (
        <span className="flex items-center space-x-2">
          <FaLink size={16} />
          <span>Connect Wallet</span>
        </span>
      )}
    </button>
  );
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
