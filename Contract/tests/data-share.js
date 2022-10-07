const assert = require("assert");
const anchor = require("@project-serum/anchor");
const { Connection } = require("@solana/web3.js");

// Need the system program, will talk about this soon.
const { SystemProgram } = anchor.web3;
const cluster = "http://localhost:8899";
const connection = new Connection(cluster, "confirmed");

describe("data-share", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());
  const program = anchor.workspace.DataShare;

  it("can upload a new file", async () => {
    // Call the "SendTweet" instruction.
    const file = anchor.web3.Keypair.generate();
    await program.rpc.addFile(4, 4, ["aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa","aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"], {
      accounts: {
        file: file.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [file],
    });

    // Fetch the account details of the created tweet.
    const fileAccount = await program.account.file.fetch(file.publicKey);

    // Ensure it has the right data.
    assert.equal(
      fileAccount.author.toBase58(),
      program.provider.wallet.publicKey.toBase58()
    );
    assert.equal(fileAccount.nrows, 4);
    assert.equal(fileAccount.ncols, 4);
    // assert.equal(fileAccount.data, ["a","a","a","a"]);
    console.log(fileAccount.data);
  });

  it("can send a new file from a different author", async () => {
    // Generate another user and airdrop them some SOL.
    const otherUser = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(
      otherUser.publicKey,
      1000000000
    );
    await program.provider.connection.confirmTransaction(signature);

    // Call the "SendTweet" instruction on behalf of this other user.
    const file = anchor.web3.Keypair.generate();
    await program.rpc.addFile(2, 2, ["a", "a", "a", "a"], {
      accounts: {
        file: file.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [otherUser, file],
    });

    // Fetch the account details of the created tweet.
    const fileAccount = await program.account.file.fetch(file.publicKey);

    assert.equal(fileAccount.author.toBase58(), otherUser.publicKey.toBase58());
    assert.equal(fileAccount.nrows, 2);
    assert.equal(fileAccount.ncols, 2);
    console.log(fileAccount.data);
    //    assert.equal(fileAccount.data, ["a","a","a","a"]);
  });

  it("can buy a file from a different author", async () => {
    const file = anchor.web3.Keypair.generate();
    await program.rpc.addFile(2, 3, ["a", "b", "c", "d", "e", "f"], {
      accounts: {
        file: file.publicKey,
        author: program.provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [file],
    });

    // Generate another user and airdrop them some SOL.

    const otherUser = anchor.web3.Keypair.generate();
    const signature = await program.provider.connection.requestAirdrop(
      otherUser.publicKey,
      1000000000
    );
    await program.provider.connection.confirmTransaction(signature);

    // Call the "SendTweet" instruction on behalf of this other user.
    const file2 = anchor.web3.Keypair.generate();
    await program.rpc.buyFile(0, 2, [0, 2], {
      accounts: {
        buyer: file2.publicKey,
        seller: file.publicKey,
        author: otherUser.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      },
      signers: [otherUser, file2],
    });
    // console.log( t);

    // Fetch the account details of the created tweet.
    const fileAccount = await program.account.file.fetch(file2.publicKey);

    // let balance = await connection.getBalance(otherUser.publicKey);
    // console.log(balance);
    // Ensure it has the right data.
    assert.equal(fileAccount.author.toBase58(), otherUser.publicKey.toBase58());
    console.log(fileAccount.data);
  });

  it("cannot buy his own data", async () => {
    try {
      const file = anchor.web3.Keypair.generate();
      await program.rpc.addFile(2, 3, ["a", "b", "c", "d", "e", "f"], {
        accounts: {
          file: file.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [file],
      });
      const file2 = anchor.web3.Keypair.generate();
      await program.rpc.buyFile(1, 2, [0, 2], {
        accounts: {
          buyer: file2.publicKey,
          seller: file.publicKey,
          author: program.provider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
        signers: [file2],
      });
    } catch (error) {
      assert.equal(error.msg, "Owner can't buy his own data.");
      return;
    }

    assert.fail(
      "The instruction should have failed if owner tried to buy his own data."
    );
    
  });
});
