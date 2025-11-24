import { Routes, Route, useLocation } from "react-router-dom";

import SideNav from "../components/SideNav";
import Dashboard from "../pages/Dashboard";
import Orders from "../pages/Orders";
import Inventory from "../pages/Inventory";
import Header from "./Header";
import LoginSignup from "../pages/Login";
import ProtectedRoute from "../routes/ProtectedRoute";

import "../styles/dashboard.css";
import Products from "../pages/Products";
import Forbidden from "../pages/Forbidden";
import StockOverview from "../pages/StockOverview";
import NoInternetModal from "./NoInternetModal";

function App() {
  const location = useLocation();
  const hideLayout = location.pathname === "/auth";

  return (
    <div className="app-container">
      {/* ✅ SHOW SIDEBAR ONLY WHEN LOGGED IN */}
      {!hideLayout && <SideNav />}

      {/* ✅ Main area */}
      <div className={!hideLayout ? "main-area" : "auth-area"}>
        {/* ✅ SHOW HEADER ONLY IF LOGGED IN */}
        {!hideLayout && <Header />}

        <NoInternetModal/>

        {/* ✅ Routes */}
        <Routes>
          <Route path="/auth" element={<LoginSignup />} />
          <Route
            path="/"
            element={
              <ProtectedRoute
                allowed={["director", "accountant", "storemanager"]}
              >
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute
                allowed={["director", "accountant", "storemanager"]}
              >
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute
                allowed={["director", "accountant", "storemanager"]}
              >
                <Inventory />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/products"
            element={
              <ProtectedRoute allowed={["director", "accountant"]}>
                <Products />
              </ProtectedRoute>
            }
          />{" "}
          <Route
            path="/stock"
            element={
              <ProtectedRoute allowed={["director", "accountant","storemanager"]}>
                <StockOverview />
              </ProtectedRoute>
            }
          />
          <Route path="/forbidden" element={<Forbidden />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
