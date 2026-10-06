function rateLimit({ windowMs, max, keyFn, message }) {
  const hits = new Map();
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [k, arr] of hits) {
      const fresh = arr.filter(t => now - t < windowMs);
      fresh.length ? hits.set(k, fresh) : hits.delete(k);
    }
  }, windowMs);
  timer.unref();
  return (req, res, next) => {
    const key = keyFn ? keyFn(req) : req.ip;
    const now = Date.now();
    const arr = (hits.get(key) || []).filter(t => now - t < windowMs);
    if (arr.length >= max) {
      res.set('Retry-After', Math.ceil(windowMs / 1000));
      return res.status(429).json({ error: message || 'Too many requests.', rateLimited: true });
    }
    arr.push(now);
    hits.set(key, arr);
    next();
  };
}
module.exports = { rateLimit };
