exports.errorHandler = (err, req, res, next) => {
  console.error("ERROR STACK:", err);

  res.status(500).json({
    success: false,
    message: err.message
  });
};
