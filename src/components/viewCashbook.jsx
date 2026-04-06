import { useCashbook } from "../hooks/useCashbook";
import { formatNumber } from "../utils/numberFormat.js";

export default function ViewCashbook({ accountId, fromDate, toDate }) {
    // const { cashbook, loading, error } = useCashbook(accountId, fromDate, toDate);
    const { cashbook, loading, error, balanceBF, receivedAm, spentAm } = useCashbook(accountId, fromDate, toDate);

    if (!accountId) {
      return <p className="text-gray-500 px-4 py-2">No account selected</p>;
    }

    if (loading) return <p className="text-gray-500 px-4 py-2">Loading cash book...</p>;
    if (error) return <p className="text-red-500 px-4 py-2">{error}</p>;
    
    return (
        <div className="w-full h-full text-sm text-gray-700 rounded bg-gray-50 shadow">

               <div className="mb-4 ml-2 mr-2 p-2 text-sm flex flex-col rounded-lg border bg-orange-50 font-semibold text-orange-600">
                    <div className="p-1 flex justify-between">
                        <label className="text-xs font-semibold">ඉදිරියට ගෙන ආ ශේෂය</label>
                        Rs.{" "}
                        {Number(balanceBF ?? 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    <div className="p-1 flex justify-between">
                        <label className="text-xs font-semibold">මුළු ලැබීම්</label>
                        Rs.{" "}
                        {Number(receivedAm ?? 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </div>
                    <div className="p-1 flex justify-between">
                        <label className="text-xs font-semibold">මුළු ගෙවීම්</label>
                        Rs.{" "}
                        {Number(spentAm ?? 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                    </div>
                </div>                                                   


            {/* Header Row */}
            <div className="hidden md:grid grid-cols-[100px_120px_120px_280px_120px_120px_120px] font-semibold bg-gray-200 px-4 py-2">
                <span>Date</span>
                <span>Reference</span>
                <span>Type</span>
                <span>Description</span>
                <span className="text-right">Debit</span>
                <span className="text-right">Credit</span>
                <span className="text-right">Balance</span>
            </div>

            {/* Scrollable Data */}
            <div className="overflow-y-auto max-h-[60vh]">     
                {cashbook.length === 0 ? (
                  <p className="text-sm text-gray-500 px-4 py-2">No Transaction Records available.</p>
                ) : (
                    <div className="text-sm text-gray-800">          
                        {cashbook.map((b, idx) => (
                            <div
                              key={`${b.trxId}-${idx}`} // ensures uniqueness
                              className="grid grid-cols-1 md:grid-cols-[100px_120px_120px_280px_120px_120px_120px] px-4 py-2 border-b border-gray-200 hover:bg-gray-100 gap-1 md:gap-0"
                            >
                                {/* For mobile, show stacked info */}
                                <div className="flex justify-start gap-4 md:hidden">
                                    <span className="flex gap-4">
                                        <span>{b.date}</span>
                                        <span>{b.trxId}</span>
                                        <span>{b.trxType}</span>
                                    </span>

             
                                </div>
                                <div className="flex justify-start md:hidden">
                                    <span>{b.description}</span>
                                </div>

                                <div className="flex justify-end gap-4 md:hidden">
                                    <span
                                        className={`text-right ${
                                            b.debit === "0.00" 
                                            ? "text-red-600" 
                                            : "text-green-600"
                                        }`}
                                    >
                                        {b.debit === "0.00" ? b.credit : b.debit}
                                    </span>        
                                    <span
                                        className={`text-right ${
                                            b.balance > "0.00" 
                                            ? "text-gray-600" 
                                            : "text-red-600"
                                        }`}
                                    >{b.balance}</span>                                                                
                                </div>

                                {/* Desktop view */}
                                <span className="hidden md:block">{b.date}</span>
                                <span className="hidden md:block">{b.trxId}</span>
                                <span className="hidden md:block">{b.trxType}</span>
                                <span className="hidden md:block">{b.description}</span>
                                <span className="hidden md:block text-right">{b.debit === "0.00" ? "—" : b.debit}</span>
                                <span className="hidden md:block text-right">{b.credit === "0.00" ? "—" : b.credit}</span>
                                <span className="hidden md:block text-right">{b.balance}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
