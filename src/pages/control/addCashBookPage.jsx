import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function AddCashBookPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    accountId: "",
    accountType: "Asset",
    headerAccountId: "100",
    accountName: "",
    accountBalance: 0,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

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
        headerAccountId: "100",
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

        <div className="grid md:grid-cols-2 gap-4">

          <input
            disabled={true}
            name="accountId"
            value={form.accountId}
            onChange={(e) => {
              let value = e.target.value;

              // Allow only digits and dash
              value = value.replace(/[^0-9-]/g, "");

              // Auto-force prefix "100-"
              if (!value.startsWith("100-")) {
                value = "100-" + value.replace(/100-?/g, "");
              }

              // Limit last part to 3 digits
              const parts = value.split("-");
              if (parts[1]) {
                parts[1] = parts[1].slice(0, 3);
                value = `${parts[0]}-${parts[1]}`;
              }

              setForm({ ...form, accountId: value });
            }}
            placeholder="100-001"
            className="border p-2 rounded w-full"
            required
          />

          <input
            name="accountType"
            value="Asset"
            disabled
            className="border p-2 rounded w-full bg-gray-100 text-gray-700"
          />

          <input
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            placeholder="Account Name"
            className="border p-2 rounded w-full"
            required
          />

          <input
            name="headerAccountId"
            value={form.headerAccountId}
            onChange={handleChange}
            placeholder="Header Account ID (optional)"
            className="border p-2 rounded w-full"
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