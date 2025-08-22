import Link from 'next/link';
import DynamicPlatformStats from '../components/DynamicPlatformStats';

export default function Docs() {
  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
        <div className="web3-card animate-card-entrance">
          <h1 className="text-4xl font-bold web3-gradient-text mb-8">Documentation</h1>
          <p className="text-lg text-gray-800 mb-8">
            Learn how to use the WAGA Coffee Platform for tokenized coffee trading and verification
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="web3-card-feature animate-card-entrance" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🚀</span>
                <span>Getting Started</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Learn how to navigate the WAGA platform, connect your wallet, and start trading tokenized Ethiopian coffee.
              </p>
              <Link href="/docs/guides/getting-started" className="web3-button-outline text-sm">
                Read Guide →
              </Link>
            </div>
            
            <div className="web3-card-feature animate-card-entrance" style={{ animationDelay: '200ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🏭</span>
                <span>WAGA Admin Guide</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Internal documentation for WAGA administrators on how to create, verify, and manage coffee batches on the blockchain.
              </p>
              <Link href="/docs/guides/admin" className="web3-button-outline text-sm">
                Admin Guide →
              </Link>
            </div>
            
            <div className="web3-card-feature animate-card-entrance" style={{ animationDelay: '300ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🏢</span>
                <span>Distributor Guide</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Complete guide for verified distributors: staking, inventory-free operations, and customer fulfillment in the WAGA ecosystem.
              </p>
              <Link href="/docs/guides/distributor" className="web3-button-outline text-sm">
                Distributor Guide →
              </Link>
            </div>
            
            <div className="web3-card-feature animate-card-entrance" style={{ animationDelay: '400ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🔗</span>
                <span>Chainlink Integration</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Technical details on how we use Chainlink Functions for automated inventory verification and proof of reserve.
              </p>
              <Link href="/docs/guides/chainlink" className="web3-button-outline text-sm">
                Technical Docs →
              </Link>
            </div>
            
            <div className="web3-card-feature animate-card-entrance" style={{ animationDelay: '500ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">📡</span>
                <span>IPFS Storage</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Understanding how coffee batch metadata, images, and certificates are stored decentrally on IPFS via Pinata.
              </p>
              <Link href="/docs/guides/ipfs-storage" className="web3-button-outline text-sm">
                Storage Guide →
              </Link>
            </div>
            
            <div className="web3-card-feature animate-card-entrance" style={{ animationDelay: '600ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🛠️</span>
                <span>Smart Contracts</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Deployed smart contract addresses, verification links, and technical implementation details on Base Sepolia.
              </p>
              <Link href="/docs/guides/smart-contracts" className="web3-button-outline text-sm">
                Contract Docs →
              </Link>
            </div>
          </div>

          <div className="mt-12 web3-card-feature animate-card-entrance" style={{ animationDelay: '700ms' }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span className="text-3xl">🔍</span>
              <span>Quick Reference</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="web3-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>🔗</span>
                  <span>Smart Contract Addresses</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">WAGA Coffee Token:</span>
                    <a 
                      href="https://sepolia.basescan.org/address/0xe69bdd3e783212d11522e7f0057c9f52fc4d0a39"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-mono text-xs hover:text-emerald-800 hover:underline transition-colors"
                    >
                      0xe69b...0a39
                    </a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Proof of Reserve:</span>
                    <a 
                      href="https://sepolia.basescan.org/address/0xaa42a460107a61d34d461fb59c46343b1a8fadc5"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-mono text-xs hover:text-emerald-800 hover:underline transition-colors"
                    >
                      0xaa42...adc5
                    </a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Inventory Manager:</span>
                    <a 
                      href="https://sepolia.basescan.org/address/0xe882dcd6f1283f83ab19f954d70fc024ee70a908"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-mono text-xs hover:text-emerald-800 hover:underline transition-colors"
                    >
                      0xe882...a908
                    </a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Coffee Redemption:</span>
                    <a 
                      href="https://sepolia.basescan.org/address/0xc235c005202a9ec26d59120b8e9c2cc6ab432fc4"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-mono text-xs hover:text-emerald-800 hover:underline transition-colors"
                    >
                      0xc235...2fc4
                    </a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Network:</span>
                    <span className="text-amber-600 font-medium">Base Sepolia</span>
                  </div>
                </div>
              </div>
              <DynamicPlatformStats />
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="web3-stat-card">
                <div className="text-3xl mb-2">☕</div>
                <div className="text-2xl font-bold text-emerald-600">Ethiopian</div>
                <div className="text-sm text-gray-800">Premium Coffee</div>
              </div>
              <div className="web3-stat-card">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-2xl font-bold text-amber-600">Blockchain</div>
                <div className="text-sm text-gray-800">Verified Batches</div>
              </div>
              <div className="web3-stat-card">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-2xl font-bold text-emerald-600">Global</div>
                <div className="text-sm text-gray-800">Distribution</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
