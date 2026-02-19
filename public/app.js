// Vytváření letadla
const createForm = document.getElementById("createForm");
if (createForm) {
  createForm.addEventListener("submit", e => {
    e.preventDefault();

    const data = {
      registration: createForm.registration.value.trim(),
      model: createForm.model.value.trim(),
      manufacturer: createForm.manufacturer.value,
      capacity: Number(createForm.capacity.value),
      range: Number(createForm.range.value),
      status: createForm.status.value
    };

    fetch("/api/aircrafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(resData => {
      if (resData.error) {
        document.getElementById("createMsg").textContent = resData.error;
      } else {
        document.getElementById("createMsg").textContent = "Letadlo přidáno!";
        createForm.reset();
        setTimeout(() => location.reload(), 500);
      }
    })
    .catch(err => console.error(err));
  });
}

// Mazání letadla s potvrzením imatrikulace
document.querySelectorAll("button[data-delete-id]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const id = btn.dataset.deleteId;

    // Načteme letadlo z API, aby jsme získali imatrikulaci
    const plane = await fetch(`/api/aircrafts/${id}`).then(r => r.json());
    if (!plane || plane.error) {
      alert("Letadlo nenalezeno!");
      return;
    }

    const confirmRegistration = prompt(`Pro potvrzení smazání napište imatrikulaci letadla: ${plane.registration}`);
    if (confirmRegistration !== plane.registration) {
      alert("Imatrikulace se neshoduje. Letadlo nebude smazáno.");
      return;
    }

    fetch(`/api/aircrafts/${id}`, { method: "DELETE" })
      .then(r => r.json())
      .then(() => location.reload())
      .catch(console.error);
  });
});

// Editace letadla (PUT)
const editForm = document.getElementById("editForm");
if (editForm) {
  editForm.addEventListener("submit", e => {
    e.preventDefault();

    const id = Number(editForm.dataset.id);
    if (isNaN(id)) {
      alert("Chyba: neplatné ID letadla");
      return;
    }

    const data = {
      registration: editForm.registration.value.trim(),
      model: editForm.model.value.trim(),
      manufacturer: editForm.manufacturer.value,
      capacity: Number(editForm.capacity.value),
      range: Number(editForm.range.value),
      status: editForm.status.value
    };

    fetch(`/api/aircrafts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(resData => {
      const msg = document.getElementById("editMsg");
      if (resData.error) {
        msg.textContent = resData.error;
      } else {
        msg.textContent = "Změny uloženy!";
        setTimeout(() => window.location.href = `/aircraft/${id}`, 500);
      }
    })
    .catch(err => console.error(err));
  });
}