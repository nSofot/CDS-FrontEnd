import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { formatNumber } from "../../utils/numberFormat.js";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
// import html2pdf from "html2pdf.js";


export default function Reports() {
    const printRef = useRef(); // ✅ now valid

    const [dateFrom, setDateFrom] = useState(() => {
        const now = new Date();
        const firstOfYear = new Date(now.getFullYear(), 0, 1);
        return firstOfYear.toLocaleDateString("en-CA");
    });

    const [dateTo, setDateTo] = useState(() => {
        const now = new Date();
        const lastOfYear = new Date(now.getFullYear(), 11, 31);
        return lastOfYear.toLocaleDateString("en-CA");
    });

    const [transactions, setTransactions] = useState([]);
    const [transactionType, setTransactionType] = useState("all");
    const [isGenerating, setIsGenerating] = useState(false);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const GenerateReport = async () => {
        setIsGenerating(true);
        setTransactions([]);
        try {
            const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/ledgerTransactions");

            // ✅ Determine data array safely
            let dataArray = Array.isArray(response.data)
                ? response.data
                : Array.isArray(response.data.data)
                ? response.data.data
                : [];

            // Filter by type if not "all"
            if (transactionType !== "all") {
                dataArray = dataArray.filter(
                    (transaction) => transaction.transactionType === transactionType
                );
            }

            // Filter by date range
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            dataArray = dataArray.filter((transaction) => {
                const trxDate = new Date(transaction.trxDate);
                return trxDate >= from && trxDate <= to;
            });

            if (dataArray.length === 0) {
                toast.error("No transactions found for this period");
                setIsGenerating(false);
                return;
            }

            setTransactions(dataArray);
            const total = dataArray.reduce((sum, trx) => sum + Number(trx.trxAmount || 0), 0);
            setTotalAmount(total);
            toast.success(`Report generated: ${dataArray.length} transactions`);
        } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.message || "Failed to generate report");
        } finally {
            setIsGenerating(false);
        }
    };


    const exportToExcel = () => {
        if (!transactions || transactions.length === 0) {
            toast.error("No transactions to export");
            return;
        }

        // Map transactions to a clean Excel-friendly format
        const excelData = transactions.map((trx, index) => ({
            "#": index + 1,
            "Ref/No": trx.trxBookNo,
            "Date": new Date(trx.trxDate).toLocaleDateString("en-GB"),
            "Category": trx.transactionCategory,
            "Details": trx.description,
            "Amount": trx.trxAmount,
        }));

        // Create a worksheet
        const worksheet = XLSX.utils.json_to_sheet(excelData);

        // Create a workbook and append the worksheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

        // Export workbook
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, "transactions_report.xlsx");
    };

    return (
        <div className="w-full h-full flex flex-col bg-gray-100 rounded-md px-12 py-4">
            <div className='flex justify-between items-center mb-4'>
                <div className='w-40% h-full flex flex-col item-center'>
                    <h1 className='text-xl font-semibold text-gray-800'>📥📗 Transaction Reports</h1>
                    <p className='text-sm text-gray-600'>Generate and download all transactions reports from here.</p>
                </div>
                <div className="flex justify-end gap-4">
                    <button
                        onClick={exportToExcel}
                        className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                    >
                        Export Excel
                    </button>
                </div>
            </div>  

            <div className="flex flex-col items-center p-4 gap-4">
                <div className="bg-white shadow rounded-md flex justify-between w-full p-4">
                    <h1 className="text-lg font-semibold text-gray-800">All receipts transactions report</h1>
                    <div className="flex flex-col gap-2">
                    <p>Date from:</p>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="cursor-pointer text-blue-600"
                    />
                    </div>
                    <div className="flex flex-col gap-2">
                    <p>Date to:</p>
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="cursor-pointer text-blue-600"
                    /> 
                    </div>  
                    <div className="flex flex-col gap-2">
                    <p>Transaction type:</p>
                    <select
                        value={transactionType}
                        onChange={(e) => setTransactionType(e.target.value)}
                        className="cursor-pointer text-blue-600"
                    >
                        <option value="all">All</option>
                        <option value="receipt">Income</option>
                        <option value="voucher">Expense</option>
                    </select>
                    </div>             
                    <button
                        disabled={isGenerating}
                        onClick={async () => {
                            setIsGenerating(true);
                            await GenerateReport();
                            setIsGenerating(false);
                        }}
                        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer ${
                            isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                        {isGenerating ? "Generating..." : "Generate"}
                    </button>             
                </div>  

                <div ref={printRef}>
                    <h1 style={{ textAlign: "center", fontSize: "16px", fontWeight: "bold" }}>Thewana Shakthi Development Foundation</h1>
                    <h1 style={{ textAlign: "center", fontSize: "16px", fontWeight: "bold" }}>Transactions Report</h1>
                    <p style={{ textAlign: "center", fontSize: "12px", fontWeight: "bold" }}>
                    <strong>For the period of:</strong> {dateFrom} <strong>to:</strong> {dateTo}
                    </p>

                    <table
                    style={{
                        width: "100%",
                        borderCollapse: "separate", // keep columns separated
                        borderSpacing: "0 4px", // vertical gap between rows (optional)
                        marginTop: "10px",
                    }}
                    >
                    <thead>
                        <tr>
                        <th style={{ textAlign: "left", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>#</th>
                        <th style={{ textAlign: "left", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>Ref/No</th>
                        <th style={{ textAlign: "left", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>Date</th>
                        <th style={{ textAlign: "left", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>Category</th>
                        <th style={{ textAlign: "left", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>Details</th>
                        <th style={{ textAlign: "right", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300">
                        {transactions.map((trx, index) => {
                        const uniqueKey = `${trx.trxId || trx.trxBookNo || trx.trxDate || "row"}-${index}`;
                        return (
                            <tr key={uniqueKey}>
                            <td style={{ textAlign: "left", fontSize: "10px", padding: "4px 8px" }}>{index + 1}</td>
                            <td style={{ textAlign: "left", fontSize: "10px", padding: "4px 8px" }}>{trx.trxBookNo}</td>
                            <td style={{ textAlign: "left", fontSize: "10px", padding: "4px 8px" }}>
                                {new Date(trx.trxDate).toLocaleDateString("en-GB")}
                            </td>
                            <td style={{ textAlign: "left", fontSize: "10px", padding: "4px 8px" }}>{trx.transactionCategory}</td>
                            <td style={{ textAlign: "left", fontSize: "10px", padding: "4px 8px" }}>{trx.description}</td>
                            <td style={{ textAlign: "right", fontSize: "10px", padding: "4px 8px" }}>{formatNumber(trx.trxAmount)}</td>
                            </tr>
                        );
                        })}
                    </tbody>
                    <tfoot>
                        <tr>
                        <td colSpan={4} style={{ textAlign: "right", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>
                            Total
                        </td>
                        <td style={{ textAlign: "right", fontWeight: "bold", fontSize: "10px", padding: "4px 8px" }}>
                            {formatNumber(totalAmount)}
                        </td>
                        </tr>
                    </tfoot>
                    </table>


                    <p style={{ textAlign: "right", fontSize: "10px", marginTop: "10px" }}>
                    Printed on: {new Date().toLocaleDateString()}
                    </p>
                </div>


            </div>
        </div>
    );
}