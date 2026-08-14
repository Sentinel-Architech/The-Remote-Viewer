/**
 * TRV governance Anchor tests — SCAFFOLD.
 * Run: cd solana && yarn && anchor test
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("trv_governance", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Program IDL name must match Anchor.toml / crate
  const program = anchor.workspace.TrvGovernance as Program;

  const authority = provider.wallet as anchor.Wallet;

  it("initialize → propose → vote → execute_if_threshold", async () => {
    const threshold = new anchor.BN(10);

    const [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-config")],
      program.programId
    );

    await program.methods
      .initialize(threshold)
      .accounts({
        config: configPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const desc = Buffer.alloc(32, 7);
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-proposal"), desc],
      program.programId
    );

    await program.methods
      .propose([...desc] as any)
      .accounts({
        config: configPda,
        proposal: proposalPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .vote(new anchor.BN(10))
      .accounts({
        config: configPda,
        proposal: proposalPda,
        authority: authority.publicKey,
      })
      .rpc();

    await program.methods
      .executeIfThreshold()
      .accounts({
        config: configPda,
        proposal: proposalPda,
        authority: authority.publicKey,
      })
      .rpc();

    const prop = await program.account.proposal.fetch(proposalPda);
    assert.isTrue(prop.executed);
    assert.equal(prop.yesVotes.toNumber(), 10);
  });
});
