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

  // ✅ GET TOKEN (FIXED)
  const token = localStorage.getItem("token");

  // ✅ FETCH STOCKS
  const fetchStocks = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      const sorted = res.data.sort((a, b) =>
        (a.stockId || "").localeCompare(b.stockId || "")
      );

      setStocks(sorted);
    } catch (err) {
      console.error("Error fetching stocks:", err);
      toast.error("Failed to load stocks");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ LOAD ON MOUNT
  useEffect(() => {
    fetchStocks();
  }, []);

  // ✅ DELETE STOCK
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this stock?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock/${id}`,
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      toast.success("Stock deleted");
      fetchStocks(); // ✅ refresh list
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
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
              View all registered stocks
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

      {/* Table / List */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
        <div className="h-full max-h-[65vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-200 table-fixed">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="px-3 py-2">#</th>
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">UOM</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-orange-200">
                    {stocks.map((item, index) => (
                      <tr
                        key={item.stockId}
                        onClick={() => {
                          setActiveRecord(item);
                          setIsModalOpen(true);
                        }}
                        className="hover:bg-orange-50 cursor-pointer"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2">{item.stockId}</td>
                        <td className="px-3 py-2">{item.stockName}</td>
                        <td className="px-3 py-2">{item.stockQuantity}</td>
                        <td className="px-3 py-2">{item.stockUOM}</td>

                        {/* ✅ FIXED PRICE */}
                        <td className="px-3 py-2">
                          {item.stockPrice
                            ? `Rs. ${item.stockPrice}`
                            : "—"}
                        </td>

                        <td className="px-3 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/edit-stock", {
                                state: { stock: item },
                              });
                            }}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item._id)
                            }}
                            className="ml-2 text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden flex flex-col gap-3 p-3">
                {stocks.map((item) => (
                  <div
                    key={item.stockId}
                    onClick={() => {
                      setActiveRecord(item);
                      setIsModalOpen(true);
                    }}
                    className="p-3 border rounded-lg shadow hover:bg-orange-50"
                  >
                    <p className="font-semibold">{item.stockName}</p>
                    <p className="text-sm text-gray-600">
                      {item.stockQuantity} {item.stockUOM}
                    </p>

                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm">
                        {item.stockPrice
                          ? `Rs. ${item.stockPrice}`
                          : "—"}
                      </p>

                      <div>
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
                            handleDelete(item._id)
                          }}
                          className="ml-2 text-red-600"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                {[
                  ["ID", activeRecord.stockId],
                  ["Name", activeRecord.stockName],
                  ["Qty", activeRecord.stockQuantity],
                  ["UOM", activeRecord.stockUOM],
                  ["Price", activeRecord.stockPrice],
                ].map(([label, value]) => (
                  <tr key={label}>
                    <td className="py-2 font-medium text-orange-600">
                      {label}
                    </td>
                    <td className="py-2 text-right">
                      {value || "—"}
                    </td>
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