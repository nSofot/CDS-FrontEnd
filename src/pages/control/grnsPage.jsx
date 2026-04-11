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
          qty: 0,
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
        qty: 0,
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
  const handleSubmit = async () => {
    if (!form.clientId || form.items.length === 0) {
      return toast.error("Fill all required fields");
    }

    if (form.items.some(i => !i.productId || i.qty <= 0)) {
      return toast.error("Invalid item data");
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
      <h1 className="text-2xl font-bold mb-4">
        GRN & Purchase Entry
      </h1>

      {/* TOP */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3 mb-4">

        {/* DATE */}
        <input
          type="date"
          value={form.trxDate || ""}
          onChange={(e) =>
            setForm({ ...form, trxDate: e.target.value })
          }
          className="w-full md:w-[20%] border px-3 py-2 rounded"
        />

        {/* REFERENCE ID */}
        <input
          type="text"
          value={form.referenceId || ""}
          onChange={(e) =>
            setForm({ ...form, referenceId: e.target.value })
          }
          className="w-full md:w-[20%] border px-3 py-2 rounded"
          placeholder="Reference ID"
        />

        {/* VENDOR */}
        <select
          value={form.clientId || ""}
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
        >
          <option value="">Select Vendor</option>
          {vendors.map((v) => (
            <option key={v.vendorId} value={v.vendorId}>
              {v.vendorName}
            </option>
          ))}
        </select>

        {/* BUTTON */}
        <button
          onClick={addItem}
          disabled={isSaved}
          className={`w-full md:w-[20%] text-white rounded px-3 py-2 ${
            isSaved ? "bg-gray-400 cursor-not-allowed" : " bg-green-600 hover:bg-green-700"
          }`}
        >
          + Add Item
        </button>       
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block">
        <table className="w-full border rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Product</th>
              <th className="p-2 text-left">Qty</th>
              <th className="p-2 text-left">UOM</th>
              <th className="p-2 text-left">Cost</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-right">Total</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            {form.items.map((item, i) => (
              <tr key={i} className="border-t">

                {/* PRODUCT */}
                <td className="p-2">
                  <select
                    value={item.productId || ""}
                    onChange={(e) => {
                      const selected = products.find(
                        (p) => p.stockId === e.target.value
                      );
                      updateItem(i, "product", selected);
                    }}
                    className="border text-left w-full p-2 rounded"
                  >
                    <option value="">Select</option>
                    {products.map((p) => (
                      <option key={p.stockId} value={p.stockId}>
                        {p.stockName}
                      </option>
                    ))}
                  </select>
                </td>

                {/* QTY */}
                <td>
                  <input
                    type="number"
                    value={item.qty || ""}
                    onChange={(e) =>
                      updateItem(i, "qty", e.target.value)
                    }
                    className="border w-20 text-left rounded p-1"
                  />
                </td>

                {/* UOM */}
                <td className="text-left w-20">
                  {item.productUOM || "-"}
                </td>

                {/* COST */}
                <td>
                  <input
                    type="number"
                    value={item.cost || ""}
                    onChange={(e) =>
                      updateItem(i, "cost", e.target.value)
                    }
                    className="border w-24 text-left rounded p-1"
                  />
                </td>

                {/* PRICE */}
                <td>
                  <input
                    type="number"
                    value={item.price || ""}
                    onChange={(e) =>
                      updateItem(i, "price", e.target.value)
                    }
                    className="border w-24 text-left rounded p-1"
                  />
                </td>

                {/* TOTAL */}
                <td className="text-right pr-2">
                  {(item.qty * item.cost || 0).toFixed(2)}
                </td>

                <td>
                  <button
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

      {/* MOBILE */}
      <div className="md:hidden flex flex-col gap-3">
        {form.items.map((item, i) => (
          <div key={i} className="border p-3 rounded">

            <select
              value={item.productId || ""}
              onChange={(e) => {
                const selected = products.find(
                  (p) => p.stockId === e.target.value
                );
                updateItem(i, "product", selected);
              }}
              className="border w-full mb-2 p-2 rounded"
            >
              <option value="">Select Product</option>
              {products.map((p) => (
                <option key={p.stockId} value={p.stockId}>
                  {p.stockName}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-4 gap-2">
              <input
                type="number"
                placeholder="Qty"
                value={item.qty || ""}
                onChange={(e) =>
                  updateItem(i, "qty", e.target.value)
                }
                className="border p-2 rounded"
              />

              <p className="p-2">{item.productUOM || "-"}</p>

              <input
                type="number"
                placeholder="Cost"
                value={item.cost || ""}
                onChange={(e) =>
                  updateItem(i, "cost", e.target.value)
                }
                className="border p-2 rounded"
              />

              <input
                type="number"
                placeholder="Price"
                value={item.price || ""}
                onChange={(e) =>
                  updateItem(i, "price", e.target.value)
                }
                className="border p-2 rounded"
              />
            </div>

            <div className="flex justify-between mt-2">
              <span>Total</span>
              <span>
                Rs. {(item.qty * item.cost || 0).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => removeItem(i)}
              className="text-red-500 mt-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div className="sticky bottom-0 bg-white p-3 mt-4 border-t flex justify-between font-bold">
        <span>Total</span>
        <span>Rs. {total.toFixed(2)}</span>
      </div>

      {/* SAVE */}
      <button
        onClick={handleSubmit}
        disabled={isSaved}
        className={`w-full py-3 mt-3 rounded text-white ${
          isSaved ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSaved ? "GRN Saved" : "Save GRN"}
      </button>
    </div>
  );
}