const auth = require("../middleware/auth");
const FolderController = require("../controllers/folder");

const express = require("express");
const router = express.Router();

router.post("/createFolder", [
  auth,
  FolderController.checkIfFolderExist,
  FolderController.createFolder,
]);

router.post("/getFolders", [
  auth,
  FolderController.checkIfPasswordRequired,
  FolderController.getFolders,
]);

router.delete("/deleteFolders", [
  auth,
  FolderController.isOwner,
  FolderController.deleteFolders,
]);

router.post("/getFolderWithPassword", [
  auth,
  FolderController.getFolder,
  FolderController.checkPrivileges,
  FolderController.getFolders,
]);

router.patch("/modifyFolder", [
  auth,
  FolderController.isOwner,
  FolderController.checkIfPasswordChanged,
  FolderController.modify,
]);

// router.post("/createFolderRoom", [
//   authRoom,
//   FolderController.checkIfFolderExistRoom,
//   FolderController.createFolderRoom,
// ]);

module.exports = router;
