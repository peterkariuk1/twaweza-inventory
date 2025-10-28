import React, { useEffect, useState } from "react";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import "../styles/subpages.css";

const Header = () => {
  const [currentTime, setCurrentTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(dayjs()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="header">
      <h2>Twaweza Printing Press Inventory</h2>
      <div className="date-section">
        <CalendarMonthIcon />
        <h3>
          {currentTime.format("ddd, D MMM YY - h:mm A")}
        </h3>
      </div>
    </header>
  );
};

export default Header;
