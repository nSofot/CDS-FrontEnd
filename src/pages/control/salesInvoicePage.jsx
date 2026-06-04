import { useEffect, useState, useRef, Fragment, useMemo } from "react";
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
  FaSearch,
  FaEye,
} from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormat.js";
import { formatDate } from "../../utils/dateFormat.js";
import html2pdf from "html2pdf.js";

Modal.setAppElement("#root");

export default function SaleInvoicePage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------- STATE ----------------

  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stockTrx, setStockTrx] = useState(null);
  const [loadingTrx, setLoadingTrx] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);

  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);

  const [selectedRowIndex, setSelectedRowIndex] = useState(null);

  const [customerSearch, setCustomerSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");


  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");

  const [selected, setSelected] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const reportRef = useRef();

  const [items, setItems] = useState([]);


    const [form, setForm] = useState({
      invoiceDate: new Date().toISOString().split("T")[0],
      orderNo: "",
      memberId: "",
      memberName: "",
      costValue: "",
      totalAmount: "",
    });

    const initialForm = {
      invoiceDate: new Date().toISOString().split("T")[0],
      memberId: "",
      memberName: "",
      orderNo: "",
      costValue: "",
      totalAmount: "",
    };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedMember(null);
    setItems([]);
  };

  // ---------------- FETCH ----------------
  useEffect(() => {
    fetchMembers();
    fetchProducts();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  
  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`,
        { headers }
      );

      setMembers(res.data || []);
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

      const filtered = res.data.filter(
        (item) => item.stockCategory !== "finished products"
      );

      setProducts(filtered || []);
    } catch {
      toast.error("Failed to load products");
    }
  };


  const fetchInvoices = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        { headers }
      );
      const transactions = res.data.data || [];
      const salesInvoices = transactions.filter(
        (trx) => trx.trxType === "SalesInvoice"
      );
      setInvoices(salesInvoices);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
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
  
  

  // ---------------- FILTERS ----------------
  const filteredInvoices = useMemo(() => {    
    return invoices.filter(
      (i) =>
        i.trxId?.toLowerCase().includes(search.toLowerCase()) ||
        i.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        i.referenceId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [invoices, search]);


  const filteredMembers = useMemo(() => {
    return members.filter((c) => {
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
  }, [members, customerSearch]);

  const filteredProducts = useMemo(() => {
    const searchText = productSearch.toLowerCase();

    return products.filter((p) => {
      return (
        p.stockName?.toLowerCase().includes(searchText) ||
        p.stockId?.toLowerCase().includes(searchText)
      );
    });
  }, [products, productSearch]);


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
  
  
  
  const updateItemField = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = {
          ...item,
          [field]: Number(value || 0),
        };

        updated.amount =
          Number(updated.qty || 0) *
          Number(updated.rate || 0);

        return updated;
      })
    );
  };


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
        productUom: "",
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
      productCode: product.stockId,
      productName: product.stockName,
      productUOM: product.stockUOM,

      inStock: Number(product.stockQuantity || 0),

      qty: 0,
      rate: Number(product.stockPrice || 0),
      cost: Number(product.stockCost || 0),

      amount: Number(product.stockPrice || 0),
    };

    setItems(updated);
    setProductModalOpen(false);
  };

  // ---------------- TOTALS ----------------

  const totalAmount = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  }, [items]);

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
    console.log(reportRef.current);

    if (!reportRef.current) {
      toast.error("PDF content not found");
      return;
    }
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

    if (!form.invoiceDate) return toast.error("Select invoice date");
    if (!form.orderNo?.trim()) return toast.error("Enter order number");
    if (!selectedMember) return toast.error("Select a member/customer");
    if (items.length === 0) return toast.error("Add items");

    try {
      setIsSubmitting(true);

      // 1. SALE INVOICE PAYLOAD
      const stockTrxPayload = {
        referenceId: form.orderNo,
        trxDate: form.invoiceDate,
        trxType: "SalesInvoice",
        description: `${selectedMember.firstName} ${selectedMember.lastName}`,
        isAdded: false,
        clientId: selectedMember.memberId,
        items: items.map((i) => ({
          stockId: i.productId,
          stockName: i.productName,
          quantity: i.qty,
          quantityBalance: 0,
          stockUOM: i.productUOM,
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
          referenceId: form.orderNo,
          trxDate: form.invoiceDate,
          trxType: "SalesInvoice",
          memberId: selectedMember.memberId,
          memberName: `${selectedMember.firstName} ${selectedMember.lastName}`,
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
        `${import.meta.env.VITE_BACKEND_URL}/api/member/${selectedMember.memberId}/due/add`,
        {amount: totalAmount}
      );

      // 5. Update stock quantity balance in GRN
      const payload = {
        items: items.map((i) => ({
          stockId: i.productId,
          stockName: i.productName,
          quantity: i.qty,
          quantityBalance: 0,
          stockUOM: i.productUOM,
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
        issueReferenceId: form.orderNo,
        issueDate: form.invoiceDate,
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
        setIsSubmitting(false);
    }
  };

  // ---------------- UI ----------------
  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-orange-600">
            🧾 Sales Invoices
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage sales invoices
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
            Create Sales Invoice
          </h2>

          {/* HEADER FIELDS */}
          <div className="grid grid-cols-1 md:flex md:justify-between gap-2">

            <div>
              <label className="text-sm text-gray-600 md:w-1/4">Invoice Date</label>
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
              <label className="text-sm text-gray-600 md:w-1/4">Order No</label>
              <input
                disabled={loading || isSaved}
                type="text"
                className="border p-2 w-full rounded-lg"
                value={form.orderNo}
                onChange={(e) =>
                  setForm({ ...form, orderNo: e.target.value })
                }
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 md:w-3/4">Customer</label>
              <select
                disabled={loading || isSaved}
                className="border p-2 w-full rounded-lg"
                value={selectedMember?._id || ""}
                onChange={(e) => {
                  const member = members.find(
                    (m) => m._id === e.target.value
                  );

                  setSelectedMember(member || null);
                }}
              >
                <option value="">Select Customer</option>

                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.nameInSinhala ||
                      `${m.firstName} ${m.lastName}`}
                  </option>
                ))}
              </select>
            </div>
          </div>


          {/* ================= ITEM SECTION ================= */}
          <div className="space-y-4">

            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                Invoice Items
              </h3>

              <button
                type="button"
                onClick={() => {
                  setItems([
                    ...items,
                    {
                      productId: "",
                      productCode: "",
                      productName: "",
                      productUOM: "",
                      rate: 0,
                      qty: 0,
                      amount: 0,
                    },
                  ]);
                }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <FaPlus /> Add Row
              </button>
            </div>


            {/* TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full border text-sm table-fixed min-w-[700px]">

                {/* HEADER */}
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left w-[12%]">Code</th>

                    {/* reduced product width */}
                    <th className="p-2 text-left w-[32%]">Product</th>

                    <th className="p-2 text-right w-[16%]">Rate</th>
                    <th className="p-2 text-right w-[16%]">Qty</th>
                    <th className="p-2 text-left w-[16%]">Unit</th>
                    <th className="p-2 text-right w-[16%]">Amount</th>
                    <th className="p-2 text-center w-[8%]">Action</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">

                      {/* CODE */}
                      <td className="p-2">
                        <input
                          className="border p-1 w-full rounded bg-gray-50 cursor-pointer text-xs"
                          value={item.productCode}
                          readOnly
                          onClick={() => {
                            setSelectedRowIndex(index);
                            setProductModalOpen(true);
                          }}
                        />
                      </td>

                      {/* PRODUCT */}
                      <td className="p-2">
                        <input
                          className="border p-1 w-full rounded bg-gray-50 cursor-pointer truncate text-xs"
                          value={item.productName}
                          readOnly
                          onClick={() => {
                            setSelectedRowIndex(index);
                            setProductModalOpen(true);
                          }}
                        />
                      </td>

                      {/* RATE */}
                      <td className="p-2">
                        <input
                          type="number"
                          className="border p-1 w-full text-right rounded text-xs"
                          value={item.rate}
                          onChange={(e) =>
                            updateItemField(
                              index,
                              "rate",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      {/* QTY */}
                      <td className="p-2">
                        <input
                          type="number"
                          className="border p-1 w-full text-right rounded text-xs"
                          value={item.qty}
                          onChange={(e) =>
                            updateItemField(
                              index,
                              "qty",
                              e.target.value
                            )
                          }
                        />
                      </td>

                      {/* UNIT */}
                      <td className="p-2">
                        <input
                          className="border p-1 w-full rounded bg-gray-50 cursor-pointer text-xs"
                          value={uomMap[item.productUOM] || item.productUOM || ""}
                          readOnly
                        />
                      </td>

                      {/* AMOUNT */}
                      <td className="p-2 text-right font-semibold text-green-600 text-xs">
                        {formatNumber(item.amount || 0)}
                      </td>

                      {/* ACTION */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => {
                            const updated = items.filter((_, i) => i !== index);
                            setItems(updated);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      </td>

                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-400 p-4">
                        No items added
                      </td>
                    </tr>
                  )}
                </tbody>

              </table>
            </div>
          </div>


          {/* ================= TOTAL ================= */}
          <div className="flex justify-between items-center border-t pt-4">

            <h3 className="text-lg font-bold text-gray-700">
              Total Amount
            </h3>

            <h2 className="text-xl font-bold text-green-600">
                {formatNumber(totalAmount)}
            </h2>

          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={() => {
                handleSubmit();
            }}
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
  

          {/* ================= PDF ================= */}
          <div
            style={{
              position: "absolute",
              left: "-9999px",
              top: 0,
            }}
          >
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
                  <p>{selectedMember?.memberId || "N/A"}</p>
                  <p>
                    {selectedMember
                      ? selectedMember.nameInSinhala ||
                        `${selectedMember.firstName} ${selectedMember.lastName}`
                      : "N/A"}
                  </p>
                  <p style={{ fontSize: "12px" }}>
                    {selectedMember?.address
                      ? Object.values(selectedMember.address).join(", ")
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
                        {uomMap[item.productUOM] || item.productUOM}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                        {formatNumber(item.rate)}
                      </td>
                      <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                        {formatNumber(item.amount)}
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL */}
                  <tr>
                    <td colSpan="4" style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>
                      Total
                    </td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right", fontWeight: "bold" }}>
                      {formatNumber(totalAmount)}
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
                  <div>This is a computer-generated invoice and does not require a signature.</div>

                  <div style={{ fontWeight: "bold", color: "#333" }}>
                    Software by nSoft Technology © 2026
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
      

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
          {filteredMembers.map((c) => (

            <button
              key={c._id}
              onClick={() => {
                setSelectedMember(c);
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
              className="w-full border rounded-xl px-4 py-2 hover:bg-orange-50 transition text-left flex justify-between gap-3"
            >
              <div>
                <p className="font-semibold">
                  {p.stockName}
                </p>

                <p className="text-xs text-gray-500">
                  {p.stockId}  |  Available : {formatNumber(p.stockQuantity)}
                </p>
              </div>

              <div className="text-right">
                <p className="font-bold text-green-600">
                  Rs.{" "}
                  {formatNumber(p.stockPrice)}
                </p>
              </div>
            </button>
          ))}
        </div>
      </Modal>



      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Sales Invoice
                </h2>

                <p className="text-xs opacity-90">
                  Invoice Details
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
                  Customer Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-500">
                    Customer
                  </span>

                  <span className="col-span-2">
                    {selected.memberName} ({selected.memberId})
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