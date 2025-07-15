export default function About() {
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="web3-card">
        <h1 className="text-4xl font-bold web3-gradient-text mb-6">About WAGA Coffee Platform</h1>
        
        <div className="space-y-6 text-gray-300">
          <p className="text-lg">
            WAGA Coffee Platform revolutionizes the coffee supply chain by tokenizing premium roasted coffee from the highlands of Ethiopia. 
            Our blockchain-powered platform ensures complete traceability from farm to cup.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">🌱 Our Mission</h2>
              <p>
                To connect coffee lovers directly with Ethiopian farmers while ensuring transparency, 
                fair pricing, and authentic origin verification through blockchain technology.
              </p>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">🔗 Technology</h2>
              <p>
                Built on Ethereum with Chainlink Functions for verification and IPFS for 
                decentralized storage, ensuring data integrity and transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
