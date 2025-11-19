// src/pages/Stock.jsx
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

import {
  IconButton,
  Menu,
  MenuItem,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  useMediaQuery,
} from "@mui/material";

import MoreVertIcon from "@mui/icons-material/MoreVert";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";

import "../styles/products.css"; // reuse your products styles

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

export default function Stock() {
  const [inventory, setInventory] = useState([]); // raw inventory docs
  const [productsMap, setProductsMap] = useState({}); // productId -> product doc
  const [rows, setRows] = useState([]); // joined rows shown in table
  const [loading, setLoading] = useState(true);

  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [productsNameMap, setProductsNameMap] = useState({});

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const [search, setSearch] = useState("");
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const isMobile = useMediaQuery("(max-width:768px)");
  const printRef = useRef();

  // edit form state
  const [editPayload, setEditPayload] = useState({
    quantity: "",
    entryType: "Units",
    store: "Main Store",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // ---------- real-time listeners ----------
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

      // Product label
      const productLabel =
        prod?.itemName ||
        (inv.pages ? `${inv.pages} ${inv.itemName}` : inv.itemName) ||
        inv.productId;

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

  // ---------- filters ----------
  const filteredRows = rows.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      (r.productLabel || "").toLowerCase().includes(q) ||
      (r.category || "").toLowerCase().includes(q) ||
      (r.productId || "").toLowerCase().includes(q) ||
      (r.store || "").toLowerCase().includes(q) ||
      (r.updatedBy || "").toLowerCase().includes(q)
    );
  });

  // ---------- menu handlers ----------
  const openMenu = (event, row) => {
    setAnchorEl(event.currentTarget);
    setSelectedRow(row);
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setSelectedRow(null);
  };

  // ---------- delete ----------
  const confirmDelete = (row) => {
    setSelectedRow(row);
    setOpenDelete(true);
    closeMenu();
  };
  const doDelete = async () => {
    if (!selectedRow) return;
    try {
      await deleteDoc(doc(db, "inventory", selectedRow.inventoryId));
      setSnack({
        open: true,
        message: "Inventory entry deleted.",
        severity: "success",
      });
      setOpenDelete(false);
      setSelectedRow(null);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Delete failed.", severity: "error" });
    }
  };

  // ---------- edit ----------
  const openEditDialog = (row) => {
    setSelectedRow(row);
    setEditPayload({
      quantity: row.quantity,
      entryType: row.entryType,
      store: row.store,
    });
    setOpenEdit(true);
    closeMenu();
  };

  const saveEdit = async () => {
    if (!selectedRow) return;
    setSavingEdit(true);

    try {
      // compute new totalUnits based on entryType
      let newQuantity = Number(editPayload.quantity || 0);
      let newTotalUnits = newQuantity;

      // if cartons, multiply by unitsPerCarton (prefer product unitsPerCarton)
      const unitsPerCarton = Number(selectedRow.unitsPerCarton || 0);
      if (editPayload.entryType?.toLowerCase() === "cartons") {
        newTotalUnits = newQuantity * (unitsPerCarton || 1);
      }

      const invRef = doc(db, "inventory", selectedRow.inventoryId);
      await updateDoc(invRef, {
        quantity: newQuantity,
        totalUnits: newTotalUnits,
        entryType: editPayload.entryType,
        store: editPayload.store,
        // update timestamp
        timestamp: new Date(),
      });

      setSnack({
        open: true,
        message: "Inventory updated.",
        severity: "success",
      });
      setOpenEdit(false);
      setSelectedRow(null);
    } catch (err) {
      console.error(err);
      setSnack({ open: true, message: "Update failed.", severity: "error" });
    } finally {
      setSavingEdit(false);
    }
  };

  // ---------- PDF and Print ----------
  const handleDownload = () => {
    // Use a simple table HTML approach for printing; you can replace with jsPDF if you prefer
    const rowsHtml = filteredRows
      .map((r) => {
        const name = r.productLabel;
        const cat = r.category;
        const store = r.store;
        const qty = r.quantity;
        const entryType = r.entryType;
        const totalUnits = r.totalUnits;
        const updatedBy = r.updatedBy;
        const ts = formatTimestamp(r.timestamp);
        const stockValue = (r.stockValue || 0).toLocaleString();
        const status = r.status;
        return `<tr>
          <td>${name}</td>
          <td>${cat}</td>
          <td>${store}</td>
          <td>${qty}</td>
          <td>${entryType}</td>
          <td>${totalUnits}</td>
          <td>${updatedBy}</td>
          <td>${ts}</td>
          <td>KES ${stockValue}</td>
          <td>${status}</td>
        </tr>`;
      })
      .join("");

    const html = `
      <html>
        <head>
          <title>Stock Breakdown</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { border-collapse: collapse; width: 100%; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
            th { background: #f3f4f6; font-weight: 600; }
            h2 { text-align: center; }
          </style>
        </head>
        <body>
          <h2>Stock Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th><th>Category</th><th>Store</th><th>Quantity</th>
                <th>Entry Type</th><th>Total Units</th><th>Updated By</th><th>Timestamp</th>
                <th>Stock Value</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const newWin = window.open("", "_blank");
    newWin.document.write(html);
    newWin.document.close();
    newWin.print();
  };

  // ---------- render ----------
  return (
    <div
      className="products-page"
      style={{ padding: isMobile ? "1rem" : "1.5rem" }}
    >
      <div className="products-controls" style={{ marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<PrintIcon />}
            onClick={handleDownload}
          >
            Print
          </Button>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <div className="search-bar" style={{ alignItems: "center" }}>
            <SearchIcon />
            <input
              placeholder="Search stock..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: "none",
                outline: "none",
                marginLeft: 8,
                background: "transparent",
                color: "#111827",
              }}
            />
          </div>
        </div>
      </div>

      <div className="table-wrapper" style={{ overflowX: "auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <CircularProgress />
            <div style={{ marginTop: 8, color: "#666" }}>Loading stock...</div>
          </div>
        ) : (
          <table className="products-table" style={{ minWidth: 980 }}>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Store</th>
                <th>Quantity</th>
                <th>Entry Type</th>
                <th>Total Units</th>
                <th>Updated By</th>
                <th>Timestamp</th>
                <th>Stock Value</th>
                <th>Status</th>
                <th></th>
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
                filteredRows.map((r) => (
                  <tr key={r.inventoryId}>
                    <td>{r.productLabel}</td>
                    <td>{r.category}</td>
                    <td>{r.store}</td>
                    <td>{r.quantity}</td>
                    <td>{r.entryType}</td>
                    <td>{r.totalUnits}</td>
                    <td>{r.updatedBy}</td>
                    <td>{formatTimestamp(r.timestamp)}</td>
                    <td>KES {(r.stockValue || 0).toLocaleString()}</td>
                    <td
                      style={{
                        color:
                          r.status === "Low"
                            ? "#d32f2f"
                            : r.status === "Out of Stock"
                            ? "#b71c1c"
                            : "#2e7d32",
                        fontWeight: 700,
                      }}
                    >
                      {r.status}
                    </td>
                    <td>
                      <IconButton onClick={(e) => openMenu(e, r)}>
                        <MoreVertIcon />
                      </IconButton>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Row Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
        <MenuItem
          onClick={() => {
            openEditDialog(selectedRow);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            confirmDelete(selectedRow);
          }}
          sx={{ color: "error.main" }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirm */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Stock Entry</DialogTitle>
        <DialogContent>
          Are you sure you want to delete the stock entry for{" "}
          <strong>{selectedRow?.productLabel}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={doDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit dialog */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Stock Entry</DialogTitle>
        <DialogContent>
          <div style={{ display: "grid", gap: 12, marginTop: 8 }}>
            <TextField
              label="Quantity (units/cartons depending on entry type)"
              type="number"
              value={editPayload.quantity}
              onChange={(e) =>
                setEditPayload({ ...editPayload, quantity: e.target.value })
              }
            />

            <FormControl fullWidth>
              <InputLabel>Entry Type</InputLabel>
              <Select
                native
                value={editPayload.entryType}
                onChange={(e) =>
                  setEditPayload({ ...editPayload, entryType: e.target.value })
                }
              >
                <option value="Units">Units</option>
                <option value="Cartons">Cartons</option>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Store</InputLabel>
              <Select
                native
                value={editPayload.store}
                onChange={(e) =>
                  setEditPayload({ ...editPayload, store: e.target.value })
                }
              >
                <option value="Main Store">Main Store</option>
                <option value="Production Store">Production Store</option>
              </Select>
            </FormControl>

            <div style={{ fontSize: 13, color: "#444" }}>
              <strong>Preview:</strong>{" "}
              {selectedRow
                ? `Total units after save: ${
                    editPayload.entryType === "Cartons"
                      ? Number(editPayload.quantity || 0) *
                        Number(selectedRow.unitsPerCarton || 1)
                      : Number(editPayload.quantity || 0)
                  }`
                : "-"}
            </div>
          </div>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit} disabled={savingEdit}>
            {savingEdit ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snack.severity}>{snack.message}</Alert>
      </Snackbar>
    </div>
  );
}
