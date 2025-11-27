import React, { useEffect, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import jiwaLogo from "../assets/Jiwa-Logo.png";

import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  writeBatch,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { logEvent } from "../utils/Logger";
import "../styles/additemmodal.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const NewOrderModal = ({ onClose }) => {
  const { user } = useAuth();

  const [inventory, setInventory] = useState([]);
  const [loadingInventory, setLoadingInventory] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState({}); // { [invId]: {entryType, qty} }
  const [invoiceNo, setInvoiceNo] = useState("");
  const [orderNo, setOrderNo] = useState("");
  const [saving, setSaving] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [schoolName, setSchoolName] = useState("");

  const [customerContact, setCustomerContact] = useState("");

  const [snack, setSnack] = useState({ open: false, msg: "", type: "info" });

  // fetch inventory once
  useEffect(() => {
    const fetchInventory = async () => {
      setLoadingInventory(true);
      try {
        const snap = await getDocs(collection(db, "inventory"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        // Keep only entries with positive totalUnits (optional)
        const filtered = list.filter((i) => Number(i.totalUnits ?? 0) > 0);
        // sort by itemName then pages
        filtered.sort((a, b) =>
          (a.itemName || "").localeCompare(b.itemName || "")
        );
        setInventory(filtered);
      } catch (err) {
        console.error("fetch inventory error", err);
        setSnack({
          open: true,
          msg: "Failed to load inventory",
          type: "error",
        });
      } finally {
        setLoadingInventory(false);
      }
    };
    fetchInventory();
  }, []);

  // filtered list for search
  const filteredInventory = inventory.filter((it) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const txt = `${it.itemName || ""} ${it.pages || ""} ${it.store || ""} ${
      it.productId || ""
    }`.toLowerCase();
    return txt.includes(q);
  });

  // toggle selection
  const toggleSelect = (inv) => {
    setSelected((s) => {
      if (s[inv.id]) {
        const copy = { ...s };
        delete copy[inv.id];
        return copy;
      }
      // default entryType to inventory.entryType and qty default 1
      return {
        ...s,
        [inv.id]: {
          entryType: inv.entryType || "Units",
          qty: 1,
        },
      };
    });
  };

  // set per-item field
  const setItemField = (invId, field, value) => {
    setSelected((s) => ({
      ...s,
      [invId]: {
        ...s[invId],
        [field]: value,
      },
    }));
  };

  function capitalizeFirstLetter(string) {
    if (string.length === 0) {
      return string; // Handle empty strings
    }
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  // compute orderTotalUnits for a selected item
  const computeOrderUnits = (inv, sel) => {
    const qty = Number(sel.qty || 0);
    if (sel.entryType?.toLowerCase() === "cartons") {
      const upc = Number(inv.unitsPerCarton || 0);
      return qty * (upc || 0);
    }
    return qty;
  };

  // validate before save
  const validate = () => {
    if (!invoiceNo.trim() || isNaN(Number(invoiceNo))) {
      setSnack({
        open: true,
        msg: "Invoice number required (number).",
        type: "warning",
      });
      return false;
    }
    if (!orderNo.trim() || isNaN(Number(orderNo))) {
      setSnack({
        open: true,
        msg: "Order number required (number).",
        type: "warning",
      });
      return false;
    }
    // Customer name required
    if (!customerName.trim()) {
      setSnack({
        open: true,
        msg: "Customer name is required.",
        type: "warning",
      });
      return false;
    }

    const keys = Object.keys(selected);
    if (keys.length === 0) {
      setSnack({
        open: true,
        msg: "Select at least one inventory item.",
        type: "warning",
      });
      return false;
    }
    // check each selected item qty positive and <= available totalUnits
    for (const id of keys) {
      const inv = inventory.find((i) => i.id === id);
      const sel = selected[id];
      const qty = Number(sel.qty || 0);
      if (qty <= 0) {
        setSnack({
          open: true,
          msg: "Quantity must be > 0 for all selected items.",
          type: "warning",
        });
        return false;
      }
      const orderUnits = computeOrderUnits(inv, sel);
      const available = Number(inv.totalUnits || 0);
      if (orderUnits > available) {
        setSnack({
          open: true,
          msg: `Ordered units exceed available for ${inv.itemName} (${available} available).`,
          type: "warning",
        });
        return false;
      }
    }
    return true;
  };

  // save: create order doc & update inventory (batch)
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      // build order items
      const items = Object.keys(selected).map((id) => {
        const inv = inventory.find((i) => i.id === id);
        const sel = selected[id];
        const orderUnits = computeOrderUnits(inv, sel);
        return {
          inventoryId: inv.id,
          productId: inv.productId || inv.productRef || null,
          productRef: inv.productRef || null,
          itemName: inv.itemName || null,
          pages: inv.pages || null,
          store: inv.store || null,
          entryType: sel.entryType,
          qty: Number(sel.qty),
          orderUnits,
          unitsPerCarton: inv.unitsPerCarton || null,
        };
      });

      const orderDoc = {
        customerName,
        schoolName: schoolName || null,
        customerContact: customerContact || null,
        invoiceNo: Number(invoiceNo),
        orderNo: Number(orderNo),
        items,
        status: "Pending",
        teamAssigned: null, // NEW FIELD
        createdBy: user?.email || "unknown",
        createdByUid: user?.uid || null,
        timestamp: new Date(),
      };

      // Save order
      await addDoc(collection(db, "orders"), orderDoc);

      // Batch update inventories
      const batch = writeBatch(db);
      for (const it of items) {
        const invDoc = inventory.find((i) => i.id === it.inventoryId);
        if (!invDoc) continue;
        const invRef = doc(db, "inventory", invDoc.id);

        const newTotalUnits = Math.max(
          Number(invDoc.totalUnits || 0) - Number(it.orderUnits),
          0
        );

        // compute new quantity for inventory based on entry type
        let newQuantity = newTotalUnits;
        const invEntryType = (invDoc.entryType || "Units").toLowerCase();
        const upc = Number(invDoc.unitsPerCarton || 1);
        if (invEntryType.includes("carton")) {
          newQuantity = Math.floor(newTotalUnits / (upc || 1));
        }

        batch.update(invRef, {
          totalUnits: newTotalUnits,
          quantity: newQuantity,
          timestamp: new Date(),
          updatedBy: user?.email || "unknown",
          updatedByUid: user?.uid || null,
        });
      }
      await batch.commit();

      // ---------- SMART LOG ----------
      await logEvent({
        userId: user?.uid || "unknown",
        email: user?.email || "unknown",
        action: "CREATE_ORDER",
        details: {
          orderNo: Number(orderNo),
          invoiceNo: Number(invoiceNo),
          customerName,
          schoolName,
          itemsCount: items.length,
          totalUnitsOrdered: items.reduce((sum, it) => sum + it.orderUnits, 0),
          items: items.map((i) => ({
            item: i.itemName,
            qty: i.qty,
            entryType: i.entryType,
            orderUnits: i.orderUnits,
            store: i.store,
          })),
        },
      });

      setSnack({
        open: true,
        msg: "Order saved and inventory updated.",
        type: "success",
      });

      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error("save order error", err);
      setSnack({ open: true, msg: "Failed to save order.", type: "error" });
      setSaving(false);
    }
  };

  const handleSaveAndPrintDraft = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      await handleSave();

      const dateStr = new Date().toLocaleDateString();
      const MIN_ROWS = 8;

      // Build rows including entry type in QTY column
      const rowsArray = Object.keys(selected)
        .map((id) => {
          const inv = inventory.find((i) => i.id === id);
          const sel = selected[id];
          if (!inv || !sel) return null;

          const particulars = inv.pages
            ? `${inv.itemName} • ${inv.pages}${
                inv.pages.toUpperCase().includes("QUIRE") ? "" : " pages"
              } • ${inv.category}`
            : `${inv.itemName} • ${inv.category}`;

          const qtyWithType = `${sel.qty} (${sel.entryType})`;

          return `
        <tr>
          <td>${qtyWithType}</td>
          <td>${computeOrderUnits(inv, sel)}</td>
          <td>${capitalizeFirstLetter(particulars)}</td>
        </tr>
      `;
        })
        .filter(Boolean);

      // Calculate totals
      const totalCartons = Object.keys(selected).reduce((sum, id) => {
        const sel = selected[id];
        return sel.entryType === "Cartons" ? sum + Number(sel.qty || 0) : sum;
      }, 0);

      const totalUnits = Object.keys(selected).reduce((sum, id) => {
        const inv = inventory.find((i) => i.id === id);
        const sel = selected[id];
        if (!inv || !sel) return sum;
        return sum + computeOrderUnits(inv, sel);
      }, 0);

      // -------------------------------
      // ✅ ADD BLANK ROWS FIRST
      // -------------------------------
      while (rowsArray.length < MIN_ROWS) {
        rowsArray.push(`
        <tr>
          <td style="height:25px;"></td>
          <td></td>
          <td></td>
        </tr>
      `);
      }

      // -------------------------------
      // ✅ TOTAL ROW ALWAYS LAST + SHADED
      // -------------------------------
      rowsArray.push(`
      <tr style="background:#eaeaea;">
        <td><strong>${totalCartons} cartons</strong></td>
        <td><strong>${totalUnits} units</strong></td>
        <td><strong>Total</strong></td>
      </tr>
    `);

      const rowsHtml = rowsArray.join("");

      const html = `
      <html>
        <head>
          <title>
            Delivery Note(Draft)-${orderNo}-${dateStr}
          </title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Inter', sans-serif;
              padding: 40px;
              position: relative;
            }

            .watermark {
              position: fixed;
              top: 45%;
              left: 50%;
              transform: translate(-50%, -50%);
              font-size: 100px;
              color: rgba(16, 16, 16, 0.41);
              font-weight: 700;
              letter-spacing: 10px;
              user-select: none;
              pointer-events: none;
              z-index: 3;
            }

            h1 {
              margin-top: 5px;
              letter-spacing: 1px;
            }

            .top {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 10px;
            }

            .logo img { height: 85px; }

            .contact {
              text-align: right;
              font-size: 14px;
              line-height: 1.4;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              font-size: 15px;
            }

            th {
              background: #f4f4f4;
              padding: 10px;
              border: 1px solid #ccc;
              font-weight: 600;
            }

            td {
              padding: 5px;
              border: 1px solid #ccc;
            }

            .sign-note {
              margin: 2px 0px 0px 0px;
              font-size:13px;
              font-weight: 300;
            }

            .signatures {
              margin-top: 30px;
              display: flex;
              justify-content: space-between;
              font-size: 14px;
            }

            .signature-block {
              width: 45%;
            }

            .sig-label {
              font-weight: 600;
              margin-top: 14px;
            }

            .line {
              border-bottom: 1px solid #000;
              width: 100%;
              height: 10px;
              margin-top: 14px;
            }

            .stamp-box {
              width: 90%;
              height: 65px;
              border-radius:8px;
              border: .5px solid #000000b0;
              margin-top:8px;
            }
          </style>
        </head>
        <body>
          <div class="watermark">DRAFT COPY</div>

          <div class="top">
            <div class="logo"><img src=${jiwaLogo} /></div>
            <div class="contact">
              Twaweza printing Press Ltd<br>
              Industrial Area, Likoni Road<br>
              Off Londiani Road<br>
              Opposite Bat Head Office<br>
              P.O. Box 33745 - 00600<br>
              Tell: +254 708 075 135<br>
              Nairobi, Kenya.<br>
              Email: sales@twawezapress.co.ke<br>
              twawezapress@gmail.com
            </div>
          </div>

          <h1>DELIVERY NOTE</h1>

          <div style="text-align:right; margin-bottom: 20px;">
            <strong>Date:</strong> ${dateStr}
          </div>

          <div style="margin-bottom:15px; font-size:15px;">
            <strong>Customer Name:</strong> ${customerName}<br>
            <strong>Invoice No:</strong> ${invoiceNo}<br>
            <strong>Order No:</strong> ${orderNo}
          </div>

          <strong>Please receive the following goods in good order and condition:</strong>

          <table>
            <thead>
              <tr>
                <th>QTY</th>
                <th>Total Units</th>
                <th>Particulars</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>

          <p class="sign-note">
            We/I have received/delivered the above goods in good order and condition
          </p>

          <div class="signatures">
            <div class="signature-block">
              <div class="sig-label">Received By</div>
              <div class="line"></div>
              <div class="sig-label">Sign & Stamp</div>
              <div class="stamp-box"></div>
            </div>

            <div class="signature-block">
              <div class="sig-label">Delivered By</div>
              <div class="line"></div>
              <div class="sig-label">Sign & Stamp</div>
              <div class="stamp-box"></div>
            </div>
          </div>
        </body>
      </html>
    `;

      const win = window.open("", "_blank");
      win.document.write(html);
      win.document.close();
      win.print();
    } catch (err) {
      console.error("Save and print draft error:", err);
      setSnack({
        open: true,
        msg: "Failed to save & print draft",
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  // convenience to remove an item from selection
  const removeSelection = (invId) => {
    setSelected((s) => {
      const copy = { ...s };
      delete copy[invId];
      return copy;
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* header */}
        <div className="modal-header">
          <h2>New Order</h2>
          <CloseIcon className="close-btn" onClick={onClose} />
        </div>

        {/* body layout like AddItemModal: left (list) + right (order summary) */}
        <div className="modal-body-wrapper">
          {/* LEFT: search + inventory list */}
          <div className="modal-body">
            <div className="form-group">
              <label>Search Inventory</label>
              <div className="search-box-modal">
                <SearchIcon className="search-icon-modal" />
                <input
                  className="search-box-modal-input"
                  placeholder={
                    loadingInventory
                      ? "Loading inventory..."
                      : "Search by item, pages, store, productId..."
                  }
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  disabled={loadingInventory}
                />
              </div>
            </div>

            <div
              className="manual-list-box"
              style={{ maxHeight: 260, overflowY: "auto" }}
            >
              {loadingInventory ? (
                <div style={{ textAlign: "center", padding: "1rem" }}>
                  <CircularProgress size={28} />
                  <p style={{ marginTop: 8, color: "#bbb" }}>
                    Loading inventory...
                  </p>
                </div>
              ) : filteredInventory.length === 0 ? (
                <p className="no-items">No inventory items found.</p>
              ) : (
                filteredInventory.map((inv) => {
                  const sel = selected[inv.id];
                  return (
                    <div
                      key={inv.id}
                      className="manual-item"
                      style={{ display: "flex", gap: 4 }}
                    >
                      <input
                        type="checkbox"
                        checked={!!sel}
                        onChange={() => toggleSelect(inv)}
                      />
                      <div style={{ flex: 1 }}>
                        <strong>
                          {inv.itemName}
                          {inv.pages ? ` • ${inv.pages}` : ""}
                        </strong>
                        <div style={{ fontSize: 12, opacity: 0.75 }}>
                          {inv.store} • {inv.productId || inv.productRef} •{" "}
                          {inv.totalUnits} units
                        </div>
                      </div>

                      {/* show a quick qty summary when selected */}
                      {sel && (
                        <div style={{ textAlign: "right" }}>
                          <button
                            onClick={() => removeSelection(inv.id)}
                            style={{
                              background: "transparent",
                              border: "none",
                              color: "red",
                              cursor: "pointer",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* For each selected item show controls */}
            {Object.keys(selected).length > 0 && (
              <div style={{ marginTop: 12 }}>
                <h4>Selected Items</h4>
                <div style={{ display: "grid", gap: 10 }}>
                  {Object.keys(selected).map((id) => {
                    const inv = inventory.find((i) => i.id === id);
                    const sel = selected[id];
                    if (!inv) return null;
                    return (
                      <div
                        key={id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 80px 100px 40px",
                          gap: 7,
                          alignItems: "center",
                          background: "rgba(255,255,255,0.03)",
                          padding: 8,
                          borderRadius: 8,
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {inv.itemName}
                            {inv.pages ? ` • ${inv.pages}` : ""}•
                            {` ${inv.category}`}
                          </div>
                          <div style={{ fontSize: 12, opacity: 0.75 }}>
                            {inv.store} • {inv.productId}
                          </div>
                        </div>

                        <div>
                          <label
                            style={{
                              fontSize: 12,
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            Order Type
                          </label>
                          <select
                            value={sel.entryType}
                            onChange={(e) =>
                              setItemField(id, "entryType", e.target.value)
                            }
                          >
                            <option value="Units">Units</option>
                            <option value="Cartons">Cartons</option>
                          </select>
                        </div>

                        <div>
                          <label
                            style={{
                              fontSize: 12,
                              display: "block",
                              marginBottom: 6,
                            }}
                          >
                            {sel.entryType === "Cartons" ? "Cartons" : "Units"}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={sel.qty}
                            onWheel={(e) => e.target.blur()}
                            onChange={(e) =>
                              setItemField(id, "qty", e.target.value)
                            }
                            style={{
                              width: "70%",
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid black",
                              background: "rgba(255, 255, 255, 0.74)",
                            }}
                          />
                        </div>

                        <div style={{ fontSize: 13, textAlign: "right" }}>
                          <div style={{ fontWeight: 700 }}>
                            {computeOrderUnits(inv, sel)} unit/s
                          </div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>
                            of {inv.totalUnits}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: order details + preview */}
          <div className="preview-card">
            <h3>Order Details</h3>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: "95%",
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.74)",
                }}
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                School Name (Optional)
              </label>
              <input
                type="text"
                value={schoolName}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setSchoolName(e.target.value)}
                style={{
                  width: "95%",
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.74)",
                }}
              />
            </div>
            {/* Customer Contact (optional) */}
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Customer Contact (Optional)
              </label>
              <input
                type="text"
                value={customerContact}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setCustomerContact(e.target.value)}
                style={{
                  width: "95%",
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.74)",
                }}
              />
            </div>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Invoice No
              </label>
              <input
                type="number"
                value={invoiceNo}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setInvoiceNo(e.target.value)}
                style={{
                  width: "80%",
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.74)",
                }}
              />
            </div>

            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", marginBottom: 6 }}>
                Order No
              </label>
              <input
                type="number"
                value={orderNo}
                onWheel={(e) => e.target.blur()}
                onChange={(e) => setOrderNo(e.target.value)}
                style={{
                  width: "80%",
                  padding: 8,
                  borderRadius: 8,
                  border: "none",
                  background: "rgba(255, 255, 255, 0.74)",
                }}
              />
            </div>

            <div style={{ marginTop: 5 }}>
              <h4>Summary</h4>
              <p style={{ margin: "6px 0" }}>
                Items: <strong>{Object.keys(selected).length}</strong>
              </p>
              <p style={{ margin: "6px 0" }}>
                Total Units:{" "}
                <strong>
                  {Object.keys(selected).reduce((sum, id) => {
                    const inv = inventory.find((i) => i.id === id);
                    const sel = selected[id];
                    if (!inv || !sel) return sum;
                    return sum + computeOrderUnits(inv, sel);
                  }, 0)}
                </strong>
              </p>

              <p style={{ marginTop: 8, fontSize: 13, color: "#777" }}>
                Status will be set to <strong>Pending</strong> after save.
              </p>
            </div>

            <div
              style={{
                marginTop: 8,
                display: "flex",
                gap: 6,
                justifyContent: "flex-end",
              }}
            >
              <Button variant="outlined" onClick={onClose} disabled={saving}>
                Cancel
              </Button>

              <Button
                variant="contained"
                onClick={handleSave}
                disabled={
                  saving ||
                  !customerName.trim() ||
                  !invoiceNo.trim() ||
                  !orderNo.trim() ||
                  Object.keys(selected).length === 0
                }
              >
                {saving ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  "Save Order"
                )}
              </Button>

              <Button
                variant="contained"
                color="secondary"
                onClick={handleSaveAndPrintDraft}
                disabled={
                  saving ||
                  !customerName.trim() ||
                  !invoiceNo.trim() ||
                  !orderNo.trim() ||
                  Object.keys(selected).length === 0
                }
              >
                Save & Print Draft
              </Button>
            </div>
          </div>
        </div>

        {/* Snackbar */}
        <Snackbar
          open={snack.open}
          autoHideDuration={3200}
          onClose={() => setSnack({ ...snack, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnack({ ...snack, open: false })}
            severity={snack.type}
          >
            {snack.msg}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default NewOrderModal;
