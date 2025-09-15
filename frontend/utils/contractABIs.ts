// Core contract ABIs for frontend integration
export const WAGACoffeeTokenCoreABI = [
  // View Functions
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'getBatchInfo',
    outputs: [
      { name: 'productionDate', type: 'uint256' },
      { name: 'expiryDate', type: 'uint256' },
      { name: 'isVerified', type: 'bool' },
      { name: 'quantity', type: 'uint256' },
      { name: 'pricePerUnit', type: 'uint256' },
      { name: 'packagingInfo', type: 'string' },
      { name: 'metadataHash', type: 'string' },
      { name: 'isMetadataVerified', type: 'bool' },
      { name: 'lastVerifiedTimestamp', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'isBatchCreated',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'getAvailableQuantity',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'getMintedQuantity',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getActiveBatchIds',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getNextBatchId',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' }
    ],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Write Functions
  {
    inputs: [
      { name: 'productionDate', type: 'uint256' },
      { name: 'expiryDate', type: 'uint256' },
      { name: 'quantity', type: 'uint256' },
      { name: 'pricePerUnit', type: 'uint256' },
      { name: 'origin', type: 'string' },
      { name: 'packagingInfo', type: 'string' },
      { name: 'metadataURI', type: 'string' }
    ],
    name: 'createBatch',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'batchId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'mintBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: true, name: 'creator', type: 'address' },
      { indexed: false, name: 'quantity', type: 'uint256' },
      { indexed: false, name: 'pricePerUnit', type: 'uint256' },
      { indexed: false, name: 'metadataURI', type: 'string' }
    ],
    name: 'BatchCreated',
    type: 'event'
  }
] as const;

export const WAGATreasuryABI = [
  // View Functions
  {
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'batchId', type: 'uint256' }
    ],
    name: 'checkPaymentStatus',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'getBatchPaymentInfo',
    outputs: [
      { name: 'required', type: 'uint256' },
      { name: 'collected', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [],
    name: 'getTreasuryStats',
    outputs: [
      { name: 'totalCollected', type: 'uint256' },
      { name: 'totalDistributed', type: 'uint256' },
      { name: 'currentBalance', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  // Write Functions
  {
    inputs: [
      { name: 'batchId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'payForBatch',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'batchId', type: 'uint256' },
      { name: 'amount', type: 'uint256' }
    ],
    name: 'setBatchPayment',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'payer', type: 'address' },
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'timestamp', type: 'uint256' }
    ],
    name: 'PaymentReceived',
    type: 'event'
  }
] as const;

export const WAGACoffeeRedemptionABI = [
  // View Functions
  {
    inputs: [{ name: 'redemptionId', type: 'uint256' }],
    name: 'getRedemptionDetails',
    outputs: [
      {
        components: [
          { name: 'consumer', type: 'address' },
          { name: 'batchId', type: 'uint256' },
          { name: 'quantity', type: 'uint256' },
          { name: 'requestDate', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'fulfillmentDate', type: 'uint256' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'consumer', type: 'address' }],
    name: 'getConsumerRedemptions',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'hasPendingRedemptions',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  // Write Functions
  {
    inputs: [
      { name: 'batchId', type: 'uint256' },
      { name: 'quantity', type: 'uint256' }
    ],
    name: 'requestRedemption',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [
      { name: 'redemptionId', type: 'uint256' },
      { name: 'status', type: 'uint8' }
    ],
    name: 'updateRedemptionStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'redemptionId', type: 'uint256' },
      { indexed: true, name: 'consumer', type: 'address' },
      { indexed: false, name: 'batchId', type: 'uint256' },
      { indexed: false, name: 'quantity', type: 'uint256' },
      { indexed: false, name: 'packagingInfo', type: 'string' }
    ],
    name: 'RedemptionRequested',
    type: 'event'
  }
] as const;

export const WAGAInventoryManagerMVPABI = [
  // View Functions
  {
    inputs: [],
    name: 'getActiveBatches',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'needsVerification',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchId', type: 'uint256' }],
    name: 'getBatchStatus',
    outputs: [
      { name: 'isExpired', type: 'bool' },
      { name: 'isLowInventory', type: 'bool' },
      { name: 'needsVerif', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  // Write Functions
  {
    inputs: [{ name: 'batchIds', type: 'uint256[]' }],
    name: 'checkExpiredBatches',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchIds', type: 'uint256[]' }],
    name: 'triggerBatchVerification',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  {
    inputs: [{ name: 'batchIds', type: 'uint256[]' }],
    name: 'checkLowInventory',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function'
  },
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: false, name: 'expiryDate', type: 'uint256' }
    ],
    name: 'BatchExpired',
    type: 'event'
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'batchId', type: 'uint256' },
      { indexed: false, name: 'currentQuantity', type: 'uint256' }
    ],
    name: 'LowInventoryWarning',
    type: 'event'
  }
] as const;
