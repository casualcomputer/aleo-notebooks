import "dotenv/config";
import {
  AleoKeyProvider,
  AleoNetworkClient,
  ProgramManager,
  buildExecutionRequestFromExternallySignedData,
  computeExternalSigningInputs,
} from "@provablehq/sdk/testnet.js";

import { ExternalSigningWallet } from "./wallet.mjs";

// ---------------------------------------------------------------------------
// Env check
// ---------------------------------------------------------------------------
for (const name of ["PROVABLE_API_KEY", "PROVABLE_CONSUMER_ID", "TESTNET_PRIVATE_KEY"]) {
  if (!process.env[name]) {
    console.error(`Missing ${name} in .env. See .env.example.`);
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// Cast of characters
// ---------------------------------------------------------------------------
//   wallet         — the USER's self-custodial signer. Holds the private key.
//                    Models Shield / Leo / hardware wallet / enclave.
//   programManager — the dApp's SDK client. Never sees the private key.
//                    Talks to DPS over HTTPS.
// ---------------------------------------------------------------------------
const wallet = new ExternalSigningWallet(process.env.TESTNET_PRIVATE_KEY);
console.log("Wallet address (user, self-custodial):", wallet.address);

const host = "https://api.provable.com/v2";
const networkClient = new AleoNetworkClient(host);
networkClient.setProverUri("https://api.provable.com/prove");

// Intentionally NO account and NO record provider on the ProgramManager.
// The dApp has no key and — for public transitions — does not need record
// lookups. For transitions with record inputs, the wallet would also return
// pre-computed record view keys / gammas alongside the signature, and the
// strategy in step [3] below would carry them.
const keyProvider = new AleoKeyProvider();
keyProvider.useCache(true);
const programManager = new ProgramManager(host, keyProvider);

// ---------------------------------------------------------------------------
// Transition to authorize: credits.aleo/transfer_public(recipient, amount)
// ---------------------------------------------------------------------------
const programId = "credits.aleo";
const functionName = "transfer_public";
const inputs = [
  "aleo1vwls2ete8dk8uu2kmkmzumd7q38fvshrht8hlc0a5362uq8ftgyqnm3w08", // recipient
  "1u64",                                                             // 1 microcredit
];
const inputTypes = ["address.public", "u64.public"];

// ---------------------------------------------------------------------------
// Step 1 — dApp: ask the SDK what will be signed.
//
// `computeExternalSigningInputs` returns the public, deterministic data a
// wallet would display to its user ("you're signing this function on this
// program with these inputs"). It's a public computation — no secret needed.
// ---------------------------------------------------------------------------
console.log("\n[1] Computing external signing inputs...");
const t1 = Date.now();
const signingInput = await computeExternalSigningInputs({
  programName: programId,
  functionName,
  inputs,
  inputTypes,
  isRoot: true,
});
console.log(`    done in ${Date.now() - t1}ms`);
console.log(`    functionId: ${signingInput.functionId}`);
console.log(`    isRoot:     ${signingInput.isRoot}`);
console.log(`    inputs:     ${signingInput.requestInputs.length} items`);

// ---------------------------------------------------------------------------
// Step 2 — dApp → wallet: request a signature.
//
// In a real dApp this is a postMessage / chrome.runtime.sendMessage round-trip.
// The wallet shows its confirmation UI, and — if the user approves — signs
// and returns {signature, tvk, signer, skTag}. The dApp never sees the key.
// ---------------------------------------------------------------------------
console.log("\n[2] Requesting signature from wallet...");
const t2 = Date.now();
const signed = wallet.signTransition({
  programId,
  functionName,
  inputs,
  inputTypes,
  isRoot: true,
});
console.log(`    wallet returned signed data in ${Date.now() - t2}ms`);
console.log(`    signer: ${signed.signer}`);
console.log(`    tvk:    ${signed.tvk.slice(0, 20)}…`);
console.log(`    skTag:  ${signed.skTag.slice(0, 20)}…`);

// ---------------------------------------------------------------------------
// Step 3 — dApp: rebuild the ExecutionRequest from the signed data.
//
// `transfer_public` has only public inputs (no records), so we use the
// default RecordViewKeyStrategy (empty object). If the function took record
// inputs, the caller would supply either pre-computed record view keys +
// gammas, or a view key, or pre-computed input IDs here.
// ---------------------------------------------------------------------------
console.log("\n[3] Building ExecutionRequest from externally-signed data...");
const t3 = Date.now();
const executionRequest = buildExecutionRequestFromExternallySignedData(
  {
    programId,
    functionName,
    inputs,
    inputTypes,
    signature: signed.signature,
    tvk: signed.tvk,
    signer: signed.signer,
    skTag: signed.skTag,
  },
  {},
);
console.log(`    done in ${Date.now() - t3}ms`);
console.log(`    programId:    ${executionRequest.programId()}`);
console.log(`    functionName: ${executionRequest.functionName()}`);

// ---------------------------------------------------------------------------
// Step 4 — dApp: wrap the ExecutionRequest into a ProvingRequest and submit
// to DPS.
//
// When `executionRequest` is passed to `provingRequest`, the SDK does NOT
// require a private key on the ProgramManager — the fee is authorized by the
// DPS "fee master" (the consumer's account) rather than the user. That's the
// key property: the user's private key never leaves the wallet.
// ---------------------------------------------------------------------------
console.log("\n[4] Building ProvingRequest and submitting to DPS...");
const t4 = Date.now();
const provingRequest = await programManager.provingRequest({
  programName: programId,
  functionName,
  priorityFee: 0,
  privateFee: false,
  broadcast: false,
  executionRequest,
});
console.log(`    ProvingRequest built in ${Date.now() - t4}ms`);

const t5 = Date.now();
const result = await networkClient.submitProvingRequestSafe({
  provingRequest,
  dpsPrivacy: true,
  apiKey: process.env.PROVABLE_API_KEY,
  consumerId: process.env.PROVABLE_CONSUMER_ID,
});
console.log(`    DPS responded in ${Date.now() - t5}ms`);

// ---------------------------------------------------------------------------
// Result
// ---------------------------------------------------------------------------
if (result.ok) {
  console.log("\n✅ Delegated proving succeeded");
  console.log(`   Transaction ID:   ${result.data.transaction?.id}`);
  console.log(`   Broadcast result: ${JSON.stringify(result.data.broadcast_result)}`);
  console.log(`\n   (broadcast: false → transaction was proven but not sent.`);
  console.log(`    Flip the flag and fund the account at https://faucet.provable.com/`);
  console.log(`    to broadcast a real transfer.)`);
} else {
  console.log("\n❌ Delegated proving failed");
  console.log(`   Status: ${result.status}`);
  console.log(`   Error:  ${result.error?.message ?? JSON.stringify(result.error)}`);
  process.exit(1);
}
