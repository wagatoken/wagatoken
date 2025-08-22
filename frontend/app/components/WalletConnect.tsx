"use client";

import { useState, useEffect } from "react";

export default function WalletConnect() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        console.log('Accounts changed:', accounts);
        
        // Check if user manually requested disconnect
        const disconnectRequested = localStorage.getItem('wallet_disconnect_requested');
        if (disconnectRequested === 'true') {
          // User requested disconnect, ignore account changes
          return;
        }

        if (accounts.length === 0) {
          // User disconnected their wallet from MetaMask
          setIsConnected(false);
          setAddress(null);
        } else {
          // User switched accounts
          setAddress(accounts[0]);
          setIsConnected(true);
        }
      };

      const handleChainChanged = () => {
        // Reload the page when network changes to avoid state issues
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      // Cleanup listeners
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, []);

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Check if user has requested disconnect
        const disconnectRequested = localStorage.getItem('wallet_disconnect_requested');
        if (disconnectRequested === 'true') {
          // Clear the flag and don't auto-connect
          localStorage.removeItem('wallet_disconnect_requested');
          return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAddress(accounts[0]);
        }
      } catch (error) {
        console.error("Error checking wallet connection:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or another Web3 wallet!");
      return;
    }

    setIsConnecting(true);
    
    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        
        // Clear any disconnect flag since user is now connecting
        localStorage.removeItem('wallet_disconnect_requested');

        // Switch to Base Sepolia network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x14A34' }], // Base Sepolia chainId
          });
        } catch (switchError: any) {
          // If the network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x14A34',
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: ['https://sepolia.base.org'],
                blockExplorerUrls: ['https://sepolia.basescan.org'],
              }],
            });
          }
        }
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = async () => {
    try {
      setIsDisconnecting(true);
      
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
      <div className="flex items-center space-x-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-xl px-4 py-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full shadow-sm ${isDisconnecting ? 'bg-red-500 animate-pulse' : 'bg-green-500 animate-pulse'}`}></div>
          <div className="text-sm font-mono font-medium text-gray-700">
            {isDisconnecting ? 'Disconnecting...' : formatAddress(address!)}
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          disabled={isDisconnecting}
          className={`text-sm font-bold transition-all duration-200 px-4 py-2 rounded-lg border-2 shadow-md ${
            isDisconnecting 
              ? 'bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed'
              : 'bg-red-500 text-white hover:bg-red-600 border-red-500 hover:border-red-600 hover:scale-105 active:scale-95'
          }`}
        >
          {isDisconnecting ? '⏳ Disconnecting...' : '🔓 Disconnect'}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className="web3-gradient-button-secondary text-sm px-5 py-2.5 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      {isConnecting ? (
        <span className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </span>
      ) : (
        <span className="flex items-center space-x-2">
          <span>🔗</span>
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