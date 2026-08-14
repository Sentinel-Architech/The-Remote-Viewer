/**
 * TRV governance Anchor tests — SCAFFOLD.
 * Run: cd solana && yarn && anchor test
 * Requires build host / CI (not Termux).
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

describe("trv_governance", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.TrvGovernance as Program;
  const authority = provider.wallet as anchor.Wallet;

  const configPda = () =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("trv-config")],
      program.programId
    )[0];

  it("initialize → register_node → propose → vote → execute", async () => {
    const threshold = new anchor.BN(10);
    const config = configPda();

    await program.methods
      .initialize(threshold)
      .accounts({
        config,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-node"), authority.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerNode()
      .accounts({
        config,
        node: nodePda,
        operator: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const node = await program.account.node.fetch(nodePda);
    assert.isTrue(node.active);

    const desc = Buffer.alloc(32, 7);
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-proposal"), desc],
      program.programId
    );

    await program.methods
      .propose([...desc] as any)
      .accounts({
        config,
        proposal: proposalPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const [voteRecordPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("trv-vote"),
        proposalPda.toBuffer(),
        authority.publicKey.toBuffer(),
      ],
      program.programId
    );

    await program.methods
      .vote(new anchor.BN(10))
      .accounts({
        config,
        proposal: proposalPda,
        voteRecord: voteRecordPda,
        voter: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .executeIfThreshold()
      .accounts({
        config,
        proposal: proposalPda,
        authority: authority.publicKey,
      })
      .rpc();

    const prop = await program.account.proposal.fetch(proposalPda);
    assert.isTrue(prop.executed);
    assert.isFalse(prop.cancelled);
  });

  it("cancel_proposal blocks execute", async () => {
    const config = configPda();
    const desc = Buffer.alloc(32, 9);
    const [proposalPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-proposal"), desc],
      program.programId
    );

    await program.methods
      .propose([...desc] as any)
      .accounts({
        config,
        proposal: proposalPda,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .cancelProposal()
      .accounts({
        config,
        proposal: proposalPda,
        authority: authority.publicKey,
      })
      .rpc();

    const prop = await program.account.proposal.fetch(proposalPda);
    assert.isTrue(prop.cancelled);

    let failed = false;
    try {
      await program.methods
        .executeIfThreshold()
        .accounts({
          config,
          proposal: proposalPda,
          authority: authority.publicKey,
        })
        .rpc();
    } catch {
      failed = true;
    }
    assert.isTrue(failed, "execute should fail on cancelled proposal");
  });

  it("grant_subscription + refresh_entitlement", async () => {
    const config = configPda();
    const user = authority.publicKey;

    const [subPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-sub"), user.toBuffer()],
      program.programId
    );
    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-node"), user.toBuffer()],
      program.programId
    );
    const [entPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-ent"), user.toBuffer()],
      program.programId
    );

    const expires = Math.floor(Date.now() / 1000) + 365 * 24 * 3600;

    await program.methods
      .grantSubscription(new anchor.BN(expires))
      .accounts({
        config,
        subscription: subPda,
        subscriber: user,
        authority: user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .refreshEntitlement()
      .accounts({
        node: nodePda,
        subscription: subPda,
        entitlement: entPda,
        user,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const ent = await program.account.entitlement.fetch(entPda);
    assert.isTrue(ent.unlimitedComms);
  });
});
