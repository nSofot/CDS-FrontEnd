import { useEffect, useState, useRef, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import {
  FaRegFilePdf,
  FaPlus,
  FaTrash,
  FaArrowLeft,
  FaUser,
  FaBoxOpen,
} from "react-icons/fa";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle";

Modal.setAppElement("#root");

export default function SaleInvoicePage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

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

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const reportRef = useRef();

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
      toast.error("Failed to load customers");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        { headers }
      );

      const filtered = res.data.filter(
        (item) => item.stockCategory !== "finished products"
      );

      setProducts(filtered || []);
    } catch {
      toast.error("Failed to load products");
    }
  };

  // ---------------- FILTERS ----------------

  const filteredCustomers = customers.filter((c) => {
    const name =
      c.nameInSinhala ||
      `${c.firstName || ""} ${c.lastName || ""}`;

    return (
      name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      String(c.memberId || "")
        .toLowerCase()
        .includes(customerSearch.toLowerCase())
    );
  });

  const filteredProducts = products.filter((p) =>
    p.stockName
      ?.toLowerCase()
      .includes(productSearch.toLowerCase())
  );

  // ---------------- UOM ----------------

  const uomMap = {
    kg: "Kg",
    g: "Gram",
    L: "Liter",
    ml: "Milliliter",
    m: "Meter",
    cm: "Centimeter",
    pcs: "Piece",
    pack: "Pack",
    pkt: "Packet",
    btl: "Bottle",
    box: "Box",
    set: "Set",
    bag: "Bag",
  };

  // ---------------- ITEM ROW ----------------

  const addItemRow = () => {
    setItems([
      ...items,
      {
        productId: "",
        productName: "",
        qty: 0,
        inStock: 0,
        unit: "",
        rate: 0,
        amount: 0,
        cost: 0,
        rowCost: 0,
      },
    ]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items];

    if (field === "qty") {
      const max = Number(updated[index].inStock || 0);

      value = Math.min(
        Math.max(Number(value || 0), 0),
        max
      );
    }

    updated[index][field] = value;

    const qty = Number(updated[index].qty || 0);
    const rate = Number(updated[index].rate || 0);
    const cost = Number(updated[index].cost || 0);

    updated[index].amount = qty * rate;
    updated[index].rowCost = qty * cost;

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

      qty: 1,

      inStock: product.stockQuantity || 0,

      unit:
        uomMap[product.stockUOM] || product.stockUOM,

      cost: product.stockCost || 0,

      rate: product.stockPrice || 0,

      amount: Number(product.stockPrice || 0),

      rowCost: Number(product.stockCost || 0),
    };

    setItems(updated);

    setProductModalOpen(false);
  };

  // ---------------- TOTALS ----------------

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  // ---------------- FORMAT ----------------

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  // ---------------- PDF ----------------

  const handleDownloadPDF = async () => {
    try {
      const element = reportRef.current;

      await html2pdf()
        .set({
          margin: 0.3,
          filename: `Invoice_${invoiceNumber}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error(err);

      toast.error("PDF generation failed");
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

      setIsSaved(true);
      toast.success("Invoice created successfully");

    } catch (err) {
        console.error("Invoice Error:", err);
        toast.error(err?.response?.data?.message || "Error saving invoice");
    } finally {
        setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-7xl mx-auto p-3 sm:p-5">

        {/* HEADER */}

        <div className="sticky top-0 z-20 bg-gray-100 pb-4">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-orange-600">
                🧾 Sales Invoice
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Create and manage customer invoices
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <button
                onClick={handleDownloadPDF}
                disabled={!isSaved}
                className={`flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-white font-medium transition-all ${
                  isSaved
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                <FaRegFilePdf />
                Download PDF
              </button>

              <button
                onClick={() => navigate("/control")}
                className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-2xl hover:opacity-90"
              >
                <FaArrowLeft />
                Back
              </button>
            </div>
          </div>
        </div>

        {/* CUSTOMER + DATE */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mt-5">

          {/* CUSTOMER */}

          <div className="xl:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-5">

            <div className="flex items-center gap-2 mb-4">
              <FaUser className="text-orange-500" />

              <h2 className="font-semibold text-lg">
                Customer Information
              </h2>
            </div>

            <button
              disabled={loading || isSaved}
              onClick={() => setCustomerModalOpen(true)}
              className="w-full border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-2xl p-4 text-left transition"
            >
              {selectedCustomer ? (
                <div>
                  <p className="font-semibold text-lg">
                    {selectedCustomer.nameInSinhala ||
                      `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Member ID :{" "}
                    {selectedCustomer.memberId}
                  </p>
                </div>
              ) : (
                <div className="text-gray-400">
                  Tap to select customer
                </div>
              )}
            </button>
          </div>

          {/* DATE + ORDER */}

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">

            <h2 className="font-semibold text-lg mb-4">
              Invoice Details
            </h2>

            <div className="space-y-4">

              <div>
                <label className="text-sm text-gray-500">
                  Invoice Date
                </label>

                <input
                  disabled={loading || isSaved}
                  type="date"
                  value={invoiceDate}
                  onChange={(e) =>
                    setInvoiceDate(e.target.value)
                  }
                  className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">
                  Order Number
                </label>

                <input
                  disabled={loading || isSaved}
                  type="text"
                  value={orderNumber}
                  onChange={(e) =>
                    setOrderNumber(e.target.value)
                  }
                  placeholder="Enter order number"
                  className="w-full border rounded-2xl px-4 py-3 mt-2 outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ITEMS */}

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 mt-5">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

            <div className="flex items-center gap-2">
              <FaBoxOpen className="text-orange-500" />

              <h2 className="font-semibold text-lg">
                Invoice Items
              </h2>
            </div>

            <button
              disabled={loading || isSaved}
              onClick={addItemRow}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-2xl transition"
            >
              <FaPlus />
              Add Item
            </button>
          </div>

          {/* MOBILE CARDS */}

          <div className="lg:hidden space-y-4">
            {items.map((item, i) => (
              <div
                key={i}
                className="border rounded-2xl p-4 bg-gray-50"
              >

                <div className="flex justify-between items-start gap-3">

                  <button
                    disabled={loading || isSaved}
                    onClick={() => {
                      setSelectedRowIndex(i);
                      setProductModalOpen(true);
                    }}
                    className="font-semibold text-orange-600 text-left"
                  >
                    {item.productName ||
                      "Select Product"}
                  </button>

                  <button
                    disabled={loading || isSaved}
                    onClick={() => removeItem(i)}
                    className="text-red-500"
                  >
                    <FaTrash />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">

                  <div>
                    <label className="text-xs text-gray-500">
                      Quantity
                    </label>

                    <input
                      disabled={loading || isSaved}
                      type="number"
                      value={item.qty}
                      max={item.inStock}
                      min={0}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "qty",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl px-3 py-2 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Available
                    </label>

                    <div className="border rounded-xl px-3 py-2 mt-1 bg-white">
                      {item.inStock}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Rate
                    </label>

                    <input
                      disabled={loading || isSaved}
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(
                          i,
                          "rate",
                          e.target.value
                        )
                      }
                      className="w-full border rounded-xl px-3 py-2 mt-1"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-500">
                      Amount
                    </label>

                    <div className="border rounded-xl px-3 py-2 mt-1 bg-white font-semibold text-green-600">
                      {formatCurrency(item.amount)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}

          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-orange-50">
                <tr>
                  <th className="p-4 text-left rounded-l-2xl">
                    Product
                  </th>

                  <th className="p-4 text-right">
                    Qty
                  </th>

                  <th className="p-4 text-right">
                    Stock
                  </th>

                  <th className="p-4 text-left">
                    UOM
                  </th>

                  <th className="p-4 text-right">
                    Rate
                  </th>

                  <th className="p-4 text-right">
                    Amount
                  </th>

                  <th className="p-4 rounded-r-2xl"></th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, i) => (
                  <Fragment key={i}>

                    <tr className="border-b">

                      <td className="p-4">

                        <button
                          disabled={loading || isSaved}
                          onClick={() => {
                            setSelectedRowIndex(i);
                            setProductModalOpen(true);
                          }}
                          className="text-orange-600 font-medium hover:underline"
                        >
                          {item.productName ||
                            "Select Product"}
                        </button>
                      </td>

                      <td className="p-4 text-right">

                        <input
                          disabled={loading || isSaved}
                          type="number"
                          value={item.qty}
                          max={item.inStock}
                          min={0}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "qty",
                              e.target.value
                            )
                          }
                          className="w-24 border rounded-xl px-3 py-2 text-right"
                        />
                      </td>

                      <td className="p-4 text-right">
                        {item.inStock}
                      </td>

                      <td className="p-4">
                        {item.unit}
                      </td>

                      <td className="p-4 text-right">

                        <input
                          disabled={loading || isSaved}
                          type="number"
                          value={item.rate}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "rate",
                              e.target.value
                            )
                          }
                          className="w-28 border rounded-xl px-3 py-2 text-right"
                        />
                      </td>

                      <td className="p-4 text-right font-semibold text-green-600">
                        {formatCurrency(item.amount)}
                      </td>

                      <td className="p-4 text-center">

                        <button
                          disabled={loading || isSaved}
                          onClick={() => removeItem(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              No items added
            </div>
          )}
        </div>

        {/* TOTAL */}

        <div className="mt-5 bg-white rounded-3xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <p className="text-gray-500 text-sm">
              Total Invoice Amount
            </p>

            <h2 className="text-3xl font-bold text-green-600 mt-1">
              Rs. {formatCurrency(totalAmount)}
            </h2>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading || isSaved}
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-semibold transition ${
              loading || isSaved
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {loading
              ? "Saving..."
              : isSaved
              ? "Invoice Saved. Download PDF..."
              : "Create Invoice"}
          </button>
        </div>

          {/* ================= PDF ================= */}
          <div style={{ display: "none" }}>
            <div ref={reportRef} style={{ padding: "30px", fontFamily: "Arial", color: "#000" }}>

              {/* HEADER */}
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                  Collective Development Society
                </h2>
                <p style={{ margin: "4px 0", fontSize: "12px" }}>
                  Malmaduwa, Kotiyakumbura | Tel: 022-2222222
                </p>
                <h3 style={{ marginTop: "10px", fontSize: "16px" }}>
                  SALES INVOICE
                </h3>
              </div>

              {/* INVOICE INFO + CUSTOMER */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>

                {/* CUSTOMER */}
                <div style={{ width: "48%", border: "1px solid #ddd", padding: "10px" }}>
                  <p style={{ fontWeight: "bold", marginBottom: "5px" }}>Bill To:</p>
                  <p>{selectedCustomer?.memberId || "N/A"}</p>
                  <p>
                    {selectedCustomer
                      ? selectedCustomer.nameInSinhala ||
                        `${selectedCustomer.firstName} ${selectedCustomer.lastName}`
                      : "N/A"}
                  </p>
                  <p style={{ fontSize: "12px" }}>
                    {selectedCustomer?.address
                      ? Object.values(selectedCustomer.address).join(", ")
                      : ""}
                  </p>
                </div>

                {/* INVOICE DETAILS */}
                <div style={{ width: "48%", border: "1px solid #ddd", padding: "10px" }}>
                  <p><b>Invoice No:</b> {invoiceNumber}</p>
                  <p><b>Date:</b> {invoiceDate}</p>
                  <p><b>Order No:</b> {orderNumber}</p>
                </div>

              </div>

              {/* ITEMS TABLE */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ background: "#f2f2f2" }}>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Description</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>Qty</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px" }}>UOM</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Rate</th>
                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Amount</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, i) => (
                    <tr key={i}>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {item.productName}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {item.qty}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                        {item.unit}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                        {formatCurrency(item.rate)}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL */}
                  <tr>
                    <td colSpan="4" style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>
                      Total
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontWeight: "bold" }}>
                      {formatCurrency(totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* FOOTER */}
              <div
                style={{
                  marginTop: "25px",
                  textAlign: "center",
                  fontSize: "11px",
                  color: "#555",
                  borderTop: "1px solid #ddd",
                  paddingTop: "10px",
                }}
              >
                <div>This is a system generated invoice. No signature is required.</div>

                <div style={{ marginTop: "5px", fontWeight: "bold", color: "#333" }}>
                  Software developed by nSoft Technology
                </div>
              </div>

            </div>
          </div>

        </div>

      {/* CUSTOMER MODAL */}

      <Modal
        isOpen={isCustomerModalOpen}
        onRequestClose={() =>
          setCustomerModalOpen(false)
        }
        overlayClassName="fixed inset-0 bg-black/40 z-40"
        className="bg-white max-w-lg mx-auto mt-10 rounded-3xl p-5 outline-none max-h-[85vh] overflow-y-auto"
      >

        <h2 className="text-xl font-bold mb-4">
          Select Customer
        </h2>

        <input
          type="text"
          placeholder="Search customer..."
          value={customerSearch}
          onChange={(e) =>
            setCustomerSearch(e.target.value)
          }
          className="w-full border rounded-2xl px-4 py-3 mb-4"
        />

        <div className="space-y-2">
          {filteredCustomers.map((c) => (

            <button
              key={c._id}
              onClick={() => {
                setSelectedCustomer(c);
                setCustomerModalOpen(false);
              }}
              className="w-full text-left border rounded-2xl p-4 hover:bg-orange-50 transition"
            >
              <p className="font-semibold">
                {c.nameInSinhala ||
                  `${c.firstName} ${c.lastName}`}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {c.memberId}
              </p>
            </button>
          ))}
        </div>
      </Modal>

      {/* PRODUCT MODAL */}

      <Modal
        isOpen={isProductModalOpen}
        onRequestClose={() =>
          setProductModalOpen(false)
        }
        overlayClassName="fixed inset-0 bg-black/40 z-40"
        className="bg-white max-w-lg mx-auto mt-10 rounded-3xl p-5 outline-none max-h-[85vh] overflow-y-auto"
      >

        <h2 className="text-xl font-bold mb-4">
          Select Product
        </h2>

        <input
          type="text"
          placeholder="Search product..."
          value={productSearch}
          onChange={(e) =>
            setProductSearch(e.target.value)
          }
          className="w-full border rounded-2xl px-4 py-3 mb-4"
        />

        <div className="space-y-2">
          {filteredProducts.map((p) => (

            <button
              key={p._id}
              onClick={() => selectProduct(p)}
              className="w-full border rounded-2xl p-4 hover:bg-orange-50 transition text-left flex justify-between gap-3"
            >
              <div>
                <p className="font-semibold">
                  {p.stockName}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Available : {p.stockQuantity}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  Rs.{" "}
                  {formatCurrency(p.stockPrice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}