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

  it("initialize → register_node → propose → vote → execute_if_threshold", async () => {
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

    const [nodePda] = PublicKey.findProgramAddressSync(
      [Buffer.from("trv-node"), authority.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .registerNode()
      .accounts({
        config: configPda,
        node: nodePda,
        operator: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const node = await program.account.node.fetch(nodePda);
    assert.isTrue(node.active);
    assert.equal(node.operator.toBase58(), authority.publicKey.toBase58());

    const cfg = await program.account.governanceConfig.fetch(configPda);
    assert.equal(cfg.nodeCount.toNumber(), 1);

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
        config: configPda,
        proposal: proposalPda,
        voteRecord: voteRecordPda,
        voter: authority.publicKey,
        systemProgram: SystemProgram.programId,
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

    const record = await program.account.voteRecord.fetch(voteRecordPda);
    assert.equal(record.weight.toNumber(), 10);
  });
});
