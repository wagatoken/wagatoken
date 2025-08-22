'use client';

import { Metadata } from 'next';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-amber-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-amber-500/20">
          <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
          <p className="text-amber-200 mb-8">Draft Version - Last Updated: August 22, 2025</p>
          
          <div className="prose prose-invert prose-amber max-w-none text-green-100">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-8">
              <p className="text-amber-200 font-medium mb-2">📝 Draft Notice</p>
              <p className="text-sm">These are draft terms of service. Final terms may change before platform launch. We'll notify users of any significant updates and give you time to review changes.</p>
            </div>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Welcome to WAGA</h2>
            <p>
              Thanks for using WAGA Coffee Platform. These terms govern your use of our blockchain-based coffee traceability platform. By using WAGA, you agree to these terms. If you don't agree, please don't use our platform.
            </p>

            <p className="mt-4">
              We've tried to write these terms in plain English. If something's unclear, reach out to us - we're happy to explain.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">What WAGA Is</h2>
            
            <p>WAGA is a platform that:</p>
            <ul className="space-y-2 mt-4">
              <li>Enables traceability of Ethiopian coffee from farm to cup</li>
              <li>Uses blockchain technology to create transparent supply chains</li>
              <li>Connects coffee farmers, distributors, and consumers</li>
              <li>Facilitates token-based transactions for coffee batches</li>
              <li>Provides staking opportunities for distributors</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Who Can Use WAGA</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Age Requirements</h3>
            <p>You must be at least 18 years old to use our platform. If you're using WAGA on behalf of a business, you must have authority to bind that business to these terms.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Geographic Restrictions</h3>
            <p>Our platform is available globally, but some features may be restricted in certain jurisdictions due to local laws. It's your responsibility to ensure you can legally use our services.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Account Requirements</h3>
            <p>You'll need a compatible Web3 wallet to use most features. You're responsible for keeping your wallet secure - we can't recover lost private keys or reverse blockchain transactions.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">User Responsibilities</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Account Security</h3>
            <ul className="space-y-2">
              <li>Keep your wallet private keys secure</li>
              <li>Don't share your account with others</li>
              <li>Notify us immediately if you suspect unauthorized access</li>
              <li>Use strong, unique passwords for any platform accounts</li>
            </ul>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Acceptable Use</h3>
            <p>When using WAGA, you agree not to:</p>
            <ul className="space-y-2 mt-4">
              <li>Violate any laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Upload malicious code or attempt to hack the platform</li>
              <li>Manipulate token prices or engage in market manipulation</li>
              <li>Create fake accounts or impersonate others</li>
              <li>Spam, harass, or abuse other users</li>
              <li>Use the platform for money laundering or other illegal activities</li>
            </ul>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Accurate Information</h3>
            <p>Provide accurate, current information. For distributors, this includes business registration details and compliance documentation. False information may result in account suspension.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Platform Features</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Coffee Traceability</h3>
            <p>Our platform tracks coffee from Ethiopian farms through the supply chain. While we strive for accuracy, we can't guarantee the completeness or accuracy of all supply chain data.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Token Transactions</h3>
            <p>WAGA tokens represent claims to physical coffee batches. Token transactions are processed on the blockchain and are generally irreversible. Make sure you understand what you're buying before transacting.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Staking for Distributors</h3>
            <p>Distributors can stake tokens to access wholesale pricing and special features. Staking involves locking tokens for specific periods. Understand the terms before staking - tokens may be subject to slashing for misconduct.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Coffee Redemption</h3>
            <p>Token holders can redeem tokens for physical coffee delivery (where available). Redemption is subject to inventory availability and geographic limitations.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Financial Terms</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Platform Fees</h3>
            <p>We charge fees for certain platform services. Current fees are displayed in the platform interface. We may change fees with 30 days notice.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Blockchain Costs</h3>
            <p>You're responsible for blockchain transaction fees (gas fees). These are paid to the network, not to us, and we have no control over them.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Taxes</h3>
            <p>You're responsible for all applicable taxes related to your use of WAGA. This includes income taxes on staking rewards and capital gains on token transactions.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">No Investment Advice</h3>
            <p>Nothing on our platform constitutes investment advice. WAGA tokens are utility tokens representing coffee claims, not investments. Do your own research and consult professionals if needed.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Intellectual Property</h2>
            
            <p>WAGA owns or licenses all content on the platform, including:</p>
            <ul className="space-y-2 mt-4">
              <li>Platform software and code</li>
              <li>WAGA brand, logos, and trademarks</li>
              <li>Documentation and educational content</li>
              <li>Data aggregation and analytics</li>
            </ul>

            <p className="mt-4">You can use our platform for its intended purposes, but you can't copy, modify, or redistribute our proprietary content without permission.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Disclaimers and Limitations</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Platform Availability</h3>
            <p>We strive for 24/7 availability but can't guarantee it. The platform may be unavailable due to maintenance, upgrades, or technical issues. We're not liable for losses due to platform downtime.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Blockchain Risks</h3>
            <p>Blockchain technology involves inherent risks:</p>
            <ul className="space-y-2 mt-4">
              <li>Transactions are generally irreversible</li>
              <li>Smart contracts may have bugs or vulnerabilities</li>
              <li>Network congestion can cause delays or high fees</li>
              <li>Regulatory changes could impact platform functionality</li>
            </ul>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Third-Party Services</h3>
            <p>Our platform integrates with third-party services (wallets, oracles, IPFS). We're not responsible for their performance or security.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Limitation of Liability</h3>
            <p>To the maximum extent permitted by law, WAGA's liability to you is limited to the amount you've paid us in the past 12 months. We're not liable for indirect, consequential, or punitive damages.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Dispute Resolution</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Contact Us First</h3>
            <p>If you have a problem, please contact us first. We'll do our best to resolve issues quickly and fairly.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Governing Law</h3>
            <p>These terms are governed by the laws of [Jurisdiction TBD]. Any disputes will be resolved in the courts of [Jurisdiction TBD].</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Arbitration</h3>
            <p>For disputes over $10,000, we may agree to binding arbitration as an alternative to court proceedings.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Platform Changes</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Service Updates</h3>
            <p>We may update, modify, or discontinue platform features. We'll provide reasonable notice for significant changes that affect your use of the platform.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Terms Updates</h3>
            <p>These terms may change as our platform evolves. We'll notify you of material changes and give you time to review them. Continued use after changes means you accept the new terms.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Account Termination</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Your Right to Leave</h3>
            <p>You can stop using WAGA anytime. Some blockchain transactions and data may persist after you leave - that's the nature of blockchain technology.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Our Right to Suspend</h3>
            <p>We may suspend or terminate accounts that violate these terms, engage in illegal activity, or pose security risks. We'll provide notice when possible.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Effect of Termination</h3>
            <p>Upon termination, you lose access to platform features, but your blockchain assets remain under your control via your wallet.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Contact Information</h2>
            
            <p>Questions about these terms? Reach out:</p>
            <ul className="space-y-2 mt-4">
              <li><strong>Email:</strong> legal@wagacoffee.com</li>
              <li><strong>Telegram:</strong> @wagatoken</li>
              <li><strong>LinkedIn:</strong> WAGA Protocol</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Miscellaneous</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Entire Agreement</h3>
            <p>These terms, along with our Privacy Policy, constitute the entire agreement between you and WAGA regarding platform use.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Severability</h3>
            <p>If any part of these terms is found unenforceable, the rest remains in effect.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">No Waiver</h3>
            <p>Our failure to enforce any term doesn't waive our right to enforce it later.</p>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-8">
              <p className="text-green-200 font-medium mb-2">☕ Our Mission</p>
              <p className="text-sm">WAGA exists to bring transparency and fairness to coffee supply chains while empowering Ethiopian farmers. These terms support that mission by creating a framework for honest, transparent interactions between all platform participants.</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mt-6">
              <p className="text-amber-200 font-medium mb-2">🤝 Fair Dealing</p>
              <p className="text-sm">We believe in treating our users fairly and expect the same in return. If you ever feel we're not living up to these principles, please let us know. We're building this platform together.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
