const idempotencyStore = new Map();
const TTL_MS = 24 * 60 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of idempotencyStore.entries()) {
    if (now - value.timestamp > TTL_MS) {
      idempotencyStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

export function validateIdempotencyKey(req, res, next) {
  const key = req.headers['idempotency-key'];

  if (!key) {
    return next();
  }

  if (typeof key !== 'string' || key.length > 256) {
    return res.status(400).json({ error: 'Invalid Idempotency-Key header' });
  }

  const existing = idempotencyStore.get(key);
  if (existing) {
    return res.status(existing.status).json(existing.body);
  }

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    idempotencyStore.set(key, {
      status: res.statusCode,
      body,
      timestamp: Date.now()
    });
    return originalJson(body);
  };

  next();
}