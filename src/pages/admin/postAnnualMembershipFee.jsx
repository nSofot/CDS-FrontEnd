import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber } from "../../utils/numberFormat.js";
import toast from "react-hot-toast";


export default function PostAnnualMembershipFee() {
    const [isLoading, setIsLoading] = useState(true);

    const [postingDate, setPostingDate] = useState(new Date());

    const [customers, setCustomers] = useState([]);
    const [payList, setPayList] = useState([]);
    const [isPosting, setIsPosting] = useState(false);
    const [isPosted, setIsPosted] = useState(false);
    const [isPaying, setIsPaying] = useState(false);
    const [isPaid, setIsPaid] = useState(false);


    useEffect(() => {
    const fetchCustomers = async () => {
        try {
        window.scrollTo(0, 0);
        setIsLoading(true);

        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`);

        // ✅ Enrich each customer with annualFee = 150 + (75 * count of 'other' family members)
        const enrichedCustomers = res.data.map((customer) => {
            const otherCount = customer.familyMembers
            ? customer.familyMembers.filter((fm) => fm.relationship === "other").length
            : 0;

            return {
            ...customer,
            annualFee: (150 + 75 * otherCount) * 12,
            };
        });
        setCustomers(enrichedCustomers);

        // ✅ Create pay list — only customers with shares >= 30000
        const enrichedPayList = enrichedCustomers
        .filter(
            (customer) =>
            customer.shares >= 30000 && customer.customerType?.toLowerCase() === "shareholder"
        )
        .map((customer) => ({
            customerId: customer.customerId,
            name: customer.name,
            payAmount: 1800,
        }));

        setPayList(enrichedPayList);
        } catch (err) {
        console.error("Error fetching customers:", err);
        } finally {
        setIsLoading(false);
        }
    };

    fetchCustomers();
    }, []);


    const handlePost = async () => {
        setIsPosting(true);

        try {
            for (const customer of customers) {
                // 1️⃣ post annual membership fee for the customer
                try {
                    const customerPayload = {
                        updates: [
                            {
                                customerId: customer.customerId,
                                amount: parseFloat(customer.annualFee) || 0, // use enriched annualFee
                            },
                        ],
                    };
                    await axios.put(
                        `${import.meta.env.VITE_BACKEND_URL}/api/customer/membershipFee-add`,
                        customerPayload
                    );
                } catch (err) {
                    console.error(`1️⃣⚠️ Error posting fee for customer ${customer.customerId}:`, err);
                }

                // 2️⃣ post annual membership fee transaction for the customer
                try {
                    const trxPayload = {
                        trxBookNo: "",
                        customerId: customer.customerId,
                        transactionDate: new Date(postingDate).toISOString(),
                        trxAmount: parseFloat(customer.annualFee) || 0,
                        transactionType: "membershipFee",
                        isCredit: false,
                        description: `වාර්ෂික සාමාජික ගාස්තුව`,
                    };
                    const res = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/create`,
                        trxPayload
                    );

                 } catch (err) {
                    console.error(`2️⃣⚠️ Error posting fee transaction for customer ${customer.customerId}:`, err);
                }
            }

            setIsPosted(true);
            toast.success("Annual membership fee posted successfully for all customers!");
        } catch (err) {
            console.error("⚠️ Error posting fees:", err);
            toast.error("Error posting some fees. Check console for details.");
        } finally {
            setIsPosting(false);
        }
    };


    const handlePay = async () => {
        setIsPaying(true);
        let newReferenceNo = "";

        try {
            for (const pay of payList) {
                // 1️⃣ pay annual membership fee from shares for the customer
                try {
                    const customerPayload = {
                        updates: [
                            {
                                customerId: pay.customerId,
                                amount: parseFloat(pay.payAmount) || 0, // use enriched annualFee
                            },
                        ],
                    };
                    await axios.put(
                        `${import.meta.env.VITE_BACKEND_URL}/api/customer/membershipFee-subtract`,
                        customerPayload
                    );

                    await axios.put(
                        `${import.meta.env.VITE_BACKEND_URL}/api/customer/shares-subtract`,
                        customerPayload
                    )
                } catch (err) {
                    console.error(`1️⃣⚠️ Error posting fee for customer ${pay.customerId}:`, err);
                }

                // 2️⃣ post annual membership fee transaction for the customer
                try {
                    const trxPayload = {
                        trxBookNo: "N/A",
                        customerId: pay.customerId,
                        transactionDate: new Date(postingDate).toISOString(),
                        trxAmount: parseFloat(pay.payAmount) || 0,
                        transactionType: "receipt",
                        isCredit: true,
                        description: 'කොටස් අරමුදලින් සාමාජික ගාස්තු ගෙවීම',
                    };
                    const res = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/membershipTransactions/create`,
                        trxPayload
                    );
                 } catch (err) {
                    console.error(`2️⃣⚠️ Error posting fee transaction for customer ${customer.customerId}:`, err);
                }
                try {
                    const Payload = {
                        // trxId: newReferenceNo,
                        trxBookNo: 'N/A',
                        customerId: pay.customerId,
                        transactionDate: new Date(postingDate).toISOString(),
                        trxAmount: parseFloat(pay.payAmount) || 0,
                        transactionType: "voucher", 
                        isCredit: true,
                        description: 'සාමාජික ගාස්තු ගෙවීම'
                    };                
                    const res = await axios.post(
                        `${import.meta.env.VITE_BACKEND_URL}/api/sharesTransactions/create`,
                        Payload
                    );                     
                } catch (err) {
                    console.error(`2️⃣⚠️ Error posting fee transaction for customer ${pay.customerId}:`, err);
                }            
            }

            const totalAmount = Number(
            payList.reduce((total, pay) => total + (pay.payAmount || 0), 0)
            );

            const ledgerPayload = {
            trxId: 'N/A',
            trxBookNo: "N/A",
            trxDate: postingDate.toISOString().split("T")[0], // YYYY-MM-DD
            transactionType: "voucher",
            accountId: "325-0001",
            description: "සාමාජික ගාස්තු ගෙවීම",
            isCredit: true,
            trxAmount: totalAmount,
            };
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, ledgerPayload);

            await Promise.all([
            axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/add-balance`, {
                updates: [{ accountId: "325-0002", amount: totalAmount }],
            }),
            axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerTransactions`, {
                trxId: 'N/A',
                trxBookNo: "N/A",
                trxDate: postingDate.toISOString().split("T")[0],
                transactionType: "voucher",
                accountId: "325-0002",
                description: "කොටස් අරමුදලින් සාමාජික ගාස්තු ගෙවීම",
                isCredit: false,
                trxAmount: totalAmount, 
            }),
            ]);
         
            setIsPaid(true);
            toast.success("Paying membership from Shares successfully completed!");
        } catch (err) {
            console.error("⚠️ Error posting fees:", err);
            toast.error("Error paying membership fees.. Check console for details.");
        } finally {
            setIsPaying(false);
        }
    };


    return (
        <div className="w-full h-full flex flex-col items-center p-6">
            <div className="flex flex-col items-center mb-8">
                <p className="text-3xl font-bold text-gray-700">
                    Post Annual Records
                </p>
                <input
                    type="date"
                    value={postingDate.toISOString().split("T")[0]}
                    onChange={(e) => setPostingDate(new Date(e.target.value))}
                    className="mt-2 px-3 py-2 border rounded-md"
                />         
                       
  
            </div>

            {isLoading ? (
                <LoadingSpinner />
            ) : (
                <div className="h-[75vh]  w-full flex justify-between items-center">
                    <div>
                    <h1 className="text-xl font-bold text-gray-700">Annual Membership Fees</h1>
                    <div className="h-[65vh] overflow-y-auto w-lg flex flex-col gap-2 p-4 rounded-md border border-gray-200">
                        
                        {customers.map((customer) => (
                            <div
                                key={customer._id || customer.customerId}
                                className="flex justify-between items-center p-3 rounded-md bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                <div className="flex gap-3 items-center">
                                    <p className="text-sm text-gray-500">
                                        {customer.customerId}
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {customer.name}
                                    </p>
                                </div>
                                <span className="font-semibold text-blue-700">
                                    {formatNumber(customer.annualFee || 0)}
                                </span>
                            </div>
                        ))}
                    </div> 
                    <p className="text-sm text-gray-500 mt-4">
                        Total:{" "}
                        {formatNumber(
                            customers.reduce((total, customer) => total + (customer.annualFee || 0), 0)
                        )}
                    </p>                    
                    <button
                        disabled={isPosting || isPosted}
                        onClick={async () => {
                            setIsPosting(true);
                            await handlePost();
                            setIsPosting(false);
                            setIsPosted(true);
                        }}
                        // className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer ${isPosting ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                        {isPosting ? "Posting..." : isPosted ? "Posting Completed" : "Post Annual Fee"}
                    </button>                    
                    </div>

                    <div>
                    <h1 className="text-xl font-bold text-gray-700">Pay Membership Fees from Shares</h1>
                    <div className="h-[65vh] overflow-y-auto w-lg flex flex-col gap-2 p-4 rounded-md border border-gray-200">
                        {payList.map((pay) => (
                            <div
                                key={pay._id || pay.customerId}
                                className="flex justify-between items-center p-3 rounded-md bg-blue-50 border border-blue-100 hover:bg-blue-100 transition-colors"
                            >
                                <div className="flex gap-3 items-center">
                                    <p className="text-sm text-gray-500">
                                        {pay.customerId}
                                    </p>
                                    <p className="font-medium text-gray-800">
                                        {pay.name}
                                    </p>
                                </div>
                                <span className="font-semibold text-blue-700">
                                    {formatNumber(pay.payAmount || 0)}
                                </span>
                            </div>
                        ))}
                    </div> 
                    <p className="text-sm text-gray-500 mt-4">
                        Total:{" "}
                        {formatNumber(
                            payList.reduce((totalPay, payList) => totalPay + (payList.payAmount || 0), 0)
                        )}
                    </p>                    
                    <button
                        disabled={isPaying || isPaid}
                        onClick={async () => {
                            setIsPaying(true);
                            await handlePay();
                            setIsPaying(false);
                            setIsPaid(true);
                        }}
                        // className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer ${isPaying ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                        {isPaying ? "Posting..." : isPaid ? "Posting Completed" : "Post Annual Fee"}
                    </button>                    
                    </div>                    
                </div>                               
            )}
        </div>
    );
}
