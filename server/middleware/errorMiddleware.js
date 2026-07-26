exports.errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';

  let status = 500;
  let message = err.message || 'Internal Server Error';

  if (err.isEmailError) {
    status = 503;
    message = isDev ? err.message : 'Email service temporarily unavailable. Please try again.';
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'Image is too large. Maximum allowed size is 8MB.';
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    status = 400;
    message = 'Unexpected file field.';
  } else if (err.name === 'MulterError') {
    status = 400;
    message = err.message || 'File upload failed.';
  } else if (err.name === 'MongooseError' || err.message?.includes('MongoDB') || err.message?.includes('ECONNREFUSED')) {
    status = 503;
    message = isDev ? err.message : 'Database connection failed. Please try again later.';
  } else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
  } else if (err.statusCode) {
    status = err.statusCode;
  }

  console.error(`[${status}] ${req.method} ${req.path}:`, err);

  res.status(status).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack })
  });
};
