import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { CircularProgress } from "@mui/material";
import "../styles/inventory.css";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

const formatTimestamp = (ts) => {
  if (!ts) return "—";
  // Firestore Timestamp can have toDate
  try {
    if (ts.toDate) return ts.toDate().toLocaleString();
    if (ts.seconds) return new Date(ts.seconds * 1000).toLocaleString();
    return new Date(ts).toLocaleString();
  } catch {
    return "—";
  }
};

const InventoryTable = () => {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]); // joined rows shown in table
  const [inventory, setInventory] = useState([]); // raw inventory docs
  const [productsMap, setProductsMap] = useState({}); // productId -> product doc
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [productsNameMap, setProductsNameMap] = useState({});

  useEffect(() => {
    setLoading(true);

    // inventory listener
    const unsubInv = onSnapshot(
      collection(db, "inventory"),
      (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setInventory(items);
      },
      (err) => {
        console.error("Inventory onSnapshot error:", err);
        setSnack({
          open: true,
          message: "Failed to listen to inventory.",
          severity: "error",
        });
      }
    );

    // products listener
    // products listener (replace your existing unsubProd block)
    const unsubProd = onSnapshot(
      collection(db, "products"),
      (snap) => {
        const map = {};
        const nameMap = {};
        snap.docs.forEach((d) => {
          const data = d.data();
          const docId = d.id;
          const entry = { id: docId, ...data };

          // map by doc id and by productId field (if present)
          if (docId) map[docId] = entry;
          if (data.productId) map[data.productId] = entry;

          // also map by lowercase itemName for robust matching
          if (data.itemName && typeof data.itemName === "string") {
            nameMap[data.itemName.trim().toLowerCase()] = entry;
          }

          // additionally map common combos: pages + name (e.g. "48 squared")
          if (data.pages && data.itemName) {
            const combo = `${data.pages} ${data.itemName}`.trim().toLowerCase();
            nameMap[combo] = entry;
          }
        });

        setProductsMap(map);
        setProductsNameMap(nameMap); // you will create this state
      },
      (err) => {
        /* existing error handler */
      }
    );

    return () => {
      unsubInv();
      unsubProd();
    };
  }, []);

  useEffect(() => {
    const joined = inventory.map((inv) => {
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

      if (!prod) {
        console.warn(
          "No product found for inventory:",
          inv.inventoryEntryId || inv.id || inv.productId,
          inv.itemName
        );
      } else {
        // debug price
        console.log(
          "Matched product",
          prod.productId,
          "unitPrice",
          prod.unitPrice
        );
      }

      // Unit price
      const unitPrice = Number(prod?.unitPrice ?? 0);

      // Total units (from inventory doc)
      const totalUnits = Number(inv.totalUnits ?? inv.quantity ?? 0);

      // Stock value
      const stockValue = totalUnits * unitPrice;

      // Threshold: convert minStockValue → units
      let minUnits = null;
      if (prod) {
        const minVal = Number(prod.minStockValue ?? 0);
        const minType = (prod.minStockType ?? "Units").toLowerCase();
        const unitsPerCarton = Number(prod.unitsPerCarton ?? 1);

        minUnits = minType.includes("carton")
          ? minVal * unitsPerCarton
          : minVal;
      }

      // -------------------------
      // ✅ Correct Status Logic
      // -------------------------
      let status = "Unknown";

      if (totalUnits === 0) {
        status = "Out of Stock"; // 🔴
      } else if (minUnits !== null && totalUnits < minUnits) {
        status = "Low"; // 🔴
      } else if (minUnits !== null && totalUnits === minUnits) {
        status = "Moderate"; // 🟠
      } else if (minUnits !== null && totalUnits > minUnits) {
        status = "In Stock"; // 🟢
      }

      // Page label
      const pageLabel = inv.pages
        ? String(inv.pages).toLowerCase().includes("quire")
          ? inv.pages
          : `${inv.pages} pgs`
        : "";

      // Build product label
      const productLabel = pageLabel
        ? `${pageLabel} ${prod?.itemName || inv.itemName || inv.productId}`
        : prod?.itemName || inv.itemName || inv.productId;

      return {
        inventoryId: inv.id,
        inventoryData: inv,
        product: prod,
        productLabel,
        category: prod?.category || inv.category || "—",
        store: inv.store || "—",
        quantity: Number(inv.quantity ?? 0),
        entryType: inv.entryType || "Units",
        totalUnits,
        updatedBy: inv.updatedBy || inv.updatedByUid || "—",
        timestamp: inv.timestamp || inv.createdAt || null,
        stockValue,
        minUnits,
        status,
        unitPrice,
        productId: inv.productId || prod?.productId || "—",
        unitsPerCarton: prod?.unitsPerCarton || inv.unitsPerCarton || null,
      };
    });

    setRows(joined);
    setLoading(false);
  }, [inventory, productsMap]);

  // function maskMiddle(text) {
  //   if (!text || text.length <= 5) return text; // nothing to mask
  //   return text.slice(0, 3) + "…" + text.slice(-2);
  // }

  function getStatusClass(status) {
    if (!status) return "status-red";

    const s = status.toLowerCase();

    if (s === "in stock") return "status-green";
    if (s === "moderate") return "status-orange";
    if (s === "low") return "status-red";
    if (s === "out of stock") return "status-red";

    return "status-red"; // fallback
  }

  const filteredRows = rows.filter((data) => {
    const q = search.trim().toLowerCase();

    const matchesSearch =
      !q ||
      (data.productLabel || "").toLowerCase().includes(q) ||
      (data.category || "").toLowerCase().includes(q) ||
      (data.productId || "").toLowerCase().includes(q) ||
      (data.store || "").toLowerCase().includes(q) ||
      (data.updatedBy || "").toLowerCase().includes(q);

    const matchesStatus = filter === "All" || data.status === filter; // simple and clean

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="inventory-table-container">
      <div className="table-header">
        <h3 className="inventory-table-title">Inventory List</h3>
        {/* Search Bar */}
        <div className="search-box">
          <SearchIcon className="icon" />
          <input
            type="text"
            placeholder="Search stock..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FilterListIcon className="icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Low">Low</option>
            <option value="Moderate">Moderate</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>
      <div className="inventory-table-wrapper">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <CircularProgress />
            <div style={{ marginTop: 8, color: "#666" }}>Loading stock...</div>
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Store</th>
                <th>Quantity</th>
                <th>Total Units</th>
                <th>Timestamp</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: "center", padding: 24 }}>
                    No stock entries found.
                  </td>
                </tr>
              ) : (
                filteredRows.map((data) => (
                  <tr key={data.inventoryId}>
                    <td>{data.productLabel}</td>
                    <td>{data.category}</td>
                    <td>{data.store}</td>
                    <td>
                      {data.quantity} {data.entryType}
                    </td>
                    <td>{data.totalUnits}</td>
                    <td>{formatTimestamp(data.timestamp)}</td>

                    <td>
                      <span
                        className={`status-chip ${getStatusClass(data.status)}`}
                      >
                        {data.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryTable;
