// Simulated external-signing wallet.
//
// This class models what a real self-custodial wallet (Shield, Leo, etc.) would
// need to expose for the external-signing → DPS flow to work end-to-end: a
// method that signs a transition without proving it, returning the four
// cryptographic outputs the SDK needs to assemble an ExecutionRequest.
//
// In production, the private key would live inside a browser extension /
// hardware wallet / secure enclave and the four outputs would be returned over
// an IPC boundary. Here, we run both sides in one Node process so the flow is
// readable in a single file — but the dApp code never reaches into
// `this.#privateKey`.

import { Account, ExecutionRequest } from "@provablehq/sdk/testnet.js";

export class ExternalSigningWallet {
  #account;

  constructor(privateKey) {
    this.#account = new Account({ privateKey });
  }

  get address() {
    return this.#account.address().to_string();
  }

  get viewKey() {
    return this.#account.viewKey().to_string();
  }

  /**
   * Sign a transition without proving it.
   *
   * A real wallet implementing this would accept the same arguments over an
   * RPC channel (window.shield.signTransition(...) or similar) and return the
   * same four-field object.
   *
   * @param {object} params
   * @param {string} params.programId            e.g. "credits.aleo"
   * @param {string} params.functionName         e.g. "transfer_public"
   * @param {string[]} params.inputs             Function inputs as strings
   * @param {string[]} params.inputTypes         e.g. ["address.public", "u64.public"]
   * @param {boolean} params.isRoot              true for the top-level transition
   * @param {boolean} [params.isDynamic=false]   true for dynamic calls
   * @param {import("@provablehq/sdk/testnet.js").Field | null} [params.rootTvk=null]
   *        The root transition's tvk (only for non-root transitions)
   * @param {import("@provablehq/sdk/testnet.js").Field | null} [params.programChecksum=null]
   *        Program checksum for programs that have a constructor
   *
   * @returns {{ signature: string, tvk: string, signer: string, skTag: string }}
   */
  signTransition({
    programId,
    functionName,
    inputs,
    inputTypes,
    isRoot,
    isDynamic = false,
    rootTvk = null,
    programChecksum = null,
  }) {
    const req = ExecutionRequest.sign(
      this.#account.privateKey(),
      programId,
      functionName,
      inputs,
      inputTypes,
      rootTvk,
      programChecksum,
      isRoot,
      isDynamic,
    );
    return {
      signature: req.signature().to_string(),
      tvk: req.tvk().toString(),
      signer: req.signer().to_string(),
      skTag: req.sk_tag().toString(),
    };
  }
}
