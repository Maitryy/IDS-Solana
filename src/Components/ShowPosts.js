import axios from "axios";
import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "react-bootstrap";
import "./ShowPosts.css";
import "./form.css";
import { Keypair, SystemProgram, PublicKey } from "@solana/web3.js";

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
                      onClick={() => {
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
                          console.log("file_id:", file_id.toString());
                          console.log(
                            "purchased file:",
                            purchased_file.publicKey.toString()
                          );
                          contract.rpc.buyFile(from_row, to_row, selected_idx, {
                            accounts: {
                              buyer: purchased_file.publicKey.toString(),
                              seller: file_id.toString(),
                              author: account,
                              systemProgram: SystemProgram.programId,
                            },
                            signers: [purchased_file],
                          }).then((data) => {
                            console.log("yee haw!", data);
                          });

                          for (var i = from_row; i <= to_row; i++) {
                            for (var j = 0; j < selected_idx.length; j++) {
                              var taken_key =
                                (i - 1) * post.col + selected_idx[j];
                              console.log("taken key ", post.keys[taken_key]);
                            }
                          }
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
