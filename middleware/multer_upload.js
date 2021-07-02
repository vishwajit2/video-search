const crypto = require("crypto");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: "./uploads/",
  filename: (req, file, cb) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return reject({ err: "Error uploading file" });
      }
      let folder = new Date().toISOString().substr(0, 7) + "/";
      let ext = path.extname(file.originalname);
      var filename = folder + buf.toString("hex") + Date.now() + ext;

      req.body.filePath = filename;
      req.body.name = file.originalname;
      req.body.type = file.mimetype;
      cb(null, filename);
    });
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 },
});

module.exports = upload;
