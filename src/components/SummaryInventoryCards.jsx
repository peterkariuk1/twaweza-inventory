import Inventory2Icon from "@mui/icons-material/Inventory2";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import RemoveShoppingCartIcon from "@mui/icons-material/RemoveShoppingCart";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import "../styles/inventory.css";

const SummaryCards = () => {
  const cards = [
    {
      title: "Total Items",
      value: "120",
      icon: <Inventory2Icon className="summary-icon" />,
    },
    {
      title: "Low Stock",
      value: "8",
      icon: <WarningAmberIcon className="summary-icon" />,
    },
    {
      title: "Out of Stock",
      value: "3",
      icon: <RemoveShoppingCartIcon className="summary-icon" />,
    },
    {
      title: "Processed Orders",
      value: "5",
      icon: <LocalShippingIcon className="summary-icon" />,
    },
  ];

  return (
    <div className="summary-cards">
      {cards.map((card, i) => (
        <div className="summary-card" key={i}>
          <div className="icon-area">{card.icon}</div>

          <div className="text-area">
            <p className="card-title">{card.title}</p>
            <h3 className="card-value">{card.value}</h3>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SummaryCards;
