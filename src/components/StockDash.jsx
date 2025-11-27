import { useState, useEffect } from "react";
import "../styles/subpages.css";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import { computeDashboardStockSummary } from "../utils/StockSummary";
import LowStockSlider from "./LowStockSlider";
const StockDash = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    computeDashboardStockSummary().then((res) => setSummary(res));
  }, []);

  if (!summary) return "Loading…";

  return (
    <div className="stock-cards">
      <div className="stock-categories">
        <div className="today-card">
          <div className="left">
            <div className="top">
              <LibraryBooksIcon />
              <p>Jiwa Stock Status</p>
            </div>
            <div className="mid">
              <h2>
                {summary.jiwaCartons.toLocaleString()}
                <span>Cartons</span>
              </h2>
            </div>
          </div>
        </div>
        <div className="today-card">
          <div className="left">
            <div className="top">
              <LibraryBooksIcon />
              <p>Bell Stock Status</p>
            </div>
            <div className="mid">
              <h2>
                {summary.bellCartons.toLocaleString()}
                <span>Cartons</span>
              </h2>
            </div>
          </div>
        </div>
        <div className="left">
          <div className="top">
            <WarningAmberIcon sx={{ color: "#ff2600" }} />
            <p>Minimum Stock Alerts</p>
          </div>
          <div className="stock-slider-wrapper">
           <LowStockSlider items={summary.lowStockItems} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDash;
