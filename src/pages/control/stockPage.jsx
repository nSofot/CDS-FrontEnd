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

  // ✅ COMMON HEADERS FUNCTION
  const getAuthHeaders = () => {
    if (!token) return null;
    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // ✅ HANDLE AUTH ERROR
  const handleAuthError = (err) => {
    if (err.response?.status === 403) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      toast.error("Something went wrong");
    }
  };

  // ✅ FETCH STOCKS
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
        {
          headers: getAuthHeaders(),
        }
      );

      const data = res.data || [];

      const sorted = data.sort((a, b) =>
        (a.stockId || "").localeCompare(b.stockId || "")
      );

      setStocks(sorted);
    } catch (err) {
      console.error("Error fetching stocks:", err);
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  // ✅ DELETE STOCK
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this stock?")) return;

    try {
      if (!token) {
        toast.error("Please login first");
        navigate("/login");
        return;
      }

      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/${id}`,
        {
          headers: getAuthHeaders(),
        }
      );

      toast.success("Stock deleted");
      fetchStocks();
    } catch (err) {
      console.error(err);
      handleAuthError(err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen p-3 flex flex-col gap-4">
      
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex md:flex-row flex-col justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              📦 Stocks List
            </h1>
            <p className="text-gray-600 text-sm">
              View and manage all registered stocks
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/add-stock")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              + Add Stock
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

      {/* Table */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
        <div className="h-full max-h-[65vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-200 table-fixed">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="px-3 py-2 text-center">#</th>
                      <th className="px-3 py-2 text-left">ID</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Qty</th>
                      <th className="px-3 py-2 text-left">UOM</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Actions</th>
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
                        <td>{item.stockId}</td>
                        <td>{item.stockName}</td>
                        <td>{item.stockQuantity}</td>
                        <td>{item.stockUOM}</td>
                        <td className="text-right">
                          {item.stockPrice ? `Rs. ${item.stockPrice}` : "—"}
                        </td>

                        <td className="text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/edit-stock", { state: { stock: item } });
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
                            className="ml-2 text-red-600"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
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
                  Description: activeRecord.stockDescription,
                  Qty: activeRecord.stockQuantity,
                  UOM: activeRecord.stockUOM,
                  Cost: activeRecord.stockCost,
                  Price: activeRecord.stockPrice,
                }).map(([key, val]) => (
                  <tr key={key}>
                    <td className="py-2 text-orange-600">{key}</td>
                    <td className="py-2 text-right">{val || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Footer */}
      <button
        onClick={() => navigate("/control")}
        className="h-12 rounded-lg bg-orange-100 hover:bg-orange-200 font-semibold"
      >
        Close
      </button>
    </div>
  );
}