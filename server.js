const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const page = "LLevameRapido – Transporte turístico en Cusco.html";
const port = 8080;
const mime = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".mp4": "video/mp4",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
};

const server = http.createServer((req, res) => {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch {
    res.writeHead(400).end("Solicitud no válida");
    return;
  }

  if (pathname === "/") pathname = `/${page}`;
  const file = path.resolve(root, `.${pathname}`);
  if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
    res.writeHead(403).end("Acceso denegado");
    return;
  }

  fs.stat(file, (error, stat) => {
    if (error || !stat.isFile()) {
      res.writeHead(404).end("No se encontró el archivo");
      return;
    }

    res.setHeader("Content-Type", mime[path.extname(file).toLowerCase()] || "application/octet-stream");
    res.setHeader("Accept-Ranges", "bytes");

    const range = req.headers.range;
    if (range && path.extname(file).toLowerCase() === ".mp4") {
      const match = /^bytes=(\d*)-(\d*)$/.exec(range);
      if (!match) {
        res.writeHead(416).end();
        return;
      }

      const start = match[1] ? Number(match[1]) : 0;
      const end = match[2] ? Math.min(Number(match[2]), stat.size - 1) : stat.size - 1;
      if (start > end || start >= stat.size) {
        res.writeHead(416).end();
        return;
      }

      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${stat.size}`,
        "Content-Length": end - start + 1,
      });
      fs.createReadStream(file, { start, end }).pipe(res);
      return;
    }

    res.writeHead(200, { "Content-Length": stat.size });
    fs.createReadStream(file).pipe(res);
  });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`El puerto ${port} ya está ocupado. Cierra la otra ventana que ejecuta la página e inténtalo de nuevo.`);
  } else {
    console.error("No se pudo iniciar el servidor:", error.message);
  }
  process.exitCode = 1;
});

server.listen(port, "127.0.0.1", () => {
  const url = `http://127.0.0.1:${port}/`;
  console.log("");
  console.log("Llévame Rápido está listo.");
  console.log(`Enlace para ingresar: ${url}`);
  console.log("Deja esta ventana abierta mientras uses la página.");
  console.log("Para detenerla, presiona Ctrl+C.");
  require("node:child_process").exec(`start "" "${url}"`);
});
