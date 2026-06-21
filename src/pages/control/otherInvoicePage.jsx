import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaSearch, FaTrash, FaPlus, FaRegFilePdf } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormat.js";
import { formatDate } from "../../utils/dateFormat.js";
import html2pdf from "html2pdf.js";

export default function OtherInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);   

  const [loading, setLoading] = useState(false);  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);    

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "Invoice",
    trxDate: new Date().toISOString().split("T")[0],
    vendorId: "",
    vendorName: "",
    description: "",
    amount: "",
  });

  const initialForm = {  
    referenceId: "",
    trxType: "Invoice",
    trxDate: new Date().toISOString().split("T")[0],
    vendorId: "",
    vendorName: "",
    description: "",
    amount: "",
  };

  const resetForm = () => {
    setForm(initialForm);
  };

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`
      );

      const accounts = res.data.data || res.data || [];

      const filteredAccounts = accounts
        .filter((acc) => acc.accountType === "Expense")
        .sort((a, b) =>
          (a.accountName || "").localeCompare(b.accountName || "")
        );

      setVendors(filteredAccounts);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendors");
    }
  };

  useEffect(() => {
    fetchVendors();
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
  
  

  // Handle change
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "amount" ? Number(value) : value, // ✅ fix number issue
    });
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.referenceId || !form.trxDate || !form.vendorId || !form.amount || !form.description) {
      return toast.error("Please fill required fields");
    }

    try {
      setLIsSubmitting(true);

      const total = Number(form.amount || 0);

      
      // ================= 1. SAVE VENDOR TRANSACTION =================      
      const vendorTrxPayload = {
        referenceId: form.referenceId || "N/A",
        trxDate: new Date(form.trxDate),
        trxType: form.trxType,
        vendorId: form.vendorId,
        vendorName: form.vendorName,
        description: form.description || "",
        isCredit: false,
        amount: Number(total),
        dueAmount: Number(total),
      };
 
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        vendorTrxPayload
      );      

      // ================= 2. UPDATE VENDOR BALANCE =================      
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${form.vendorId}/add-due`,
        {
          amount: total,
        }
      );

      // ================= 5. UPDATE LEDGER ACCOUNT - DEBIT =================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/add-balance`,
        {
          updates: [
            {
              accountId: form.accountId,
              amount: Number(total),
            },
          ],
        }
      );

      // ================= 6. SAVE LEDGER TRANSACTION - DEBIT =================
      const ledgerTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        transactionType: form.trxType,
        accountId: form.accountId,
        accountName: form.accountName,
        description: form.vendorName,
        isCredit: false,
        trxAmount: total,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerTrxPayload
      ); 


      // ================= 7. UPDATE LEDGER ACCOUNT - CREDIT =================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/subtract-balance`,
        {
          updates: [
            {
              accountId: "501-001",
              amount: Number(total),
            },
          ],
        }
      );

      // ================= 8. SAVE LEDGER TRANSACTION - CREDIT =================
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
      toast.success("Invoice saved successfully");

      // Reset
      setForm({
        referenceId: "",
        trxType: "Invoice",
        trxDate: "",
        vendorId: "",
        vendorName: "",
        description: "",
        amount: 0,
      });
    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      toast.error("Error saving invoice");
    }
  };

  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-orange-600">
            🧾 Other Invoice
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage Miscellaneous Invoice and expense records.
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
              placeholder="Search Other Invoices..."
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
                      <th className="p-3">Reference</th>                      
                      <th className="p-3">Supplier</th>
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
                        <td className="p-3 text-gray-500">{inv.referenceId}</td>
                        <td className="p-3">{inv.vendorName}</td>
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


      {/* ================= FORM VIEW ================= */}
      {viewMode === "create" && (
        <div className="bg-white rounded-xl shadow border p-6 space-y-6">
          <h2 className="text-lg font-bold text-orange-600">
            Create Other Invoice
          </h2>
        <form onSubmit={handleSubmit}>

          {/* Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 mb-4">

            <input
              type="text"
              name="referenceId"
              placeholder="Reference ID"
              value={form.referenceId}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />

            <input
              type="date"
              name="trxDate"
              value={form.trxDate}
              onChange={handleChange}
              className="border p-2 rounded w-full"
              required
            />

            <select
              value={form.vendorId}
              onChange={(e) => {
                const selected = vendors.find(
                  (v) => v.accountId === e.target.value
                );

                setForm({
                  ...form,
                  vendorId: selected?.accountId || "",
                  vendorName: selected?.accountName || "",
                });
              }}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Account</option>
              {vendors.map((v) => (
                <option key={v.accountId} value={v.accountId}>
                  {v.accountName}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

          </div>

          {/* Description + Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-1 gap-3 mb-4">

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded col-span-2 w-full"
              required
            />


          </div>

          {/* Total */}
          <div className="flex justify-between items-center border-t pt-4 mb-6">

            <h3 className="text-lg font-bold text-gray-700">
              Total Amount
            </h3>

            <h2 className="text-xl font-bold text-green-600">
                {formatNumber(form.amount ?? 0)}
            </h2>

          </div>


          {/* Button */}
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
        </form>
      </div>
      )}
    </div>
  );
}