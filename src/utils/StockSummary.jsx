import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export async function computeDashboardStockSummary() {
  // -------------------------------------------------
  // 1️⃣ FETCH INVENTORY
  // -------------------------------------------------
  const invSnap = await getDocs(collection(db, "inventory"));
  const inventory = invSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // -------------------------------------------------
  // 2️⃣ FETCH PRODUCTS
  // -------------------------------------------------
  const prodSnap = await getDocs(collection(db, "products"));

  const productsMap = {};
  const productsNameMap = {};

  prodSnap.docs.forEach((d) => {
    const data = d.data();
    const docId = d.id;
    const entry = { id: docId, ...data };

    // Map by doc id & productId
    productsMap[docId] = entry;
    if (data.productId) productsMap[data.productId] = entry;

    // Map by itemName
    if (data.itemName) {
      productsNameMap[data.itemName.trim().toLowerCase()] = entry;
    }

    // Map pages + itemName
    if (data.pages && data.itemName) {
      const combo = `${data.pages} ${data.itemName}`.trim().toLowerCase();
      productsNameMap[combo] = entry;
    }
  });

  // -------------------------------------------------
  // 3️⃣ JOIN INVENTORY + PRODUCTS (BUILD ROWS)
  // -------------------------------------------------
  const rows = inventory.map((inv) => {
    const prod =
      productsMap[inv.productRef] ||
      productsMap[inv.productId] ||
      productsNameMap[inv.itemName?.trim().toLowerCase()] ||
      productsNameMap[
        inv.pages && inv.itemName
          ? `${inv.pages} ${inv.itemName}`.trim().toLowerCase()
          : ""
      ] ||
      null;

    const totalUnits = Number(inv.totalUnits ?? inv.quantity ?? 0);
    const unitsPerCarton = Number(prod?.unitsPerCarton ?? 1);

    // Compute min stock in units
    let minUnits = null;
    if (prod) {
      const minVal = Number(prod.minStockValue ?? 0);
      const minType = (prod.minStockType ?? "Units").toLowerCase();
      minUnits = minType.includes("carton") ? minVal * unitsPerCarton : minVal;
    }

    // Determine status
    let status = "Unknown";
    if (totalUnits === 0) status = "Out of Stock";
    else if (minUnits !== null && totalUnits < minUnits) status = "Low";
    else if (minUnits !== null && totalUnits === minUnits) status = "Moderate";
    else if (minUnits !== null && totalUnits > minUnits) status = "In Stock";

    return {
      inventoryId: inv.id,
      productLabel:
        (inv.pages ? `${inv.pages} pgs ` : "") +
        (prod?.itemName || inv.itemName || inv.productId),
      category: prod?.category || inv.category || "—",

      entryType: inv.entryType || "Units",
      pages: inv.pages ?? null,
      quantity: inv.quantity ?? 0,
      totalUnits,
      status,
      unitsPerCarton,
    };
  });

  // -------------------------------------------------
  // 4️⃣ COMPUTE: JIWA + BELL CARTONS
  // -------------------------------------------------
  let jiwaCartons = 0;
  let bellCartons = 0;

  const lowStockItems = [];

  rows.forEach((item) => {
    const cat = item.category?.toLowerCase();

    const cartons = Math.round(item.totalUnits / item.unitsPerCarton);

    if (cat === "jiwa exer books") jiwaCartons += cartons;
    if (cat === "bell exer books") bellCartons += cartons;

    if (item.status === "Low" || item.status === "Out of Stock") {
      lowStockItems.push({
        category: item.category,
        pages: item.pages,
        itemName: item.productLabel,
        quantity: item.quantity,
        entryType: item.entryType,
        totalUnits: item.totalUnits,
      });
    }
  });

  return {
    jiwaCartons,
    bellCartons,
    lowStockItems,
    rows, // optional return if you want it
  };
}
