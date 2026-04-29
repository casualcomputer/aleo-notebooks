---
title: "Aleo Shield Wallet: Complete User Guide & FAQ (2026)"
description: "How to use the Shield browser wallet for Aleo: public vs private balances, sending tokens privately, cross-chain swaps via Hyperlane, and security settings."
keywords:
  - aleo
  - shield wallet
  - aleo wallet
  - private balance
  - shielded balance
  - aleo browser extension
  - hyperlane
  - aleo privacy
  - private crypto wallet
  - zero knowledge wallet
audience: end-users
---

# Aleo Shield Wallet: Complete User Guide & FAQ (2026)

> **Shield is a self-custodial browser wallet for the [Aleo](https://aleo.org) blockchain.** It holds your keys on your device, lets you keep your balance private when you choose, and is the simplest way to use Aleo's zero-knowledge privacy in everyday wallet flows — sending, receiving, swapping in from other chains, and connecting to dApps.

This guide answers the questions that come up in the first hour of using Shield. If you build dApps, see the [Developer Guide](./DEVELOPERS.md) instead.

**Verified against Shield v1.18.0** — April 2026. Screen names and labels referenced below match the live extension.

---

### At a glance

| | |
|---|---|
| **What it is** | Self-custodial Aleo browser wallet (Chrome / Firefox) |
| **Privacy model** | Public *and* private balances per token, switchable with one tap |
| **Cross-chain** | One-way swap *into* Aleo from BTC, ETH, SOL, TRX, BNB, XMR, ZEC, plus stables on Arbitrum / Base / BSC / Tron / Solana / Ethereum |
| **Bridging via** | [Hyperlane](https://www.hyperlane.xyz/) |
| **Proving** | Delegated by default · local in-browser also supported |
| **Mainnet status** | Live (`Settings → Preferences → Network → Mainnet`) |

---

## Table of contents

- [The basics](#the-basics)
- [Public vs private balances](#public-vs-private-balances)
- [The four home buttons: Send, Receive, Shield, Swap](#the-four-home-buttons-send-receive-shield-swap)
- [Activity and "Joined Records"](#activity-and-joined-records)
- [Cross-chain swaps (BETA)](#cross-chain-swaps-beta)
- [Settings → Security](#settings--security)
- [Settings → Preferences](#settings--preferences)
- [Multi-wallet and multi-account](#multi-wallet-and-multi-account)
- [Privacy and disclosure](#privacy-and-disclosure)
- [Security and recovery](#security-and-recovery)
- [Troubleshooting](#troubleshooting)
- [Where to go next](#where-to-go-next)

---

## The basics

### What is the Shield wallet for Aleo?

Shield is a browser-extension wallet for [Aleo](https://aleo.org), the zero-knowledge L1 blockchain. It stores your private key on your device, signs transactions locally, and lets you send tokens **publicly** (visible on an Aleo explorer) or **privately** (encrypted on-chain — only you can see them). It also supports cross-chain swaps from Bitcoin, Ethereum, Solana, Tron, BNB Chain, Monero, and Zcash *into* Aleo-side assets.

Think of Shield as **MetaMask for a chain that defaults to private**.

### Is Shield self-custodial?

Yes. Your private key is generated on your device and stored encrypted in the browser extension's local storage. Shield's developers cannot see it, recover it, or freeze your funds. If you lose your seed phrase and your device is wiped, the funds are gone — same model as MetaMask, Phantom, or any other non-custodial wallet.

### How is Shield different from MetaMask or Phantom?

Three things:

1. **Two balances per asset.** Every token has a *public* balance and a *private* balance. You can move between them with one tap. MetaMask and Phantom have one balance per asset; on Aleo, "private" is a first-class concept built into the chain.
2. **Local proof generation (or delegated).** Aleo transactions include a zero-knowledge proof: a cryptographic receipt that proves the transaction followed the program rules without revealing private details. Shield can generate that proof on your device or delegate the computation to a remote prover — you choose under `Settings → Security → Proving mode`.
3. **Cross-chain swap as a privacy on-ramp.** The Swap tab lets you bring assets in from Bitcoin / Ethereum / Solana / etc. and receive their Aleo-side equivalents (often privacy-shielded). It is one-way *into* Aleo's privacy, not a generic DEX.

### Is Shield free?

Installing and using Shield costs nothing. You pay normal Aleo network fees on transactions (paid in ALEO credits) and bridge/swap fees when crossing chains. Shield itself does not charge a subscription.

---

## Public vs private balances

> The single most important Aleo concept. Every token has two balances; you choose which one to use per transaction.

### Why does my balance show two numbers — Public and Private?

On the Shield home screen, the total balance card breaks down into:

- **Public** — visible on the Aleo explorer. Anyone can see the amount and the address that holds it. Behaves like a normal ERC-20 balance.
- **Private** — encrypted on-chain. Only you (with your view key) can decrypt it. To outside observers, the balance does not exist.

Both balances belong to the same address. They are not separate accounts — they are two storage modes of the same token.

### When is my balance public vs private?

It depends on how the funds got there:

- Funds from a **faucet**, a **public transfer**, or a **public swap** arrive as public.
- Funds from a **private transfer** ("Received Privately" in your Activity log) arrive as private.
- When *you* tap the **Shield** action, you convert public → private.
- When you send privately, the change comes back as a private record.

### Can someone see my private balance on the Aleo explorer?

No. A private balance is stored as encrypted **records** on-chain. The explorer can see that *some* records exist and were modified, but not who owns them, what asset they hold, or how much. Only the holder of the matching view key (you) can decrypt them.

For the underlying mechanism, see [Aleo's records model](https://developer.aleo.org/concepts/fundamentals/records).

### What's the privacy filter (`ALL / PUBLIC / PRIVATE`) on the home screen?

It filters the asset list and the Activity tab to show only assets/transactions of that type. Useful when you want to confirm "do I have any private USDC?" without scrolling.

---

## The four home buttons: Send, Receive, Shield, Swap

The Shield home screen has four primary actions. Here's what each does and when to use it.

### What does Send do?

Sends a token to another Aleo address. You'll be asked to choose:

- **Token** (ALEO, USDC, USDT, USAD, USDCX, or any other asset Shield supports)
- **Mode** — public or private:
  - **Public**: amount, sender, and recipient are visible on the explorer.
  - **Private**: nothing is visible to outside observers — not the amount, not who you sent to.
- **Amount**
- **Recipient address**

A private send produces an encrypted record for the recipient and a change record for you. The transaction appears in your Activity as "Sent Privately" with the amount visible only to you.

### What does Receive do?

Shows your Aleo address and a QR code. **Your address is the same for public and private transfers** — the sender chooses the mode. You don't need a different address to receive privately.

### What does the Shield button do?

Tapping `SHIELD` converts a **public** balance into a **private** balance for the same token. The funds stay yours, on the same address — but they move from the visible public ledger into encrypted records.

You'll typically use Shield right after:

- Receiving funds from a centralized exchange (which can only send public)
- Receiving the output of a swap (most chains' swap legs land as public)
- Withdrawing from a faucet

The reverse (private → public) is sometimes called "unshielding" and is done via the Send flow with mode set to public.

A Shield action costs a network fee, paid in ALEO. It also requires a zero-knowledge proof — see [Proving mode](#what-is-proving-mode-delegated-vs-local) for what that means for speed.

### What does Swap do?

Swap is Shield's cross-chain on-ramp. It takes assets from external chains (Bitcoin, Ethereum, Solana, Arbitrum, Base, BSC, Tron, Monero, Zcash) and returns Aleo-side assets — often privacy-shielded. Full details in [Cross-chain swaps](#cross-chain-swaps-beta).

> Swap is currently labelled `BETA` in `Settings → Preferences → Swaps`. You can disable it with that toggle.

---

## Activity and "Joined Records"

### Why does my Activity log say "Joined 2 Records"?

Aleo private balances are stored as discrete encrypted records — not a single mutable balance. If you have private balances of, say, 50 ALEO + 37.5 ALEO, that's two records, even though Shield shows the sum (87.5 ALEO).

When you spend more than a single record holds, Shield "joins" two or more records into one new record.

> **No funds are lost.** `Joined 2 Records (87.5 ALEO)` means "two of your records were merged into a single 87.5-ALEO record so a future spend has enough in one piece." It's housekeeping, not a transfer.

The default `Record management → Automatic` setting handles this for you. If you switch to manual, you'll be asked to choose records to join before some sends.

### Why do private transactions show "Sent Privately" or "Received Privately" with no amount?

That's exactly the point of private mode: the amount is encrypted on-chain. Outside observers see only that *something* happened. Inside Shield, you see the amount because Shield decrypts your records using your view key locally.

### What does the `ACCEPTED` label mean on a transaction?

Aleo transactions go through proof verification on-chain before they finalize. `ACCEPTED` means the network verified the zero-knowledge proof and committed the transaction to a block. If a proof fails verification, you'd see a different status (rare under normal use — Shield generates valid proofs).

---

## Cross-chain swaps (BETA)

> Shield's swap is a **one-way privacy on-ramp**, not a generic DEX. In the swap screen, `From` means **the asset and source chain you spend**. `To` means **the Aleo-side asset you receive in Shield**.

### What is the simple mental model?

Read the swap form left to right:

| Field | Meaning | Example |
|-------|---------|---------|
| **From** | What you pay with, and where that asset starts | `BTC` on Bitcoin, `USDC` on Arbitrum, `SOL` on Solana |
| **To** | What lands in your Shield wallet on Aleo | `ALEO`, `USDCX`, `ETH` on Aleo, `WBTC` on Aleo |

So `BTC → ALEO` means: spend BTC on Bitcoin, receive an Aleo-side asset in Shield. It does **not** mean Shield is a universal bridge from Aleo back out to Bitcoin.

### What chains and tokens can I swap from?

The `From` side is the source of funds. Most entries are external-chain assets; some stablecoin/bridged-token entries may also list Aleo-side versions if Shield exposes them in the picker.

| Asset | Source chains |
|-------|---------------|
| **BTC** | Bitcoin mainnet |
| **ETH** | Ethereum mainnet |
| **SOL** | Solana native |
| **TRX** | Tron native |
| **BNB** | Binance Smart Chain |
| **XMR** | Monero mainnet |
| **ZEC** | Zcash mainnet |
| **USDC** | Aleo (via Hyperlane), Arbitrum, Base, Ethereum, Solana |
| **USDT** | Aleo, Arbitrum, Base, BSC (Binance-Peg), Ethereum, Tron |
| **WBTC** | Aleo (via Hyperlane), Arbitrum, Base, Ethereum |
| **USAD** | Aleo |
| **USDCX** | Aleo |

### What can I swap to?

The `To` side is **Aleo-only**:

| Asset | Notes |
|-------|-------|
| **ALEO**  | Native token |
| **USAD**  | Paxos-issued stablecoin on Aleo |
| **USDCX** | Circle-issued stablecoin on Aleo |
| **USDC**  | USDC on Aleo via Hyperlane |
| **USDT**  | USDT on Aleo |
| **ETH**   | Bridged to Aleo via Hyperlane |
| **WBTC**  | Bridged to Aleo via Hyperlane |
| **WSOL**  | SOL bridged to Aleo via Hyperlane |

### Why is the "to" side Aleo-only?

Because Shield's swap is a **privacy on-ramp**, not a generic DEX. Its job is to get you from a public asset on another chain into an Aleo-side asset where you can use Aleo's privacy features. Going *out* of Aleo to another chain is a separate flow (typically: send the Aleo-side bridged asset to a Hyperlane bridge contract, then operate on the destination chain).

### What does "via Hyperlane" mean?

[Hyperlane](https://www.hyperlane.xyz/) is a cross-chain messaging and bridging protocol. In plain English: it is infrastructure that lets one chain tell another chain, "this user locked or moved an asset over here; mint or release the matching asset over there."

When you see "ETH bridged to Aleo via Hyperlane," it means the Ethereum-side asset is represented by a matching Aleo-side token. You hold the Aleo-side token in Shield; the bridge infrastructure handles the cross-chain accounting.

### Is Hyperlane the same thing as the swap service?

Not exactly. A bridge protocol such as Hyperlane moves messages/assets between chains. A swap or routing service decides what route/quote to use when you trade one asset for another. Shield's UI abstracts those details into one Swap flow. The screenshot-verifiable point is: Shield labels several target assets as "via Hyperlane," and the `To` side is an Aleo-side asset in Shield.

Because swap routing can change over time, treat Shield's confirmation screen as the source of truth for the exact provider, fees, route, and estimated arrival time before you approve a swap.

### What is slippage and why is it set to 1% by default?

Slippage is how much the swap rate is allowed to move between when you confirm and when the swap executes. `1%` means: if the price moves more than 1% against you in the meantime, the swap fails rather than executing at a worse rate. For volatile pairs (small caps, large amounts), increase it; for stablecoin → stablecoin, you can lower it.

### Are swaps fully private?

Partial. The **Aleo-side leg** of the swap can land in a private balance (use the Shield action right after if it doesn't). But the **source-chain leg** is public on its source chain — a Bitcoin → ALEO swap will leave a Bitcoin transaction on the Bitcoin mempool that anyone can see.

If full source-chain privacy matters, start from a privacy chain (XMR, ZEC) on the From side.

---

## Settings → Security

### What is Lock timeout?

`Settings → Security → Lock timeout` (default `15 minutes`) controls how long Shield stays unlocked before requiring your password again. Shorter is safer (auto-locks faster if you walk away from your computer); longer is more convenient. You can also tap `Lock wallet` from the Settings menu to lock immediately.

### What is Proving mode (Delegated vs Local)?

Every Aleo transaction includes a zero-knowledge proof, and someone has to generate it.

A proof is like a cryptographic receipt. It lets the Aleo network verify, "this transaction followed the program rules," without forcing the wallet to reveal every private input behind the transaction. For private sends, that is what lets the chain accept the transaction while keeping private records encrypted.

Generating that proof is computational work. It can be fast on a server and slow in a browser, which is why Shield gives you a setting:

| Mode | Speed | Privacy | When to pick |
|------|-------|---------|--------------|
| **Delegated** *(default)* | Fast (~1.5s on testnet) | Remote prover sees the function name and public inputs but **never your private key** | Most users. Works on any device. |
| **Local** | Slow (often minutes per tx) | No third-party server touches your transaction at all | You have a hard requirement that no remote service sees what function you're calling |

In Delegated mode, Shield uses Provable's [Delegated Proving Service](https://developer.aleo.org/sdk/delegate-proving/delegate_proving/). The wallet still signs locally — proving is the only step that is offloaded.

### What is Record management (Automatic vs Manual)?

`Settings → Security → Record management` controls how Shield picks which private records to spend on a transaction. As covered in [Joined Records](#why-does-my-activity-log-say-joined-2-records), private balances are made of multiple records.

- **Automatic** *(default)* — Shield picks records and joins them as needed. Just works.
- **Manual** — Before each private spend, Shield asks you to choose the records to consume. Mostly useful for advanced users who want fine control over their record set (e.g., to keep certain records separate for accounting reasons).

### What are Proving Keys, and why download them?

Aleo uses a Universal Setup (no per-circuit ceremony), but each program still needs a proving key — a static, multi-megabyte file. Generating a proof requires the matching key.

- `Download Proving Keys` (toggle, on by default) — Shield prefetches keys for common programs in the background so the first time you use them is instant.
- `View Proving Keys` — lets you see which keys are cached locally.

If you care about disk space, you can disable the toggle; the trade-off is the first transaction touching a new program will pause to fetch the key.

### What does Reset wallet do? Will I lose my funds?

`Settings → Security → DANGER ZONE → Reset wallet` deletes Shield's local state on this device: private keys, cached records, settings.

> **Your funds on-chain are not deleted** — they're recoverable from your seed phrase. But if you reset without your seed phrase backed up, you lose the funds permanently.

Use Reset wallet only when:

- You're moving to a new device and have your seed phrase.
- You're disposing of a device and want Shield's data wiped.
- The wallet is misbehaving and Shield's Help Center has told you to reset.

---

## Settings → Preferences

### How do I revoke a dApp's access?

`Settings → Preferences → Connected dApps` lists every site that has connected to Shield. Tap a dApp to disconnect. The next time that site requests a connection, it'll have to ask again.

### What are Bookmarked addresses for?

`Settings → Preferences → Bookmarked addresses` is your address book — labels for Aleo addresses you send to often, so you don't have to paste a 63-character address every time. They're stored locally; nothing is shared.

### What does Show zero balances do?

`Settings → Preferences → Show zero balances` (toggle) controls whether assets you hold zero of show up in your asset list. Off by default to keep the list short; turn on if you want to see the full token universe Shield supports.

### What is Wallet View → Side Panel?

`Settings → Preferences → Wallet View → Side Panel` opens Shield as a persistent docked panel on the side of your browser window instead of a floating popup. Useful when you're moving between dApps and want the wallet always visible.

### How do I switch between mainnet and testnet?

`Settings → Preferences → Network → Mainnet`. Tap to switch. Each network has its own balance — testnet ALEO is not the same as mainnet ALEO, and program IDs differ (e.g., the test Circle stablecoin is `test_usdcx_stablecoin.aleo` instead of `usdcx_stablecoin.aleo`). Get testnet ALEO from a faucet such as <https://faucet.provable.com/>.

### Should I disable Analytics?

`Settings → Security → Analytics` is on by default; the description reads *"We use anonymous analytics to improve Shield."* If you'd rather Shield collect nothing, turn it off — wallet functionality is unaffected.

### What is the Swaps BETA toggle?

`Settings → Preferences → Swaps` (with the orange `BETA` chip) controls whether the `Swap` button appears on the home screen. Off-by-default for users who want the wallet to behave as a pure Aleo wallet without the cross-chain UI. See [Cross-chain swaps](#cross-chain-swaps-beta) for the BETA caveat.

---

## Multi-wallet and multi-account

### What's the difference between a wallet and an account?

`Manage Wallets` shows that Shield can hold multiple **wallets**, and each wallet can hold multiple **accounts**:

- **Wallet** — a seed phrase. Each wallet has its own seed; losing it = losing every account inside it.
- **Account** — an address derived from a wallet's seed. Multiple accounts under one seed share recovery (one seed phrase backs all of them).

Use multiple **accounts** to separate funds for different purposes (e.g., personal vs side-project) without juggling seed phrases. Use multiple **wallets** when you want full isolation — for example, a hot wallet with small balances and a "cold" wallet with savings, each backed up separately.

### When should I add an account vs add a wallet?

- **Add account** — same backup, different identity. You can hold both in Shield without re-entering a seed phrase.
- **Add wallet** — different backup. Useful if you want to hold a hardware-wallet-derived address alongside a hot wallet, or if a friend hands you their seed phrase to use temporarily.

### Are accounts in the same wallet linked publicly?

On-chain, Aleo addresses are independent — there's no public link between two accounts under the same seed. But anyone watching your **public** transaction history could correlate timing and amounts. If unlinkability matters, keep funds private and avoid moving them between accounts publicly.

---

## Privacy and disclosure

### What can someone see about me on the Aleo explorer?

For each address, the explorer shows:

- **Public balance** of every token at that address.
- **Public transactions** (sender, recipient, amount).
- **Existence** of private records associated with that address (count, but not contents).
- **Program calls** (which functions you invoked), along with public inputs.

It does **not** show:

- Private balances or amounts.
- Recipients of private transfers (beyond knowing *some* private record was created).
- Anything that requires your view key.

### When does Shield ask me to share a view key?

Some advanced flows (compliance attestations, dApps that need to read your records to display balances) ask Shield to disclose specific records via a view key handshake. Shield prompts you each time.

> **General principle:** don't share your view key unless the dApp's purpose justifies it — once disclosed, you cannot revoke that share for past records.

### Is my private balance recoverable if I lose my device?

Yes. Your seed phrase regenerates the private key, which regenerates the view key, which decrypts your records on-chain. As long as the records still exist on the Aleo network (and they do, indefinitely, until spent) and you have your seed, you have your funds.

---

## Security and recovery

### Where is my private key stored?

Encrypted in the browser extension's local storage, on your device. The encryption key is derived from your Shield password. The key never leaves your device — Shield's developers cannot access it.

### How do I back up my wallet?

When you create a wallet, Shield shows a 12- or 24-word seed phrase exactly once.

> **Write it down on paper, store it offline.** Never paste it into a website, email, screenshot, or password manager that syncs to a third-party cloud. Anyone with the seed phrase has full control of every account in that wallet.

### What if I lose my password?

The password unlocks the local encrypted store. If you forget it, you have to `Reset wallet` and re-import from the seed phrase. **No password recovery exists** — Shield does not have your password to send you.

### Is there a hardware-wallet option?

Per the screenshots verified in v1.18.0, Shield does not yet expose a hardware-wallet integration. Check the Help Center (`Settings → Help Center`) for the latest status.

### Does Shield support biometrics?

The current `Settings → Security` panel exposes Lock timeout but does not list a biometric toggle. Security on a browser extension typically depends on your OS-level account / browser session protection. Use a strong device password.

---

## Troubleshooting

### A transaction is "still proving" — why is it slow?

Aleo transactions require a zero-knowledge proof. If you're in `Local` proving mode, a single transaction can take several minutes to compute on a typical laptop. Switching to `Delegated` (default) usually drops this to a couple of seconds. For the trade-off, see [Proving mode](#what-is-proving-mode-delegated-vs-local).

### My balance hasn't updated after a transfer.

Three things to check:

1. The transaction's status in `Activity` — it must be `ACCEPTED`.
2. Tap the **refresh icon** at the top right of the home screen.
3. If you're viewing private balances, Shield re-scans your records on each load. A large account can take a few seconds.

If the transaction is `ACCEPTED` but the balance still doesn't reflect it after a refresh, lock and unlock the wallet to force a re-scan.

### A dApp won't connect.

Common causes:

- The dApp expects an older wallet adapter that Shield doesn't expose. Check the dApp's docs for "supported wallets."
- You're on the wrong network — verify `Settings → Preferences → Network`.
- An old session is stuck. Disconnect via `Settings → Preferences → Connected dApps`, then reconnect.

### A swap is stuck.

Cross-chain swaps involve the source chain, a bridge, and Aleo. Any leg can be slow:

- Bitcoin / Monero / Zcash legs depend on source-chain block times (10+ minutes for BTC).
- Hyperlane bridge messages typically deliver within minutes but can be longer during congestion.
- The Aleo-side leg requires a proof — see proving-mode notes above.

Wait at least the source-chain finality window before contacting support. If still stuck, file a ticket via `Settings → Help Center`.

---

## Where to go next

- **In-wallet help** — `Settings → Help Center → Visit support center` for product support, known issues, and the latest feature updates.
- **Building an Aleo dApp?** Read the [Developer Integration Guide](./DEVELOPERS.md).
- **Aleo developer docs** — <https://developer.aleo.org>
- **Aleo explorer** — <https://explorer.provable.com> (mainnet) · <https://testnet.explorer.provable.com> (testnet)
- **Faucet (testnet)** — <https://faucet.provable.com/>
- **Hyperlane** — <https://www.hyperlane.xyz/> for the bridge protocol Shield uses.

---

*Last verified against Shield v1.18.0 — April 2026. Wallet behavior may change; if a screen no longer matches this guide, please open an issue.*
