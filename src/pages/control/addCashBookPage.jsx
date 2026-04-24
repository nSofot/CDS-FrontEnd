import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddCashBookPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    accountId: "",
    accountType: "Asset",
    accountMode: "",
    headerAccountId: "",
    accountName: "",
    accountBalance: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "accountMode") {
      let prefix = "";
      let headerId = "";

      if (value === "Cash") {
        prefix = "110-";
        headerId = "110";
      } else if (value === "Bank") {
        prefix = "115-";
        headerId = "115";
      }

      setForm((prev) => ({
        ...prev,
        accountMode: value,
        accountId: prefix,
        headerAccountId: headerId,
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: name === "accountBalance" ? Number(value) : value,
    }));
  };

  const validate = () => {
    if (!form.accountName.trim()) return "Account Name is required";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/${form.headerAccountId || "null"}`,
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Cash Book Account created successfully");

      setForm({
        accountId: "",
        accountType: "Asset",
        accountMode: "",
        headerAccountId: "",
        accountName: "",
        accountBalance: 0,
      });

      navigate("/cash-book");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error creating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        💰 Add Cash Book Account
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">

        <div className="grid md:grid-cols-3 gap-4">

          <input
            disabled={true}
            name="accountId"
            value={form.accountId}
            onChange={(e) => {
              let value = e.target.value;

              let prefix = "100-";
              if (form.accountMode === "Cash") prefix = "110-";
              if (form.accountMode === "Bank") prefix = "115-";

              // Allow only digits and dash
              value = value.replace(/[^0-9-]/g, "");

              // Force prefix
              if (!value.startsWith(prefix)) {
                value = prefix + value.replace(/^\d{3}-?/, "");
              }

              // Limit last 3 digits
              const parts = value.split("-");
              if (parts[1]) {
                parts[1] = parts[1].slice(0, 3);
                value = `${parts[0]}-${parts[1]}`;
              }

              setForm((prev) => ({
                ...prev,
                accountId: value,
              }));
            }}            placeholder="110-001 / 115-001"
            className="border p-2 rounded w-full"
            required
          />


          <input
            disabled
            name="headerAccountId"
            value={form.headerAccountId}
            onChange={handleChange}
            placeholder="Header Account ID"
            className="border p-2 rounded w-full"
          />

          <input
            name="accountType"
            value="Asset"
            disabled
            className="border p-2 rounded w-full bg-gray-100 text-gray-700"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <select
            name="accountMode"
            value={form.accountMode}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Select Account Mode</option>
            <option value="Cash">Cash Account</option>
            <option value="Bank">Bank Account</option>
          </select>

          <input
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            placeholder="Account Name"
            className="border p-2 rounded w-full"
            required
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate("/cash-book")}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-orange-500 text-white rounded"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

      </form>
    </div>
  );
}