let app = null;
let loadError = null;

try {
  const mod = await import('../server/index.js');
  app = mod.default;
} catch (err) {
  loadError = err.stack || err.message;
  console.error('SERVER LOAD ERROR:', err);
}

export default function handler(req, res) {
  if (loadError) {
    return res.status(500).json({
      error: 'Backend initialization failed',
      details: loadError
    });
  }

  // Ensure route matches whether Vercel passes /api/... or strips /api
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  return app(req, res);
}
