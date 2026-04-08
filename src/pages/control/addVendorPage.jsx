import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function AddVendorPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // State
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorDueAmount, setVendorDueAmount] = useState(0);
  const [vendorNote, setVendorNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // ✅ Add Vendor
  const handleAddVendor = async () => {
    if (!token) return toast.error("Please log in first");

    // Validation
    if (!vendorName || !vendorContact || !vendorEmail || !vendorPhone) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsAdding(true);

      const newVendor = {
        vendorId: vendorId || undefined,
        vendorName,
        vendorAddress,
        vendorContact,
        vendorEmail,
        vendorPhone,
        vendorDueAmount: Number(vendorDueAmount) || 0,
        vendorNote,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor`,
        newVendor,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Vendor added successfully!");
      navigate("/vendors", { replace: true });

    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add vendor");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-4 bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">🏢➕ Add New Vendor</h1>
          <p className="text-sm text-gray-500">
            Enter vendor details
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddVendor}
            disabled={isAdding}
            className={`px-6 py-2 rounded-lg text-white ${
              isAdding
                ? "bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAdding ? "Adding..." : "Add Vendor"}
          </button>

          <Link
            to="/vendors"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow border space-y-4">

        {/* Vendor ID */}
        <div>
          <label className="text-sm font-medium">Vendor ID</label>
          <input
            type="text"
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            placeholder="Auto or manual (e.g. VND-001)"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium">Vendor Name *</label>
          <input
            type="text"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Address */}
        <div>
          <label className="text-sm font-medium">Address</label>
          <input
            type="text"
            value={vendorAddress}
            onChange={(e) => setVendorAddress(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Contact */}
        <div>
          <label className="text-sm font-medium">Contact Person *</label>
          <input
            type="text"
            value={vendorContact}
            onChange={(e) => setVendorContact(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Phone + Email */}
        <div className="flex gap-3">
          <div className="w-1/2">
            <label className="text-sm font-medium">Phone *</label>
            <input
              type="text"
              value={vendorPhone}
              onChange={(e) => setVendorPhone(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div className="w-1/2">
            <label className="text-sm font-medium">Email *</label>
            <input
              type="email"
              value={vendorEmail}
              onChange={(e) => setVendorEmail(e.target.value)}
              className="w-full p-2 border rounded-lg"
            />
          </div>
        </div>

        {/* Due Amount */}
        <div>
          <label className="text-sm font-medium">Due Amount</label>
          <input
            type="number"
            value={vendorDueAmount}
            onChange={(e) => setVendorDueAmount(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={vendorNote}
            onChange={(e) => setVendorNote(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

      </div>
    </div>
  );
}