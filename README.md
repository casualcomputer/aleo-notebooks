# Aleo Notebooks

Runnable end-to-end tutorials for building on Aleo — each folder is a self-contained Node project you can clone, install, and run against Aleo testnet in under a minute.

## Tutorials

| Folder                                   | Topic                                                                 | Status    |
|------------------------------------------|-----------------------------------------------------------------------|-----------|
| [`dps-test/`](dps-test/)                 | Delegated Proving Service (DPS) — prove a `credits.aleo/transfer_public` via Provable's testnet prover | ✅ Ready |
| [`external-signing/`](external-signing/) | External signing + DPS — user holds the key, dApp never sees it, DPS generates the proof | ✅ Ready |

Each tutorial has its own README, `.env.example`, and runnable scripts. They share credentials (API key + consumer ID) — set up once in `dps-test/` and reuse. Every example uses a fresh throwaway account; never point a script at a real-funds wallet.

## Layout

```
aleo-notebooks/
├── dps-test/           # Standalone DPS walkthrough (personal-key pattern)
└── external-signing/   # Self-custody pattern — key stays in the wallet
```

## References

- Aleo developer docs: <https://developer.aleo.org/>
- Provable SDK: <https://github.com/ProvableHQ/sdk>
- Testnet explorer: <https://testnet.explorer.provable.com/>
- Faucet: <https://faucet.provable.com/>
