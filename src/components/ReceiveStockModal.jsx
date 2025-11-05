import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import "../styles/addItemModal.css";

const ReceiveStockModal = ({ onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [entryType, setEntryType] = useState("Units");
  const [quantity, setQuantity] = useState("");
  const [store, setStore] = useState("Main Store");

  const items = [
   "Jiwa Exercise Books",
    "Bell Exercise Books",
    "Manilla Paper",
    "Book Covers",
    "Ream Papers",
    "Raw Material",
  ];

  // live filter
  const filteredItems = items.filter((i) =>
    i.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Receiving Stock</h2>
          <CloseIcon className="close-btn" onClick={onClose} />
        </div>

        <div className="modal-body">
          {/* Search Input */}
          <div className="form-group">
            <label>Search Item</label>
            <div className="search-box-modal">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search item..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Always show selectable items list */}
          <div className="manual-list-box">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, i) => (
                <div
                  key={i}
                  className={`manual-item ${
                    selectedItem === item ? "selected" : ""
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  {item}
                </div>
              ))
            ) : (
              <p className="no-items">No items match your search.</p>
            )}
          </div>

          {/* After selection → show entry options */}
          {selectedItem && (
            <>
              <div className="form-group">
                <label>Entry Type</label>
                <div className="min-level-type">
                  <label>
                    <input
                      type="radio"
                      checked={entryType === "Units"}
                      onChange={() => setEntryType("Units")}
                    />
                    Units
                  </label>

                  <label>
                    <input
                      type="radio"
                      checked={entryType === "Cartons"}
                      onChange={() => setEntryType("Cartons")}
                    />
                    Cartons
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Quantity Received</label>
                <input
                  type="number"
                  min="1"
                  placeholder={`Enter quantity in ${entryType}`}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Receiving Store</label>
                <select value={store} onChange={(e) => setStore(e.target.value)}>
                  <option value="Main Store">Main Store</option>
                  <option value="Production Store">Production Store</option>
                </select>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="save-btn">Save Entry</button>
        </div>
      </div>
    </div>
  );
};

export default ReceiveStockModal;
