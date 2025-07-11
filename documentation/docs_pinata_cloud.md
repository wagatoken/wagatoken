[Pinata Docs home page![light logo](https://mintlify.s3.us-west-1.amazonaws.com/pinata/logo/light.svg)![dark logo](https://mintlify.s3.us-west-1.amazonaws.com/pinata/logo/dark.svg)](https://docs.pinata.cloud/)

Search...

Ctrl K

Search...

Navigation

Get Started

Quickstart

[Documentation](https://docs.pinata.cloud/quickstart) [SDK](https://docs.pinata.cloud/sdk/getting-started) [API Reference](https://docs.pinata.cloud/api-reference/introduction)

![](https://mintlify.s3.us-west-1.amazonaws.com/pinata/assets/hero.png)

## [​](https://docs.pinata.cloud/quickstart\#getting-started-with-pinata)  Getting Started with Pinata

Whether you’re brand new or a seasoned developer, Pinata makes it simple to store and retrieve content with speed and security. All you need to kick off your journey is a [free Pinata account](https://app.pinata.cloud/register)!

[**Next.Js** \\
\\
Quickstart](https://docs.pinata.cloud/frameworks/next-js) [**Hono** \\
\\
Quickstart](https://docs.pinata.cloud/frameworks/hono) [**React** \\
\\
Quickstart](https://docs.pinata.cloud/frameworks/react) [**Svelte** \\
\\
Quickstart](https://docs.pinata.cloud/frameworks/sveltekit) [**Astro** \\
\\
Quickstart](https://docs.pinata.cloud/frameworks/astro) [**Remix** \\
\\
Quickstart](https://docs.pinata.cloud/frameworks/remix)

### [​](https://docs.pinata.cloud/quickstart\#1-get-api-key-and-gateway-url)  1\. Get API key and Gateway URL

![](https://docs.mypinata.cloud/ipfs/bafybeignh2yy7bp7qpts5vi46prbjd6lbz23lmtbfcgvpcwc5rjkudrfta)

Inside the [Pinata App](https://app.pinata.cloud/) select “API Keys” from the sidebar, then click “New Key” in the top right. We would recommend starting with Admin privileges and unlimited uses to start. You will receive a `pinata_api_key`, `pinata_api_secret`, and a `JWT`. The JWT is the most common authentication method and what we’ll be using below.

Next you will want to grab your Gateway domain by clicking the Gateways tab in the sidebar. You should see it listed in the format `fun-llama-300.mypinata.cloud` and you will want to copy it exactly like that.

### [​](https://docs.pinata.cloud/quickstart\#2-install-and-setup-sdk)  2\. Install and Setup SDK

In the root of your project run the install command with your package manager of choice.

npm

pnpm

yarn

bun

Copy

```
npm i pinata

```

Import and initialize the SDK in your codebase with the API key and Gateway from the previous step

Copy

```
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "example-gateway.mypinata.cloud",
});

```

The `PINATA_JWT` is a secret key, be sure to initialize the SDK in a secure environment and practice basic variable security practices. If you need to upload from a client environment, consider using signed JWTs

### [​](https://docs.pinata.cloud/quickstart\#3-upload-a-file)  3\. Upload a File

Use the `upload` method to upload a File object.

SDK

API

Copy

```
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});

async function main() {
  try {
    const file = new File(["hello world!"], "hello.txt", { type: "text/plain" });
    const upload = await pinata.upload.public.file(file);
    console.log(upload);
  } catch (error) {
    console.log(error);
  }
}

await main();

```

You should get a response object like the one below

SDK

API

Copy

```
{
  id: "0195f815-5c5e-716d-9240-d3ae380e2002",
  group_id: null,
  name: "hello.txt",
  cid: "bafkreidvbhs33ighmljlvr7zbv2ywwzcmp5adtf4kqvlly67cy56bdtmve",
  created_at: "2025-04-02T19:58:24.616Z",
  size: 12,
  number_of_files: 1,
  mime_type: "text/plain",
  vectorized: false,
  network: "public",
}

```

### [​](https://docs.pinata.cloud/quickstart\#4-retrieve-a-file-through-a-gateway)  4\. Retrieve a File through a Gateway

Use the `cid` of a file to fetch it through a Gateway directly or create a URL

SDK

API

Copy

```
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});

async function main() {
  try {
    const data = await pinata.gateways.public.get("bafkreibm6jg3ux5qumhcn2b3flc3tyu6dmlb4xa7u5bf44yegnrjhc4yeq");
    console.log(data)

    const url = await pinata.gateways.convert(
      "bafkreib4pqtikzdjlj4zigobmd63lig7u6oxlug24snlr6atjlmlza45dq"
    )
    console.log(url)
  } catch (error) {
    console.log(error);
  }
}

main();

```

## [​](https://docs.pinata.cloud/quickstart\#what%E2%80%99s-next%3F)  What’s Next?

Ready to see more of what Pinata has to offer? Here are some additional features and concepts to help you get the most out of our platform:

[**Groups** \\
\\
With Groups, you can organize your files via the Pinata API or the web app. Create a Group, store your IPFS content, and fetch content quickly and easily.](https://docs.pinata.cloud/files/groups) [**Workspaces** \\
\\
Workspaces allow you to add multiple team members to your Pinata account and collaborate seamlessly. Even if your team members don’t have a Pinata account, you can invite them easily. This feature is essential for efficient project collaboration and management.](https://docs.pinata.cloud/account-management/workspaces)

[Suggest edits](https://github.com/pinatacloud/docs/edit/main/quickstart.mdx)

[Next.js](https://docs.pinata.cloud/frameworks/next-js)

On this page

- [Getting Started with Pinata](https://docs.pinata.cloud/quickstart#getting-started-with-pinata)
- [1\. Get API key and Gateway URL](https://docs.pinata.cloud/quickstart#1-get-api-key-and-gateway-url)
- [2\. Install and Setup SDK](https://docs.pinata.cloud/quickstart#2-install-and-setup-sdk)
- [3\. Upload a File](https://docs.pinata.cloud/quickstart#3-upload-a-file)
- [4\. Retrieve a File through a Gateway](https://docs.pinata.cloud/quickstart#4-retrieve-a-file-through-a-gateway)
- [What’s Next?](https://docs.pinata.cloud/quickstart#what%E2%80%99s-next%3F)

Assistant

Responses are generated using AI and may contain mistakes.

![](https://mintlify.s3.us-west-1.amazonaws.com/pinata/assets/hero.png)