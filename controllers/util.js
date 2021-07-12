const gcsUtil = require("../util/gcsUtil");

exports.deleteFilesByParents = async (parents) => {
  File.find({ parent: { $in: parents } }, {}, async function (err, files) {
    if (err) throw err;

    for (let f of files) {
      await gcsUtil.deleteFile(f["filePath"]);
    }
    File.deleteMany({ parent: { $in: parents } }, {}, function (err, file) {
      if (err) throw err;
      return;
    });
  });
};
