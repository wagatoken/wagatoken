import Link from "next/link";

export default function Docs() {
  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-6xl mx-auto py-12 px-4 relative z-10">
        <div className="web3-card animate-card-entrance">
          <h1 className="text-4xl font-bold web3-gradient-text mb-8">Documentation</h1>
          <p className="text-lg text-gray-800 mb-8">
            Welcome to the WAGA Coffee Platform! Here you'll learn how to navigate our privacy-enhanced blockchain system for Ethiopian coffee trading. We use cutting-edge Zero-Knowledge (ZK) proofs to protect sensitive business information while ensuring complete transparency and traceability from bean to cup. Whether you're a coffee processor, distributor, or curious coffee lover, these guides will help you understand how we're revolutionizing coffee trading with advanced Web3 technology.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/docs/guides/getting-started" className="web3-card-feature animate-card-entrance block hover:shadow-lg transition-shadow" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🚀</span>
                <span>Getting Started</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                New to the platform? Start here! Learn how to connect your wallet, understand our coffee tokenization system, and discover how blockchain technology ensures every cup of Ethiopian coffee is authentic and traceable.
              </p>
              <span className="web3-button-outline text-sm inline-block">
                Read Guide →
              </span>
            </Link>
            
            <Link href="/docs/guides/admin" className="web3-card-feature animate-card-entrance block hover:shadow-lg transition-shadow" style={{ animationDelay: '200ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🏭</span>
                <span>WAGA Admin Guide</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Are you a coffee processor or cooperative? This comprehensive guide covers batch creation, quality verification, IPFS metadata storage, and ZK-proof generation for privacy-enhanced coffee trading. Learn how to protect sensitive business data while maintaining transparency.
              </p>
              <span className="web3-button-outline text-sm inline-block">
                Admin Portal →
              </span>
            </Link>
            
            <Link href="/docs/guides/distributor" className="web3-card-feature animate-card-entrance block hover:shadow-lg transition-shadow" style={{ animationDelay: '300ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🏢</span>
                <span>Distributor Guide</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Ready to distribute Ethiopian coffee? Learn about our inventory-free distribution model, USDC payment processing, staking requirements, and how ZK privacy protection ensures competitive advantages while maintaining supply chain transparency.
              </p>
              <span className="web3-button-outline text-sm inline-block">
                Learn More →
              </span>
            </Link>
            
            <Link href="/docs/guides/chainlink" className="web3-card-feature animate-card-entrance block hover:shadow-lg transition-shadow" style={{ animationDelay: '400ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🔗</span>
                <span>Chainlink Integration</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Curious about our oracle integration? Discover how we use Chainlink Functions for automated inventory verification, proof of reserve, and real-world data integration to ensure coffee quality and availability.
              </p>
              <span className="web3-button-outline text-sm inline-block">
                Technical Docs →
              </span>
            </Link>
            
            <Link href="/docs/guides/zk-privacy" className="web3-card-feature animate-card-entrance block hover:shadow-lg transition-shadow" style={{ animationDelay: '450ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🔒</span>
                <span>ZK Privacy Protection</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Learn how Zero-Knowledge proofs protect sensitive business information while maintaining transparency. Understand our three privacy circuits: Price, Quality, and Supply Chain protection for competitive advantage.
              </p>
              <span className="web3-button-outline text-sm inline-block">
                Privacy Guide →
              </span>
            </Link>
            
            <Link href="/docs/guides/ipfs-storage" className="web3-card-feature animate-card-entrance block hover:shadow-lg transition-shadow" style={{ animationDelay: '500ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">📡</span>
                <span>IPFS Storage</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Wondering about our decentralized storage? Learn how we use IPFS and Pinata to store coffee batch metadata, images, and documents in a decentralized, tamper-proof way that ensures data permanence and privacy.
              </p>
              <span className="web3-button-outline text-sm inline-block">
                View Details →
              </span>
            </Link>
            
            <Link href="/docs/guides/smart-contracts" className="web3-card-feature animate-card-entrance block hover:shadow-lg transition-shadow" style={{ animationDelay: '600ms' }}>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <span className="text-2xl">🛠️</span>
                <span>Smart Contracts</span>
              </h3>
              <p className="text-gray-800 text-sm mb-4 leading-relaxed">
                Deep dive into our smart contract architecture! Explore how our ERC1155 tokens, batch management, ZK-proof verification, privacy layer, and USDC payment systems work together on Base Sepolia to create a trustless coffee trading platform.
              </p>
              <span className="web3-button-outline text-sm inline-block">
                Contract Docs →
              </span>
            </Link>
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
                  {/* Core Contracts */}
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">WAGA Coffee Token Core:</span>
                    <a href="https://sepolia.basescan.org/address/0x440146a5B87f28ab901D6268139181e07fb36e05" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-mono text-xs underline">0x440146a5B87f28ab901D6268139181e07fb36e05</a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Batch Manager:</span>
                    <a href="https://sepolia.basescan.org/address/a215A65CD9565d1c1336a8cB0DF3B9994f4f471F" target="_blank" rel="noopener noreferrer" className="text-emerald-600 font-mono text-xs underline">0xa215A65CD9565d1c1336a8cB0DF3B9994f4f471F</a>
                  </div>
                  {/* Financial Contracts */}
                  <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Treasury:</span>
                    <a href="https://sepolia.basescan.org/address/75E2C46DF97cC53e8A31a1A564B987790D685177" target="_blank" rel="noopener noreferrer" className="text-amber-600 font-mono text-xs underline">0x75E2C46DF97cC53e8A31a1A564B987790D685177</a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Proof of Reserve:</span>
                    <a href="https://sepolia.basescan.org/address/E794464994fC1084346C1643354Bbf7d8e3c0Ad3" target="_blank" rel="noopener noreferrer" className="text-amber-600 font-mono text-xs underline">0xE794464994fC1084346C1643354Bbf7d8e3c0Ad3</a>
                  </div>
                  {/* Verifier Contracts */}
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-gray-800 font-medium">ZK Privacy Manager:</span>
                    <a href="https://sepolia.basescan.org/address/0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono text-xs underline">0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776</a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Circom Verifier:</span>
                    <a href="https://sepolia.basescan.org/address/0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono text-xs underline">0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776</a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Chainlink Router:</span>
                    <a href="https://sepolia.basescan.org/address/f9B8fc078197181C841c296C876945aaa425B278" target="_blank" rel="noopener noreferrer" className="text-blue-600 font-mono text-xs underline">0xf9B8fc078197181C841c296C876945aaa425B278</a>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-purple-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Privacy Layer:</span>
                    <a href="https://sepolia.basescan.org/address/0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776" target="_blank" rel="noopener noreferrer" className="text-purple-600 font-mono text-xs underline">0x0b2d83D75Cf2525d8C7D40476157ea0B3aE33776</a>
                  </div>
                    <div className="flex justify-between items-center p-2 bg-amber-50 rounded-lg">
                      <span className="text-gray-800 font-medium">Network:</span>
                      <span className="text-amber-600 font-medium">Base Sepolia</span>
                    </div>
                </div>
              </div>
              <div className="web3-card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <span>📊</span>
                  <span>Platform Stats</span>
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Active Coffee Batches:</span>
                    <span className="text-emerald-600 font-bold">25+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">IPFS Files Stored:</span>
                    <span className="text-emerald-600 font-bold">150+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Verification Rate:</span>
                    <span className="text-emerald-600 font-bold">100%</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">ZK Proofs Generated:</span>
                    <span className="text-emerald-600 font-bold">150+</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-emerald-50 rounded-lg">
                    <span className="text-gray-800 font-medium">Network Status:</span>
                    <span className="text-emerald-600 font-bold">🟢 Active</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="web3-stat-card">
                <div className="text-3xl mb-2">☕</div>
                <div className="text-2xl font-bold text-emerald-600">Ethiopian</div>
                <div className="text-sm text-gray-800">Premium Coffee Origins</div>
              </div>
              <div className="web3-stat-card">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-2xl font-bold text-purple-600">ZK-Protected</div>
                <div className="text-sm text-gray-800">Privacy-Enhanced Trading</div>
              </div>
              <div className="web3-stat-card">
                <div className="text-3xl mb-2">🌍</div>
                <div className="text-2xl font-bold text-blue-600">Global</div>
                <div className="text-sm text-gray-800">USDC Payment Processing</div>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-emerald-50 p-6 rounded-lg">
            <h2 className="text-xl font-bold text-emerald-800 mb-3">🤝 How WAGA Works</h2>
            <p className="text-emerald-700 mb-4">
              WAGA revolutionizes the coffee industry by bringing transparency and traceability to every cup while protecting sensitive business information through Zero-Knowledge proofs. 
              Our privacy-enhanced blockchain platform ensures that every bean can be traced from the Ethiopian highlands to your table, 
              with the added benefit of protecting trade secrets and competitive advantages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/browse" className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium">
                Browse Coffee
              </Link>
              <Link href="/docs/guides/zk-privacy" className="bg-white text-emerald-600 border border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium">
                Learn About ZK Privacy
              </Link>
              <Link href="/docs/guides/getting-started" className="bg-white text-emerald-600 border border-emerald-600 px-4 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-sm font-medium">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
