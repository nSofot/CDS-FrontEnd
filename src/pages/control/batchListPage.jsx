import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Search,
  RefreshCw,
  ArrowLeft,
  Eye,
  Package,
} from "lucide-react";

export default function BatchListPage() {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const token = localStorage.getItem("token");

  const fetchBatches = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/batch`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBatches(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) => {
      const matchesSearch =
        batch.batchNo
          ?.toLowerCase()
          .includes(search.toLowerCase()) ||
        batch.status
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        batch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [batches, search, statusFilter]);

  const summary = useMemo(() => {
    return {
      total: batches.length,

      substrate: batches.filter(
        (b) => b.status === "Substrate"
      ).length,

      sterilized: batches.filter(
        (b) => b.status === "Sterilized"
      ).length,

      inoculated: batches.filter(
        (b) => b.status === "Inoculated"
      ).length,

      incubating: batches.filter(
        (b) => b.status === "Incubating"
      ).length,
    };
  }, [batches]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Substrate":
        return "bg-orange-100 text-orange-700";

      case "Sterilized":
        return "bg-yellow-100 text-yellow-700";

      case "Inoculated":
        return "bg-purple-100 text-purple-700";

      case "Incubating":
        return "bg-indigo-100 text-indigo-700";

      case "Fruiting":
        return "bg-pink-100 text-pink-700";

      case "Completed":
        return "bg-green-100 text-green-700";

      case "Rejected":
        return "bg-red-100 text-red-700";

      case "bagSold":
      case "Sold":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Batch Management
              </h1>

              <p className="text-sm text-gray-500">
                Manage, track and monitor all production batches
              </p>
            </div>

            <button
              onClick={() => navigate("/control")}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl transition"
            >
              <ArrowLeft size={18} />
              Back
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          <SummaryCard
            title="Total"
            value={summary.total}
            color="text-blue-600"
          />

          <SummaryCard
            title="Substrate"
            value={summary.substrate}
            color="text-orange-600"
          />

          <SummaryCard
            title="Sterilized"
            value={summary.sterilized}
            color="text-yellow-600"
          />

          <SummaryCard
            title="Inoculated"
            value={summary.inoculated}
            color="text-purple-600"
          />

          <SummaryCard
            title="Incubating"
            value={summary.incubating}
            color="text-indigo-600"
          />
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search batch number or status..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 rounded-xl border bg-gray-50 focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="All">All Status</option>
              <option value="Substrate">Substrate</option>
              <option value="Sterilized">Sterilized</option>
              <option value="Inoculated">Inoculated</option>
              <option value="Incubating">Incubating</option>
              <option value="Fruiting">Fruiting</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="bagSold">Bag Sold</option>
            </select>

            <button
              onClick={fetchBatches}
              className="flex items-center justify-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 rounded-xl py-3 hover:bg-orange-100 transition"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
            <Package
              size={40}
              className="mx-auto mb-3 text-orange-500"
            />
            <p className="text-gray-500">
              Loading batches...
            </p>
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredBatches.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border p-10 text-center">
            <Package
              size={40}
              className="mx-auto mb-3 text-gray-400"
            />
            <p className="text-gray-500">
              No batches found
            </p>
          </div>
        )}

        {/* MOBILE VIEW */}
        {!loading && filteredBatches.length > 0 && (
          <div className="lg:hidden space-y-4">
            {filteredBatches.map((batch) => (
              <div
                key={batch._id}
                className="bg-white rounded-2xl border shadow-sm p-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      {batch.batchNo}
                    </h3>

                    <p className="text-sm text-gray-500">
                      {new Date(
                        batch.batchDate
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusStyle(
                      batch.status
                    )}`}
                  >
                    {batch.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <InfoItem
                    label="Bags"
                    value={batch.numberOfBags}
                  />

                  <InfoItem
                    label="Cost"
                    value={`Rs. ${Number(
                      batch.totalCostValue || 0
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`}
                  />

                  <InfoItem
                    label="Value"
                    value={`Rs. ${Number(
                      batch.totalJobValue || 0
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}`}
                  />
                </div>

                <button
                  onClick={() =>
                    navigate(
                      `/control/view-batch/${batch.batchNo}`
                    )
                  }
                  className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition"
                >
                  <Eye size={16} />
                  View Batch
                </button>
              </div>
            ))}
          </div>
        )}

        {/* DESKTOP TABLE */}
        {!loading && filteredBatches.length > 0 && (
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50">
                  <tr className="text-left text-sm text-gray-700">
                    <th className="px-6 py-4">Batch No</th>
                    <th className="px-6 py-4">Batch Date</th>
                    <th className="px-6 py-4">Bags</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total Cost</th>
                    <th className="px-6 py-4">Total Value</th>
                    <th className="px-6 py-4 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr
                      key={batch._id}
                      className="border-t hover:bg-orange-50 transition"
                    >
                      <td className="px-6 py-4 font-semibold">
                        {batch.batchNo}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(
                          batch.batchDate
                        ).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">
                        {batch.numberOfBags}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(
                            batch.status
                          )}`}
                        >
                          {batch.status}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        Rs.{" "}
                        {Number(
                          batch.totalCostValue || 0
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-6 py-4">
                        Rs.{" "}
                        {Number(
                          batch.totalJobValue || 0
                        ).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() =>
                            navigate(
                              `/control/view-batch/${batch.batchNo}`
                            )
                          }
                          className="inline-flex items-center gap-2 px-4 py-2 border rounded-xl hover:bg-gray-100 transition"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ title, value, color }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 text-center">
      <p className={`text-2xl font-bold ${color}`}>
        {value}
      </p>

      <p className="text-sm text-gray-500 mt-1">
        {title}
      </p>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">
        {label}
      </p>

      <p className="font-semibold text-gray-800">
        {value}
      </p>
    </div>
  );
}