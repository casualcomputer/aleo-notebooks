import "dotenv/config";
import {
  Account,
  AleoKeyProvider,
  ProgramManager,
  NetworkRecordProvider,
  AleoNetworkClient,
} from "@provablehq/sdk/testnet.js";

console.log("API key present:", !!process.env.PROVABLE_API_KEY);
console.log("Consumer ID present:", !!process.env.PROVABLE_CONSUMER_ID);
console.log("Private key present:", !!process.env.TESTNET_PRIVATE_KEY);

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
console.log(`Proving request built in ${Date.now() - t0}ms`);

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
  console.log("✅ Succeeded");
  console.log("Transaction ID:", result.data.transaction?.id);
  console.log("Broadcast result:", result.data.broadcast_result);
} else {
  console.log("❌ Failed");
  console.log("Status:", result.status);
  console.log("Error:", result.error);
}
