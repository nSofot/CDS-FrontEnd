import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";


export default function BagOrderDetailsPage() {
    const [orders, setOrders] = useState([]);
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [filterStatus, setFilterStatus] = useState("All");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editId, setEditId] = useState(null);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));
    const memberId = user?.memberId;

    // ---------------- LEAD TIME LOGIC ----------------
    const getDefaultDate = (bagStatus = "Substrate") => {
        const date = new Date();

        let daysToAdd = 7;

        switch (bagStatus) {
            case "Substrate":
                daysToAdd = 7;
                break;
            case "Sterilized":
                daysToAdd = 10;
                break;
            case "Inoculated":
                daysToAdd = 14;
                break;
            case "Incubating":
                daysToAdd = 30;
                break;
        }

        date.setDate(date.getDate() + daysToAdd);
        return date.toISOString().split("T")[0];
    };

    // ---------------- FORM ----------------
    const [form, setForm] = useState({
        orderDate: new Date().toISOString().split("T")[0],
        orderRequestedDate: getDefaultDate("Substrate"),
        orderBagStatus: "Substrate",
        orderQuantity: "",
        memberId: "",
        memberName: "",
        orderStatus: "Pending",
        orderApprovedRejectedBy: "",
        orderApprovedRejectedDate: "",
        orderCompletedDate: "",
        orderDeliveredDate: "",
        batchId: "",
        orderRemarks: "",
    });

    // ---------------- AUTO UPDATE DATE WHEN BAG STATUS CHANGES ----------------
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            orderRequestedDate: getDefaultDate(prev.orderBagStatus),
        }));
    }, [form.orderBagStatus]);

    // ---------------- FETCH ----------------
    const fetchOrders = async () => {
        try {
            setLoading(true);

            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/bag-order`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            const filtered = res.data.filter(
                (o) => o.memberId === memberId
            );

            setOrders(filtered);

            const memberRes = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/member/${memberId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setMember(memberRes.data);
        } catch (err) {
            toast.error("Failed to load orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    // ---------------- AUTO SET MEMBER ----------------
    useEffect(() => {
        if (member) {
            const fullName =
                member.nameInSinhala?.trim() ||
                `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim();

            setForm((prev) => ({
                ...prev,
                memberId: member.memberId,
                memberName: fullName,
            }));
        }
    }, [member]);

    // ---------------- HANDLE INPUT ----------------
    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // ---------------- RESET ----------------
    const resetForm = () => {
        setForm({
            orderDate: new Date().toISOString().split("T")[0],
            orderRequestedDate: getDefaultDate("Substrate"),
            orderBagStatus: "Substrate",
            orderQuantity: "",
            memberId: member?.memberId || "",
            memberName: member
                ? member.nameInSinhala?.trim() ||
                  `${member.firstName ?? ""} ${member.lastName ?? ""}`.trim()
                : "",
            orderStatus: "Pending",
            orderApprovedRejectedBy: "",
            orderApprovedRejectedDate: "",
            orderCompletedDate: "",
            orderDeliveredDate: "",
            batchId: "",
            orderRemarks: "",
        });

        setEditId(null);
    };

    const formatDate = (date) =>
        date ? new Date(date).toLocaleDateString("en-CA") : "-";

    // ---------------- MODAL ----------------
    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (order) => {
        setForm({
            orderRequestedDate:
                order.orderRequestedDate?.split("T")[0],
            orderBagStatus: order.orderBagStatus,
            orderQuantity: order.orderQuantity,
            memberId: order.memberId,
            memberName: order.memberName,
            orderStatus: order.orderStatus,
            orderRemarks: order.orderRemarks || "",
        });

        setEditId(order._id);
        setIsModalOpen(true);
    };

    // ---------------- SUBMIT ----------------
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (editId) {
                await axios.put(
                    `${import.meta.env.VITE_BACKEND_URL}/api/bag-order/${editId}`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Order updated");
            } else {
                await axios.post(
                    `${import.meta.env.VITE_BACKEND_URL}/api/bag-order`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Order created");
            }

            setIsModalOpen(false);
            resetForm();
            fetchOrders();
        } catch (err) {
            toast.error("Error saving order");
        }
    };

    // ---------------- FILTER ----------------
    const filteredOrders =
        filterStatus === "All"
            ? orders
            : orders.filter(
                  (o) => o.orderStatus === filterStatus
              );

    // ---------------- STATUS COLOR ----------------
    const statusColor = (status) => {
        switch (status) {
            // 🟡 Waiting / Initial
            case "Pending":
                return "bg-yellow-100 text-yellow-800";

            // 🔵 Approved / In Progress
            case "Approved":
                return "bg-blue-100 text-blue-800";

            // 🟣 Ready / Finished Output
            case "Completed":
                return "bg-purple-100 text-purple-800";

            // 🟢 Success / Done
            case "Delivered":
                return "bg-green-100 text-green-800";

            // 🔴 Problems / Stop states
            case "Rejected":
            case "Cancelled":
            case "Discarded":
                return "bg-red-100 text-red-800";

            // ⚫ Default / Unknown
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const typeColors = {
        Substrate: "bg-emerald-100 text-emerald-700",
        Sterilized: "bg-yellow-100 text-yellow-700",
        Inoculated: "bg-blue-100 text-blue-700",
        Incubating: "bg-purple-100 text-purple-700",
    };

    return (
        <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
            {/* HEADER */}
            <div className="bg-white rounded-2xl shadow-sm border p-4 sm:p-5 mb-5">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

                    <div>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            බෑග් ඇණවුම්
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                            ඔබගේ සියලුම බෑග් ඇණවුම් මෙහි පෙන්වයි
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">

                        <select
                            value={filterStatus}
                            onChange={(e) =>
                                setFilterStatus(e.target.value)
                            }
                            className="border border-gray-300 rounded-xl px-3 py-2 bg-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
                        >
                            <option value="All">All Orders</option>
                            <option value="Pending">Pending</option>
                            <option value="Cancelled">Cancelled</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Completed">Completed</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Discarded">Discarded</option>
                        </select>

                        <button
                            onClick={openAddModal}
                            className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded-xl font-medium shadow-sm"
                        >
                            + නව ඇණවුමක්
                        </button>
                    </div>
                </div>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="block lg:hidden space-y-4">
                {loading ? (
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                        පූරණය වෙමින් පවතී...
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                        ඇණවුම් නොමැත
                    </div>
                ) : (
                    filteredOrders.map((o) => (
                        <div
                            key={o._id}
                            className="bg-white rounded-2xl shadow-sm border p-4 space-y-3"
                        >
                            <div className="flex justify-between items-start gap-3">

                                <div>
                                    <p className="text-xs text-gray-500">
                                        ඇණවුම් අංකය
                                    </p>

                                    <h3 className="font-bold text-gray-800">
                                        {o.orderNo}
                                    </h3>
                                </div>

                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                                        o.orderStatus
                                    )}`}
                                >
                                    {o.orderStatus}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">

                                <div>
                                    <p className="text-gray-500">
                                        ඇණවුම් දිනය
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(o.orderDate)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">
                                        අවශ්‍ය දිනය
                                    </p>
                                    <p className="font-medium">
                                        {formatDate(
                                            o.orderRequestedDate
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-gray-500">
                                        බෑග් වර්ගය
                                    </p>

                                    <span
                                        className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${typeColors[o.orderBagStatus]}`}
                                    >
                                        {o.orderBagStatus}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-gray-500">
                                        ප්‍රමාණය
                                    </p>

                                    <p className="font-semibold text-lg">
                                        {o.orderQuantity}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-2 border-t">
                                <button
                                    disabled={
                                        o.orderStatus !== "Pending"
                                    }
                                    onClick={() => openEditModal(o)}
                                    className={`w-full py-2 rounded-xl font-medium transition ${
                                        o.orderStatus === "Pending"
                                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                                >
                                    සංස්කරණය කරන්න
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden lg:block bg-white shadow-sm border rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">

                        <thead className="bg-gray-100 text-gray-700">
                            <tr className="text-left">
                                <th className="p-4">ඇණවුම් අංකය</th>
                                <th>ඇණවුම් දිනය</th>
                                <th>අවශ්‍ය දිනය</th>
                                <th>බෑග් වර්ගය</th>
                                <th>ප්‍රමාණය</th>
                                <th>තත්ත්වය</th>
                                <th className="text-center">
                                    ක්‍රියාව
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center p-6"
                                    >
                                        පූරණය වෙමින් පවතී...
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="7"
                                        className="text-center p-6"
                                    >
                                        ඇණවුම් කිසිවක් හමු නොවීය
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((o) => (
                                    <tr
                                        key={o._id}
                                        className="border-t hover:bg-gray-50 transition"
                                    >
                                        <td className="p-4 font-semibold">
                                            {o.orderNo}
                                        </td>

                                        <td>
                                            {formatDate(o.orderDate)}
                                        </td>

                                        <td>
                                            {formatDate(
                                                o.orderRequestedDate
                                            )}
                                        </td>

                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[o.orderBagStatus]}`}
                                            >
                                                {o.orderBagStatus}
                                            </span>
                                        </td>

                                        <td className="font-semibold">
                                            {o.orderQuantity}
                                        </td>

                                        <td>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(
                                                    o.orderStatus
                                                )}`}
                                            >
                                                {o.orderStatus}
                                            </span>
                                        </td>

                                        <td className="text-center">
                                            <button
                                                disabled={
                                                    o.orderStatus !==
                                                    "Pending"
                                                }
                                                onClick={() =>
                                                    openEditModal(o)
                                                }
                                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                                                    o.orderStatus ===
                                                    "Pending"
                                                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                }`}
                                            >
                                                සංස්කරණය කරන්න
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>

                    </table>
                </div>
            </div>

            {/* MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center z-50">

                    <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 max-h-[95vh] overflow-y-auto animate-slideUp">

                        <div className="flex justify-between items-center mb-5">

                            <div>
                                <h3 className="text-xl font-bold text-gray-800">
                                    {editId
                                        ? "යාවත්කාලීන කරන්න"
                                        : "නව ඇණවුම"}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    බෑග් ඇණවුම් තොරතුරු
                                </p>
                            </div>

                            <button
                                onClick={() =>
                                    setIsModalOpen(false)
                                }
                                className="text-red-500 border border-red-500 rounded-xl text-4xl px-2 flex items-center hover:bg-red-500 hover:text-white transition"
                            >
                                ×
                            </button>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            className="space-y-4"
                        >
                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    සාමාජික අංකය
                                </label>

                                <input
                                    disabled
                                    value={form.memberId}
                                    className="w-full border rounded-xl p-3 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    සාමාජික නම
                                </label>

                                <input
                                    disabled
                                    value={form.memberName}
                                    className="w-full border rounded-xl p-3 bg-gray-100"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    බෑග් වර්ගය
                                </label>

                                <select
                                    name="orderBagStatus"
                                    value={form.orderBagStatus}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option>Substrate</option>
                                    <option>Sterilized</option>
                                    <option>Inoculated</option>
                                    <option>Incubating</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    අවශ්‍ය දිනය
                                </label>

                                <input
                                    type="date"
                                    name="orderRequestedDate"
                                    value={form.orderRequestedDate}
                                    onChange={handleChange}
                                    min={getDefaultDate(
                                        form.orderBagStatus
                                    )}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    බෑග් ගණන
                                </label>

                                <input
                                    type="number"
                                    name="orderQuantity"
                                    value={form.orderQuantity}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    සටහන්
                                </label>

                                <textarea
                                    rows={4}
                                    name="orderRemarks"
                                    value={form.orderRemarks}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 mb-1 block">
                                    තත්ත්වය
                                </label>

                                <select
                                    name="orderStatus"
                                    value={form.orderStatus}
                                    onChange={handleChange}
                                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-green-500 outline-none"
                                >
                                    <option>Pending</option>
                                    <option>Cancelled</option>
                                </select>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-3">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsModalOpen(false)
                                    }
                                    className="w-full border border-gray-300 py-3 rounded-xl font-medium hover:bg-gray-100 transition"
                                >
                                    අවලංගු කරන්න
                                </button>

                                <button
                                    type="submit"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-medium shadow-sm transition"
                                >
                                    {editId
                                        ? "යාවත්කාලීන කරන්න"
                                        : "තහවුරු කරන්න"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}