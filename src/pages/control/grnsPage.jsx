import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaSearch, FaTrash, FaPlus, FaRegFilePdf } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormat.js";
import { formatDate } from "../../utils/dateFormat.js";
import html2pdf from "html2pdf.js";

export default function PurchaseEntryPage() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stockTrx, setStockTrx] = useState(null);
  const [loadingTrx, setLoadingTrx] = useState(false);

  const [selectedVendor, setSelectedVendor] = useState(null);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);  

  const [loading, setLoading] = useState(false);  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);  


    const [form, setForm] = useState({
      trxDate: new Date().toISOString().split("T")[0],
      referenceId: "",
      trxType: "Purchase",
      vendorId: "",
      vendorName: "",
      costValue: "",
      totalAmount: "",
      items: [],
    });

    const initialForm = {
      trxDate: new Date().toISOString().split("T")[0],
      referenceId: "",
      trxType: "Purchase",
      vendorId: "",
      vendorName: "",
      costValue: "",
      totalAmount: "",
      items: [],
    };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedVendor(null);
  };
  
  
  const uomMap = {
    "kg": "Kg",
    "g": "Gram",
    "L": "Liter",
    "ml": "Milliliter",
    "m": "Meter",
    "cm": "Centimeter",
    "pcs": "Piece",
    "pack": "Pack",
    "pkt": "Packet",
    "btl": "Bottle",
    "box": "Box",
    "set": "Set",
    "bag": "Bag",
  };
  
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };  
  
  // ================= FETCH =================
 const fetchInvoices = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        { headers }
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const filtered = data.filter(
          (i) => i.trxType === "Purchase"
        )
        .sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInvoices(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
      setInvoices([]);
    }
  };


  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor`
      );
      const sortedVendors = res.data.sort((a, b) => a.vendorName.localeCompare(b.vendorName));
      setVendors(sortedVendors);
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`
      );

      const filteredProducts = res.data
        .filter((p) => p.stockCategory !== "finished products")
        .sort((a, b) => {
          return (a.stockName || "").localeCompare(b.stockName || "");
        });

      setProducts(filteredProducts);
    } catch {
      toast.error("Failed to load products");
    }
  };


  const fetchStockTrx = async (trxId) => {
    if (!trxId) return;

    try {
      setLoadingTrx(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction/${trxId}`,
        { headers }
      );

      setStockTrx(res.data || null);
    } catch (err) {
      toast.error("Failed to load transaction");
      setStockTrx(null);
    } finally {
      setLoadingTrx(false);
    }
  };
  
  

  useEffect(() => {
    fetchVendors();
    fetchProducts();
    fetchInvoices();
  }, []);


  useEffect(() => {
    if (isViewOpen && selected?.trxId) {
      setStockTrx(null);
      fetchStockTrx(selected.trxId);
    }
  }, [isViewOpen, selected?.trxId]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  /* FILTER */
  const filteredInvoices = useMemo(() => {
    return invoices.filter(
      (i) =>
        i.trxId?.toLowerCase().includes(search.toLowerCase()) ||
        i.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        i.referenceId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [invoices, search]);
  

  const closeViewModal = () => {
    setIsViewOpen(false);
    setStockTrx(null);
    setSelected(null);
  };


  useEffect(() => {
    if (isViewOpen && selected?.trxId) {
      setStockTrx(null);
      fetchStockTrx(selected.trxId);
    }
  }, [isViewOpen, selected?.trxId]);  

  // ================= ADD ITEM =================
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          productName: "",
          productUOM: "",
          qty: "",
          cost: 0,
          price: 0,
        },
      ],
    }));
  };

  // ================= UPDATE ITEM =================
  const updateItem = (index, field, value) => {
    const updated = [...form.items];

    if (field === "product") {
      updated[index] = {
        ...updated[index],
        productId: value?.stockId || "",
        productName: value?.stockName || "",
        productUOM: value?.stockUOM || "",
        qty: "",
        cost: value?.stockCost || 0,
        price: value?.stockPrice || 0,
      };
    } else {
      updated[index][field] =
        value === "" ? "" : Number(value);
    }

    setForm({ ...form, items: updated });
  };

  // ================= REMOVE =================
  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  // ================= TOTAL =================
  const total = form.items.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.cost || 0),
    0
  );

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom validation for empty items
    if (form.items.length === 0) {
      return toast.error("Add at least one item");
    }

    try {
      setIsSubmitting(true);
      // ================= 1. STOCK TRANSACTION =================
      const stockTrxPayload = {
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        trxType: form.trxType,
        description: form.vendorName,
        isAdded: true,
        clientId: form.vendorId,
        items: form.items.map((i) => ({
          stockId: i.productId,
          stockName: i.productName,
          quantity: i.qty,
          quantityBalance: i.qty,
          stockUOM: i.productUOM,
          stockCost: i.cost,
          stockPrice: i.price,
        })),
      };

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
        stockTrxPayload
      );

      const savedTrxId = res.data.data.issuedTrxId || res.data.issuedTrxId;

      // ================= 2. UPDATE STOCK =================
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-add`,
        {
          items: stockTrxPayload.items.map((item) => ({
            stockId: item.stockId,
            quantity: Number(item.quantity || 0),
            stockCost: Number(item.stockCost || 0),
            stockPrice: Number(item.stockPrice || 0),
          })),
        }
      );

      // ================= 3. UPDATE VENDOR TRANSACTION =================
      const vendorTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        trxType: form.trxType,
        vendorId: form.vendorId,
        vendorName: form.vendorName,
        description: "",
        isCredit: false,
        amount: total,
        dueAmount: total,
      };
     
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        vendorTrxPayload
      );

      // ================= 4. UPDATE VENDOR DUE =================
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${form.vendorId}/add-due`,
        {
          amount: total,
        }
      );


      // ================= 5. UPDATE LEDGER ACCOUNT - DEBIT Inventory ==================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/add-balance`,
        {
          updates: [
            {
              accountId: "305-001",
              amount: total,
            },
          ],
        }
      );

      // ================= 6. SAVE LEDGER TRANSACTION - DEBIT Inventory ==================
      const ledgerTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        transactionType: form.trxType,
        accountId: "305-001",
        accountName: "Substrate Materials",
        description: form.vendorName,
        isCredit: false,
        trxAmount: total,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerTrxPayload
      ); 


      // ================= 7. UPDATE LEDGER ACCOUNT - CREDIT Supplier Payables ==================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/subtract-balance`,
        {
          updates: [
            {
              accountId: "501-001",
              amount: total,
            },
          ],
        }
      );

      // ================= 8. SAVE LEDGER TRANSACTION - CREDIT Supplier Payables ==================
      const ledgerCreditTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        transactionType: form.trxType,
        accountId: "501-001",
        accountName: "Supplier Payables",
        description: form.vendorName,
        isCredit: true,
        trxAmount: total,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerCreditTrxPayload
      );       


      setIsSaved(true);
      setIsSubmitting(false);
      toast.success("Purchase Invoice Created Successfully");
    } catch (err) {
      setIsSubmitting(false);
      console.error(err.response?.data || err.message);
      toast.error("Failed to save");
    }
  };


  // ================= UI =================
  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-orange-600">
            🧾 Purchase Invoice
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage purchase entries and goods received for your inventory.
          </p>         
        </div>

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
              placeholder="Search Purchase Invoices..."
              className="border px-3 py-2 pl-9 rounded-lg w-full"
            />
          </div>

          {viewMode === "create" && (
            <button
              // onClick={handleDownloadPDF}
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
                await fetchInvoices(); // now valid
              }
              resetForm();  
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
            // <div className="animate-pulse text-center py-10 text-gray-500">
            //   Loading invoices...
            // </div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
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
                        <p className="text-sm text-gray-600">{inv.vendorName}</p>
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
                      <th className="p-3">Supplier</th>
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

                        <td className="p-3">{inv.vendorName}</td>

                        <td className="p-3 text-gray-500">{inv.referenceId}</td>

                        <td className="p-3 text-right text-red-600 font-semibold">
                          {formatNumber(inv.amount)}
                        </td>

                        <td className="p-3 text-center flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelected(inv);
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
            Create Purchase Invoice
          </h2>        
      <form onSubmit={handleSubmit}>
        {/* TOP */}
        <div className="flex flex-col md:flex-row flex-wrap gap-3 mb-4">

          <input
            type="date"
            value={form.trxDate}
            onChange={(e) =>
              setForm({ ...form, trxDate: e.target.value })
            }
            className="w-full md:w-[20%] border px-3 py-2 rounded"
            required
          />

          <input
            type="text"
            value={form.referenceId}
            onChange={(e) =>
              setForm({ ...form, referenceId: e.target.value })
            }
            className="w-full md:w-[20%] border px-3 py-2 rounded"
            placeholder="Invoice Number ..."
            required
          />

          <select
            value={form.vendorId}
            onChange={(e) => {
              const selected = vendors.find(
                (v) => v.vendorId === e.target.value
              );

              setForm({
                ...form,
                vendorId: selected?.vendorId || "",
                vendorName: selected?.vendorName || "",
              });
            }}
            className="w-full md:w-[35%] border px-3 py-2 rounded"
            required
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v.vendorId} value={v.vendorId}>
                {v.vendorName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={addItem}
            disabled={isSaved}
            className={`w-full md:w-[20%] text-white rounded px-3 py-2 ${
              isSaved
                ? "bg-gray-400"
                : "bg-orange-500 hover:bg-orange-700"
            }`}
          >
            + Add Item
          </button>
        </div>

        {/* ITEMS */}
        <div className="hidden md:block">
          <table className="w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th className="p-2 text-left">Qty</th>
                <th className="p-2 text-left">UOM</th>
                <th className="p-2 text-left">Cost</th>
                <th className="p-2 text-left">Price</th>
                <th className="text-right">Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {form.items.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">
                    <select
                      value={item.productId}
                      required
                      onChange={(e) => {
                        const selected = products.find(
                          (p) => p.stockId === e.target.value
                        );
                        updateItem(i, "product", selected);
                      }}
                      className="border w-full p-2 rounded"
                    >
                      <option value="">Select</option>
                      {products.map((p) => (
                        <option key={p.stockId} value={p.stockId}>
                          {p.stockName}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.qty}
                      required
                      min="1"
                      onChange={(e) =>
                        updateItem(i, "qty", e.target.value)
                      }
                      className="border w-20 p-1 rounded"
                    />
                  </td>

                  <td>{uomMap[item.productUOM] ||  "-"}</td>

                  <td>
                    <input
                      type="number"
                      value={item.cost}
                      onChange={(e) =>
                        updateItem(i, "cost", e.target.value)
                      }
                      className="border w-24 p-1 rounded"
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(i, "price", e.target.value)
                      }
                      className="border w-24 p-1 rounded"
                    />
                  </td>

                  <td className="text-right pr-2">
                    {(item.qty * item.cost || 0).toFixed(2)}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="flex justify-between items-center border-t pt-4 mb-6">

            <h3 className="text-lg font-bold text-gray-700">
              Total Amount
            </h3>

            <h2 className="text-xl font-bold text-green-600">
                {formatNumber(total)}
            </h2>            
        </div>


        {/* SAVE */}
        <button
          type="submit"
          disabled={isSubmitting || isSaved}
            className={`px-4 py-3 rounded-lg w-full font-semibold text-white transition
              ${
                isSaved
                  ? "bg-green-600"
                  : isSubmitting
                  ? "bg-gray-400"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
          >
            {isSubmitting
              ? "Saving Invoice..."
              : isSaved
              ? "Saved ✓ Ready for PDF"
              : "Save Invoice"}
        </button>
      </form>
      </div>
      )}


      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Purchase Invoice
                </h2>

                <p className="text-xs opacity-90">
                  Purchase Invoice Details
                </p>
              </div>

              <button
                onClick={closeViewModal}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto">

              {/* Customer */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Supplier Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-500">
                    Supplier
                  </span>

                  <span className="col-span-2">
                    {selected.vendorName} ({selected.vendorId})
                  </span>
                </div>
              </div>

              {/* Invoice */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Invoice Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm mb-4">
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
                    {stockTrx?.description || selected.description}
                  </span>
                </div>

                {/* Loading State */}
                {loadingTrx ? (
                  <div className="text-center py-10 text-gray-500">
                    Loading invoice details...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm border rounded-lg overflow-hidden">
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
                        stockTrx.items.length > 0 ? (
                          stockTrx.items.map((item, index) => (
                            <tr
                              key={index}
                              className="border-b last:border-b-0"
                            >
                              <td className="p-2">
                                {item.stockName}
                              </td>

                              <td className="p-2 text-center">
                                {item.quantity}
                              </td>

                              <td className="p-2 text-right">
                                {formatNumber(item.stockPrice)}
                              </td>

                              <td className="p-2 text-right">
                                {formatNumber(
                                  Number(item.quantity) *
                                    Number(item.stockPrice)
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="4"
                              className="text-center p-4 text-gray-500"
                            >
                              No items found
                            </td>
                          </tr>
                        )}
                      </tbody>

                      <tfoot>
                        <tr className="bg-orange-50 font-semibold border-t">
                          <td
                            colSpan="3"
                            className="p-2 text-right"
                          >
                            Total
                          </td>

                          <td className="p-2 text-right text-orange-600">
                            {formatNumber(selected.amount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>

              {/* Amount Summary */}
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
            <div className="border-t px-6 py-4 flex justify-end bg-white">
              <button
                onClick={closeViewModal}
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
