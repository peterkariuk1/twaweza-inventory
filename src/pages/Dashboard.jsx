import "../styles/subpages.css";

const Dashboard = () => {
  return (
    <section className="dashboard-page">
      <div className="TOP">
        <div className="orders-cards">
          <div className="month card"></div>
          <div className="today card"></div>
        </div>
        <div className="stock-cards"></div>
        <div className="stock-categories card"></div>
        <div className="raw-material-categories card"></div>
        <div className="stock-alerts card"></div>
      </div>
      <div className="BOTTOM">
        <div className="recent-logs"></div>
      </div>
    </section>
  );
};

export default Dashboard;
