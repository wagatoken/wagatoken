---
url: "https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning"
title: "What is Pinning? - Pinata Docs"
---

[Pinata Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/pinata/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/pinata/logo/dark.svg)](https://docs.pinata.cloud/)

Search...

Ctrl K

Search...

Navigation

IPFS 101

What is Pinning?

[Documentation](https://docs.pinata.cloud/quickstart) [SDK](https://docs.pinata.cloud/sdk/getting-started) [API Reference](https://docs.pinata.cloud/api-reference/introduction)

IPFS “Pinning” is the foundation to getting content on IPFS. When you upload a file to IPFS, the IPFS node will create a [CID](https://docs.pinata.cloud/ipfs-101/what-are-cids) for that file which will act as the identifier and the address. Then it will “pin” that file to the IPFS network, making it available for other nodes to request it. At that point any other IPFS node can request the content for a CID, and the content will pass through other nodes leaving a cache on that node. This makes it faster to fetch files again if those nodes are used.

![](https://docs.mypinata.cloud/ipfs/bafybeicfeptvwjkwlbv2iye3m2oc5c44femjb4f2wpdn7bku4ylxqexli4)

As the cache on these nodes through, it will soon become bloated with too much data, similar to how your computer can get slow if it’s loaded down with too many cache files. IPFS nodes have a way to handle this though, and that’s through something called “Garbage Collection.” This is a process where the IPFS node will dump any content in the cache that is not being pinned to IPFS. However if there is content in the cache that is still being pinned by at least one IPFS node, then it will stay. Pinning is what keeps content on IPFS, and as long as content is being pinned by one node, it will stay available on the network.

## [​](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning\#how-do-i-pin-files-to-ipfs%3F)  How Do I Pin Files to IPFS?

With Pinata there are a few ways you can pin files to IPFS

### [​](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning\#api-%26-sdks)  API & SDKs

If you’re a developer that needs to build decentralized applications then you will likely want to use the [Pinata SDK](https://docs.pinata.cloud/sdk) or [Pinata API](https://docs.pinata.cloud/api-reference/endpoint/upload-a-file). These make it simple to upload files or raw JSON to IPFS!

Copy

```
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "example-gateway.mypinata.cloud",
});

const file = new File(["Hello IPFS!"], "hello-world.txt", { type: "text/plain" });
const upload = await pinata.upload.file(file);

```

Check out the [Quickstart](https://docs.pinata.cloud/quickstart) guide to upload your first file
through the SDK!

We also have other tools like the [Pinata CLI](https://docs.pinata.cloud/tools/ipfs-cli) or [Next.js Starter](https://docs.pinata.cloud/tools/nextjs-starter) which can be used to upload using [API Keys](https://docs.pinata.cloud/account-management/api-keys).

### [​](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning\#web-app)  Web App

If you’re non-technical you can use [Pinata App](https://app.pinata.cloud/ipfs/files) to upload files, perfect if you just want to get started with NFTs and IPFS! It’s as simple as clicking the “Add” button in the top right corner of the files page, selecting your file, give it a name, then upload. Once its complete, you’ll see it listed in the files page!

![](https://docs.mypinata.cloud/ipfs/bafybeih5leperkpn2thy2xbebh3zqqmvqhx6p5nl5n7buj73w62yoha6ki)

Start uploading by [signing up for a free\\
account](https://app.pinata.cloud/register)!

### [​](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning\#pin-by-cid)  Pin by CID

Another way you can upload content to Pinata is by transferring content that is already on IPFS. This could be CIDs that are on your own local IPFS node or another IPFS pinning service! You can do this with the “Import from IPFS” button in the web app, like so:

![](https://docs.mypinata.cloud/ipfs/bafybeid6k42hboh543sgw7svsnn4aj52lzqnp7gz2vedwa7wzic6w4debu)

Or you can pin by CID with our API using the [Pin By CID](https://docs.pinata.cloud/api-reference/endpoint/ipfs/pin-by-cid) endpoint with a code snippet like this:

Copy

```
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "example-gateway.mypinata.cloud",
});

const pin = await pinata.upload.cid("QmVLwvmGehsrNEvhcCnnsw5RQNseohgEkFNN1848zNzdng")

```

[Suggest edits](https://github.com/pinatacloud/docs/edit/main/ipfs-101/what-is-ipfs-pinning.mdx)

[What is IPFS?](https://docs.pinata.cloud/ipfs-101/what-is-ipfs) [What are CIDs?](https://docs.pinata.cloud/ipfs-101/what-are-cids)

On this page

- [How Do I Pin Files to IPFS?](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning#how-do-i-pin-files-to-ipfs%3F)
- [API & SDKs](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning#api-%26-sdks)
- [Web App](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning#web-app)
- [Pin by CID](https://docs.pinata.cloud/ipfs-101/what-is-ipfs-pinning#pin-by-cid)

Assistant

Responses are generated using AI and may contain mistakes.