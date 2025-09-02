import { CoinbaseWalletSDK } from '@coinbase/wallet-sdk';
import { CBPayInstance, CBPayInstanceType, generateOnRampURL } from '@coinbase/cbpay-js';
import { Coinbase } from '@coinbase/coinbase-sdk';

// Coinbase SDK Configuration
const COINBASE_APP_NAME = 'WAGA Coffee Platform';
const COINBASE_APP_LOGO_URL = 'https://waga-coffee-platform.vercel.app/logo.png';

// Coinbase Wallet SDK Setup
let coinbaseWalletSDK: CoinbaseWalletSDK;
let coinbaseWalletProvider: any;

// Coinbase Pay Setup
let cbPayInstance: CBPayInstance;

// Coinbase CDP SDK Setup
let coinbaseSDK: Coinbase;

// Environment Variables
const COINBASE_API_KEY = process.env.NEXT_PUBLIC_COINBASE_API_KEY;
const COINBASE_PRIVATE_KEY = process.env.COINBASE_PRIVATE_KEY;
const COINBASE_WEBHOOK_SECRET = process.env.COINBASE_WEBHOOK_SECRET;

/**
 * Initialize Coinbase Wallet SDK
 */
export function initializeCoinbaseWallet(): void {
  if (typeof window === 'undefined') return;

  coinbaseWalletSDK = new CoinbaseWalletSDK({
    appName: COINBASE_APP_NAME,
    appLogoUrl: COINBASE_APP_LOGO_URL,
    darkMode: false,
    overrideIsMetaMask: false,
  });

  coinbaseWalletProvider = coinbaseWalletSDK.makeWeb3Provider({
    options: 'all',
  });
}

/**
 * Get Coinbase Wallet Provider
 */
export function getCoinbaseWalletProvider(): any {
  if (!coinbaseWalletProvider) {
    initializeCoinbaseWallet();
  }
  return coinbaseWalletProvider;
}

/**
 * Initialize Coinbase SDK for CDP
 */
export async function initializeCoinbaseSDK(): Promise<void> {
  if (!COINBASE_API_KEY || !COINBASE_PRIVATE_KEY) {
    console.warn('Coinbase API credentials not found. CDP features will be limited.');
    return;
  }

  try {
    coinbaseSDK = new Coinbase({
      apiKeyName: COINBASE_API_KEY,
      privateKey: COINBASE_PRIVATE_KEY,
    });

    console.log('✅ Coinbase SDK initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize Coinbase SDK:', error);
  }
}

/**
 * Initialize Coinbase Pay for onramp/offramp
 */
export function initializeCoinbasePay(): CBPayInstance {
  if (typeof window === 'undefined') {
    throw new Error('Coinbase Pay can only be initialized in browser environment');
  }

  cbPayInstance = new CBPayInstance({
    appId: COINBASE_APP_NAME,
    widgetParameters: {
      destinationWallets: [{
        address: '', // Will be set dynamically
        blockchains: ['base', 'ethereum'],
      }],
      presetCryptoAmount: 50, // Default $50
      presetFiatAmount: 50, // Default $50
      fiatCurrency: 'USD',
    },
    onSuccess: (event: any) => {
      console.log('Coinbase Pay success:', event);
      // Handle successful payment
      handleCoinbasePaySuccess(event);
    },
    onExit: (event: any) => {
      console.log('Coinbase Pay exit:', event);
      // Handle payment exit/cancellation
    },
    onEvent: (event: any) => {
      console.log('Coinbase Pay event:', event);
    },
  });

  return cbPayInstance;
}

/**
 * Handle Coinbase Pay Success
 */
function handleCoinbasePaySuccess(event: any): void {
  // Extract payment details
  const { chargeId, amount, currency } = event;

  console.log(`Payment successful: ${amount} ${currency} (Charge ID: ${chargeId})`);

  // You can emit an event or call a callback here
  // This will be used to confirm payment on the blockchain
}

/**
 * Create Coinbase Onramp URL
 */
export function createCoinbaseOnrampURL(
  destinationAddress: string,
  amount: number = 50,
  currency: string = 'USD'
): string {
  const onrampURL = generateOnRampURL({
    appId: COINBASE_APP_NAME,
    destinationWallets: [{
      address: destinationAddress,
      blockchains: ['base'],
    }],
    presetCryptoAmount: amount,
    presetFiatAmount: amount,
    fiatCurrency: currency,
  });

  return onrampURL;
}

/**
 * Open Coinbase Pay Widget
 */
export async function openCoinbasePayWidget(
  destinationAddress: string,
  amount: number = 50
): Promise<void> {
  if (!cbPayInstance) {
    cbPayInstance = initializeCoinbasePay();
  }

  // Update destination address
  cbPayInstance.updateWidget({
    widgetParameters: {
      destinationWallets: [{
        address: destinationAddress,
        blockchains: ['base'],
      }],
      presetCryptoAmount: amount,
      presetFiatAmount: amount,
    },
  });

  cbPayInstance.open();
}

/**
 * Create Smart Account using Coinbase CDP
 */
export async function createCoinbaseSmartAccount(
  ownerAddress: string
): Promise<any> {
  if (!coinbaseSDK) {
    throw new Error('Coinbase SDK not initialized');
  }

  try {
    // Create a new wallet (smart account)
    const wallet = await coinbaseSDK.createWallet();

    console.log('✅ Smart account created:', wallet.getId());

    return {
      walletId: wallet.getId(),
      address: wallet.getAddress(),
      owner: ownerAddress,
    };
  } catch (error) {
    console.error('❌ Failed to create smart account:', error);
    throw error;
  }
}

/**
 * Get Wallet Balance using Coinbase CDP
 */
export async function getWalletBalance(walletId: string): Promise<any> {
  if (!coinbaseSDK) {
    throw new Error('Coinbase SDK not initialized');
  }

  try {
    const wallet = await coinbaseSDK.getWallet(walletId);
    const balance = await wallet.getBalance();

    return balance;
  } catch (error) {
    console.error('❌ Failed to get wallet balance:', error);
    throw error;
  }
}

/**
 * Transfer USDC using Coinbase CDP
 */
export async function transferUSDC(
  walletId: string,
  toAddress: string,
  amount: number
): Promise<any> {
  if (!coinbaseSDK) {
    throw new Error('Coinbase SDK not initialized');
  }

  try {
    const wallet = await coinbaseSDK.getWallet(walletId);

    // Transfer USDC on Base
    const transfer = await wallet.createTransfer({
      amount: amount,
      assetId: 'usdc', // USDC on Base
      destination: toAddress,
      networkId: 'base-mainnet', // Base mainnet
    });

    const result = await transfer.wait();

    console.log('✅ Transfer completed:', result.getTransactionHash());

    return result;
  } catch (error) {
    console.error('❌ Failed to transfer USDC:', error);
    throw error;
  }
}

/**
 * Create Coinbase Commerce Charge for Payment
 */
export async function createCoinbaseCommerceCharge(
  amount: number,
  currency: string = 'USD',
  batchId: string,
  userAddress: string
): Promise<any> {
  if (!coinbaseSDK) {
    throw new Error('Coinbase SDK not initialized');
  }

  try {
    // Create a charge using Coinbase Commerce
    const charge = await coinbaseSDK.createCharge({
      name: `WAGA Coffee Batch Payment - ${batchId}`,
      description: `Payment for coffee batch redemption`,
      pricing_type: 'fixed_price',
      local_price: {
        amount: amount.toString(),
        currency: currency,
      },
      metadata: {
        batchId: batchId,
        userAddress: userAddress,
        platform: 'WAGA',
      },
    });

    console.log('✅ Coinbase Commerce charge created:', charge.id);

    return {
      chargeId: charge.id,
      hostedUrl: charge.hosted_url,
      amount: amount,
      currency: currency,
    };
  } catch (error) {
    console.error('❌ Failed to create Coinbase Commerce charge:', error);
    throw error;
  }
}

/**
 * Verify Coinbase Webhook Signature
 * Note: This function should be used in a Node.js environment (API routes)
 * For browser usage, implement webhook verification on your backend
 */
export function verifyCoinbaseWebhook(
  payload: string,
  signature: string,
  timestamp: string
): boolean {
  if (!COINBASE_WEBHOOK_SECRET) {
    console.warn('Coinbase webhook secret not configured');
    return false;
  }

  try {
    // This is a placeholder for webhook verification
    // In production, implement proper HMAC verification using Node.js crypto
    // Example implementation:
    /*
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', COINBASE_WEBHOOK_SECRET)
      .update(timestamp + payload)
      .digest('hex');
    return signature === `sha256=${expectedSignature}`;
    */

    console.warn('⚠️ Coinbase webhook verification should be implemented on the backend');
    return true; // For development - implement proper verification in production
  } catch (error) {
    console.error('❌ Webhook verification failed:', error);
    return false;
  }
}

/**
 * Handle Coinbase Payment Webhook
 */
export async function handleCoinbasePaymentWebhook(webhookData: any): Promise<void> {
  try {
    const { event, data } = webhookData;

    if (event.type === 'charge:confirmed') {
      const charge = data;
      const { batchId, userAddress, platform } = charge.metadata;

      // Verify this is for WAGA platform
      if (platform !== 'WAGA') {
        console.warn('Received webhook for non-WAGA platform:', platform);
        return;
      }

      console.log(`✅ Payment confirmed for batch ${batchId} by user ${userAddress}`);

      const chargeDetails = {
        chargeId: charge.id,
        amount: charge.pricing.local.amount,
        currency: charge.pricing.local.currency,
        batchId,
        userAddress,
        confirmations: charge.confirmations,
        timeline: charge.timeline,
      };

      console.log('Charge details:', chargeDetails);

      // Here you would typically:
      // 1. Update the payment status in your database
      // 2. Call the smart contract to confirm payment
      // 3. Trigger the redemption process

      // Example: Call smart contract to confirm payment
      // await confirmPaymentOnChain(batchId, userAddress, chargeId);

      // Example: Update database
      // await updatePaymentStatus(batchId, userAddress, 'confirmed', chargeDetails);

      // For now, emit an event that can be listened to by the frontend
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('coinbasePaymentConfirmed', {
          detail: chargeDetails
        }));
      }

    } else if (event.type === 'charge:failed') {
      console.log('❌ Payment failed:', data.id);

    } else if (event.type === 'charge:pending') {
      console.log('⏳ Payment pending:', data.id);
    }

  } catch (error) {
    console.error('❌ Failed to handle Coinbase webhook:', error);
    throw error;
  }
}

/**
 * Cross-border Payment using Coinbase
 */
export async function createCrossBorderPayment(
  fromCurrency: string,
  toCurrency: string,
  amount: number,
  recipientAddress: string
): Promise<any> {
  if (!coinbaseSDK) {
    throw new Error('Coinbase SDK not initialized');
  }

  try {
    // Create a cross-border transfer
    const transfer = await coinbaseSDK.createTransfer({
      amount: amount,
      assetId: fromCurrency.toLowerCase(),
      destination: recipientAddress,
      networkId: 'base-mainnet', // Destination network
    });

    const result = await transfer.wait();

    console.log('✅ Cross-border payment completed');

    return result;
  } catch (error) {
    console.error('❌ Cross-border payment failed:', error);
    throw error;
  }
}

/**
 * Initialize all Coinbase SDKs
 */
export async function initializeAllCoinbaseSDKs(): Promise<void> {
  try {
    console.log('🚀 Initializing Coinbase SDKs...');

    // Initialize Coinbase Wallet SDK
    initializeCoinbaseWallet();
    console.log('✅ Coinbase Wallet SDK initialized');

    // Initialize Coinbase Pay
    if (typeof window !== 'undefined') {
      initializeCoinbasePay();
      console.log('✅ Coinbase Pay initialized');
    }

    // Initialize Coinbase CDP SDK
    await initializeCoinbaseSDK();
    console.log('✅ Coinbase CDP SDK initialized');

    console.log('🎉 All Coinbase SDKs initialized successfully!');
  } catch (error) {
    console.error('❌ Failed to initialize Coinbase SDKs:', error);
  }
}

// Export types for TypeScript
export interface CoinbasePaymentData {
  chargeId: string;
  amount: number;
  currency: string;
  batchId: string;
  userAddress: string;
}

export interface SmartAccountData {
  walletId: string;
  address: string;
  owner: string;
}

export interface CoinbaseWebhookEvent {
  event: {
    type: string;
    data: any;
  };
}
