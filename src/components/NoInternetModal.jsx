import React, { useEffect, useState } from "react";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import "../styles/nointernet.css";

const NoInternetModal = () => {
  const [open, setOpen] = useState(!navigator.onLine);
  const [backOnline, setBackOnline] = useState(false);

  useEffect(() => {
    const goOffline = () => {
      setBackOnline(false);
      setOpen(true);
    };

    const goOnline = () => {
      setBackOnline(true);

      setTimeout(() => {
        setOpen(false);
        setBackOnline(false);
      }, 2000);
    };

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="no-internet-overlay">
      <div className="no-internet-card">

        {backOnline ? (
          <>
            <CheckCircleIcon style={{ fontSize: 60, color: "#28a745" }} />
            <h2>You are back online</h2>
            <p>Restoring connection...</p>
          </>
        ) : (
          <>
            <CloudOffIcon style={{ fontSize: 60, color: "#d9534f" }} />
            <h2>No Internet Connection</h2>
            <p>Please check your network and try again.</p>
            <button
              className="refresh-btn"
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default NoInternetModal;
