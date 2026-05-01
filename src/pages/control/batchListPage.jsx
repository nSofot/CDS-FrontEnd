import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Eye, Search, RefreshCw, ArrowLeft } from "lucide-react";

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
        batch.batchNo?.toLowerCase().includes(search.toLowerCase()) ||
        batch.status?.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || batch.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [batches, search, statusFilter]);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Substrate":
        return "bg-blue-100 text-blue-700";
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
      case "Sold":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Batch List</h1>
            <p className="text-sm text-gray-500">
              Manage and monitor all production batches
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
          >
            <ArrowLeft size={20} />
            Back
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by batch no or status"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl outline-none focus:ring-2 focus:ring-black"
            >
              <option value="All">All Status</option>
              <option value="Substrate">Substrate</option>
              <option value="Sterilized">Sterilized</option>
              <option value="Inoculated">Inoculated</option>
              <option value="Incubating">Incubating</option>
              <option value="Fruiting">Fruiting</option>
              <option value="Completed">Completed</option>
              <option value="Rejected">Rejected</option>
              <option value="Sold">Sold</option>
            </select>

            <button
              onClick={fetchBatches}
              className="flex items-center justify-center gap-2 border rounded-xl px-4 py-3 hover:bg-gray-100"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-500">
              Loading batches...
            </div>
          ) : filteredBatches.length === 0 ? (
            <div className="p-10 text-center text-gray-500">
              No batches found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 text-left text-sm text-gray-600">
                  <tr>
                    <th className="px-6 py-4">Batch No</th>
                    <th className="px-6 py-4">Batch Date</th>
                    <th className="px-6 py-4">Bags</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Total Cost</th>
                    <th className="px-6 py-4">Total Value</th>
                    <th className="px-6 py-4 text-center">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBatches.map((batch) => (
                    <tr
                      key={batch._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {batch.batchNo}
                      </td>

                      <td className="px-6 py-4">
                        {new Date(batch.batchDate).toLocaleDateString()}
                      </td>

                      <td className="px-6 py-4">{batch.numberOfBags}</td>

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
                        Rs. {Number(batch.totalCostValue || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        Rs. {Number(batch.totalJobValue || 0).toFixed(2)}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() =>
                              navigate(`/view-batch/${batch.batchNo}`)
                            }
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-gray-100"
                          >
                            <Eye size={16} />
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
