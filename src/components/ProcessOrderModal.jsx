// components/OrderProcessingModal.jsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Collapse,
  IconButton,
  MenuItem,
  Select,
  Typography,
  Box,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import jiwaLogo from "../assets/Jiwa-Logo.png";
import { logEvent } from "../utils/Logger";

import { db } from "../firebase";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import "../styles/orders.css";
import { useAuth } from "../context/AuthContext";

export default function OrderProcessingModal({ open, onClose, order }) {
  const { role, user } = useAuth(); // single call
  const allowedRoles = ["director", "accountant"];

  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("");
  const [teamAssigned, setTeamAssigned] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [loadingReturn, setLoadingReturn] = useState(false);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState(false);

  // Snackbar
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setTeamAssigned(order.teamAssigned || "");
    }
  }, [order]);

  if (!order) return null;

  const isStatusDisabled = ["Cancelled", "Returned"].includes(order.status);
  const isStatusAllowed = allowedRoles.includes(role) && !isStatusDisabled;

  // ----------------------------- helpers -----------------------------
  const showSnack = (message, severity = "success") =>
    setSnack({ open: true, message, severity });

  // ----------------------------- PRINT DELIVERY NOTE -----------------------------
  const handlePrint = () => {
    try {
      const MIN_ROWS = 8;
      const date = order.timestamp?.toDate();
      const dateStr = date
        ? date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "short",
            day: "2-digit",
          })
        : new Date().toLocaleDateString("en-GB");

      const rowsArray = order.items
        .map((item) => {
          const particulars = item.pages
            ? `${item.itemName} • ${item.pages}${
                item.pages.toUpperCase().includes("QUIRE") ? "" : " pgs"
              }${item.category ? ` • ${item.category}` : ""}`
            : `${item.itemName}${item.category ? ` • ${item.category}` : ""}`;

          const qtyWithType = item.entryType
            ? `${item.qty} (${item.entryType})`
            : item.qty;

          return `
            <tr>
              <td>${qtyWithType}</td>
              <td>${item.orderUnits}</td>
              <td>${particulars}</td>
            </tr>
          `;
        })
        .filter(Boolean);

      while (rowsArray.length < MIN_ROWS) {
        rowsArray.push(`
          <tr>
            <td style="height:25px;"></td>
            <td></td>
            <td></td>
          </tr>
        `);
      }

      const totalCartons = order.items.reduce(
        (sum, item) =>
          sum + (item.entryType === "Cartons" ? Number(item.qty || 0) : 0),
        0
      );
      const totalUnits = order.items.reduce(
        (sum, item) => sum + (item.orderUnits || 0),
        0
      );

      rowsArray.push(`
        <tr style="background:#eaeaea;">
          <td><strong>${totalCartons} cartons</strong></td>
          <td><strong>${totalUnits} units</strong></td>
          <td><strong>Total</strong></td>
        </tr>
      `);

      const rowsHtml = rowsArray.join("");

      const watermarkStatus =
        order.status === "Cancelled"
          ? "CANCELLED"
          : order.status === "Pending"
          ? "DRAFT COPY"
          : order.status === "Returned"
          ? "RETURNED"
          : "";

      const html = `
        <html>
          <head>
            <title>Delivery Note(${watermarkStatus})-${order.orderNo}-${dateStr}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
            <style>
              body { font-family:'Inter',sans-serif; padding:40px; }
              h1 { margin-top:5px; }
              table { width:100%; border-collapse:collapse; margin-top:15px; font-size:15px; }
              th { background:#f4f4f4; padding:10px; border:1px solid #ccc; }
              td { padding:6px; border:1px solid #ccc; }
              .stamp-box { width:90%; height:65px; border-radius:8px; border:1px solid #000; margin-top:8px; }
              .line { height:10px; border-bottom:1px solid black; margin-top:14px; }
              .watermark {
                position: fixed;
                top: 45%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 100px;
                color: rgba(16, 16, 16, 0.41);
                font-weight: 700;
                letter-spacing: 10px;
                user-select: none;
                pointer-events: none;
                z-index: 3;
              }
            </style>
          </head>
          <body>
            <div class="watermark">${watermarkStatus}</div>
            <div style="display:flex;justify-content:space-between;">
              <div><img src="${jiwaLogo}" style="height:85px"/></div>
              <div style="text-align:right;font-size:14px;line-height:1.4;">
                Twaweza Printing Press Ltd<br/>
                Industrial Area, Likoni Road<br/>
                Off Londiani Road<br/>
                Opp. BAT Head Office<br/>
                P.O. Box 33745 - 00600<br/>
                Tel: +254 708 075 135<br/>
                Nairobi, Kenya<br/>
                Email: sales@twawezapress.co.ke
              </div>
            </div>

            <h1>DELIVERY NOTE</h1>

            <div style="text-align:right;margin-bottom:20px;">
              <strong>Date:</strong> ${dateStr}
            </div>

            <div style="margin-bottom:15px;font-size:15px;">
              <strong>Customer Name:</strong> ${order.customerName}<br/>
              <strong>Invoice No:</strong> ${order.invoiceNo}<br/>
              <strong>Order No:</strong> ${order.orderNo}
            </div>

            <strong>Please receive the following goods in good order and condition:</strong>

            <table>
              <thead>
                <tr>
                  <th>QTY</th>
                  <th>Total Units</th>
                  <th>Particulars</th>
                </tr>
              </thead>
              <tbody>${rowsHtml}</tbody>
            </table>

            <div style="display:flex;justify-content:space-between;margin-top:25px;">
              <div style="width:45%;">
                <div><strong>Received By</strong></div>
                <div class="line"></div>
                <div><strong>Sign & Stamp</strong></div>
                <div class="stamp-box"></div>
              </div>
              <div style="width:45%;">
                <div><strong>Delivered By</strong></div>
                <div class="line"></div>
                <div><strong>Sign & Stamp</strong></div>
                <div class="stamp-box"></div>
              </div>
            </div>
          </body>
        </html>
      `;

      const win = window.open("", "_blank");
      win.document.write(html);
      win.document.close();
      win.print();
    } catch (err) {
      console.error("Print error", err);
      showSnack("Failed to print delivery note", "error");
    }
  };

  // ----------------------------- CANCEL ORDER -----------------------------
  const confirmCancel = async () => {
    setLoadingCancel(true);
    try {
      for (const item of order.items) {
        const invRef = doc(db, "inventory", item.inventoryId);
        const invSnap = await getDoc(invRef);
        if (!invSnap.exists()) continue;

        // use orderUnits - that's already in units (qty * unitsPerCarton for cartons)
        const qtyToAdd = item.orderUnits || 0;

        await updateDoc(invRef, {
          quantity: increment(qtyToAdd),
          totalUnits: increment(qtyToAdd),
        });
      }

      await logEvent({
        userId: user?.uid || "unknown",
        email: user?.email || "unknown",
        action: "CANCEL_ORDER",
        details: {
          orderId: order.id,
          orderNo: order.orderNo,
          invoiceNo: order.invoiceNo,
          customerName: order.customerName,
          schoolName: order.schoolName,
          totalUnitsReturned: order.items.reduce(
            (sum, it) => sum + (it.orderUnits || 0),
            0
          ),
        },
      });

      await updateDoc(doc(db, "orders", order.id), {
        status: "Cancelled",
        updatedAt: new Date(),
      });

      setShowCancelConfirm(false);
      showSnack("Order cancelled and inventory updated", "success");
      onClose();
    } catch (err) {
      console.error("Cancel order error:", err);
      showSnack("Failed to cancel order", "error");
    } finally {
      setLoadingCancel(false);
    }
  };

  // ----------------------------- RETURN ORDER -----------------------------
  const confirmReturn = async () => {
    setLoadingReturn(true);
    try {
      for (const item of order.items) {
        const invRef = doc(db, "inventory", item.inventoryId);
        const invSnap = await getDoc(invRef);
        if (!invSnap.exists()) continue;

        const qtyToAdd = item.orderUnits || 0;

        await updateDoc(invRef, {
          quantity: increment(qtyToAdd),
          totalUnits: increment(qtyToAdd),
        });
      }

      await logEvent({
        userId: user?.uid || "unknown",
        email: user?.email || "unknown",
        action: "RETURN_ORDER",
        details: {
          orderId: order.id,
          orderNo: order.orderNo,
          invoiceNo: order.invoiceNo,
          customerName: order.customerName,
          schoolName: order.schoolName,
          totalUnitsReturned: order.items.reduce(
            (sum, it) => sum + (it.orderUnits || 0),
            0
          ),
        },
      });

      await updateDoc(doc(db, "orders", order.id), {
        status: "Returned",
        updatedAt: new Date(),
      });

      setShowReturnConfirm(false);
      showSnack("Order returned and inventory updated", "success");
      onClose();
    } catch (err) {
      console.error("Return order error:", err);
      showSnack("Failed to return order", "error");
    } finally {
      setLoadingReturn(false);
    }
  };

  // ----------------------------- SAVE CHANGES -----------------------------
  const handleSave = async () => {
    if (!isStatusAllowed) {
      showSnack("You are not allowed to change status", "warning");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "orders", order.id), {
        status,
        teamAssigned: status === "Dispatched" ? teamAssigned : null,
        updatedAt: new Date(),
      });

      await logEvent({
        userId: user?.uid || "unknown",
        email: user?.email || "unknown",
        action: "DISPATCH_ORDER",
        details: {
          orderId: order.id,
          orderNo: order.orderNo,
          invoiceNo: order.invoiceNo,
          customerName: order.customerName,
          schoolName: order.schoolName,
          totalUnitsOrdered: order.items.reduce(
            (sum, it) => sum + (it.orderUnits || 0),
            0
          ),
        },
      });

      showSnack("Order updated", "success");
      setSaving(false);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      showSnack("Failed to save changes", "error");
      setSaving(false);
    }
  };

  // ----------------------------- RENDER -----------------------------
  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle>Order #{order.orderNo}</DialogTitle>

        <DialogContent>
          {isStatusDisabled && (
            <Typography
              color={order.status === "Cancelled" ? "error" : "warning"}
            >
              {order.status}
            </Typography>
          )}

          {/* ORDER INFO */}
          <Box mb={2}>
            <Typography>
              <strong>Customer:</strong> {order.customerName}
            </Typography>
            <Typography>
              <strong>School:</strong> {order.schoolName}
            </Typography>
            <Typography>
              <strong>Contact:</strong> {order.customerContact}
            </Typography>
            <Typography>
              <strong>Invoice:</strong> {order.invoiceNo}
            </Typography>
            <Typography>
              <strong>Date:</strong>{" "}
              {order.timestamp?.toDate().toLocaleString()}
            </Typography>
          </Box>

          {/* COLLAPSIBLE ITEMS */}
          <Box
            onClick={() => setExpanded(!expanded)}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              mb: 1,
            }}
          >
            <Typography variant="h6">Items ({order.items.length})</Typography>
            <IconButton size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>

          <Collapse in={expanded}>
            <div className="orders-table-wrapper">
              <table className="order-items-table">
                <thead>
                  <tr>
                    <th>QTY</th>
                    <th>Total Units</th>
                    <th>Particulars</th>
                    <th>Store</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((it, i) => {
                    const particulars = it.pages?.includes("QUIRE")
                      ? `${it.itemName} • ${it.pages}`
                      : `${it.itemName} • ${it.pages} pgs`;
                    return (
                      <tr key={i}>
                        <td>{it.qty}</td>
                        <td>{it.orderUnits}</td>
                        <td>{particulars}</td>
                        <td>{it.store}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Collapse>

          {/* STATUS */}
          <Box mt={3}>
            <Typography fontWeight="bold" mb={1}>
              Update Status
            </Typography>
            {isStatusAllowed ? (
              <Select
                fullWidth
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Dispatched">Dispatched</MenuItem>
              </Select>
            ) : (
              <Tooltip title="You cannot change status for Cancelled/Returned or you lack permission">
                <TextField fullWidth value={status} disabled />
              </Tooltip>
            )}

            {/* Team assignment as string input */}
            {status === "Dispatched" && (
              <Box mt={2}>
                <Typography fontWeight="bold">Assign Team</Typography>
                <TextField
                  fullWidth
                  value={teamAssigned}
                  onChange={(e) => setTeamAssigned(e.target.value)}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          {/* Cancel & Return Buttons */}
          {isStatusAllowed ? (
            <Button
              onClick={() => setShowCancelConfirm(true)}
              color="error"
              disabled={loadingCancel}
            >
              {loadingCancel ? <CircularProgress size={20} /> : "Cancel Order"}
            </Button>
          ) : (
            <Tooltip title="You cannot cancel this order due to its current status or lack of permission">
              <span>
                <Button color="error" disabled>
                  Cancel Order
                </Button>
              </span>
            </Tooltip>
          )}

          {isStatusAllowed ? (
            <Button
              onClick={() => setShowReturnConfirm(true)}
              color="warning"
              disabled={loadingReturn}
            >
              {loadingReturn ? <CircularProgress size={20} /> : "Return Order"}
            </Button>
          ) : (
            <Tooltip title="You cannot return this order due to its current status or lack of permission">
              <span>
                <Button color="warning" disabled>
                  Return Order
                </Button>
              </span>
            </Tooltip>
          )}

          <Button onClick={handlePrint}>Print Note</Button>

          {isStatusAllowed ? (
            <Button variant="contained" onClick={handleSave} disabled={saving}>
              {saving ? <CircularProgress size={20} /> : "Save Changes"}
            </Button>
          ) : (
            <Tooltip title="You cannot save changes because the order is Cancelled/Returned or you lack permission">
              <span>
                <Button variant="contained" disabled>
                  Save Changes
                </Button>
              </span>
            </Tooltip>
          )}
        </DialogActions>
      </Dialog>

      {/* ----------------- CANCEL CONFIRM DIALOG ----------------- */}
      <Dialog
        open={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
      >
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <Typography>
            Cancelling this order is <strong>irreversible</strong> and will
            return items to inventory. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowCancelConfirm(false)}
            disabled={loadingCancel}
          >
            No
          </Button>
          <Button
            color="error"
            onClick={confirmCancel}
            disabled={isStatusDisabled || loadingCancel}
          >
            {loadingCancel ? <CircularProgress size={20} /> : "Yes, Cancel"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------------- RETURN CONFIRM DIALOG ----------------- */}
      <Dialog
        open={showReturnConfirm}
        onClose={() => setShowReturnConfirm(false)}
      >
        <DialogTitle>Confirm Return</DialogTitle>
        <DialogContent>
          <Typography>
            Returning this order is <strong>irreversible</strong> and will
            return items to inventory. Are you sure you want to continue?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowReturnConfirm(false)}
            disabled={loadingReturn}
          >
            No
          </Button>
          <Button
            disabled={isStatusDisabled || loadingReturn}
            color="warning"
            onClick={confirmReturn}
          >
            {loadingReturn ? <CircularProgress size={20} /> : "Yes, Return"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3500}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </>
  );
}
