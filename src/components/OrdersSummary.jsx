import React from "react";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const OrdersSummary = () => {
  const cards = [
    { title: "Orders Today", value: 12, icon: <LocalShippingIcon /> },
    { title: "Pending Orders", value: 4, icon: <PendingActionsIcon /> },
    { title: "Completed Orders", value: 7, icon: <CheckCircleIcon /> },
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
