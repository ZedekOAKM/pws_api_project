const fs = require("fs");
const path = require("path");
const store = require("../storage/aircraftStorage");

const VIEWS_DIR = path.join(__dirname, "..", "views");

function loadView(name) { return fs.readFileSync(path.join(VIEWS_DIR, name), "utf-8"); }

function render(template, vars) {
  let out = template;
  for (const [k,v] of Object.entries(vars)) out = out.replaceAll(`{{${k}}}`, String(v));
  return out;
}

function renderLayout({ title, heading, content }) {
  const layout = loadView("layout.html");
  return render(layout, { title, heading, content });
}

function sendHtml(res, html, status=200) {
  res.writeHead(status, { "Content-Type":"text/html; charset=utf-8" });
  res.end(html);
}

function handlePages(req, res) {
  // public/app.js
  if (req.url === "/public/app.js" && req.method === "GET") {
    const js = fs.readFileSync(path.join(__dirname, "..", "public", "app.js"), "utf-8");
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    return res.end(js);
  }

  // GET /
  if (req.url === "/" && req.method === "GET") {
    const planes = store.getAll();
    const rows = planes.map(p => `
      <tr>
        <td>${p.id}</td>
        <td>${p.registration}</td>
        <td>${p.model}</td>
        <td>${p.capacity}</td>
       <td><span class="badge ${p.status}">${p.status}</span></td>
        <td>
          <a href="/aircraft/${p.id}">Detail</a>
          <a href="/edit/${p.id}">Upravit</a>
          <button data-delete-id="${p.id}">Smazat</button>
        </td>
      </tr>
    `).join("");

    const indexTpl = loadView("index.html");
    const content = render(indexTpl, { rows: rows || `<tr><td colspan="6">Žádná data.</td></tr>` });
    return sendHtml(res, renderLayout({ title:"Letadla", heading:"AirFleet Manager ✈️", content }));
  }

  // GET /aircraft/:id
  if (req.url.startsWith("/aircraft/") && req.method === "GET") {
    const id = Number(req.url.split("/")[2]);
    const plane = store.getById(id);
    if (!plane) {
      const errTpl = loadView("error.html");
      const content = render(errTpl, { message:"Letadlo nenalezeno." });
      return sendHtml(res, renderLayout({ title:"Chyba", heading:"Chyba", content }), 404);
    }
    const tpl = loadView("detail.html");
    const content = render(tpl, plane);
    return sendHtml(res, renderLayout({ title:"Detail", heading:"Detail letadla", content }));
  }

// GET /edit/:id
if (req.url.startsWith("/edit/") && req.method === "GET") {
  const id = Number(req.url.split("/")[2]);
  const plane = store.getById(id);

  if (!plane) {
    const errTpl = loadView("error.html");
    const content = render(errTpl, { message: "Letadlo nenalezeno." });
    return sendHtml(res, renderLayout({ title: "Chyba", heading: "Chyba", content }), 404);
  }

  const tpl = loadView("edit.html");


const vars = {
  ...plane,
  // Selecty pro edit
  manufacturerBoeing: plane.manufacturer === "Boeing" ? "selected" : "",
  manufacturerAirbus: plane.manufacturer === "Airbus" ? "selected" : "",
  manufacturerEmbraer: plane.manufacturer === "Embraer" ? "selected" : "",
  statusActive: plane.status === "active" ? "selected" : "",
  statusMaintenance: plane.status === "maintenance" ? "selected" : "",
  statusRetired: plane.status === "retired" ? "selected" : "",
  // Text pro badge
  statusText: plane.status === "active" ? "Aktivní" :
              plane.status === "maintenance" ? "Údržba" :
              plane.status === "retired" ? "Vyřazeno" : plane.status
};

  

  const content = render(tpl, vars);
  return sendHtml(res, renderLayout({ title: "Editace", heading: "Editace letadla", content }));
}

  return false;
}

module.exports = { handlePages };