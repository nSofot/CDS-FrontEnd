import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSearch, FaPrint, FaFilePdf, FaArrowLeft } from "react-icons/fa";

export default function CustomerOutstandingTransactions() {
  const [data, setData] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOutstanding();
  }, []);

  const fetchOutstanding = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`
      );

      setMembers(Array.isArray(res.data) ? res.data : []);

      // const res2 = await axios.get(
      //   `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction/outstanding`
      // );

      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      toast.error("Failed to load outstanding report");
    } finally {
      setLoading(false);
    }
  };

  // GET OUTSTANDING AMOUNT
  const getOutstanding = (item) => {
    return (item.amount || 0) - (item.paidAmount || 0);
  };

  // AGE CALCULATION
  const getAgeInDays = (invoiceDate) => {
    const today = new Date();
    const invDate = new Date(invoiceDate);

    const diff = today - invDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  // AGE ANALYSIS
  const summary = useMemo(() => {
    const result = {
      current: 0,
      days30_60: 0,
      days60_90: 0,
      days90_plus: 0,
      total: 0,
    };

    data.forEach((item) => {
      const outstanding = getOutstanding(item);
      const age = getAgeInDays(item.invoiceDate);

      result.total += outstanding;

      if (age <= 30) {
        result.current += outstanding;
      } else if (age <= 60) {
        result.days30_60 += outstanding;
      } else if (age <= 90) {
        result.days60_90 += outstanding;
      } else {
        result.days90_plus += outstanding;
      }
    });

    return result;
  }, [data]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          Customer Outstanding Transactions Report
        </h1>
        <p className="text-gray-500">
          All outstanding transactions
        </p>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between mb-4">
        <div className="flex gap-3">
          <button
            disabled={data.length === 0 || !loading}
            // onClick={handlePrint}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPrint /> Print
          </button>

          <button
            disabled={data.length.length === 0 || !loading}
            // onClick={handleDownloadPDF}
            className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaFilePdf /> PDF
          </button>
        </div>
        <button
          onClick={() => navigate("/control/reports")}
          className="text-orange-500 border border-orange-500 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-orange-500 hover:text-white transition"
        >
          <FaArrowLeft /> Back
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid md:grid-cols-5 gap-4 mb-6">

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">Current (0-30)</div>
          <div className="text-xl font-bold text-green-600">
            Rs. {summary.current.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">30-60 Days</div>
          <div className="text-xl font-bold text-yellow-600">
            Rs. {summary.days30_60.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">60-90 Days</div>
          <div className="text-xl font-bold text-orange-600">
            Rs. {summary.days60_90.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">90+ Days</div>
          <div className="text-xl font-bold text-red-600">
            Rs. {summary.days90_plus.toFixed(2)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm">
          <div className="text-sm text-gray-500">Total Outstanding</div>
          <div className="text-xl font-bold text-blue-600">
            Rs. {summary.total.toFixed(2)}
          </div>
        </div>

      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full text-sm">

            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Customer</th>
                <th className="p-3 text-left">Invoice</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-right">Invoice Amt</th>
                <th className="p-3 text-right">Paid</th>
                <th className="p-3 text-right">Outstanding</th>
                <th className="p-3 text-right">Age (Days)</th>
              </tr>
            </thead>

            <tbody>

              {loading && (
                <tr>
                  <td colSpan={7} className="text-center p-6">
                    Loading...
                  </td>
                </tr>
              )}

              {!loading && data.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center p-6 text-gray-500">
                    No outstanding records found
                  </td>
                </tr>
              )}

              {data.map((item) => {
                const outstanding = getOutstanding(item);
                const age = getAgeInDays(item.invoiceDate);

                return (
                  <tr key={item._id} className="border-t">

                    <td className="p-3">
                      {item.customerName}
                    </td>

                    <td className="p-3">
                      {item.invoiceId}
                    </td>

                    <td className="p-3">
                      {new Date(item.invoiceDate).toLocaleDateString("en-GB")}
                    </td>

                    <td className="p-3 text-right">
                      {item.amount.toFixed(2)}
                    </td>

                    <td className="p-3 text-right text-green-600">
                      {item.paidAmount.toFixed(2)}
                    </td>

                    <td className="p-3 text-right font-bold text-red-600">
                      {outstanding.toFixed(2)}
                    </td>

                    <td className="p-3 text-right">
                      {age}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

    </div>
  );
}