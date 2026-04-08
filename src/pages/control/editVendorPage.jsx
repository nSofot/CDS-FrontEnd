import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function EditVendorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // States
  const [vendor, setVendor] = useState({});
  const [vendorId, setVendorId] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [vendorAddress, setVendorAddress] = useState("");
  const [vendorContact, setVendorContact] = useState("");
  const [vendorEmail, setVendorEmail] = useState("");
  const [vendorPhone, setVendorPhone] = useState("");
  const [vendorDueAmount, setVendorDueAmount] = useState(0);
  const [vendorNote, setVendorNote] = useState("");

  // 🔍 Fetch vendor
  const fetchVendor = async (id) => {
    if (!id) return;

    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;

      setVendor(data);
      setVendorId(data.vendorId || "");
      setVendorName(data.vendorName || "");
      setVendorAddress(data.vendorAddress || "");
      setVendorContact(data.vendorContact || "");
      setVendorEmail(data.vendorEmail || "");
      setVendorPhone(data.vendorPhone || "");
      setVendorDueAmount(data.vendorDueAmount || 0);
      setVendorNote(data.vendorNote || "");
    } catch (err) {
      toast.error("Failed to load vendor");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Load data
  useEffect(() => {
    if (location.state?.vendor) {
      const data = location.state.vendor;

      setVendor(data);
      setVendorId(data.vendorId || "");
      setVendorName(data.vendorName || "");
      setVendorAddress(data.vendorAddress || "");
      setVendorContact(data.vendorContact || "");
      setVendorEmail(data.vendorEmail || "");
      setVendorPhone(data.vendorPhone || "");
      setVendorDueAmount(data.vendorDueAmount || 0);
      setVendorNote(data.vendorNote || "");
    } else {
      // fallback (refresh)
      const idFromUrl = window.location.search.split("=")[1];
      if (idFromUrl) fetchVendor(idFromUrl);
    }
  }, [location.state]);

  // ✏️ Update Vendor
  const handleUpdateVendor = async () => {
    if (!vendorName || !vendorContact || !vendorEmail || !vendorPhone) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsUpdating(true);

      const updatedVendor = {
        vendorId,
        vendorName,
        vendorAddress,
        vendorContact,
        vendorEmail,
        vendorPhone,
        vendorDueAmount: Number(vendorDueAmount) || 0,
        vendorNote,
      };

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${vendor._id}`,
        updatedVendor,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Vendor updated successfully!");
      navigate("/vendors", { replace: true });

    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col p-4 bg-gray-50">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-xl font-semibold">✏️ Edit Vendor</h1>
          <p className="text-sm text-gray-500">
            Update vendor information
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUpdateVendor}
            disabled={isUpdating}
            className={`px-6 py-2 rounded-lg text-white ${
              isUpdating
                ? "bg-gray-500"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isUpdating ? "Updating..." : "Update Vendor"}
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
            className="w-full p-2 border rounded-lg"
            disabled
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