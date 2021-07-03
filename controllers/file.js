const File = require("../models/File");
const crypto = require("crypto");
const gcsUtil = require("../util/gcsUtil");
exports.uploadFile = (req, res) => {
  req.body.linkView = crypto
    .createHash("sha256")
    .update(req.body.filePath)
    .digest("hex");
  req.body = {
    linkView: req.body.linkView,
    filePath: req.body.filePath,
    name: req.body.name,
    owner: req.body.owner,
    parent: req.body.parent,
    type: req.body.type,
    sizeFile: Math.ceil(parseInt(req.body.sizeFile, 10) / 1024),
  };
  const file = new File(req.body);
  file
    .save()
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      res.status(403).send({ err: "Error uploading file" });
    });
};

exports.getFile = (req, res, next) => {
  File.findOne({ filePath: req.body.filePath }, {})
    .then((result) => {
      if (result !== null) {
        req.body.result = result;
        return next();
      } else {
        res.status(403).send({ err: "Error this file doesn't exist" });
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error getting file" });
    });
};

exports.getFileById = (req, res, next) => {
  File.findById(req.params.id, {})
    .then((result) => {
      if (result !== null) {
        req.body.result = result;
        return next();
      } else {
        res.status(403).send({ err: "Error this file doesn't exist" });
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error getting file by id" });
    });
};

exports.checkPrivileges = (req, res, next) => {
  var file = req.body.result;

  if (!file.visibleToEveryone && req.body.owner !== file.owner) {
    res.status(403).send({ err: "You are not autorized to access this file" });
  } else {
    return next();
  }
};

exports.getFiles = (req, res, next) => {
  File.find(
    {
      parent: req.body.parent,
      $or: [{ owner: req.body.owner }, { visibleToEveryone: true }],
    },
    {}
  )
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(403).send({ err: "Error getting files" });
    });
};

exports.removeFile = (req, res, next) => {
  gcsUtil
    .deleteFile(req.body.filePath)
    .then(() => {
      File.findOneAndRemove({ idFile: idFile })
        .then((result) => {
          res.status(201).send(result);
        })
        .catch((err) => {
          console.log(err);
          res.status(403).send({ err: "Error removing file" });
        });
    })
    .catch((err) => {
      console.log(err);
      res.send({
        err: "Error deleting file ",
      });
    });
};

exports.isOwner = (req, res, next) => {
  File.findOne({ owner: req.body.owner, filePath: req.body.filePath }, {})
    .then((result) => {
      if (result === null) {
        res.status(403).send({
          err: "No file found or you are not authorized to access this file",
        });
      } else if (result.owner !== req.body.owner) {
        res
          .status(403)
          .send({ err: "You are not authorized to access this file" });
      } else {
        return next();
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error accessing file" });
    });
};

exports.getFileSharedLink = (req, res, next) => {
  File.findOne({ linkView: req.body.link }, {})
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      res.status(403).send({ err: "Error getting shared file" });
    });
};

exports.getSharedFileDownload = (req, res, next) => {
  File.findOne({ linkView: req.body.link }, {})
    .then((result) => {
      if (result !== null) {
        req.body.filePath = result.filePath;
        return next();
      } else {
        res.status(403).send({ err: "Error getting shared file" });
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error getting file" });
    });
};

exports.changeFolder = (req, res, next) => {
  File.findOneAndUpdate(
    { filePath: res.body.filePath },
    { $set: { parent: res.body.parent } },
    { new: true }
  )
    .then((result) => {
      res.status(201).send(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(403).send({ err: "Error changing parent file" });
    });
};
