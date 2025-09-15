import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'
import { CONTRACTS, NETWORK_CONFIG } from './contracts'

// Define the chains we want to support
const chains = [baseSepolia, base] as const

export const config = createConfig({
  chains,
  connectors: [
    injected(),
    metaMask(),
    coinbaseWallet({
      appName: 'WAGA Coffee Platform',
      appLogoUrl: 'https://violet-rainy-toad-577.mypinata.cloud/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca'
    })
  ],
  transports: {
    [baseSepolia.id]: http(NETWORK_CONFIG.rpcUrl),
    [base.id]: http(),
  },
})

// Contract configuration for wagmi hooks
export const wagaContracts = {
  coffeeTokenCore: {
    address: CONTRACTS.WAGACoffeeTokenCore as `0x${string}`,
    chainId: baseSepolia.id,
  },
  treasury: {
    address: CONTRACTS.WAGATreasury as `0x${string}`,
    chainId: baseSepolia.id,
  },
  redemption: {
    address: CONTRACTS.WAGACoffeeRedemption as `0x${string}`,
    chainId: baseSepolia.id,
  },
  inventoryManager: {
    address: CONTRACTS.WAGAInventoryManagerMVP as `0x${string}`,
    chainId: baseSepolia.id,
  },
  batchManager: {
    address: CONTRACTS.WAGABatchManager as `0x${string}`,
    chainId: baseSepolia.id,
  },
  privacyLayer: {
    address: CONTRACTS.PrivacyLayer as `0x${string}`,
    chainId: baseSepolia.id,
  },
} as const

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
