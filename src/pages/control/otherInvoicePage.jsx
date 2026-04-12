import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function OtherInvoicePage() {
  const [form, setForm] = useState({
    referenceId: "",
    trxType: "OtherInvoice",
    trxDate: "",
    customerName: "",
    remark: "",
  });

  const [items, setItems] = useState([
    { description: "", qty: 1, rate: 0, amount: 0 },
  ]);

  const [loading, setLoading] = useState(false);

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle item change
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // Auto calculate amount
    const qty = parseFloat(updatedItems[index].qty) || 0;
    const rate = parseFloat(updatedItems[index].rate) || 0;
    updatedItems[index].amount = qty * rate;

    setItems(updatedItems);
  };

  // Add item
  const addItem = () => {
    setItems([
      ...items,
      { description: "", qty: 1, rate: 0, amount: 0 },
    ]);
  };

  // Remove item
  const removeItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  // Calculate total
  const totalAmount = items.reduce(
    (sum, item) => sum + (parseFloat(item.amount) || 0),
    0
  );

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.referenceId || !form.trxDate) {
      return toast.error("Please fill required fields");
    }

    if (items.length === 0) {
      return toast.error("Add at least one item");
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        items,
        totalAmount,
      };

      await axios.post("http://localhost:3000/api/other-invoice", payload);

      toast.success("Invoice saved successfully");

      // Reset form
      setForm({
        referenceId: "",
        trxType: "OtherInvoice",
        trxDate: "",
        customerName: "",
        remark: "",
      });

      setItems([{ description: "", qty: 1, rate: 0, amount: 0 }]);
    } catch (err) {
      console.error(err);
      toast.error("Error saving invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow">

        <h2 className="text-2xl font-bold mb-4">
          Other Invoice Entry
        </h2>

        <form onSubmit={handleSubmit}>

          {/* Header */}
          <div className="grid grid-cols-2 gap-4 mb-4">

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

            <input
              type="text"
              name="customerName"
              placeholder="Customer Name"
              value={form.customerName}
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
            />

            <input
              type="text"
              name="remark"
              placeholder="Remark"
              value={form.remark}
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
            />
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto mb-4">
            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="p-2 border">Description</th>
                  <th className="p-2 border">Qty</th>
                  <th className="p-2 border">Rate</th>
                  <th className="p-2 border">Amount</th>
                  <th className="p-2 border">Action</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="border p-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        type="number"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(index, "qty", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>

                    <td className="border p-2">
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) =>
                          handleItemChange(index, "rate", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      />
                    </td>

                    <td className="border p-2 text-right">
                      {item.amount.toFixed(2)}
                    </td>

                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Item */}
          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
          >
            + Add Item
          </button>

          {/* Total */}
          <div className="text-right text-xl font-bold mb-4">
            Total: Rs. {totalAmount.toFixed(2)}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-2 rounded"
          >
            {loading ? "Saving..." : "Save Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
}