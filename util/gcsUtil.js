const bucket = require("../config/gcs");

bucket
  .getFilesStream()
  .on("error", console.error)
  .on("data", function (file) {
    // file is a File object.
  })
  .on("end", function () {
    // All files retrieved.
  });

exports.deleteFile = async (fileName) => {
  await bucket.file(fileName).delete();
  console.log(`gs://${bucketName}/${fileName} deleted`);
};
