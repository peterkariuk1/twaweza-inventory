import { collection, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const logEvent = async ({ userId, email, action, details = {} }) => {
  try {
    let finalEmail = email || null;

    // If no email provided but userId exists → fetch from users collection
    if (!finalEmail && userId) {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        finalEmail = userSnap.data().email || null;
      }
    }

    // Build Firestore-safe payload
    const payload = {
      action,
      details,
      timestamp: serverTimestamp(),
    };

    if (userId) payload.userId = userId;
    if (finalEmail) payload.email = finalEmail; // Only add if not null

    await addDoc(collection(db, "logs"), payload);
  } catch (err) {
    console.error("Logger error:", err);
  }
};
