import { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  CircularProgress,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  useMediaQuery,
  Snackbar,
  Alert,
} from "@mui/material";
import { MoreVert, Search, PictureAsPdf, Print } from "@mui/icons-material";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import "../styles/products.css";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProd, setSelectedProd] = useState(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const isMobile = useMediaQuery("(max-width:768px)");
  const printRef = useRef();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProducts(data);
      setFiltered(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔍 Filter + Sort
  useEffect(() => {
    let data = products.filter(
      (p) =>
        p.itemName?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        p.pages?.toLowerCase().includes(search.toLowerCase()) ||
        p.productId?.toLowerCase().includes(search.toLowerCase())
    );

    if (sort === "name")
      data.sort((a, b) => a.itemName.localeCompare(b.itemName));
    if (sort === "price") data.sort((a, b) => a.unitPrice - b.unitPrice);
    if (sort === "category")
      data.sort((a, b) => a.category.localeCompare(b.category));

    setFiltered(data);
  }, [search, sort, products]);

  const capitalizeFirstLetter = (str) => {
    if (typeof str !== "string" || str.length === 0) {
      return str; // Handle empty strings or non-string inputs
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // 🗑️ Delete Product
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", selectedProd.id));
      setOpenDelete(false);
      setSnackbar({
        open: true,
        message: "Product deleted successfully!",
        type: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error deleting product.",
        type: "error",
      });
    }
  };

  // ✏️ Handle Edit Save
  const handleSaveEdit = async () => {
    try {
      const updated = {
        category: selectedProd.category,
        itemName: selectedProd.itemName,
        pages: selectedProd.pages,
        minStockType: selectedProd.minStockType,
        minStockValue: Number(selectedProd.minStockValue),
        unitPrice: Number(selectedProd.unitPrice),
        unitsPerCarton: Number(selectedProd.unitsPerCarton),
        pricePerCarton:
          Number(selectedProd.unitPrice) * Number(selectedProd.unitsPerCarton),
      };
      await updateDoc(doc(db, "products", selectedProd.id), updated);
      setOpenEdit(false);
      setSnackbar({
        open: true,
        message: "Product updated successfully!",
        type: "success",
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: "Error updating product.",
        type: "error",
      });
    }
  };

  // 📄 Download PDF (Table Only)
  const handleDownload = () => {
    const docx = new jsPDF();
    docx.text("Products Breakdown", 14, 16);
    autoTable(docx, {
      startY: 22,
      head: [
        [
          "Product Name",
          "Category",
          "Unit Price",
          "Units/Carton",
          "Price/Carton",
          "Min Stock",
          "Product ID",
        ],
      ],
      body: filtered.map((p) => [
        p.pages
          ? p.pages.toUpperCase().includes("QUIRE")
            ? `${p.pages} ${p.itemName}`
            : `${p.pages}pgs ${p.itemName}`
          : p.itemName,
        p.category,
        p.unitPrice,
        p.unitsPerCarton,
        p.unitPrice * p.unitsPerCarton,
        `${p.minStockValue} (${p.minStockType})`,
        p.productId,
      ]),
    });
    docx.save("twaweza_products_breakdown.pdf");
  };

  // 🖨️ Print Only Table
  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const newWin = window.open("", "_blank");
    newWin.document.write(`
      <html>
        <head>
          <title>Products Breakdown</title>
          <style>
            body { font-family: Arial; padding: 20px; }
            h2 { text-align: center; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background: #f5f5f5; }
          </style>
        </head>
        <body>
          <h2>Products Breakdown</h2>
          ${printContents}
        </body>
      </html>
    `);
    newWin.document.close();
    newWin.print();
  };

  if (loading) {
    return (
      <div className="loading-state">
        <CircularProgress />
        <p>Loading products...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      {/* Top controls */}
      <div className="products-controls">
        <div className="left-controls">
          <Button
            variant="contained"
            startIcon={<PictureAsPdf />}
            onClick={handleDownload}
          >
            Download PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Print />}
            onClick={handlePrint}
          >
            Print
          </Button>
        </div>

        <div className="right-controls">
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />

          <FormControl size="small">
            <InputLabel>Sort by</InputLabel>
            <Select
              native
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value=""></option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="category">Category</option>
            </Select>
          </FormControl>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper" ref={printRef}>
        <TableContainer component={Paper} className="products-table">
          <Table size={isMobile ? "small" : "medium"}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "600" }}>Product Name</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Category</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Unit Price</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Units/Carton</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Price/Carton</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Min Stock</TableCell>
                <TableCell sx={{ fontWeight: "600" }}>Product ID</TableCell>
                <TableCell align="right" sx={{ fontWeight: "600" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No matching products found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((prod) => (
                  <TableRow key={prod.id} hover>
                    <TableCell>
                      {prod.pages
                        ? prod.pages.toUpperCase().includes("QUIRE")
                          ? `${prod.pages} ${capitalizeFirstLetter(
                              prod.itemName
                            )}`
                          : `${prod.pages}pgs ${capitalizeFirstLetter(
                              prod.itemName
                            )}`
                        : capitalizeFirstLetter(prod.itemName)}
                    </TableCell>
                    <TableCell>{prod.category}</TableCell>
                    <TableCell>{prod.unitPrice}</TableCell>
                    <TableCell>{prod.unitsPerCarton}</TableCell>
                    <TableCell>
                      {prod.unitPrice * prod.unitsPerCarton}
                    </TableCell>
                    <TableCell>
                      {prod.minStockValue} ({prod.minStockType})
                    </TableCell>
                    <TableCell>{prod.productId}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        onClick={(e) => {
                          setAnchorEl(e.currentTarget);
                          setSelectedProd(prod);
                        }}
                      >
                        <MoreVert />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem
          onClick={() => {
            setOpenEdit(true);
            setAnchorEl(null);
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            setOpenDelete(true);
            setAnchorEl(null);
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      {/* Confirm Delete */}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            <strong>{selectedProd?.itemName}</strong>? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Modal */}
      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Product</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Category"
            fullWidth
            value={selectedProd?.category || ""}
            onChange={(e) =>
              setSelectedProd({ ...selectedProd, category: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Item Name"
            fullWidth
            value={selectedProd?.itemName || ""}
            onChange={(e) =>
              setSelectedProd({ ...selectedProd, itemName: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Pages"
            fullWidth
            value={selectedProd?.pages || ""}
            onChange={(e) =>
              setSelectedProd({ ...selectedProd, pages: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Min Stock Type"
            fullWidth
            value={selectedProd?.minStockType || ""}
            onChange={(e) =>
              setSelectedProd({ ...selectedProd, minStockType: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Min Stock Value"
            type="number"
            fullWidth
            value={selectedProd?.minStockValue || ""}
            onChange={(e) =>
              setSelectedProd({
                ...selectedProd,
                minStockValue: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Unit Price"
            type="number"
            fullWidth
            value={selectedProd?.unitPrice || ""}
            onChange={(e) =>
              setSelectedProd({ ...selectedProd, unitPrice: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Units Per Carton"
            type="number"
            fullWidth
            value={selectedProd?.unitsPerCarton || ""}
            onChange={(e) =>
              setSelectedProd({
                ...selectedProd,
                unitsPerCarton: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Price Per Carton (Auto Calculated)"
            fullWidth
            disabled
            value={
              selectedProd?.unitPrice && selectedProd?.unitsPerCarton
                ? selectedProd.unitPrice * selectedProd.unitsPerCarton
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
}
