import { useState, useEffect } from "react";
import "../styles/subpages.css";
import RecentLogs from "../components/RecentLogs";
import OrdersDash from "../components/OrdersDash";
import StockDash from "../components/StockDash";
import { computeOrderStats } from "../utils/orderStats";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";

const Dashboard = () => {
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

  const { todayCount, monthCount, difference, topClients } =
    computeOrderStats(orders);

  return (
    <section className="dashboard-page">
      <div className="TOP">
        <OrdersDash
          monthCount={monthCount}
          todayCount={todayCount}
          difference={difference}
          topClients={topClients}
        />
        <StockDash />
      </div>
      <div className="BOTTOM">
        <RecentLogs />
      </div>
    </section>
  );
};

export default Dashboard;
