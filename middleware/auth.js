const jwt = require("jsonwebtoken");

module.exports = async function (req, res, next) {
  // get token from header
  const token =
    req.body.token || req.query.token || req.headers["x-access-token"];
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }
  // verify token
  try {
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        res.status(401).json({ msg: "Invalid Token" });
      } else {
        req.user = decoded.user_id;
        next();
      }
    });
  } catch (err) {
    console.error("something wrong with auth middleware");
    return res.status(500).json({ msg: "Server Error" });
  }
};
