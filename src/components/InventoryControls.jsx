import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import "../styles/inventory.css";
import AddItemModal from "./AddItemModal";
import PrintIcon from "@mui/icons-material/Print";
import StockOverviewModal from "./StockOverviewModal";
import ReceiveStockModal from "./ReceiveStockModal";

const InventoryControls = () => {
  const [activeModal, setActiveModal] = useState(null);
  return (
    <div className="inventory-controls">
      <h2>Inventory Overview</h2>

      <div className="controls-right">
        {/* STOCK OVERVIEW */}
        <button className="add-btn" onClick={() => setActiveModal("overview")}>
          <PrintIcon /> Stock Overview
        </button>

        {/* ADD ITEM */}
        <button className="add-btn" onClick={() => setActiveModal("add")}>
          <AddIcon /> Add Item
        </button>

        {/* RECEIVING STOCK */}
        <button className="add-btn" onClick={() => setActiveModal("receive")}>
          <AddIcon /> Receiving Stock
        </button>

        {/* CONDITIONAL MODALS */}
        {activeModal === "add" && (
          <AddItemModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "overview" && (
          <StockOverviewModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "receive" && (
          <ReceiveStockModal onClose={() => setActiveModal(null)} />
        )}
      </div>
    </div>
  );
};

export default InventoryControls;
