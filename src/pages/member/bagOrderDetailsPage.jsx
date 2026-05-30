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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-slate-100 p-3 sm:p-5 md:p-6">

        {/* HEADER */}

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-sm border border-emerald-100 p-4 sm:p-5 mb-5">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

            <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center shadow-sm">

                <span className="text-2xl text-emerald-700">
                🛍️
                </span>
            </div>

            <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                බෑග් ඇණවුම්
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                ඔබගේ සියලුම බෑග් ඇණවුම් මෙහි පෙන්වයි
                </p>
            </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

            <select
                value={filterStatus}
                onChange={(e) =>
                setFilterStatus(e.target.value)
                }
                className="border border-emerald-200 rounded-2xl px-4 py-3 bg-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none shadow-sm"
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
                className="bg-emerald-600 hover:bg-emerald-700 transition-all text-white px-5 py-3 rounded-2xl font-medium shadow-md hover:shadow-lg active:scale-[0.98]"
            >
                + නව ඇණවුමක්
            </button>
            </div>
        </div>
        </div>

        {/* MOBILE CARD VIEW */}

        <div className="block lg:hidden space-y-4">

        {loading ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-emerald-100 text-gray-500">
            පූරණය වෙමින් පවතී...
            </div>
        ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-emerald-100 text-gray-500">
            ඇණවුම් නොමැත
            </div>
        ) : (
            filteredOrders.map((o) => (
            <div
                key={o._id}
                className="bg-white rounded-3xl shadow-sm border border-emerald-100 p-4 space-y-4 hover:shadow-md transition-all"
            >

                {/* TOP */}

                <div className="flex justify-between items-start gap-3">

                <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                    ඇණවුම් අංකය
                    </p>

                    <h3 className="font-bold text-lg text-gray-800 mt-1">
                    {o.orderNo}
                    </h3>
                </div>

                <span
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${statusColor(
                    o.orderStatus
                    )}`}
                >
                    {o.orderStatus}
                </span>
                </div>

                {/* INFO GRID */}

                <div className="grid grid-cols-2 gap-4 text-sm">

                <div className="bg-emerald-50 rounded-2xl p-3">
                    <p className="text-gray-500 text-xs">
                    ඇණවුම් දිනය
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                    {formatDate(o.orderDate)}
                    </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-3">
                    <p className="text-gray-500 text-xs">
                    අවශ්‍ය දිනය
                    </p>

                    <p className="font-semibold text-gray-800 mt-1">
                    {formatDate(
                        o.orderRequestedDate
                    )}
                    </p>
                </div>

                <div className="bg-orange-50 rounded-2xl p-3">
                    <p className="text-gray-500 text-xs mb-2">
                    බෑග් වර්ගය
                    </p>

                    <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${typeColors[o.orderBagStatus]}`}
                    >
                    {o.orderBagStatus}
                    </span>
                </div>

                <div className="bg-purple-50 rounded-2xl p-3">
                    <p className="text-gray-500 text-xs">
                    ප්‍රමාණය
                    </p>

                    <p className="font-bold text-2xl text-gray-800 mt-1">
                    {o.orderQuantity}
                    </p>
                </div>
                </div>

                {/* ACTION */}

                <div className="pt-2">

                <button
                    disabled={
                    o.orderStatus !== "Pending"
                    }
                    onClick={() => openEditModal(o)}
                    className={`w-full py-3 rounded-2xl font-medium transition-all shadow-sm ${
                    o.orderStatus === "Pending"
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
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

        <div className="hidden lg:block bg-white shadow-sm border border-emerald-100 rounded-3xl overflow-hidden">

        <div className="overflow-x-auto">

            <table className="w-full text-sm">

            <thead className="bg-emerald-50 text-gray-700 border-b border-emerald-100">

                <tr className="text-left">
                <th className="p-5 font-semibold">
                    ඇණවුම් අංකය
                </th>

                <th className="font-semibold">
                    ඇණවුම් දිනය
                </th>

                <th className="font-semibold">
                    අවශ්‍ය දිනය
                </th>

                <th className="font-semibold">
                    බෑග් වර්ගය
                </th>

                <th className="font-semibold">
                    ප්‍රමාණය
                </th>

                <th className="font-semibold">
                    තත්ත්වය
                </th>

                <th className="text-center font-semibold">
                    ක්‍රියාව
                </th>
                </tr>
            </thead>

            <tbody>

                {loading ? (
                <tr>
                    <td
                    colSpan="7"
                    className="text-center p-10 text-gray-500"
                    >
                    පූරණය වෙමින් පවතී...
                    </td>
                </tr>
                ) : filteredOrders.length === 0 ? (
                <tr>
                    <td
                    colSpan="7"
                    className="text-center p-10 text-gray-500"
                    >
                    ඇණවුම් කිසිවක් හමු නොවීය
                    </td>
                </tr>
                ) : (
                filteredOrders.map((o) => (
                    <tr
                    key={o._id}
                    className="border-t border-gray-100 hover:bg-emerald-50/40 transition-all"
                    >

                    <td className="p-5 font-bold text-gray-800">
                        {o.orderNo}
                    </td>

                    <td className="text-gray-700">
                        {formatDate(o.orderDate)}
                    </td>

                    <td className="text-gray-700">
                        {formatDate(
                        o.orderRequestedDate
                        )}
                    </td>

                    <td>
                        <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${typeColors[o.orderBagStatus]}`}
                        >
                        {o.orderBagStatus}
                        </span>
                    </td>

                    <td className="font-bold text-gray-800">
                        {o.orderQuantity}
                    </td>

                    <td>
                        <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
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
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                            o.orderStatus ===
                            "Pending"
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4">

            <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-emerald-100 p-5 sm:p-6 max-h-[95vh] overflow-y-auto animate-slideUp">

            {/* MODAL HEADER */}

            <div className="flex justify-between items-center mb-6">

                <div>
                <h3 className="text-2xl font-bold text-gray-800">
                    {editId
                    ? "යාවත්කාලීන කරන්න"
                    : "නව ඇණවුම"}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                    බෑග් ඇණවුම් තොරතුරු
                </p>
                </div>

                <button
                onClick={() =>
                    setIsModalOpen(false)
                }
                className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all text-2xl flex items-center justify-center"
                >
                ×
                </button>
            </div>

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="space-y-4"
            >

                {/* MEMBER ID */}

                <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                    සාමාජික අංකය
                </label>

                <input
                    disabled
                    value={form.memberId}
                    className="w-full border border-gray-200 rounded-2xl p-3 bg-gray-100 text-gray-600"
                />
                </div>

                {/* MEMBER NAME */}

                <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                    සාමාජික නම
                </label>

                <input
                    disabled
                    value={form.memberName}
                    className="w-full border border-gray-200 rounded-2xl p-3 bg-gray-100 text-gray-600"
                />
                </div>

                {/* BAG TYPE */}

                <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                    බෑග් වර්ගය
                </label>

                <select
                    name="orderBagStatus"
                    value={form.orderBagStatus}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                    <option>Substrate</option>
                    <option>Sterilized</option>
                    <option>Inoculated</option>
                    <option>Incubating</option>
                </select>
                </div>

                {/* DATE */}

                <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
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
                    className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                </div>

                {/* QUANTITY */}

                <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                    බෑග් ගණන
                </label>

                <input
                    type="number"
                    name="orderQuantity"
                    value={form.orderQuantity}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                </div>

                {/* REMARKS */}

                <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                    සටහන්
                </label>

                <textarea
                    rows={4}
                    name="orderRemarks"
                    value={form.orderRemarks}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                />
                </div>

                {/* STATUS */}

                <div>
                <label className="text-sm font-medium text-gray-600 mb-2 block">
                    තත්ත්වය
                </label>

                <select
                    name="orderStatus"
                    value={form.orderStatus}
                    onChange={handleChange}
                    className="w-full border border-gray-200 rounded-2xl p-3 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                    <option>Pending</option>
                    <option>Cancelled</option>
                </select>
                </div>

                {/* BUTTONS */}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">

                <button
                    type="button"
                    onClick={() =>
                    setIsModalOpen(false)
                    }
                    className="w-full border border-gray-300 py-3 rounded-2xl font-medium hover:bg-gray-100 transition-all"
                >
                    අවලංගු කරන්න
                </button>

                <button
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-medium shadow-md transition-all"
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