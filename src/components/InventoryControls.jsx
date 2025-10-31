import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import "../styles/inventory.css";
import AddItemModal from "./AddItemModal";
import PrintIcon from "@mui/icons-material/Print";

const InventoryControls = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="inventory-controls">
      <h2>Inventory Overview</h2>

      <div className="controls-right">
        {/* Add Button */}
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <PrintIcon /> Stock Overview
        </button>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <AddIcon /> Add Item
        </button>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          <AddIcon /> Receiving Stock
        </button>

        {showModal && <AddItemModal onClose={() => setShowModal(false)} />}
      </div>
    </div>
  );
};

export default InventoryControls;
