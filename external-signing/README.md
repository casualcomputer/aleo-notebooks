# External Signing + Delegated Proving on Aleo Testnet

End-to-end tutorial for the pattern where **the user holds their own private key** and **Provable's Delegated Proving Service (DPS) generates the proof** — the dApp never sees the key.

## Why this pattern

Most DPS examples look like this:

```javascript
const account = new Account({ privateKey: process.env.PRIVATE_KEY });
```

That's fine for scripts. It's unfit for any dApp where the end user is the signer:

- **Self-custody** — if the dApp holds the key, "the user owns the transaction" collapses.
- **Regulatory** — holding user keys that move funds makes the dApp operator a money transmitter (state-by-state MTL, bonded capital). Staying software-only sidesteps that.
- **Enterprise security** — payroll / settlement customers reject any vendor that holds the keys that move money.

The Provable SDK exposes two primitives — `computeExternalSigningInputs` and `buildExecutionRequestFromExternallySignedData` — that let a dApp split signing from proving. A wallet signs the transition and returns four small pieces; the dApp builds an `ExecutionRequest` from those pieces and hands it to DPS. The user's private key never crosses the dApp boundary.

No end-to-end walkthrough composing these with DPS existed, so here's one.

---

## Flow

```
wallet (holds pk)                      dApp (no pk)                      DPS
        │                                    │                             │
        │                                    ├─ computeExternalSigningInputs
        │◄── {programId, fn, inputs, types} ─┤  (what will be signed)
        │                                    │
        ├── {signature, tvk, signer, skTag} ►│
        │                                    ├─ buildExecutionRequestFromExternallySignedData
        │                                    ├─ programManager.provingRequest({ executionRequest })
        │                                    ├──── submitProvingRequestSafe ────────►│
        │                                    │◄─── { transaction, broadcast_result }─┤
```

The dApp never constructs an `Account` from the user's private key. The simulated wallet in `wallet.mjs` is the only component that ever holds it.

---

## Prerequisites

1. Register a DPS consumer and mint API credentials. Steps 1–2 of [`../dps-test/README.md`](../dps-test/README.md) cover this in ~30 seconds.
2. Node 18+.

---

## Run it

```bash
cd external-signing
npm install
npm run gen-account      # prints a throwaway testnet private key
cp .env.example .env     # then fill in PROVABLE_API_KEY, PROVABLE_CONSUMER_ID, TESTNET_PRIVATE_KEY
npm start
```

The `broadcast: false` flag is the default — DPS generates the proof and returns the transaction, but does not submit it. For a proving-only run you do **not** need to fund the throwaway account. To broadcast a real transfer, fund the address at <https://faucet.provable.com/> (or <https://faucet.aleo.org/>) and flip `broadcast: true` in `external-signing.mjs`.

### Observed output

```
Wallet address (user, self-custodial): aleo1tl4lh9ar7fygczmjp8l3cj76pe84qa8w8t4v58j6guav2469zqzscrrmu4

[1] Computing external signing inputs...
    done in 23ms
[2] Requesting signature from wallet...
    wallet returned signed data in 16ms
[3] Building ExecutionRequest from externally-signed data...
    done in 7ms
[4] Building ProvingRequest and submitting to DPS...
    ProvingRequest built in 264ms
    DPS responded in 1181ms

✅ Delegated proving succeeded
   Transaction ID:   at1w9u9vlj6kavht62ewvwc3x0yfwryw283z7q9aswcwnc6et49yggs4e20wj
   Broadcast result: {"status":"Skipped"}
```

End-to-end: ~1.5 seconds on testnet for a single-transition `credits.aleo/transfer_public`. Compare against a local WASM prover, which typically takes minutes for the same circuit.

---

## Code walk-through

### [1] `computeExternalSigningInputs` — public, no key needed

```javascript
const signingInput = await computeExternalSigningInputs({
  programName: "credits.aleo",
  functionName: "transfer_public",
  inputs: ["aleo1…recipient", "1u64"],
  inputTypes: ["address.public", "u64.public"],
  isRoot: true,
});
// → { functionId, isRoot, requestInputs: [...] }
```

Deterministic. The wallet uses this (or the data backing it) to render a confirmation UI: "you are signing `credits.aleo/transfer_public` with these inputs."

### [2] Wallet signs the transition

The wallet receives `{ programId, functionName, inputs, inputTypes, isRoot, rootTvk?, programChecksum?, isDynamic? }`. In this tutorial it is [`ExternalSigningWallet`](wallet.mjs), which wraps the `Account` that holds the private key and exposes a single `signTransition(…)` method. That method internally calls `ExecutionRequest.sign(privateKey, …)` — the existing Aleo primitive — and extracts four small pieces from the result:

```javascript
return {
  signature: req.signature().to_string(),
  tvk:       req.tvk().toString(),
  signer:    req.signer().to_string(),
  skTag:     req.sk_tag().toString(),
};
```

This is what a real browser wallet would return across its RPC boundary. `signature` alone isn't enough — `tvk` (transition view key) and `skTag` (signing-key tag) are Aleo-specific derivations that a generic `signMessage` cannot produce.

### [3] `buildExecutionRequestFromExternallySignedData`

```javascript
const executionRequest = buildExecutionRequestFromExternallySignedData(
  {
    programId, functionName, inputs, inputTypes,
    signature: signed.signature,
    tvk:       signed.tvk,
    signer:    signed.signer,
    skTag:     signed.skTag,
  },
  {},    // RecordViewKeyStrategy with no record inputs — see below
);
```

The second argument tells the SDK how to resolve record-input IDs:

| Strategy                | Use when                                    |
|-------------------------|---------------------------------------------|
| `{}` (default)          | No record inputs (this tutorial)            |
| `{ recordViewKeys, gammas }` | Wallet returns pre-computed record view keys |
| `{ viewKey }`           | dApp has the user's view key (reduces wallet surface, widens trust) |
| `{ inputIds }`          | Wallet returns fully pre-computed input IDs |

For transitions with record inputs, the wallet should return record view keys + gammas alongside the signature to keep the view key out of the dApp.

### [4] Wrap into a `ProvingRequest` and submit

```javascript
const provingRequest = await programManager.provingRequest({
  programName: "credits.aleo",
  functionName: "transfer_public",
  priorityFee: 0,
  privateFee: false,
  broadcast: false,
  executionRequest,              // ← the externally-signed request
});

const result = await networkClient.submitProvingRequestSafe({
  provingRequest,
  dpsPrivacy: true,
  apiKey: process.env.PROVABLE_API_KEY,
  consumerId: process.env.PROVABLE_CONSUMER_ID,
});
```

When `executionRequest` is provided, `ProgramManager.provingRequest` does **not** require a private key on the manager and wraps the execution with a **fee-master** fee authorization — DPS pays the fee from the consumer's account (`fm_access` role, granted by default on the testnet consumer role). The user's key is not used to sign any fee.

`dpsPrivacy: true` has the SDK fetch DPS's public key, encrypt the request body with libsodium cryptobox, refresh the JWT automatically, and forward cookies. Nothing you have to wire up yourself.

---

## Gap: wallet adapters as of April 2026

The Provable SDK has the primitives; the wallet adapters do not yet expose them.

- **`@demox-labs/aleo-wallet-adapter-*`** (the incumbent) exposes `signMessage` + `requestTransaction`. Neither helps: `signMessage` can't produce `tvk` / `skTag`; `requestTransaction` welds signing + proving + submitting into one operation, defeating the point of using DPS.
- **`@provablehq/aleo-wallet-adaptor-*`** (new, `0.1.1-alpha.0`) exposes `GalileoWalletAdapter` with `connect`, `disconnect`, `signMessage`, `decrypt`, `executeTransaction`, `transactionStatus`, `switchNetwork`, `requestRecords`, `executeDeployment`. It's a pure RPC shim to a `window.shield` (née `window.galileo`) browser extension. No sign-without-proving primitive; no reference to `computeExternalSigningInputs` / `buildExecutionRequestFromExternallySignedData` anywhere in the repo.

**What wallets need to add** to make this flow work with a real browser wallet:

```typescript
interface SignTransitionRequest {
  programId: string;
  functionName: string;
  inputs: string[];
  inputTypes: string[];
  isRoot: boolean;
  isDynamic?: boolean;
  rootTvk?: string;             // when isRoot === false
  programChecksum?: string;     // for programs with a constructor
}

interface SignTransitionResponse {
  signature: string;
  tvk:       string;
  signer:    string;
  skTag:     string;
  // For record inputs:
  recordViewKeys?: string[];
  gammas?:         string[];
}

wallet.signTransition(request: SignTransitionRequest): Promise<SignTransitionResponse>;
```

Until a wallet exposes that (or an equivalent), a dApp using this pattern must ship its own wallet-side signing code — there is no drop-in adapter. The `ExternalSigningWallet` class in [`wallet.mjs`](wallet.mjs) shows the exact work the wallet side must do: about a dozen lines on top of the existing `ExecutionRequest.sign`.

---

## Files

| File                      | Role                                                     |
|---------------------------|----------------------------------------------------------|
| `external-signing.mjs`    | End-to-end script. The dApp side.                        |
| `wallet.mjs`              | Simulated self-custodial wallet. The signer side.        |
| `gen-account.mjs`         | Generates a throwaway testnet account.                   |
| `.env.example`            | Credential template.                                     |

---

## References

- DPS overview: <https://developer.aleo.org/sdk/delegate-proving/delegate_proving/>
- DPS setup tutorial (prerequisite for this one): [`../dps-test/README.md`](../dps-test/README.md)
- SDK source (external signing): `node_modules/@provablehq/sdk/dist/testnet/external-signing.d.ts`
- WASM source (`ExecutionRequest.sign`, `fromExternallySignedData`): `node_modules/@provablehq/wasm/dist/testnet/aleo_wasm.d.ts`
- Existing Provable wallet adaptor (does NOT yet expose a sign-without-proving primitive): <https://github.com/ProvableHQ/aleo-dev-toolkit>
