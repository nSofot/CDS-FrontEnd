import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function MakeSubstrateBagPage() {
  const navigate = useNavigate();

  const [substrateMaterials, setSubstrateMaterials] = useState([]);
  const [packingMaterials, setPackingMaterials] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [trxDate, setTrxDate] = useState(new Date().toISOString().slice(0, 10));
  const [numberOfBags, setNumberOfBags] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  let newBatchId = "";
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  /*
    Substrate Materials : 001 - 006
    Packing Materials   : 011 - 016
  */

  const substrateMaterialsIds = [
    "001",
    "002",
    "003",
    "004",
    "005"
  ];

  const packingMaterialsIds = [
    "011",
    "012",
    "013",
    "014",
    "015",
    "016"
  ];

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  const defaultSmQtyMap = {
    // Substrate Materials
    "001": 2.5, // Sawdust
    "002": 0.5, // Rice Bran
    "003": 0.1, // Lime
    "004": 0.05, // Gypsum
    "005": 0.02, // Magnesium Sulfate
  };

  const defaultPmQtyMap = {
    // Packing Materials
    "011": 1, // PP Bag
    "012": 1, // Neck Ring
    "013": 1, // Cotton
    "014": 1, // PVC Clip
    "015": 1, // Rubber Band
    "016": 1, // Label Sticker
  };

  const otherExpensesMap = {
    "100": { expenseId: "100", name: "Water", price: 2.5 },
    "101": { expenseId: "101", name: "Electricity", price: 3.0 },
    "102": { expenseId: "102", name: "Machine Depreciation", price: 5.0 },
    "103": { expenseId: "103", name: "Labor Cost", price: 6.0 },
  };

  const [otherExpenses, setOtherExpenses] = useState([
    { expenseId: "100", name: "Water", price: 2.5, rowTotal: 0 },
    { expenseId: "101", name: "Electricity", price: 3.0, rowTotal: 0 },
    { expenseId: "102", name: "Machine Depreciation", price: 5.0, rowTotal: 0 },
    { expenseId: "103", name: "Labor Cost", price: 6.0, rowTotal: 0 },
  ]);

  const fetchStocks = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        {
          headers: getAuthHeaders(),
        }
      );

      const allStocks = res.data.data || res.data || [];

      const filteredSmStocks = allStocks.filter((item) =>
        [...substrateMaterialsIds, ...substrateMaterialsIds].includes(item.stockId)
      );

      const filteredPmStocks = allStocks.filter((item) =>
        [...packingMaterialsIds, ...packingMaterialsIds].includes(item.stockId)
      );

      filteredSmStocks.sort((a, b) =>
        a.stockId.localeCompare(b.stockId)
      );

      filteredPmStocks.sort((a, b) =>
        a.stockId.localeCompare(b.stockId)
      );
      
      setSubstrateMaterials(filteredSmStocks);
      setPackingMaterials(filteredPmStocks);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load stock materials");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const bagCount = Number(numberOfBags);

    // 🔴 RESET CASE (when empty or invalid)
    if (!bagCount || bagCount <= 0) {
        setSubstrateMaterials((prev) =>
        prev.map((item) => ({
            ...item,
            baseQty: 0,
            totalQty: 0,
            rowTotalValue: 0,
            rowCostValue: 0,
        }))
        );

        setPackingMaterials((prev) =>
        prev.map((item) => ({
            ...item,
            baseQty: 0,
            totalQty: 0,
            rowTotalValue: 0,
            rowCostValue: 0,
        }))
        );

        return;
    }

    // ✅ NORMAL CALCULATION
    const updateList = (list, type) => {
        return list.map((item) => {
        const baseQty =
            type === "sm"
            ? defaultSmQtyMap[item.stockId] || 0
            : defaultPmQtyMap[item.stockId] || 0;

        const totalQty = Number((baseQty * bagCount).toFixed(2));

        return {
            ...item,
            baseQty,
            totalQty,
            stockPrice: Number(item.stockPrice || 0),
            rowTotalValue: totalQty * Number(item.stockPrice || 0),
            rowCostValue: totalQty * Number(item.stockCost || 0),
        };
        });
    };

    setSubstrateMaterials((prev) => updateList(prev, "sm"));
    setPackingMaterials((prev) => updateList(prev, "pm"));
    }, [numberOfBags]);


  useEffect(() => {
    if (!numberOfBags || Number(numberOfBags) <= 0) {
        setMaterials([]);
        return;
    }

    setMaterials([...substrateMaterials, ...packingMaterials]);
  }, [substrateMaterials, packingMaterials, numberOfBags]);


  const handleQtyChange = (type, index, value) => {
    const setter =
        type === "sm" ? setSubstrateMaterials : setPackingMaterials;

    setter((prev) => {
        const updated = [...prev];
        const item = updated[index];

        const qty = Number(value || 0);
        const price = Number(item.stockPrice || 0);
        const cost = Number(item.stockCost || 0);

        updated[index] = {
        ...item,
        totalQty: qty,
        rowTotalValue: qty * price,
        rowCostValue: qty * cost,
        };

        return updated;
    });
  };

// add this useEffect for auto rowTotal update when numberOfBags changes

useEffect(() => {
  const bagCount = Number(numberOfBags || 0);

  setOtherExpenses((prev) => {
    const updated = {};

    Object.entries(prev).forEach(([id, item]) => {
      const price = Number(item.price || 0);
      const unitQty = Number(item.qty || 1);

      updated[id] = {
        ...item,
        rowTotal: unitQty * bagCount * price, // ✅ stored inside object
      };
    });

    return updated;
  });
}, [numberOfBags]);


// modify handleOtherExpenseChange like this

const handleOtherExpenseChange = (id, value) => {
  const price = Number(value || 0);
  const bagCount = Number(numberOfBags || 0);

  setOtherExpenses((prev) => {
    const unitQty = Number(prev[id]?.qty || 1);

    return {
      ...prev,
      [id]: {
        ...prev[id],
        price,
        rowTotal: unitQty * bagCount * price, // ✅ save rowTotal in array
      },
    };
  });
};

  const totalMaterialCount = useMemo(() => {
    return materials.reduce(
        (sum, item) => sum + Number(item.totalQty || 0),
        0
    );
  }, [materials]);

  const totalMaterialValue = useMemo(() => {
    return materials.reduce((sum, item) => {
        return (
        sum +
        Number(item.totalQty || 0) * Number(item.stockPrice || 0)
        );
    }, 0);
  }, [materials]);

  const totalMaterialCost = useMemo(() => {
    return materials.reduce((sum, item) => {
        return (
        sum +
        Number(item.totalQty || 0) * Number(item.stockCost || 0)
        );
    }, 0);
  }, [materials]);  

  const totalOtherExpenseValue = useMemo(() => {
    const bagCount = Number(numberOfBags || 0);

    return Object.entries(otherExpenses).reduce((sum, [, item]) => {
        const unitQty = Number(item.qty || 1);
        const price = Number(item.price || 0);

        return sum + unitQty * bagCount * price;
    }, 0);
  }, [otherExpenses, numberOfBags]);

  const totalOtherExpenseCost = useMemo(() => {
    const bagCount = Number(numberOfBags || 0);

    return Object.entries(otherExpenses).reduce((sum, [, item]) => {
        const unitQty = Number(item.qty || 1);
        const price = Number(item.price || 0);

        return sum + unitQty * bagCount * price;
    }, 0);
  }, [otherExpenses, numberOfBags]);  

  const totalJobValue = useMemo(() => {
    return totalMaterialValue + totalOtherExpenseValue;
  }, [totalMaterialValue, totalOtherExpenseValue]);

  const totalCostValue = useMemo(() => {
    return totalMaterialCost + totalOtherExpenseCost;
  }, [totalMaterialCost, totalOtherExpenseCost]);


  const handleSubmit = async () => {
    setIsSubmitting(true);

    if (!numberOfBags || Number(numberOfBags) <= 0) {
      toast.error("Please enter number of bags");
      return;
    }

    if (materials.length === 0) {
      toast.error("No materials found");
      return;
    }

    try {      
        // Batch create
        const otherExpensesArray = Object.entries(otherExpenses).map(
            ([id, item]) => ({
                expenseId: item.expenseId || id,
                name: item.name,
                price: Number(item.price || 0),
                rowTotal: Number(item.rowTotal || 0),
            })
        );        
        
        const batchPayload = {
          batchNo: "",
          batchDate: new Date(),
          numberOfBags: Number(numberOfBags),
          status: "Substrate",
          materials: materials,
          otherExpenses: otherExpensesArray,
          totalMaterialCount: totalMaterialCount,
          totalCostValue: totalCostValue,
          totalJobValue: totalJobValue,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/batch`,
          batchPayload
        );

        newBatchId = response.data.data.batchNo || response.data.batchNo;
        setBatchNumber(newBatchId);

        // Update stock quantities
        await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-reduce`,
            {
                items: materials.map((item) => ({
                stockId: item.stockId,
                quantity: Number(item.totalQty || 0),
                })),
            },
            {
                headers: getAuthHeaders(),
            }
        );

        // Write stock movement logs
        const stockTrxPayload = {       
          referenceId: newBatchId,
          trxDate: trxDate,
          trxType: "GoodIssue",
          description: "Substrate bag production",
          isAdded: false,
          clientId: "",
          items: materials.map((item) => ({
            stockId: item.stockId,
            stockName: item.stockName,
            quantity: Number(item.totalQty || 0),
            stockUOM: item.stockUOM,
            stockCost: Number(item.stockCost || 0),
            stockPrice: Number(item.stockPrice || 0),
          })),
        };               
        await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
            stockTrxPayload
        );

        // Update Substrate Bag batchNo after stock movement log is created
        await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-add`,
          {
            items: [
              {
                stockId: "100",
                quantity: Number(numberOfBags || 0),
              },
            ],
          },
          {
            headers: getAuthHeaders(),
          }
        );

        const bagTrxPayload = {
          trxId: String(newBatchId),
          referenceId: String(newBatchId),
          trxDate: new Date(trxDate),
          trxType: "Substrate",
          description: "Substrate bag production",
          isAdded: true,
          clientId: "",
          items: [
            {
              stockId: "100",
              stockName: "Substrate Bag",
              quantity: Number(numberOfBags || 0),
              stockUOM: "pcs",
              stockCost:
                Number(totalCostValue || 0) / Number(numberOfBags || 1),
              stockPrice:
                Number(totalJobValue || 0) / Number(numberOfBags || 1),
            },
          ],
        };
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
          bagTrxPayload,
          {
            headers: getAuthHeaders(),
          }
        );

        setIsSubmitted(true);
        toast.success(
            "Substrate bag details prepared successfully"
        );
    } catch (error) {
      console.error(error);
      toast.error("Failed to save");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
        {/* Header */}

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-orange-600 hover:text-orange-700"
          >
            <ArrowLeft size={28} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Make Substrate Bag
            </h1>

            <p className="text-sm text-gray-500">
              Generate material requirements and cost breakdown per batch of substrate bags
            </p>
          </div>
        </div>

        {/* Number of Bags */}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="flex justify-between gap-6">
            <div className="flex flex-col w-full">
              <label className="block mb-2 font-medium text-gray-700">
                Number of Bags
              </label>
              <input
                type="number"
                min="1"
                value={numberOfBags}
                onChange={(e) =>
                  setNumberOfBags(e.target.value)
                }
                placeholder="Enter number of bags"
                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                required
              />
            </div>
            <div className="flex flex-col">
                <label className="block mb-2 font-medium text-gray-700">
                    Production Date
                  </label>
                <input
                  type="date"
                  value={trxDate}
                  onChange={(e) => setTrxDate(e.target.value)}
                  className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 w-full">
              <p className="text-sm text-gray-500">
                Total Material Quantity
              </p>

              <p className="text-xl font-bold text-orange-600">
                {totalMaterialCount.toFixed(2)}
              </p>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 w-full">
              <p className="text-sm text-gray-500 text-right">
                Total Job Value
              </p>

              <p className="text-xl font-bold text-orange-600 text-right">
                {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(totalJobValue)}
              </p>

              {/* <p className="text-xl font-bold text-orange-600 text-right">
                {new Intl.NumberFormat("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                }).format(totalCostValue)}
              </p> */}

            </div>            
          </div>
        </div>

        {/* Material Table */}

        <div className="overflow-x-auto">
          <table className="w-full border rounded-xl overflow-hidden">
            <thead className="bg-orange-100">
              <tr>
                {/* <th className="p-3 text-left">Stock ID</th> */}
                <th className="p-3 text-left">Material Name</th>
                <th className="p-3 text-left">Base Qty / Bag</th>
                <th className="p-3 text-left">Unit</th>                
                <th className="p-3 text-left">Total Quantity</th>
                <th className="p-3 text-left">Available</th>
                <th className="p-3 text-right">Stock Price</th>
                <th className="p-3 text-right">Row Total</th>
              </tr>
            </thead>

                <tbody>
                    {/* SUBSTRATE MATERIALS SECTION */}
                    {loading ? (
                        <tr>
                        <td colSpan="6" className="text-center p-6">
                            Loading substrate materials...
                        </td>
                        </tr>
                    ) : substrateMaterials.length === 0 ? (
                        <tr>
                        <td colSpan="6" className="text-center p-6 text-gray-500">
                            Enter number of bags to generate material rows
                        </td>
                        </tr>
                    ) : (
                        <>
                        <tr>
                            <td colSpan="6" className="bg-gray-100 text-orange-600 font-semibold p-2">
                            Substrate Materials
                            </td>
                        </tr>

                        {substrateMaterials.map((item, index) => (
                            <tr key={item.stockId} className="border-t">
                            <td className="p-3">{item.stockName}</td>
                            <td className="p-3">{item.baseQty}</td>
                            <td className="p-3">{item.stockUOM}</td>

                            <td className="p-3">
                                <input
                                type="number"
                                step="0.01"
                                value={Number(item.totalQty || 0)}
                                onChange={(e) =>
                                    handleQtyChange("sm", index, e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                />
                            </td>

                            <td className="p-3 text-left text-gray-500">
                                / {item.stockQuantity}
                            </td>

                            <td className="p-3 text-right">
                                {Number(item.stockPrice || 0).toFixed(2)}
                            </td>

                            <td className="p-3 text-right font-semibold">
                                {Number(item.rowTotalValue || 0).toFixed(2)}
                            </td>
                            </tr>
                        ))}
                        </>
                    )}

                {/* PACKING MATERIALS SECTION */}
                {loading ? (
                    <tr>
                    <td colSpan="6" className="text-center p-6">
                        Loading packing materials...
                    </td>
                    </tr>
                ) : packingMaterials.length === 0 ? (
                    <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                        Enter number of bags to generate material rows
                    </td>
                    </tr>
                ) : (
                    <>
                    <tr>
                        <td colSpan="6" className="bg-gray-100 text-orange-600 font-semibold p-2">
                        Packing Materials
                        </td>
                    </tr>

                    {packingMaterials.map((item, index) => (
                        <tr key={item.stockId} className="border-t">
                        <td className="p-3">{item.stockName}</td>
                        <td className="p-3">{item.baseQty}</td>
                        <td className="p-3">{item.stockUOM}</td>

                        <td className="p-3">
                            <input
                            type="number"
                            step="0.01"
                            value={Number(item.totalQty || 0)}
                            onChange={(e) =>
                                handleQtyChange("pm", index, e.target.value)
                            }
                            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                            />
                        </td>

                        <td className="p-3 text-left text-gray-500">
                            / {item.stockQuantity}
                        </td>                        

                        <td className="p-3 text-right">
                            {Number(item.stockPrice || 0).toFixed(2)}
                        </td>

                        <td className="p-3 text-right font-semibold">
                            {Number(item.rowTotalValue || 0).toFixed(2)}
                        </td>
                        </tr>
                    ))}
                    </>
                )}

                {/* OTHER EXPENSES SECTION */}

                {loading ? (
                <tr>
                    <td colSpan="6" className="text-center p-6">
                    Loading other expenses...
                    </td>
                </tr>
                ) : Object.keys(otherExpenses).length === 0 ? (
                <tr>
                    <td colSpan="6" className="text-center p-6 text-gray-500">
                    No other expenses found
                    </td>
                </tr>
                ) : (
                <>
                    <tr>
                    <td colSpan="6" className="bg-gray-100 text-orange-600 font-semibold p-2 w-full">
                        Other Expenses
                    </td>
                    </tr>

                        {Object.entries(otherExpenses).map(([id, item]) => {
                        const unitQty = Number(item.qty || 1); // per bag qty
                        const bagCount = Number(numberOfBags || 0);

                        const totalQty = unitQty * bagCount;
                        const rowTotal = totalQty * Number(item.price || 0);

                        return (
                            <tr key={id} className="border-t">
                            <td className="p-3">{item.name}</td>

                            <td className="p-3 text-gray-500">
                                {/* {unitQty} */}
                            </td>

                            <td className="p-3">Rs.</td>

                            {/* PRICE INPUT */}
                            <td className="p-3">
                                <input
                                type="number"
                                step="0.01"
                                value={Number(item.price || 0)}
                                onChange={(e) =>
                                    handleOtherExpenseChange(id, e.target.value)
                                }
                                className="w-full border rounded-lg px-3 py-2"
                                />
                            </td>

                            {/* TOTAL QTY */}
                            <td className="p-3 text-left text-gray-500">
                                {/* {totalQty} */}
                            </td>

                            {/* BAG COUNT */}
                            <td className="p-3 text-right">
                                {bagCount}
                            </td>

                            {/* TOTAL VALUE */}
                            <td className="p-3 text-right font-semibold">
                                {rowTotal.toFixed(2)}
                            </td>
                            </tr>
                        );
                        })}
                </>
                )}
                </tbody>

          </table>
        </div>

        {/* Action Buttons */}

        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-6">

          {/* Batch Info */}
          <p className="text-sm text-gray-500">
            Batch Number:{" "}
            <span className="font-semibold text-gray-800">
              {batchNumber || "N/A"}
            </span>
          </p>

          {/* Buttons */}
          <div className="flex justify-end gap-3">

            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isSubmitted}
              className={`px-6 py-3 rounded-xl text-white transition min-w-[140px] ${
                isSubmitted
                  ? "bg-green-600 cursor-not-allowed"
                  : isSubmitting
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700"
              }`}
            >
              {isSubmitted
                ? "Submitted ✓"
                : isSubmitting
                ? "Submitting..."
                : "Submit"}
            </button>

          </div>
        </div>
      </div>
    </div>
  );
}