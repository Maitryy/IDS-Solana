const router = require("express").Router();
const Post = require("../models/post.js");


router.post("/posts", async (req, res) => {
    try {
        const { title, description, keyword, row, col, col_title, keys, _id } = req.body;

        if (!description || !title || !keyword || !_id)
            return res
                .status(400)
                .json({ errorMessage: "Please enter all details" });

        const existingPost = await Post.findOne({ _id })
        if (existingPost)
            return res
                .status(400)
                .json({ errorMessage: "A post with same id already exists" });

        const NewPost = new Post({
            description: description,
            title: title,
            keywords: keyword,
            row: row,
            col: col,
            _id: _id,
            col_title: col_title,
            keys: keys,
        });
        
        await NewPost.save();
        res.status(200).send(NewPost);
    } catch (err) {
        console.error(err);
        res.status(500).send();
    }
});


router.get("/GetAllPosts", async (req, res) => {
    try {
        const getPosts = await Post.find();
        res.send(getPosts);
    } catch (err) {
        console.error(err);
        res.status(401).json({ errorMessage: "Unauthorised" });
    }
});
module.exports = router;