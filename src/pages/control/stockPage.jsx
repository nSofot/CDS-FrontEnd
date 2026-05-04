import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaEdit, FaTrash } from "react-icons/fa";

Modal.setAppElement("#root");

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const getAuthHeaders = () => {
    if (!token) return null;
    return { Authorization: `Bearer ${token}` };
  };

  const handleAuthError = (err) => {
    if (err.response?.status === 403) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      toast.error("Something went wrong");
    }
  };

  const categoryMap = {
    "packing material": "Packing Material",
    "substrate material": "Substrate Material",
    "sterilizing material": "Sterilizing Material",
    "inoculating material": "Inoculating Material",
    "incubating material": "Incubating Material",
    "finished products": "Finished Products",
  };

  const uomMap = {
    "kg": "Kg",
    "g": "Gram",
    "L": "Liter",
    "ml": "Milliliter",
    "pcs": "Piece",
  };

  const getTypeStyle = (category) => {
    switch (category) {
      case "Packing Material":
        return "bg-blue-100 text-blue-700";
      case "Substrate Material":
        return "bg-yellow-100 text-yellow-700";
      case "Sterilizing Material":
        return "bg-purple-100 text-purple-700";
      case "Inoculating Material":
        return "bg-indigo-100 text-indigo-700";
      case "Incubating Material":
        return "bg-pink-100 text-pink-700";
      case "Finished Products":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // 🔄 FETCH STOCKS
  const fetchStocks = async () => {
    try {
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      setIsLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        { headers: getAuthHeaders() }
      );

      const data = res.data.data || res.data || [];

      const sorted = data.sort((a, b) =>
        (a.stockId || "").localeCompare(b.stockId || "")
      );

      setStocks(sorted);
    } catch (err) {
      console.error(err);
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // 🗑 DELETE STOCK
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this stock?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/${id}`,
        { headers: getAuthHeaders() }
      );

      toast.success("Stock deleted");
      fetchStocks();
    } catch (err) {
      console.error(err);
      handleAuthError(err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              📦 Stocks List
            </h1>
            <p className="text-gray-600 text-sm">
              View and manage all registered stocks
            </p>
          </div>

          <div className="flex flex-row gap-4">
            <button
              onClick={() => navigate("/add-stock")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              + Add Stock
            </button>

            <button
              onClick={() => navigate("/stock-bin-card")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              ⌕ Bin Card
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              ← Go Back
            </button>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* 📱 MOBILE VIEW */}
          <div className="md:hidden space-y-3">
            {stocks.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  setActiveRecord(item);
                  setIsModalOpen(true);
                }}
                className="border rounded-lg p-3 shadow-sm bg-white cursor-pointer hover:bg-orange-50"
              >
                <div className="font-bold text-orange-400">
                  {item.stockName}
                </div>

                <div className="py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyle(
                      categoryMap[item.stockCategory]
                    )}`}
                  >
                    {categoryMap[item.stockCategory] || "N/A"}
                  </span>
                </div>

                <div className="text-sm">
                  Qty: {item.stockQuantity.toFixed(3)} {item.stockUOM}
                </div>

                <div className="text-sm">
                  Price: Rs. {item.stockPrice.toFixed(2) || "—"}
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ FIX
                      navigate("/edit-stock", { state: { stock: item } });
                    }}
                    className="text-blue-600"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ FIX
                      handleDelete(item._id);
                    }}
                    className="text-red-600"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}

            {stocks.length === 0 && (
              <p className="text-center text-gray-500">No stocks found</p>
            )}
          </div>

          {/* 🖥 DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-lg shadow flex-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full divide-y divide-orange-200">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-3 py-2 text-center">#</th>
                    <th className="px-3 py-2 text-left">ID</th>
                    <th className="px-3 py-2 text-left">Name</th>
                    <th className="px-3 py-2 text-left">Category</th>
                    <th className="px-3 py-2 text-right">Qty</th>
                    <th className="px-3 py-2 text-left">UOM</th>
                    <th className="px-3 py-2 text-right">Price</th>
                    <th className="px-3 py-2 text-center">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-orange-200">
                  {stocks.map((item, index) => (
                    <tr
                      key={item._id}
                      onClick={() => {
                        setActiveRecord(item);
                        setIsModalOpen(true);
                      }}
                      className="hover:bg-orange-50 cursor-pointer"
                    >
                      <td className="px-3 py-2 text-center">{index + 1}</td>
                      <td className="px-3 py-2 text-left">{item.stockId}</td>
                      <td className="px-3 py-2 text-left">{item.stockName}</td>

                      <td className="px-3 py-2 text-left">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getTypeStyle(
                            categoryMap[item.stockCategory]
                          )}`}
                        >
                          {categoryMap[item.stockCategory] || "N/A"}
                        </span>
                      </td>

                      <td className="px-3 py-2 text-right">{item.stockQuantity?.toFixed(3) || "—"}</td>
                      <td className="px-3 py-2 text-left">{uomMap[item.stockUOM] || item.stockUOM}</td>
                      <td className="px-3 py-2 text-right">
                        {item.stockPrice ? `${item.stockPrice.toFixed(2)}` : "—"}
                      </td>

                      <td className="text-center space-x-2 px-3 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/edit-stock", {
                              state: { stock: item },
                            });
                          }}
                          className="text-blue-600"
                        >
                          <FaEdit />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item._id);
                          }}
                          className="text-red-600"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {stocks.length === 0 && (
                <p className="text-center p-4 text-gray-500">
                  No stocks found
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {/* 📄 MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center"
        className="bg-white rounded-xl max-w-lg w-full p-5"
      >
        {activeRecord && (
          <div>
            <h2 className="text-xl font-bold text-orange-600 mb-4">
              Stock Details
            </h2>

            <table className="w-full text-sm">
              <tbody>
                {Object.entries({
                  ID: activeRecord.stockId,
                  Name: activeRecord.stockName,
                  Category: categoryMap[activeRecord.stockCategory],
                  Description: activeRecord.stockDescription,
                  Qty: Number(activeRecord.stockQuantity || 0).toFixed(3),
                  BaseQty: Number(activeRecord.baseQuantity || 0).toFixed(3),
                  UOM: uomMap[activeRecord.stockUOM] || "—",
                  Cost: Number(activeRecord.stockCost || 0).toFixed(2),
                  Price: Number(activeRecord.stockPrice || 0).toFixed(2),
                }).map(([key, val]) => (
                  <tr key={key} className="border-b">
                    <td className="py-2 text-orange-600">{key}</td>
                    <td className="py-2 text-right">{val || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* FOOTER */}
      <button
        onClick={() => navigate("/")}
        className="h-12 rounded-lg bg-orange-100 hover:bg-orange-200 font-semibold"
      >
        Close
      </button>
    </div>
  );
}