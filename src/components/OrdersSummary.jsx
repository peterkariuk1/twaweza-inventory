import React from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { computeOrderStats } from "../utils/orderStats";

const OrdersSummary = ({ orders }) => {
  const { todayCount, pendingCount, dispatchedCount } =
    computeOrderStats(orders);

  const cards = [
    {
      title: "Orders Today",
      value: todayCount,
      icon: <LocalShippingIcon />,
    },
    {
      title: "Pending Orders",
      value: pendingCount,
      icon: <PendingActionsIcon style={{ color: "orange" }} />,
    },
    {
      title: "Dispatched Orders",
      value: dispatchedCount,
      icon: <CheckCircleIcon style={{ color: "green" }} />,
    },
  ];

  return (
    <div className="orders-summary">
      {cards.map((card, i) => (
        <div className="orders-summary-card" key={i}>
          <div className="orders-summary-icon">{card.icon}</div>
          <div className="orders-summary-text">
            <p>{card.title}</p>
            <h3>{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersSummary;
