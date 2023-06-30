const jwt = require("jsonwebtoken");
const generateJwt = (id, username) => {
  return jwt.sign(
    {
      id,
      username,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "24h" }
  );
};

module.exports = generateJwt;
