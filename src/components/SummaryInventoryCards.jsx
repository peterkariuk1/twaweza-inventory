import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";

import { computeStockStatus } from "../utils/computeStockStatus";
import "../styles/inventory.css";

const SummaryCards = () => {
  const [productCount, setProductCount] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [productsNameMap, setProductsNameMap] = useState({});
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outStockCount, setOutStockCount] = useState(0);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventory"), (snap) => {
      setInventory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    const unsubProd = onSnapshot(collection(db, "products"), (snap) => {
      const map = {};
      const nameMap = {};

      snap.docs.forEach((d) => {
        const data = d.data();
        const id = d.id;

        map[id] = { id, ...data };
        if (data.productId) map[data.productId] = { id, ...data };
        if (data.itemName)
          nameMap[data.itemName.toLowerCase()] = { id, ...data };
        if (data.pages && data.itemName)
          nameMap[`${data.pages} ${data.itemName}`.toLowerCase()] = {
            id,
            ...data,
          };
      });

      setProductsMap(map);
      setProductsNameMap(nameMap);
    });

    return () => {
      unsubInv();
      unsubProd();
    };
  }, []);

  useEffect(() => {
    if (!inventory.length || !Object.keys(productsMap).length) return;

    const rows = computeStockStatus(inventory, productsMap, productsNameMap);

    const low = rows.filter((r) => r.status === "Low").length;
    const out = rows.filter((r) => r.status === "Out of Stock").length;

    setLowStockCount(low);
    setOutStockCount(out);
  }, [inventory, productsMap, productsNameMap]);

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
      value: lowStockCount,
      icon: <WarningAmberIcon className="warning-icon" />,
      link: "",
    },
    {
      title: "Out of Stock",
      value: outStockCount,
      icon: <RemoveShoppingCartIcon className="low-icon" />,
      link: "",
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
