import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaSearch,
  FaSave,
  FaBoxes,
  FaLeaf,
} from "react-icons/fa";

export default function ProductionEntryPage() {
  const [loading, setLoading] = useState(false);

  const [substrateBatches, setSubstrateBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [search, setSearch] = useState("");

  const [productionDate, setProductionDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [packetCount, setPacketCount] = useState("");

  const [remarks, setRemarks] = useState("");

  const [generatedBatchNo, setGeneratedBatchNo] = useState("");

  /* ───────────────── FETCH SUBSTRATE BATCHES ───────────────── */

  useEffect(() => {
    fetchSubstrateBatches();
  }, []);

  const fetchSubstrateBatches = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/batches/substrate`
      );

      setSubstrateBatches(res.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load substrate batches");
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────── FILTERED BATCHES ───────────────── */

  const filteredBatches = useMemo(() => {
    return substrateBatches.filter((batch) =>
      batch.batchNo?.toLowerCase().includes(search.toLowerCase())
    );
  }, [substrateBatches, search]);

  /* ───────────────── GENERATE NEW MUSHROOM BATCH ───────────────── */

  const generateBatchNo = (substrateBatchNo) => {
    const timestamp = Date.now().toString().slice(-5);

    return `MP-${substrateBatchNo}-${timestamp}`;
  };

  /* ───────────────── SELECT BATCH ───────────────── */

  const selectBatch = (batch) => {
    setSelectedBatch(batch);

    const newBatch = generateBatchNo(batch.batchNo);

    setGeneratedBatchNo(newBatch);
  };

  /* ───────────────── SAVE PRODUCTION ───────────────── */

  const saveProduction = async () => {
    try {
      if (!selectedBatch) {
        return toast.error("Select substrate batch");
      }

      if (!packetCount || Number(packetCount) <= 0) {
        return toast.error("Enter valid packet quantity");
      }

      setLoading(true);

      const payload = {
        substrateBatchId: selectedBatch._id,
        substrateBatchNo: selectedBatch.batchNo,

        mushroomBatchNo: generatedBatchNo,

        productionDate,

        packetCount: Number(packetCount),

        remarks,

        productionType: "mushroom-packets",
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/productions/create`,
        payload
      );

      toast.success("Production entry saved");

      /* RESET */

      setPacketCount("");
      setRemarks("");
      setSelectedBatch(null);
      setGeneratedBatchNo("");

      fetchSubstrateBatches();
    } catch (err) {
      console.log(err);

      toast.error(
        err?.response?.data?.message || "Failed to save production"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100 p-4 md:p-6">

      {/* PAGE HEADER */}

      <div className="flex items-center gap-3 mb-6">
        <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700 text-xl shadow-sm">
          <FaLeaf />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Mushroom Production Entry
          </h1>

          <p className="text-sm text-gray-500">
            Create mushroom packet batches from substrate batches
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}

        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

          <div className="flex items-center gap-2 mb-4">
            <FaSearch className="text-emerald-600" />
            <h2 className="font-semibold text-gray-700">
              Select Substrate Batch
            </h2>
          </div>

          {/* SEARCH */}

          <input
            type="text"
            placeholder="Search batch no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-400 mb-4"
          />

          {/* BATCH LIST */}

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">

            {filteredBatches.length === 0 && (
              <div className="text-sm text-gray-500 text-center py-10">
                No substrate batches found
              </div>
            )}

            {filteredBatches.map((batch) => (
              <button
                key={batch._id}
                onClick={() => selectBatch(batch)}
                className={`w-full text-left border rounded-2xl p-4 transition-all duration-200
                ${
                  selectedBatch?._id === batch._id
                    ? "border-emerald-500 bg-emerald-50 shadow-sm"
                    : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/50"
                }`}
              >

                <div className="flex justify-between items-start">

                  <div>
                    <p className="font-semibold text-gray-800">
                      {batch.batchNo}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      Created:{" "}
                      {new Date(batch.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {batch.balanceBags || 0} Bags
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-5">

          <div className="flex items-center gap-2 mb-6">
            <FaBoxes className="text-emerald-600" />

            <h2 className="font-semibold text-gray-700">
              Production Details
            </h2>
          </div>

          {!selectedBatch ? (
            <div className="h-[400px] flex flex-col justify-center items-center text-center">

              <div className="bg-emerald-100 p-5 rounded-full text-4xl text-emerald-700 mb-4">
                <FaLeaf />
              </div>

              <h3 className="text-lg font-semibold text-gray-700">
                Select Substrate Batch
              </h3>

              <p className="text-gray-500 mt-1">
                Choose substrate batch to create mushroom packets
              </p>
            </div>
          ) : (
            <div className="space-y-6">

              {/* SELECTED BATCH */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Substrate Batch No
                  </label>

                  <input
                    type="text"
                    value={selectedBatch.batchNo}
                    readOnly
                    className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mushroom Batch No
                  </label>

                  <input
                    type="text"
                    value={generatedBatchNo}
                    readOnly
                    className="w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-semibold text-emerald-700"
                  />
                </div>
              </div>

              {/* FORM */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Production Date
                  </label>

                  <input
                    type="date"
                    value={productionDate}
                    onChange={(e) =>
                      setProductionDate(e.target.value)
                    }
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Mushroom Packet Quantity
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={packetCount}
                    onChange={(e) =>
                      setPacketCount(e.target.value)
                    }
                    placeholder="Enter packet quantity"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-400"
                  />
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

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">

                <h3 className="font-semibold text-emerald-700 mb-3">
                  Production Summary
                </h3>

                <div className="space-y-2 text-sm">

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Substrate Batch
                    </span>

                    <span className="font-semibold">
                      {selectedBatch.batchNo}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Mushroom Batch
                    </span>

                    <span className="font-semibold">
                      {generatedBatchNo}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Packet Quantity
                    </span>

                    <span className="font-semibold">
                      {packetCount || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONS */}

              <div className="flex flex-wrap gap-3 pt-2">

                <button
                  onClick={saveProduction}
                  disabled={loading}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium shadow-sm transition-all duration-200
                  ${
                    loading
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  <FaSave />

                  {loading ? "Saving..." : "Save Production"}
                </button>

                <button
                  onClick={() => {
                    setSelectedBatch(null);
                    setPacketCount("");
                    setRemarks("");
                    setGeneratedBatchNo("");
                  }}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  <FaPlus />
                  New Entry
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}