async function run() {
  try {
    const res = await fetch('http://localhost:3000/api/invoices/base-data');
    if (!res.ok) {
      console.error("HTTP error:", res.status);
      const text = await res.text();
      console.error(text);
      return;
    }
    const data = await res.json();
    console.log("Returned ticketTypes:", data.ticketTypes);
  } catch (err) {
    console.error("Fetch failed (maybe server not running):", err.message);
  }
}

run();
