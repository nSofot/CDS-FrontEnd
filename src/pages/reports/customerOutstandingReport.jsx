import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaSearch, FaPrint, FaFilePdf, FaArrowLeft } from "react-icons/fa";

export default function CustomerOutstandingReport() {
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
    <div className="erp-page">
      <div className="erp-page-shell">

        {/* ================= HEADER ================= */}
        <div className="erp-page-header">
          <div>
            <div className="erp-eyebrow">
              Customer Reports
            </div>

            <h1 className="erp-title">
              Customer Outstanding Report
            </h1>

            <p className="erp-subtitle">
              View customer outstanding balances with age analysis.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              disabled={loading || data.length === 0}
              className="erp-btn erp-btn-secondary"
            >
              <FaPrint />
              Print
            </button>

            <button
              disabled={loading || data.length === 0}
              className="erp-btn erp-btn-danger"
            >
              <FaFilePdf />
              Export PDF
            </button>

            <button
              onClick={() => navigate("/control/reports")}
              className="erp-btn erp-btn-primary"
            >
              <FaArrowLeft />
              Back
            </button>

          </div>
        </div>

        {/* ================= SUMMARY ================= */}

        <div className="grid gap-5 xl:grid-cols-5 md:grid-cols-2 mb-6">

          <div className="erp-panel p-6 border-l-4 border-green-500">
            <div className="erp-label">
              Current (0 - 30 Days)
            </div>

            <h2 className="text-2xl font-bold text-green-600 mt-2">
              Rs. {summary.current.toFixed(2)}
            </h2>
          </div>

          <div className="erp-panel p-6 border-l-4 border-yellow-500">
            <div className="erp-label">
              30 - 60 Days
            </div>

            <h2 className="text-2xl font-bold text-yellow-600 mt-2">
              Rs. {summary.days30_60.toFixed(2)}
            </h2>
          </div>

          <div className="erp-panel p-6 border-l-4 border-orange-500">
            <div className="erp-label">
              60 - 90 Days
            </div>

            <h2 className="text-2xl font-bold text-orange-600 mt-2">
              Rs. {summary.days60_90.toFixed(2)}
            </h2>
          </div>

          <div className="erp-panel p-6 border-l-4 border-red-500">
            <div className="erp-label">
              Over 90 Days
            </div>

            <h2 className="text-2xl font-bold text-red-600 mt-2">
              Rs. {summary.days90_plus.toFixed(2)}
            </h2>
          </div>

          <div className="erp-panel p-6 border-l-4 border-blue-500">
            <div className="erp-label">
              Total Outstanding
            </div>

            <h2 className="text-2xl font-bold text-blue-600 mt-2">
              Rs. {summary.total.toFixed(2)}
            </h2>
          </div>

        </div>

        {/* ================= TABLE ================= */}

        <div className="erp-table-wrap">

          <div className="overflow-x-auto">

            <table className="erp-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th className="text-right">
                    Invoice Amount
                  </th>
                  <th className="text-right">
                    Paid Amount
                  </th>
                  <th className="text-right">
                    Outstanding
                  </th>
                  <th className="text-center">
                    Age
                  </th>
                </tr>
              </thead>

              <tbody>

                {loading && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">

                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent"></div>

                        <span className="text-gray-500">
                          Loading outstanding report...
                        </span>

                      </div>
                    </td>
                  </tr>
                )}

                {!loading && data.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-gray-500"
                    >
                      <div className="flex flex-col items-center gap-2">

                        <FaFilePdf
                          size={34}
                          className="text-gray-300"
                        />

                        <span className="font-semibold">
                          No Outstanding Records
                        </span>

                        <small>
                          There are no outstanding invoices to display.
                        </small>

                      </div>
                    </td>
                  </tr>
                )}

                {data.map((item) => {

                  const outstanding = getOutstanding(item);
                  const age = getAgeInDays(item.invoiceDate);

                  return (

                    <tr key={item._id}>

                      <td>

                        <div className="font-semibold">
                          {item.customerName}
                        </div>

                      </td>

                      <td>
                        {item.invoiceId}
                      </td>

                      <td>
                        {new Date(item.invoiceDate).toLocaleDateString("en-GB")}
                      </td>

                      <td className="text-right">
                        Rs. {item.amount.toFixed(2)}
                      </td>

                      <td className="text-right text-green-600 font-semibold">
                        Rs. {item.paidAmount.toFixed(2)}
                      </td>

                      <td className="text-right">

                        <span className="erp-chip bg-red-100 text-red-700">
                          Rs. {outstanding.toFixed(2)}
                        </span>

                      </td>

                      <td className="text-center">

                        <span
                          className={`erp-chip ${
                            age <= 30
                              ? "bg-green-100 text-green-700"
                              : age <= 60
                              ? "bg-yellow-100 text-yellow-700"
                              : age <= 90
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {age} Days
                        </span>

                      </td>

                    </tr>

                  );
                })}

              </tbody>

            </table>

          </div>

        </div>

      </div>
    </div>
  );
}