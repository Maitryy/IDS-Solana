import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Container } from "react-bootstrap";
import "./ShowPosts.css";
import "./form.css";
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
                          <h3> Rows available :{post.row}</h3>
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
                        var fetched_file_data;
                        if (from_row <= 0 || to_row > post.row) {
                          alert("enter rows again");
                          return;
                        } else if (selected_options.length == 0) {
                          alert("click columns again");
                          return;
                        } else {
                          for (var i = 0; i < selected_options.length; i++) {
                            var s1 = selected_options[i].text;
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
                                lamports: LAMPORTS_PER_SOL,
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
                                contract.rpc
                                  .buyFile(from_row - 1, to_row, selected_idx, {
                                    accounts: {
                                      buyer:
                                        purchased_file.publicKey.toString(),
                                      seller: file_id.toString(),
                                      author: account,
                                      systemProgram: SystemProgram.programId,
                                    },
                                    signers: [purchased_file],
                                  })
                                  .then((data) => {
                                    contract.account.file
                                      .fetch(purchased_file.publicKey)
                                      .then((fetched_data) => {
                                        fetched_file_data = fetched_data.data;
                                        var file_idx = 0;
                                        var decrypted =
                                          "data:text/csv;charset=utf-8,";
                                        console.log(fetched_file_data);
                                        for (
                                          var i = from_row;
                                          i <= to_row;
                                          i++
                                        ) {
                                          for (
                                            var j = 0;
                                            j < selected_idx.length;
                                            j++
                                          ) {
                                            var taken_key =
                                              (i - 1) * post.col +
                                              selected_idx[j];
                                            // console.log("taken key ", post.keys[taken_key]);
                                            var tmp = CryptoJS.AES.decrypt(
                                              fetched_file_data[file_idx],
                                              post.keys[taken_key]
                                            );
                                            file_idx++;
                                            var tmp2 = JSON.parse(
                                              tmp.toString(CryptoJS.enc.Utf8)
                                            );
                                            decrypted += tmp2;
                                            decrypted += ",";
                                          }
                                          decrypted += "\n";
                                        }
                                        var encodedUri = encodeURI(decrypted);
                                        var link = document.createElement("a");
                                        link.setAttribute("href", encodedUri);
                                        link.setAttribute(
                                          "download",
                                          "dummy_riya.csv"
                                        );
                                        document.body.appendChild(link); // Required for FF
                                        link.click(); // This will download the data file named "my_data.csv".
                                      });
                                  });
                              });
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
