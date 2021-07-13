const express = require("express");
const logger = require("morgan");
var cors = require("cors");
require("dotenv").config();
require("./config/database").connect();
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(logger("combined"));

const userRouter = require("./routes/user");
const fileRouter = require("./routes/file");
const folderRouter = require("./routes/folder");

app.use("/api/users", userRouter);
app.use("/api/file", fileRouter);
app.use("/api/folder", folderRouter);
// const uploadGCS = require("./middleware/uploadGCS");
// app.post("", uploadGCS, (req, res, next) => {
//   return res.json("success");
// });

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server up and running -> port ${port} !`));
app.timeout = 3000;
