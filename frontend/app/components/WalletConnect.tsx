"use client";

import { useWallet } from "./WalletProvider";
import { WalletMetamask } from "@web3icons/react";
import { FaLink } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";

const formatAddress = (addr: string) => {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
};

export default function WalletConnectButton() {
  const {
    isConnected,
    address,
    isConnecting,
    isDisconnecting,
    connectWallet,
    disconnectWallet,
  } = useWallet();

  if (isConnecting) {
    return (
      <button
        disabled
        className="web3-wallet-connecting text-sm px-5 py-2.5 font-semibold rounded-xl shadow-md transition-all duration-300"
      >
        <span className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </span>
      </button>
    );
  }

  if (isDisconnecting) {
    return (
      <div className="web3-wallet-container flex items-center space-x-2 rounded-xl px-3 py-1.5 shadow-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full web3-wallet-status-dot bg-red-500 animate-pulse"></div>
          <div className="web3-wallet-address text-sm">Disconnecting...</div>
        </div>
        <button
          disabled
          className="web3-wallet-disconnect-btn font-bold transition-all duration-200 px-2 py-1 rounded-lg border-2 shadow-md bg-gray-200 text-gray-500 border-gray-300 cursor-not-allowed"
        >
          ⏳
        </button>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="web3-wallet-container flex items-center space-x-2 rounded-xl px-3 py-1.5 shadow-sm">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 rounded-full web3-wallet-status-dot bg-green-500 animate-pulse"></div>
          <div className="web3-wallet-address text-sm text-white web3-blockchain-badge">
            {formatAddress(address)}
          </div>
        </div>
        <button
          onClick={disconnectWallet}
          className="web3-wallet-disconnect-btn text-white font-bold transition-all duration-200 px-2 py-1 rounded-lg border-2 shadow-md hover:scale-105 active:scale-95"
        >
          🔓
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connectWallet}
      className="web3-wallet-connect-btn text-sm px-5 py-2.5 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
    >
      <span className="flex items-center space-x-2">
        <FaLink size={16} />
        <span>Connect Wallet</span>
      </span>
    </button>
  );
}
