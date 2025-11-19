import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Snackbar, Alert, Button } from "@mui/material";

export default function Forbidden() {
  const location = useLocation();
  const { showToast } = useAuth() || {}; // if you already have a toast system in AuthContext

  const [open, setOpen] = React.useState(true);

  // ⚠️ Trigger toast if available
  useEffect(() => {
    if (showToast) {
      showToast("You are not authorized to view this page.", "warning");
    }
  }, [location, showToast]);

  return (
    <div
      style={{
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        textAlign: "center",
      }}
    >
      <h1 style={{ color: "#d32f2f", fontSize: "2rem", marginBottom: "1rem" }}>
        Access Denied 🚫
      </h1>
      <p style={{ color: "#666", marginBottom: 0, fontWeight: "600" }}>
        You do not have permission to view this page.
      </p>
      <p
        style={{
          color: "#666",
          marginTop: ".2rem",
          fontSize:"13px"
        }}
      >
        Contact your admin if you think this is a mistake
      </p>
      <Button
        variant="contained"
        color="primary"
        href="/"
        sx={{ borderRadius: "8px" }}
      >
        Go Back to Dashboard
      </Button>

      {/* Local Snackbar fallback if no global toast */}
      {!showToast && (
        <Snackbar
          open={open}
          autoHideDuration={4000}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity="warning" sx={{ width: "100%" }}>
            You are not authorized to view that page.
          </Alert>
        </Snackbar>
      )}
    </div>
  );
}
