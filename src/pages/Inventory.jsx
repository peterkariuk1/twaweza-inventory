import React from "react";
import "../styles/subpages.css";
import InventoryControls from "../components/InventoryControls";
import SummaryCards from "../components/SummaryInventoryCards";
import InventoryTable from "../components/InventoryTable";

const Inventory = () => {
  return (
    <section className="inventory-page">
      <InventoryControls />
      <SummaryCards />
      <InventoryTable />
    </section>
  );
};

export default Inventory;
