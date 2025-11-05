import "../styles/subpages.css";
import RecentLogs from "../components/RecentLogs";
import OrdersDash from "../components/OrdersDash";
import StockDash from "../components/StockDash";

const Dashboard = () => {
  return (
    <section className="dashboard-page">
      <div className="TOP">
        <OrdersDash />
        <StockDash/>
      </div>
      <div className="BOTTOM">
        <RecentLogs />
      </div>
    </section>
  );
};

export default Dashboard;
