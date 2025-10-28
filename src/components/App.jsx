import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SideNav from "../components/SideNav";
import Dashboard from "../pages/Dashboard";
import Orders from "../pages/Orders";
import Inventory from "../pages/Inventory";
import "../styles/dashboard.css";
import Header from "./Header";

function App() {
  return (
    <section className="dashboard">
      <SideNav />
      <div className="main-selected-section">
        <Header />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/inventory" element={<Inventory />} />
        </Routes>
      </div>
    </section>
  );
}

export default App;
