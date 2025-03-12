// Example script for creating and uploading metadata to IPFS
// This would be used before calling createBatch on the smart contract

import { create } from "ipfs-http-client"
import { Buffer } from "buffer"

// Configure IPFS client (using Infura in this example)
const projectId = "YOUR_INFURA_IPFS_PROJECT_ID"
const projectSecret = "YOUR_INFURA_IPFS_PROJECT_SECRET"
const auth = "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64")

const client = create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
})

// Example coffee batch metadata
const batchMetadata = {
  name: "Sidama Ethiopia Coffee Batch #1001",
  description: "Premium single-origin coffee from Sidama, Ethiopia",
  image: "ipfs://QmXyZ...", // IPFS hash of the batch image
  properties: {
    origin: "Sidama, Ethiopia",
    farmer: "Abebe Bekele Cooperative",
    altitude: "1,900-2,200 meters",
    process: "Washed",
    roastProfile: "Medium",
    roastDate: "2025-02-20",
    certifications: ["Organic", "Fair Trade", "Rainforest Alliance"],
    cupping_notes: ["Blueberry", "Chocolate", "Citrus"],
    batchSize: 100, // Number of 250g bags in this batch
  },
}

async function uploadMetadataToIPFS() {
  try {
    // Convert metadata to JSON string
    const metadataJSON = JSON.stringify(batchMetadata)

    // Upload to IPFS
    const added = await client.add(metadataJSON)
    const ipfsHash = added.path

    // IPFS URI format: ipfs://{hash}
    const ipfsUri = `ipfs://${ipfsHash}`
    console.log("Metadata uploaded to IPFS")
    console.log("IPFS URI:", ipfsUri)

    // This URI would be passed to the createBatch function
    return ipfsUri
  } catch (error) {
    console.error("Error uploading to IPFS:", error)
    throw error
  }
}

// Execute the upload
uploadMetadataToIPFS()
  .then((uri) => {
    console.log("Ready to call createBatch with URI:", uri)
    // Next steps would be to call the smart contract's createBatch function
    // with this URI as the ipfsUri parameter
  })
  .catch(console.error)

