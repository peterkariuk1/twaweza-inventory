import emailjs from "@emailjs/browser";

console.log("sendLowStockEmail LOADED");

export const sendLowStockEmail = async (item) => {
  const templateParams = {
    item_name: item.itemName,
    item_category: item.category || "N/A",
    pages: item.pages || "N/A",
    store: item.store || "N/A",

    // inventory amounts
    quantity_cartons: item.quantity || 0, // number of cartons/boxes
    units_per_carton: item.unitsPerCarton || "N/A",
    current_units: item.totalUnits,
    minimum_units: item.minUnits || 0,

    timestamp: new Date().toLocaleString(),
  };

  return emailjs.send(
    import.meta.env.VITE_EMAILJS_SERVICE_ID,
    import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
    templateParams,
    import.meta.env.VITE_EMAILJS_PUBLIC_KEY
  );
};
