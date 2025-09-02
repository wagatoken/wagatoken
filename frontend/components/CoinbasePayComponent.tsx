'use client';

import React, { useState, useEffect } from 'react';
import {
  initializeAllCoinbaseSDKs,
  openCoinbasePayWidget,
  createCoinbaseOnrampURL,
  createCoinbaseCommerceCharge,
  CoinbasePaymentData
} from '../utils/coinbaseIntegration';

interface CoinbasePayComponentProps {
  batchId: string;
  amount: number;
  currency?: string;
  userAddress: string;
  onPaymentSuccess?: (paymentData: CoinbasePaymentData) => void;
  onPaymentError?: (error: any) => void;
}

const CoinbasePayComponent: React.FC<CoinbasePayComponentProps> = ({
  batchId,
  amount,
  currency = 'USD',
  userAddress,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'widget' | 'commerce'>('widget');
  const [onrampUrl, setOnrampUrl] = useState<string>('');

  // Initialize Coinbase SDKs on component mount
  useEffect(() => {
    const initializeSDKs = async () => {
      try {
        await initializeAllCoinbaseSDKs();
        setIsInitialized(true);

        // Generate onramp URL for backup option
        const url = createCoinbaseOnrampURL(userAddress, amount, currency);
        setOnrampUrl(url);
      } catch (error) {
        console.error('Failed to initialize Coinbase SDKs:', error);
        onPaymentError?.(error);
      }
    };

    initializeSDKs();
  }, [userAddress, amount, currency, onPaymentError]);

  // Handle Coinbase Pay widget payment
  const handleWidgetPayment = async () => {
    if (!isInitialized) return;

    setIsLoading(true);
    try {
      await openCoinbasePayWidget(userAddress, amount);
    } catch (error) {
      console.error('Widget payment failed:', error);
      onPaymentError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Coinbase Commerce payment
  const handleCommercePayment = async () => {
    if (!isInitialized) return;

    setIsLoading(true);
    try {
      const chargeData = await createCoinbaseCommerceCharge(
        amount,
        currency,
        batchId,
        userAddress
      );

      // Redirect to Coinbase Commerce hosted checkout
      window.location.href = chargeData.hostedUrl;

    } catch (error) {
      console.error('Commerce payment failed:', error);
      onPaymentError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle payment method change
  const handlePaymentMethodChange = (method: 'widget' | 'commerce') => {
    setPaymentMethod(method);
  };

  // Listen for payment confirmation events
  useEffect(() => {
    const handlePaymentConfirmed = (event: CustomEvent) => {
      const paymentData = event.detail as CoinbasePaymentData;
      onPaymentSuccess?.(paymentData);
    };

    window.addEventListener('coinbasePaymentConfirmed', handlePaymentConfirmed as EventListener);

    return () => {
      window.removeEventListener('coinbasePaymentConfirmed', handlePaymentConfirmed as EventListener);
    };
  }, [onPaymentSuccess]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center p-6 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Initializing Coinbase payment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Pay with Coinbase
        </h3>
        <p className="text-gray-600">
          Purchase USDC to pay for coffee batch #{batchId}
        </p>
        <div className="mt-2 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            Amount: <span className="font-semibold">${amount} {currency}</span>
          </p>
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="widget"
              checked={paymentMethod === 'widget'}
              onChange={() => handlePaymentMethodChange('widget')}
              className="mr-2"
            />
            <span className="text-sm">Coinbase Pay Widget (Recommended)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="paymentMethod"
              value="commerce"
              checked={paymentMethod === 'commerce'}
              onChange={() => handlePaymentMethodChange('commerce')}
              className="mr-2"
            />
            <span className="text-sm">Coinbase Commerce Checkout</span>
          </label>
        </div>
      </div>

      {/* Payment Button */}
      <div className="space-y-3">
        <button
          onClick={paymentMethod === 'widget' ? handleWidgetPayment : handleCommercePayment}
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            `Pay $${amount} ${currency} with Coinbase`
          )}
        </button>

        {/* Backup Link */}
        {onrampUrl && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Or use direct link:</p>
            <a
              href={onrampUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open Coinbase Onramp
            </a>
          </div>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 p-3 bg-green-50 rounded-lg">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-green-800">
            Secure payment powered by Coinbase
          </p>
        </div>
      </div>

      {/* Terms */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        By proceeding, you agree to Coinbase's Terms of Service.
        Payments are processed securely through Coinbase infrastructure.
      </div>
    </div>
  );
};

export default CoinbasePayComponent;
