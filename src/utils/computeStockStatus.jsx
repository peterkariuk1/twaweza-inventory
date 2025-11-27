export function computeStockStatus(inventory, productsMap, productsNameMap) {
  return inventory.map((inv) => {
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

    const unitPrice = Number(prod?.unitPrice ?? 0);
    const totalUnits = Number(inv.totalUnits ?? inv.quantity ?? 0);

    // min-stock → convert cartons to units
    let minUnits = null;
    if (prod) {
      const minVal = Number(prod.minStockValue ?? 0);
      const minType = (prod.minStockType ?? "Units").toLowerCase();
      const unitsPerCarton = Number(prod.unitsPerCarton ?? 1);

      minUnits = minType.includes("carton")
        ? minVal * unitsPerCarton
        : minVal;
    }

    // Determine status
    let status = "Unknown";
    if (totalUnits === 0) status = "Out of Stock";
    else if (minUnits !== null && totalUnits < minUnits) status = "Low";
    else if (minUnits !== null && totalUnits === minUnits) status = "Moderate";
    else if (minUnits !== null && totalUnits > minUnits) status = "In Stock";

    return {
      ...inv,
      product: prod,
      totalUnits,
      minUnits,
      status,
    };
  });
}
