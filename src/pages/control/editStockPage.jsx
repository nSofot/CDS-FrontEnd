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
  const [stockCategory, setStockCategory] = useState("");
  const [stockName, setStockName] = useState("");
  const [stockDescription, setStockDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [baseQuantity, setBaseQuantity] = useState("");
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
      setStockCategory(data.stockCategory || "");
      setStockQuantity(data.stockQuantity || "");
      setBaseQuantity(data.baseQuantity || "");
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
      setStockCategory(data.stockCategory || "");
      setStockQuantity(data.stockQuantity || "");
      setBaseQuantity(data.baseQuantity || "");
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
    if (!stockName || !stockCategory || !stockUOM) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsUpdating(true);

      const updatedStock = {
        stockId,
        stockName,
        stockDescription,
        stockCategory,
        stockQuantity: Number(stockQuantity),
        baseQuantity: Number(baseQuantity),
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
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">✏️ Edit Stock</h1>
          <p className="text-sm text-gray-500">
            Update existing stock details
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={updateStock}
            disabled={isUpdating}
            className={`px-5 py-2 rounded-lg text-white text-sm md:text-base ${
              isUpdating ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUpdating ? "Updating..." : "Update Stock"}
          </button>

          <Link
            to="/stock"
            className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm md:text-base"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* FORM CARD */}
      <div className="bg-white rounded-xl shadow border p-4 md:p-6 space-y-5">

        {/* Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Stock ID */}
          <div>
            <label className="text-sm font-medium">Stock ID</label>
            <input
              type="text"
              value={stockId}
              disabled
              className="w-full p-2 border rounded-lg bg-gray-100"
            />
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">Category *</label>
            <select
              value={stockCategory}
              onChange={(e) => setStockCategory(e.target.value)}
              className="w-full p-2 border rounded-lg"
            >            
              <option value="">Select category</option>
              <option value="packing material">Packing Material</option>
              <option value="substrate material">Substrate Material</option>
              <option value="sterilizing material">Sterilizing Material</option>
              <option value="inoculating material">Inoculating Material</option>
              <option value="incubating material">Incubating Material</option>
              <option value="finished products">Finished Products</option>
            </select>
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
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-medium">Description</label>
          <textarea
            value={stockDescription}
            onChange={(e) => setStockDescription(e.target.value)}
            className="w-full p-2 border rounded-lg min-h-[60px]"
          />
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="text-sm font-medium">Quantity</label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Base Qty / Bag</label>
            <input
              type="number"
              value={baseQuantity}
              onChange={(e) => setBaseQuantity(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
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

        {/* Row 3 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div>
            <label className="text-sm font-medium">Cost Price</label>
            <input
              type="number"
              value={stockCost}
              onChange={(e) => setStockCost(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Selling Price</label>
            <input
              type="number"
              value={stockPrice}
              onChange={(e) => setStockPrice(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Profit Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
          Profit:{" "}
          <span className="font-semibold text-green-600">
            {(Number(stockPrice || 0) - Number(stockCost || 0)).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}