import "../styles/subpages.css";
import SouthIcon from "@mui/icons-material/South";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
const StockDash = () => {
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
                88<span>Cartons</span>
              </h2>
            </div>
            <div className="bottom">
              <SouthIcon sx={{ fontSize: 15, color: "#ff2600ff" }} />
              <p>
                0.2 % <span>since last month</span>
              </p>
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
                31<span>Cartons</span>
              </h2>
            </div>
            <div className="bottom">
              <SouthIcon sx={{ fontSize: 15, color: "#ff2600ff" }} />
              <p>
                0.2 % <span>since last month</span>
              </p>
            </div>
          </div>
        </div>
        <div className="left">
          <div className="top">
            <WarningAmberIcon sx={{ color: "#ff2600" }} />
            <p>Minimum Stock Alerts</p>
          </div>
          <div className="mid">
            <p>No alerts at the moment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDash;
