#!/usr/bin/env node

const http = require('http');
const https = require('https');
const { execSync } = require('child_process');

// Get the current oc token
let token;
try {
  token = execSync('oc whoami --show-token', { encoding: 'utf8' }).trim();
  console.log('Got OC token:', token.substring(0, 20) + '...');
} catch (error) {
  console.error('Failed to get oc token:', error.message);
  process.exit(1);
}

const server = http.createServer((req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Proxy to the Lightspeed service
  const options = {
    hostname: 'localhost',
    port: 8443,
    path: req.url,
    method: req.method,
    headers: {
      ...req.headers,
      'Authorization': `Bearer ${token}`,
      'host': 'localhost:8443'
    },
    rejectUnauthorized: false // Accept self-signed certificates
  };

  console.log(`Proxying ${req.method} ${req.url} to https://localhost:8443${req.url}`);

  const proxyReq = https.request(options, (proxyRes) => {
    // Copy status and headers
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    
    // Pipe the response
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (error) => {
    console.error('Proxy error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + error.message);
  });

  // Pipe the request body
  req.pipe(proxyReq);
});

const PORT = 8444;
server.listen(PORT, () => {
  console.log(`Development proxy server running on http://localhost:${PORT}`);
  console.log('This proxy forwards requests to https://localhost:8443 with proper authentication');
});