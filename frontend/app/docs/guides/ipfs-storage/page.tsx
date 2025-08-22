"use client";

import Link from "next/link";

export default function IPFSStorageGuide() {
  return (
    <div className="min-h-screen web3-section">
      <div className="max-w-4xl mx-auto web3-page-spacing relative z-10">
        <div className="web3-card animate-card-entrance">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link href="/docs" className="text-emerald-600 hover:text-emerald-800 transition-colors">
              ← Back to Documentation
            </Link>
          </nav>

          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center space-x-4 mb-6">
              <div className="text-4xl">📡</div>
              <h1 className="text-4xl font-bold web3-gradient-text">IPFS Storage Guide</h1>
            </div>
            <p className="text-xl text-gray-600">
              Comprehensive guide to IPFS and Pinata integration for decentralized storage of coffee batch metadata and documentation.
            </p>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="text-purple-400 text-xl">🌐</div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-purple-700">
                  <strong>Decentralized Storage:</strong> WAGA uses IPFS through Pinata for immutable, 
                  distributed storage of all batch metadata, ensuring permanent accessibility and transparency.
                </p>
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <div className="web3-card mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2">
              <li><a href="#overview" className="text-emerald-600 hover:text-emerald-800">1. IPFS & Pinata Overview</a></li>
              <li><a href="#architecture" className="text-emerald-600 hover:text-emerald-800">2. Storage Architecture</a></li>
              <li><a href="#metadata-structure" className="text-emerald-600 hover:text-emerald-800">3. Metadata Structure</a></li>
              <li><a href="#upload-process" className="text-emerald-600 hover:text-emerald-800">4. Upload Process</a></li>
              <li><a href="#retrieval" className="text-emerald-600 hover:text-emerald-800">5. Data Retrieval</a></li>
              <li><a href="#pinning-strategy" className="text-emerald-600 hover:text-emerald-800">6. Pinning Strategy</a></li>
              <li><a href="#security" className="text-emerald-600 hover:text-emerald-800">7. Security & Access Control</a></li>
              <li><a href="#troubleshooting" className="text-emerald-600 hover:text-emerald-800">8. Troubleshooting</a></li>
            </ul>
          </div>

          {/* Content Sections */}
          <div className="space-y-12">
            {/* Overview */}
            <section id="overview" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🌐</span>
                <span>1. IPFS & Pinata Overview</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  IPFS (InterPlanetary File System) provides decentralized storage for WAGA's coffee batch metadata, 
                  while Pinata offers reliable pinning services to ensure data availability.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🌐 IPFS Benefits</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Decentralized and distributed storage</li>
                      <li>• Content-addressed system (immutable hashes)</li>
                      <li>• Redundant storage across multiple nodes</li>
                      <li>• Censorship-resistant data access</li>
                      <li>• Integration with blockchain ecosystems</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">📌 Pinata Services</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Dedicated IPFS pinning infrastructure</li>
                      <li>• 99.9% uptime guarantee</li>
                      <li>• Global gateway network</li>
                      <li>• Enterprise-grade security</li>
                      <li>• Developer-friendly API access</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">🎯 WAGA Use Cases</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">Stored Data Types:</h4>
                      <ul className="text-purple-600 space-y-1">
                        <li>• Complete batch metadata JSON</li>
                        <li>• Farm photos and certificates</li>
                        <li>• Quality assessment reports</li>
                        <li>• Processing documentation</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-700 mb-1">Key Requirements:</h4>
                      <ul className="text-purple-600 space-y-1">
                        <li>• Permanent accessibility</li>
                        <li>• Immutable storage</li>
                        <li>• Global availability</li>
                        <li>• Fast retrieval times</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Architecture */}
            <section id="architecture" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🏗️</span>
                <span>2. Storage Architecture</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA's IPFS storage architecture ensures reliable, distributed storage with multiple 
                  redundancy layers and optimized access patterns.
                </p>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3">🔄 Data Flow</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-700 overflow-x-auto pb-2">
                    <span className="bg-emerald-200 px-3 py-1 rounded whitespace-nowrap">Upload Request</span>
                    <span>→</span>
                    <span className="bg-blue-200 px-3 py-1 rounded whitespace-nowrap">Pinata API</span>
                    <span>→</span>
                    <span className="bg-purple-200 px-3 py-1 rounded whitespace-nowrap">IPFS Network</span>
                    <span>→</span>
                    <span className="bg-amber-200 px-3 py-1 rounded whitespace-nowrap">Hash Generated</span>
                    <span>→</span>
                    <span className="bg-emerald-200 px-3 py-1 rounded whitespace-nowrap">Blockchain Storage</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Storage Layers:</h3>
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">Layer 1: Upload Interface</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Admin portal file upload forms</li>
                        <li>• Automated upload via smart contracts</li>
                        <li>• File validation and preprocessing</li>
                        <li>• Metadata generation utilities</li>
                      </ul>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 mb-2">Layer 2: Pinata Integration</h4>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• API-based file uploads to IPFS</li>
                        <li>• Automatic pinning for persistence</li>
                        <li>• Metadata tagging and organization</li>
                        <li>• Gateway access configuration</li>
                      </ul>
                    </div>

                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Layer 3: IPFS Network</h4>
                      <ul className="text-sm text-purple-700 space-y-1">
                        <li>• Distributed storage across nodes</li>
                        <li>• Content-addressed file system</li>
                        <li>• Immutable hash generation</li>
                        <li>• Peer-to-peer data replication</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Layer 4: Blockchain Reference</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• IPFS hashes stored on-chain</li>
                        <li>• Smart contract metadata URI fields</li>
                        <li>• Immutable reference system</li>
                        <li>• Verification and validation</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Metadata Structure */}
            <section id="metadata-structure" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📋</span>
                <span>3. Metadata Structure</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  WAGA follows a standardized metadata structure for coffee batches, ensuring consistency 
                  and interoperability across the platform.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Standard Metadata Schema:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`{
  "version": "1.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "batchInfo": {
    "id": "WAGA-2024-001",
    "name": "Ethiopian Sidamo Premium",
    "description": "Single-origin coffee from Sidamo region",
    "quantity": 1000,
    "unit": "kg",
    "processingMethod": "washed",
    "roastLevel": "medium",
    "roastDate": "2024-01-10T08:00:00Z"
  },
  "farmInfo": {
    "name": "Sidamo Coffee Cooperative",
    "location": {
      "country": "Ethiopia",
      "region": "Sidamo",
      "coordinates": {
        "latitude": 6.5,
        "longitude": 38.5
      }
    },
    "farmer": "Haile Gebremariam",
    "contact": "haile@sidamocoop.et",
    "farmSize": 15.5,
    "elevation": 1800,
    "certifications": ["Organic", "Fair Trade"]
  },
  "qualityInfo": {
    "cupScore": 87.5,
    "aroma": 8.5,
    "flavor": 8.8,
    "aftertaste": 8.2,
    "acidity": 8.0,
    "body": 8.3,
    "balance": 8.7,
    "notes": "Floral aroma with chocolate undertones"
  },
  "documentation": {
    "farmPhotos": [
      "QmFarmPhoto1Hash...",
      "QmFarmPhoto2Hash..."
    ],
    "certificates": [
      "QmOrganicCertHash...",
      "QmFairTradeCertHash..."
    ],
    "qualityReports": [
      "QmQualityReportHash..."
    ]
  },
  "verification": {
    "status": "verified",
    "verifiedBy": "WAGA Admin",
    "verificationDate": "2024-01-15T12:00:00Z",
    "chainlinkValidation": true,
    "proofOfReserve": true
  },
  "pricing": {
    "pricePerUnit": 12.50,
    "currency": "USD",
    "totalValue": 12500.00
  }
}`}
                    </pre>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔧 Required Fields</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• <code>batchInfo.id</code> - Unique batch identifier</li>
                      <li>• <code>batchInfo.quantity</code> - Coffee quantity</li>
                      <li>• <code>farmInfo.name</code> - Farm identification</li>
                      <li>• <code>farmInfo.location</code> - Geographic data</li>
                      <li>• <code>qualityInfo.cupScore</code> - Quality assessment</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">⚡ Optional Enhancements</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Extended quality metrics</li>
                      <li>• Additional certifications</li>
                      <li>• Processing timeline data</li>
                      <li>• Environmental impact metrics</li>
                      <li>• Social impact measurements</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-amber-800 mb-2">🔍 Validation Rules</h3>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>• All required fields must be present and non-null</li>
                    <li>• Numeric values must be within acceptable ranges</li>
                    <li>• Geographic coordinates must be valid</li>
                    <li>• IPFS hashes in documentation must be accessible</li>
                    <li>• Timestamps must follow ISO 8601 format</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Upload Process */}
            <section id="upload-process" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📤</span>
                <span>4. Upload Process</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  The upload process ensures secure, reliable transfer of batch data and supporting 
                  documentation to IPFS through Pinata's infrastructure.
                </p>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Step-by-Step Upload Flow:</h3>
                  <ol className="space-y-3">
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Prepare Files</h4>
                        <p className="text-gray-700">Gather all batch documentation including photos, certificates, and reports.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Upload Supporting Files</h4>
                        <p className="text-gray-700">Upload individual files (photos, PDFs) to IPFS and collect their hashes.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Generate Metadata</h4>
                        <p className="text-gray-700">Create JSON metadata file with batch information and file hash references.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Upload Metadata</h4>
                        <p className="text-gray-700">Upload the complete metadata JSON to IPFS and obtain the main hash.</p>
                      </div>
                    </li>
                    <li className="flex items-start space-x-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">Store Hash On-Chain</h4>
                        <p className="text-gray-700">Record the IPFS hash in the smart contract's metadata URI field.</p>
                      </div>
                    </li>
                  </ol>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">📋 Upload Requirements</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Valid Pinata API credentials</li>
                      <li>• Files under 100MB each</li>
                      <li>• Supported formats: JPG, PNG, PDF, JSON</li>
                      <li>• Proper metadata structure validation</li>
                      <li>• Sufficient account storage quota</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🔧 Technical Implementation</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Next.js API routes for file handling</li>
                      <li>• Pinata SDK for IPFS operations</li>
                      <li>• React-based upload interface</li>
                      <li>• Progress tracking and error handling</li>
                      <li>• Automatic retry mechanisms</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Example Upload Code:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
{`// IPFS Upload Function Example
import { PinataSDK } from "pinata-web3";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY_URL,
});

async function uploadBatchMetadata(batchData, files) {
  try {
    // 1. Upload supporting files first
    const fileHashes = [];
    for (const file of files) {
      const upload = await pinata.upload.file(file);
      fileHashes.push(upload.IpfsHash);
    }
    
    // 2. Create metadata with file references
    const metadata = {
      ...batchData,
      documentation: {
        farmPhotos: fileHashes.filter(h => h.endsWith('.jpg')),
        certificates: fileHashes.filter(h => h.endsWith('.pdf')),
      }
    };
    
    // 3. Upload metadata JSON
    const metadataUpload = await pinata.upload.json(metadata);
    
    // 4. Return IPFS hash for blockchain storage
    return {
      success: true,
      ipfsHash: metadataUpload.IpfsHash,
      gatewayUrl: \`https://gateway.pinata.cloud/ipfs/\${metadataUpload.IpfsHash}\`
    };
    
  } catch (error) {
    console.error('Upload failed:', error);
    return { success: false, error: error.message };
  }
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Retrieval */}
            <section id="retrieval" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📥</span>
                <span>5. Data Retrieval</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Efficient data retrieval ensures fast, reliable access to coffee batch information 
                  stored on IPFS for both users and applications.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">🌐 Gateway Access</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Pinata dedicated gateway</li>
                      <li>• Public IPFS gateways</li>
                      <li>• CDN-enabled distribution</li>
                      <li>• Regional optimization</li>
                      <li>• Load balancing</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">⚡ Performance Features</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Aggressive caching strategies</li>
                      <li>• Optimized image delivery</li>
                      <li>• Lazy loading implementation</li>
                      <li>• Progressive data fetching</li>
                      <li>• Error recovery mechanisms</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Retrieval Methods:</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Direct IPFS Hash Access</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>URL Format:</strong> <code>https://gateway.pinata.cloud/ipfs/QmHashValue</code></p>
                        <p><strong>Use Cases:</strong> Direct file access, API integrations, automated systems</p>
                        <p><strong>Benefits:</strong> Fast access, immutable references, global availability</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">Smart Contract Integration</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>Method:</strong> Read metadata URI from ERC-1155 token contract</p>
                        <p><strong>Use Cases:</strong> Token-based access, verification workflows, user interfaces</p>
                        <p><strong>Benefits:</strong> Automated retrieval, verified authenticity, seamless UX</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-808 mb-2">Application Layer Caching</h4>
                      <div className="text-sm text-gray-700 space-y-2">
                        <p><strong>Implementation:</strong> Next.js API routes with Redis caching</p>
                        <p><strong>Use Cases:</strong> Frequently accessed data, user dashboards, search results</p>
                        <p><strong>Benefits:</strong> Reduced latency, improved user experience, cost optimization</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">🔄 Fallback Strategy</h3>
                  <div className="text-sm text-purple-700 space-y-2">
                    <p><strong>Primary:</strong> Pinata dedicated gateway (fastest, most reliable)</p>
                    <p><strong>Secondary:</strong> Cloudflare IPFS gateway (global CDN)</p>
                    <p><strong>Tertiary:</strong> IPFS.io public gateway (community backup)</p>
                    <p><strong>Emergency:</strong> Local cache or database backup</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Pinning Strategy */}
            <section id="pinning-strategy" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>📌</span>
                <span>6. Pinning Strategy</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Strategic pinning ensures permanent availability of coffee batch data across 
                  the distributed IPFS network with optimal cost and performance.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🔒 Critical Data</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Batch metadata JSON</li>
                      <li>• Farm certificates</li>
                      <li>• Quality reports</li>
                      <li>• Verification documents</li>
                    </ul>
                    <p className="text-xs text-emerald-600 mt-2">
                      <strong>Strategy:</strong> Permanent pinning with multiple providers
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-3">📷 Media Files</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Farm photos</li>
                      <li>• Process documentation</li>
                      <li>• Product images</li>
                      <li>• Video content</li>
                    </ul>
                    <p className="text-xs text-blue-600 mt-2">
                      <strong>Strategy:</strong> Long-term pinning with CDN optimization
                    </p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-amber-800 mb-3">📊 Analytics Data</h3>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Usage statistics</li>
                      <li>• Performance metrics</li>
                      <li>• Trend analysis</li>
                      <li>• Historical data</li>
                    </ul>
                    <p className="text-xs text-amber-600 mt-2">
                      <strong>Strategy:</strong> Selective pinning based on importance
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pinning Lifecycle:</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center space-x-2 text-sm text-gray-700 overflow-x-auto pb-2">
                      <span className="bg-emerald-200 px-3 py-1 rounded whitespace-nowrap">Upload</span>
                      <span>→</span>
                      <span className="bg-blue-200 px-3 py-1 rounded whitespace-nowrap">Auto-Pin</span>
                      <span>→</span>
                      <span className="bg-purple-200 px-3 py-1 rounded whitespace-nowrap">Verify</span>
                      <span>→</span>
                      <span className="bg-amber-200 px-3 py-1 rounded whitespace-nowrap">Monitor</span>
                      <span>→</span>
                      <span className="bg-emerald-200 px-3 py-1 rounded whitespace-nowrap">Maintain</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-3">⚙️ Automated Pinning Rules</h3>
                  <div className="text-sm text-purple-700 space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>New Batch Data:</strong> Immediately pin all files</p>
                        <p><strong>Verification Updates:</strong> Pin status changes</p>
                        <p><strong>Popular Content:</strong> Increase replication</p>
                      </div>
                      <div>
                        <p><strong>Inactive Batches:</strong> Reduce pin priority</p>
                        <p><strong>Archive Data:</strong> Cold storage options</p>
                        <p><strong>Error Recovery:</strong> Re-pin failed content</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Security */}
            <section id="security" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔐</span>
                <span>7. Security & Access Control</span>
              </h2>
              
              <div className="space-y-6">
                <p className="text-gray-700 leading-relaxed">
                  Comprehensive security measures protect sensitive data while maintaining the 
                  open, transparent nature of the coffee traceability system.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-red-800 mb-3">🔒 Private Data</h3>
                    <ul className="text-sm text-red-700 space-y-1">
                      <li>• Farmer personal information</li>
                      <li>• Commercial pricing details</li>
                      <li>• Internal quality notes</li>
                      <li>• Supplier contracts</li>
                      <li>• Financial information</li>
                    </ul>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🌐 Public Data</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Basic batch information</li>
                      <li>• Farm location (general)</li>
                      <li>• Processing methods</li>
                      <li>• Quality scores</li>
                      <li>• Certification status</li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Security Measures:</h3>
                  
                  <div className="space-y-3">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">API Security</h4>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• JWT-based authentication for Pinata API</li>
                        <li>• Rate limiting to prevent abuse</li>
                        <li>• IP whitelisting for admin operations</li>
                        <li>• Encrypted transmission (TLS 1.3)</li>
                        <li>• API key rotation policies</li>
                      </ul>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-emerald-800 mb-2">Data Privacy</h4>
                      <ul className="text-sm text-emerald-700 space-y-1">
                        <li>• Selective data exposure based on user roles</li>
                        <li>• Anonymization of sensitive information</li>
                        <li>• GDPR compliance for EU users</li>
                        <li>• Data retention policies</li>
                        <li>• User consent management</li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">Content Integrity</h4>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• IPFS hash verification on retrieval</li>
                        <li>• Digital signatures for critical documents</li>
                        <li>• Tamper detection mechanisms</li>
                        <li>• Audit trail for all modifications</li>
                        <li>• Backup and recovery procedures</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">🛡️ Security Best Practices</h3>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• Regular security audits of IPFS access patterns</li>
                    <li>• Monitor for unauthorized access attempts</li>
                    <li>• Implement proper error handling to avoid data leakage</li>
                    <li>• Use environment variables for sensitive configuration</li>
                    <li>• Regular updates of security dependencies</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Troubleshooting */}
            <section id="troubleshooting" className="web3-card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <span>🔧</span>
                <span>8. Troubleshooting</span>
              </h2>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Common Issues & Solutions:</h3>
                  
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 mb-2">🚨 Upload Failures</h4>
                      <div className="text-sm text-red-700 space-y-2">
                        <p><strong>Symptoms:</strong> Files not uploading, timeout errors, API failures</p>
                        <p><strong>Common Causes:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Incorrect Pinata API credentials</li>
                          <li>File size exceeding limits</li>
                          <li>Network connectivity issues</li>
                          <li>Invalid file formats</li>
                        </ul>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Verify API keys in environment variables</li>
                          <li>Check file size limits (100MB max)</li>
                          <li>Test network connectivity to Pinata API</li>
                          <li>Validate file formats before upload</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-amber-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-amber-800 mb-2">⚠️ Retrieval Issues</h4>
                      <div className="text-sm text-amber-700 space-y-2">
                        <p><strong>Symptoms:</strong> Slow loading, 404 errors, corrupted data</p>
                        <p><strong>Common Causes:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Gateway connectivity problems</li>
                          <li>Unpinned content becoming unavailable</li>
                          <li>Cache invalidation issues</li>
                          <li>Invalid IPFS hashes</li>
                        </ul>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Try alternative IPFS gateways</li>
                          <li>Verify pinning status in Pinata dashboard</li>
                          <li>Clear browser cache and retry</li>
                          <li>Validate IPFS hash format and accessibility</li>
                        </ul>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 mb-2">🐌 Performance Problems</h4>
                      <div className="text-sm text-blue-700 space-y-2">
                        <p><strong>Symptoms:</strong> Slow file loading, high latency, timeouts</p>
                        <p><strong>Common Causes:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Large file sizes without optimization</li>
                          <li>Geographic distance from gateways</li>
                          <li>Peak network usage times</li>
                          <li>Insufficient caching strategies</li>
                        </ul>
                        <p><strong>Solutions:</strong></p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Implement image compression and optimization</li>
                          <li>Use CDN-enabled gateways</li>
                          <li>Implement progressive loading</li>
                          <li>Add application-level caching</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-800 mb-3">🛠️ Debugging Tools</h3>
                    <ul className="text-sm text-emerald-700 space-y-1">
                      <li>• Pinata API documentation and testing</li>
                      <li>• IPFS gateway status monitors</li>
                      <li>• Browser developer tools network tab</li>
                      <li>• Custom logging and error tracking</li>
                      <li>• Performance monitoring dashboards</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 mb-3">📞 Support Resources</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                      <li>• Pinata support documentation</li>
                      <li>• IPFS community forums</li>
                      <li>• WAGA developer documentation</li>
                      <li>• GitHub issue tracking</li>
                      <li>• Internal support channels</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Quick Actions */}
          <div className="mt-12 web3-card">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
              <span>⚡</span>
              <span>Quick Actions</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Link href="/docs/guides/admin" className="web3-gradient-button block text-center">
                🏭 Admin Guide
              </Link>
              <Link href="/docs/guides/chainlink" className="web3-button-outline block text-center">
                ⚡ Chainlink Integration
              </Link>
              <Link href="/docs/guides/smart-contracts" className="web3-button-outline block text-center">
                📝 Smart Contracts
              </Link>
              <Link href="/docs" className="web3-button-outline block text-center">
                📚 All Guides
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
