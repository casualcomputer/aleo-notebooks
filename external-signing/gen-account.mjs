import { Account } from "@provablehq/sdk/testnet.js";

const account = new Account();

console.log("Throwaway Aleo testnet account (put in .env as TESTNET_PRIVATE_KEY):");
console.log();
console.log("Private key:", account.privateKey().to_string());
console.log("View key:   ", account.viewKey().to_string());
console.log("Address:    ", account.address().to_string());
console.log();
console.log("Fund it at https://faucet.provable.com/ (or https://faucet.aleo.org/)");
console.log("if you want to broadcast a real transaction. For proving-only runs");
console.log("(broadcast: false) funding is not required.");
