import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUser, FaEdit, FaTrash } from "react-icons/fa";

Modal.setAppElement("#root");

export default function MembersPage() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const roleMap = {
    admin: "Admin",
    member: "Member",
    president: "President",
    secretary: "Secretary",
    treasurer: "Treasurer",
    "vice-president": "Vice President",
    "assistant-secretary": "Assistant Secretary",
    "assistant-treasurer": "Assistant Treasurer",
  };

  const getRoleLabel = (role) =>
    roleMap[role?.toLowerCase()] || role;

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/api/member")
      .then((res) => {
        const sorted = res.data.sort((a, b) =>
          a.memberId.localeCompare(b.memberId)
        );

        setCustomers(sorted);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setIsLoading(false);
      });
  }, [location]);

  const getImageUrl = (img) =>
    img?.startsWith("http")
      ? img
      : import.meta.env.VITE_BACKEND_URL + img;

  const deleteMember = (memberId) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      axios
        .delete(`${import.meta.env.VITE_BACKEND_URL}/api/member/${memberId}`)
        .then(() => {
          setCustomers((prev) =>
            prev.filter((member) => member.memberId !== memberId)
          );
          alert("Member deleted successfully.");
        })
        .catch((err) => {
          console.error("Error deleting member:", err);
          alert("Failed to delete member. Please try again.");
        });
    }
  };

  
  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen p-3 flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex md:flex-row flex-col justify-between gap-2 px-4 py-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              🧑‍🤝‍🧑 Members List
            </h1>
            <p className="text-gray-600 text-sm">
              View and manage all registered members
            </p>
          </div>

          <button
            onClick={() => navigate("/add-member")}
            className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
          >
            + Add Member
          </button>

          <button
            onClick={() => navigate("/member-ledger")}
            className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
          >
            Member Ledger
          </button>

          <button
            onClick={() => navigate("/")}
            className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
          >
            ← Go Back
          </button>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white rounded-lg shadow flex-1 overflow-hidden">
        <div className="h-full max-h-[65vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-200 table-fixed">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="px-3 py-2 text-left">#</th>
                      <th className="px-3 py-2 text-center">Image</th>
                      <th className="px-3 py-2 text-center">ID</th>
                      <th className="px-3 py-2 text-left">Name</th>
                      <th className="px-3 py-2 text-left">M/Type</th>
                      <th className="px-3 py-2 text-left">Address</th>
                      <th className="px-3 py-2 text-left">Mobile</th>
                      <th className="px-3 py-2 text-right">Due Amount</th>
                      <th className="px-3 py-2 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200">
                    {customers.map((item, index) => (
                      <tr
                        key={item.memberId}
                        onClick={() => {
                          setActiveRecord(item);
                          setIsModalOpen(true);
                        }}
                        className="hover:bg-orange-50 cursor-pointer"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 text-center">
                          <img
                            src={
                              Array.isArray(item.image) && item.image.length > 0
                                ? getImageUrl(item.image[0])
                                : "/userDefault.jpg"
                            }
                            className="w-14 h-14 rounded-full object-cover mx-auto"
                          />
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.memberId}
                        </td>
                        <td className="px-3 py-2">
                          {item.nameInSinhala
                            ? item.nameInSinhala
                            : `${item.firstName} ${item.lastName}`}
                        </td>
                        <td className="px-3 py-2">
                          {getRoleLabel(item.memberRole)}
                        </td>
                        <td className="px-3 py-2 break-words">
                          {Array.isArray(item.address)
                            ? item.address.filter(Boolean).join(", ")
                            : item.address || "-"}
                        </td>
                        <td className="px-3 py-2">{item.mobile}</td>
                        <td className="px-3 py-2 text-right">
                          {item.dueAmount ? `Rs. ${item.dueAmount}` : "—"}
                        </td>
                        <td className="px-3 py-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate("/edit-member", { state: { member: item } });
                            }}
                            className="text-lg text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteMember(item.memberId);
                            }}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col gap-3 p-3">
                {customers.map((item) => (
                  <div
                    key={item.memberId}
                    onClick={() => {
                      setActiveRecord(item);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-3 border border-orange-200 rounded-lg shadow-sm hover:bg-orange-50 cursor-pointer"
                  >
                    <img
                      src={
                        Array.isArray(item.image) && item.image.length > 0
                          ? getImageUrl(item.image[0])
                          : "/userDefault.jpg"
                      }
                      className="w-14 h-14 rounded-full object-cover"
                    />

                    <div className="flex-1">
                      <p className="font-semibold">
                        {item.nameInSinhala
                          ? item.nameInSinhala
                          : `${item.firstName} ${item.lastName}`}
                      </p>

                      <p className="text-sm text-gray-600">
                        {getRoleLabel(item.memberRole)}
                      </p>

                      <p className="text-sm text-gray-600">
                        {item.memberId} {item.mobile}
                      </p>

                      <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600">
                          {item.dueAmount ? `Rs. ${item.dueAmount}` : "—"}
                        </p>

                        {/* ✅ FIXED HERE */}
                        <div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card click
                              navigate("/edit-member", { state: { member: item } });
                            }}
                            className="text-lg text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent card click
                              deleteMember(item.memberId);
                            }}
                            className="text-red-600 hover:text-red-800 ml-2"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center p-3"
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5"
      >
        {activeRecord && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-600">
                Member Details
              </h2>
              <button onClick={() => setIsModalOpen(false)}>✖</button>
            </div>

            <div className="flex justify-center">
              {Array.isArray(activeRecord.image) &&
              activeRecord.image.length > 0 ? (
                <img
                  src={getImageUrl(activeRecord.image[0])}
                  className="w-28 h-28 rounded-full object-cover border-4 border-orange-300"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center">
                  <FaUser size={40} />
                </div>
              )}
            </div>

            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Member ID", activeRecord.memberId],
                  [
                    "Name",
                    `${activeRecord.title || ""} ${activeRecord.firstName || ""} ${activeRecord.lastName || ""}`,
                  ],
                  ["Name in Sinhala", activeRecord.nameInSinhala],
                  ["Address", Array.isArray(activeRecord.address) ? activeRecord.address.filter(Boolean).join(", ") : activeRecord.address],
                  ["Mobile", activeRecord.mobile],
                  ["Email", activeRecord.email],
                  ["Role", getRoleLabel(activeRecord.memberRole)],
                  ["Status", activeRecord.isActive ? "Active" : "Inactive"],
                  ["Due Amount", activeRecord.dueAmount ? `Rs. ${activeRecord.dueAmount}` : "None"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b">
                    <td className="py-2 font-medium text-orange-600">
                      {label}
                    </td>
                    <td className="py-2 text-right">{value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Bottom Close Button */}
      <button
        onClick={() => navigate("/")}
        className="h-12 rounded-lg border bg-orange-100 hover:bg-orange-200 font-semibold"
      >
        Close
      </button>
    </div>
  );
}
