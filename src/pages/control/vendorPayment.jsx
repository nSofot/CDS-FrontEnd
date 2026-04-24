import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function VendorPaymentPage() {
  const [vendors, setVendors] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "Payment",
    trxDate: "",
    vendorId: "",
    vendorName: "",
    accountId: "",
    accountName: "",
    description: "",
    amount: "",
  });

  // ================= FETCH =================
  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor`
      );
      setVendors(res.data.data || res.data);
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  const fetchLedgers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`
      );

      const data = res.data.data || res.data;

      // Only Cash & Bank (110,115)
      const filtered = data.filter(
        (item) =>
          item.headerAccountId === "110" ||
          item.headerAccountId === "115"
      );

      setLedgers(filtered);
    } catch {
      toast.error("Failed to load ledgers");
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchLedgers();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ VALIDATION
    if (!form.referenceId || !form.trxDate) {
      return toast.error("Reference & Date required");
    }

    if (!form.vendorId) {
      return toast.error("Please select a vendor");
    }

    if (!form.accountId) {
      return toast.error("Please select a paying account");
    }

    if (!form.amount || Number(form.amount) <= 0) {
      return toast.error("Enter valid amount");
    }

    try {
      setLoading(true);

      const amount = Number(form.amount);

      // ================= 1. SAVE VENDOR TRANSACTION =================
      const vendorTrxPayload = {
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        trxType: form.trxType,
        vendorId: form.vendorId,
        vendorName: form.vendorName,
        description: form.accountName + " - " + form.description,
        isCredit: true,
        amount: amount,
        dueAmount: 0,
      };

      const vendorRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        vendorTrxPayload
      );

      const savedTrxId = vendorRes.data.data.trxId;

      // ================= 2. REDUCE VENDOR DUE =================
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${form.vendorId}/reduce-due`,
        { amount }
      );

      // ================= 3. UPDATE LEDGER BALANCE =================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/subtract-balance`,
        {
          updates: [
            {
              accountId: form.accountId,
              amount: amount,
            },
          ],
        }
      );

      // ================= 4. SAVE LEDGER TRANSACTION =================
      const ledgerTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        transactionType: form.trxType,
        accountId: form.accountId,
        accountName: form.accountName,
        description: form.vendorName + " - " + form.description,
        isCredit: true,
        trxAmount: amount,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerTrxPayload
      );

      // ================= SUCCESS =================
      toast.success("Payment recorded successfully");

      // RESET FORM
      setForm({
        referenceId: "",
        trxType: "Payment",
        trxDate: "",
        vendorId: "",
        vendorName: "",
        accountId: "",
        accountName: "",
        description: "",
        amount: "",
      });

    } catch (err) {
      console.error("FULL ERROR:", err.response?.data || err);

      toast.error(
        err.response?.data?.message || "Error saving payment"
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow">

        <h1 className="text-xl sm:text-2xl font-bold">
          Vendor Payment Entry
        </h1>
        <h2 className="text-sm text-gray-600 mb-6">
          Record Cash, Bank and Cheque Payments to Vendors
        </h2>

        <form onSubmit={handleSubmit}>

          {/* TOP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">

            <input
              type="text"
              name="referenceId"
              placeholder="Reference ID"
              value={form.referenceId}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              type="date"
              name="trxDate"
              value={form.trxDate}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            {/* Vendor */}
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
              className="border p-2 rounded"
              required
            >
              <option value="">Select Vendor</option>
              {vendors.map((v) => (
                <option key={v.vendorId} value={v.vendorId}>
                  {v.vendorName}
                </option>
              ))}
            </select>

            {/* Ledger */}
            <select
              value={form.accountId}
              onChange={(e) => {
                const selected = ledgers.find(
                  (l) => l.accountId === e.target.value
                );

                setForm({
                  ...form,
                  accountId: selected?.accountId || "",
                  accountName: selected?.accountName || "",
                });
              }}
              className="border p-2 rounded"
              required
            >
              <option value="">Select paying account</option>
              {ledgers.map((l) => (
                <option key={l.accountId} value={l.accountId}>
                  {l.accountName}
                </option>
              ))}
            </select>

          </div>

          {/* DESCRIPTION + AMOUNT */}
          <div className="grid grid-cols-1 gap-3 mb-4">

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

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

          {/* TOTAL */}
          <div className="text-right font-bold text-lg mb-4">
            Amount: Rs. {Number(form.amount || 0).toFixed(2)}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>

        </form>
      </div>
    </div>
  );
}