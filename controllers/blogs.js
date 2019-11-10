const blogsRouter = require("express").Router();
const BlogPost = require("../models/blogPost");
const Comment = require("../models/comment");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

blogsRouter.get("/", async (request, response) => {
	const blogs = await BlogPost.find({})
		.populate("user", {
			username: 1,
			name: 1
		})
		.populate("comments", {
			content: 1
		});
	response.json(blogs.map(blog => blog.toJSON()));
});

blogsRouter.post("/", async (request, response, next) => {
	const body = request.body;

	try {
		const decodedToken = jwt.verify(request.token, process.env.SECRET);
		if (!request.token || !decodedToken.id) {
			return response
				.status(401)
				.json({ error: "token missing or invalid" });
		}

		const user = await User.findById(decodedToken.id);

		const blog = new BlogPost({
			title: body.title,
			author: body.author,
			url: body.url,
			likes: body.likes === undefined ? 0 : body.likes,
			user: user._id,
			comments: []
		});

		if (
			blog.title === undefined ||
			blog.url === undefined ||
			blog.title === "" ||
			blog.url === ""
		) {
			response.status(400).end();
		} else {
			const savedBlog = await blog.save();
			user.blogs = user.blogs.concat(savedBlog._id);
			await user.save();
			const populatedBlog = await BlogPost.findById(
				savedBlog.id
			).populate("user", {
				username: 1,
				name: 1
			});
			response.status(201).json(populatedBlog);
		}
	} catch (exception) {
		next(exception);
	}
});

blogsRouter.post("/:id/comments", async (request, response, next) => {
	const body = request.body;

	try {
		const blog = await BlogPost.findById(request.params.id);
		const comment = new Comment({
			content: body.content,
			blog: blog._id
		});

		if (comment.content === "") {
			response.status(400).end();
		} else {
			const savedComment = await comment.save();
			blog.comments = blog.comments.concat(savedComment._id);
			await blog.save();
			const populatedBlog = await BlogPost.findById(blog.id)
				.populate("comments", {
					content: 1
				})
				.populate("user", {
					username: 1,
					name: 1
				});
			response.status(201).json(populatedBlog);
		}
	} catch (exception) {
		next(exception);
	}
});

blogsRouter.delete("/:id", async (request, response, next) => {
	try {
		const decodedToken = jwt.verify(request.token, process.env.SECRET);
		if (!request.token || !decodedToken.id) {
			return response
				.status(401)
				.json({ error: "token missing or invalid" });
		}

		const user = await User.findById(decodedToken.id);
		const blog = await BlogPost.findById(request.params.id);

		if (user.id.toString() === blog.user.toString()) {
			await BlogPost.findByIdAndRemove(request.params.id);
			response.status(200).end();
		}
	} catch (exception) {
		next(exception);
	}
});

blogsRouter.put("/:id", async (request, response) => {
	const updatedBlog = {
		title: request.body.title,
		author: request.body.author,
		url: request.body.url,
		likes: request.body.likes
	};

	const result = await BlogPost.findByIdAndUpdate(
		request.params.id,
		updatedBlog,
		{
			new: true
		}
	).populate("user", {
		username: 1,
		name: 1
	});
	response.status(200).json(result);
});

module.exports = blogsRouter;
