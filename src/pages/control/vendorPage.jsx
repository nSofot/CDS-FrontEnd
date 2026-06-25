import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
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

  const fetchVendors = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = res.data.data || res.data || [];
      setVendors(data);
      setFilteredVendors(data);
    } catch {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();

    setFilteredVendors(
      vendors.filter((v) =>
        `${v.vendorId} ${v.vendorName} ${v.vendorPhone} ${v.vendorEmail}`
          .toLowerCase()
          .includes(q)
      )
    );
  }, [search, vendors]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this vendor?")) return;

    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Vendor deleted");
      fetchVendors();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-5">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">🏢 Vendors</h1>
          <p className="text-gray-500 text-sm">
            Manage supplier/vendor directory
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/control/add-vendor")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 w-fit"
          >
            <FaPlus /> Add Vendor
          </button>

          <button
            onClick={() => navigate("/control")}
            className="px-5 py-2 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
          >
            ← Go Back
        </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <FaSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search vendor by ID, name, phone..."
          className="w-full md:w-1/3 pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500 py-6">Loading vendors...</p>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="hidden md:block bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-orange-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-right">Due</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredVendors.map((v, i) => (
                <tr
                  key={v._id}
                  onClick={() => {
                    setActiveRecord(v);
                    setIsModalOpen(true);
                  }}
                  className={`border-t cursor-pointer hover:bg-orange-50 ${
                    i % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <td className="p-3 font-medium">{v.vendorId}</td>
                  <td className="p-3">{v.vendorName}</td>
                  <td className="p-3">{v.vendorPhone}</td>
                  <td className="p-3">{v.vendorEmail}</td>

                  <td className="p-3 text-right">
                    <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold">
                      Rs. {v.vendorDueAmount || 0}
                    </span>
                  </td>

                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/control/edit-vendor", {
                            state: { vendor: v },
                          });
                        }}
                        className="text-blue-600 hover:bg-blue-100 p-2 rounded"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(v._id);
                        }}
                        className="text-red-600 hover:bg-red-100 p-2 rounded"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredVendors.length === 0 && (
            <p className="text-center py-6 text-gray-500">
              No vendors found
            </p>
          )}
        </div>
      )}

      {/* MOBILE CARDS */}
      {!loading && (
        <div className="md:hidden space-y-3">
          {filteredVendors.map((v) => (
            <div
              key={v._id}
              onClick={() => {
                setActiveRecord(v);
                setIsModalOpen(true);
              }}
              className="bg-white border rounded-xl p-4 shadow-sm active:scale-[0.99] transition"
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{v.vendorName}</p>
                  <p className="text-xs text-gray-500">{v.vendorId}</p>
                </div>

                <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs">
                  Rs. {v.vendorDueAmount || 0}
                </span>
              </div>

              <p className="text-sm mt-2 text-gray-600">📞 {v.vendorPhone}</p>
              <p className="text-sm text-gray-600">✉️ {v.vendorEmail}</p>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/control/edit-vendor", {
                      state: { vendor: v },
                    });
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
            <p className="text-center text-gray-500">No vendors found</p>
          )}
        </div>
      )}

      {/* MODAL (polished) */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center p-4"
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-5"
      >
        {activeRecord && (
          <div className="space-y-4">
            <div className="flex justify-between">
              <h2 className="text-lg font-bold text-orange-600">
                Vendor Details
              </h2>
              <button onClick={() => setIsModalOpen(false)}>✕</button>
            </div>

            <div className="space-y-2 text-sm">
              <p><b>ID:</b> {activeRecord.vendorId}</p>
              <p><b>Name:</b> {activeRecord.vendorName}</p>
              <p><b>Phone:</b> {activeRecord.vendorPhone}</p>
              <p><b>Email:</b> {activeRecord.vendorEmail}</p>
              <p className="text-red-600 font-semibold">
                Due: Rs. {activeRecord.vendorDueAmount || 0}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}