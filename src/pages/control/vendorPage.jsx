import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // 🔄 Fetch vendors
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setVendors(res.data);
      setFilteredVendors(res.data);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // 🔍 Search
  useEffect(() => {
    const filtered = vendors.filter((v) =>
      `${v.vendorId} ${v.vendorName} ${v.vendorContact}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
    setFilteredVendors(filtered);
  }, [search, vendors]);

  // 🗑 Delete vendor
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Vendor deleted");
      fetchVendors();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full h-full flex flex-col p-4">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <div>
          <h1 className="text-xl font-semibold">🏢 Vendor List</h1>
          <p className="text-sm text-gray-500">Manage your vendors</p>
        </div>

        <Link
          to="/add-vendor"
          className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg"
        >
          ➕ Add Vendor
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by ID, Name, Contact..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-1/3 p-2 border rounded-lg"
        />
      </div>

      {/* Table (Desktop) */}
      <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Contact</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Email</th>
              <th className="p-3">Due</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredVendors.map((v) => (
              <tr key={v._id} className="border-t hover:bg-gray-50">
                <td className="p-3">{v.vendorId}</td>
                <td className="p-3">{v.vendorName}</td>
                <td className="p-3">{v.vendorContact}</td>
                <td className="p-3">{v.vendorPhone}</td>
                <td className="p-3">{v.vendorEmail}</td>
                <td className="p-3 text-red-600 font-semibold">
                  {v.vendorDueAmount}
                </td>

                <td className="p-3 flex justify-center gap-2">
                  <button
                    onClick={() =>
                      navigate(`/edit-vendor`, { state: { vendor: v } })
                    }
                    className="text-lg px-2 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white transition"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(v._id)}
                    className="text-lg px-2 py-1 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white transition"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredVendors.length === 0 && (
          <p className="text-center p-4 text-gray-500">
            No vendors found
          </p>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-3">
        {filteredVendors.map((v) => (
          <div
            key={v._id}
            className="border rounded-lg p-3 shadow-sm bg-white"
          >
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">{v.vendorName}</p>
                <p className="text-sm text-gray-500">{v.vendorId}</p>
              </div>
              <p className="text-red-600 font-semibold">
                {v.vendorDueAmount}
              </p>
            </div>

            <p className="text-sm mt-2">📞 {v.vendorPhone}</p>
            <p className="text-sm">✉️ {v.vendorEmail}</p>

            <div className="flex gap-2 mt-3">
              <button
                onClick={() =>
                  navigate(`/edit-vendor`, { state: { vendor: v } })
                }
                className="flex-1 bg-blue-500 text-white py-1 rounded"
              >
                < FaEdit className="mx-auto" />
              </button>

              <button
                onClick={() => handleDelete(v._id)}
                className="text-lg flex-1 bg-red-500 text-white py-1 rounded"
              >
                <FaTrash className="mx-auto" />
              </button>
            </div>
          </div>
        ))}

        {filteredVendors.length === 0 && (
          <p className="text-center text-gray-500">No vendors found</p>
        )}
      </div>
    </div>
  );
}