export function errorHandler(err, req, res, next) {
  console.error('Error:', err);

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    });
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Duplicate entry' });
  }

  if (err.code === '23503') {
    return res.status(409).json({ error: 'Referenced record does not exist' });
  }

  if (err.code === '23514') {
    return res.status(400).json({ error: 'Constraint violation' });
  }

  if (err.message && err.message.includes('cannot be deleted')) {
    return res.status(409).json({ error: err.message });
  }

  const status = err.status || 500;
  const message = status === 500 ? 'Internal server error' : err.message;

  res.status(status).json({ error: message });
}