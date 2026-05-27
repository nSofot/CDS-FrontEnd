import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaFileInvoiceDollar,
  FaMoneyBillWave,
  FaShoppingBag,
  FaArrowDown,
  FaArrowUp,
  FaBalanceScale,
  FaCalendarAlt,
} from "react-icons/fa";

export default function ViewAccountStatementPage() {
  const [loading, setLoading] = useState(false);

  const [transactions, setTransactions] = useState([]);

  const [selectedMonth, setSelectedMonth] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  /* ───────────────── FETCH TRANSACTIONS ───────────────── */

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_URL
        }/api/member-account-statement/${user?._id}`
      );

      setTransactions(res.data || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load account statement");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── FILTERED TRANSACTIONS ───────────────── */

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (selectedMonth) {
      filtered = filtered.filter((trx) => {
        const trxDate = new Date(trx.date);

        const month = `${trxDate.getFullYear()}-${String(
          trxDate.getMonth() + 1
        ).padStart(2, "0")}`;

        return month === selectedMonth;
      });
    }

    filtered.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    return filtered;
  }, [transactions, selectedMonth]);

  /* ───────────────── CALCULATIONS ───────────────── */

  const totalPurchases = filteredTransactions
    .filter((trx) => trx.type === "purchase")
    .reduce((sum, trx) => sum + Number(trx.amount || 0), 0);

  const totalPayments = filteredTransactions
    .filter((trx) => trx.type === "payment")
    .reduce((sum, trx) => sum + Number(trx.amount || 0), 0);

  const dueBalance = totalPurchases - totalPayments;

  /* ───────────────── RUNNING BALANCE ───────────────── */

  const statementWithBalance = [...filteredTransactions]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((trx, index, arr) => {
      let runningBalance = 0;

      for (let i = 0; i <= index; i++) {
        if (arr[i].type === "purchase") {
          runningBalance += Number(arr[i].amount || 0);
        }

        if (arr[i].type === "payment") {
          runningBalance -= Number(arr[i].amount || 0);
        }
      }

      return {
        ...trx,
        runningBalance,
      };
    })
    .reverse();

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 p-4 md:p-6">

      {/* HEADER */}

      <div className="flex items-center gap-3 mb-6">

        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700 shadow-sm text-xl">
          <FaFileInvoiceDollar />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Account Statement
          </h1>

          <p className="text-sm text-gray-500">
            View purchases, payments and due balances with CDS
          </p>
        </div>
      </div>

      {/* FILTER BAR */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Filter by Month
            </label>

            <div className="relative">

              <FaCalendarAlt className="absolute top-4 left-4 text-gray-400" />

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        {/* PURCHASES */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Purchases
              </p>

              <h2 className="text-2xl font-bold text-red-600 mt-2">
                Rs. {totalPurchases.toFixed(2)}
              </h2>
            </div>

            <div className="bg-red-100 p-4 rounded-2xl text-red-600 text-2xl">
              <FaShoppingBag />
            </div>
          </div>
        </div>

        {/* PAYMENTS */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Payments
              </p>

              <h2 className="text-2xl font-bold text-emerald-700 mt-2">
                Rs. {totalPayments.toFixed(2)}
              </h2>
            </div>

            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-700 text-2xl">
              <FaMoneyBillWave />
            </div>
          </div>
        </div>

        {/* DUE BALANCE */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Due Balance
              </p>

              <h2
                className={`text-2xl font-bold mt-2
                ${
                  dueBalance > 0
                    ? "text-orange-600"
                    : "text-emerald-700"
                }`}
              >
                Rs. {dueBalance.toFixed(2)}
              </h2>
            </div>

            <div className="bg-orange-100 p-4 rounded-2xl text-orange-700 text-2xl">
              <FaBalanceScale />
            </div>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-emerald-50 border-b border-emerald-100">

              <tr>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  Date
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  Description
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  Batch No
                </th>

                <th className="text-center px-5 py-4 text-sm font-semibold text-gray-700">
                  Type
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  Debit
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  Credit
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  Balance
                </th>
              </tr>
            </thead>

            <tbody>

              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-16 text-gray-500"
                  >
                    Loading account statement...
                  </td>
                </tr>
              ) : statementWithBalance.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-16 text-gray-500"
                  >
                    No transactions found
                  </td>
                </tr>
              ) : (
                statementWithBalance.map((trx) => (
                  <tr
                    key={trx._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >

                    {/* DATE */}

                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(
                        trx.date
                      ).toLocaleDateString()}
                    </td>

                    {/* DESCRIPTION */}

                    <td className="px-5 py-4">

                      <div>
                        <p className="font-medium text-gray-800">
                          {trx.description}
                        </p>

                        {trx.quantity && (
                          <p className="text-xs text-gray-500 mt-1">
                            Qty: {trx.quantity}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* BATCH */}

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {trx.batchNo || "-"}
                    </td>

                    {/* TYPE */}

                    <td className="px-5 py-4 text-center">

                      {trx.type === "purchase" ? (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">

                          <FaArrowUp />

                          Purchase
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">

                          <FaArrowDown />

                          Payment
                        </span>
                      )}
                    </td>

                    {/* DEBIT */}

                    <td className="px-5 py-4 text-right text-sm">

                      {trx.type === "purchase" ? (
                        <span className="font-semibold text-red-600">
                          Rs.{" "}
                          {Number(trx.amount || 0).toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* CREDIT */}

                    <td className="px-5 py-4 text-right text-sm">

                      {trx.type === "payment" ? (
                        <span className="font-semibold text-emerald-700">
                          Rs.{" "}
                          {Number(trx.amount || 0).toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    {/* BALANCE */}

                    <td className="px-5 py-4 text-right">

                      <span
                        className={`font-bold
                        ${
                          trx.runningBalance > 0
                            ? "text-orange-600"
                            : "text-emerald-700"
                        }`}
                      >
                        Rs.{" "}
                        {Number(
                          trx.runningBalance || 0
                        ).toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FOOTER NOTE */}

      <div className="mt-5 text-sm text-gray-500 text-center">
        Statement includes substrate bag purchases and payments made to CDS
      </div>
    </div>
  );
}