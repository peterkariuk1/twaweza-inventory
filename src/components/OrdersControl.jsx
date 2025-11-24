import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import NewOrderModal from "../components/NewOrderModal"; // adjust path

const OrdersControls = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="orders-controls">
        <h2>Orders Management</h2>
        <div className="orders-controls-right">
          <button className="orders-btn primary" onClick={() => setOpen(true)}>
            <AddIcon /> New Order
          </button>
          <button className="orders-btn secondary">
            <PrintIcon /> Print Report
          </button>
        </div>
      </div>

      {open && <NewOrderModal onClose={() => setOpen(false)} />}
    </>
  );
};

export default OrdersControls;
