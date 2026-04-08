import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function EditStockPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // Stock states
  const [stock, setStock] = useState({});
  const [stockId, setStockId] = useState("");
  const [stockName, setStockName] = useState("");
  const [stockDescription, setStockDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [stockUOM, setStockUOM] = useState("pcs");
  const [stockCost, setStockCost] = useState("");
  const [stockPrice, setStockPrice] = useState("");

  // 🔍 Fetch stock by ID
  const fetchStock = async (id) => {
    if (!id) return;

    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/${id}`
      );

      const data = res.data;

      setStock(data);
      setStockId(data.stockId || "");
      setStockName(data.stockName || "");
      setStockDescription(data.stockDescription || "");
      setStockQuantity(data.stockQuantity || "");
      setStockUOM(data.stockUOM || "pcs");
      setStockCost(data.stockCost || "");
      setStockPrice(data.stockPrice || "");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load stock");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load from navigation OR fallback
  useEffect(() => {
    if (location.state?.stock) {
      const data = location.state.stock;

      setStock(data);
      setStockId(data.stockId || "");
      setStockName(data.stockName || "");
      setStockDescription(data.stockDescription || "");
      setStockQuantity(data.stockQuantity || "");
      setStockUOM(data.stockUOM || "pcs");
      setStockCost(data.stockCost || "");
      setStockPrice(data.stockPrice || "");
    } else {
      const idFromUrl = window.location.search.split("=")[1];
      if (idFromUrl) fetchStock(idFromUrl);
    }
  }, [location.state]);

  // ✏️ Update stock
  const updateStock = async () => {
    if (!stockName || !stockQuantity || !stockCost || !stockPrice) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsUpdating(true);

      const updatedStock = {
        stockId,
        stockName,
        stockDescription,
        stockQuantity: Number(stockQuantity),
        stockUOM,
        stockCost: Number(stockCost),
        stockPrice: Number(stockPrice),
      };

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/${stockId}`,
        updatedStock,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Stock updated successfully!");
      navigate("/stock");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-4 bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">✏️ Edit Stock</h1>
          <p className="text-sm text-gray-500">
            Update existing stock details
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={updateStock}
            disabled={isUpdating}
            className={`px-6 py-2 rounded-lg text-white ${
              isUpdating
                ? "bg-gray-500"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUpdating ? "Updating..." : "Update Stock"}
          </button>

          <Link
            to="/stock"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
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
            className="w-full p-2 border rounded-lg"
            disabled
          />
        </div>

        {/* Name */}
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

        {/* Price */}
        <div>
          <label className="text-sm font-medium">Selling Price *</label>
          <input
            type="number"
            value={stockPrice}
            onChange={(e) => setStockPrice(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Profit Preview */}
        <div className="p-3 bg-gray-100 rounded-lg text-sm">
          Profit:{" "}
          <span className="font-semibold text-green-600">
            {Number(stockPrice || 0) - Number(stockCost || 0)}
          </span>
        </div>

      </div>
    </div>
  );
}