import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function AddStockPage() {

  const navigate = useNavigate();

  const [stockId, setStockId] = useState("");
  const [stockName, setStockName] = useState("");
  const [stockDescription, setStockDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockUOM, setStockUOM] = useState("pcs");
  const [stockCost, setStockCost] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddStock = async () => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in first.");

    // Validation
    if (!stockName || !stockDescription || !stockUOM) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsAdding(true);

      const newStock = {
        stockId: stockId || undefined,
        stockName,
        stockDescription,
        stockQuantity: Number(stockQuantity) || 0,
        stockUOM,
        stockCost: Number(stockCost) || 0,
        stockPrice: Number(stockPrice) || 0,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        newStock,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Stock added successfully!");
      navigate("/stock", { replace: true });

    } catch (err) {
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">📦➕ Add New Stock</h1>
          <p className="text-sm text-gray-500">Enter stock details</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddStock}
            disabled={isAdding}
            className={`px-5 py-2 rounded-lg text-white ${
              isAdding ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAdding ? "Adding..." : "Add Stock"}
          </button>

          <Link
            to="/stock"
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        {/* Stock ID */}
        <div>
          <label className="text-sm font-medium">Stock ID</label>
          <input
            type="text"
            value={stockId}
            onChange={(e) => setStockId(e.target.value)}
            placeholder="Auto or manual"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Stock Name */}
        <div>
          <label className="text-sm font-medium">Stock Name *</label>
          <input
            type="text"
            value={stockName}
            onChange={(e) => setStockName(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={stockDescription}
            onChange={(e) => setStockDescription(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Quantity + UOM */}
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="text-sm font-medium">Quantity *</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="w-1/2">
            <label className="text-sm font-medium">UOM *</label>
            <select
              value={stockUOM}
              onChange={(e) => setStockUOM(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >
              <option value="pcs">PCS</option>
              <option value="kg">KG</option>
              <option value="g">G</option>
              <option value="L">L</option>
              <option value="ml">ML</option>
            </select>
          </div>
        </div>

        {/* Cost */}
        <div>
          <label className="text-sm font-medium">Cost Price *</label>
          <input
            type="number"
            value={stockCost}
            onChange={(e) => setStockCost(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Selling Price */}
        <div>
          <label className="text-sm font-medium">Selling Price *</label>
          <input
            type="number"
            value={stockPrice}
            onChange={(e) => setStockPrice(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

      </div>
    </div>
  );
}