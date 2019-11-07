const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const BlogPost = require("../models/blogPost");
const User = require("../models/user");
const helper = require("../utils/api_helper");

beforeAll(async () => {
	await BlogPost.deleteMany({});

	let blogObject = new BlogPost(helper.initialBlogs[0]);
	await blogObject.save();

	blogObject = new BlogPost(helper.initialBlogs[1]);
	await blogObject.save();

	blogObject = new BlogPost(helper.initialBlogs[2]);
	await blogObject.save();
});

describe("Blogs API returns", () => {
	test("blogs as json", async () => {
		await api
			.get("/api/blogs")
			.expect(200)
			.expect("Content-Type", /application\/json/);
	});

	test("correct number of blogs", async () => {
		const response = await api.get("/api/blogs");
		expect(response.body.length).toBe(3);
	});

	test("ID field as 'id'", async () => {
		const response = await api.get("/api/blogs");
		response.body.map(blog => {
			expect(blog.id).toBeDefined();
		});
	});

	test("blogs with Likes field defined", async () => {
		const response = await api.get("/api/blogs");
		response.body.map(blog => {
			expect(blog.likes).toBeGreaterThanOrEqual(0);
		});
	});
});

describe("Blogs API allows", () => {
	test("new blog posts to be added", async () => {
		const newBlog = {
			title: "React v16.9.0 and the Roadmap Update",
			author: "Dan Abramov and Brian Vaughn",
			url: "https://reactjs.org/blog/2019/08/08/react-v16.9.0.html",
			likes: "0"
		};

		const initialResponse = await api.get("/api/blogs");
		const blogsCount = initialResponse.body.length;

		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(201)
			.expect("Content-Type", /application\/json/);

		const response = await api.get("/api/blogs");
		expect(response.body.length).toBe(blogsCount + 1);
	});

	test("blog posts to be removed", async () => {
		const newBlog = {
			title: "React v16.9.0 and the Roadmap Update",
			author: "Dan Abramov and Brian Vaughn",
			url: "https://reactjs.org/blog/2019/08/08/react-v16.9.0.html",
			likes: "0"
		};

		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(201);

		const response = await api.get("/api/blogs");
		const blogId = response.body[response.body.length - 1].id;

		await api.delete(`/api/blogs/${blogId}`).expect(204);
	});

	// FIXME: Returns 'null' on all fields?

	// test("Blog posts can be modified", async () => {
	// 	const newBlog = {
	// 		title: "React v16.9.0 and the Roadmap Update",
	// 		author: "Dan Abramov and Brian Vaughn",
	// 		url: "https://reactjs.org/blog/2019/08/08/react-v16.9.0.html",
	// 		likes: "0"
	// 	};

	// 	const updatedBlog = {
	// 		title: "React v17.0.0 and the Roadmap Update",
	// 		author: "Dan Abramov",
	// 		url: "https://reactjs.org/blog/2019/08/08/react-v17.0.0.html",
	// 		likes: "0"
	// 	};

	// 	await api
	// 		.post("/api/blogs")
	// 		.send(newBlog)
	// 		.expect(201);

	// 	let response = await api.get("/api/blogs");
	// 	const blogId = response.body[response.body.length - 1].id;

	// 	response = await api.put(`/api/blogs/${blogId}`, updatedBlog);
	// 	expect(response.body.title).toBe("React v17.0.0 and the Roadmap Update");
	// });
});

describe("Blogs API rejects", () => {
	beforeEach(async () => {
		await BlogPost.deleteMany({});
	});

	test("new blog posts without title or url fields", async () => {
		const newBlog = {
			author: "Dan Abramov and Brian Vaughn",
			likes: "0"
		};

		await api
			.post("/api/blogs")
			.send(newBlog)
			.expect(400);
	});
});

describe("Users API allows", () => {
	beforeEach(async () => {
		await User.deleteMany({});
		const user = new User({ username: "root", password: "sekret" });
		await user.save();
	});

	test("new user creation with a fresh username", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: "mluukkai",
			name: "Matti Luukkainen",
			password: "salainen"
		};

		await api
			.post("/api/users")
			.send(newUser)
			.expect(200)
			.expect("Content-Type", /application\/json/);

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd.length).toBe(usersAtStart.length + 1);

		const usernames = usersAtEnd.map(u => u.username);
		expect(usernames).toContain(newUser.username);
	});
});

describe("Users API rejects", () => {
	beforeEach(async () => {
		await User.deleteMany({});
		const user = new User({ username: "root", password: "sekret" });
		await user.save();
	});

	test("new user creation if username is already taken", async () => {
		const usersAtStart = await helper.usersInDb();

		const newUser = {
			username: "root",
			name: "Superuser",
			password: "salainen"
		};

		const result = await api
			.post("/api/users")
			.send(newUser)
			.expect(400)
			.expect("Content-Type", /application\/json/);

		expect(result.body.error).toContain("`username` to be unique");

		const usersAtEnd = await helper.usersInDb();
		expect(usersAtEnd.length).toBe(usersAtStart.length);
	});
});

afterAll(async () => {
	await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
	mongoose.connection.close();
});
