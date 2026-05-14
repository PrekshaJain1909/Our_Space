exports.errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== 'production';
  
  // Determine status code based on error type
  let status = 500;
  let message = err.message || 'Internal Server Error';
  
  // MongoDB connection errors → 503 (service unavailable, retry later)
  if (err.name === 'MongooseError' || err.message?.includes('MongoDB') || err.message?.includes('ECONNREFUSED')) {
    status = 503;
    message = isDev ? err.message : 'Database connection failed. Please try again later.';
  }
  // Validation errors → 400 (bad request)
  else if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map(e => e.message).join(', ');
  }
  // Cast errors (invalid ObjectId) → 400
  else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }
  // Duplicate key error → 409 (conflict)
  else if (err.code === 11000) {
    status = 409;
    message = 'Duplicate entry';
  }
  
  console.error(`[${status}] ${req.method} ${req.path}:`, err);
  
  res.status(status).json({
    success: false,
    message,
    ...(isDev && { stack: err.stack })
  });
};
