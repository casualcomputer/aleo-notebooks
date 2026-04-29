---
title: "Aleo Shield Wallet: Developer Integration Guide & FAQ (2026)"
description: "Integrate your Aleo dApp with the Shield browser wallet: window.shield API, wallet adapters, external signing with the Delegated Proving Service, records, view keys, and the current adapter gaps."
keywords:
  - aleo
  - shield wallet
  - aleo wallet adapter
  - aleo dapp integration
  - external signing
  - delegated proving
  - window.shield
  - galileo wallet adapter
  - provable sdk
  - aleo records
audience: developers
---

# Aleo Shield Wallet: Developer Integration Guide & FAQ (2026)

> **Shield is the production target for Aleo dApps that want to be self-custodial.** This guide consolidates what Shield exposes today, what it does not, and the integration patterns that work right now — plus the gap (`signTransition`) that blocks the cleanest external-signing flow.

If you're a Shield user, see the [User Guide](./USERS.md).

**Verified:** Shield v1.18.0 · `@provablehq/aleo-wallet-adaptor` `0.1.1-alpha.0` · `@provablehq/sdk ^0.10.x` — April 2026. Adapter surface area changes; cross-check against the current package version before shipping.

---

### At a glance

| Concern | Default answer |
|---------|----------------|
| **Adapter package** | [`@provablehq/aleo-wallet-adaptor`](https://github.com/ProvableHQ/aleo-dev-toolkit) (Galileo adapter) |
| **Injection** | `window.shield` (formerly `window.galileo`) |
| **Easiest integration** | Pattern A — `executeTransaction` (wallet handles sign + prove + submit) |
| **Self-custody + delegated proving** | Pattern C — blocked on Shield exposing `signTransition` |
| **Network switching** | `wallet.switchNetwork("mainnet" \| "testnet")` |
| **Record access** | `wallet.requestRecords({ programId })` (user prompted to approve) |
| **Hardware wallet** | Not yet exposed |

---

## Table of contents

- [TL;DR — what works today, what doesn't](#tldr--what-works-today-what-doesnt)
- [Shield from a dev perspective](#shield-from-a-dev-perspective)
- [The signing-without-proving gap](#the-signing-without-proving-gap)
- [Integration patterns available today](#integration-patterns-available-today)
- [Records, view keys, and proving mode](#records-view-keys-and-proving-mode)
- [Network and environment](#network-and-environment)
- [Cross-chain swaps from a dev perspective](#cross-chain-swaps-from-a-dev-perspective)
- [Roadmap and known gaps](#roadmap-and-known-gaps)
- [Reference](#reference)

---

## TL;DR — what works today, what doesn't

| Capability                                                              | Status (April 2026) |
|-------------------------------------------------------------------------|:-------------------:|
| Connect / disconnect wallet                                             | ✅ |
| Request signature on a message (`signMessage`)                          | ✅ |
| Decrypt a record handed to the wallet (`decrypt`)                       | ✅ |
| Execute a transaction end-to-end (`executeTransaction`)                 | ✅ |
| Switch network mainnet ↔ testnet (`switchNetwork`)                      | ✅ |
| Request the user's records (`requestRecords`)                           | ✅ |
| Deploy a program from the wallet (`executeDeployment`)                  | ✅ |
| **Sign a transition without proving** (so the dApp can hand to DPS)     | ❌ Not exposed — see [the gap](#the-signing-without-proving-gap) |
| Hardware-wallet support                                                 | ❌ Not yet |

> If you only need to ship a dApp today, **use `executeTransaction`** (Pattern A) and skip the external-signing pattern entirely. Revisit when Shield exposes `signTransition`.

---

## Shield from a dev perspective

### How does Shield expose itself to a dApp?

Shield is a Chromium / Firefox extension that injects an object onto `window`. Historically `window.galileo`; the current adapter package (`@provablehq/aleo-wallet-adaptor`) refers to it as `window.shield`.

You normally don't touch `window.shield` directly — you use a wallet adapter that wraps it.

### Which wallet adapter packages exist for Aleo?

Two are in active use:

| Package | What it is | Notes |
|---------|------------|-------|
| [`@provablehq/aleo-wallet-adaptor`](https://github.com/ProvableHQ/aleo-dev-toolkit) (`0.1.1-alpha.0` and on) | Provable's official adapter; ships `GalileoWalletAdapter` | Pure RPC shim to `window.shield`. The adapter the Shield team maintains. |
| [`@demox-labs/aleo-wallet-adapter-*`](https://github.com/demox-labs/aleo-wallet-adapter) | Earlier ecosystem adapter | Predates Shield — exposes `signMessage` + `requestTransaction`. Still works for many dApps but does not surface the full Shield method set. |

For new integrations, prefer `@provablehq/aleo-wallet-adaptor`.

### Which methods does Shield expose today?

Verified against the adapter as of April 2026:

```
connect              disconnect
signMessage          decrypt
executeTransaction   requestTransaction
transactionStatus    switchNetwork
requestRecords       executeDeployment
```

Conspicuously absent: a sign-without-proving primitive that returns the four pieces (`{signature, tvk, signer, skTag}`) needed to feed a DPS proof — see the [gap](#the-signing-without-proving-gap) section.

### What's the minimum integration?

A typical dApp uses the adapter inside a React provider, then calls `useWallet()` to get a connection. A first-touch flow:

```ts title="dapp/components/SendButton.tsx"
const { wallet, connect, publicKey, executeTransaction } = useWallet();

await connect();                           // user approves in extension
const result = await executeTransaction({  // wallet handles signing + proving + submit
  programId: "credits.aleo",
  functionName: "transfer_public",
  inputs: ["aleo1...recipient", "1u64"],
  fee: 0.01,
});
```

This is Pattern A in the next section.

---

## The signing-without-proving gap

This is the most consequential thing to know if you're designing a self-custody-first dApp on Aleo.

### Why does `signMessage` not work for transactions?

`signMessage` produces an Aleo signature over an arbitrary byte string. An Aleo *transition* requires three things derived from the user's secret key:

1. `signature` — the message signature
2. `tvk` (transition view key) — derived per-transition; lets the dApp resolve record input IDs
3. `skTag` (signing-key tag) — a hash binding the signing key to this specific call

`signMessage` only produces the first one. There's no path to compute `tvk` and `skTag` from a signed message because they're functions of the secret key plus the transition's request data. To produce them, the wallet has to call `ExecutionRequest.sign(privateKey, …)` from the Provable SDK and surface the resulting fields.

### Why does `executeTransaction` defeat the point?

`executeTransaction` welds **signing**, **proving**, and **submitting** into a single wallet operation. That's fine for many dApps, but it means:

- Your dApp can't generate the proof on its own server (e.g., via DPS, where you've configured rate limits, monitoring, and consumer credentials).
- Your dApp can't submit the transaction — the wallet does.
- You can't decouple the "user signs intent" moment from the "proof is generated and broadcast" moment.

For most consumer dApps this is fine. For payroll / settlement / regulated flows where you want the dApp's infrastructure to be the proof producer, it's a hard blocker.

In Aleo terms, **proving** is the expensive computation that creates the zero-knowledge proof attached to a transaction. The proof is what lets validators check that a transition followed the program rules without exposing private record contents. Signing says "this user authorized it"; proving says "this private computation is valid."

### What's missing?

A `signTransition` method on the wallet, returning the four fields and (for record-input transitions) record view keys + gammas:

```ts title="proposed wallet API"
interface SignTransitionRequest {
  programId: string;
  functionName: string;
  inputs: string[];
  inputTypes: string[];
  isRoot: boolean;
  isDynamic?: boolean;
  rootTvk?: string;          // when isRoot === false
  programChecksum?: string;  // for programs with a constructor
}

interface SignTransitionResponse {
  signature: string;
  tvk:       string;
  signer:    string;
  skTag:     string;
  recordViewKeys?: string[]; // for record inputs
  gammas?:         string[];
}

wallet.signTransition(req: SignTransitionRequest): Promise<SignTransitionResponse>;
```

The reference implementation is small — about a dozen lines on top of `ExecutionRequest.sign` from `@provablehq/wasm`. Until Shield ships this method, the cleanest external-signing pattern (Pattern C below) requires the dApp to ship its own wallet-side signing code or use a dev-only `.env`-keyed signer.

---

## Integration patterns available today

Pick the lightest pattern that meets your constraints.

### Pattern A — Full execute-via-wallet (default for consumer dApps)

The wallet handles signing, proving, and submitting. Your dApp orchestrates the user flow.

```ts title="Pattern A — wallet does everything"
const tx = await executeTransaction({
  programId: "credits.aleo",
  functionName: "transfer_public",
  inputs: ["aleo1...recipient", "1u64"],
  fee: 0.01,
});
const status = await transactionStatus(tx.id);
```

| | |
|---|---|
| ✅ | Simplest integration |
| ✅ | Works with Shield today, no gaps |
| ⚠️ | Proving cost lands on the user's device (subject to their `Settings → Security → Proving mode`). Local proving on a low-end laptop can be slow. |
| ⚠️ | You can't choose which prover does the work. |

Use this for any dApp where the user is the operator of the transaction (most consumer apps).

### Pattern B — DPS for server-side or batch flows

Your backend uses the [Delegated Proving Service](https://developer.aleo.org/sdk/delegate-proving/delegate_proving/) directly with its own consumer credentials, signing with a service-account private key your backend holds. The wallet is not in the loop.

```ts title="Pattern B — server-managed key + DPS"
const provingRequest = await programManager.provingRequest({
  programName: "my_program.aleo",
  functionName: "do_thing",
  inputs: [...],
  privateFee: false,
  broadcast: true,
});
await networkClient.submitProvingRequestSafe({
  provingRequest,
  dpsPrivacy: true,
  apiKey: process.env.PROVABLE_API_KEY,
  consumerId: process.env.PROVABLE_CONSUMER_ID,
});
```

| | |
|---|---|
| ✅ | Fast (~1.5s end-to-end on testnet) |
| ✅ | You control the key, the rate limits, the monitoring |
| ⚠️ | Server holds a key — only appropriate for a service identity, not for end-user transactions |

End-to-end DPS setup (consumer registration, JWT minting, encryption) is documented at <https://developer.aleo.org/sdk/delegate-proving/delegate_proving/>.

### Pattern C — External signing + DPS (the target self-custody pattern)

The user holds the key in the wallet; the dApp asks the wallet to **sign** the transition; the dApp hands the four signed fields to DPS, which generates the proof and (optionally) broadcasts. The user's key never crosses the dApp boundary.

```ts title="Pattern C — external signing (blocked on signTransition)"
// 1. Wallet produces { signature, tvk, signer, skTag } — NOT YET EXPOSED
const signed = await wallet.signTransition({ programId, functionName, inputs, inputTypes, isRoot: true });

// 2. dApp builds an ExecutionRequest from the signed pieces
const executionRequest = buildExecutionRequestFromExternallySignedData(
  { programId, functionName, inputs, inputTypes, ...signed },
  {}, // RecordViewKeyStrategy
);

// 3. dApp wraps as a ProvingRequest and submits to DPS
//    (fee paid by the dApp's consumer via the fee-master role)
const provingRequest = await programManager.provingRequest({ executionRequest, /* ... */ });
const result = await networkClient.submitProvingRequestSafe({ provingRequest, dpsPrivacy: true, /* ... */ });
```

| | |
|---|---|
| ✅ | Self-custody preserved (key never leaves the wallet) |
| ✅ | Proving cost / speed controlled by your DPS consumer config — predictable for your users |
| ✅ | Sidesteps regulatory issues that come with the dApp holding user keys |
| ❌ | **Blocked on Shield exposing `signTransition`** — see the gap section above |

The SDK primitives — `computeExternalSigningInputs` and `buildExecutionRequestFromExternallySignedData` — exist today; only the wallet half is missing. See [`@provablehq/sdk`](https://github.com/ProvableHQ/sdk) for the type definitions.

---

## Records, view keys, and proving mode

### How does my dApp request the user's records?

```ts
const records = await wallet.requestRecords({ programId: "credits.aleo" });
```

The user is prompted in the extension to approve. Shield returns matching records (decrypted, since Shield holds the view key). Pass them in as record-typed inputs to a subsequent transition.

Alternatives: pre-compute record IDs server-side from the user's view key (with their consent), or have the wallet supply pre-computed record view keys + gammas alongside the signature (in Pattern C, once available).

### When should I ask the user for their view key?

**Almost never.** A view key gives permanent decryption capability over every record the user has ever held. There is no way to revoke that access for past records — view keys cannot be rotated without effectively migrating to a new address.

Legitimate cases:

- A compliance attestation flow where the user opts in to a regulated party seeing their balance.
- A read-only dashboard the user explicitly trusts (still better to use selective record disclosure where possible).

If you need *some* records visible to a third party but not all, prefer pre-computed record view keys per record (one record at a time) over a full view-key disclosure.

### What does the user's Proving mode setting mean for my dApp?

`Settings → Security → Proving mode` is per-user, not per-dApp:

- **Delegated** *(default)* — Shield routes proving through Provable's DPS. Fast (~seconds).
- **Local** — Shield generates the proof in WebAssembly. Slow (often minutes per circuit on a typical laptop).

For non-Aleo users, the easiest analogy is: signing is cheap authorization; proving is heavy computation. Delegated proving means the wallet asks a remote prover to do the heavy computation, while still keeping the user's private key inside the wallet.

In Pattern A, your dApp inherits whatever the user picked. UX implications:

- Show a spinner that allows minutes, not seconds, in case the user is in Local mode.
- Don't time out the wallet flow under 5 minutes for any non-trivial circuit.
- For dApps with strict latency requirements (real-time payments, swaps), consider Pattern B or — once `signTransition` ships — Pattern C, where your dApp controls the prover.

---

## Network and environment

### How do I detect / switch networks?

```ts
await wallet.switchNetwork("mainnet");  // or "testnet"
```

Always confirm the active network before sending a transaction — dApps that hardcode mainnet against a testnet wallet (or vice versa) produce confusing errors.

### Mainnet vs testnet — what changes?

| | Mainnet | Testnet |
|---|---|---|
| **Native ALEO** | Real | Free from a faucet |
| **Circle stablecoin** | `usdcx_stablecoin.aleo` | `test_usdcx_stablecoin.aleo` |
| **Paxos stablecoin** | `usad_stablecoin.aleo` | `test_usad_stablecoin.aleo` |
| **Explorer** | <https://explorer.provable.com> | <https://testnet.explorer.provable.com> |
| **Faucet** | n/a | <https://faucet.provable.com/> |

Test against testnet before pointing your dApp at mainnet program IDs. Hardcoded program IDs are the most common source of "works on dev, broken in prod."

### What does the SDK look like for getting an Aleo network client?

```ts
import { AleoNetworkClient } from "@provablehq/sdk";

const networkClient = new AleoNetworkClient("https://api.explorer.provable.com/v1");
```

Full SDK reference: <https://github.com/ProvableHQ/sdk>.

---

## Cross-chain swaps from a dev perspective

### What assets does Shield's swap UI expose?

Verified against Shield v1.18.0, the swap route is user-facing as:

| Swap side | Meaning | Assets |
|-----------|---------|--------|
| **From** | Asset/source the user spends | `BTC`, `ETH`, `SOL`, `TRX`, `BNB`, `XMR`, `ZEC`, `USDC`, `USDT`, `WBTC`, `USAD`, `USDCX` |
| **To** | Asset the user receives on Aleo | `ALEO`, `USAD`, `USDCX`, `USDC`, `USDT`, `ETH`, `WBTC`, `WSOL` |

Developer implication: the `To` symbols are Aleo-side assets. `ETH` on the `To` side means an ETH representation on Aleo, not native ETH in the user's Ethereum wallet.

### What's actually happening when a user swaps `BTC → ETH on Aleo (bridged via Hyperlane)`?

Two legs:

1. **Source-chain leg** — a transaction on the selected `From` chain, such as Bitcoin for `BTC`, Ethereum for `ETH`, Solana for `SOL`, Tron for `TRX`, BSC for `BNB`, Monero for `XMR`, Zcash for `ZEC`, or Arbitrum / Base / Ethereum / Solana / Tron / Aleo for supported stablecoin and wrapped-token routes.
2. **Aleo-side leg** — Hyperlane delivers a message to the Aleo bridge program, which mints the corresponding Aleo-side token to the user's address.

The Aleo-side mint typically lands as a **public** balance. Privacy is not automatic at the bridge boundary: the user must run Shield's `SHIELD` action to convert that public Aleo-side balance into private encrypted records. Only after that step do future private Aleo transfers hide the amount and wallet addresses from public explorer view.

User-facing wording matters: `From` is the asset/source chain the user spends, and `To` is the Aleo-side asset Shield receives. A label like `ETH` on the `To` side means ETH represented on Aleo, not ETH sitting in the user's Ethereum wallet.

### Should my dApp invoke Shield's swap UI directly?

No. The swap UI is a Shield-internal flow tied to its bridge integrations. Compose with bridge or routing providers directly, such as Hyperlane for bridged assets, if you need programmatic cross-chain flows. The Shield swap UI is for end-users, not dApp composition.

### What are the Aleo-side bridged-token program IDs?

The `To` side of the swap surfaces these labels (verified against Shield v1.18.0):

- `ETH` — bridged to Aleo via Hyperlane
- `WBTC` — bridged to Aleo via Hyperlane
- `WSOL` — SOL bridged to Aleo via Hyperlane
- `USDC` — on Aleo via Hyperlane
- `USDT` — on Aleo
- `USAD` — Aleo-native (Paxos)
- `USDCX` — Aleo-native (Circle)
- `ALEO` — native

The exact `*.aleo` program IDs for the Hyperlane-bridged tokens are deployment-specific — pull them from the explorer or Hyperlane's deployment registry rather than hardcoding from this guide.

---

## Roadmap and known gaps

| Item | Status (April 2026) | Workaround |
|------|---------------------|------------|
| `signTransition` (sign without proving) | ❌ Not exposed | Pattern A (`executeTransaction`) — defer Pattern C until shipped |
| Hardware wallet (Ledger / Trezor) | ❌ Not in v1.18.0 settings | None — use Pattern B with a service-managed key for high-value flows |
| `signMessage` returning `tvk` / `skTag` | ❌ Not Aleo-supported (cryptographically these aren't message-derived) | Wait for `signTransition`; do not try to back into them from `signMessage` |
| Drop-in adapter for the external-signing pattern | ❌ Doesn't exist | Use the SDK primitives directly; ~12 LOC on top of `ExecutionRequest.sign` |
| Programmatic swap composition | ❌ Not exposed via adapter | Use Hyperlane SDK directly; do not depend on Shield's swap UI |

When in doubt about adapter capability, check the current `@provablehq/aleo-wallet-adaptor` source on [aleo-dev-toolkit](https://github.com/ProvableHQ/aleo-dev-toolkit) — that's the canonical reference for what Shield exposes.

---

## Reference

### Provable SDK paths

- External signing types — `node_modules/@provablehq/sdk/dist/testnet/external-signing.d.ts`
- WASM signing primitive — `node_modules/@provablehq/wasm/dist/testnet/aleo_wasm.d.ts` (`ExecutionRequest.sign`, `fromExternallySignedData`)

### Repos

- Provable SDK — <https://github.com/ProvableHQ/sdk>
- Aleo Dev Toolkit (`@provablehq/aleo-wallet-adaptor`) — <https://github.com/ProvableHQ/aleo-dev-toolkit>
- Demox Labs adapter (legacy) — <https://github.com/demox-labs/aleo-wallet-adapter>
- Live Shield demo / sign route — <https://aleo-dev-toolkit-react-app.vercel.app/sign>

### Aleo developer docs

- Concepts — <https://developer.aleo.org/concepts/fundamentals/records>
- Delegated Proving Service — <https://developer.aleo.org/sdk/delegate-proving/delegate_proving/>
- Explorer — <https://explorer.provable.com> · <https://testnet.explorer.provable.com>
- Faucet — <https://faucet.provable.com/>

### Related: building dApps that use Shield's user features

The [User Guide](./USERS.md) explains the user-facing knobs (Proving mode, Record management, Connected dApps revocation) — useful background when designing your dApp's UX so it composes cleanly with the user's wallet preferences.

---

*Last verified: Shield v1.18.0 · `@provablehq/aleo-wallet-adaptor` `0.1.1-alpha.0` · `@provablehq/sdk ^0.10.x` — April 2026. Adapter surface area changes; cross-check against the current package version before shipping.*
