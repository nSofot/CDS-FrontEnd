import { useEffect, useState, useRef, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { FaRegFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle";

Modal.setAppElement("#root");

export default function SaleInvoicePage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // ---------------- STATE ----------------
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [orderNumber, setOrderNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const reportRef = useRef();

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

const uomMap = {
    "kg": "Kg",
    "g": "Gram",
    "L": "Liter",
    "ml": "Milliliter",
    "pcs": "Piece",
  };

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchCustomers();
    fetchProducts();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`,
        { headers }
      );
      setCustomers(res.data || []);
    } catch {
      toast.error("Failed to load members");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        { headers }
      );
      setProducts(res.data || []);
    } catch {
      toast.error("Failed to load stock");
    }
  };

  // ---------------- ITEMS ----------------
  const addItemRow = () => {
    setItems([
      ...items,
      { productId: "", productName: "", qty: 0, inStock: 0, unit: "", rate: 0, amount: 0, cost: 0, rowCost: 0 },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];

    if (field === "qty") {
      const max = Number(updated[index].inStock || 0);
      value = Math.min(Math.max(Number(value || 0), 0), max);
    }

    updated[index][field] = value;

    const qty = Number(updated[index].qty || 0);
    const rate = Number(updated[index].rate || 0);

    updated[index].amount = qty * rate;

    setItems(updated);
  };

  // ---------------- SELECT PRODUCT ----------------
  const selectProduct = (product) => {
    if (selectedRowIndex === null) return;

    const updated = [...items];

    updated[selectedRowIndex] = {
      ...updated[selectedRowIndex],
      productId: product.stockId,
      productName: product.stockName,
      cost: product.stockCost || 0,
      rate: product.stockPrice || 0,
      qty: 0,
      inStock: product.stockQuantity,
      unit: uomMap[product.stockUOM] || product.stockUOM,
      amount: product.stockPrice || 0,
      rowCost: product.stockCost || 0,
    };

    setItems(updated);
    setProductModalOpen(false);
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toFixed(2);
  };
    
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };
  
  const formatNumber = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // ---------------- TOTAL ----------------
  const totalAmount = items.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const totalCost = items.reduce(
    (sum, item) => sum + Number(item.rowCost || 0),
    0
  )

  const pdfPage = {
    width: "760px",
    padding: "30px 40px",
    fontFamily: "Arial",
    fontSize: "12px",
    color: "#000",
    background: "#fff",
    boxSizing: "border-box",
  };

  const center = {
    textAlign: "center",
  };

  const twoCol = {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "10px",
  };  

  const colBox = {
    width: "32%",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "6px",
  };
  
  const sectionBold = {
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "8px",
  };

  const section = {
    marginTop: "20px",
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    pageBreakInside: "auto",
  };

  const th = {
    border: "1px solid #ccc",
    padding: "6px",
    background: "#eee",
    textAlign: "left",
  };

  const td = {
    border: "1px solid #ccc",
    padding: "6px",
  };

  /* ---------------- PDF DOWNLOAD ---------------- */
  const handleDownloadPDF = async () => {
    try {
      const element = reportRef.current;

      await html2pdf()
        .set({
          margin: 0.3,
          filename: `Invoice_${invoiceNumber}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
          },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error("PDF ERROR:", err);
      toast.error("PDF failed");
    }
  };

  // ---------------- SUBMIT ----------------
  const handleSubmit = async () => {
    if (!selectedCustomer) return toast.error("Select a member/customer");
    if (orderNumber === "") return toast.error("Enter order number");
    if (items.length === 0) return toast.error("Add items");

    try {
      setLoading(true);

      // 1. SALE INVOICE PAYLOAD
      const stockTrxPayload = {
        referenceId: orderNumber,
        trxDate: invoiceDate,
        trxType: "SalesInvoice",
        description: selectedCustomer.nameInSinhala ||
              `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
        isAdded: false,
        clientId: selectedCustomer.memberId,
        items: items.map((i) => ({
          stockId: i.productId,
          stockName: i.productName,
          quantity: i.qty,
          quantityBalance: 0,
          stockUOM: i.unit,
          stockCost: i.cost,
          stockPrice: i.rate,
        })),
      };

      const stockTrxRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
        stockTrxPayload
      );        

      const newTrxId = stockTrxRes.data.data.issuedTrxId;
      setInvoiceNumber(newTrxId);
     
      // 2. STOCK UPDATE - SUBSTRACT
      await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-reduce`,
          {
              items: items.map((item) => ({
                stockId: item.productId,
                quantity: Number(item.qty || 0),
              })),
          },
      );  

      // 3. Customer Transaction Write
      const cusTrxPayload = {
          trxId: newTrxId,
          referenceId: orderNumber,
          trxDate: invoiceDate,
          trxType: "SalesInvoice",
          memberId: selectedCustomer.memberId,
          memberName: selectedCustomer.nameInSinhala ||
                `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          description: "Sales Invoice",
          isCredit: false,
          amount: totalAmount,
          dueAmount: totalAmount,
      };
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        cusTrxPayload
      )
      
      // 4. Member/Customer balance update
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member/${selectedCustomer.memberId}/due/add`,
        {amount: totalAmount}
      );

      // 5. Update stock quantity balance in GRN
      const payload = {
        items: items.map((i) => ({
          stockId: i.productId,
          stockName: i.productName,
          quantity: i.qty,
          quantityBalance: 0,
          stockUOM: i.unit,
          stockCost: i.cost,
          stockPrice: i.rate,
        })),
      };
      const detailsRes = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction/updateQuantityBalance`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const updatedDetails = detailsRes?.data?.issueDetails || [];


      // 6. Update Stock Issue Details      
      const updatePayload = {
        issueTrxId: newTrxId,
        issueReferenceId: orderNumber,
        issueDate: invoiceDate,
        items: updatedDetails,
      };         
      const updateRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-issue-details`,
        updatePayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Invoice created successfully");

    } catch (err) {
        console.error("Invoice Error:", err);
        toast.error(err?.response?.data?.message || "Error saving invoice");
    } finally {
        setIsSaved(true);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-orange-600">🧾 Sale Invoice</h1>
          <p className="text-sm text-gray-500">Create sales invoice</p>
        </div>

        <div className="flex gap-3 no-print">
          <button
            onClick={handleDownloadPDF}
            disabled={isSaved === false}
            className="flex gap-2 items-center px-5 py-3 rounded-xl text-white"
            style={{
              backgroundColor: isSaved === false ? "#9ca3af" : "#ea580c",
            }}
          >
            <FaRegFilePdf size={20} />
            PDF
          </button>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* CUSTOMER */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <label className="text-sm font-medium">Customer</label>

        <button
          onClick={() => setCustomerModalOpen(true)}
          className="w-full border p-3 mt-2 rounded-lg text-left"
        >
          {selectedCustomer ? (
            <>
              <p className="font-semibold">
                {selectedCustomer.nameInSinhala ||
                  `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
              </p>
              <p className="text-xs text-gray-500">
                {selectedCustomer.memberId}
              </p>
            </>
          ) : (
            <span className="text-gray-400">Select Customer</span>
          )}
        </button>
      </div>

      {/* DATE */}
      <div className="flex bg-white p-4 rounded-xl shadow mb-6 gap-4">
          <div>
              <label className="text-sm font-medium">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="ml-6 border p-2 mt-2 rounded-lg"
              />
          </div>

          <div>
              <label className="text-sm font-medium">Order No</label>
              <input
                type="orderNo"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="ml-6 border p-2 mt-2 rounded-lg"
              />
          </div>
      </div>

      {/* ITEMS */}
      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="flex justify-between mb-3">
          <h2 className="font-semibold">Items</h2>

          <button
            onClick={addItemRow}
            className="bg-orange-500 text-white px-3 py-1 rounded"
          >
            + Add Item
          </button>
        </div>

        <table className="w-full text-sm">
            <thead className="bg-orange-50">
                <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-right">Qty</th>
                <th className="p-2 text-right">Available</th>
                <th className="p-2 text-left">UOM</th>
                <th className="p-2 text-right">Rate</th>
                <th className="p-2 text-right">Amount</th>
                <th className="p-2 text-center"></th>
                </tr>
            </thead>

            <tbody>
                {items.map((item, i) => (
                <tr key={i} className="border-t">
                    {/* PRODUCT */}
                    <td className="p-2">
                    <button
                        onClick={() => {
                        setSelectedRowIndex(i);
                        setProductModalOpen(true);
                        }}
                        className="text-orange-600 hover:underline"
                    >
                        {item.productName || "Select Product"}
                    </button>
                    </td>

                    {/* QTY */}
                    <td className="p-2 text-right">
                      <input
                        type="number"
                        max={item.inStock}
                        min={0}                      
                        value={item.qty}
                        onChange={(e) => {
                          let value = Number(e.target.value);

                          const max = Number(item.inStock || 0);

                          // prevent negative
                          if (value < 0) value = 0;

                          // prevent exceeding stock
                          if (value > max) {
                            toast.error(`Max available stock is ${max}`);
                            value = max;
                          }

                          updateItem(i, "qty", value);
                        }}
                        className="w-20 text-right border rounded px-2 py-1"
                      />
                    </td>

                    {/* AVAILABLE */}
                    <td className="p-2 text-right">
                    {item.inStock ?? "N/A"}
                    </td>

                    {/* UOM */}
                    <td className="p-2 text-left">
                    {item.unit || "N/A"}
                    </td>

                    {/* RATE */}
                    <td className="p-2 text-right">
                    <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => updateItem(i, "rate", e.target.value)}
                        className="w-24 text-right border rounded px-2 py-1"
                    />
                    </td>

                    {/* AMOUNT */}
                    <td className="p-2 text-right font-medium">
                    {Number(item.amount || 0).toFixed(2)}
                    </td>

                    {/* ACTION */}
                    <td className="p-2 text-center">
                    <button
                        onClick={() => removeItem(i)}
                        className="text-red-500 hover:text-red-700"
                    >
                        ✖
                    </button>
                    </td>
                </tr>
                ))}

                {items.length === 0 && (
                <tr>
                    <td colSpan="7" className="text-center py-4 text-gray-400">
                    No items added
                    </td>
                </tr>
                )}
            </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-4">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-green-600">
          {totalAmount.toFixed(2)}
        </span>
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        disabled={loading || isSaved}
        className={`w-full py-3 rounded-xl text-white ${
          loading || isSaved ? "bg-gray-400 cursor-not-allowed" : "bg-green-600"
        }`}
      >
        {loading && !isSaved
          ? "Saving..."
          : isSaved
          ? "Completed, Download PDF"
          : "Create Invoice"}
      </button>



      {/* ================= PDF LAYOUT ================= */}
      {/* ⚠️ NO TAILWIND HERE */}
      <div style={{ display: "none" }}>
        <div ref={reportRef} style={{ pageBreakInside: "avoid" }}>
          <div style={pdfPage}>

            <h2
              style={{
                ...center,
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Collective Development Society
            </h2>
            <h2
              style={{
                ...center,
                fontWeight: "normal",
                fontSize: "10px",
                marginBottom: "10px",
              }}
            >
              Malmaduwa, Kotiyakumbura. Tel: 022-2222222
            </h2>
            <h2
              style={{
                ...center,
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              Sales Invoice
            </h2>

            <div style={twoCol}>
              
              {/* COLUMN 1 */}
              <div style={colBox}>
                <p>{selectedCustomer?.memberId || "N/A"}</p>
                <p>
                  {selectedCustomer
                    ? selectedCustomer.nameInSinhala ||
                      `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                    : "N/A"}
                </p>
                <p>
                  {selectedCustomer?.address
                    ? Object.values(selectedCustomer.address)
                        .filter(Boolean)
                        .join(", ")
                    : "N/A"}
                </p>
              </div>

              {/* COLUMN 2 */}
              <div style={colBox}>
                <p><b>Invoice No:</b> {invoiceNumber}</p>
                <p><b>Date:</b> {formatDate(invoiceDate)}</p>
                <p><b>Order Number:</b>{orderNumber}</p>
              </div>

            </div>

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Item DEscription</th>
                  <th style={th}>Qty</th>
                  <th style={th}>UOM</th>
                  <th style={{ ...th, textAlign: "right" }}>Rate</th>
                  <th style={{ ...th, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {items?.map((m, i) => (
                  <Fragment key={i}>
                    <tr style={{ pageBreakInside: "avoid" }}>
                      <td style={td}>{m.productName}</td>
                      <td style={td}>{m.qty}</td>
                      <td style={td}>{m.unit}</td>
                      <td style={{ ...td, textAlign: "right" }}>{formatCurrency(m.rate)}</td>
                      <td style={{ ...td, textAlign: "right" }}>{formatCurrency(m.amount)}</td>
                    </tr>
                  </Fragment>
                ))}

                {/* 🔽 TOTAL ROW */}
                <tr>
                  <td style={{ ...td, fontWeight: "bold" }} colSpan="4">
                    Total
                  </td>
                  <td style={{ ...td, fontWeight: "bold", textAlign: "right" }}>
                    {formatCurrency(totalAmount)}
                  </td>
                </tr>
              </tbody>

            </table>
            {/* <hr style={{ marginTop: "30px", marginBottom: "10px", borderColor: "#ddd" }} /> */}
            <div style={{ marginTop: "5px", textAlign: "center", fontSize: "11px", color: "#555" }}>
              This is a system generated invoice. No signature is required.
            </div>
          </div>
        </div>
      </div>



      {/* CUSTOMER MODAL */}
      <Modal
        isOpen={isCustomerModalOpen}
        onRequestClose={() => setCustomerModalOpen(false)}
        className="bg-white p-4 max-w-md mx-auto mt-20 rounded-xl max-h-[70vh] overflow-y-auto"
      >
        <h2 className="font-bold mb-3">Select Customer</h2>

        {customers.map((c) => (
          <div
            key={c._id}
            onClick={() => {
              setSelectedCustomer(c);
              setCustomerModalOpen(false);
            }}
            className="p-3 border mb-2 rounded cursor-pointer hover:bg-orange-50"
          >
            {c.nameInSinhala || `${c.firstName} ${c.lastName}`}
          </div>
        ))}
      </Modal>

      {/* PRODUCT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onRequestClose={() => setProductModalOpen(false)}
        className="bg-white p-4 max-w-md mx-auto mt-20 rounded-xl max-h-[70vh] overflow-y-auto"
      >
        <h2 className="font-bold mb-3">Select Product</h2>

        {products.map((p) => (
          <div
            key={p._id}
            onClick={() => selectProduct(p)}
            className="p-3 border mb-2 rounded cursor-pointer hover:bg-orange-50 flex justify-between"
          >
            <span>{p.stockName}</span>
            <span>{p.stockPrice}</span>
          </div>
        ))}
      </Modal>
    </div>
  );
}