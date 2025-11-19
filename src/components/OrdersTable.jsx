import React from "react";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

const OrdersTable = () => {
  const sampleData = [
    {
      id: "ORD-001",
      customer: "John Doe",
      product: "120pg Jiwa Graph",
      qty: 50,
      status: "Pending",
      date: "29 Jan 2025",
    },
    {
      id: "ORD-002",
      customer: "Mary Kim",
      product: "A4 Ream Paper",
      qty: 10,
      status: "Completed",
      date: "28 Jan 2025",
    },
  ];

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Processing":
        return "status-processing";
      case "Completed":
        return "status-completed";
      case "Dispatched":
        return "status-dispatched";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="orders-table-container">
      <div className="top">
        <div className="orders-search-box">
          <SearchIcon />
          <input type="text" placeholder="Search orders..." />
        </div>

        {/* Filter */}
        <div className="orders-filter-box">
          <FilterAltIcon />
          <select>
            <option value="">All Status</option>
            <option>Pending</option>
            <option>Processing</option>
            <option>Completed</option>
            <option>Dispatched</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {sampleData.map((order, i) => (
              <tr key={i}>
                <td>{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.product}</td>
                <td>{order.qty}</td>
                <td>
                  <span
                    className={`status-chip ${getStatusClass(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td>{order.date}</td>
                <td>
                  <MoreVertIcon className="order-actions-icon" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;
