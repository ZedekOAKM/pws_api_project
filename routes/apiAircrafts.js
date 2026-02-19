const store = require("../storage/aircraftStorage");

function readBodyJson(req, cb) {
  let body = "";
  req.on("data", chunk => body += chunk);
  req.on("end", () => {
    try { cb(null, JSON.parse(body || "{}")); }
    catch (e) { cb(e); }
  });
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function handleApiAircrafts(req, res) {
  // GET all
  if ((req.url === "/api/aircrafts" || req.url === "/api/aircrafts/") && req.method === "GET") {
    sendJson(res, 200, store.getAll());
    return true;
  }

  // GET by id
  if (req.url.startsWith("/api/aircrafts/") && req.method === "GET") {
    const id = Number(req.url.split("/")[3]);
    if (isNaN(id)) { sendJson(res, 400, { error:"Neplatné ID" }); return true; }
    const plane = store.getById(id);
    if (!plane) { sendJson(res, 404, { error:"Letadlo nenalezeno" }); return true; }
    sendJson(res, 200, plane);
    return true;
  }

  // POST create
  if ((req.url === "/api/aircrafts" || req.url === "/api/aircrafts/") && req.method === "POST") {
    return readBodyJson(req, (err, data) => {
      if (err) { sendJson(res, 400, { error:"Neplatný JSON" }); return; }

      const { registration, model, manufacturer, capacity, range, status } = data;
      if (!registration || !model || !manufacturer) {
        sendJson(res, 400, { error:"Chybí povinná pole" }); return;
      }

      const created = store.create({ registration, model, manufacturer, capacity, range, status });
      sendJson(res, 201, created);
    });
  }

  // PUT update
  if (req.url.startsWith("/api/aircrafts/") && req.method === "PUT") {
    const id = Number(req.url.split("/")[3]);
    if (isNaN(id)) { sendJson(res, 400, { error:"Neplatné ID" }); return true; }
    return readBodyJson(req, (err, data) => {
      if (err) { sendJson(res, 400, { error:"Neplatný JSON" }); return; }
      const updated = store.update(id, data);
      if (!updated) { sendJson(res, 404, { error:"Letadlo nenalezeno" }); return; }
      sendJson(res, 200, updated);
    });
  }

  // DELETE
  if (req.url.startsWith("/api/aircrafts/") && req.method === "DELETE") {
    const id = Number(req.url.split("/")[3]);
    if (isNaN(id)) { sendJson(res, 400, { error:"Neplatné ID" }); return true; }
    const removed = store.remove(id);
    if (!removed) { sendJson(res, 404, { error:"Letadlo nenalezeno" }); return true; }
    sendJson(res, 200, { message:"Letadlo smazáno", plane: removed });
    return true;
  }

  function getById(id) {
  id = Number(id);
  if (isNaN(id)) return null;
  return loadAircraft().find(p => p.id === id) || null;
}

  return false;
}

module.exports = { handleApiAircrafts };