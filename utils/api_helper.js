const User = require("../models/user");

const initialBlogs = [
	{
		title: "Introducing the New React DevTools",
		author: "Brian Vaughn",
		url: "https://reactjs.org/blog/2019/08/15/new-react-devtools.html",
		likes: "0"
	},
	{
		title: "React v16.8: The One With Hooks",
		author: "Dan Abramov",
		url: "https://reactjs.org/blog/2019/02/06/react-v16.8.0.html",
		likes: "23"
	},
	{
		title: "React v16.6.0: lazy, memo and contextType",
		author: "Sebastian Markbåge",
		url: "https://reactjs.org/blog/2018/10/23/react-v-16-6.html",
		likes: "16"
	}
];

const usersInDb = async () => {
	const users = await User.find({});
	return users.map(u => u.toJSON());
};

module.exports = {
	initialBlogs,
	usersInDb
};
