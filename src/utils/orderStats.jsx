export function computeOrderStats(orders) {
  const now = new Date();

  // ---------------------- TODAY + YESTERDAY ----------------------
  const todayStr = now.toDateString();

  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterdayStr = y.toDateString();

  // ---------------------- MONTH ----------------------
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // ---------------------- COUNTERS ----------------------
  let todayCount = 0;
  let yesterdayCount = 0;
  let pendingCount = 0;
  let dispatchedCount = 0;
  let monthCount = 0;

  // For top clients
  const clientItemTotals = {}; // { 'John Doe': 45, 'Mary': 22 }

  orders.forEach((o) => {
    const dateObj = o.timestamp?.toDate ? o.timestamp.toDate() : null;
    if (!dateObj) return;

    const dateStr = dateObj.toDateString();

    // ----- COUNT TODAY / YESTERDAY -----
    if (dateStr === todayStr) todayCount++;
    if (dateStr === yesterdayStr) yesterdayCount++;

    // ----- MONTH COUNT -----
    if (
      dateObj.getMonth() === currentMonth &&
      dateObj.getFullYear() === currentYear
    ) {
      monthCount++;
    }

    // ----- STATUS COUNTS -----
    if (o.status === "Pending") pendingCount++;
    if (o.status === "Dispatched") dispatchedCount++;

    // ----- TOP CLIENTS BY ITEMS PURCHASED -----
    const totalItems = o.items?.reduce((sum, item) => {
      const qty =
        item.entryType === "Cartons"
          ? item.orderUnits * item.unitsPerCarton
          : item.orderUnits;

      return sum + qty;
    }, 0) || 0;

    const client = o.customerName || "Unknown";

    if (!clientItemTotals[client]) clientItemTotals[client] = 0;
    clientItemTotals[client] += totalItems;
  });

  // ---------------------- PERCENTAGE DIFFERENCE ----------------------
  let difference = "0%";

  if (yesterdayCount === 0 && todayCount > 0) {
    difference = "+100%";
  } else if (yesterdayCount === 0 && todayCount === 0) {
    difference = "0%";
  } else {
    const diff = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
    const rounded = diff.toFixed(1);
    difference = `${diff >= 0 ? "+" : ""}${rounded}%`;
  }

  // ---------------------- TOP 3 CLIENTS ----------------------
  const topClients = Object.entries(clientItemTotals)
    .map(([client, total]) => ({ client, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 3);

  // ---------------------- RETURN EVERYTHING ----------------------
  return {
    todayCount,
    yesterdayCount,
    monthCount,
    pendingCount,
    dispatchedCount,
    difference,
    topClients,
  };
}
