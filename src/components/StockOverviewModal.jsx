import React, { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import "../styles/addItemModal.css";

const StockOverviewModal = ({ onClose }) => {
  const [dateFilter, setDateFilter] = useState("");

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* HEADER */}
        <div className="modal-header">
          <h2>Stock Overview & Reports</h2>
          <CloseIcon className="close-btn" onClick={onClose} />
        </div>

        <div className="modal-body">
          {/* Date Filter */}
          <div className="form-group">
            <label>Filter Logs by Date</label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {/* Stock Valuation */}
          <div className="overview-block">
            <h3>Stock Valuation Report</h3>
            <p className="note">
              Total stock value = sum of (Qty × Unit Price)
            </p>
            <button className="small-print-btn">
              <PrintIcon /> Print Valuation
            </button>
          </div>

          {/* Quantity Breakdown */}
          <div className="overview-block">
            <h3>Quantity Breakdown</h3>
            <p className="note">Print full list of quantities per item.</p>
            <button className="small-print-btn">
              <PrintIcon /> Print Quantity Breakdown
            </button>
          </div>

          {/* Logs */}
          <div className="overview-block">
            <h3>Stock Activity Logs</h3>
            <p className="note">Print logs filtered by the selected date.</p>
            <button className="small-print-btn">
              <PrintIcon /> Print Logs
            </button>
          </div>
        </div>

        {/* FOOTER */}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StockOverviewModal;
