const fs = require("fs");
const path = require("path");

const AIRCRAFT_FILE = path.join(__dirname, "..", "data", "aircraft.json");

function loadAircraft() {
  try {
    const raw = fs.readFileSync(AIRCRAFT_FILE, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.log("❌ Chyba při čtení/parsu aircraft.json:", e.message);
    return [];
  }
}

function saveAircraft(planes) {
  try {
    fs.writeFileSync(AIRCRAFT_FILE, JSON.stringify(planes, null, 2), "utf-8");
  } catch (e) {
    console.log("❌ Chyba při zápisu do aircraft.json:", e.message);
  }
}

function getAll() { return loadAircraft(); }

function getById(id) {
  id = Number(id);
  if (isNaN(id)) return null;
  return loadAircraft().find(p => p.id === id) || null;
}

function create({ registration, model, manufacturer, capacity = 0, range = 0, status = "active" }) {
  const planes = loadAircraft();
  const newId = planes.length ? Math.max(...planes.map(p => p.id)) + 1 : 1;

  const plane = {
    id: newId,
    registration: String(registration || "").trim(),
    model: String(model || "").trim(),
    manufacturer: String(manufacturer || "").trim(),
    capacity: Number(capacity) || 0,
    range: Number(range) || 0,
    status: String(status || "active")
  };

  planes.push(plane);
  saveAircraft(planes);
  return plane;
}

function update(id, patch) {
  id = Number(id);
  if (isNaN(id)) return null;

  const planes = loadAircraft();
  const idx = planes.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const allowedFields = ["registration", "model", "manufacturer", "capacity", "range", "status"];
  for (const field of allowedFields) {
    if (patch[field] !== undefined) {
      if (field === "capacity" || field === "range") {
        planes[idx][field] = Number(patch[field]) || 0;
      } else {
        planes[idx][field] = String(patch[field]).trim();
      }
    }
  }

  saveAircraft(planes);
  return planes[idx];
}

function remove(id) {
  id = Number(id);
  if (isNaN(id)) return null;

  const planes = loadAircraft();
  const idx = planes.findIndex(p => p.id === id);
  if (idx === -1) return null;

  const removed = planes.splice(idx, 1)[0];
  saveAircraft(planes);
  return removed;
}

module.exports = { getAll, getById, create, update, remove };