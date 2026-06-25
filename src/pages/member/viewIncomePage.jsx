import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaMoneyBillWave,
  FaCalendarDay,
  FaCalendarWeek,
  FaCalendarAlt,
  FaList,
  FaSearch,
  FaLeaf,
} from "react-icons/fa";

export default function ViewIncomePage() {
  const [loading, setLoading] = useState(false);

  const [sales, setSales] = useState([]);

  const [filterType, setFilterType] = useState("daily");

  const [search, setSearch] = useState("");

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  /* ───────────────── FETCH SALES ───────────────── */

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`
      );


      // SAFE ARRAY SET
      if (Array.isArray(res.data)) {
        setSales(res.data);
      } else if (Array.isArray(res.data.data)) {
        setSales(res.data.data);
      } else {
        setSales([]);
      }

    } catch (err) {
      console.log(err);

      toast.error("Failed to load income records");

      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── DATE HELPERS ───────────────── */

  const isSameDay = (date1, date2) => {
    return (
      new Date(date1).toDateString() ===
      new Date(date2).toDateString()
    );
  };

  const isCurrentWeek = (date) => {
    const today = new Date(selectedDate);

    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay());

    const lastDay = new Date(firstDay);
    lastDay.setDate(firstDay.getDate() + 6);

    const checkDate = new Date(date);

    return checkDate >= firstDay && checkDate <= lastDay;
  };

  const isCurrentMonth = (date) => {
    const selected = new Date(selectedDate);
    const check = new Date(date);

    return (
      selected.getMonth() === check.getMonth() &&
      selected.getFullYear() === check.getFullYear()
    );
  };

  /* ───────────────── FILTERED SALES ───────────────── */

  const filteredSales = useMemo(() => {
    let filtered = Array.isArray(sales) ? [...sales] : [];

    /* FILTER BY TYPE */

    if (filterType === "daily") {
      filtered = filtered.filter((sale) =>
        isSameDay(sale.saleDate, selectedDate)
      );
    }

    if (filterType === "weekly") {
      filtered = filtered.filter((sale) =>
        isCurrentWeek(sale.saleDate)
      );
    }

    if (filterType === "monthly") {
      filtered = filtered.filter((sale) =>
        isCurrentMonth(sale.saleDate)
      );
    }

    /* SEARCH */

    if (search.trim()) {
      filtered = filtered.filter(
        (sale) =>
          sale.customerName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          sale.mushroomBatchNo
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          sale.memberName
            ?.toLowerCase()
            .includes(search.toLowerCase())
      );
    }

    /* SORT */

    filtered.sort(
      (a, b) => new Date(b.saleDate) - new Date(a.saleDate)
    );

    return filtered;
  }, [sales, filterType, search, selectedDate]);

  /* ───────────────── TOTALS ───────────────── */

  const totalIncome = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.totalAmount || 0),
    0
  );

  const totalPackets = filteredSales.reduce(
    (sum, sale) => sum + Number(sale.quantity || 0),
    0
  );

  /* ───────────────── FILTER BUTTON ───────────────── */

  const FilterButton = ({ type, label, icon }) => (
    <button
      onClick={() => setFilterType(type)}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium
      ${
        filterType === type
          ? "bg-emerald-600 text-white shadow-sm"
          : "bg-white border border-gray-200 text-gray-600 hover:bg-emerald-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 p-4 md:p-6">

      {/* HEADER */}

      <div className="flex items-center gap-3 mb-6">

        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700 shadow-sm text-xl">
          <FaMoneyBillWave />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Income Report
          </h1>

          <p className="text-sm text-gray-500">
            View mushroom sales income records
          </p>
        </div>
      </div>

      {/* FILTERS */}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">

        <div className="flex flex-wrap gap-3 mb-5">

          <FilterButton
            type="daily"
            label="Daily"
            icon={<FaCalendarDay />}
          />

          <FilterButton
            type="weekly"
            label="Weekly"
            icon={<FaCalendarWeek />}
          />

          <FilterButton
            type="monthly"
            label="Monthly"
            icon={<FaCalendarAlt />}
          />

          <FilterButton
            type="all"
            label="All"
            icon={<FaList />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* DATE */}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Select Date
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          {/* SEARCH */}

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Search
            </label>

            <div className="relative">
              <FaSearch className="absolute top-4 left-4 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search customer, batch or member..."
                className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        {/* TOTAL INCOME */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Income
              </p>

              <h2 className="text-2xl font-bold text-emerald-700 mt-2">
                Rs. {totalIncome.toFixed(2)}
              </h2>
            </div>

            <div className="bg-emerald-100 p-4 rounded-2xl text-emerald-700 text-2xl">
              <FaMoneyBillWave />
            </div>
          </div>
        </div>

        {/* TOTAL SALES */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Sales
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {filteredSales.length}
              </h2>
            </div>

            <div className="bg-blue-100 p-4 rounded-2xl text-blue-700 text-2xl">
              <FaLeaf />
            </div>
          </div>
        </div>

        {/* TOTAL PACKETS */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Packets Sold
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-2">
                {totalPackets}
              </h2>
            </div>

            <div className="bg-orange-100 p-4 rounded-2xl text-orange-700 text-2xl">
              <FaLeaf />
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
                  Customer
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  Member
                </th>

                <th className="text-left px-5 py-4 text-sm font-semibold text-gray-700">
                  Batch No
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  Qty
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  Price
                </th>

                <th className="text-right px-5 py-4 text-sm font-semibold text-gray-700">
                  Amount
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
                    Loading income records...
                  </td>
                </tr>
              ) : filteredSales.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-16 text-gray-500"
                  >
                    No income records found
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale._id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-all"
                  >

                    <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                      {new Date(
                        sale.saleDate
                      ).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-gray-800">
                      {sale.customerName}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {sale.memberName}
                    </td>

                    <td className="px-5 py-4 text-sm text-gray-700">
                      {sale.mushroomBatchNo}
                    </td>

                    <td className="px-5 py-4 text-sm text-right text-gray-700">
                      {sale.quantity}
                    </td>

                    <td className="px-5 py-4 text-sm text-right text-gray-700">
                      Rs.{" "}
                      {Number(
                        sale.pricePerPacket || 0
                      ).toFixed(2)}
                    </td>

                    <td className="px-5 py-4 text-right">

                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-semibold">
                        Rs.{" "}
                        {Number(
                          sale.totalAmount || 0
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
    </div>
  );
}