import React, { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { sendLowStockEmail } from "../utils/sendLowStockEmail";

const EmailAlerts = () => {
  const [inventory, setInventory] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [productsNameMap, setProductsNameMap] = useState({});

  // -----------------------------
  // 🔥 LISTEN TO INVENTORY
  // -----------------------------
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventory"), (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setInventory(data);
    });
    return () => unsub();
  }, []);


  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const map = {};
      const nameMap = {};

      snap.docs.forEach((d) => {
        const data = d.data();
        const id = d.id;
        const entry = { id, ...data };

        if (id) map[id] = entry;
        if (data.productId) map[data.productId] = entry;

        if (data.itemName && typeof data.itemName === "string") {
          nameMap[data.itemName.trim().toLowerCase()] = entry;
        }

        if (data.pages && data.itemName) {
          const combo = `${data.pages} ${data.itemName}`
            .trim()
            .toLowerCase();
          nameMap[combo] = entry;
        }
      });

      setProductsMap(map);
      setProductsNameMap(nameMap);
    });

    return () => unsub();
  }, []);


  useEffect(() => {
    console.log("Email Alert Checker RUNNING. Inventory count:", inventory.length);

    inventory.forEach((inv) => {
   
      const prod =
        productsMap[inv.productRef] ||
        productsMap[inv.productId] ||
        productsNameMap[inv.itemName?.trim().toLowerCase()] ||
        productsNameMap[
          inv.pages && inv.itemName
            ? `${inv.pages} ${inv.itemName}`.trim().toLowerCase()
            : ""
        ] ||
        null;

    
      let minUnits = 0;

      if (prod) {
        const minVal = Number(prod.minStockValue ?? 0);
        const minType = (prod.minStockType ?? "Units").toLowerCase();
        const unitsPerCarton = Number(prod.unitsPerCarton ?? 1);

        minUnits = minType.includes("carton")
          ? minVal * unitsPerCarton
          : minVal;
      }

     
      const totalUnits = Number(inv.totalUnits ?? inv.quantity ?? 0);

      let status = "Unknown";

      if (totalUnits === 0) status = "Out of Stock";
      else if (totalUnits < minUnits) status = "Low";
      else if (totalUnits === minUnits) status = "Moderate";
      else if (totalUnits > minUnits) status = "In Stock";

      console.log(
        `Checking: ${inv.itemName} → Units: ${totalUnits}, Min: ${minUnits}, Status: ${status}`
      );

 
      if (inv.alertSent && totalUnits > minUnits) {
        console.log("Reset alertSent for:", inv.itemName);
        updateDoc(doc(db, "inventory", inv.id), { alertSent: false });
        return;
      }

      if (status === "Low" && !inv.alertSent) {
        console.log("🔥 Sending Low Stock Email for:", inv.itemName);

        sendLowStockEmail({
          ...inv,
          minUnits,
          computedStatus: status,
        })
          .then(() => {
            console.log("✅ Email sent for:", inv.itemName);
            updateDoc(doc(db, "inventory", inv.id), {
              alertSent: true,
              alertSentAt: new Date(),
            });
          })
          .catch((err) =>
            console.error("❌ Email send failed for:", inv.itemName, err)
          );
      }
    });
  }, [inventory, productsMap, productsNameMap]);

  return null;
};

export default EmailAlerts;
