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
      const filtered = data.filter((item) => item.headerAccountId === "301" || item.headerAccountId === "302");
      const sorted = filtered.sort((a, b) =>
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


  return (
    <div className="w-full max-w-7xl mx-auto min-h-screen flex flex-col gap-4 p-4">

      {/* HEADER */}
      <div className="bg-white rounded-xl shadow border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-6 py-4">

          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              📦 Cash Book
            </h1>

            <p className="text-gray-600 text-sm mt-1">
              View and manage all registered cash book accounts
            </p>
          </div>

          <button
            onClick={() => navigate("/control")}
            className="px-6 h-11 rounded-lg border border-orange-500 text-orange-500 font-medium hover:bg-orange-500 hover:text-white transition"
          >
            ← Go Back
          </button>
        </div>
      </div>

      {/* LOADING */}
      {isLoading ? (
        <div className="flex justify-center items-center flex-1 py-16">
          <LoadingSpinner />
        </div>
      ) : (
        <>
          {/* MOBILE VIEW */}
          <div className="md:hidden space-y-3">

            {ledgerAccounts.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-6 text-center text-gray-500">
                No ledger accounts found
              </div>
            ) : (
              ledgerAccounts.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    setActiveRecord(item);
                    setIsModalOpen(true);
                  }}
                  className="bg-white border rounded-xl p-4 shadow-sm cursor-pointer hover:bg-orange-50 transition"
                >
                  <div className="font-semibold text-orange-600 text-lg">
                    {item.accountName || "Unnamed Account"}
                  </div>

                  <div className="text-sm text-gray-600 mt-1">
                    Account ID : {item.accountId}
                  </div>

                  <div className="text-sm font-medium mt-2">
                    Balance :
                    <span className="text-green-600 ml-1">
                      Rs.{" "}
                      {Number(item.accountBalance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block bg-white rounded-xl shadow border border-gray-200 overflow-hidden">

            <div className="overflow-auto max-h-[70vh]">

              <table className="w-full text-sm">

                <thead className="bg-orange-100 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-3 text-center font-semibold w-20">
                      #
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Account ID
                    </th>

                    <th className="px-4 py-3 text-left font-semibold">
                      Account Name
                    </th>

                    <th className="px-4 py-3 text-right font-semibold">
                      Balance
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-200">

                  {ledgerAccounts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="4"
                        className="text-center py-10 text-gray-500"
                      >
                        No ledger accounts found
                      </td>
                    </tr>
                  ) : (
                    ledgerAccounts.map((item, index) => (
                      <tr
                        key={item._id}
                        onClick={() => {
                          setActiveRecord(item);
                          setIsModalOpen(true);
                        }}
                        className="hover:bg-orange-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-center">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3">
                          {item.accountId}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {item.accountName || "Unnamed Account"}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-green-600">
                          Rs.{" "}
                          {Number(
                            item.accountBalance || 0
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}

                </tbody>

              </table>

            </div>
          </div>
        </>
      )}

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
        className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto outline-none"
      >
        {activeRecord && (
          <>
            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-bold text-orange-600">
                Account Details
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-red-500 text-xl"
              >
                ✕
              </button>
            </div>

            <table className="w-full text-sm">

              <tbody>

                {Object.entries({
                  "Account ID": activeRecord.accountId,
                  "Account Name": activeRecord.accountName,
                  Balance: activeRecord.accountBalance,
                  Header: activeRecord.accountHeader,
                  Type: activeRecord.accountType,
                }).map(([key, value]) => (
                  <tr
                    key={key}
                    className="border-b border-gray-200"
                  >
                    <td className="py-3 font-medium text-orange-600">
                      {key}
                    </td>

                    <td className="py-3 text-right">
                      {value || "—"}
                    </td>
                  </tr>
                ))}

              </tbody>

            </table>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-full mt-6 h-11 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 transition"
            >
              Close
            </button>
          </>
        )}
      </Modal>

      {/* FOOTER BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="h-12 rounded-lg bg-orange-100 hover:bg-orange-200 font-semibold transition"
      >
        Close
      </button>

    </div>
  );
}