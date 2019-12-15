const testsRouter = require("express").Router();
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const User = require("../models/user");

testsRouter.post("/reset", async (request, response) => {
	await BlogPost.deleteMany({});
	await Comment.deleteMany({});
	await User.deleteMany({});

	response.status(204).end();
});

module.exports = testsRouter;
