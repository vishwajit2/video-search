const crypto = require("crypto");
const path = require("path");
const bucket = require("../config/gcs");

const multer = require("multer");

upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1000000 },
}).single("file");

const createFilename = (originalname) =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buf) => {
      if (err) {
        return reject({
          err: "Error uploading file - can not generate filename",
        });
      }
      let folder = new Date().toISOString().substr(0, 7) + "/";
      let ext = path.extname(originalname);
      var filename = folder + buf.toString("hex") + Date.now() + ext;
      resolve(filename);
    });
  });

const uploadGCS = async (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.log(err);
      res.status(401).json("error uploading file");
    }
    try {
      const { originalname, buffer } = req.file;
      createFilename(originalname)
        .then((filePath) => {
          req.body.originalname = originalname;
          req.body.filePath = filePath;
          const blob = bucket.file(filePath);
          const blobStream = blob.createWriteStream({ resumable: false });
          blobStream
            .on("finish", () => {
              next();
            })
            .on("err", () => {
              console.log(err);
              res.status(401).json({ err: "Error uploading file" });
            })
            .end(buffer);
        })
        .catch((err) => res.status(401).json(err));
    } catch (error) {
      next(error);
    }
  });
};

module.exports = uploadGCS;
