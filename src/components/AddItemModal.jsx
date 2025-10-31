import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import "../styles/additemmodal.css";

const AddItemModal = ({ onClose }) => {
  const categories = [
    "Jiwa Exercise Books",
    "Bell Exercise Books",
    "Manilla Paper",
    "Book Covers",
    "Ream Papers",
    "Raw Material",
  ];

  const [itemName, setItemName] = useState("");
  const [category, setCategory] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitsPerCarton, setUnitsPerCarton] = useState("");
  const [minStockType, setMinStockType] = useState("Units"); // Units or Cartons
  const [minStockValue, setMinStockValue] = useState("");

  const pricePerCarton =
    unitPrice && unitsPerCarton
      ? (parseFloat(unitPrice) * parseInt(unitsPerCarton)).toFixed(2)
      : "0.00";

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        
        {/* HEADER */}
        <div className="modal-header">
          <h2>Add New Inventory Item</h2>
          <CloseIcon className="close-btn" onClick={onClose} />
        </div>

        {/* BODY */}
        <div className="modal-body">

          {/* Item Name */}
          <div className="form-group">
            <label>Item Name</label>
            <input
              type="text"
              placeholder="Enter item name"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label>Category</label>
            <div className="radio-group">
              {categories.map((cat, i) => (
                <label key={i} className="radio-option">
                  <input
                    type="radio"
                    name="category"
                    value={cat}
                    checked={category === cat}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  {cat}
                </label>
              ))}
            </div>
          </div>

          {/* Unit Price */}
          <div className="form-group">
            <label>Unit Price (KES)</label>
            <input
              type="number"
              min="0"
              placeholder="Price per single item"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
            />
          </div>

          {/* Packaging */}
          <div className="form-group">
            <label>Units Per Carton</label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 24"
              value={unitsPerCarton}
              onChange={(e) => setUnitsPerCarton(e.target.value)}
            />
          </div>

          {/* Auto Price Per Carton */}
          <div className="form-group">
            <label>Price Per Carton (Auto-Calculated)</label>
            <input type="text" value={`KES ${pricePerCarton}`} disabled />
          </div>

          {/* Minimum Stock Level */}
          <div className="form-group">
            <label>Minimum Stock Level</label>

            <div className="min-level-type">
              <label>
                <input
                  type="radio"
                  name="min-level"
                  value="Units"
                  checked={minStockType === "Units"}
                  onChange={(e) => setMinStockType(e.target.value)}
                />
                Units
              </label>

              <label>
                <input
                  type="radio"
                  name="min-level"
                  value="Cartons"
                  checked={minStockType === "Cartons"}
                  onChange={(e) => setMinStockType(e.target.value)}
                />
                Cartons
              </label>
            </div>

            <input
              type="number"
              min="1"
              placeholder={`Minimum in ${minStockType}`}
              value={minStockValue}
              onChange={(e) => setMinStockValue(e.target.value)}
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn">Save Item</button>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
