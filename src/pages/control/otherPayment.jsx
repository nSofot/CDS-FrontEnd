import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEye, FaTimes } from "react-icons/fa";

export default function OtherPayment() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    reference: "",
    name: "",
    amount: "",
    description: "",
  });

  // ---------------- FETCH ----------------
  const loadData = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/other-payments");

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      setPayments(data);
    } catch (err) {
      console.log(err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- SAVE ----------------
  const handleSave = async () => {
    try {
      if (!form.reference || !form.name || !form.amount) {
        return alert("Please fill required fields");
      }

      setSaving(true);

      await axios.post("/api/other-payments", {
        ...form,
        amount: Number(form.amount),
      });

      setIsAddOpen(false);
      setForm({
        reference: "",
        name: "",
        amount: "",
        description: "",
      });

      loadData();
    } catch (err) {
      console.log(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ---------------- FILTER ----------------
  const filtered = (Array.isArray(payments) ? payments : []).filter(
    (p) =>
      (p.reference || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (p.name || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // ---------------- UI ----------------
  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">

        <h1 className="text-xl font-bold text-orange-600">
          Other Payments
        </h1>

        <div className="flex gap-2">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search payments..."
            className="border px-3 py-2 rounded-lg w-full md:w-64"
          />

          <button
            onClick={() => setIsAddOpen(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus /> Add
          </button>

        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading payments...
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow border overflow-hidden">

          <table className="w-full text-sm">

            <thead className="bg-orange-100">
              <tr>
                <th className="p-3 text-left">Reference</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-right">Amount</th>
                <th className="p-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody>

              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-6 text-gray-500">
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-orange-50">

                    <td className="p-3">{p.reference}</td>
                    <td className="p-3">{p.name}</td>

                    <td className="p-3 text-right text-red-600 font-medium">
                      Rs. {Number(p.amount || 0).toLocaleString()}
                    </td>

                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelected(p);
                          setIsViewOpen(true);
                        }}
                        className="text-blue-600"
                      >
                        <FaEye />
                      </button>
                    </td>

                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>
      )}

      {/* ADD MODAL */}
      {isAddOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsAddOpen(false)}
        >
          <div
            className="bg-white w-full max-w-lg rounded-xl p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex justify-between">
              <h2 className="font-bold text-orange-600">
                Add Payment
              </h2>

              <button onClick={() => setIsAddOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <input
              placeholder="Reference"
              className="border p-2 w-full rounded"
              value={form.reference}
              onChange={(e) =>
                setForm({ ...form, reference: e.target.value })
              }
            />

            <input
              placeholder="Name"
              className="border p-2 w-full rounded"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Amount"
              className="border p-2 w-full rounded"
              value={form.amount}
              onChange={(e) =>
                setForm({ ...form, amount: e.target.value })
              }
            />

            <textarea
              placeholder="Description"
              className="border p-2 w-full rounded"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-500 text-white w-full py-2 rounded"
            >
              {saving ? "Saving..." : "Save"}
            </button>

          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setIsViewOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-xl p-5 space-y-3"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex justify-between">
              <h2 className="font-bold text-orange-600">
                Payment Details
              </h2>

              <button onClick={() => setIsViewOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="space-y-2 text-sm">

              <p><b>Reference:</b> {selected.reference}</p>
              <p><b>Name:</b> {selected.name}</p>
              <p><b>Amount:</b> Rs. {selected.amount}</p>
              <p><b>Description:</b> {selected.description}</p>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}