const crypto = require("crypto");

function generateResetToken() {
    const token = crypto.randomBytes(32).toString("hex");
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes
    return { token, expires };
}

module.exports = { generateResetToken };
