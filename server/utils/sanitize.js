const sanitizeText = (value) => {
    if (typeof value !== "string") return "";
    return value.replace(/[<>]/g, "").trim();
};

module.exports = { sanitizeText };
