const Cloud = require("@google-cloud/storage");
const path = require("path");

const { Storage } = Cloud;
const storage = new Storage({
  keyFilename: process.env.GCS_KEYFILE,
  projectId: process.env.GCLOUD_PROJECT,
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

module.exports = bucket;
