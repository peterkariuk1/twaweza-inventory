import React from "react";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";


const OrdersControls = () => {
  return (
    <div className="orders-controls">
      <h2>Orders Management</h2>

      <div className="orders-controls-right">
        {/* Search */}

        {/* Buttons */}
        <button className="orders-btn primary">
          <AddIcon /> New Order
        </button>

        <button className="orders-btn secondary">
          <PrintIcon /> Print Report
        </button>
      </div>
    </div>
  );
};

export default OrdersControls;
