import React, { useState } from "react";
import "./LandingPage.css";
import axios from "axios";
import ShowPosts from "./ShowPosts.js";
import { useNavigate, useHistory } from "react-router-dom";
import "./ShowPosts.css";
import "./form.css";
import CSVReader from "react-csv-reader";
import randomstring from "randomstring";
import CryptoJS from "crypto-js";
import { Keypair, SystemProgram, PublicKey } from "@solana/web3.js";
const { create } = require("ipfs-http-client");
const fs = require("fs")
var hash_ipfs="";

const LandingPage = ({ account, contract }) => {
  const [description, getDescription] = useState("");
  const [title, gettitle] = useState("");
  const [keyword, getkeyword] = useState("");
  const [row, getrow] = useState("");
  const [col, getcol] = useState("");
  const [file, getFile] = useState([]);
  const [keys, getkeys] = useState([]);
  const [col_title, getcol_title] = useState("");
  const [_id, get_id] = useState("");

  const history = useNavigate();
  
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


async function saveText(string_data) {
    let ipfs = await ipfsClient();
    
    let result = await ipfs.add(string_data);
    console.log(result.path, "result");
    hash_ipfs = await result.path.toString();
    // hash_ipfs = await result.path;
}
// saveText();

// async function saveFile() {

//     let ipfs = await ipfsClient();

//     let data = fs.readFileSync("./package.json")
//     let options = {
//         warpWithDirectory: false,
//         progress: (prog) => console.log(`Saved :${prog}`)
//     }
//     let result = await ipfs.add(data, options);
//     console.log(result)
// }
// saveFile()

async function getData(hash) {
    let ipfs = await ipfsClient();

    let asyncitr = ipfs.cat(hash)

    for await (const itr of asyncitr) {

        let data = Buffer.from(itr).toString()
        console.log(data, "data")
    }
}

  async function takeInfo(e) {
    e.preventDefault();

    try {
      const Post = {
        title,
        description,
        keyword,
        row,
        col,
        col_title,
        keys,
        _id,
        author: account.toString(),
      };

      if (!description || !title || !keyword || !row || !col) {
        alert("enter all");
      }

      
      const file_id = Keypair.generate();
      (async () => {
        // console.log(await getData())
        
      var post_author = new PublicKey(account);
      Post._id = file_id.publicKey.toString();
      
      var file_str = file.toString();
      console.log(contract);
        await saveText(file_str)
        
        console.log("hash", typeof(hash_ipfs));


        // getData(hash_ipfs);
        contract.rpc
        .sendFile(row, col, hash_ipfs, {
          accounts: {
            file: file_id.publicKey,  // public key
            author: post_author,  // public key -> not a string or address
            systemProgram: SystemProgram.programId,
          },
          signers: [file_id], // public key
        })
        .then(() => {
          axios
            .post("http://localhost:5000/route/posts", Post)
            .then(() => {
              console.log("File has been uploaded.");
            })
            .catch((error) => {
              console.log("Error: ", error);
            });
        });
      })()
      
    } catch (err) {
      console.error(err);
    }
  }
  return (
    <div className="landingPage">
      <div id="root"></div>

      <section id="contact">
        <div class="contact-box">
          <div class="contact-links">
            <h2>INCENTIVISED DATA SHARING </h2>
            {/* {saveText()} */}
            <br />
            <br />

            <div className="links">
              <div className="link">
                <a>
                  <img
                    src="https://i.postimg.cc/YCV2QBJg/github.png"
                    alt="github"
                  />
                </a>
              </div>
              <div className="link">
                <a>
                  <img
                    src="https://i.postimg.cc/YCV2QBJg/github.png"
                    alt="github"
                  />
                </a>
              </div>
              <div className="link">
                <a>
                  <img
                    src="https://i.postimg.cc/YCV2QBJg/github.png"
                    alt="github"
                  />
                </a>
              </div>
              <div className="link">
                <a>
                  <img
                    src="https://i.postimg.cc/YCV2QBJg/github.png"
                    alt="github"
                  />
                </a>
              </div>
            </div>
          </div>

          <div className="contact-form-wrapper">
            <div className="form-item">
              <form onSubmit={takeInfo}>
                <div className="form-item">
                  <label for="title">Title:</label>
                  <input
                    type="text"
                    className="form-control"
                    id="title"
                    aria-describedby="emailHelp"
                    onChange={(e) => gettitle(e.target.value)}
                    value={title}
                  />
                </div>

                <div className="form-item">
                  <label for="description">Description</label>
                  <textarea
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    onChange={(e) => getDescription(e.target.value)}
                    value={description}
                  />
                </div>
                <div className="form-item">
                  <label for="keyword">Keyword</label>
                  <textarea
                    type="text"
                    className="form-control"
                    id="exampleInputPassword1"
                    onChange={(e) => getkeyword(e.target.value)}
                    value={keyword}
                  />
                </div>

                <div className="home__button add-csv-button">
                  <CSVReader
                    onFileLoaded={(data, fileInfo, originalFile) => {
                      var file = [];
                      var ind = 0;
                      getrow(data.length);
                      getcol(data.length == 0 ? 0 : data[0].length);
                      for (var row of data) {
                        for (var str of row) {
                          str = str.trim();
                          var key = randomstring.generate(str.length);
                          var ciphertext = CryptoJS.AES.encrypt(
                            JSON.stringify(str),
                            key
                          ).toString();
                          keys.push(key);
                          file.push(ciphertext);
                          // file.push(str);
                        }
                      }
                      getkeys(keys);
                      getFile(file);
                      // var tmp_col = data[0]
                      getcol_title(data[0].join(","));
                      
                     
                      
                        // getData(hash_ipfs)
                        
                      // console.log("hash", hash_ipfs);
                      
                    }}
                  />
                </div>

                <div className="btn-center">
                  <button type="submit" className="col-12 button">
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
      <ShowPosts account={account} contract={contract} />

      <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.5.1/gsap.min.js"></script>
      <script src="assets/js/main.js"></script>
    </div>
  );
};

export default LandingPage;