import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaEye, FaTimes } from "react-icons/fa";

export default function OtherReceiptPage() {
  window.scrollTo(0, 0);
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  /* FETCH */
  const loadData = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/ledger-account");

      // ✅ FIX: ensure array
      const data = res.data?.data || res.data || [];

      setReceipts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
      setReceipts([]); // safety fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  /* SAVE */
  const handleSave = async () => {
    // try {
    //   await axios.post("/api/other-receipts", form);
    //   setIsAddOpen(false);
    //   setForm({ reference: "", name: "", amount: "", description: "" });
    //   loadData();
    // } catch (err) {
    //   console.log(err);
    // }
  };

  const filtered = receipts.filter(
    (r) =>
      r.accountId?.toLowerCase().includes(search.toLowerCase()) ||
    
      r.accountName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-orange-600">
          Other Receipts
        </h1>

        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
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

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading receipts...
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="md:hidden space-y-3">
            {filtered.map((r) => (
              <div
                key={r._id}
                className="bg-white border rounded-lg p-3 shadow-sm"
              >
                <div className="font-semibold text-orange-600">
                  {r.accountName}
                </div>

                <div className="text-sm text-gray-600">
                  Ref: {r.reference}
                </div>

                <div className="text-sm font-medium mt-1">
                  Rs. {Number(r.amount || 0).toLocaleString()}
                </div>

                <button
                  onClick={() => {
                    setSelected(r);
                    setIsViewOpen(true);
                  }}
                  className="mt-2 text-blue-600 flex items-center gap-1"
                >
                  <FaEye /> View
                </button>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden">
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
                {filtered.map((r) => (
                  <tr key={r._id} className="border-t hover:bg-orange-50">
                    <td className="p-3">{r.reference}</td>
                    <td className="p-3">{r.accountName}</td>
                    <td className="p-3 text-right">
                      Rs. {Number(r.amount || 0).toLocaleString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => {
                          setSelected(r);
                          setIsViewOpen(true);
                        }}
                        className="text-blue-600"
                      >
                        <FaEye />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ADD MODAL */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <h2 className="font-bold text-orange-600">
                Add Receipt
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
              className="bg-orange-500 text-white w-full py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-xl p-5 space-y-3">
            <div className="flex justify-between">
              <h2 className="font-bold text-orange-600">
                Receipt Details
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