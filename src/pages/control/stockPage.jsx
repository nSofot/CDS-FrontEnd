import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUser, FaEdit } from "react-icons/fa";

Modal.setAppElement("#root");

export default function StockPage() {
  const [stocks, setStocks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/api/stock")
      .then((res) => {
        const sorted = res.data.sort((a, b) =>
          a.stockId.localeCompare(b.stockId)
        );

        setStocks(sorted);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching stocks:", err);
        setIsLoading(false);
      });
  }, [location]);


  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen p-3 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex md:flex-row flex-col justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              🧑‍🤝‍🧑 Stocks List
            </h1>
            <p className="text-gray-600 text-sm">
              View all registered stocks
            </p>
          </div>

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

      {/* Members List */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
        <div className="h-full max-h-[65vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-200 table-fixed">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-center">ID</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">Quantity</th>
                      <th className="px-3 py-2 text-left">UOM</th>
                      <th className="px-3 py-2 text-left">Price</th>
                      <th className="px-3 py-2 text-left">Actions</th>
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

                        <td className="px-3 py-2 text-center">
                          {item.stockId}
                        </td>
                        <td className="px-3 py-2">
                          {item.stockName}
                        </td>
                        <td className="px-3 py-2">{item.stockQuantity}</td>
                        <td className="px-3 py-2">{item.stockUOM}</td>
                        <td className="px-3 py-2">
                          {item.price ? `Rs. ${item.stockPrice}` : "—"}
                        </td>

                        <td className="px-3 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/edit-stock", { state: { stock: item } });
                            }}
                            className="text-lg text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col gap-3 p-3">
                {stocks.map((item) => (
                  <div
                    key={item.stockId}
                    onClick={() => {
                      setActiveRecord(item);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-3 border border-orange-200 rounded-lg shadow-sm hover:bg-orange-50 cursor-pointer"
                  >

                    <div className="flex-1">
                      <p className="font-semibold">
                        {item.stockName}
                      </p>

                      <p className="text-sm text-gray-600">
                        {item.stockQuantity} {item.stockUOM}
                      </p>



                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {item.stockPrice ? `Rs. ${item.stockPrice}` : "—"}
                        </p>
                        {/* ✅ FIXED HERE */}
                        <div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card click
                              navigate("/edit-member", { state: { member: item } });
                            }}
                            className="text-lg text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                        </div>
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
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center p-3"
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5"
      >
        {activeRecord && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-600">
                Stock Details
              </h2>
              <button onClick={() => setIsModalOpen(false)}>✖</button>
            </div>

            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Stock ID", activeRecord.stockId],
                  ["Stock Name", activeRecord.stockName],
                  ["Stock Description", activeRecord.stockDescription],                  
                  ["Stock Quantity", activeRecord.stockQuantity],
                  ["Stock UOM", activeRecord.stockUOM],
                  ["Stock Cost", activeRecord.stockCost ? `Rs. ${activeRecord.stockCost}` : "—"],
                  ["Stock Price", activeRecord.stockPrice ? `Rs. ${activeRecord.stockPrice}` : "—"],

                ].map(([label, value]) => (
                  <tr key={label} className="border-b">
                    <td className="py-2 font-medium text-orange-600">
                      {label}
                    </td>
                    <td className="py-2 text-right">{value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Bottom Close Button */}
      <button
        onClick={() => navigate("/control")}
        className="h-12 rounded-lg border bg-orange-100 hover:bg-orange-200 font-semibold"
      >
        Close
      </button>
    </div>
  );
}
