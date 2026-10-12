import app from '../server/index.js';

export default function handler(req, res) {
  // Ensure route matches whether Vercel passes /api/... or strips /api
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }
  return app(req, res);
}
