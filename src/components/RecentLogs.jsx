import React, { useState } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import "../styles/recentLogs.css";

const RecentLogs = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDay, setFilterDay] = useState("All");

  const logs = [
    { date: "2025-10-28", time: "08:17 PM", account: "South Eldide", user: "Jesse Roy", change: "Downloaded invoice_45.pdf" },
    { date: "2025-10-27", time: "09:13 AM", account: "East Samir", user: "Mayme Marsh", change: "Uploaded stock_report.pdf" },
    { date: "2025-10-27", time: "03:50 PM", account: "Dubquestaid", user: "Isabel Jennings", change: "Viewed design_template.ai" },
  ];

  const filteredLogs = logs.filter(
    (log) =>
      (filterDay === "All" || log.date === filterDay) &&
      (log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.change.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            <select value={filterDay} onChange={(e) => setFilterDay(e.target.value)}>
              <option value="All">All Days</option>
              <option value="2025-10-28">Oct 28, 2025</option>
              <option value="2025-10-27">Oct 27, 2025</option>
            </select>
          </div>
        </div>
      </div>

      <table className="logs-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Account</th>
            <th>User</th>
            <th>Change</th>
          </tr>
        </thead>
        <tbody>
          {filteredLogs.map((log, index) => (
            <tr key={index}>
              <td>{log.date} {log.time}</td>
              <td>{log.account}</td>
              <td>{log.user}</td>
              <td>{log.change}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button className="view-all-btn">View All</button>
    </div>
  );
};

export default RecentLogs;
