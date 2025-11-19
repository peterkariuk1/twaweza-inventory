import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CircularProgress from "@mui/material/CircularProgress";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { db } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

import "../styles/addItemModal.css";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const ReceiveStockModal = ({ onClose }) => {
  const { user } = useAuth();

  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [entryType, setEntryType] = useState("Units");
  const [quantity, setQuantity] = useState("");
  const [store, setStore] = useState("Main Store");

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [saving, setSaving] = useState(false);
  const [snack, setSnack] = useState({ open: false, type: "info", msg: "" });

  // Fetch products once
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const snap = await getDocs(collection(db, "products"));
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // ✅ Sort alphabetically by itemName
        const sortedList = list.sort((a, b) =>
          a.category.toLowerCase().localeCompare(b.category.toLowerCase())
        );

        setProducts(sortedList);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setSnack({ open: true, type: "error", msg: "Failed to load products" });
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Safe auto-calc total units
  const calculatedUnits =
    entryType === "Cartons" && selectedItem && selectedItem.unitsPerCarton
      ? Number(quantity || 0) * Number(selectedItem.unitsPerCarton || 0)
      : Number(quantity || 0);

  // Dynamic display label
  const displayQuantityLabel =
    entryType === "Cartons" && selectedItem && Number(quantity) > 0
      ? `${quantity} Carton(s) → ${calculatedUnits} Units`
      : "";

  // Generate inventory entry id using calculatedUnits (store prefix + productSuffix + qty + 3 random chars)
  const generateInventoryEntryId = () => {
    if (!selectedItem) return "";

    // productId example: TWZ-JIW-NRDTF -> we want suffix: JIW-NRDTF
    const productSuffix = selectedItem.productId
      ? selectedItem.productId.split("-").slice(1).join("-")
      : "UNK";

    const storePrefix = store === "Production Store" ? "PD" : "MN";
    const randomPart = Math.random().toString(36).substring(2, 5).toUpperCase();

    // Use computed units (not user typed when cartons)
    return `${storePrefix}-${productSuffix}-${calculatedUnits}-${randomPart}`;
  };

  // Live filter
  const filteredItems = products.filter((p) => {
    const txt = `${p.productId} ${p.itemName} ${p.category} ${
      p.pages || ""
    }`.toLowerCase();
    return txt.includes(search.toLowerCase());
  });

  const clearSelection = () => {
    setSelectedItem(null);
    setSearch("");
    setQuantity("");
    setEntryType("Units");
  };

  // Validation for the Save button
  const isFormValid = () => {
    if (!selectedItem) return false;
    if (!quantity || Number(quantity) <= 0) return false;
    // If cartons chosen, ensure unitsPerCarton exists
    if (entryType === "Cartons" && !selectedItem.unitsPerCarton) return false;
    return true;
  };

  // Save handler
  // Save handler
  const handleSave = async () => {
    if (!isFormValid()) {
      setSnack({
        open: true,
        type: "warning",
        msg: "Complete all fields before saving.",
      });
      return;
    }

    setSaving(true);
    try {
      const entryData = {
        inventoryEntryId: generateInventoryEntryId(),

        // ✅ NEW — Make sure productId is stored in inventory doc
        productId: selectedItem.productId,

        productRef: selectedItem.id,
        itemName: selectedItem.itemName,
        category: selectedItem.category,
        pages: selectedItem.pages || null,

        entryType,
        quantity: Number(quantity), // as entered (units or cartons)
        totalUnits: calculatedUnits, // always units
        unitsPerCarton: selectedItem.unitsPerCarton || null,
        store,
        timestamp: new Date(),

        updatedBy: user?.email || "Unknown",
        updatedByUid: user?.uid || null,
      };

      await addDoc(collection(db, "inventory"), entryData);

      setSnack({
        open: true,
        type: "success",
        msg: "Stock received successfully.",
      });

      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 650);
    } catch (err) {
      console.error("Save inventory error:", err);
      setSnack({ open: true, type: "error", msg: "Failed to save entry." });
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container receive-modal">
        <div className="modal-header">
          <h2>Receiving Stock</h2>
          <CloseIcon className="close-btn" onClick={onClose} />
        </div>

        <div className="modal-body">
          {/* SEARCH AREA WHEN NO PRODUCT IS SELECTED */}
          {!selectedItem && (
            <>
              <div className="form-group">
                <label>Search Product</label>
                <div className="search-box-modal">
                  <SearchIcon className="search-icon-modal" />
                  <input
                    className="search-box-modal-input"
                    type="text"
                    placeholder={
                      loadingProducts
                        ? "Loading products..."
                        : "Search by name, category, pages, product ID..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    disabled={loadingProducts}
                  />
                </div>
              </div>

              <div className="manual-list-box">
                {loadingProducts ? (
                  <div style={{ textAlign: "center", padding: "1rem" }}>
                    <CircularProgress size={28} />
                    <p style={{ marginTop: 8, color: "#bbb" }}>
                      Loading products...
                    </p>
                  </div>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((prod) => (
                    <div
                      key={prod.id}
                      className={`manual-item ${
                        selectedItem?.id === prod.id ? "selected" : ""
                      }`}
                      onClick={() => {
                        setSelectedItem(prod);
                        setSearch("");
                        setQuantity("");
                        setEntryType("Units");
                      }}
                    >
                      <strong className="manual-list-text">
                        {prod.category}
                      </strong>{" "}
                      <span
                        className="manual-list-text"
                        style={{ opacity: 0.75 }}
                      >
                        • {prod.itemName}
                        {prod.pages
                          ? prod.pages.toUpperCase().includes("QUIRE")
                            ? ` • ${prod.pages}`
                            : ` • ${prod.pages} pgs`
                          : ""}
                        {" • "}
                        {prod.productId}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="no-items">No matching product found.</p>
                )}
              </div>
            </>
          )}

          {/* SELECTED ITEM SUMMARY */}
          {selectedItem && (
            <div className="selected-product-box">
              <div className="sp-left">
                <strong> {selectedItem.category}</strong>
                <p style={{ opacity: 0.8, fontSize: "0.8rem" }}>
                  {selectedItem.itemName}
                  {selectedItem.pages ? ` • ${selectedItem.pages}` : ""}
                  {" • "}
                  {selectedItem.productId}
                </p>
              </div>

              <button className="clear-selected-btn" onClick={clearSelection}>
                ✕
              </button>
            </div>
          )}

          {/* ENTRY FIELDS */}
          {selectedItem && (
            <>
              {/* Entry Type */}
              <div className="form-group">
                <label>Entry Type</label>
                <div className="min-level-type">
                  <label>
                    <input
                      type="radio"
                      checked={entryType === "Units"}
                      onChange={() => {
                        setEntryType("Units");
                      }}
                    />
                    Units
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={entryType === "Cartons"}
                      onChange={() => {
                        setEntryType("Cartons");
                      }}
                    />
                    Cartons
                  </label>
                </div>
              </div>

              {/* Quantity */}
              <div className="form-group">
                <label>Quantity Received</label>

                <input
                  type="number"
                  min="1"
                  onWheel={(e) => e.target.blur()}
                  placeholder={`Enter quantity in ${entryType}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />

                {/* combined display only when cartons & positive number */}
                {entryType === "Cartons" &&
                  Number(quantity) > 0 &&
                  selectedItem && (
                    <p className="combined-display">{displayQuantityLabel}</p>
                  )}
              </div>

              {/* Store */}
              <div className="form-group">
                <label>Receiving Store</label>
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                >
                  <option value="Main Store">Main Store</option>
                  <option value="Production Store">Production Store</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={saving}>
            Cancel
          </button>

          <button
            className="save-btn"
            onClick={handleSave}
            disabled={saving || !isFormValid()}
          >
            {saving ? (
              <CircularProgress size={18} color="inherit" />
            ) : (
              "Save Entry"
            )}
          </button>
        </div>

        {/* Snackbars */}
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

export default ReceiveStockModal;
