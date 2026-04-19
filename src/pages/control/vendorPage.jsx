import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import Modal from "react-modal";

Modal.setAppElement("#root");

export default function VendorListPage() {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

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

      const data = res.data.data || res.data || [];
      setVendors(data);
      setFilteredVendors(data);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // 🔍 Search filter
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
    if (!window.confirm("Are you sure you want to delete this vendor?"))
      return;

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
          <p className="text-sm text-gray-600">
            View and manage your vendors
          </p>
        </div>

        {/* <Link
          to="/add-vendor"
          className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
        >
          + Add Vendor
        </Link> */}
        <div className="flex gap-2">
            <button
              onClick={() => navigate("/add-vendor")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              + Add Vendor
            </button>    

            <button
              onClick={() => navigate("/vendor-ledger")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              Vendor Ledger
            </button>

            <button
              onClick={() => navigate("/")}
              className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              ← Go Back
            </button>
        </div>

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

      {/* Loading */}
      {loading && (
        <p className="text-center text-gray-500 py-4">Loading vendors...</p>
      )}

      {/* Desktop Table */}
      {!loading && (
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
                <tr
                  key={v._id}
                  onClick={() => {
                    setActiveRecord(v);
                    setIsModalOpen(true);
                  }}
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="p-3">{v.vendorId}</td>
                  <td className="p-3">{v.vendorName}</td>
                  <td className="p-3">{v.vendorContact}</td>
                  <td className="p-3">{v.vendorPhone}</td>
                  <td className="p-3">{v.vendorEmail}</td>
                  <td className="p-3 text-red-600 font-semibold">
                    Rs. {v.vendorDueAmount || 0}
                  </td>

                  <td className="p-3 flex justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/edit-vendor`, { state: { vendor: v } });
                      }}
                      className="text-blue-600 hover:bg-blue-600 hover:text-white px-2 py-1 rounded"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(v._id);
                      }}
                      className="text-red-600 hover:bg-red-600 hover:text-white px-2 py-1 rounded"
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
      )}

      {/* Mobile Cards */}
      {!loading && (
        <div className="md:hidden flex flex-col gap-3">
          {filteredVendors.map((v) => (
            <div
              key={v._id}
              onClick={() => {
                setActiveRecord(v);
                setIsModalOpen(true);
              }}
              className="border rounded-lg p-3 shadow-sm bg-white cursor-pointer"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{v.vendorName}</p>
                  <p className="text-sm text-gray-500">{v.vendorId}</p>
                </div>
                <p className="text-red-600 font-semibold">
                  Rs. {v.vendorDueAmount || 0}
                </p>
              </div>

              <p className="text-sm mt-2">📞 {v.vendorPhone}</p>
              <p className="text-sm">✉️ {v.vendorEmail}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/edit-vendor`, { state: { vendor: v } });
                  }}
                  className="flex-1 bg-blue-500 text-white py-1 rounded"
                >
                  <FaEdit className="mx-auto" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(v._id);
                  }}
                  className="flex-1 bg-red-500 text-white py-1 rounded"
                >
                  <FaTrash className="mx-auto" />
                </button>
              </div>
            </div>
          ))}

          {filteredVendors.length === 0 && (
            <p className="text-center text-gray-500">
              No vendors found
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center p-3"
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5"
      >
        {activeRecord && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-600">
                Vendor Details
              </h2>
              <button onClick={() => setIsModalOpen(false)}>✖</button>
            </div>

            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Vendor ID", activeRecord.vendorId],
                  ["Name", activeRecord.vendorName],
                  [
                    "Address",
                    Array.isArray(activeRecord.vendorAddress)
                      ? activeRecord.vendorAddress
                          .filter(Boolean)
                          .join(", ")
                      : activeRecord.vendorAddress,
                  ],
                  ["Contact", activeRecord.vendorContact],
                  ["Mobile", activeRecord.vendorPhone],
                  ["Email", activeRecord.vendorEmail],
                  ["Note", activeRecord.vendorNote || "None"],
                  [
                    "Due Amount",
                    activeRecord.vendorDueAmount
                      ? `Rs. ${activeRecord.vendorDueAmount}`
                      : "None",
                  ],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b">
                    <td className="py-2 font-medium text-orange-600">
                      {label}
                    </td>
                    <td className="py-2 text-right">
                      {value || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
}