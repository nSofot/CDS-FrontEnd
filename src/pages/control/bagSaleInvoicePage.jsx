import { useEffect, useState, useRef, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaSearch, FaTrash, FaPlus, FaRegFilePdf } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormat.js";
import { formatDate } from "../../utils/dateFormat.js";
import html2pdf from "html2pdf.js";


export default function BagSaleInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [batches, setBatches] = useState([]);
 
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);  
  const [isSaved, setIsSaved] = useState(false);

  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [loadingMasters, setLoadingMasters] = useState(false);  

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);  
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);  

  const [stockTrx, setStockTrx] = useState({});

  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [search, setSearch] = useState("");

  const [viewMode, setViewMode] = useState("list"); // 👈 LIST / CREATE

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const reportRef = useRef(null);

  const [form, setForm] = useState({
    invoiceDate: new Date().toISOString().split("T")[0],
    memberId: "",
    memberName: "",
    orderNo: "",
    batchNo: "",
    numberOfBags: "",
    balanceBags: "",
    totalCostValue: "",
    totalJobValue: "",
    productId: "",
    productName: "",
    cost: "",
    rate: "",
    quantity: "",
    costValue: "",
    totalAmount: "",
  });

  const initialForm = {
    invoiceDate: new Date().toISOString().split("T")[0],
    memberId: "",
    memberName: "",
    orderNo: "",
    batchNo: "",
    numberOfBags: "",
    balanceBags: "",
    totalCostValue: "",
    totalJobValue: "",
    productId: "",
    productName: "",
    cost: "",    
    rate: "",
    quantity: "",
    costValue: "",
    totalAmount: "",
  };

  const statusStockMap = {
    Substrate: "5000",
    Sterilized: "5001",
    Inoculated: "5002",
    Incubating: "5003",
  };

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  /* LOAD */
  const fetchInvoices = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        { headers }
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const filtered = data.filter(
        (i) =>
          i.trxType === "BagInvoice"
      );

      setInvoices(filtered);
    } catch (err) {
      toast.error("Failed to load invoices");
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  /* FETCH */
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`
      );
      setMembers(res.data.data || res.data);
    } catch {
      toast.error("Failed to load members");
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


  const featchStockTrx = async (trxId) => {  
    if (!trxId) return null;     
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction/${trxId}`,
        { headers }
      );
      setStockTrx(res.data || []);
    } catch (err) {
      return null;
    }
  };

  useEffect(() => {
    if (isViewOpen && selected?.trxId) {
      featchStockTrx(selected.trxId);
    }
  }, [isViewOpen, selected?.trxId]);


  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchBatches(),
          fetchOrders(),
          fetchMembers(),
          fetchInvoices(),
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);


  useEffect(() => {
    const totalAmount =
      Number(form.rate || 0) * Number(form.quantity || 0);

    const costValue =
      Number(form.cost || 0) * Number(form.quantity || 0);

    setForm((prev) => ({
      ...prev,
      totalAmount,
      costValue,
    }));
  }, [form.rate, form.quantity, form.cost]); 



  const reloadInvoices = () => {
    fetchInvoices();
  };

  /* FILTER */
  const filteredInvoices = useMemo(() => {
    return invoices.filter(
      (i) =>
        i.trxId?.toLowerCase().includes(search.toLowerCase()) ||
        i.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        i.referenceId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [invoices, search]);

  const filteredOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.memberId === selectedCustomer.memberId &&
        o.orderStatus === "Completed"
    );
  }, [orders, selectedCustomer]);


  const filteredBatches = useMemo(() => {
    if (!selectedOrder) return [];

    return batches.filter((batch) => {
      const statusMatch =
        (batch.status || "").toLowerCase() ===
        (selectedOrder.orderBagStatus || "").toLowerCase();

      return statusMatch && Number(batch.balanceBags || 0) > 0;
    });
  }, [batches, selectedOrder]);


  const deleteInvoice = async (trxId) => {
    try {
      const isYes = await new Promise((resolve) => {
        resolve(window.confirm(`Are you sure you want to delete this invoice? ${trxId}`));
      });

      if (!isYes) return;

      // await axios.delete(...)
      toast.success("Invoice deleted");
      reloadInvoices();
    } catch (err) {
      toast.error("Failed to delete invoice");
    }
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

    } catch {

      toast.error("PDF failed");
    }
  };
    

  /* SAVE (CREATE) */
  const handleSave = async () => {
    if (!form.invoiceDate) return toast.error("Select invoice date");
    if (!selectedCustomer) return toast.error("Select customer");
    if (!selectedOrder) return toast.error("Select order");
    if (!selectedBatch) return toast.error("Select batch");
    if (!form.rate) return toast.error("Submit rate");
    if (!form.quantity) return toast.error("Submit quantity");

    try {
      setLoading(true);

      // 1. Stock transaction (must be first)
      const stockTrxRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
        {
          referenceId: selectedOrder.orderNo,
          trxDate: form.invoiceDate,
          trxType: "BagInvoice",
          description: `${form.batchNo} - ${
            `${selectedCustomer?.firstName || ""} ${selectedCustomer?.lastName || ""}`
          }`,
          isAdded: false,
          clientId: selectedCustomer.memberId,
          items: [
            {
              stockId: form.productId,
              stockName: form.productName,
              quantity: Number(form.quantity || 0),
              quantityBalance: 0,
              stockUOM: "Bag",
              stockCost: Number(form.cost || 0),
              stockPrice: Number(form.rate || 0),
            },
          ],
        },
        { headers }
      );

      const newTrxId = stockTrxRes.data.data.issuedTrxId;
      setInvoiceNumber(newTrxId);

      // 2. Update quantity balance (depends on stock trx only)
      const qtyBalancePayload = {
        items: [
          {
            stockId: form.productId,
            stockName: form.productName,
            quantity: form.quantity,
            quantityBalance: 0,
            stockUOM: "Bag",
            stockCost: Number(form.cost || 0),
            stockPrice: Number(form.rate || 0),
          },
        ],
      };

      const updateQuantityPromise = axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction/updateQuantityBalance`,
        qtyBalancePayload,
        { headers }
      );

      // 3. Bulk operations (can run in parallel)
      const stockReducePromise = axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-reduce`,
        {
          items: [
            {
              stockId: form.productId,
              quantity: Number(form.quantity || 0),
            },
          ],
        },
        { headers }
      );

      const customerTrxPromise = axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        {
          trxId: newTrxId,
          referenceId: form.orderNo,
          trxDate: form.invoiceDate,
          trxType: "BagInvoice",
          memberId: selectedCustomer.memberId,
          memberName:`${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
          description: selectedOrder.orderBagStatus + " Bag Sale",
          isCredit: false,
          amount: Number(form.totalAmount || 0),
          dueAmount: Number(form.totalAmount || 0),
        },
        { headers }
      );

      const memberDuePromise = axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member/${selectedCustomer.memberId}/due/add`,
        { amount: Number(form.totalAmount || 0) },
        { headers }
      );

      const batchUpdatePromise = axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/batch/reduce-batch-balance-bags`,
        {
          items: [
            {
              batchNo: form.batchNo,
              bags: Number(form.quantity || 0),
            },
          ],
        },
        { headers }
      );

      const orderUpdatePromise = axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/bag-order/${selectedOrder._id}`,
        {
          orderStatus: "Delivered",
          orderDeliveredDate: form.invoiceDate,
          batchNo: form.batchNo,
        },
        { headers }
      );

      // wait for quantity update first (needed for next step)
      const detailsRes = await updateQuantityPromise;
      const updatedDetails = detailsRes?.data?.issueDetails || [];

      // 4. Stock issue details (depends on updatedDetails)
      const stockIssuePromise = axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-issue-details`,
        {
          issueTrxId: newTrxId,
          issueReferenceId: form.orderNo,
          issueDate: form.invoiceDate,
          items: updatedDetails,
        },
        { headers }
      );

      // 5. Run remaining independent tasks in parallel
      await Promise.all([
        stockReducePromise,
        customerTrxPromise,
        memberDuePromise,
        batchUpdatePromise,
        orderUpdatePromise,
        stockIssuePromise,
      ]);

      setIsSaved(true);
      toast.success("Invoice created");
    } catch (err) {
      console.error(err?.response?.data || err);
      toast.error(err?.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

        <h1 className="text-xl font-bold text-orange-600">
          Bag Sale Invoices
        </h1>

        <div className="flex gap-2 w-full md:w-auto">
          <div
            className={`relative w-full md:w-64 ${
              viewMode === "create" && "hidden"
            }`}
          >
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoices..."
              className="border px-3 py-2 pl-9 rounded-lg w-full"
            />
          </div>

          {viewMode === "create" && (
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
          )}

          <button
            onClick={async () => {
              if ((viewMode === "create") && (isSaved)) {
                setIsSaved(false);
                setForm(initialForm);
                setSelectedCustomer(null);
                setSelectedOrder(null);
                setSelectedBatch(null);
                await fetchInvoices(); // now valid
              }

              setViewMode(viewMode === "list" ? "create" : "list");
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white
              ${viewMode === "list" ? "bg-orange-500" : "bg-gray-700"}`}
          >
            {viewMode === "list" ? (
              <>
                <FaPlus /> Add
              </>
            ) : (
              "← Back"
            )}
          </button>
        </div>
      </div>


      {/* ================= LIST VIEW ================= */}
      {viewMode === "list" && (
        <>
          {loading ? (
            <div className="animate-pulse text-center py-10 text-gray-500">
              Loading invoices...
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden space-y-3">
                {filteredInvoices.map((inv) => (
                  <div key={inv._id} className="bg-white border rounded-xl p-4 shadow-sm">

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-orange-600">{inv.trxId}</p>
                        <p className="text-sm text-gray-600">{inv.memberName}</p>
                        <p className="text-xs text-gray-400">Ref: {inv.referenceId}</p>
                        <p className="text-xs text-gray-400">{formatDate(inv.trxDate)}</p>
                      </div>

                      <p className="text-red-600 font-bold">
                        {formatNumber(inv.amount)}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => {
                          setSelected(inv);
                          setIsViewOpen(true);
                        }}
                        className="text-blue-600 flex items-center gap-1"
                      >
                        <FaEye /> View
                      </button>

                      <button 
                        onClick={() => deleteInvoice(inv.trxId)}
                        className="text-red-600"
                      >

                        <FaTrash />
                      </button>
                    </div>

                  </div>
                ))}
              </div>


              {/* DESKTOP */}
              <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden">

                <table className="w-full text-sm">

                  <thead className="bg-orange-100 text-left">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Customer</th>
                      <th className="p-3">Reference</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv._id} className="border-t hover:bg-orange-50">

                        <td className="p-3">{formatDate(inv.trxDate)}</td>

                        <td className="p-3 font-semibold text-orange-600">
                          {inv.trxId}
                        </td>

                        <td className="p-3">{inv.memberName}</td>

                        <td className="p-3 text-gray-500">{inv.referenceId}</td>

                        <td className="p-3 text-right text-red-600 font-semibold">
                          {formatNumber(inv.amount)}
                        </td>

                        <td className="p-3 text-center flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelected(inv);
                              featchStockTrx(inv.trxId);
                              setIsViewOpen(true);
                            }}
                            className="text-blue-600"
                          >
                            <FaEye />
                          </button>

                          <button 
                            onClick={() => deleteInvoice(inv.trxId)}
                            className="text-red-600"
                          >

                            <FaTrash />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            </>
          )}
        </>
      )}


      {/* ================= CREATE VIEW ================= */}
      {viewMode === "create" && (
        <div className="bg-white rounded-xl shadow border p-6 space-y-6">

          <h2 className="text-lg font-bold text-orange-600">
            Create Bag Invoice
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <label className="text-sm text-gray-600">Invoice Date</label>
              <input
                disabled={loading || isSaved}
                type="date"
                className="border p-2 w-full rounded-lg"
                value={form.invoiceDate}
                onChange={(e) =>
                  setForm({ ...form, invoiceDate: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">Customer</label>
              <select
                disabled={loading || isSaved}
                className="border p-2 w-full rounded-lg"
                value={selectedCustomer?._id || ""}
                onChange={(e) => {
                  const customer = members.find(
                    (m) => m._id === e.target.value
                  );

                  setSelectedCustomer(customer || null);
                  setSelectedOrder(null);
                  setSelectedBatch(null);

                  setForm((prev) => ({
                    ...prev,
                    memberId: customer?.memberId || "",
                    memberName:
                      customer?.nameInSinhala ||
                      `${customer?.firstName || ""} ${customer?.lastName || ""}`,
                    orderNo: "",
                    batchNo: "",
                    numberOfBags: "",
                    balanceBags: "",
                    totalCostValue: "",
                    totalJobValue: "",
                    productId: "",
                    productName: "",
                    cost: "",
                    rate: "",
                    quantity: "",
                    costValue: "",
                    totalAmount: "",
                  }));
                }}
              >
                <option value="">Select Customer</option>

                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nameInSinhala || `${m.firstName} ${m.lastName}`}
                  </option>
                ))}
              </select>
            </div>

          </div>

          <div>
            <label className="text-sm text-gray-600">Order</label>
            <select
              disabled={loading || isSaved}
              className="border p-2 w-full rounded-lg"
              value={selectedOrder?._id || ""}
              onChange={(e) => {
                const order = filteredOrders.find(
                  (o) => o._id === e.target.value
                );

                setSelectedOrder(order || null);
                setSelectedBatch(null);

                setForm((prev) => ({
                  ...prev,
                  orderNo: order?.orderNo || "",
                  batchNo: "",
                  numberOfBags: "",
                  balanceBags: "",
                  totalCostValue: "",
                  totalJobValue: "",
                  productId: "",
                  productName: "",
                  cost: "",
                  rate: "",
                  quantity: "",
                  costValue: "",
                  totalAmount: "",
                }));
              }}
            >
              <option value="">Select Order</option>

              {filteredOrders.map((o) => (
                <option key={o._id} value={o._id}>
                  {formatDate(o.orderDate)} - {o.orderNo} -
                  {formatDate(o.orderRequestedDate)} -
                  {o.orderQuantity} {o.orderBagStatus} Bags
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-600">Batch</label>
            <select
              disabled={loading || isSaved}
              className="border p-2 w-full rounded-lg"
              value={form.batchNo}
              onChange={(e) => {
                const batch = filteredBatches.find(
                  (b) => b.batchNo === e.target.value
                );

                const stockId = statusStockMap[batch?.status];
                const product = products.find(
                  (p) => p.stockId === stockId
                );

                setSelectedOrder(selectedOrder || null);  
                setSelectedBatch(batch || null);

                setForm((prev) => ({
                  ...prev,
                  batchNo: batch?.batchNo || "",
                  numberOfBags: batch?.numberOfBags || 0,
                  balanceBags: batch?.balanceBags || 0,
                  totalCostValue: batch?.totalCostValue || 0,
                  totalJobValue: batch?.totalJobValue || 0,

                  // 👇 fill from product
                  productId: product?.stockId || "",
                  productName: product?.stockName || "",

                  cost: product?.stockCost || 0,
                  rate: product?.stockPrice || 0,
                  quantity: "",
                  costValue: "",
                  totalAmount: "",
                }));
              }}
            >
              <option value="">Select Batch</option>

              {filteredBatches.map((b) => (
                <option key={b._id} value={b.batchNo}>
                  {formatDate(b.batchDate)}  |  {b.batchNo}  |  {b.balanceBags} {b.status} Bags
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-600">Rate</label>
              <input
                disabled={loading || isSaved}
                type="number"
                className="border p-2 w-full rounded-lg"
                value={form.rate}
                onChange={(e) =>
                  setForm({ ...form, rate: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Quantity (Max: {form.balanceBags})</label>
              <input
                disabled={loading || isSaved}
                type="number"
                className="border p-2 w-full rounded-lg"
                value={form.quantity}
                onChange={(e) => {
                  const qty = Number(e.target.value || 0);

                  if (qty > Number(form.balanceBags || 0)) {
                    toast.error(
                      `Only ${form.balanceBags} bags available`
                    );
                    return;
                  }

                  setForm({
                    ...form,
                    quantity: qty,
                  });
                }}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 font-semibold">Amount</label>
              <input
                type="text"
                className="border p-2 w-full rounded-lg bg-gray-100 text-orange-600 font-semibold"
                value={formatNumber(form.totalAmount || 0)}
                readOnly
              />
            </div>
          </div>


          <button
            onClick={handleSave}
            disabled={loading || isSaved}
            className={`px-4 py-3 rounded-lg w-full font-semibold text-white transition
              ${isSaved
                ? "bg-green-600"
                : loading
                ? "bg-gray-400"
                : "bg-orange-500 hover:bg-orange-600"
              }`}
          >
            {loading
              ? "Saving Invoice..."
              : isSaved
              ? "Saved ✓ Ready for PDF Download"
              : "Save Invoice"}
          </button>

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
                  <p><b>Date:</b> {form.invoiceDate}</p>
                  <p><b>Order No:</b> {form.orderNo}</p>
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
                  {/* {items.map((item, i) => ( */}
                    <tr>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                        {form.productName}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>
                        {form.batchNo}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                        {form.quantity}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                        {formatNumber(form.rate)}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                        {formatNumber(form.totalAmount)}
                      </td>
                    </tr>
                   {/* ))} */}

                  {/* TOTAL */}
                  <tr>
                    <td colSpan="4" style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>
                      Total
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontWeight: "bold" }}>
                      {formatNumber(form.totalAmount)}
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
                Software developed by nSoft Technology
              </div>

            </div>
          </div>

        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">

            {/* Header */}
            <div className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Substrate Bag Sale Invoice
                </h2>
                <p className="text-xs opacity-90">
                  Invoice Details
                </p>
              </div>

              <button
                onClick={() => setIsViewOpen(false)}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* Customer */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Customer Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-500">
                    Customer
                  </span>
                  <span className="col-span-2">
                    {selected.memberName} ( {selected.memberId} )
                  </span>
                </div>
              </div>

              {/* Invoice */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Invoice Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-500">
                    Invoice No
                  </span>
                  <span className="col-span-2 font-semibold text-orange-600">
                    {selected.trxId}
                  </span>

                  <span className="font-medium text-gray-500">
                    Date
                  </span>
                  <span className="col-span-2">
                    {formatDate(selected.trxDate)}
                  </span>

                  <span className="font-medium text-gray-500">
                    Order No
                  </span>
                  <span className="col-span-2">
                    {selected.referenceId}
                  </span>

                  <span className="font-medium text-gray-500">
                    Description
                  </span>
                  <span className="col-span-2">
                    {/* {selected.description} */}
                    {stockTrx?.description || selected.description}
                  </span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2">Product</th>
                      <th className="text-center p-2">Qty</th>
                      <th className="text-right p-2">Rate</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.isArray(stockTrx?.items) &&
                      stockTrx.items.map((item, index) => (
                      <tr key={index} className="">
                        <td className="p-2">{item.stockName}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">
                          {formatNumber(item.stockPrice)}
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(
                            Number(item.quantity) * Number(item.stockPrice)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>                
              </div>

              {/* <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Item Details
                </h3>

                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2">Product</th>
                      <th className="text-center p-2">Qty</th>
                      <th className="text-right p-2">Rate</th>
                      <th className="text-right p-2">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Array.isArray(stockTrx?.items) &&
                      stockTrx.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">{item.stockName}</td>
                        <td className="p-2 text-center">{item.quantity}</td>
                        <td className="p-2 text-right">
                          {formatNumber(item.stockPrice)}
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(
                            Number(item.quantity) * Number(item.stockPrice)
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div> */}

              {/* Amount */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">
                    Invoice Amount
                  </span>

                  <span className="text-2xl font-bold text-orange-600">
                    Rs. {formatNumber(selected.amount)}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end">
              <button
                onClick={() => setIsViewOpen(false)}
                className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}