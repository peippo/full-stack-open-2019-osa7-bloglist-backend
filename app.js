const config = require("./utils/config");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const blogsRouter = require("./controllers/blogs");
const usersRouter = require("./controllers/users");
const loginRouter = require("./controllers/login");
const middleware = require("./utils/middleware.js");
const logger = require("./utils/logger.js");
const mongoose = require("mongoose");

logger.info("Connecting to", config.MONGODB_URI);

mongoose
	.connect(config.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true
	})
	.then(() => {
		logger.info("Connected to MongoDB");
	})
	.catch(error => {
		logger.error("Error connection to MongoDB:", error.message);
	});

app.use(cors());
app.use(bodyParser.json());
app.use(middleware.requestLogger);
app.use(middleware.tokenExtractor);

app.use("/api/blogs", blogsRouter);
app.use("/api/users", usersRouter);
app.use("/api/login", loginRouter);

if (process.env.NODE_ENV === "test") {
	const testsRouter = require("./controllers/tests");
	app.use("/api/tests", testsRouter);
}

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
