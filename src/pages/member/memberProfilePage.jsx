import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import {
  FaUser,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaUserShield,
  FaMoneyBillWave,
  FaCheckCircle,
  FaTimesCircle,
  FaIdBadge,
  FaStickyNote,
} from "react-icons/fa";

export default function MemberProfilePage() {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const memberId = user?.memberId;

  useEffect(() => {
    loadMemberProfile();
  }, []);

  async function loadMemberProfile() {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMember(res.data);

    } catch (err) {
      console.log(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  /* ───────── LOADING ───────── */

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20">
        <div className="animate-pulse text-emerald-600 text-lg font-semibold">
          විස්තර පූරණය වෙමින් පවතී ...
        </div>
      </div>
    );
  }

  /* ───────── NO DATA ───────── */

  if (!member) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-10 text-center">
        <h2 className="text-xl font-semibold text-red-500">
          සාමාජික විස්තර හමු නොවීය.
        </h2>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">

      {/* PAGE TITLE */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          මගේ විස්තර
        </h1>

        <p className="text-gray-500 mt-1">
          ඔබේ සාමාජිකත්වය සහ පෞද්ගලික තොරතුරු බලන්න
        </p>
      </div>

      {/* PROFILE CARD */}
      <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-emerald-100">

        {/* TOP SECTION */}
        <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-8 text-white">

          <div className="flex flex-col md:flex-row gap-6 items-center">

            {/* IMAGE */}
            <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg bg-white">

              {member?.image?.[0] ? (
                <img
                  src={member.image[0]}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-5xl">
                  <FaUser />
                </div>
              )}

            </div>

            {/* NAME DETAILS */}
            <div className="flex-1 text-center md:text-left">

              <h2 className="text-3xl font-bold">
                {member?.title} {member?.firstName} {member?.lastName}
              </h2>

              {member?.nameInSinhala && (
                <p className="text-green-100 mt-1 text-lg">
                  {member?.nameInSinhala}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-4 justify-center md:justify-start">

                <div className="bg-white/20 px-4 py-1 rounded-full text-sm">
                  {member?.memberType}
                </div>

                <div className="bg-white/20 px-4 py-1 rounded-full text-sm capitalize">
                  {member?.memberRole}
                </div>

                <div className="bg-white/20 px-4 py-1 rounded-full text-sm">
                  ID : {member?.memberId}
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* DETAILS SECTION */}
        <div className="p-6 md:p-8">

          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* MOBILE */}
            <ProfileCard
              icon={<FaPhoneAlt />}
              title="ජංගම දුරකථන අංකය"
              value={member?.mobile || "N/A"}
            />

            {/* PHONE */}
            <ProfileCard
              icon={<FaPhoneAlt />}
              title="දුරකථන අංකය"
              value={member?.phone || "N/A"}
            />

            {/* EMAIL */}
            <ProfileCard
              icon={<FaEnvelope />}
              title="විද්‍යුත් තැපැල් ලිපිනය"
              value={member?.email || "N/A"}
            />

            {/* ROLE */}
            <ProfileCard
              icon={<FaUserShield />}
              title="සාමාජික භූමිකාව"
              value={member?.memberRole || "N/A"}
            />

            {/* MEMBER TYPE */}
            <ProfileCard
              icon={<FaIdBadge />}
              title="සාමාජික වර්ගය"
              value={member?.memberType || "N/A"}
            />

            {/* JOIN DATE */}
            <ProfileCard
              icon={<FaCalendarAlt />}
              title="සම්බන්ධ වූ දිනය"
              value={
                member?.joinDate
                  ? new Date(member.joinDate).toLocaleDateString()
                  : "N/A"
              }
            />

            {/* DUE AMOUNT */}
            <ProfileCard
              icon={<FaMoneyBillWave />}
              title="ගෙවීමට ඇති හිඟ මුදල"
              value={`Rs. ${Number(member?.dueAmount || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            })}`}
            />

            {/* ACTIVE STATUS */}
            <ProfileCard
              icon={
                member?.isActive ? (
                  <FaCheckCircle />
                ) : (
                  <FaTimesCircle />
                )
              }
              title="ගිණුම් තත්ත්වය"
              value={member?.isActive ? "Active" : "Inactive"}
            />

          </div>

          <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ADDRESS */}
                <div className="mt-8">

                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaMapMarkerAlt className="text-emerald-600" />
                    ලිපිනය
                    </h3>

                    <div className="bg-gray-50 rounded-2xl p-5 border">

                    {member?.address?.length > 0 ? (
                        member.address.map((line, index) => (
                        <p key={index} className="text-gray-700">
                            {line}
                        </p>
                        ))
                    ) : (
                        <p className="text-gray-400">
                        ලිපිනයක් නොමැත
                        </p>
                    )}

                    </div>
                </div>

                {/* NOTES */}
                <div className="mt-8">

                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <FaStickyNote className="text-emerald-600" />
                        සටහන්
                    </h3>

                    {member?.notes ? (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5 text-gray-700">
                        {member.notes}
                        </div>
                    ) : (
                        <p className="text-gray-400">
                        කිසිදු සටහනක් නොමැත
                        </p>
                    )}

                </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ───────── PROFILE CARD ───────── */

function ProfileCard({ icon, title, value }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 hover:shadow-md transition">

      <div className="flex items-center gap-3 mb-3">

        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
          {icon}
        </div>

        <h3 className="text-sm font-semibold text-gray-700">
          {title}
        </h3>

      </div>

      <p className="text-gray-800 break-words">
        {value}
      </p>

    </div>
  );
}