import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PurchaseEntryPage() {
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [isSaved, setIsSaved] = useState(false);

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "Purchase",
    isAdded: true,
    trxDate: "",
    clientId: "",
    description: "",
    items: [],
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

  const fetchProducts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`
      );
      setProducts(res.data.data || res.data);
    } catch {
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProducts();
  }, []);

  // ================= ADD ITEM =================
  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          productId: "",
          productName: "",
          productUOM: "",
          qty: "",
          cost: 0,
          price: 0,
        },
      ],
    }));
  };

  // ================= UPDATE ITEM =================
  const updateItem = (index, field, value) => {
    const updated = [...form.items];

    if (field === "product") {
      updated[index] = {
        ...updated[index],
        productId: value?.stockId || "",
        productName: value?.stockName || "",
        productUOM: value?.stockUOM || "",
        qty: "",
        cost: value?.stockCost || 0,
        price: value?.stockPrice || 0,
      };
    } else {
      updated[index][field] =
        value === "" ? "" : Number(value);
    }

    setForm({ ...form, items: updated });
  };

  // ================= REMOVE =================
  const removeItem = (index) => {
    setForm({
      ...form,
      items: form.items.filter((_, i) => i !== index),
    });
  };

  // ================= TOTAL =================
  const total = form.items.reduce(
    (sum, item) => sum + (item.qty || 0) * (item.cost || 0),
    0
  );

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Custom validation for empty items
    if (form.items.length === 0) {
      return toast.error("Add at least one item");
    }

    try {
      const payload = {
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        trxType: form.trxType,
        description: form.description,
        isAdded: form.isAdded,
        clientId: form.clientId,
        items: form.items.map((i) => ({
          stockId: i.productId,
          stockName: i.productName,
          quantity: i.qty,
          stockUOM: i.productUOM,
          stockCost: i.cost,
          stockPrice: i.price,
        })),
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
        payload
      );

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-add`,
        {
          items: payload.items,
        }
      );

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        {
          referenceId: form.referenceId,
          trxDate: form.trxDate,
          trxType: form.trxType,
          vendorId: form.clientId,
          description: form.description,
          isCredit: false,
          amount: total,
          dueAmount: total,
        }
      );

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${form.clientId}/add-due`,
        {
          amount: total,
        }
      );

      setIsSaved(true);
      toast.success("GRN Created Successfully");
    } catch (err) {
      console.error(err.response?.data || err.message);
      toast.error("Failed to save");
    }
  };

  // ================= UI =================
  return (
    <div className="p-4 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold">GRN & Purchase Entry</h1>
      <h2 className="text-sm text-gray-600 mb-6">
        Manage Goods Received & Purchase Records
      </h2>

      <form onSubmit={handleSubmit}>
        {/* TOP */}
        <div className="flex flex-col md:flex-row flex-wrap gap-3 mb-4">

          <input
            type="date"
            value={form.trxDate}
            onChange={(e) =>
              setForm({ ...form, trxDate: e.target.value })
            }
            className="w-full md:w-[20%] border px-3 py-2 rounded"
            required
          />

          <input
            type="text"
            value={form.referenceId}
            onChange={(e) =>
              setForm({ ...form, referenceId: e.target.value })
            }
            className="w-full md:w-[20%] border px-3 py-2 rounded"
            placeholder="Reference ID"
            required
          />

          <select
            value={form.clientId}
            onChange={(e) => {
              const selected = vendors.find(
                (v) => v.vendorId === e.target.value
              );

              setForm({
                ...form,
                clientId: selected?.vendorId || "",
                description: selected?.vendorName || "",
              });
            }}
            className="w-full md:w-[35%] border px-3 py-2 rounded"
            required
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v.vendorId} value={v.vendorId}>
                {v.vendorName}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={addItem}
            disabled={isSaved}
            className={`w-full md:w-[20%] text-white rounded px-3 py-2 ${
              isSaved
                ? "bg-gray-400"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            + Add Item
          </button>
        </div>

        {/* ITEMS */}
        <div className="hidden md:block">
          <table className="w-full border rounded">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Product</th>
                <th>Qty</th>
                <th>UOM</th>
                <th>Cost</th>
                <th>Price</th>
                <th className="text-right">Total</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {form.items.map((item, i) => (
                <tr key={i} className="border-t">
                  <td className="p-2">
                    <select
                      value={item.productId}
                      required
                      onChange={(e) => {
                        const selected = products.find(
                          (p) => p.stockId === e.target.value
                        );
                        updateItem(i, "product", selected);
                      }}
                      className="border w-full p-2 rounded"
                    >
                      <option value="">Select</option>
                      {products.map((p) => (
                        <option key={p.stockId} value={p.stockId}>
                          {p.stockName}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.qty}
                      required
                      min="1"
                      onChange={(e) =>
                        updateItem(i, "qty", e.target.value)
                      }
                      className="border w-20 p-1 rounded"
                    />
                  </td>

                  <td>{item.productUOM || "-"}</td>

                  <td>
                    <input
                      type="number"
                      value={item.cost}
                      onChange={(e) =>
                        updateItem(i, "cost", e.target.value)
                      }
                      className="border w-24 p-1 rounded"
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) =>
                        updateItem(i, "price", e.target.value)
                      }
                      className="border w-24 p-1 rounded"
                    />
                  </td>

                  <td className="text-right pr-2">
                    {(item.qty * item.cost || 0).toFixed(2)}
                  </td>

                  <td>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="text-red-500"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TOTAL */}
        <div className="mt-4 font-bold text-right">
          Total: Rs. {total.toFixed(2)}
        </div>

        {/* SAVE */}
        <button
          type="submit"
          disabled={isSaved}
          className={`w-full py-3 mt-3 rounded text-white ${
            isSaved
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSaved ? "GRN Saved" : "Save GRN"}
        </button>
      </form>
    </div>
  );
}
