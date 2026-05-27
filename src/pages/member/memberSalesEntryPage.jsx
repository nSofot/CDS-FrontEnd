import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaLeaf,
  FaSave,
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaMoneyBillWave,
  FaBoxes,
} from "react-icons/fa";

export default function MemberSalesEntryPage() {
  const [loading, setLoading] = useState(false);

  const [batches, setBatches] = useState([]);

  const [search, setSearch] = useState("");

  const [selectedBatch, setSelectedBatch] = useState(null);

  const [saleDate, setSaleDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [customerName, setCustomerName] = useState("");

  const [quantity, setQuantity] = useState("");

  const [pricePerPacket, setPricePerPacket] = useState("");

  const [remarks, setRemarks] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  /* ───────────────── FETCH AVAILABLE MUSHROOM BATCHES ───────────────── */

  useEffect(() => {
    fetchMushroomBatches();
  }, []);

  const fetchMushroomBatches = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/productions/mushroom-batches`
      );

      setBatches(res.data || []);
    } catch (err) {
      console.log(err);

      toast.error("Failed to load mushroom batches");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── FILTERED BATCHES ───────────────── */

  const filteredBatches = useMemo(() => {
    return batches.filter((batch) =>
      batch.mushroomBatchNo
        ?.toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [batches, search]);

  /* ───────────────── CALCULATIONS ───────────────── */

  const totalAmount =
    Number(quantity || 0) * Number(pricePerPacket || 0);

  /* ───────────────── SELECT BATCH ───────────────── */

  const selectBatch = (batch) => {
    setSelectedBatch(batch);
  };

  /* ───────────────── SAVE SALE ───────────────── */

  const saveSale = async () => {
    try {
      if (!selectedBatch) {
        return toast.error("Select mushroom batch");
      }

      if (!customerName.trim()) {
        return toast.error("Enter customer name");
      }

      if (!quantity || Number(quantity) <= 0) {
        return toast.error("Enter valid quantity");
      }

      if (
        Number(quantity) >
        Number(selectedBatch.balancePackets || 0)
      ) {
        return toast.error("Insufficient packet balance");
      }

      if (!pricePerPacket || Number(pricePerPacket) <= 0) {
        return toast.error("Enter valid selling price");
      }

      setLoading(true);

      const payload = {
        memberId: user?._id,
        memberName: `${user?.firstName || ""} ${
          user?.lastName || ""
        }`,

        mushroomBatchId: selectedBatch._id,
        mushroomBatchNo: selectedBatch.mushroomBatchNo,

        substrateBatchNo: selectedBatch.substrateBatchNo,

        saleDate,

        customerName,

        quantity: Number(quantity),

        pricePerPacket: Number(pricePerPacket),

        totalAmount,

        remarks,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-sales/create`,
        payload
      );

      toast.success("Mushroom sale entry saved");

      /* RESET */

      setCustomerName("");
      setQuantity("");
      setPricePerPacket("");
      setRemarks("");
      setSelectedBatch(null);

      fetchMushroomBatches();
    } catch (err) {
      console.log(err);

      toast.error(
        err?.response?.data?.message ||
          "Failed to save sale entry"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 p-4 md:p-6">

      {/* HEADER */}

      <div className="flex items-center gap-3 mb-6">

        <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700 shadow-sm text-xl">
          <FaShoppingCart />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Mushroom Sales Entry
          </h1>

          <p className="text-sm text-gray-500">
            Record member mushroom packet sales
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT PANEL */}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          <div className="flex items-center gap-2 mb-4">
            <FaSearch className="text-emerald-600" />

            <h2 className="font-semibold text-gray-700">
              Available Mushroom Batches
            </h2>
          </div>

          {/* SEARCH */}

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search batch no..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400 mb-4"
          />

          {/* BATCHES */}

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">

            {filteredBatches.length === 0 && (
              <div className="text-center text-gray-500 py-10 text-sm">
                No mushroom batches found
              </div>
            )}

            {filteredBatches.map((batch) => (
              <button
                key={batch._id}
                onClick={() => selectBatch(batch)}
                className={`w-full border rounded-2xl p-4 text-left transition-all duration-200
                ${
                  selectedBatch?._id === batch._id
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >

                <div className="flex justify-between items-start gap-3">

                  <div>
                    <p className="font-semibold text-gray-800">
                      {batch.mushroomBatchNo}
                    </p>

                    <p className="text-xs text-gray-500 mt-1">
                      Substrate Batch:
                    </p>

                    <p className="text-sm text-gray-700">
                      {batch.substrateBatchNo}
                    </p>
                  </div>

                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    {batch.balancePackets || 0} Packets
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL */}

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">

          {!selectedBatch ? (
            <div className="h-[500px] flex flex-col justify-center items-center text-center">

              <div className="bg-emerald-100 text-emerald-700 p-5 rounded-full text-4xl mb-4">
                <FaLeaf />
              </div>

              <h2 className="text-xl font-semibold text-gray-700">
                Select Mushroom Batch
              </h2>

              <p className="text-gray-500 mt-2">
                Choose available mushroom packet batch to continue
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* SELECTED BATCH */}

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">

                <div className="flex items-center gap-2 mb-4">
                  <FaBoxes className="text-emerald-700" />

                  <h2 className="font-semibold text-emerald-700">
                    Selected Batch Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Mushroom Batch
                    </p>

                    <p className="font-semibold text-gray-800">
                      {selectedBatch.mushroomBatchNo}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Substrate Batch
                    </p>

                    <p className="font-semibold text-gray-800">
                      {selectedBatch.substrateBatchNo}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Available Packets
                    </p>

                    <p className="font-semibold text-emerald-700">
                      {selectedBatch.balancePackets || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* FORM */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Sale Date
                  </label>

                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Customer Name
                  </label>

                  <div className="relative">
                    <FaUser className="absolute top-4 left-4 text-gray-400" />

                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(e.target.value)
                      }
                      placeholder="Enter customer name"
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                    placeholder="Enter quantity"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Price Per Packet
                  </label>

                  <div className="relative">
                    <FaMoneyBillWave className="absolute top-4 left-4 text-gray-400" />

                    <input
                      type="number"
                      min="0"
                      value={pricePerPacket}
                      onChange={(e) =>
                        setPricePerPacket(e.target.value)
                      }
                      placeholder="Enter selling price"
                      className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* REMARKS */}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Remarks
                </label>

                <textarea
                  rows="4"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional remarks..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                />
              </div>

              {/* SUMMARY */}

              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5">

                <h2 className="font-semibold text-gray-700 mb-4">
                  Sales Summary
                </h2>

                <div className="space-y-3 text-sm">

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Mushroom Batch
                    </span>

                    <span className="font-semibold">
                      {selectedBatch.mushroomBatchNo}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Quantity
                    </span>

                    <span className="font-semibold">
                      {quantity || 0}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-500">
                      Price Per Packet
                    </span>

                    <span className="font-semibold">
                      Rs. {pricePerPacket || 0}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between">

                    <span className="font-semibold text-gray-700">
                      Total Amount
                    </span>

                    <span className="font-bold text-emerald-700 text-lg">
                      Rs. {totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3 pt-2">

                <button
                  onClick={saveSale}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-sm transition-all duration-200
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <FaSave />

                  {loading ? "Saving..." : "Save Sale Entry"}
                </button>

                <button
                  onClick={() => {
                    setSelectedBatch(null);
                    setCustomerName("");
                    setQuantity("");
                    setPricePerPacket("");
                    setRemarks("");
                  }}
                  className="px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  Clear Form
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}