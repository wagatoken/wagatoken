'use client';

import { Metadata } from 'next';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-amber-900">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-amber-500/20">
          <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
          <p className="text-amber-200 mb-8">Draft Version - Last Updated: August 22, 2025</p>
          
          <div className="prose prose-invert prose-amber max-w-none text-green-100">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-8">
              <p className="text-amber-200 font-medium mb-2">📝 Draft Notice</p>
              <p className="text-sm">This is a draft privacy policy. Final terms may change before platform launch. We're committed to transparency and will notify users of any significant updates.</p>
            </div>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Who We Are</h2>
            <p>
              WAGA Coffee Platform is a blockchain-based coffee traceability system connecting Ethiopian coffee farmers, distributors, and consumers. We're building something meaningful - a platform that brings transparency to coffee supply chains while respecting your privacy.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">What Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Information You Give Us</h3>
            <ul className="space-y-2">
              <li><strong>Account Information:</strong> Email, wallet addresses, business details for distributors</li>
              <li><strong>Transaction Data:</strong> Coffee batch purchases, redemptions, staking activities</li>
              <li><strong>Business Information:</strong> For distributors - company details, location, business license information</li>
              <li><strong>Communications:</strong> When you contact us, we keep records to help you better</li>
            </ul>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Information We Collect Automatically</h3>
            <ul className="space-y-2">
              <li><strong>Technical Data:</strong> IP addresses, browser type, device information</li>
              <li><strong>Usage Analytics:</strong> How you use our platform (pages visited, features used)</li>
              <li><strong>Blockchain Data:</strong> Transaction hashes, smart contract interactions (this stuff is public by nature)</li>
            </ul>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Information from Partners</h3>
            <ul className="space-y-2">
              <li><strong>Chainlink Data:</strong> External data feeds for coffee pricing and verification</li>
              <li><strong>IPFS Storage:</strong> Metadata and documentation stored on decentralized networks</li>
              <li><strong>Payment Processors:</strong> Transaction confirmations for coffee purchases</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">How We Use Your Information</h2>
            
            <p>We use your information to:</p>
            <ul className="space-y-2 mt-4">
              <li><strong>Run the Platform:</strong> Process transactions, manage accounts, enable coffee traceability</li>
              <li><strong>Improve Our Service:</strong> Analytics help us build better features</li>
              <li><strong>Keep Things Secure:</strong> Fraud prevention, security monitoring</li>
              <li><strong>Communicate:</strong> Platform updates, transaction confirmations, support</li>
              <li><strong>Comply with Laws:</strong> Regulatory requirements, tax reporting where applicable</li>
            </ul>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Information Sharing</h2>
            
            <p>We don't sell your personal information. Period. But we do share information in these situations:</p>
            
            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">With Your Permission</h3>
            <p>When you explicitly agree to share information (like connecting with distributors or publishing coffee batch reviews).</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Service Providers</h3>
            <p>Companies that help us operate the platform - hosting, analytics, customer support. They're bound by strict agreements to protect your data.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Legal Requirements</h3>
            <p>If required by law or to protect our platform and users from fraud or security threats.</p>

            <h3 className="text-xl font-medium text-amber-200 mt-6 mb-3">Blockchain Reality Check</h3>
            <p>Some information (transaction hashes, token transfers) lives on public blockchains. That's the nature of blockchain technology - it's transparent by design.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Data Security</h2>
            
            <p>We take security seriously:</p>
            <ul className="space-y-2 mt-4">
              <li><strong>Encryption:</strong> Data in transit and at rest is encrypted</li>
              <li><strong>Access Controls:</strong> Only authorized team members can access personal data</li>
              <li><strong>Regular Audits:</strong> We review our security practices regularly</li>
              <li><strong>Incident Response:</strong> We have plans in place for security incidents</li>
            </ul>

            <p className="mt-4">But let's be honest - no system is 100% secure. We do our best, but can't guarantee absolute security.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Your Rights</h2>
            
            <p>You have rights regarding your personal information:</p>
            <ul className="space-y-2 mt-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Fix inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion (though some blockchain data can't be removed)</li>
              <li><strong>Portability:</strong> Get your data in a machine-readable format</li>
              <li><strong>Objection:</strong> Object to certain uses of your data</li>
            </ul>

            <p className="mt-4">To exercise these rights, contact us at privacy@wagacoffee.com</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">International Transfers</h2>
            
            <p>
              Our platform operates globally. Your information might be processed in countries with different privacy laws than yours. We ensure appropriate safeguards are in place when transferring data internationally.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Data Retention</h2>
            
            <p>We keep your information as long as:</p>
            <ul className="space-y-2 mt-4">
              <li>Your account is active</li>
              <li>Required for legal or regulatory purposes</li>
              <li>Needed for legitimate business purposes (like fraud prevention)</li>
            </ul>

            <p className="mt-4">When we delete your data, we do so securely. Blockchain data, however, is permanent by design.</p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Children's Privacy</h2>
            
            <p>
              Our platform isn't designed for children under 13. We don't knowingly collect personal information from kids. If you're a parent and believe your child has provided us with personal information, please contact us.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Changes to This Policy</h2>
            
            <p>
              We may update this policy as our platform evolves. We'll notify you of significant changes via email or platform notifications. The "Last Updated" date at the top tells you when this policy was last revised.
            </p>

            <h2 className="text-2xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
            
            <p>Questions about this privacy policy? We're here to help:</p>
            <ul className="space-y-2 mt-4">
              <li><strong>Email:</strong> privacy@wagacoffee.com</li>
              <li><strong>Telegram:</strong> @wagatoken</li>
              <li><strong>LinkedIn:</strong> WAGA Protocol</li>
            </ul>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mt-8">
              <p className="text-green-200 font-medium mb-2">🌱 Our Commitment</p>
              <p className="text-sm">We're building WAGA to empower Ethiopian coffee farmers and create transparency in coffee supply chains. Your privacy and trust are fundamental to this mission. We'll always be straight with you about how we handle your data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
