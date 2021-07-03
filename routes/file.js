const FileController = require("../controllers/file");
const auth = require("../middleware/auth");
const uploadGCS = require("../middleware/uploadGCS");
const FolderController = require("../controllers/folder");

const express = require("express");
const router = express.Router();

router.post("/uploadFile", [
  auth,
  FolderController.checkIfFolderExistForFile,
  uploadGCS,
  FileController.uploadFile,
]);

router.post("/getFiles", [
  auth,
  FolderController.checkIfPasswordRequired,
  FileController.getFiles,
]);

router.delete("/deleteFile", [
  auth,
  FileController.isOwner,
  FileController.removeFile,
]);

router.post("/getFile", [
  auth,
  FolderController.checkIfPasswordRequired,
  FileController.getFile,
  FileController.checkPrivileges,
  //  download TODO
]);

router.post("/getSharedFile", [auth, FileController.getFileSharedLink]);

// TODO
// router.post("/getSharedFileDownload", [
//   auth,
//   FileController.getSharedFileDownload,
//   FileController.getFileFormGridfs,
// ]);

router.patch("/changeFolder", [
  auth,
  FileController.isOwner,
  FolderController.checkIfFolderExist,
  FileController.changeFolder,
]);

module.exports = router;
