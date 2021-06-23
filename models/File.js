const mongoose = require("mongoose");

const FIleSchema = new mongoose.Schema({
  filePath: {
    type: String,
    trim: true,
    require: true,
  }, // filename
  owner: {
    type: String,
    trim: true,
    require: true,
  }, // userId
  orig_name: {
    type: String,
    trim: true,
    require: true,
  }, // original name
  parent: {
    type: String,
    trim: true,
    require: true,
  }, // idFolder in which file is stored
  linkView: {
    type: String,
    trim: true,
  }, // _id + random_string
  isPrivate: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  sizeFile: {
    type: Number,
    default: 0,
  }, // size in kb
});

const File = mongoose.model("File", FIleSchema, "File");

module.exports = File;
