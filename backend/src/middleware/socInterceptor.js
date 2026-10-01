const SUSPICIOUS_PATTERNS = [
  { pattern: /<script/i, tag: 'XSS', severity: 'critical' },
  { pattern: /onerror\s*=/i, tag: 'XSS', severity: 'critical' },
  { pattern: /onload\s*=/i, tag: 'XSS', severity: 'critical' },
  { pattern: /javascript:/i, tag: 'XSS', severity: 'high' },
  { pattern: /document\.cookie/i, tag: 'XSS', severity: 'critical' },
  { pattern: /['"]?\s*OR\s+['"]?\d/i, tag: 'SQLi', severity: 'critical' },
  { pattern: /UNION\s+SELECT/i, tag: 'SQLi', severity: 'critical' },
  { pattern: /DROP\s+TABLE/i, tag: 'SQLi', severity: 'critical' },
  { pattern: /;\s*--/i, tag: 'SQLi', severity: 'high' },
  { pattern: /\.\.\/|\.\.%2f/i, tag: 'Path Traversal', severity: 'high' },
  { pattern: /etc\/passwd/i, tag: 'Path Traversal', severity: 'critical' },
  { pattern: /\$\{.*\}/i, tag: 'Template Injection', severity: 'high' },
  { pattern: /"price"\s*:\s*(-\d+|0\b)/i, tag: 'Price Tampering', severity: 'critical' },
  { pattern: /"unit_price"\s*:\s*(-\d+|0\b)/i, tag: 'Price Tampering', severity: 'critical' },
  { pattern: /"status"\s*:\s*"success"/i, tag: 'Payment Bypass', severity: 'critical' },
];

function detectThreats(text) {
  const threats = [];
  for (const { pattern, tag, severity } of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      const match = text.match(pattern);
      threats.push({ tag, severity, match: match ? match[0] : '' });
    }
  }
  return threats;
}

function socInterceptor(req, res, next) {
  const io = req.app.get('io');
  if (!io) return next();

  const startTime = Date.now();

  const originalJson = res.json.bind(res);
  let responseBody = null;

  res.json = function (body) {
    responseBody = body;
    return originalJson(body);
  };

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const rawBody = JSON.stringify(req.body || {});
    const rawUrl = req.originalUrl || req.url;
    const rawHeaders = JSON.stringify(req.headers);
    const fullPayload = rawBody + rawUrl + rawHeaders;

    const threats = detectThreats(fullPayload);

    const logEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: rawUrl,
      statusCode: res.statusCode,
      ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
      userAgent: req.headers['user-agent'] || 'unknown',
      contentType: req.headers['content-type'] || '',
      body: req.body && Object.keys(req.body).length > 0 ? req.body : null,
      duration,
      threats,
      hasThreat: threats.length > 0,
      maxSeverity: threats.length > 0
        ? threats.reduce((max, t) =>
            t.severity === 'critical' ? 'critical' : max === 'critical' ? 'critical' : t.severity, 'low')
        : null,
      responseFlag: responseBody?.flag || null,
    };

    io.emit('http-log', logEntry);
  });

  next();
}

module.exports = socInterceptor;
