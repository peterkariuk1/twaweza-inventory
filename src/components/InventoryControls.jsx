import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import "../styles/inventory.css";
import AddItemModal from "./AddItemModal";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ReceiveStockModal from "./ReceiveStockModal";

import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Tooltip from "@mui/material/Tooltip";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const InventoryControls = () => {
  const [activeModal, setActiveModal] = useState(null);
  const { role } = useAuth();

  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  const allowed = ["director", "accountant"];

  const isAllowed = (action) => {
    if (allowed.includes(role)) return true;
    return action === "receive";
  };

  const handleAction = (action) => {
    if (!isAllowed(action)) {
      showToast("You do not have permission for this action.", "warning");
      return;
    }
    setActiveModal(action);
  };

  return (
    <div className="inventory-controls">
      <h2>Inventory Overview</h2>

      <div className="controls-right">
        {/* ✅ STOCK OVERVIEW */}

        <Link style={{ textDecoration: "none" }} to="/stock">
          <button className={`add-btn`}>
            <WarehouseIcon /> Stock Overview
          </button>
        </Link>

        {/* ✅ ADD ITEM */}
        <Tooltip
          title={!isAllowed("add") ? "Not allowed for your role" : ""}
          disableHoverListener={isAllowed("add")}
        >
          <span>
            <button
              className={`add-btn ${!isAllowed("add") ? "disabled-btn" : ""}`}
              onClick={() => handleAction("add")}
              disabled={!isAllowed("add")}
            >
              <AddIcon /> Add Item
            </button>
          </span>
        </Tooltip>

        {/* ✅ RECEIVING STOCK — allowed for all roles */}
        <button className="add-btn" onClick={() => handleAction("receive")}>
          <AddIcon /> Receiving Stock
        </button>

        {/* ✅ MODALS */}
        {activeModal === "add" && (
          <AddItemModal onClose={() => setActiveModal(null)} />
        )}

        {activeModal === "receive" && (
          <ReceiveStockModal onClose={() => setActiveModal(null)} />
        )}
      </div>

      {/* ✅ MUI TOAST */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default InventoryControls;
