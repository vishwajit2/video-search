const Folder = require("../models/Folder");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { deleteFilesByParents } = require("./util");

exports.createFolder = (req, res, next) => {
  if (req.body.password.length !== 0) {
    let salt = bcrypt.genSaltSync(10);
    let hash = bcrypt.hashSync(req.body.password, salt);
    req.body.password = hash;
  } else {
    req.body.password = "";
  }

  const folderData = {
    owner: req.body.owner,
    name: req.body.name,
    parent: req.body.parent,
    password: req.body.password,
    linkView: crypto.createHash("sha256").update(idFolder).digest("hex"),
    visibleToEveryone: req.body.visibleToEveryone,
  };
  const folder = new Folder(folderData);
  folder
    .save()
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(403).send({ err: "Error creating folder" });
    });
};

// exports.createFolderRoom = (req, res, next) => {
//   req.body = {
//     idFolder: req.body.idFolder,
//     owner: req.body.idFolder + Date.now(),
//     name: req.body.name,
//     parent: req.body.parent,
//     linkView: req.body.idFolder,
//     visibleToEveryone: false,
//   };

//   FolderController.saveFolder(req.body)
//     .then((result) => {
//       res.status(200).send(result);
//     })
//     .catch((err) => {
//       res.status(403).send({ err: "Error creating folder room" });
//     });
// };

exports.addFolderToParent = (req, res, next) => {
  FolderController.addFolderToParent(req.body.parent, req.body.idFolder)
    .then((result) => {
      res.status(200).send({});
    })
    .catch((err) => {
      res.status(403).send({ err: "Error adding id to parent folder" });
    });
};

exports.getFolder = (req, res, next) => {
  Folder.findById(req.body.idFolder)
    .then((result) => {
      if (result !== null) {
        req.body.result = result;
        return next();
      } else {
        res.status(403).send({ err: "Error this folder doesn't exist" });
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error getting folder" });
    });
};

exports.checkPrivileges = (req, res, next) => {
  var folder = req.body.result;

  if (folder.password.length !== 0) {
    if (!req.body.password || req.body.password.length === 0) {
      res.status(403).send({ err: "No password provided for this folder" });
    } else {
      if (bcrypt.compareSync(req.body.password, folder.password)) {
        return next();
      } else {
        res.status(403).send({ err: "Error wrong password for this folder" });
      }
    }
  } else {
    return next();
  }
};

exports.checkIfFolderExistForFile = (req, res, next) => {
  if (req.body.parent === "/") {
    res.status(403).send({ err: "No folder selected" });
    return next();
  }

  Folder.findById(req.body.idFolder)
    .then((result) => {
      if (result !== null) {
        req.body.parent = result.idFolder;
        return next();
      } else {
        res.status(403).send({ err: "No folder selected" });
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "No folder selected" });
    });
};

exports.checkIfFolderExist = (req, res, next) => {
  if (req.body.parent === "/") {
    return next();
  }

  Folder.findById(req.body.idFolder)
    .then((result) => {
      if (result !== null) {
        req.body.parent = result.idFolder;
        return next();
      } else {
        res.status(403).send({ err: "Error this folder doesn't exist" });
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error getting folder" });
    });
};

exports.getFolders = (req, res, next) => {
  Folder.find(
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
      res.status(403).send({ err: "Error getting folder" });
    });
};

exports.deleteFolders = async (req, res, next) => {
  var folders = [req.body.idFolder];
  var allFolders = new Set();
  allFolders.add(req.body.idFolder);

  while (folders.length !== 0) {
    Folder.find({ parent: { $in: folders } }, {})
      .then((folders) => {
        var newFolders = folders.map((folder) => folder._id);
        Folder.deleteMany({ _id: { $in: folders } }, {})
          .then((_) => {
            folders = newFolders;

            for (let a = 0; a < newFolders.length; ++a) {
              allFolders.add(newFolders[a]);
            }

            if (folders.length === 0) {
              allFolders = [...allFolders];

              deleteFilesByParents(allFolders)
                .then(() => {
                  return res.status(201).send({});
                })
                .catch(() => {
                  return res.status(403).send({ err: "Error deleting folder" });
                });
            }
          })
          .catch((err) => {
            return res.status(403).send({ err: "Error deleting folder" });
          });
      })
      .catch((err) => {
        return res.status(403).send({ err: "Error deleting folder" });
      });
  }
};

exports.isOwner = (req, res, next) => {
  Folder.findById(req.body.idFolder, {})
    .then((result) => {
      if (result === null) {
        res.status(403).send({ err: "No folder found" });
      } else if (result.owner !== req.body.owner) {
        res
          .status(403)
          .send({ err: "You are not authorized to access this folder" });
      } else {
        return next();
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error isOwner folder" });
    });
};

exports.checkIfPasswordRequired = (req, res, next) => {
  if (req.body.parent === "/") {
    return next();
  }

  Folder.findById(req.body.parent)
    .then((result) => {
      if (result === null) {
        res.status(403).send({ err: "No folder found" });
      } else if (result.password.length !== 0) {
        var passwords = req.body.passwords;
        for (let a = 0; a < passwords.length; ++a) {
          if (bcrypt.compareSync(passwords[a], result.password)) {
            return next();
          }
        }

        res.status(200).send({ passwordRequired: true });
      } else {
        return next();
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(403).send({ err: "Error check if password required folder" });
    });
};

exports.checkIfPasswordChanged = (req, res, next) => {
  if (req.body.password.length === 0) {
    return next();
  }
  Folder.findById(req.body.idFolder)
    .then((result) => {
      if (bcrypt.compareSync(req.body.password, result.password)) {
        return next();
      } else {
        let salt = bcrypt.genSaltSync(10);
        let hash = bcrypt.hashSync(req.body.password, salt);
        req.body.password = hash;
        return next();
      }
    })
    .catch((err) => {
      res.status(403).send({ err: "Error changing password folder" });
    });
};

exports.modify = (req, res, next) => {
  Folder.findOneAndUpdate(
    { _id: req.body.idFolder, owner: req.body.owner },
    {
      $set: {
        password: req.body.password,
        name: req.body.name,
        visibleToEveryone: req.body.visibleToEveryone,
      },
    },
    { new: true }
  )
    .then((result) => {
      res.status(201).send({});
    })
    .catch((err) => {
      res.status(403).send({ err: "Error modifying folder" });
    });
};

// exports.checkIfFolderExistRoom = (req, res, next) => {
//   if (req.body.parent === "/") {
//     FolderController.getFolder(req.body.idFolder)
//       .then((result) => {
//         if (result !== null) {
//           res.status(403).send({ err: "Folder already created" });
//         } else {
//           return next();
//         }
//       })
//       .catch((err) => {
//         res.status(403).send({ err: "Error changing password folder" });
//       });
//   } else {
//     res.status(403).send({ err: "Error not the right folder" });
//   }
// };
