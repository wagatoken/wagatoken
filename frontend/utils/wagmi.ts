import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet } from 'wagmi/connectors'

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
    [baseSepolia.id]: http(),
    [base.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
