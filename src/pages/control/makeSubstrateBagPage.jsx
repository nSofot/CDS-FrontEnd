import { useEffect, useMemo, useState, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function MakeSubstrateBagPage() {
    const navigate = useNavigate();

    const getLocalDate = () => {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localDate = new Date(today.getTime() - offset * 60000);
      return localDate.toISOString().split("T")[0];
    };

    const [trxDate, setTrxDate] = useState(getLocalDate());     

    const [substrateMaterials, setSubstrateMaterials] = useState([]);
    const [packingMaterials, setPackingMaterials] = useState([]);
    const [materials, setMaterials] = useState([]);
   
    const [numberOfBags, setNumberOfBags] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    let newBatchId = "";
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const getAuthHeaders = () => {
      if (!token) return null;
      return { Authorization: `Bearer ${token}` };
    };

    const handleAuthError = (err) => {
      if (err.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("Something went wrong");
      }
    };

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

        const filteredSmStocks = allStocks.filter(
          (item) => item.stockCategory === "substrate material"
        );

        const filteredPmStocks = allStocks.filter(
          (item) => item.stockCategory === "packing material"
        );

        filteredSmStocks.sort((a, b) =>
          a.stockName.localeCompare(b.stockName)
        );

        filteredPmStocks.sort((a, b) =>
          a.stockName.localeCompare(b.stockName)
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

    const [otherExpenses, setOtherExpenses] = useState({
      "9000": { expenseId: "9000", name: "Water", price: 2.5, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9001": { expenseId: "9001", name: "Electricity", price: 3.0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9002": { expenseId: "9002", name: "Machine Depreciation", price: 5.0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9003": { expenseId: "9003", name: "Labor Cost", price: 6.0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9004": { expenseId: "9004", name: "Transport", price: 0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9005": { expenseId: "9005", name: "Other", price: 0, editablePrice: 0, qty: 0, rowTotal: 0 },
    });


    useEffect(() => {
      const bagCount = Number(numberOfBags || 0);

      setSubstrateMaterials((prev) =>
        prev.map((item) => {
          if (!item.isSelected) return item;

          const calculatedQty =
            bagCount * Number(item.baseQuantity || 0);

          const maxQty = Number(item.stockQuantity || 0);

          // Ensure totalQty does not exceed available stock
          const finalQty =
            calculatedQty > maxQty ? maxQty : calculatedQty;

          return {
            ...item,
            totalQty: finalQty,
            rowTotalValue:
              finalQty * Number(item.stockPrice || 0),
            rowCostValue:
              finalQty * Number(item.stockCost || 0),
          };
        })
      );

      setPackingMaterials((prev) =>
        prev.map((item) => {
          if (!item.isSelected) return item;

          const calculatedQty =
            bagCount * Number(item.baseQuantity || 0);

          const maxQty = Number(item.stockQuantity || 0);

          // Ensure totalQty does not exceed available stock
          const finalQty =
            calculatedQty > maxQty ? maxQty : calculatedQty;

          return {
            ...item,
            totalQty: finalQty,
            rowTotalValue:
              finalQty * Number(item.stockPrice || 0),
            rowCostValue:
              finalQty * Number(item.stockCost || 0),
          };
        })
      );

      setOtherExpenses((prev) => {
        const updated = {};

        Object.entries(prev).forEach(([id, item]) => {
          updated[id] = {
            ...item,
            qty: item.isSelected ? bagCount : 0,
            rowTotal:
              item.isSelected && item.editablePrice > 0
                ? bagCount * Number(item.editablePrice || 0)
                : 0,
          };
        });

        return updated;
      });
    }, [numberOfBags]);


    const handleQtyChange = (type, index, value) => {
      const bagCount = Number(numberOfBags || 0);
      const totalQty = Number(value || 0);

      const setter =
        type === "sm" ? setSubstrateMaterials : setPackingMaterials;

      setter((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                totalQty,
                rowTotalValue: totalQty * Number(item.stockPrice || 0),
                rowCostValue: totalQty * Number(item.stockCost || 0),
              }
            : item
        )        
      );     
    };

    const handleOtherExpenseChange = (id, value) => {
      const editablePrice = Number(value || 0);
      const bagCount = Number(numberOfBags || 0);

      setOtherExpenses((prev) => {
        return {
          ...prev,
          [id]: {
            ...prev[id],
            editablePrice,
            qty: bagCount,
            rowTotal: bagCount > 0 ? bagCount * editablePrice : 0,
          },
        };
      });
    };


    const handleCheckboxChange = (type, index, checked) => {
      const bagCount = Number(numberOfBags || 0);

      // For substrate + packing materials
      if (type === "sm" || type === "pm") {
        const setter =
          type === "sm" ? setSubstrateMaterials : setPackingMaterials;

        setter((prev) =>
          prev.map((item, i) => {
            if (i !== index) return item;

            const calculatedQty = checked
              ? bagCount * Number(item.baseQuantity || 0)
              : 0;

            const maxQty = Number(item.stockQuantity || 0);

            // Ensure totalQty does not exceed available stock
            const finalQty = calculatedQty > maxQty ? maxQty : calculatedQty;

            return {
              ...item,
              isSelected: checked,
              totalQty: finalQty,
              rowTotalValue: checked
                ? finalQty * Number(item.stockPrice || 0)
                : 0,
              rowCostValue: checked
                ? finalQty * Number(item.stockCost || 0)
                : 0,
            };
          })
        );
      }

      // For other expenses
      if (type === "oe") {
        setOtherExpenses((prev) => {
          const item = prev[index];
          const bagCount = Number(numberOfBags || 0);

          const editablePrice = checked
            ? Number(item.editablePrice || item.price || 0)
            : 0;

          return {
            ...prev,
            [index]: {
              ...item,
              isSelected: checked,
              editablePrice,
              qty: checked ? bagCount : 0,
              rowTotal: checked
                ? bagCount * editablePrice
                : 0,
            },
          };
        });
      }
    };

    const bagCount = Number(numberOfBags || 0);

    const selectedSubstrate = useMemo(() => {
      return substrateMaterials.filter((i) => i.isSelected);
    }, [substrateMaterials]);

    const substrateTotals = useMemo(() => {
      return substrateMaterials
        .filter((item) => item.isSelected)
        .reduce(
          (acc, item) => {
            acc.totalQty += Number(item.totalQty || 0);
            acc.cost += Number(item.rowCostValue || 0);
            acc.value += Number(item.rowTotalValue || 0);

            return acc;
          },
          {
            totalQty: 0,
            cost: 0,
            value: 0,
          }
        );
    }, [substrateMaterials]);    

    const selectedPacking = useMemo(() => {
      return packingMaterials.filter((i) => i.isSelected);
    }, [packingMaterials]);

    const packingTotals = useMemo(() => {
      return packingMaterials
        .filter((item) => item.isSelected)
        .reduce(
          (acc, item) => {
            acc.totalQty += Number(item.totalQty || 0);
            acc.cost += Number(item.rowCostValue || 0);
            acc.value += Number(item.rowTotalValue || 0);

            return acc;
          },
          {
            totalQty: 0,
            cost: 0,
            value: 0,
          }
        );
    }, [packingMaterials]);

    const otherExpenseTotals = useMemo(() => {
      return Object.values(otherExpenses)
        .filter((item) => item.isSelected)
        .reduce(
          (acc, item) => {
            acc.value += Number(item.rowTotal || 0);
            return acc;
          },
          {
            value: 0,
          }
        );
    }, [otherExpenses]);

    const totalCostValue = useMemo(() => {
      return (
        substrateTotals.cost +
        packingTotals.cost +
        otherExpenseTotals.value
      );
    }, [substrateTotals, packingTotals, otherExpenseTotals]);

    const totalJobValue = useMemo(() => {
      return (
        substrateTotals.value +
        packingTotals.value +
        otherExpenseTotals.value
      );
    }, [substrateTotals, packingTotals, otherExpenseTotals]);


    const handleSubmit = async () => {
      setIsSubmitting(true);

      if (!numberOfBags || Number(numberOfBags) <= 0) {
        toast.error("Please enter number of bags");
        return;
      }

      const selectedOther = Object.values(otherExpenses).filter((item) => item.isSelected);
      const materials = [
        ...selectedSubstrate,
        ...selectedPacking,
      ];      

      if (materials.length === 0) {
        toast.error("No materials found");
        return;
      }

      try {  
          // 1. Create batch            
          const batchPayload = {
            batchDate: trxDate,
            numberOfBags: Number(numberOfBags),
            status: "Substrate",
            materials: materials,
            otherExpenses: selectedOther,
            totalCostValue: totalCostValue,
            totalJobValue: totalJobValue,
          };

          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/batch`,
            batchPayload
          );

          newBatchId = response.data.data.batchNo || response.data.batchNo;
          setBatchNumber(newBatchId);

          // 2. Update stock quantities
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

          // 3. Write stock movement logs - Issued
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
              quantityBalance: Number(0),
              stockUOM: item.stockUOM,
              stockCost: Number(item.stockCost || 0),
              stockPrice: Number(item.stockPrice || 0),
            })),
          };               
          const issuedTrxResponse = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
            stockTrxPayload
          );

          // 4. Update Substrate Bag stock
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-add`,
            {
              items: [
                {
                  stockId: "5000",
                  quantity: Number(numberOfBags || 0),
                },
              ],
            },
            {
              headers: getAuthHeaders(),
            }
          );

          // 5. Write stock movement logs - Received Substract bags
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
                quantityBalance: Number(numberOfBags || 0),
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

          // 6. Update stock quantity balance in GRN
          const payload = {
            items: materials,
          };
          const detailsRes = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction/updateQuantityBalance`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const updatedDetails = detailsRes?.data?.issueDetails || [];

          // 7. Update Stock Issue Details
          const issuedTrxId = issuedTrxResponse.data.data?.issuedTrxId;
          const issuedTrxDate = issuedTrxResponse.data.data?.trxDate;         

          const updatePayload = {
            issueTrxId: issuedTrxId,
            issueReferenceId: newBatchId,
            issueDate: new Date(),
            items: updatedDetails,
          };         
          const updateRes = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-issue-details`,
            updatePayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          setIsSubmitted(true);
          toast.success(
              "Substrate bag details prepared successfully"
          );
      } catch (error) {
        console.error("FULL BACKEND ERROR:");
        console.error(error.response?.data || error);

        toast.error(
          error.response?.data?.message || "Failed to save"
        );

        setIsSubmitting(false);
      }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <ArrowLeft size={28} />
                    </button>

                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                          Substrate Bag Production Process
                        </h1>

                        <p className="text-sm text-gray-500">
                          Generate material requirements and detailed cost breakdown for each substrate bag 
                          batch using FIFO-based inventory consumption from available GRN stock batches.
                        </p>
                    </div>
                </div>

                {/* Number of Bags */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex justify-between gap-6">
                        < div className="flex flex-col w-full">
                            <label className="block mb-2 font-medium text-gray-700">
                                Number of Bags
                            </label>
                            <input
                                disabled={isSubmitting || isSubmitted}
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
                              disabled={isSubmitting || isSubmitted}
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
                            <p className="text-sm text-gray-500 text-right">
                              Total Cost Value
                            </p>

                            <p className="text-xl font-bold text-orange-600 text-right">
                              {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              }).format(totalCostValue)}
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
                        </div>            
                    </div>
                </div>

                {/* Material Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border rounded-xl overflow-hidden">
                    <tbody>

                      {/* ================= SUBSTRATE MATERIALS ================= */}
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center p-6">
                            Loading substrate materials...
                          </td>
                        </tr>
                      ) : substrateMaterials.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center p-6 text-gray-500">
                            Enter number of bags to generate material rows
                          </td>
                        </tr>
                      ) : (
                        <Fragment key="substrate-section">
                          <tr className="bg-orange-100 text-orange-500">
                            <th className="p-3 text-left">Use</th>
                            <th className="p-3 text-left">Substrate Material</th>
                            <th className="p-3 text-right">Base Qty</th>
                            <th className="p-3 text-left">UOM</th>
                            <th className="p-3 text-left">Total Quantity</th>
                            <th className="p-3 text-right">Available</th>
                            <th className="p-3 text-right">Stock Price</th>
                            <th className="p-3 text-right">Amount</th>
                          </tr>

                          {substrateMaterials.map((item, index) => (
                            <tr
                              key={`sm-${item.stockId}-${index}`}
                              className={item.isSelected ? "" : "opacity-50 bg-gray-50"}
                            >
                              <td className="p-3">
                                <input
                                  disabled={isSubmitting || isSubmitted}
                                  type="checkbox"
                                  checked={item.isSelected || false}
                                  onChange={(e) =>
                                    handleCheckboxChange("sm", index, e.target.checked)
                                  }
                                />
                              </td>

                              <td className="p-3">{item.stockName}</td>
                              <td className="p-3 text-right">{item.baseQuantity}</td>
                              <td className="p-3">{item.stockUOM}</td>

                              <td className="p-3">
                                <input
                                  type="number"
                                  value={Number(item.totalQty || 0)}
                                  max={Number(item.stockQuantity || 0)}
                                  disabled={
                                    !item.isSelected ||
                                    Number(numberOfBags) <= 0 ||
                                    isSubmitting ||
                                    isSubmitted
                                  }
                                  onChange={(e) => {
                                    const value = Number(e.target.value || 0);
                                    const maxQty = Number(item.stockQuantity || 0);

                                    if (value <= maxQty) {
                                      handleQtyChange("sm", index, value);
                                    }
                                  }}
                                  className={`w-full border rounded-lg px-3 py-2 ${
                                    !item.isSelected && Number(numberOfBags) <= 0
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : "focus:ring-2 focus:ring-orange-400"
                                  }`}
                                />
                              </td>

                              <td className="p-3 text-right text-gray-500">
                                {Number(item.stockQuantity || 0).toFixed(3)}
                              </td>

                              <td className="p-3 text-right">
                                {Number(item.stockPrice || 0).toFixed(2)}
                              </td>

                              <td className="p-3 text-right font-semibold">
                                {Number(item.rowTotalValue || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )}

                      {/* ================= PACKING MATERIALS ================= */}
                      {!loading && packingMaterials.length > 0 && (
                        <Fragment key="packing-section">
                          <tr className="bg-orange-100 text-orange-500">
                            <th className="p-3 text-left">Use</th>
                            <th className="p-3 text-left">Packing Material</th>
                            <th className="p-3 text-right">Base Qty</th>
                            <th className="p-3 text-left">UOM</th>
                            <th className="p-3 text-left">Total Quantity</th>
                            <th className="p-3 text-right">Available</th>
                            <th className="p-3 text-right">Stock Price</th>
                            <th className="p-3 text-right">Amount</th>
                          </tr>

                          {packingMaterials.map((item, index) => (
                            <tr
                              key={`pm-${item.stockId}-${index}`}
                              className={item.isSelected ? "" : "opacity-50 bg-gray-50"}
                            >
                              <td className="p-3">
                                <input
                                  disabled={isSubmitting || isSubmitted}
                                  type="checkbox"
                                  checked={item.isSelected || false}
                                  onChange={(e) =>
                                    handleCheckboxChange("pm", index, e.target.checked)
                                  }
                                />
                              </td>

                              <td className="p-3">{item.stockName}</td>
                              <td className="p-3 text-right">{item.baseQuantity}</td>
                              <td className="p-3">{item.stockUOM}</td>

                              <td className="p-3">
                                <input
                                  type="number"
                                  value={Number(item.totalQty || 0)}
                                  max={Number(item.stockQuantity || 0)}
                                  disabled={
                                    !item.isSelected ||
                                    Number(numberOfBags) <= 0 ||
                                    isSubmitting ||
                                    isSubmitted
                                  }
                                  onChange={(e) => {
                                    const value = Number(e.target.value || 0);
                                    const maxQty = Number(item.stockQuantity || 0);

                                    if (value <= maxQty) {
                                      handleQtyChange("sm", index, value);
                                    }
                                  }}
                                  className={`w-full border rounded-lg px-3 py-2 ${
                                    !item.isSelected && Number(numberOfBags) <= 0
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : "focus:ring-2 focus:ring-orange-400"
                                  }`}
                                />
                              </td>

                              <td className="p-3 text-right text-gray-500">
                                {Number(item.stockQuantity || 0).toFixed(3)}
                              </td>

                              <td className="p-3 text-right">
                                {Number(item.stockPrice || 0).toFixed(2)}
                              </td>

                              <td className="p-3 text-right font-semibold">
                                {Number(item.rowTotalValue || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )}

                      {/* ================= OTHER EXPENSES ================= */}
                      {!loading && Object.keys(otherExpenses).length > 0 && (
                        <Fragment key="otherExpense-section">
                          <tr className="bg-orange-100 text-orange-500">
                            <th className="p-3 text-left">Use</th>
                            <th className="p-3 text-left">Other Expense</th>
                            <th className="p-3 text-right">Base Price</th>
                            <th className="p-3 text-left"></th>
                            <th className="p-3 text-left">Unit Price</th>
                            <th className="p-3 text-right"></th>
                            <th className="p-3 text-right">Quantity</th>
                            <th className="p-3 text-right">Amount</th>
                          </tr>

                          {Object.entries(otherExpenses).map(([id, item]) => {
                            const bagCount = Number(numberOfBags || 0);
                            const rowTotal =
                              item.isSelected && item.editablePrice > 0 && numberOfBags > 0
                                ? Number(numberOfBags) * Number(item.editablePrice)
                                : 0;

                            return (
                              <tr
                                key={`oe-${id}`}
                                className={item.isSelected ? "" : "opacity-50 bg-gray-50"}
                              >
                                {/* CHECKBOX */}
                                <td className="p-3">
                                  <input
                                    disabled={isSubmitting || isSubmitted}
                                    type="checkbox"
                                    checked={item.isSelected || false}
                                    onChange={(e) =>
                                      handleCheckboxChange("oe", id, e.target.checked)
                                    }
                                  />
                                </td>

                                {/* NAME */}
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-right">{item.price.toFixed(2)}</td>
                                <td className="p-3"></td>

                                {/* PRICE */}
                                <td className="p-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={Number(item.editablePrice || 0)}
                                    disabled={
                                      !item.isSelected ||
                                      Number(numberOfBags) <= 0 ||
                                      isSubmitting ||
                                      isSubmitted
                                    }
                                    onChange={(e) =>
                                      handleOtherExpenseChange(id, e.target.value)
                                    }
                                    className={`w-full border rounded-lg px-3 py-2 ${
                                      !item.isSelected && Number(numberOfBags) <= 0
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "focus:ring-2 focus:ring-orange-400"
                                    }`}
                                  />
                                </td>

                                <td className="p-3 text-right text-gray-500"></td>

                                {/* QTY */}
                                <td className="p-3 text-right">
                                  {Number(numberOfBags || 0).toFixed(2)}
                                </td>

                                {/* AMOUNT */}
                                <td className="p-3 text-right font-semibold">
                                  {rowTotal.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-6">
                    <p className="text-sm text-gray-500">
                        Batch Number:{" "}
                        <span className="font-semibold text-gray-800">
                            {batchNumber || "N/A"}
                        </span>
                    </p>

                    <p className="text-sm text-gray-500">
                        Cost Value of a Bag:{" "}
                        <span className="font-semibold text-gray-800">
                            {numberOfBags
                              ? (totalCostValue / numberOfBags).toFixed(2)
                              : "N/A"}
                        </span>
                    </p>

                    <p className="text-sm text-gray-500">
                        Selling Value of a Bag:{" "}
                        <span className="font-semibold text-gray-800">
                            {numberOfBags
                              ? (totalJobValue / numberOfBags).toFixed(2)
                              : "N/A"}
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