# Verifying Provable's Delegated Proving Service (DPS) on Testnet

Setup walkthrough for running a proof end-to-end against Provable's DPS on Aleo testnet. Values in `<ANGLE_BRACKETS>` are placeholders you substitute with your own.

---

## Step 1 — Register a DPS consumer

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"username": "<YOUR_HANDLE>"}' \
  https://api.provable.com/consumers
```

**Example response** (HTTP 201):

```json
{
  "consumer": { "id": "d18638ef-6656-4a03-89b2-90a21ab7477a" },
  "created_at": 1776724850,
  "id": "525e599e-fd33-49b4-89cf-e3a3248b5239",
  "key": "kBF7dbnCmay4TJzp5kykgpXH8x3h8KZC"
}
```

Save `consumer.id` (the nested one) as your **consumer ID** and `key` as your **API key**. Ignore the top-level `id`.

---

## Step 2 — Mint a JWT (sanity check)

```bash
curl -v -X POST \
  -H "X-Provable-API-Key: <YOUR_API_KEY>" \
  https://api.provable.com/jwts/<YOUR_CONSUMER_ID>
```

**Example response headers** (abbreviated):

```
< HTTP/2 201
< ratelimit-limit: 1000
< authorization: Bearer eyJhbGciOiJIUzI1NiIs<...>
<
{"exp":1776728591}
```

The JWT comes back in the `authorization` response header, prefixed with `Bearer `, 1-hour TTL. The SDK handles minting and refresh automatically in step 7 — you don't use this JWT directly.

Decoded JWT payload shows the role grants for reference:

```json
{
  "sub": "<YOUR_CONSUMER_ID>",
  "iat": 1776724991,
  "exp": 1776728591,
  "role": {
    "dps_access": true,
    "fm_access": true,
    "rss_access": true,
    "name": "WalletUser"
  }
}
```

Default testnet role grants DPS, Fee Master, and Record Scanner access. Rate limit is 1000 req/min.

---

## Step 3 — Bootstrap a Node project

```bash
mkdir ~/dps-test && cd ~/dps-test
npm init -y
npm pkg set type=module
npm install @provablehq/sdk dotenv
```

Confirm the SDK's import surface matches what this tutorial expects:

```bash
cat node_modules/@provablehq/sdk/package.json | grep -A 40 '"exports"'
```

If `./testnet.js` is listed in the `exports` block, you're good. If not, adjust the imports in the scripts below to use whatever subpath (or bare `@provablehq/sdk`) your version exposes.

---

## Step 4 — Generate a throwaway testnet account

Create `gen-account.mjs`:

```javascript
import { Account } from "@provablehq/sdk/testnet.js";

const account = new Account();
console.log("Private key:", account.privateKey().to_string());
console.log("Address:", account.address().to_string());
```

Run:

```bash
node gen-account.mjs
```

**Output shape** (your actual values will differ):

```
Private key: APrivateKey1zkp<~55 more base58 chars>
Address: aleo1<~58 more base58 chars>
```

Save both.

---

## Step 5 — Fund the address from the testnet faucet

Try the faucet link: `https://faucet.aleo.org/`

Paste your `aleo1...` address, submit, wait ~60 seconds. Verify credits landed:

```bash
curl https://api.explorer.provable.com/v1/testnet/program/credits.aleo/mapping/account/<YOUR_ADDRESS>
```

Non-null, non-zero response = credits arrived.

---

## Step 6 — Create `.env`

In `~/dps-test/.env`:

```
PROVABLE_API_KEY=<YOUR_API_KEY>
PROVABLE_CONSUMER_ID=<YOUR_CONSUMER_ID>
TESTNET_PRIVATE_KEY=<YOUR_THROWAWAY_PRIVATE_KEY>
```

---

## Step 7 — Run the end-to-end proving request

Create `test-dps.mjs`:

```javascript
import "dotenv/config";
import {
  Account,
  AleoKeyProvider,
  ProgramManager,
  NetworkRecordProvider,
  AleoNetworkClient,
} from "@provablehq/sdk/testnet.js";

const host = "https://api.provable.com/v2";
const account = new Account({ privateKey: process.env.TESTNET_PRIVATE_KEY });
console.log("Using address:", account.address().to_string());

const networkClient = new AleoNetworkClient(host);
const keyProvider = new AleoKeyProvider();
keyProvider.useCache(true);
const recordProvider = new NetworkRecordProvider(account, networkClient);

const programManager = new ProgramManager(host, keyProvider, recordProvider);
programManager.setAccount(account);

console.log("Building proving request...");
const t0 = Date.now();
const provingRequest = await programManager.provingRequest({
  programName: "credits.aleo",
  functionName: "transfer_public",
  priorityFee: 0,
  privateFee: false,
  inputs: [
    "aleo1vwls2ete8dk8uu2kmkmzumd7q38fvshrht8hlc0a5362uq8ftgyqnm3w08",
    "1u64",
  ],
  broadcast: false,
});
console.log(`Built in ${Date.now() - t0}ms`);

console.log("Submitting to DPS...");
networkClient.setProverUri("https://api.provable.com/prove");
const t1 = Date.now();
const result = await networkClient.submitProvingRequestSafe({
  provingRequest,
  dpsPrivacy: true,
  apiKey: process.env.PROVABLE_API_KEY,
  consumerId: process.env.PROVABLE_CONSUMER_ID,
});
console.log(`DPS responded in ${Date.now() - t1}ms`);

if (result.ok) {
  console.log("✅ Transaction ID:", result.data.transaction?.id);
  console.log("Broadcast result:", result.data.broadcast_result);
} else {
  console.log("❌ Status:", result.status, "Error:", result.error);
}
```

Run:

```bash
node test-dps.mjs
```

A non-null transaction ID means DPS generated a valid proof. `broadcast_result` is `null` because `broadcast: false` — the proven transaction came back but wasn't submitted to the network.

---

## Reference

- DPS docs: https://developer.aleo.org/sdk/delegate-proving/delegate_proving/
- SDK: https://github.com/ProvableHQ/sdk
- Testnet explorer: https://testnet.explorer.provable.com/
