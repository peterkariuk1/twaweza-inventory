import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/sidenav.css";
import jiwaLogo from "../assets/Jiwa-Logo.png";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

const SideNav = () => {
  const { role, user, logout } = useAuth();
  const [logoutDialog, setLogoutDialog] = useState(false);


  const navButtons = [
    { icon: <SpaceDashboardIcon />, text: "Dashboard", to: "/" },
    { icon: <LocalShippingIcon />, text: "Orders", to: "/orders" },
    { icon: <WarehouseIcon />, text: "Inventory", to: "/inventory" },
  ];

  const [collapsed, setCollapsed] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const capitalizeFirstLetter = (str) => {
    if (!str || typeof str !== "string") return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <>
      {/* ✅ Mobile Hamburger */}
      <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
        <MenuIcon />
      </button>

      <aside
        className={`side-nav ${collapsed ? "collapsed" : ""} ${
          mobileOpen ? "open" : ""
        }`}
      >
        {/* ✅ Mobile Close Button */}
        <button className="close-menu-btn" onClick={() => setMobileOpen(false)}>
          <CloseIcon />
        </button>

        {/* ✅ Collapse Button (Desktop) */}
        <button
          className="collapse-toggle"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? ">>" : "<<"}
        </button>

        {/* ✅ Logo */}
        <div className="logo">
          <img src={jiwaLogo} alt="logo" />
          {!collapsed && <h2></h2>}
        </div>

        {/* ✅ User Profile */}
        <div
          // className="profile-top"
          className={`profile-top ${collapsed ? "collapsed" : ""}${
            mobileOpen ? "open" : ""
          }`}
        >
          <PersonOutlineIcon className="profile-pic" sx={{ fontSize: 40 }} />

          {!collapsed && (
            <div className="profile-text">
              <h4 className={user?.email?.length > 13 ? "scroll-wrapper" : ""}>
                <span>{user?.email}</span>
                <span>{user?.email}</span>
              </h4>

              {/* <p className={role?.length > 7 ? "scroll-wrapper" : ""}>
                <span>{capitalizeFirstLetter(role)}</span>
                 <span>{capitalizeFirstLetter(role)}</span> 
              </p> */}
              <p>{role ? capitalizeFirstLetter(role) : ""}</p>
            </div>
          )}
        </div>

        {/* ✅ Navigation Links */}
        <div className="nav-buttons">
          {navButtons.map((btn, index) => (
            <NavLink
              key={index}
              to={btn.to}
              className={({ isActive }) =>
                isActive ? "nav-item active" : "nav-item"
              }
              onClick={() => {
                // ✅ Only close sidebar on mobile
                if (window.innerWidth <= 768) {
                  setMobileOpen(false);
                }
              }}
            >
              {btn.icon}
              {!collapsed && <p>{btn.text}</p>}
            </NavLink>
          ))}
        </div>

        {/* ✅ Logout */}
        <div className="logout-nav" onClick={() => setLogoutDialog(true)}>
          <ExitToAppIcon className="dashboard-icons" />
          {!collapsed && <p>Logout</p>}
        </div>

        {/* ✅ Logout Confirmation Dialog */}
        <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to logout?
            </DialogContentText>
          </DialogContent>

          <DialogActions>
            <Button onClick={() => setLogoutDialog(false)}>Cancel</Button>
            <Button
              color="warning"
              onClick={() => {
                setLogoutDialog(false);
                logout();
              }}
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>
      </aside>
    </>
  );
};

export default SideNav;
