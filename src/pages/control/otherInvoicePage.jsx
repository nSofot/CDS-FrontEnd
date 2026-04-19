import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function OtherInvoicePage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "Invoice",
    trxDate: "",
    vendorId: "",
    vendorName: "",
    description: "",
    amount: "",
  });

  // Fetch vendors
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
      setLoading(true);

      const total = Number(form.amount || 0);

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

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${form.vendorId}/add-due`,
        {
          amount: total,
        }
      );

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
      console.error(err);
      toast.error("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow">

        <h1 className="text-xl sm:text-2xl font-bold">
          Other Invoice Entry
        </h1>
        <h2 className="text-sm sm:text-base text-gray-600 mb-6">
          Manage Miscellaneous Invoice and expense records
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Header */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">

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
                  (v) => v.vendorId === e.target.value
                );

                setForm({
                  ...form,
                  vendorId: selected?.vendorId || "",
                  vendorName: selected?.vendorName || "",
                });
              }}
              className="border p-2 rounded w-full"
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

          {/* Description + Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded col-span-2 w-full"
              required
            />

            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="border p-2 rounded col-span-2 w-full"
              required
            />
          </div>

          {/* Total */}
          <div className="text-right text-lg sm:text-xl font-bold mb-4">
            Total: Rs. {Number(form.amount ?? 0).toFixed(2)}
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}