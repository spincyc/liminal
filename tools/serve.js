#!/usr/bin/env node
"use strict";

// Serves dist/ for local testing, including from a phone on the same network:
//   npm run build && npm run serve        # http://localhost:8080
//   PORT=9000 npm run serve

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..", "dist");
const PORT = Number(process.env.PORT || 8080);
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

if (!fs.existsSync(ROOT)) {
  console.error("dist/ is missing; run npm run build first.");
  process.exit(1);
}

http
  .createServer((request, response) => {
    const url = new URL(request.url, "http://localhost");
    let file = path.join(ROOT, decodeURIComponent(url.pathname));
    if (!file.startsWith(ROOT)) {
      response.writeHead(403).end();
      return;
    }
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    fs.readFile(file, (error, body) => {
      if (error) {
        response.writeHead(404, { "content-type": "text/plain" }).end("Not found");
        return;
      }
      response.writeHead(200, { "content-type": TYPES[path.extname(file)] || "application/octet-stream" });
      response.end(body);
    });
  })
  .listen(PORT, () => console.log(`Serving dist/ at http://localhost:${PORT}`));
