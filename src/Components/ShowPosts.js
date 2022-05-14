import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Container } from "react-bootstrap";
import "./ShowPosts.css";
import "./form.css";
import { create } from "ipfs-http-client";

import {
  Keypair,
  SystemProgram,
  PublicKey,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import * as web3 from "@solana/web3.js";
import CryptoJS from "crypto-js";
const { LAMPORTS_PER_SOL } = require("@solana/web3.js");
const fs = require("fs")
var chunk_str = "";


const ShowPosts = ({ account, contract }) => {
  const [data, setData] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const response = await fetch("http://localhost:5000/route/getAllPosts");
      var data = await response.json();
      setData(data);
    }
    fetchData();
  }, []);

  function showText(toggleText) {
    toggleText.classList.toggle("active");
  }

  async function ipfsClient() {
    const ipfs = await create(
        {
            host: "ipfs.infura.io",
            port: 5001,
            protocol: "https"
        }
    );
    return ipfs;
}

async function saveText() {
  let ipfs = await ipfsClient();

  let result = await ipfs.add(`welcome ${new Date()}`);
  console.log(result);
}
// saveText();

// async function saveFile() {

//   let ipfs = await ipfsClient();

//   let data = fs.readFileSync("./package.json")
//   let options = {
//       warpWithDirectory: false,
//       progress: (prog) => console.log(`Saved :${prog}`)
//   }
//   let result = await ipfs.add(data, options);
//   console.log(result)
// }
// saveFile()

async function getData(hash) {
  let ipfs = await ipfsClient();

  let asyncitr = ipfs.cat(hash)
  var data="";
  for await (const itr of asyncitr) {

      data += Buffer.from(itr).toString()
      // console.log(data)
  }
  console.log(data, "data");
  // fetched_file_data = data;
  chunk_str = data;
}

  return (
    <div>
      <br />
      <br />
      <div className="one container">
        <h1>Posts Available..</h1>
      </div>
      <div className="row row-cols-3">
        {data.map((post, i) => {
          var options = post.col_title.split(",");
          const options_idx = new Map();

          for (var i = 0; i < options.length; i++) {
            options_idx.set(options[i], i);
          }

          var selected_idx = [];
          var selected_options = [];
          var selected_rows;
          var from_row;
          var to_row;

          return (
            <div className="col-lg-4 col-md-6 col-sm-12 col-12">
              <div className="category-name"></div>
              <div className="card-category-1">
                <div className="basic-card basic-card-aqua">
                  <div className="card-content">
                    <strong>
                      <span className="card-title">{post.title}</span>
                    </strong>
                    <p className="card-text">
                      Description : {post.description}
                    </p>
                    <a href="#" title="Read Full">
                      <span>Keywords: {post.keywords}</span>
                    </a>
                  </div>

                  <div className="card-link">
                    <table>
                      <tr>
                        <th>
                          <label for="colss" style={{ color: "white" }}>
                            Columns available :{post.col}
                          </label>
                          <br />

                          <select
                            name="cars"
                            id="cars"
                            multiple
                            onChange={(e) => {
                              selected_options = [...e.target.selectedOptions];
                            }}
                          >
                            {options.map((name) => {
                              return <option name={name}>{name}</option>;
                            })}
                          </select>
                        </th>
                        <th>
                          <h3 style={{color:"white"}}> Rows available :{post.row}</h3>
                          <label for="rowss" style={{ color: "white" }}>
                            Enter starting row:
                          </label>
                          <br />
                          <input
                            type="number"
                            id="rows-selected"
                            onChange={(e) => {
                              from_row = e.target.value;
                            }}
                          />
                          <label for="rowss" style={{ color: "white" }}>
                            Enter ending row:
                          </label>
                          <br />
                          <input
                            type="number"
                            id="rows-selected"
                            onChange={(e) => {
                              to_row = e.target.value;
                            }}
                          />
                        </th>
                      </tr>
                    </table>
                  </div>

                  <div className="btn-center">
                    <button
                      className="button"
                      onClick={async () => {
                        var fetched_file_data, fetched_file_hash;
                        if (from_row <= 0 || to_row > post.row) {
                          alert("enter rows again");
                          return;
                        } else if (selected_options.length == 0) {
                          alert("click columns again");
                          return;
                        } else {
                          for (var i = 0; i < selected_options.length; i++) {
                            var s1 = selected_options[i].text.toString();
                            var x = options_idx.get(s1);
                            selected_idx.push(x);

                          }
                          var purchased_file = Keypair.generate();
                          var file_id = new PublicKey(post._id);
                          // var file_author = new PublicKey(post.author);
                          // console.log(post.author);
                          (async () => {
                            // Connect to cluster
                            // console.log(web3.clusterApiUrl("devnet"));
                            const connection = new web3.Connection(
                              web3.clusterApiUrl("devnet"),
                              "confirmed"
                            );
                            let fromKeypair = new PublicKey(account);
                            let toKeypair = new PublicKey(post.author);
                            let transaction = new Transaction();

                            transaction.add(
                              SystemProgram.transfer({
                                fromPubkey: fromKeypair,
                                toPubkey: toKeypair,
                                lamports: 0.1*LAMPORTS_PER_SOL*(to_row-from_row)+0.1*LAMPORTS_PER_SOL*(selected_options.length),
                              })
                            );
                            const blockHash =
                              await connection.getLatestBlockhash();
                            transaction.feePayer = fromKeypair;
                            transaction.recentBlockhash =
                              await blockHash.blockhash;

                            const { signature } =
                              await window.solana.signAndSendTransaction(
                                transaction
                              );
                            await connection
                              .confirmTransaction(signature)
                              .then(() => {
                                // contract.rpc
                                //   .buyFile(from_row - 1, to_row, selected_idx, {
                                //     accounts: {
                                //       buyer:
                                //         purchased_file.publicKey.toString(),
                                //       seller: file_id.toString(),
                                //       author: account,
                                //       systemProgram: SystemProgram.programId,
                                //     },
                                //     signers: [purchased_file],
                                //   })
                                //   .then((data) => {
                                    contract.account.file
                                      // .fetch(purchased_file.publicKey)
                                      .fetch(file_id)
                                      .then( async (fetched_data) => {
                                        // fetched_file_data = fetched_data.data;
                                        fetched_file_hash = fetched_data.hash;
                                        // (async () => {
                                        // console.log(await getData())
                                        await getData(fetched_file_hash)
                                        
                                        // console.log("hash", hash_ipfs);
                                        console.log(chunk_str, "chunk_str");
                                        var chunk_arr = chunk_str.split(',')
                                        fetched_file_data = []
                                        
                                        var n_rows = to_row - from_row + 1;
                                        var n_cols = selected_idx.length;
                                        // for( var i = 0; i<n_rows; i++)
                                        // {
                                        //   for(var j=0; j<n_cols; j++)
                                        //   {
                                        //     fetched_file_data.push(chunk_arr[(from_row-1 +i)*(fetched_data.ncols) + selected_idx[j]]);
                                        //   }
                                        // }
                                        // fetched_file_data.push("priti");
                                        var file_idx = 0;
                                        var decrypted =
                                          "";
                                        for (var i = parseInt(from_row); i <= parseInt(to_row); i++)
                                         {
                                          for (var j = 0; j < selected_idx.length; j++) 
                                           {
                                            try
                                            {
                                              var taken_key = (i - 1) * post.col + selected_idx[j];
                                              var tmp = CryptoJS.AES.decrypt(
                                                chunk_arr[taken_key],
                                                post.keys[taken_key]
                                              );
                                              
                                              file_idx++;
                                              var tmp2 = JSON.parse(
                                                tmp.toString(CryptoJS.enc.Utf8)
                                              );
                                              console.log(tmp, "tmp")
                                              decrypted += tmp2;
                                              decrypted += ",";
                                              }
                                              catch(err)
                                            {
                                              console.log(err);
                                            }
                                          }
                                          
                                          decrypted += "\n";
                                        }
                                        var downloadLink = document.createElement("a");
                                        var blob = new Blob(["\ufeff", decrypted]);
                                        var url = URL.createObjectURL(blob);
                                        downloadLink.href = url;
                                        downloadLink.download = "data.csv";

                                        document.body.appendChild(downloadLink);
                                        downloadLink.click();
                                        document.body.removeChild(downloadLink);
                                        
                                      });
                                  });
                              // });
                          })();
                        }
                      }}
                    >
                      {" "}
                      Buy Now!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default ShowPosts;
