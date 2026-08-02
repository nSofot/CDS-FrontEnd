import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { FaEye, FaSearch, FaTrash, FaPlus, FaRegFilePdf } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormat.js";
import { formatDate } from "../../utils/dateFormat.js";
import html2pdf from "html2pdf.js";

export default function OtherInvoicePage() {
  const [invoices, setInvoices] = useState([]);
  const [expensesAccounts, setExpensesAccounts] = useState([]);
  const [accrualAccounts, setAccrualAccounts] = useState([]);

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);   

  const [loading, setLoading] = useState(false);  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);    

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "OtherInvoice",
    trxDate: new Date().toISOString().split("T")[0],
    expenseId: "",
    expenseName: "",
    accrualId: "",
    accrualName: "",    
    description: "",
    amount: "",
  });

  const initialForm = {  
    referenceId: "",
    trxType: "OtherInvoice",
    trxDate: new Date().toISOString().split("T")[0],
    expenseId: "",
    expenseName: "",
    accrualId: "",
    accrualName: "",
    description: "",
    amount: "",
  };

  const resetForm = () => {
    setForm(initialForm);
  };



 const fetchInvoices = async () => {  
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const filtered = data.filter(
          (i) => i.transactionType === "OtherInvoice" && i.isCredit === true
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
  
  

  // Fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`
      );

      const accounts = res.data.data || res.data || [];

      const filteredAccounts = accounts
        .filter((acc) => acc.accountType === "Expenses")
        .sort((a, b) =>
          (a.accountName || "").localeCompare(b.accountName || "")
        );
      setExpensesAccounts(filteredAccounts);

      const filteredAccrualAccounts = accounts
        .filter((acc) => acc.accountType === "CurrentLiabilities" && acc.headerAccountId === "502")
        .sort((a, b) =>
          (a.accountName || "").localeCompare(b.accountName || "")
        );
      setAccrualAccounts(filteredAccrualAccounts);

    } catch (err) {
      console.error(err);
      toast.error("Failed to load vendors");
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchInvoices();
  }, []);

  const closeViewModal = () => {
    setIsViewOpen(false);
    // setStockTrx(null);
    setSelected(null);
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

    if (!form.referenceId || !form.trxDate || !form.expenseId || !form.accrualId || !form.amount || !form.description) {
      return toast.error("Please fill required fields");
    }

    try {
      setIsSubmitting(true);

      const total = Number(form.amount || 0);

      
      // ================= 1. UPDATE EXPENDITURE ACCOUNT - DEBIT =================      
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/add-balance`,
        {
          updates: [
            {
              accountId: form.expenseId,
              amount: Number(total),
            },
          ],
        }
      );

      // ================= 2. SAVE EXPENDITURE LEDGER TRANSACTION - DEBIT =================
      const ledgerDebitTrxPayload = {
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        transactionType: form.trxType,
        accountId: form.expenseId,
        accountName: form.expenseName,
        description: form.description,
        isCredit: false,
        trxAmount: total,
      };

      const ledgerDebitTrxResponse = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerDebitTrxPayload
      );
 

      const savedTrxId = ledgerDebitTrxResponse.data.transaction.trxId || null;

      // ================= 3. UPDATE ACCRUAL LEDGER ACCOUNT - CREDIT =================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/subtract-balance`,
        {
          updates: [
            {
              accountId: form.accrualId,
              amount: Number(total),
            },
          ],
        }
      );

      // ================= 4. SAVE LEDGER ACCRUAL TRANSACTION - CREDIT =================
      const ledgerTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        transactionType: form.trxType,
        accountId: form.accrualId,
        accountName: form.accrualName,
        description: form.description,
        isCredit: true,
        trxAmount: total,
        dueAmount: total,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerTrxPayload
      ); 

      setIsSaved(true);
      setIsSubmitting(false);
      toast.success("Other Invoice saved successfully");

      // Reset
      setForm({
        referenceId: "",
        trxDate: "",
        expenseId: "",
        expenseName: "",
        accrualId: "",
        accrualName: "",
        amount: "",
        description: "",
      });

    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      toast.error("Error saving other invoice");
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
                        <p className="text-sm text-gray-600">{inv.description}</p>
                        <p className="text-xs text-gray-400">Ref: {inv.referenceId}</p>
                        <p className="text-xs text-gray-400">{formatDate(inv.trxDate)}</p>
                      </div>

                      <p className="text-red-600 font-bold">
                        {formatNumber(inv.trxAmount)}
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
                      <th className="p-3">Description</th>
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
                        <td className="p-3">{inv.description}</td>
                        <td className="p-3 text-right text-red-600 font-semibold">
                          {formatNumber(inv.trxAmount)}
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
              value={form.expenseId}
              onChange={(e) => {
                const selected = expensesAccounts.find(
                  (v) => v.accountId === e.target.value
                );

                setForm({
                  ...form,
                  expenseId: selected?.accountId || "",
                  expenseName: selected?.accountName || "",
                });
              }}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Expense Account</option>
              {expensesAccounts.map((v) => (
                <option key={v.accountId} value={v.accountId}>
                  {v.accountName}
                </option>
              ))}
            </select>

            <select
              value={form.accrualId}
              onChange={(e) => {
                const selected = accrualAccounts.find(
                  (v) => v.accountId === e.target.value
                );

                setForm({
                  ...form,
                  accrualId: selected?.accountId || "",
                  accrualName: selected?.accountName || "",
                });
              }}
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Accrual Account</option>
              {accrualAccounts.map((v) => (
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
                  Other Invoice
                </h2>

                <p className="text-xs opacity-90">
                  Other Invoice Details
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
                  Accrual Account Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-500">
                    Accrual Account
                  </span>

                  <span className="col-span-2">
                    {selected.accountId}
                  </span>
                </div>
              </div>

              {/* Invoice */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Other Invoice Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                  <span className="font-medium text-gray-500">
                    Other Invoice No
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
                    Reference ID
                  </span>

                  <span className="col-span-2">
                    {selected.referenceId}
                  </span>

                  <span className="font-medium text-gray-500">
                    Description
                  </span>

                  <span className="col-span-2">
                    {selected.description}
                  </span>
                </div>

                {/* Loading State */}
                {/* {loadingTrx ? (
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
                                {formatNumber(item.stockCost)}
                              </td>

                              <td className="p-2 text-right">
                                {formatNumber(
                                  Number(item.quantity) *
                                    Number(item.stockCost)
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
                            {formatNumber(selected.trxAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )} */}
              </div>

              {/* Amount Summary */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">
                    Amount
                  </span>

                  <span className="text-2xl font-bold text-orange-600">
                    Rs. {formatNumber(selected.trxAmount)}
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