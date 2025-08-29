"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import MetaMaskSDK from "@metamask/sdk";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  isConnecting: boolean;
  isDisconnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider = ({ children }: WalletProviderProps) => {
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
            url: typeof window !== "undefined" ? window.location.host : "",
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
      const disconnectRequested = localStorage.getItem(
        "wallet_disconnect_requested"
      );
      if (disconnectRequested === "true") {
        localStorage.removeItem("wallet_disconnect_requested");
        return;
      }

      const provider = sdkInstance.getProvider();
      if (provider) {
        const accounts = (await provider.request({
          method: "eth_accounts",
        })) as string[];

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

      const accounts = (await provider.request({
        method: "eth_requestAccounts",
      })) as string[];

      if (accounts && accounts.length > 0) {
        setIsConnected(true);
        setAddress(accounts[0]);
        localStorage.removeItem("wallet_disconnect_requested");
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
      if (sdk) {
        sdk.terminate();
      }
      setIsConnected(false);
      setAddress(null);
      localStorage.setItem("wallet_disconnect_requested", "true");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      setIsDisconnecting(false);
      setIsConnected(false);
      setAddress(null);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        isConnecting,
        isDisconnecting,
        connectWallet,
        disconnectWallet,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
