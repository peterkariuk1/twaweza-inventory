import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

// ✅ Allowed system roles
const allowedRoles = ["director", "accountant", "storekeeper"];

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [role, setRole] = useState(null);       // Firestore role
  const [loading, setLoading] = useState(true); // App-level loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        // User logged out
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      // ✅ User exists → read role from Firestore
      const snap = await getDoc(doc(db, "users", firebaseUser.uid));

      if (snap.exists()) {
        const fetchedRole = snap.data().role;

        // ✅ Reject users without assigned role
        if (!fetchedRole) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        // ✅ Reject roles outside allowed list
        if (!allowedRoles.includes(fetchedRole.toLowerCase())) {
          setUser(null);
          setRole(null);
          setLoading(false);
          return;
        }

        // ✅ Success
        setUser(firebaseUser);
        setRole(fetchedRole);
      } else {
        setUser(null);
        setRole(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, role, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => useContext(AuthContext);
