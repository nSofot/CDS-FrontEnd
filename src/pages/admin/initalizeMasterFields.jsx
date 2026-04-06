import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function InitializeMasterFields() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializedFields, setInitializedFields] = useState({
    membership: false,
    shares: false,
    ledger: false,
  });

  const [customers, setCustomers] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const postingDate = new Date();

  // Fetch customers only
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCustomers = async () => {
      try {
        const resCus = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/customer`);
        setCustomers(resCus.data);

        const resLed = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts`);
        setLedgers(resLed.data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load customers.");
      }
    };
    fetchCustomers();
  }, []);

  const handleInitialize = async (field) => {
    if (!customers.length) return toast.error("No customers to update.");

    setIsInitializing(true);

    try {
      if (field === "membership") {
        await Promise.all(
          customers.map((c) =>
            axios.put(
              `${import.meta.env.VITE_BACKEND_URL}/api/customer/update/${c.customerId}`,
              { membership: 0 }
            )
          )
        );
      }

      if (field === "shares") {
        await Promise.all(
          customers.map((c) =>
            axios.put(
              `${import.meta.env.VITE_BACKEND_URL}/api/customer/update/${c.customerId}`,
              { shares: 0 }
            )
          )
        );
      }

      if (field === "ledger") {
        await Promise.all(
          ledgers.map((l) =>
            axios.put(
              `${import.meta.env.VITE_BACKEND_URL}/api/ledgerAccounts/update/${l.accountId}`,
              { accountBalance: 0 }
            )
          )
        );
      }


      setInitializedFields((prev) => ({ ...prev, [field]: true }));
      toast.success(`${field.charAt(0).toUpperCase() + field.slice(1)} initialized!`);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to initialize ${field}.`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center p-6">
      <div className="flex flex-col items-center mb-6">
        <p className="text-3xl font-bold text-gray-700">Initialize Master Fields</p>
        <input
          type="date"
          value={postingDate.toISOString().split("T")[0]}
          readOnly
          className="mt-2 px-3 py-2 border rounded-md"
        />
      </div>

      <div className="w-full max-w-md flex flex-col gap-4">
        {["membership", "shares", "ledger"].map((field) => (
          <div
            key={field}
            className="flex justify-between p-3 rounded-md bg-gray-50 border border-gray-200"
          >
            <p className="text-xl font-bold text-gray-700 capitalize">
              {field.replace(/([A-Z])/g, " $1")}
            </p>
            <button
              disabled={isInitializing || initializedFields[field]}
              onClick={() => handleInitialize(field)}
              className={`px-4 py-2 rounded-md transition-colors ${
                initializedFields[field]
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-green-500 text-white hover:bg-green-600"
              }`}
            >
              {initializedFields[field]
                ? "Initialized"
                : isInitializing
                ? "Initializing..."
                : "Initialize"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
