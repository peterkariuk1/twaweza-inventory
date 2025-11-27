import React, { useState, useEffect } from "react";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import "../styles/recentLogs.css";

const styleModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "#1f1f1f",
  color: "white",
  borderRadius: "12px",
  boxShadow: 24,
  p: 4,
};

const RecentLogs = () => {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("All");
  const [selectedLog, setSelectedLog] = useState(null);

  // Live Firestore listener
  useEffect(() => {
    const q = query(collection(db, "logs"), orderBy("timestamp", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const fetched = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLogs(fetched);
    });

    return () => unsub();
  }, []);

  // Filter and search
  const logsPerPage = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Enhanced filter logic
  const filteredLogs = logs.filter((log) => {
    const logDateStr = log.timestamp?.toDate
      ? log.timestamp.toDate().toLocaleDateString()
      : "";

    const action = log.action?.toLowerCase() || "";
    let matchesFilter = true;

    if (filterDay !== "All") {
      if (filterDay === "Stock") {
        matchesFilter =
          action.includes("stock") || action.includes("inventory");
      } else if (filterDay === "Orders") {
        matchesFilter = action.includes("order");
      } else if (filterDay === "Products") {
        matchesFilter = action.includes("product");
      }
    }

    return (
      matchesFilter &&
      (log.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.includes(searchTerm.toLowerCase()))
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const goNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const goPrevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  // Render details recursively
  const renderDetails = (obj) => {
    if (!obj) return null;

    return Object.entries(obj).map(([key, value]) => (
      <Box key={key} sx={{ mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          {key}:
        </Typography>
        {typeof value === "object" && value !== null ? (
          <Box sx={{ pl: 2 }}>{renderDetails(value)}</Box>
        ) : (
          <Typography variant="body2">{String(value)}</Typography>
        )}
        <Divider sx={{ bgcolor: "#444", my: 0.5 }} />
      </Box>
    ));
  };

  return (
    <div className="recent-logs-card">
      <div className="logs-header">
        <h3>Recent Logs</h3>
        <div className="controls">
          <div className="search-box">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-box">
            <FilterAltIcon />
            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
            >
              <option value="All">All</option>
              {/* Example static filter options */}
              <option value="Stock">Stock</option>
              <option value="Products">Products</option>
              <option value="Orders">Orders</option>
            </select>
          </div>
        </div>
      </div>

      <table className="logs-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>User</th>
            <th>Change</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {paginatedLogs.map((log) => {
            const dateStr = log.timestamp?.toDate
              ? log.timestamp.toDate().toLocaleDateString()
              : "-";
            const timeStr = log.timestamp?.toDate
              ? log.timestamp.toDate().toLocaleTimeString()
              : "-";

            return (
              <tr key={log.id}>
                <td>
                  {dateStr} {timeStr}
                </td>
                <td>{log.email || log.userId || "-"}</td>
                <td>{log.action || "-"}</td>
                <td>
                  <IconButton size="small" onClick={() => setSelectedLog(log)}>
                    <VisibilityIcon sx={{ color: "#27387b", fontSize: 25 }} />
                  </IconButton>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "12px",
        }}
      >
        <button
          onClick={goPrevPage}
          disabled={currentPage === 1}
          style={{ padding: "6px 12px", borderRadius: "6px" }}
        >
          Previous
        </button>
        <span style={{ color: "white" }}>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={goNextPage}
          disabled={currentPage === totalPages}
          style={{ padding: "6px 12px", borderRadius: "6px" }}
        >
          Next
        </button>
      </div>

      {/* Modal for log details */}
      <Modal
        open={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        aria-labelledby="log-details-modal"
      >
        <Paper sx={styleModal}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Details: {selectedLog?.action || ""}
          </Typography>
          <Box>{renderDetails(selectedLog?.details)}</Box>
          <Box sx={{ mt: 2, textAlign: "right" }}>
            <button
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                background: "#3f51b5",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
              onClick={() => setSelectedLog(null)}
            >
              Close
            </button>
          </Box>
        </Paper>
      </Modal>
    </div>
  );
};

export default RecentLogs;
