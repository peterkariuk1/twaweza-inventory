import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";

import "../styles/inventory.css";

const SummaryCards = () => {
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      setProductCount(snapshot.size);
    });

    return () => unsubscribe();
  }, []);

  const cards = [
    {
      title: "Twaweza Products",
      value: productCount,
      icon: <Inventory2Icon className="summary-icon" />,
      link: "/products",
    },
    {
      title: "Low Stock",
      value: "8",
      icon: <WarningAmberIcon className="summary-icon" />,
      link: "/",
    },
    {
      title: "Out of Stock",
      value: "3",
      icon: <RemoveShoppingCartIcon className="summary-icon" />,
      link: "/products",
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, i) => (
        <Link style={{ textDecoration: "none" }} to={card.link} key={i}>
          <div className="summary-card">
            <div className="icon-area">{card.icon}</div>
            <div className="text-area">
              <p className="card-title">{card.title}</p>
              <h3 className="card-value">{card.value}</h3>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SummaryCards;
