const { https } = require("firebase-functions");
// DESPUÉS (Correcto)
const next = require("next");

const isDev = process.env.NODE_ENV !== "production";

const server = next({
  dev: isDev,
  conf: { distDir: ".next" },
});

const nextjsHandle = server.getRequestHandler();

// DESPUÉS
exports.nextServer = https.onRequest({ memory: "1GiB" }, (req, res) => {
  return server.prepare().then(() => nextjsHandle(req, res));
});