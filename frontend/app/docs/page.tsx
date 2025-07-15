export default function Docs() {
  return (
    <div className="max-w-6xl mx-auto py-12">
      <div className="web3-card">
        <h1 className="text-4xl font-bold web3-gradient-text mb-8">Documentation</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="web3-card-dark">
            <h3 className="text-xl font-semibold text-white mb-3">🚀 Getting Started</h3>
            <p className="text-gray-400 text-sm mb-4">
              Learn how to use the WAGA platform for tokenizing and trading coffee.
            </p>
            <button className="text-purple-300 hover:text-white transition-colors text-sm">
              Read Guide →
            </button>
          </div>
          
          <div className="web3-card-dark">
            <h3 className="text-xl font-semibold text-white mb-3">🏭 Producer Guide</h3>
            <p className="text-gray-400 text-sm mb-4">
              Step-by-step instructions for coffee producers to create and verify batches.
            </p>
            <button className="text-purple-300 hover:text-white transition-colors text-sm">
              Learn More →
            </button>
          </div>
          
          <div className="web3-card-dark">
            <h3 className="text-xl font-semibold text-white mb-3">👤 Consumer Guide</h3>
            <p className="text-gray-400 text-sm mb-4">
              How to purchase coffee tokens and redeem them for physical delivery.
            </p>
            <button className="text-purple-300 hover:text-white transition-colors text-sm">
              Explore →
            </button>
          </div>
          
          <div className="web3-card-dark">
            <h3 className="text-xl font-semibold text-white mb-3">🔗 Chainlink Integration</h3>
            <p className="text-gray-400 text-sm mb-4">
              Technical details on how we use Chainlink Functions for verification.
            </p>
            <button className="text-purple-300 hover:text-white transition-colors text-sm">
              Technical Docs →
            </button>
          </div>
          
          <div className="web3-card-dark">
            <h3 className="text-xl font-semibold text-white mb-3">📡 IPFS Storage</h3>
            <p className="text-gray-400 text-sm mb-4">
              Understanding how batch metadata is stored on IPFS via Pinata.
            </p>
            <button className="text-purple-300 hover:text-white transition-colors text-sm">
              View Details →
            </button>
          </div>
          
          <div className="web3-card-dark">
            <h3 className="text-xl font-semibold text-white mb-3">🛠️ API Reference</h3>
            <p className="text-gray-400 text-sm mb-4">
              Complete API documentation for developers building with WAGA.
            </p>
            <button className="text-purple-300 hover:text-white transition-colors text-sm">
              API Docs →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
