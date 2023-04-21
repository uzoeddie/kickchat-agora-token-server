// this is created so that google tag manager can be loaded without
// being blocked by content security policy

const crypto = require("crypto");

const indexNonce = crypto.randomBytes(16).toString("hex");

module.exports = { indexNonce };