import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";

export default function EditCashBookPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const accountData = location.state?.ledgerAccount;

  const [form, setForm] = useState({
    accountId: "",
    accountType: "Asset",
    headerAccountId: "100",
    accountName: "",
    accountBalance: 0,
  });

  const [loading, setLoading] = useState(false);

  // Load existing data
  useEffect(() => {
    if (!accountData) {
      toast.error("No account data found");
      navigate("/cash-book");
      return;
    }

    setForm({
      accountId: accountData.accountId || "",
      accountType: accountData.accountType || "Asset",
      headerAccountId: accountData.headerAccountId || "100",
      accountName: accountData.accountName || "",
      accountBalance: accountData.accountBalance || 0,
    });
  }, [accountData, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: name === "accountBalance" ? Number(value) : value,
    }));
  };

  // FIXED accountId formatter
  const handleAccountIdChange = (e) => {
    let value = e.target.value;

    value = value.replace(/[^0-9-]/g, "");

    if (!value.startsWith("100-")) {
      value = "100-" + value.replace(/100-?/g, "");
    }

    const parts = value.split("-");
    if (parts[1]) {
      parts[1] = parts[1].slice(0, 3);
      value = `${parts[0]}-${parts[1]}`;
    }

    setForm((prev) => ({
      ...prev,
      accountId: value,
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

        await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/${accountData.accountId}`,
        form,
        {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        }
        );

      toast.success("Account updated successfully");

      navigate("/cash-book");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Error updating account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">

      <h1 className="text-2xl font-bold text-orange-600 mb-4">
        ✏️ Edit Cash Book Account
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">

        <div className="grid md:grid-cols-2 gap-4">

          {/* Account ID */}
          <input
            disabled
            name="accountId"
            value={form.accountId}
            onChange={handleAccountIdChange}
            placeholder="100-001"
            className="border p-2 rounded w-full"
          />

          {/* Account Type (fixed) */}
          <input
            value="Asset"
            disabled
            className="border p-2 rounded w-full bg-gray-100 text-gray-700"
          />

          {/* Account Name */}
          <input
            name="accountName"
            value={form.accountName}
            onChange={handleChange}
            placeholder="Account Name"
            className="border p-2 rounded w-full"
          />

          {/* Header Account */}
          <input
            disabled
            name="headerAccountId"
            value={form.headerAccountId}
            onChange={handleChange}
            placeholder="Header Account ID"
            className="border p-2 rounded w-full"
          />

          {/* Balance */}
          <input
            type="number"
            name="accountBalance"
            value={form.accountBalance}
            onChange={handleChange}
            placeholder="Balance"
            className="border p-2 rounded w-full md:col-span-2"
          />

        </div>

        {/* Buttons */}
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
            {loading ? "Updating..." : "Update"}
          </button>

        </div>

      </form>
    </div>
  );
}