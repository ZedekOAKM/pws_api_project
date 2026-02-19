const http = require("http");
const fs = require("fs");
const path = require("path");
const { handleApiAircrafts } = require("./routes/apiAircrafts");
const { handlePages } = require("./routes/pages");

const server = http.createServer((req, res) => {
  // API
  if (handleApiAircrafts(req, res) !== false) return;

  // public files
  if (req.url.startsWith("/public/")) {
    const filePath = path.join(__dirname, req.url);
    fs.readFile(filePath, (err, data) => {
      if (err) { res.writeHead(404); return res.end("Not Found"); }
      const ext = path.extname(filePath);
      let type = "text/plain";
      if (ext === ".js") type = "application/javascript; charset=utf-8";
      if (ext === ".css") type = "text/css; charset=utf-8";
      res.writeHead(200, { "Content-Type": type });
      res.end(data);
    });
    return;
  }

  // Pages
  if (handlePages(req, res) !== false) return;

  // fallback 404
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not Found");
});

server.listen(3000, () => console.log("Server běží na http://localhost:3000"));