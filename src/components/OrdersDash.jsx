import "../styles/subpages.css";
import DateRangeIcon from "@mui/icons-material/DateRange";
import NorthIcon from "@mui/icons-material/North";
import SouthIcon from "@mui/icons-material/South";
import bgVideo from "../assets/bgvid.mp4";
import PersonIcon from "@mui/icons-material/Person";

const OrdersDash = ({ monthCount, todayCount, difference, topClients }) => {
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
              <h2>{monthCount}</h2>
            </div>
            <div className="bottom"></div>
          </div>
          <div className="right">
            <p>Top Clients</p>
            <ul>
              {topClients.length > 0 ? (
                topClients.map((c, index) => (
                  <li key={index}>
                    <PersonIcon sx={{ fontSize: 14, marginRight: "3px" }} />
                    {c.client.length > 9
                      ? c.client.slice(0, 9) + "..."
                      : c.client}{" "}
                    <span> {c.total.toLocaleString()} units bought</span>
                  </li>
                ))
              ) : (
                <li>No client data</li>
              )}
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
            <h2>{todayCount}</h2>
          </div>
          <div className="bottom">
            <p>
              {difference}
              <span> since yesterday</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersDash;
