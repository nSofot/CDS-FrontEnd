import { useState, useEffect } from "react";
import { useNavigate,Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import mediaUpload from "../../utils/mediaUpload";

export default function MemberProfilePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [member, setMember] = useState({});
    const [isEdit, setIsEdit] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

	const [address, setAddress] = useState("");
	const [mobile, setMobile] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const currentYear = new Date().getFullYear();
	const [periodInSchoolFrom, setPeriodInSchoolFrom] = useState(currentYear);
	const [periodInSchoolTo, setPeriodInSchoolTo] = useState(currentYear);
	const [existingImages, setExistingImages] = useState([]);
	const [image, setImage] = useState([]);        

    const navigate = useNavigate();

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    useEffect(() => {
        if (user?.memberId) {
        if (user.memberId.length === 4) {
            searchCustomer(user.memberId);
        }
        }
    }, [user?.memberId]);

    const searchCustomer = async (id) => {
        if (!id || id === "0") return;

        setIsLoading(true);
        try {
        const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/member/${id}`
        );
        if (res.data) {
            setMember(res.data);
            setAddress(Array.isArray(res.data.address) ? res.data.address.join(", ") : res.data.address || "");
            setMobile(res.data.mobile || "");
            setPhone(res.data.phone || "");
            setEmail(res.data.email || "");
            setPeriodInSchoolFrom(res.data.periodInSchoolFrom || "");
            setPeriodInSchoolTo(res.data.periodInSchoolTo || "");
            setExistingImages(res.data.image || []);
        }
        } catch (err) {
        toast.error(err.response?.data?.message || "Invalid Member ID");
        } finally {
        setIsLoading(false);
        }
    };

    const updateProduct = async () => {
        let uploadedNewImages = [];

        // Upload new images if selected
        if (image.length > 0) {
        const uploadPromises = image.map((img) => mediaUpload(img));
        uploadedNewImages = await Promise.all(uploadPromises);
        }

        const updatedMember = {
            address: address
                ? address.split(",").map(n => n.trim()).filter(Boolean)  // remove empty strings
                : undefined,
            periodInSchoolFrom,
            periodInSchoolTo,	
            image: [...existingImages, ...uploadedNewImages].length > 0
                ? [...existingImages, ...uploadedNewImages]
                : [],
            mobile: mobile || undefined,
            phone: phone || undefined,
            email: email?.trim() || undefined,
        };            
        
        try {
            await axios.put(
                `${import.meta.env.VITE_BACKEND_URL}/api/member/${member.memberId}`,
                updatedMember
            );
            toast.success("Member profile updated successfully");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update member profile");
        } finally {
            setIsUpdating(false);
        }
    };


    return (
        <div className="w-full h-full flex flex-col space-y-6 overflow-hidden">
            <div className="bg-white shadow rounded-md max-h-[calc(100vh-150px)] space-y-8 overflow-y-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-4 justify-between bg-gray-50 shadow-lg rounded-xl p-6 border-l-6 border-green-700">
                    <div className="">
                        <h1 className="text-xl font-semibold text-gray-800">
                            ✏️ Member Profile
                        </h1>
                        <p className="text-sm text-gray-500">
                            Member details and information overview.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        <button
                            disabled={isUpdating}
                            onClick={async () => {
                                if (!isEdit){
                                    setIsEdit(true);
                                    setIsUpdating(false);
                                    return;
                                } else {
                                    setIsUpdating(true);
                                    await updateProduct();
                                    setIsUpdating(false);
                                    setIsEdit(false);
                                }
                            }}
                            className={`w-full md:w-auto px-6 h-12 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-800 transition ${
                                isUpdating ? "opacity-50 cursor-not-allowed" : isEdit ? "bg-green-600 hover:bg-green-700" : ""
                            }`}
                        >
                            {isUpdating
                                ? "Updating..."
                                : isEdit
                                ? "Update Profile"
                                : "Edit Profile"}
                        </button>

                        <Link
                            to="/"
                            className="w-full md:w-auto px-6 py-3 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
                            >
                            ← Go Home
                        </Link>
                    </div>
                </div>


                {isLoading ? (
                    <p className="text-center text-gray-600">Loading...</p>
                ) : member && Object.keys(member).length > 0 ? (
                    //   <div className="bg-gray-50 shadow-lg rounded-xl p-6 space-y-4 border-l-6 border-blue-700">
                    <div className="bg-white w-full p-4 sm:p-8 shadow rounded-xl border border-gray-200">
                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                            {/* Left Column */}
                            <div className="flex flex-col gap-3 flex-1 space-y-4">
                                <div className="w-20">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Member Id
                                    </label>
                                    <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                        {member.memberId || "—"}
                                    </div>
                                </div>         

                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="w-full sm:w-[12%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Title
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.title || "—"}
                                        </div>
                                    </div>
                             
                                    <div className="w-full sm:flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.firstName || "—"}
                                        </div>
                                    </div>

                                    <div className="w-full sm:flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50">
                                            {member.lastName || "—"}
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Address
                                    </label>
                                    <input
                                        disabled={!isEdit}
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                            isEdit ? "border-green-300" : "border-gray-300"
                                        }`}
                                        placeholder="e.g. 45/B, Colombo Road, Galle"
                                    />
                                </div>	  

                                {/* Contact Section */}
                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="w-full sm:w-[20%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Mobile
                                        </label>
                                        <input
                                            disabled={!isEdit}
                                            type="text"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                                isEdit ? "border-green-300" : "border-gray-300 bg-gray-100 cursor-not-allowed"
                                            }`}
                                        />
                                    </div>

                                    <div className="w-full sm:w-[20%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            disabled={!isEdit}
                                            type="text"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                                isEdit ? "border-green-300" : "border-gray-300 bg-gray-100 cursor-not-allowed"
                                            }`}
                                        />
                                    </div>

                                    <div className="w-full sm:w-[50%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            disabled={!isEdit}
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className={`w-full p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                                                isEdit ? "border-green-300" : "border-gray-300 bg-gray-100 cursor-not-allowed"
                                            }`}
                                        />
                                    </div>
                                </div>


                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="w-full sm:w-[20%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Period In School
                                        </label>
                                        <input
                                            disabled={!isEdit}
                                            type="number"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            value={periodInSchoolFrom}
                                            onChange={(e) => setPeriodInSchoolFrom(Number(e.target.value))}
                                            className={`w-full p-2 text-sm border rounded-lg ${
                                                isEdit
                                                    ? "border-green-300 focus:ring-2 focus:ring-blue-500"
                                                    : "border-gray-300 bg-gray-100 cursor-not-allowed"
                                            }`}
                                        />
                                    </div>

                                    <div className="w-full sm:w-[20%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Up To
                                        </label>
                                        <input
                                            disabled={!isEdit}
                                            type="number"
                                            min="1900"
                                            max={new Date().getFullYear()}
                                            value={periodInSchoolTo}
                                            onChange={(e) => setPeriodInSchoolTo(Number(e.target.value))}
                                            className={`w-full p-2 text-sm border rounded-lg ${
                                                isEdit
                                                    ? "border-green-300 focus:ring-2 focus:ring-blue-500"
                                                    : "border-gray-300 bg-gray-100 cursor-not-allowed"
                                            }`}
                                        />
                                    </div>
		
                                    <div className="w-full sm:w-[50%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Invitee
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg">
                                            {member.invitedBy || "—"}                                            
                                        </div>
                                    </div>																		
                                </div>

                                <div className="flex flex-col sm:flex-row justify-between gap-3">
                                    <div className="w-full sm:w-[45%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Member Type
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 capitalize">
                                            {member.memberType || "Not Assigned"}
                                        </div>
                                    </div>    

                                    <div className="w-full sm:w-[50%]">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Member Role
                                        </label>
                                        <div className="w-full p-2 text-sm border border-gray-300 rounded-lg bg-gray-50 capitalize">
                                            {member.memberRole || "Not Assigned"}
                                        </div>
                                    </div>                                      
                                </div>  
                            </div>

                            {/* Right Column */}
                            <div className="flex flex-col gap-3 flex-1 space-y-4 md:mt-22">     
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                    </label>
                                    <textarea
                                        disabled={true}
                                        rows="6"
                                        value={member.notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Additional notes about the member..."
                                    ></textarea>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <p className="text-sm font-medium text-gray-700 mb-2">
                                        Existing & New Images
                                    </p>

                                    <div
                                        className={`w-full h-35 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-2 rounded-lg shadow-inner border ${
                                            isEdit ? "border-green-300" : "border-gray-300 bg-gray-100"
                                        }`}
                                    >
                                        {/* Existing Images */}
                                        {existingImages.map((imgUrl, index) => (
                                            <div
                                                key={`existing-${index}`}
                                                className="relative rounded-md overflow-hidden"
                                            >
                                                <img
                                                    src={imgUrl}
                                                    alt=""
                                                    className="w-30 h-30 rounded-lg object-cover"
                                                />

                                                {isEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setExistingImages(
                                                                existingImages.filter((_, i) => i !== index)
                                                            )
                                                        }
                                                        className="absolute top-1 right-4 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full hover:bg-red-600"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}

                                        {/* New Images */}
                                        {image.map((file, index) => (
                                            <div
                                                key={`new-${index}`}
                                                className="relative rounded-md overflow-hidden"
                                            >
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt=""
                                                    className="w-30 h-30 rounded-lg object-cover"
                                                />

                                                {isEdit && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setImage(image.filter((_, i) => i !== index))
                                                        }
                                                        className="absolute top-1 right-4 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full hover:bg-red-600"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Add New Images (optional)
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            disabled={!isEdit}
                                            onChange={(e) => {
                                                const files = Array.from(e.target.files);
                                                setImage((prev) => [...prev, ...files]);
                                            }}
                                            className={`w-full text-sm ${
                                                isEdit
                                                    ? "text-blue-600 cursor-pointer"
                                                    : "text-gray-400 cursor-not-allowed"
                                            }`}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ) : (
                <p className="text-center text-blue-700">
                    Sorry, no member found.
                </p>
                )}
            </div>
        </div>
    );
}