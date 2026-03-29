const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (process.env.NODE_ENV === 'development') {
    console.error(err);
  }

  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ error: 'VALIDATION_ERROR', message: 'Validation failed', details });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res
      .status(409)
      .json({ error: 'DUPLICATE_ERROR', message: `${field} already exists`, details: [{ field }] });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'INVALID_ID', message: 'Invalid ID format' });
  }

  res.status(statusCode).json({ error: err.name || 'SERVER_ERROR', message });
};

export default errorHandler;
