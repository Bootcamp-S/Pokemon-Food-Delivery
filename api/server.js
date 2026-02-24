// api/server.js
const http = require('http');
const url = require('url');
const getPokemon = require('./index'); // your function exported as module.exports = async function (context, req) {}

const PORT = process.env.PORT || 5050;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Mirror Azure Functions default route: /api/<functionName>
  if (parsedUrl.pathname === '/api/index' && (req.method === 'GET' || req.method === 'POST')) {
    // Build Azure Functions-like context and req
    const context = {
      res: null,
      log: console.log,
      done: () => {}
    };

    // Build req with query + body like Azure Functions would provide
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', async () => {
      let jsonBody;
      try {
        jsonBody = body ? JSON.parse(body) : undefined;
      } catch (e) {
        // ignore parse error; treat as raw text
        jsonBody = body;
      }

      const funcReq = {
        method: req.method,
        headers: req.headers,
        query: parsedUrl.query || {},
        body: jsonBody
      };

      try {
        await getPokemon(context, funcReq);
        const { status = 200, headers = { 'Content-Type': 'application/json' }, body } = context.res || {};
        res.writeHead(status, headers);
        if (typeof body === 'object') {
          res.end(JSON.stringify(body));
        } else {
          res.end(body || '');
        }
      } catch (err) {
        console.error('Handler error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Local test server listening on http://127.0.0.1:${PORT}`);
});

// Graceful shutdown in CI
process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
