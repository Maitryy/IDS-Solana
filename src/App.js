import React, { useEffect, useState } from "react";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";
import { Program, Provider, web3 } from "@project-serum/anchor";
import idl from "./idl.json";
import "./App.css";
import LandingPage from "./Components/LandingPage.js";

const { SystemProgram, Keypair } = web3;
let baseAccount = Keypair.generate();
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl("devnet");
const opts = {
  preflightCommitment: "processed",
};

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [contract, setContract] = useState(null);

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection,
      window.solana,
      opts.preflightCommitment
    );
    return provider;
  };

  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          const response = await solana.connect();
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert("Solana object not found! Get a Phantom Wallet 👻");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const connectWallet = () => {};

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const getSmartContract = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      setContract(program);
    } catch (error) {
      console.log("Error in getSmartContract: ", error);
      setContract(null);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      console.log("Fetching Smart Contract -_<");
      getSmartContract();
    }
  }, [walletAddress]);

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener("load", onLoad);
    return () => window.removeEventListener("load", onLoad);
  }, []);

  return (
    <div className="container">
      <div>
        {!walletAddress ? (
          renderNotConnectedContainer()
        ) : (
          <LandingPage account={walletAddress} contract={contract} />
        )}
      </div>
    </div>
  );
};

export default App;
