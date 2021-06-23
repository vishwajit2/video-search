const mongoose = require("mongoose");

const FolderModel = new mongoose.Schema({
  owner: {
    type: String,
    trim: true,
    require: true,
  }, // userId
  parent: {
    type: String,
    trim: true,
    require: true,
  }, // idFolder of parent folder
  name: {
    type: String,
    trim: true,
    require: true,
  }, // name of the folder
  password: {
    type: String,
    trim: true,
  },
  linkView: {
    type: String,
    trim: true,
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Folder = mongoose.model("Folder", FolderModel, "Folder");

module.exports = Folder;
