import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import {
  FaRegFilePdf,
  FaSearch,
  FaTrash,
} from "react-icons/fa";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle";

Modal.setAppElement("#root");

export default function BagSaleInvoicePage() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------- STATES ----------------

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState(null);

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  const [items, setItems] = useState([]);

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [orderNumber, setOrderNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isCustomerModalOpen, setCustomerModalOpen] =
    useState(false);

  const [isOrderModalOpen, setOrderModalOpen] =
    useState(false);

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [orderSearch, setOrderSearch] =
    useState("");

  const reportRef = useRef();

  // ---------------- FETCH ----------------

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchBatches();
    fetchOrders();
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
        (item) =>
          item.stockCategory === "finished products"
      );

      setProducts(filtered || []);

    } catch {
      toast.error("Failed to load products");
    }
  };

  const fetchBatches = async () => {
    try {

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/batch`
      );

      setBatches(res.data || []);

    } catch {
      toast.error("Failed to load batches");
    }
  };

  const fetchOrders = async () => {
    try {

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/bag-order`,
        { headers }
      );

      setOrders(res.data || []);

    } catch {
      toast.error("Failed to load orders");
    }
  };

  // ---------------- FILTERED ----------------

  const filteredOrders = orders.filter(
    (o) =>
      o.memberId === selectedCustomer?.memberId &&
      o.orderStatus === "Completed"
  );

  const filteredBatches = batches.filter((batch) => {

    if (!selectedOrder) return false;

    const statusMatch =
      (batch.status || "").toLowerCase() ===
      (selectedOrder.orderBagStatus || "").toLowerCase();

    const hasBalance =
      Number(batch.balanceBags || 0) > 0;

    return statusMatch && hasBalance;
  });

  // ---------------- FORMAT ----------------

  const formatDate = (date) => {

    if (!date) return "N/A";

    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value) => {

    return Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatNumber = (value) =>
    `Rs. ${formatCurrency(value)}`;

  // ---------------- STATUS COLORS ----------------

  const getStatusColor = (status) => {

    switch (status?.toLowerCase()) {

      case "substrate":
        return "bg-yellow-100 text-yellow-700";

      case "sterilized":
        return "bg-blue-100 text-blue-700";

      case "inoculated":
        return "bg-purple-100 text-purple-700";

      case "incubating":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ---------------- SELECT ORDER ----------------

  const selectOrder = (order) => {

    setSelectedOrder(order);

    setOrderNumber(order.orderNo || "");

    setItems([]);

    setOrderModalOpen(false);
  };

  // ---------------- SELECT BATCH ----------------

  const selectBatch = (batch) => {

    if (!selectedOrder) {
      return toast.error("Select order first");
    }

    const statusToStockId = {
      Substrate: "5000",
      Sterilized: "5001",
      Inoculated: "5002",
      Incubating: "5003",
    };

    const requiredStatus =
      selectedOrder.orderBagStatus;

    const requiredStockId =
      statusToStockId[requiredStatus];

    if (!requiredStockId) {
      return toast.error("Invalid order bag status");
    }

    const matchedProduct = products.find(
      (p) =>
        String(p.stockId) ===
        String(requiredStockId)
    );

    if (!matchedProduct) {
      return toast.error("No product found");
    }

    const rate =
      Number(batch.totalJobValue || 0) /
      Number(batch.numberOfBags || 1);

    setItems([
      {
        productId: matchedProduct.stockId,
        productName: matchedProduct.stockName,

        qty: 0,

        inStock: batch.balanceBags || 0,

        unit:
          matchedProduct.stockUOM || "Bag",

        rate,
        amount: 0,

        batchNo: batch.batchNo || "",
        batchDate: batch.batchDate || "",
        batchStatus: batch.status || "",
      },
    ]);
  };

  // ---------------- UPDATE ITEM ----------------

  const updateItem = (
    index,
    field,
    value
  ) => {

    const updated = [...items];

    if (field === "qty") {

      const max =
        Number(updated[index].inStock || 0);

      value = Math.min(
        Math.max(Number(value || 0), 0),
        max
      );
    }

    updated[index][field] = value;

    const qty =
      Number(updated[index].qty || 0);

    const rate =
      Number(updated[index].rate || 0);

    updated[index].amount = qty * rate;

    setItems(updated);
  };

  // ---------------- REMOVE ----------------

  const removeItem = (index) => {

    setItems(
      items.filter((_, i) => i !== index)
    );
  };

  // ---------------- TOTAL ----------------

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

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

    } catch {

      toast.error("PDF failed");
    }
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async () => {
    if (!selectedCustomer) {return toast.error("Select customer");}

    if (!selectedOrder) { return toast.error("Select order");}

    if (items.length === 0) {return toast.error("No items added");}

    // VALIDATE ITEMS
    const invalidItem = items.find(
      (i) =>
        !i.productId ||
        !i.productName ||
        !i.batchNo ||
        Number(i.qty) <= 0
    );

    if (invalidItem) {
      return toast.error(
        "Each item must have product, batch and quantity"
      );
    }

    try {
      setLoading(true);

      const stockTrxPayload = {
        referenceId: selectedOrder.orderNo,
        trxDate: invoiceDate,
        trxType: "SalesInvoice",

        description:
          selectedCustomer.nameInSinhala ||
          `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,

        isAdded: false,

        clientId: selectedCustomer.memberId,

        // 1. SALE INVOICE STOCK TRANSACTION - ISSUE
        items: items.map((i) => ({
          stockId: Number(i.productId),
          stockName: i.productName,
          quantity: Number(i.qty),
          quantityBalance: 0,
          stockUOM: i.unit || "Bag",
          stockCost: Number(i.cost || 0),
          stockPrice: Number(i.rate || 0),
        })),
      };

      const stockTrxRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
        stockTrxPayload,
        { headers }
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
          description: selectedOrder.orderBagStatus + " Bag Sale",
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
      
      // 7. Update Batch Balance
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/batch/reduce-batch-balance-bags`,
        {
          items: items.map((i) => ({
            batchNo: i.batchNo,
            bags: Number(i.qty || 0),
          })),
        }
      );

      // 8. Update Bag Order Status
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/bag-order/${selectedOrder._id}`,
        {
          orderStatus: "Delivered",
          orderDeliveredDate: invoiceDate,
          batchNo: items[0].batchNo,
        },
        { headers }
      );

      toast.success("Invoice Created");

      setIsSaved(true);

    } catch (err) {
      console.error("FULL ERROR => ", err?.response?.data || err);

      toast.error(
        err?.response?.data?.message ||
        "Failed to create invoice"
      );
    } finally {
      setLoading(false);
    }
  };

 
  // ---------------- UI ----------------

  return (

    <div className="min-h-screen bg-gray-100">

      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">

        {/* HEADER */}

        <div className="sticky top-0 z-20 bg-gray-100 pb-3 mb-4">

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <h1 className="text-2xl font-bold text-orange-600">
                🧾 Bag Sale Invoice
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Create customer bag sales invoice
              </p>

            </div>

            <div className="flex gap-2 w-full sm:w-auto">

              <button
                onClick={handleDownloadPDF}
                disabled={!isSaved}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition ${
                  isSaved
                    ? "bg-orange-600 hover:bg-orange-700"
                    : "bg-gray-400"
                }`}
              >
                <FaRegFilePdf />
                PDF
              </button>

              <button
                onClick={() => navigate("/control")}
                className="flex-1 sm:flex-none bg-black text-white px-4 py-3 rounded-xl"
              >
                ← Back
              </button>

            </div>
          </div>
        </div>

        {/* TOP SECTION */}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-6">

          {/* CUSTOMER */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">

            <label className="text-sm font-medium text-gray-600">
              Customer
            </label>

            <button
              disabled={loading || isSaved}
              onClick={() =>
                setCustomerModalOpen(true)
              }
              className="w-full border border-gray-200 mt-2 rounded-2xl p-4 text-left hover:border-orange-400 transition"
            >

              {selectedCustomer ? (
                <>
                  <p className="font-semibold text-lg">
                    {selectedCustomer.nameInSinhala ||
                      `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                  </p>

                  <p className="text-sm text-gray-500">
                    {selectedCustomer.memberId}
                  </p>
                </>
              ) : (
                <p className="text-gray-400">
                  Select Customer
                </p>
              )}

            </button>
          </div>

          {/* DATE + ORDER */}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 xl:col-span-2">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>

                <label className="text-sm font-medium text-gray-600">
                  Invoice Date
                </label>

                <input
                  disabled={loading || isSaved}
                  type="date"
                  value={invoiceDate}
                  onChange={(e) =>
                    setInvoiceDate(
                      e.target.value
                    )
                  }
                  className="w-full border border-gray-200 rounded-xl p-3 mt-2"
                />

              </div>

              <div>

                <label className="text-sm font-medium text-gray-600">
                  Order
                </label>

                <button
                  disabled={
                    !selectedCustomer ||
                    filteredOrders.length === 0 ||
                    loading ||
                    isSaved
                  }
                  onClick={() =>
                    setOrderModalOpen(true)
                  }
                  className="w-full border border-gray-200 rounded-xl p-3 mt-2 text-left"
                >

                  {selectedOrder ? (
                    <>
                      <p className="font-semibold">
                        {selectedOrder.orderNo}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {
                          selectedOrder.orderQuantity
                        }{" "}
                        {
                          selectedOrder.orderBagStatus
                        }{" "}
                        Bags
                      </p>
                    </>
                  ) : (
                    <span className="text-gray-400">
                      Select Order
                    </span>
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

        {/* BATCHES */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-6">

          <h2 className="font-bold text-lg mb-4">
            Available Batches
          </h2>

          {!selectedOrder ? (

            <div className="text-center py-10 text-gray-400">
              Select order to view batches
            </div>

          ) : filteredBatches.length === 0 ? (

            <div className="text-center py-10 text-red-500">
              No available batches
            </div>

          ) : (

            <div className="space-y-4">

              {filteredBatches.map((batch) => (

                <div
                  key={batch._id}
                  className="border border-gray-200 rounded-2xl p-4 hover:shadow-md transition"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div className="space-y-2">

                      <div className="flex items-center gap-3 flex-wrap">

                        <h3 className="font-bold text-lg">
                          {batch.batchNo}
                        </h3>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(batch.status)}`}
                        >
                          {batch.status}
                        </span>

                      </div>

                      <p className="text-sm text-gray-500">
                        Date:{" "}
                        {formatDate(
                          batch.batchDate
                        )}
                      </p>

                      <p className="text-sm">
                        Available Bags:{" "}
                        <span className="font-semibold">
                          {
                            batch.balanceBags
                          }
                        </span>
                      </p>

                    </div>

                    <div className="flex flex-col items-start lg:items-end gap-3">

                      <div className="text-2xl font-bold text-green-600">
                        {formatNumber(
                          Number(
                            batch.totalJobValue || 0
                          ) /
                            Number(
                              batch.numberOfBags ||
                                1
                            )
                        )}
                      </div>

                      <button
                        onClick={() =>
                          selectBatch(batch)
                        }
                        className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition"
                        disabled={loading || isSaved}
                      >
                        Select Batch
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* ITEMS */}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5 mb-28">

          <h2 className="font-bold text-lg mb-4">
            Invoice Items
          </h2>

          {items.length === 0 ? (

            <div className="text-center py-10 text-gray-400">
              No items selected
            </div>

          ) : (

            <div className="space-y-4">

              {items.map((item, index) => (

                <div
                  key={index}
                  className="border border-gray-200 rounded-2xl p-4"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

                    {/* LEFT */}

                    <div>

                      <h3 className="font-bold text-lg">
                        {item.productName}
                      </h3>

                      <p className="text-sm text-blue-600 mt-1">
                        Batch: {item.batchNo}
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        Available:{" "}
                        {item.inStock}{" "}
                        {item.unit}
                      </p>

                    </div>

                    {/* RIGHT */}

                    <div className="flex flex-col gap-4">

                      <div className="flex items-center gap-2">

                        <button
                          disabled={loading || isSaved}
                          onClick={() =>
                            updateItem(
                              index,
                              "qty",
                              Number(item.qty) -
                                1
                            )
                          }
                          className="w-10 h-10 rounded-xl border border-gray-300"
                        >
                          -
                        </button>

                        <input
                          disabled={loading || isSaved}
                          type="number"
                          value={item.qty}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "qty",
                              e.target.value
                            )
                          }
                          className="w-24 text-center border border-gray-300 rounded-xl py-2"
                        />

                        <button
                          disabled={loading || isSaved}
                          onClick={() =>
                            updateItem(
                              index,
                              "qty",
                              Number(item.qty) +
                                1
                            )
                          }
                          className="w-10 h-10 rounded-xl border border-gray-300"
                        >
                          +
                        </button>

                      </div>

                      <div className="text-right">

                        <p className="text-sm text-gray-500">
                          Rate
                        </p>

                        <p className="font-semibold">
                          {formatNumber(
                            item.rate
                          )}
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-sm text-gray-500">
                          Amount
                        </p>

                        <p className="text-2xl font-bold text-green-600">
                          {formatNumber(
                            item.amount
                          )}
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          removeItem(index)
                        }
                        disabled={loading || isSaved}
                        className="flex items-center justify-center gap-2 text-red-500 border border-red-200 rounded-xl py-2 hover:bg-red-50"
                      >
                        <FaTrash />
                        Remove
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

        {/* STICKY TOTAL */}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-30">

          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>

              <p className="text-sm text-gray-500">
                Total Amount
              </p>

              <h2 className="text-3xl font-bold text-green-600">
                {formatNumber(totalAmount)}
              </h2>

            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || isSaved}
              className={`px-8 py-4 rounded-2xl text-white font-semibold text-lg ${
                loading || isSaved
                  ? "bg-gray-400"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {loading
                ? "Saving..."
                : isSaved
                ? "Completed. Download PDF..."
                : "Create Invoice"}
            </button>

          </div>

        </div>

        {/* PDF */}
        <div style={{ display: "none" }}>
          <div ref={reportRef} style={{ padding: "20px", fontFamily: "Arial" }}>

            {/* HEADER */}
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>
                Collective Development Society
              </h2>
              <p style={{ margin: "4px 0", fontSize: "12px" }}>
                Malmaduwa, Kotiyakumbura | Tel: 022-2222222
              </p>
              <h3 style={{ marginTop: "10px", fontSize: "16px" }}>
                SUBSTRATE BAG SALES INVOICE
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
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Description</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Batch No</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Bags</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Rate</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Amount</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                      {item.productName}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                      {item.batchNo}
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {item.qty}
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
            <div style={{
              marginTop: "30px",
              textAlign: "center",
              fontSize: "11px",
              color: "#555"
            }}>
              This is a system generated invoice. No signature is required.
              <br />
              Software developed by nSoft Technologies
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
        className="
        bg-white
        w-full
        h-full
        sm:h-auto
        sm:max-w-md
        mx-auto
        sm:mt-20
        rounded-none
        sm:rounded-2xl
        p-4
        overflow-y-auto
        outline-none
        "
      >

        <h2 className="font-bold text-xl mb-4">
          Select Customer
        </h2>

        <div className="relative mb-4">

          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />

          <input
            type="text"
            placeholder="Search customer..."
            value={customerSearch}
            onChange={(e) =>
              setCustomerSearch(
                e.target.value
              )
            }
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3"
          />

        </div>

        <div className="space-y-3">

          {customers
            .filter((c) =>
              (
                c.nameInSinhala ||
                `${c.firstName} ${c.lastName}`
              )
                .toLowerCase()
                .includes(
                  customerSearch.toLowerCase()
                )
            )
            .map((c) => (

              <button
                key={c._id}
                onClick={() => {

                  setSelectedCustomer(c);

                  setSelectedOrder(null);

                  setItems([]);

                  setOrderNumber("");

                  setCustomerModalOpen(false);
                }}
                className="w-full border border-gray-200 rounded-2xl p-4 text-left hover:border-orange-400 hover:bg-orange-50 transition"
              >

                <p className="font-semibold">
                  {c.nameInSinhala ||
                    `${c.firstName} ${c.lastName}`}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {c.memberId}
                </p>

              </button>

            ))}

        </div>

      </Modal>

      {/* ORDER MODAL */}

      <Modal
        isOpen={isOrderModalOpen}
        onRequestClose={() =>
          setOrderModalOpen(false)
        }
        overlayClassName="fixed inset-0 bg-black/40 z-40"
        className="
        bg-white
        w-full
        h-full
        sm:h-auto
        sm:max-w-md
        mx-auto
        sm:mt-20
        rounded-none
        sm:rounded-2xl
        p-4
        overflow-y-auto
        outline-none
        "
      >

        <h2 className="font-bold text-xl mb-4">
          Select Order
        </h2>

        <div className="relative mb-4">

          <FaSearch className="absolute left-3 top-3.5 text-gray-400" />

          <input
            type="text"
            placeholder="Search order..."
            value={orderSearch}
            onChange={(e) =>
              setOrderSearch(
                e.target.value
              )
            }
            className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-3"
          />

        </div>

        <div className="space-y-3">

          {filteredOrders
            .filter((o) =>
              o.orderNo
                ?.toLowerCase()
                .includes(
                  orderSearch.toLowerCase()
                )
            )
            .map((o) => (

              <button
                key={o._id}
                onClick={() =>
                  selectOrder(o)
                }
                className="w-full border border-gray-200 rounded-2xl p-4 text-left hover:border-orange-400 hover:bg-orange-50 transition"
              >

                <p className="font-semibold">
                  {o.orderNo}
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(
                    o.orderRequestedDate
                  )}
                </p>

                <p className="text-sm mt-1">
                  {o.orderQuantity}{" "}
                  {o.orderBagStatus} Bags
                </p>

              </button>

            ))}

        </div>

      </Modal>

    </div>
  );
}