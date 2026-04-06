import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import { useNavigate, useLocation } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUser, FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";

Modal.setAppElement("#root");

export default function PendingMembersPage() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  const navigate = useNavigate();
  const location = useLocation();

  const typeMap = {
    "ordinary": "Ordinary Member",
    "life": "Life Member",
    "associate": "Associate Member",
    "honorary": "Honorary Member",
    "overseas": "Overseas Member"
  };


  useEffect(() => {
      window.scrollTo(0, 0);
      setIsLoading(true);

      axios
        .get(import.meta.env.VITE_BACKEND_URL + "/api/member")
        .then((res) => {
          // Filter out members with memberRole "guest"
          const filtered = res.data.filter(member => member.memberRole === "guest");

          // Sort remaining members by memberId
          const sorted = filtered.sort((a, b) =>
            a.memberId.localeCompare(b.memberId)
          );

          setMembers(sorted);
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


  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this member?\nThis action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        import.meta.env.VITE_BACKEND_URL + `/api/member/${id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setMembers(prev => prev.filter(m => m.memberId !== id));
      toast.success("Member deleted");
    } catch (error) {
      console.error("Error deleting member:", error);
      toast.error(error.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen p-3 flex flex-col gap-4">
      <div className="bg-white border-b border-gray-200">
        <div className="flex md:flex-row justify-between flex-col gap-2 px-4 py-3">
          {/* Header */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-orange-600">
              🧑‍🤝‍🧑 Pending Member Approvals
            </h1>
            <p className="text-gray-600 text-sm">Review and approve new member registrations awaiting verification</p>
          </div>

          {/* Back Button */}
          <div className="pt-2">
            <button
              onClick={() => navigate("/control")}
              className="w-full md:w-auto px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              ← Go Back
            </button>
          </div>
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
                      <th className="w-5 px-3 py-2 text-left">#</th>
                      <th className="w-16 px-3 py-2 text-center">Image</th>
                      <th className="w-10 px-3 py-2 text-center">ID</th>
                      <th className="w-50 px-3 py-2 text-left">Name</th>
                      <th className="w-70 px-3 py-2 text-left">Address</th>
                      <th className="w-10 px-3 py-2 text-left">Mobile</th>
                      <th className="w-10 px-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200">
                    {members.map((item, index) => (
                      <tr
                        key={item.memberId}
                        onClick={() => {
                          setActiveRecord(item);
                          setIsModalOpen(true);
                        }}
                        className="hover:bg-orange-50 cursor-pointer"
                      >
                        <td className="px-3 py-2 text-left">{index + 1}</td>
                        <td className="px-3 py-2 text-center">
                          {Array.isArray(item.image) && item.image.length > 0 ? (
                            <img
                              src={getImageUrl(item.image[0])}
                              className="w-15 h-15 rounded-full object-cover mx-auto"
                            />
                          ) : (
                            <img
                              src="/userDefault.jpg"
                              className="w-15 h-15 rounded-full object-cover mx-auto"
                            />
                          )}
                        </td>
                        <td className="px-3 py-2 text-center">{item.memberId}</td>
                        <td className="px-3 py-2 text-left break-words">
                          {item.title} {item.firstName} {item.lastName}
                        </td>                      
                        <td className="px-3 py-2 text-left break-words">
                          {Array.isArray(item.address)
                            ? item.address.filter(Boolean).join(", ")
                            : item.address || "-"}
                        </td>
                        <td className="px-3 py-2 text-left">{item.mobile}</td>
                          <td className="px-3 py-2">
                              <div className="flex gap-3 justify-center">
                                  <button
                                  onClick={(e) => {
                                      e.stopPropagation(); // Prevent triggering row click
                                      navigate("/control/member-approval", {
                                      state: {
                                          memberId: item.memberId,
                                          title: item.title,
                                          firstName: item.firstName,
                                          lastName: item.lastName,
                                          address: item.address,
                                          mobile: item.mobile,
                                          phone: item.phone,
                                          email: item.email,
                                          periodInSchoolFrom: item.periodInSchoolFrom,
                                          periodInSchoolTo: item.periodInSchoolTo,
                                          invitedBy: item.invitedBy,
                                          notes: item.notes,
                                          image: item.image,
                                          memberType: item.memberType,
                                          memberRole: item.memberRole,
                                          
                                      },
                                      });
                                  }}
                                  className="px-3 py-2 text-blue-600 hover:text-blue-800"
                                  >
                                  <FaEdit className="text-xl" />
                                  </button>
                                  <button
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(item.memberId);
                                  }}
                                  className="px-3 py-2 text-red-600 hover:text-red-800"
                                  >
                                  <FaTrash className="text-xl" />
                                  </button>
                              </div>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col gap-3 p-3">
                {members.map((item) => (
                  <div
                    key={item.memberId}
                    onClick={() => {
                      setActiveRecord(item);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-3 border border-orange-200 rounded-lg shadow-sm hover:bg-orange-50 cursor-pointer"
                  >
                    {Array.isArray(item.image) && item.image.length > 0 ? (
                      <img
                        src={getImageUrl(item.image[0])}
                        className="w-15 h-15 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-15 h-15 rounded-full bg-gray-200 flex items-center justify-center">
                        <img
                          src="/userDefault.jpg"
                          className="w-15 h-15 rounded-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1">
                      <p className="font-semibold">
                        {item.title} {item.firstName} {item.lastName}
                      </p>
                      <p className="text-sm text-gray-600">
                            {typeMap[item.memberType?.toLowerCase()]}
                      </p>                    
                      <p className="text-sm text-gray-600">{item.memberId}</p>
                      <p className="text-sm text-gray-600">{item.mobile}</p>
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
            {/* Modal Header */}
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-600">
                Member Details
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-lg font-bold"
              >
                ✖
              </button>
            </div>

            {/* Image */}
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

            {/* Details */}
            <table className="w-full text-sm">
              <tbody>
                {[
                  ["Member ID", activeRecord.memberId],
                  [
                    "Name",
                    `${activeRecord.title || ""} ${activeRecord.firstName || ""} ${activeRecord.lastName || ""}`,
                  ],
                  ["Mobile", activeRecord.mobile],
                  ["Phone", activeRecord.phone],
                  ["Email", activeRecord.email],
                  ["Address", Array.isArray(activeRecord.address) ? activeRecord.address.filter(Boolean).join(", ") : activeRecord.address || "-"],
                  ["Member Type", activeRecord.memberType],
                  ["Role", activeRecord.memberRole],
                  ["Status", activeRecord.isActive ? "Active" : "Inactive"],
                ].map(([label, value]) => (
                  <tr key={label} className="border-b border-orange-200">
                    <td className="py-2 font-medium text-orange-600">{label}</td>
                    <td className="py-2 text-right">{value || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* Close Button */}
      <button
        onClick={() => navigate("/control")}
        className="h-12 rounded-lg border border-gray-700 bg-orange-100 text-gray-700 hover:bg-orange-200 font-semibold"
      >
        Close
      </button>
    </div>
  );
}
