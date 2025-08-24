import { NetworkEthereum, TokenETH, WalletMetamask } from '@web3icons/react';
import { 
  MdCoffee,
  MdVerified,
  MdAgriculture,
  MdTimeline,
  MdGrade,
  MdStorage
} from 'react-icons/md';

export default function About() {
  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-4xl mx-auto web3-page-spacing relative z-10">
        <div className="web3-card animate-card-entrance">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="waga-logo-container transition-all duration-300">
                <img 
                  src="https://violet-rainy-toad-577.mypinata.cloud/ipfs/bafkreigqbyeqnmjqznbikaj7q2mipyijlslb57fgdw7nhloq3xinvhvcca" 
                  alt="WAGA Coffee Logo" 
                  className="h-20 w-auto rounded-xl"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold web3-gradient-text-harmonized mb-6">About WAGA Coffee Platform</h1>
          </div>
          
          <div className="space-y-6 text-gray-700">
            <p className="text-lg leading-relaxed">
              WAGA Coffee Platform revolutionizes the coffee supply chain by tokenizing premium roasted coffee from highland regions. 
              Our blockchain-powered platform ensures complete traceability from farm to cup, managed by WAGA administrators who work directly with local farmers.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              <div className="space-y-4 animate-card-entrance" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <MdAgriculture size={24} className="text-emerald-600" />
                  <span>Our Mission</span>
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  To connect coffee lovers directly with farmers while ensuring transparency, 
                  fair pricing, and authentic origin verification through blockchain technology. WAGA serves as the trusted intermediary, 
                  working with local cooperatives to bring you the finest coffee.
                </p>
              </div>
              
              <div className="space-y-4 animate-card-entrance" style={{ animationDelay: '400ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <NetworkEthereum size={24} variant="branded" />
                  <span>Technology</span>
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Built on Base Testnet with Chainlink Functions for inventory verification and IPFS for 
                  decentralized metadata storage. Our smart contracts ensure data integrity, transparency, 
                  and immutable proof of origin for every coffee batch.
                </p>
              </div>

              <div className="space-y-4 animate-card-entrance" style={{ animationDelay: '600ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <MdCoffee size={24} className="text-amber-600" />
                  <span>Ethiopian Heritage</span>
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Ethiopia is the birthplace of coffee, and we're proud to showcase the incredible diversity 
                  and quality of beans from regions like Sidamo, Yirgacheffe, and Harrar. Each batch tells 
                  the story of its origin through blockchain technology.
                </p>
              </div>

              <div className="space-y-4 animate-card-entrance" style={{ animationDelay: '800ms' }}>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                  <MdGrade size={24} className="text-yellow-600" />
                  <span>Quality Assurance</span>
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Every coffee batch undergoes rigorous quality testing and verification before being tokenized. 
                  Our WAGA administrators work closely with verified roasters and quality control experts 
                  to ensure only the finest coffee reaches our platform.
                </p>
              </div>
            </div>

            <div className="mt-12 p-6 web3-card-dark animate-card-entrance" style={{ animationDelay: '1000ms' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <MdTimeline size={24} className="text-blue-600" />
                <span>Platform Statistics</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <NetworkEthereum size={32} variant="branded" />
                  <div className="text-2xl font-bold web3-gradient-text">4</div>
                  <div className="text-sm text-gray-600">Smart Contracts</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <MdCoffee size={32} className="text-amber-600" />
                  <div className="text-2xl font-bold web3-gradient-text">12+</div>
                  <div className="text-sm text-gray-600">Coffee Batches</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <MdVerified size={32} className="text-emerald-600" />
                  <div className="text-2xl font-bold web3-gradient-text">100%</div>
                  <div className="text-sm text-gray-600">Verification Rate</div>
                </div>
                <div className="flex flex-col items-center space-y-2">
                  <MdStorage size={32} className="text-purple-600" />
                  <div className="text-2xl font-bold web3-gradient-text">Active</div>
                  <div className="text-sm text-gray-600">IPFS Storage</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
