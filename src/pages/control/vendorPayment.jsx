import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function VendorPaymentPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "Payment",
    trxDate: "",
    vendorId: "",
    vendorName: "",
    paymentMethod: "Cash", // Cash | Bank | Cheque
    description: "",
    amount: "",
    bankName: "",
    chequeNo: "",
  });

  // ================= FETCH VENDORS =================
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

  useEffect(() => {
    fetchVendors();
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

    if (!form.referenceId || !form.trxDate || !form.vendorId || !form.amount) {
      return toast.error("Please fill required fields");
    }

    if (form.paymentMethod === "Bank" && !form.bankName) {
      return toast.error("Enter bank name");
    }

    if (form.paymentMethod === "Cheque" && !form.chequeNo) {
      return toast.error("Enter cheque number");
    }

    try {
      setLoading(true);

      const amount = Number(form.amount || 0);

      let description = "";

      if (form.paymentMethod === "Cash") {
        description = `Cash - ${form.description}`;
      } else if (form.paymentMethod === "Bank") {
        description = `${form.bankName} - ${form.description}`;
      } else if (form.paymentMethod === "Cheque") {
        description = `${form.chequeNo} - ${form.description}`;
      }    

      const vendorTrxPayload = {
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        trxType: form.trxType,
        vendorId: form.vendorId,
        vendorName: form.vendorName,
        description: description,
        isCredit: true, // Payment reduces due
        amount: amount,
        dueAmount: 0,
      }
      // Save transaction
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        vendorTrxPayload
      );

      // Reduce vendor due
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${form.vendorId}/reduce-due`,
        {
          amount: amount,
        }
      );

      toast.success("Payment recorded successfully");

      // RESET
      setForm({
        referenceId: "",
        trxType: "Payment",
        trxDate: "",
        vendorId: "",
        vendorName: "",
        paymentMethod: "Cash",
        description: "",
        amount: "",
        bankName: "",
        chequeNo: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error saving payment");
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">

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
          </div>

          {/* PAYMENT METHOD */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* CONDITIONAL FIELDS */}
          {form.paymentMethod === "Bank" && (
            <input
              type="text"
              name="bankName"
              placeholder="Bank Name"
              value={form.bankName}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-4"
              required
            />
          )}

          {form.paymentMethod === "Cheque" && (
            <input
              type="text"
              name="chequeNo"
              placeholder="Cheque Number"
              value={form.chequeNo}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-4"
              required
            />
          )}

          {/* DESCRIPTION + AMOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
            />

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
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
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>

        </form>
      </div>
    </div>
  );
}