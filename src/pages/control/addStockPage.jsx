import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";

export default function AddStockPage() {
  const navigate = useNavigate();

  const [stockCategory, setStockCategory] = useState("");
  const [stockName, setStockName] = useState("");
  const [stockDescription, setStockDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [baseQuantity, setBaseQuantity] = useState("");
  const [stockUOM, setStockUOM] = useState("");
  const [stockCost, setStockCost] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddStock = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in first.");
      return;
    }

    // Validation
    if (
      !stockCategory ||
      !stockName ||
      !stockUOM
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsAdding(true);

      const newStock = {
        stockCategory,
        stockName,
        stockDescription,
        stockQuantity: Number(stockQuantity) || 0,
        baseQuantity: Number(baseQuantity) || 0,
        stockUOM,
        stockCost: Number(stockCost) || 0,
        stockPrice: Number(stockPrice) || 0,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        newStock,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Stock added successfully!");
      navigate("/stock", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              📦 Add New Stock
            </h1>
            <p className="text-sm text-gray-500">
              Add materials, products, and inventory records
            </p>
          </div>

          <div className="flex md:justify-between gap-3">
            <button
              onClick={handleAddStock}
              disabled={isAdding}
              className={`px-6 py-3 rounded-xl text-white transition ${
                isAdding
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-600"
              }`}
            >
              {isAdding ? "Adding..." : "Add Stock"}
            </button>

            <Link
              to="/stock"
              className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white transition"
            >
              Cancel
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Category + Name */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Item Category *
              </label>

              <select
                value={stockCategory}
                onChange={(e) => setStockCategory(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">Select a category</option>
                <option value="packing material">Packing Material</option>
                <option value="substrate material">Substrate Material</option>
                <option value="sterilizing material">Sterilizing Material</option>
                <option value="inoculating material">Inoculating Material</option>
                <option value="incubating material">Incubating Material</option>
                <option value="finished products">Finished Products</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Item Name *
              </label>

              <input
                type="text"
                value={stockName}
                onChange={(e) => setStockName(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter item name"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block mb-2 font-medium text-gray-700">
              Description *
            </label>

            <textarea
              value={stockDescription}
              onChange={(e) => setStockDescription(e.target.value)}
              rows="3"
              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
              placeholder="Enter stock description"
              required
            />
          </div>

          {/* Quantity + UOM */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Quantity
              </label>

              <input
                type="number"
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter quantity"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Base Quantity Per Bag
              </label>

              <input
                type="number"
                value={baseQuantity}
                onChange={(e) => setBaseQuantity(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter base quantity"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                UOM *
              </label>

              <select
                value={stockUOM}
                onChange={(e) => setStockUOM(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                required
              >
                <option value="">Select UOM</option>
                <option value="pcs">PCS</option>
                <option value="kg">KG</option>
                <option value="g">G</option>
                <option value="L">L</option>
                <option value="ml">ML</option>
              </select>
            </div>
          </div>

          {/* Cost + Selling */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Cost Price
              </label>

              <input
                type="number"
                value={stockCost}
                onChange={(e) => setStockCost(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter cost price"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium text-gray-700">
                Selling Price
              </label>

              <input
                type="number"
                value={stockPrice}
                onChange={(e) => setStockPrice(e.target.value)}
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder="Enter selling price"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}