import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import "../styles/login.css";
import jiwaLogo from "../assets/Jiwa-Logo.png";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const LoginSignup = () => {
  const [mode, setMode] = useState("login"); // login | signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const showToast = (message, severity = "info") => {
    setToast({ open: true, message, severity });
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const allowedRoles = ["director", "accountant", "storekeeper"];

    try {
      let userCredential;

      // ✅ SIGNUP FLOW
      if (mode === "signup") {
        userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const user = userCredential.user;

        // ✅ Create Firestore user doc (role = null initially)
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: null,
          createdAt: new Date(),
        });

        showToast("Account created! Ask admin to assign your role.", "success");

        // Switch to login screen
        setTimeout(() => setMode("login"), 1200);
      }

      // ✅ LOGIN FLOW
      else {
        userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        const uid = userCredential.user.uid;
        const userDoc = await getDoc(doc(db, "users", uid));

        // ✅ Missing profile doc
        if (!userDoc.exists()) {
          showToast("User profile not found. Contact admin.", "error");
          setLoading(false);
          return;
        }

        const userRole = userDoc.data().role;

        // ✅ Role not assigned
        if (!userRole) {
          showToast("Your role is not assigned yet. Contact admin.", "warning");
          setLoading(false);
          return;
        }

        // ✅ Role not allowed
        if (!allowedRoles.includes(userRole.toLowerCase())) {
          showToast("Your role does not have access to this system.", "error");
          setLoading(false);
          return;
        }

        // ✅ SUCCESS
        showToast(`Welcome, ${userRole}!`, "success");

        setTimeout(() => (window.location.href = "/"), 1200);
      }
    } catch (err) {
      console.error(err);

      if (mode === "signup") {
        showToast("Signup failed. Please try again.", "error");
      } else {
        showToast("Invalid login credentials.", "error");
      }
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={jiwaLogo} alt="logo" className="login-logo" />

        <h2>{mode === "login" ? "Welcome Back" : "Create Account"}</h2>
        <p className="login-sub">
          {mode === "login"
            ? "Login to access the dashboard"
            : "Sign up to start using the system"}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email (Username)</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Processing..." : mode === "login" ? "Login" : "Sign Up"}
          </button>
        </form>

        <div className="switch-auth">
          {mode === "login" ? (
            <p>
              Don't have an account?{" "}
              <span onClick={toggleMode}>Create one</span>
            </p>
          ) : (
            <p>
              Already have an account? <span onClick={toggleMode}>Login</span>
            </p>
          )}
        </div>
      </div>

      {/* ✅ MUI Snackbar */}
      <Snackbar
        open={toast.open}
        autoHideDuration={2500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={toast.severity} sx={{ width: "100%" }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginSignup;
