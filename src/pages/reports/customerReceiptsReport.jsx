import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaSearch,
  FaReceipt,
  FaCalendarAlt,
  FaSync,
} from "react-icons/fa";

export default function CustomerReceiptsReport() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    search: "",
  });

  const fetchReceipts = async () => {
    try {
      setLoading(true);

      const params = {};

      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/customer-transaction/receipt`,
        {
          params,
        }
      );

      setReceipts(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customer receipts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    const search = filters.search.toLowerCase().trim();

    if (!search) return receipts;

    return receipts.filter(
      (item) =>
        item.customerName?.toLowerCase().includes(search) ||
        item.receiptNo?.toLowerCase().includes(search) ||
        item.paymentMethod?.toLowerCase().includes(search)
    );
  }, [receipts, filters.search]);

  const totalReceipts = useMemo(() => {
    return filteredReceipts.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
  }, [filteredReceipts]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaReceipt />
          Customer Receipts Report
        </h1>

        <p className="text-gray-500 mt-1">
          View all customer payment receipts
        </p>
      </div>

      {/* FILTER SECTION */}
      <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          {/* FROM DATE */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              From Date
            </label>

            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  fromDate: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          {/* TO DATE */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              To Date
            </label>

            <input
              type="date"
              value={filters.toDate}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  toDate: e.target.value,
                }))
              }
              className="w-full mt-1 border rounded-lg px-3 py-2"
            />
          </div>

          {/* SEARCH */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Search
            </label>

            <div className="flex items-center border rounded-lg mt-1 px-3">
              <FaSearch className="text-gray-400" />

              <input
                type="text"
                placeholder="Customer / Receipt No"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                className="w-full py-2 px-2 outline-none"
              />
            </div>
          </div>

          {/* BUTTONS */}
          <div className="flex items-end gap-2">
            <button
              onClick={fetchReceipts}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Filter
            </button>

            <button
              onClick={() => {
                setFilters({
                  fromDate: "",
                  toDate: "",
                  search: "",
                });

                fetchReceipts();
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 flex items-center gap-2"
            >
              <FaSync />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARD */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm">Total Receipts</p>

          <h2 className="text-2xl font-bold text-green-600">
            Rs. {totalReceipts.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
        </div>

        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-gray-500 text-sm">Records</p>

          <h2 className="text-2xl font-bold text-blue-600">
            {filteredReceipts.length}
          </h2>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Receipt No</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Payment Method</th>
                <th className="p-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-8 text-gray-500"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filteredReceipts.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center p-8 text-gray-500"
                  >
                    No receipts found
                  </td>
                </tr>
              ) : (
                filteredReceipts.map((receipt) => (
                  <tr
                    key={receipt._id}
                    className="border-t hover:bg-gray-50"
                  >
                    <td className="p-3">
                      {receipt.receiptNo}
                    </td>

                    <td className="p-3">
                      {new Date(receipt.date).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      {receipt.customerName}
                    </td>

                    <td className="p-3">
                      {receipt.paymentMethod}
                    </td>

                    <td className="p-3 text-right font-medium">
                      {Number(receipt.amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {filteredReceipts.length > 0 && (
              <tfoot className="bg-gray-100 font-bold">
                <tr>
                  <td colSpan="4" className="p-3 text-right">
                    Total
                  </td>

                  <td className="p-3 text-right text-green-700">
                    {totalReceipts.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}