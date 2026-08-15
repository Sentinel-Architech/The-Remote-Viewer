/**
 * TRV entitlement smoke — SCAFFOLD.
 * Run on build host after `anchor build` + local validator or devnet deploy.
 *
 *   cd solana && npx ts-node scripts/smoke-entitlement.ts
 *
 * Requires ANCHOR_PROVIDER_URL + ANCHOR_WALLET (or Anchor.toml provider).
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TrvGovernance as Program;
  const authority = provider.wallet as anchor.Wallet;

  const [config] = PublicKey.findProgramAddressSync(
    [Buffer.from("trv-config")],
    program.programId
  );

  const threshold = new anchor.BN(1);
  console.log("initialize…", config.toBase58());
  try {
    await program.methods
      .initialize(threshold)
      .accounts({
        config,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  } catch (e) {
    console.log("initialize skipped or failed (may already exist):", e);
  }

  const user = authority.publicKey;
  const [sub] = PublicKey.findProgramAddressSync(
    [Buffer.from("trv-sub"), user.toBuffer()],
    program.programId
  );
  const [node] = PublicKey.findProgramAddressSync(
    [Buffer.from("trv-node"), user.toBuffer()],
    program.programId
  );
  const [ent] = PublicKey.findProgramAddressSync(
    [Buffer.from("trv-ent"), user.toBuffer()],
    program.programId
  );

  const expires = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;
  console.log("grant_subscription…", sub.toBase58());
  await program.methods
    .grantSubscription(new anchor.BN(expires))
    .accounts({
      config,
      subscription: sub,
      subscriber: user,
      authority: user,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  // register node so refresh_entitlement accounts exist
  try {
    await program.methods
      .registerNode()
      .accounts({
        config,
        node,
        operator: user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
  } catch (e) {
    console.log("register_node skipped:", e);
  }

  console.log("refresh_entitlement…", ent.toBase58());
  await program.methods
    .refreshEntitlement()
    .accounts({
      node,
      subscription: sub,
      entitlement: ent,
      user,
      systemProgram: SystemProgram.programId,
    })
    .rpc();

  const account = await program.account.entitlement.fetch(ent);
  console.log("unlimited_comms=", account.unlimitedComms);
  if (!account.unlimitedComms) {
    throw new Error("expected unlimited_comms true");
  }
  console.log("smoke OK");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
