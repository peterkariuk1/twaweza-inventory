import React, { useEffect, useState, useMemo } from "react";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import "../styles/orders.css";

const OrdersTable = ({ onOpenOrderModal }) => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 15; // Adjust as needed

  // --------------- REAL-TIME LISTENER ----------------
  useEffect(() => {
    const q = query(collection(db, "orders"), orderBy("timestamp", "desc"));

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setOrders(list);
    });

    return () => unsub();
  }, []);

  // --------------- SEARCH + FILTER ----------------
  const filtered = useMemo(() => {
    let res = [...orders];

    if (filter) res = res.filter((o) => o.status === filter);

    if (search.trim()) {
      const s = search.toLowerCase();
      res = res.filter(
        (o) =>
          o.customerName?.toLowerCase().includes(s) ||
          o.orderNo?.toString().includes(s) ||
          o.invoiceNo?.toString().includes(s)
      );
    }

    return res;
  }, [orders, search, filter]);

  // --------------- PAGINATION ----------------
  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page]);

  // --------------- DATE GROUPING ----------------
  const groupByDate = () => {
    const groups = { today: [], yesterday: [], older: [] };

    const now = new Date();
    const today = now.toDateString();

    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = y.toDateString();

    for (const order of paginated) {
      const date = order.timestamp?.toDate().toDateString();
      if (date === today) groups.today.push(order);
      else if (date === yesterday) groups.yesterday.push(order);
      else groups.older.push(order);
    }
    return groups;
  };

  const grouped = groupByDate();

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Dispatched":
        return "status-dispatched";
      case "Cancelled":
        return "status-cancelled";
      case "Returned":
        return "status-returned";
      default:
        return "";
    }
  };

  const getStoreSource = (items) => {
    if (!items || items.length === 0) return "—";

    const stores = [...new Set(items.map((i) => i.store))];

    if (stores.length === 1) return stores[0]; // single store
    if (stores.length === 2) return "Both"; // exactly two stores
    return "Multiple"; // fallback for future cases
  };

  const truncate = (txt) =>
    txt?.length > 10 ? txt.substring(0, 10) + "..." : txt;

  // --------------- RENDER BLOCK ----------------
  const renderSection = (label, items) =>
    items.length > 0 && (
      <>
        <tr className="date-separator">
          <td colSpan="7">{label}</td>
        </tr>
        {items.map((order) => (
          <tr
            key={order.id}
            className="order-row"
            onClick={() => onOpenOrderModal(order)}
          >
            <td>{order.orderNo}</td>
            <td>{order.invoiceNo}</td>
            <td>{order.customerName}</td>
            <td>{truncate(order.items[0]?.itemName || "—")}</td>
            <td>{order.items.length}</td>
            <td>{getStoreSource(order.items)}</td>
            <td>
              <span className={`status-chip ${getStatusClass(order.status)}`}>
                {order.status}
              </span>
            </td>
            <td>
              {order.timestamp?.toDate().toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </td>
          </tr>
        ))}
      </>
    );

  return (
    <div className="orders-table-container">
      <div className="top">
        <div className="orders-search-box">
          <SearchIcon />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="orders-filter-box">
          <FilterAltIcon />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Cancelled">Cancelled</option>
            <option value="Returned">Returned</option>
          </select>
        </div>
      </div>

      <div className="orders-table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order No</th>
              <th>Invoice No</th>
              <th>Client</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Processing Store</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>

          <tbody>
            {renderSection("Today", grouped.today)}
            {renderSection("Yesterday", grouped.yesterday)}
            {renderSection("Older", grouped.older)}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {Math.ceil(filtered.length / pageSize)}
        </span>
        <button
          disabled={page * pageSize >= filtered.length}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default OrdersTable;
