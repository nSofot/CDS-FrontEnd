import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaEdit, FaTrash } from "react-icons/fa";

Modal.setAppElement("#root");

//cashbook

export default function CashBookPage() {
  const [ledgerAccounts, setLedgerAccounts] = useState([]);
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
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`,
        { headers: getAuthHeaders() }
      );

      const data = res.data.data || res.data || [];

      const sorted = data.sort((a, b) =>
        (a.accountId || "").localeCompare(b.accountId || "")
      );

      setLedgerAccounts(sorted);
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
    if (!window.confirm("Are you sure you want to delete this ledger account?"))
      return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/${id}`,
        { headers: getAuthHeaders() }
      );

      toast.success("Ledger account deleted");
      fetchStocks();
    } catch (err) {
      console.error(err);
      handleAuthError(err);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen p-3 flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex flex-col md:flex-row justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              📦 Cash Book
            </h1>
            <p className="text-gray-600 text-sm">
              View and manage all registered cash book accounts
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate("/add-cash-account")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              + Add Account
            </button>

            <button
              onClick={() => navigate("/cash-book-ledger")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              View
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
            {ledgerAccounts.map((item) => (
              <div
                key={item._id}
                onClick={() => {
                  setActiveRecord(item);
                  setIsModalOpen(true);
                }}
                className="border rounded-lg p-3 shadow-sm bg-white cursor-pointer hover:bg-orange-50"
              >
                <div className="font-bold text-orange-600">
                  {item.accountName || "Unnamed Account"}
                </div>

                <div className="text-sm text-gray-600">
                  ID: {item.accountId}
                </div>

                <div className="text-sm">
                  Price: Rs. {item.accountBalance || "—"}
                </div>

                <div className="flex gap-3 mt-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ FIX
                      navigate("/edit-cash-account", { state: { ledgerAccount: item } });
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

            {ledgerAccounts.length === 0 && (
              <p className="text-center text-gray-500">No ledger accounts found</p>
            )}
          </div>

          {/* 🖥 DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-lg shadow flex-1 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-[700px] w-full divide-y divide-orange-200">
                <thead className="bg-orange-100">
                  <tr>
                    <th className="px-3 py-2 text-center">#</th>
                    <th className="px-3 py-2 text-left">Account ID</th>
                    <th className="px-3 py-2 text-left">Account Name</th>
                    <th className="px-3 py-2 text-left">Balance</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-orange-200">
                  {ledgerAccounts.map((item, index) => (
                    <tr
                      key={item._id}
                      onClick={() => {
                        setActiveRecord(item);
                        setIsModalOpen(true);
                      }}
                      className="hover:bg-orange-50 cursor-pointer"
                    >
                      <td className="px-3 py-2 text-center">{index + 1}</td>
                      <td>{item.accountId}</td>
                      <td>{item.accountName || "Unnamed Account"}</td>
                      <td className="text-right">
                        {item.accountBalance ? `Rs. ${item.accountBalance}` : "—"}
                      </td>

                      <td className="text-right space-x-2 px-3 py-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/edit-cash-account", {
                              state: { ledgerAccount: item },
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

              {ledgerAccounts.length === 0 && (
                <p className="text-center p-4 text-gray-500">
                  No ledger accounts found
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
              Account Details
            </h2>

            <table className="w-full text-sm">
              <tbody>
                {Object.entries({
                  ID: activeRecord.accountId,
                  Name: activeRecord.accountName,
                  Balance: activeRecord.accountBalance,
                  Header: activeRecord.accountHeader,
                  Type: activeRecord.accountType,
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