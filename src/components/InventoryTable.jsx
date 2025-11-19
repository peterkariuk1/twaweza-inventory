import MoreVertIcon from "@mui/icons-material/MoreVert";
import "../styles/inventory.css";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";

import { useState } from "react";

const InventoryTable = () => {
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const items = [
    {
      item: "A4 Paper (reams)",
      category: "Paper",
      qty: 50,
      unit: "Ream",
      status: "In Stock",
      date: "29 Oct 2025",
    },
    {
      item: "Black Ink 1L",
      category: "Ink",
      qty: 2,
      unit: "Bottle",
      status: "Low Stock",
      date: "28 Oct 2025",
    },
    {
      item: "Binding Glue",
      category: "Consumables",
      qty: 0,
      unit: "Pack",
      status: "Out of Stock",
      date: "26 Oct 2025",
    },
    {
      item: "A4 Paper (reams)",
      category: "Paper",
      qty: 50,
      unit: "Ream",
      status: "In Stock",
      date: "29 Oct 2025",
    },
    {
      item: "Black Ink 1L",
      category: "Ink",
      qty: 2,
      unit: "Bottle",
      status: "Low Stock",
      date: "28 Oct 2025",
    },
    {
      item: "Binding Glue",
      category: "Consumables",
      qty: 0,
      unit: "Pack",
      status: "Out of Stock",
      date: "26 Oct 2025",
    },
    {
      item: "A4 Paper (reams)",
      category: "Paper",
      qty: 50,
      unit: "Ream",
      status: "In Stock",
      date: "29 Oct 2025",
    },
    {
      item: "Black Ink 1L",
      category: "Ink",
      qty: 2,
      unit: "Bottle",
      status: "Low Stock",
      date: "28 Oct 2025",
    },
    {
      item: "Binding Glue",
      category: "Consumables",
      qty: 0,
      unit: "Pack",
      status: "Out of Stock",
      date: "26 Oct 2025",
    },
    {
      item: "A4 Paper (reams)",
      category: "Paper",
      qty: 50,
      unit: "Ream",
      status: "In Stock",
      date: "29 Oct 2025",
    },
    {
      item: "Black Ink 1L",
      category: "Ink",
      qty: 2,
      unit: "Bottle",
      status: "Low Stock",
      date: "28 Oct 2025",
    },
    {
      item: "Binding Glue",
      category: "Consumables",
      qty: 0,
      unit: "Pack",
      status: "Out of Stock",
      date: "26 Oct 2025",
    },
  ];

  const statusColor = {
    "In Stock": "status-green",
    "Low Stock": "status-orange",
    "Out of Stock": "status-red",
  };

  return (
    <div className="inventory-table-container">
      <div className="table-header">
        <h3 className="inventory-table-title">Inventory List</h3>
        {/* Search Bar */}
        <div className="search-box">
          <SearchIcon className="icon" />
          <input
            type="text"
            placeholder="Search item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <FilterListIcon className="icon" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>
      <div className="inventory-table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit</th>
              <th>Status</th>
              <th>Last Updated</th>
              <th></th> 
            </tr>
          </thead>
          <tbody>
            {items.map((data, i) => (
              <tr key={i}>
                <td>{data.item}</td>
                <td>{data.category}</td>
                <td>{data.qty}</td>
                <td>{data.unit}</td>
                <td>
                  <span className={`status-chip ${statusColor[data.status]}`}>
                    {data.status}
                  </span>
                </td>
                <td>{data.date}</td>
                <td className="actions-td">
                  <MoreVertIcon className="actions-menu-icon" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;
