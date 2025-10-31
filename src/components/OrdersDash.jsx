import "../styles/subpages.css";
import DateRangeIcon from "@mui/icons-material/DateRange";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import bgVideo from "../assets/bgvid.mp4";
import PersonIcon from "@mui/icons-material/Person";

const OrdersDash = () => {
  return (
    <div className="orders-cards">
      <div className="month-card">
        <video
          src={bgVideo}
          autoPlay
          loop
          muted
          playsInline
          className="bg-video"
        ></video>

        <div className="content">
          <div className="left">
            <div className="top">
              <DateRangeIcon />
              <p>Orders this Month</p>
            </div>
            <div className="mid">
              <h2>201</h2>
            </div>
            <div className="bottom">
              <NorthIcon sx={{ fontSize: 15, color: "#00d000" }} />
              <p>
                6.2 % <span>since last month</span>
              </p>
            </div>
          </div>
          <div className="right">
            <p>Top Clients</p>
            <ul>
              <li>
                <PersonIcon sx={{ fontSize: 14, marginRight: "3px" }} />
                Example 1 <span> Goods bought</span>
              </li>
              <li>
                <PersonIcon sx={{ fontSize: 14, marginRight: "3px" }} />
                Example 2 <span> Goods bought</span>
              </li>
              <li>
                <PersonIcon sx={{ fontSize: 14, marginRight: "3px" }} />
                Example 3 <span> Goods bought</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="today-card">
        <div className="left">
          <div className="top">
            <DateRangeIcon />
            <p>Today's Orders</p>
          </div>
          <div className="mid">
            <h2>12</h2>
          </div>
          <div className="bottom">
            <SouthIcon sx={{ fontSize: 15, color: "#ff2600ff" }} />
            <p>
              0.2 % <span>since yesterday</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDash;
