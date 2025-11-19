import React from "react";
import OrdersControls from "../components/OrdersControl";
import OrdersSummary from "../components/OrdersSummary";
import OrdersTable from "../components/OrdersTable";
import "../styles/orders.css";

const Orders = () => {
  return (
    <section className="orders-page">
      <OrdersControls />
      <OrdersSummary />
      <OrdersTable />
    </section>
  );
};

export default Orders;
