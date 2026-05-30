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
const memberId = "0001";
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
        }/api/member-transaction/member/${memberId}`
      );

      setTransactions(
        Array.isArray(res.data)
          ? res.data.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : []
      );

    } catch (err) {
      console.log(err);

      toast.error("ගිණුම් ප්‍රකාශය පූරණය කිරීමට අසමත් විය.");
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
    .filter((trx) => trx.isCredit === true)
    .reduce((sum, trx) => sum + Number(trx.amount || 0), 0);

  const totalPayments = filteredTransactions
    .filter((trx) => trx.isCredit === false)
    .reduce((sum, trx) => sum + Number(trx.amount || 0), 0);

  const dueBalance = totalPurchases - totalPayments;

  /* ───────────────── RUNNING BALANCE ───────────────── */

  const statementWithBalance = [...filteredTransactions]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((trx, index, arr) => {
      let runningBalance = 0;

      for (let i = 0; i <= index; i++) {
        if (arr[i].isCredit === true) {
          runningBalance += Number(arr[i].amount || 0);
        }

        if (arr[i].isCredit === false) {
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
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-3 sm:p-4 md:p-6">

      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5 md:mb-6">

        <div className="w-14 h-14 flex items-center justify-center bg-emerald-100 rounded-2xl text-emerald-700 shadow-sm text-2xl shrink-0">
          <FaFileInvoiceDollar />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 break-words">
            ගිණුම් ප්‍රකාශය
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-relaxed">
            CDS සමඟ මිලදී ගැනීම්, ගෙවීම් සහ නියමිත ශේෂයන් බලන්න
          </p>
        </div>
      </div>

      {/* FILTER BAR */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 mb-5 md:mb-6">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              මාසය අනුව පෙරහන් කරන්න
            </label>

            <div className="relative">

              <FaCalendarAlt className="absolute top-1/2 -translate-y-1/2 left-4 text-gray-400" />

              <input
                type="month"
                value={selectedMonth}
                onChange={(e) =>
                  setSelectedMonth(e.target.value)
                }
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm outline-none bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-400 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 mb-5 md:mb-6">

        {/* PURCHASES */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">

          <div className="flex items-center justify-between gap-3">

            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                මුළු මිලදී ගැනීම්
              </p>

              <h2 className="text-lg sm:text-2xl font-bold text-red-600 mt-2 break-words">
                රු. {totalPurchases.toFixed(2)}
              </h2>
            </div>

            <div className="w-14 h-14 flex items-center justify-center bg-red-100 rounded-2xl text-red-600 text-2xl shrink-0">
              <FaShoppingBag />
            </div>
          </div>
        </div>

        {/* PAYMENTS */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all">

          <div className="flex items-center justify-between gap-3">

            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                මුළු ගෙවීම්
              </p>

              <h2 className="text-lg sm:text-2xl font-bold text-emerald-700 mt-2 break-words">
                රු. {totalPayments.toFixed(2)}
              </h2>
            </div>

            <div className="w-14 h-14 flex items-center justify-center bg-emerald-100 rounded-2xl text-emerald-700 text-2xl shrink-0">
              <FaMoneyBillWave />
            </div>
          </div>
        </div>

        {/* DUE BALANCE */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 hover:shadow-md transition-all sm:col-span-2 lg:col-span-1">

          <div className="flex items-center justify-between gap-3">

            <div className="min-w-0">
              <p className="text-sm text-gray-500">
                නියමිත ශේෂය
              </p>

              <h2
                className={`text-lg sm:text-2xl font-bold mt-2 break-words
                ${
                  dueBalance > 0
                    ? "text-orange-600"
                    : "text-emerald-700"
                }`}
              >
                රු. {dueBalance.toFixed(2)}
              </h2>
            </div>

            <div className="w-14 h-14 flex items-center justify-center bg-orange-100 rounded-2xl text-orange-700 text-2xl shrink-0">
              <FaBalanceScale />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE CARD VIEW */}

      <div className="block lg:hidden space-y-4">

        {loading ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
            ගිණුම් ප්‍රකාශය පූරණය වෙමින් පවතී ...
          </div>
        ) : statementWithBalance.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
            ගනුදෙනු කිසිවක් හමු නොවීය.
          </div>
        ) : (
          statementWithBalance.map((trx) => (
            <div
              key={trx._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4"
            >

              {/* TOP */}

              <div className="flex items-start justify-between gap-3 mb-3">

                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800">
                    {trx.trxId || "-"}
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(
                      trx.trxDate
                    ).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  {trx.isCredit === true ? (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      <FaArrowUp />
                      Debit
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                      <FaArrowDown />
                      Credit
                    </span>
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}

              <div className="mb-4">
                <p className="text-sm text-gray-800 font-medium leading-relaxed">
                  {trx.description || "-"}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Ref : {trx.referenceId || "-"}
                </p>
              </div>

              {/* VALUES */}

              <div className="grid grid-cols-3 gap-3 text-center">

                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-[11px] text-gray-500 mb-1">
                    හර
                  </p>

                  <p className="text-sm font-bold text-red-600 break-words">
                    {trx.isCredit === true
                      ? Number(
                          trx.amount || 0
                        ).toFixed(2)
                      : "-"}
                  </p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-[11px] text-gray-500 mb-1">
                    බැර
                  </p>

                  <p className="text-sm font-bold text-emerald-700 break-words">
                    {trx.isCredit === false
                      ? Number(
                          trx.amount || 0
                        ).toFixed(2)
                      : "-"}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-xl p-3">
                  <p className="text-[11px] text-gray-500 mb-1">
                    ශේෂය
                  </p>

                  <p
                    className={`text-sm font-bold break-words
                    ${
                      trx.runningBalance > 0
                        ? "text-orange-600"
                        : "text-emerald-700"
                    }`}
                  >
                    {Number(
                      trx.runningBalance || 0
                    ).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}

      <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead className="bg-emerald-50 border-b border-emerald-100">

              <tr>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  දිනය
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  ගනුදෙනු අංකය
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  යොමු අංකය
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  විස්තරය
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  හර
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  බැර
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  ශේෂය
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
                    ගිණුම් ප්‍රකාශය පූරණය වෙමින් පවතී ...
                  </td>
                </tr>
              ) : statementWithBalance.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-16 text-gray-500"
                  >
                    ගනුදෙනු කිසිවක් හමු නොවීය.
                  </td>
                </tr>
              ) : (
                statementWithBalance.map((trx) => (
                  <tr
                    key={trx._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >

                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(
                        trx.trxDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      <p className="font-medium text-gray-800">
                        {trx.trxId || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {trx.referenceId || "-"}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {trx.description || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-right text-sm">

                      {trx.isCredit === true ? (
                        <span className="font-semibold text-red-600">
                          Rs.{" "}
                          {Number(trx.amount || 0).toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

                    <td className="px-5 py-4 text-right text-sm">

                      {trx.isCredit === false ? (
                        <span className="font-semibold text-emerald-700">
                          Rs.{" "}
                          {Number(trx.amount || 0).toFixed(2)}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>

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

      {/* FOOTER */}

      <div className="mt-5 text-xs sm:text-sm text-gray-500 text-center leading-relaxed px-2">
        ප්‍රකාශයට උපස්ථර බෑග් මිලදී ගැනීම් සහ CDS වෙත කරන ලද ගෙවීම් ඇතුළත් වේ.
      </div>
    </div>
  );
}