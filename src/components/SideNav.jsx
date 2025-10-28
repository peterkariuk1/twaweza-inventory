import { NavLink } from "react-router-dom";
import "../styles/dashboard.css";
import jiwaLogo from "../assets/Jiwa-Logo.png";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";

const SideNav = () => {
  const navButtons = [
    { icon: <SpaceDashboardIcon />, text: "Dashboard", to: "/" },
    { icon: <LocalShippingIcon />, text: "Orders", to: "/orders" },
    { icon: <WarehouseIcon />, text: "Inventory", to: "/inventory" },
  ];

  return (
    <div className="side-nav">
      <div className="logo">
        <img src={jiwaLogo} alt="logo" />
      </div>

      <div className="profile-top">
        <PersonOutlineIcon sx={{ fontSize: 60 }} className="profile-pic" />
        <div>
          <h4>John Doe</h4>
          <p>Accountant</p>
        </div>
      </div>

      <div className="nav-buttons">
        {navButtons.map((btn, index) => (
          <NavLink
            key={index}
            to={btn.to}
            className={({ isActive }) =>
              isActive ? "nav-item active" : "nav-item"
            }
          >
            {btn.icon}
            <p>{btn.text}</p>
          </NavLink>
        ))}
      </div>

      <div className="logout-nav">
        <ExitToAppIcon className="dashboard-icons" />
        <p>Logout</p>
      </div>
    </div>
  );
};

export default SideNav;
