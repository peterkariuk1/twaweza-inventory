import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import CategoryIcon from "@mui/icons-material/Category";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import LayersIcon from "@mui/icons-material/Layers";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import "../styles/additemmodal.css";

// Toast Component
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const AddItemModal = ({ onClose }) => {
  const categories = [
    "Jiwa Exer Books",
    "Bell Exer Books",
    "Printed Exer Books",
    "Manilla Paper",
    "Book Covers",
    "Ream Papers",
    "Raw Material",
  ];

  const pageCategories = [
    "Jiwa Exer Books",
    "Bell Exer Books",
    "Printed Exer Books",
  ];

  const pageOptions = [
    "48",
    "64",
    "80",
    "96",
    "120",
    "200",
    "1 QUIRE",
    "2 QUIRE",
    "3 QUIRE",
    "4 QUIRE",
  ];

  // STATE
  const [category, setCategory] = useState("");
  const [pages, setPages] = useState("");
  const [itemName, setItemName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitsPerCarton, setUnitsPerCarton] = useState("");
  const [minStockType, setMinStockType] = useState("Units");
  const [minStockValue, setMinStockValue] = useState("");

  // Toast
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = (msg, sev = "info") => {
    setToast({ open: true, message: msg, severity: sev });
  };

  const pricePerCarton =
    unitPrice && unitsPerCarton
      ? (parseFloat(unitPrice) * parseInt(unitsPerCarton)).toFixed(2)
      : "0.00";

  // ✅ Generate Product ID
  const generateProductId = () => {
    const prefix = "TWZ";
    const catShort = category
      .replace(/[^A-Za-z]/g, "")
      .slice(0, 3)
      .toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    return `${prefix}-${catShort}-${randomPart}`;
  };

  // ✅ Dynamic Placeholder Logic
  const getPlaceholder = () => {
    switch (category) {
      case "Jiwa Exer Books":
      case "Bell Exer Books":
      case "Printed Exer Books":
        return "e.g graph, squared, ruled";
      case "Manilla Paper":
        return "e.g blue, assorted";
      case "Book Covers":
        return "e.g laminated, branded";
      case "Raw Material":
        return "e.g packaging cartons";
      case "Ream Papers":
        return "e.g 500 sheets";
      default:
        return "Enter item name";
    }
  };

  // ✅ Save to Firestore
  const handleSave = async () => {
    if (!category) return showToast("Select a category.", "warning");
    if (pageCategories.includes(category) && !pages)
      return showToast("Select number of pages.", "warning");

    if (!itemName || !unitPrice || !unitsPerCarton)
      return showToast("Fill all required fields.", "error");

    const productId = generateProductId();

    await addDoc(collection(db, "products"), {
      productId,
      category,
      pages: pages || null,
      itemName,
      unitPrice: parseFloat(unitPrice),
      unitsPerCarton: parseInt(unitsPerCarton),
      pricePerCarton: parseFloat(pricePerCarton),
      minStockType,
      minStockValue: parseInt(minStockValue || 0),
      createdAt: new Date(),
    });

    showToast("Item saved successfully!", "success");
    setTimeout(() => onClose(), 800);
  };

  // ✅ Disable SAVE button if form invalid
  const isFormValid =
    category &&
    itemName &&
    unitPrice &&
    unitsPerCarton &&
    (!pageCategories.includes(category) || pages);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* HEADER */}
        <div className="modal-header">
          <h2>Add New Inventory Item</h2>
          <CloseIcon className="close-btn" onClick={onClose} />
        </div>

        <div className="modal-body-wrapper">
          {/* LEFT SIDE — FORM */}
          <div className="modal-body">
            {/* CATEGORY GRID */}
            <div className="form-group">
              <label>
                <CategoryIcon /> Category
              </label>

              <div className="category-grid">
                {categories.map((cat, i) => (
                  <div
                    key={i}
                    className={`category-box ${
                      category === cat ? "selected" : ""
                    }`}
                    onClick={() => {
                      setCategory(cat);
                      setPages("");
                    }}
                  >
                    {cat}
                  </div>
                ))}
              </div>
            </div>

            {/* PAGES GRID */}
            {pageCategories.includes(category) && (
              <div className="form-group">
                <label>
                  <FormatListNumberedIcon /> Pages
                </label>

                <div className="pages-grid">
                  {pageOptions.map((pg, i) => (
                    <div
                      key={i}
                      className={`page-box ${pages === pg ? "selected" : ""}`}
                      onClick={() => setPages(pg)}
                    >
                      {pg}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ITEM NAME */}
            <div className="form-group">
              <label>
                <LayersIcon /> Item Name
              </label>
              <input
                type="text"
                placeholder={getPlaceholder()}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            {/* PRICE */}
            <div className="form-group">
              <label>
                <LocalOfferIcon /> Unit Price (KES)
              </label>
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Units Per Carton</label>
              <input
                type="number"
                value={unitsPerCarton}
                onChange={(e) => setUnitsPerCarton(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Auto Price Per Carton</label>
              <input type="text" disabled value={`KES ${pricePerCarton}`} />
            </div>

            {/* MIN STOCK */}
            <div className="form-group">
              <label>
                <WarningAmberIcon /> Minimum Stock Level
              </label>

              <div className="min-level-type">
                <label>
                  <input
                    type="radio"
                    checked={minStockType === "Units"}
                    onChange={() => setMinStockType("Units")}
                  />{" "}
                  Units
                </label>

                <label>
                  <input
                    type="radio"
                    checked={minStockType === "Cartons"}
                    onChange={() => setMinStockType("Cartons")}
                  />{" "}
                  Cartons
                </label>
              </div>

              <input
                type="number"
                placeholder={`Minimum in ${minStockType}`}
                value={minStockValue}
                onChange={(e) => setMinStockValue(e.target.value)}
              />
            </div>
          </div>

          {/* ✅ RIGHT SIDE — LIVE PREVIEW CARD */}
          <div className="preview-card">
            <h3>Live Preview</h3>

            <p>
              <strong>Product ID:</strong>{" "}
              {category ? generateProductId() : "---"}
            </p>
            <p>
              <strong>Category:</strong> {category || "---"}
            </p>
            {pageCategories.includes(category) && (
              <p>
                <strong>Pages:</strong> {pages || "---"}
              </p>
            )}
            <p>
              <strong>Item Name:</strong> {itemName || "---"}
            </p>
            <p>
              <strong>Unit Price:</strong> KES {unitPrice || "---"}
            </p>
            <p>
              <strong>Units/Carton:</strong> {unitsPerCarton || "---"}
            </p>
            <p>
              <strong>Price/Carton:</strong> KES {pricePerCarton}
            </p>
            <p>
              <strong>Min Stock:</strong> {minStockValue || "---"}{" "}
              {minStockType}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-btn"
            disabled={!isFormValid}
            onClick={handleSave}
          >
            Save Item
          </button>
        </div>
      </div>

      {/* TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default AddItemModal;
