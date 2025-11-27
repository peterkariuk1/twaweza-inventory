import React, { useState, useEffect } from "react";
import OrdersControls from "../components/OrdersControl";
import OrdersSummary from "../components/OrdersSummary";
import OrdersTable from "../components/OrdersTable";
import "../styles/orders.css";
import OrderProcessingModal from "../components/ProcessOrderModal";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Orders = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);

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

  const onOpenOrderModal = (order) => {
    console.log("Clicked order:", order); // ← confirm firing
    setSelectedOrder(order);
    setModalOpen(true);
  };

  const onCloseModal = () => {
    setModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <section className="orders-page">
      <OrdersControls />
      <OrdersSummary orders={orders} />

      <OrdersTable onOpenOrderModal={onOpenOrderModal} orders={orders} />

      {modalOpen && (
        <OrderProcessingModal
          order={selectedOrder}
          onClose={onCloseModal}
          open={modalOpen}
        />
      )}
    </section>
  );
};

export default Orders;
