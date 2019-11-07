const dummy = () => {
	return 1;
};

const totalLikes = blogs => {
	const total = blogs.reduce((acc, blog) => acc + blog.likes, 0);
	return isNaN(total) ? 0 : total;
};

const favoriteBlog = blogs => {
	let mostLiked = blogs[0];
	blogs.map(blog => {
		if (blog.likes >= mostLiked.likes) {
			mostLiked = blog;
		}
	});

	return mostLiked;
};

const mostPosts = blogs => {
	const blogStats = {};

	blogs.map(blog => {
		if (blogStats[blog.author] === undefined) {
			blogStats[blog.author] = 0;
		}
		blogStats[blog.author] = blogStats[blog.author] + 1;
	});

	const mostPostAuthor = Object.keys(blogStats).reduce((a, b) =>
		blogStats[a] > blogStats[b] ? a : b
	);

	return {
		author: mostPostAuthor,
		blogs: blogStats[mostPostAuthor]
	};
};

const mostLikes = blogs => {
	const blogStats = {};

	blogs.map(blog => {
		if (blogStats[blog.author] === undefined) {
			blogStats[blog.author] = 0;
		}
		blogStats[blog.author] = blogStats[blog.author] + blog.likes;
	});

	const mostLikesAuthor = Object.keys(blogStats).reduce((a, b) =>
		blogStats[a] > blogStats[b] ? a : b
	);

	return {
		author: mostLikesAuthor,
		likes: blogStats[mostLikesAuthor]
	};
};

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostPosts,
	mostLikes
};
