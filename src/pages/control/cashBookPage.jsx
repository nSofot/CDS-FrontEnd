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
    <div className="erp-page-shell flex min-h-screen flex-col gap-4">

      {/* HEADER */}
      <div className="erp-panel">
        <div className="erp-page-header m-0 p-5">

          <div>
            <h1 className="erp-title">
              Cash Book
            </h1>

            <p className="erp-subtitle">
              View and manage all registered cash book accounts
            </p>
          </div>

          <button
            onClick={() => navigate("/control")}
            className="erp-btn erp-btn-secondary"
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
              <div className="erp-panel p-6 text-center text-[#627069]">
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
                  className="erp-mobile-card cursor-pointer p-4"
                >
                  <div className="text-lg font-extrabold text-[#2f7d46]">
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
          <div className="erp-table-wrap hidden md:block">

            <div className="overflow-auto max-h-[70vh]">

              <table className="erp-table">

                <thead className="sticky top-0 z-10">
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

                <tbody className="">

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
                        className="cursor-pointer"
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
        className="erp-panel max-h-[90vh] w-full max-w-lg overflow-y-auto p-6 outline-none"
      >
        {activeRecord && (
          <>
            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-extrabold text-[#2f7d46]">
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
                    <td className="py-3 font-bold text-[#2f7d46]">
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
              className="erp-btn erp-btn-primary mt-6 w-full"
            >
              Close
            </button>
          </>
        )}
      </Modal>

      {/* FOOTER BUTTON */}
      <button
        onClick={() => navigate("/")}
        className="erp-btn erp-btn-secondary"
      >
        Close
      </button>

    </div>
  );
}