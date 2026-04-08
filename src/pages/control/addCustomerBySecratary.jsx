import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function AddCustomerBySecratary() {

    const navigate = useNavigate();
	const [memberId, setMemberId] = useState("");
	const [title, setTitle] = useState("Mr.");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [nameInSinhala, setNameInSinhala] = useState("");
	const [address, setAddress] = useState("");
	const [memberRole, setMemberRole] = useState("member");
	const [notes, setNotes] = useState("");
	const [image, setImage] = useState([]);     // empty by default
	const [mobile, setMobile] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [dueAmount, setDueAmount] = useState(0);
	const [isAdding, setIsAdding] = useState(false);

	const handleAddProduct = async () => {
		const token = localStorage.getItem("token");
		if (!token) return toast.error("Please log in first.");

		// Required validation
		if (!firstName || !lastName || !mobile || !memberRole) {
			toast.error("Please fill in first name, last name, mobile number and member role");
			setIsAdding(false);
			return;
		}

		try {
			// Upload only if images exist
			let uploadedImages = [];
			if (image.length > 0) {
				uploadedImages = await Promise.all(image.map(img => mediaUpload(img)));
			}

			// No default image → keep empty []
			const finalImages = uploadedImages.length > 0 ? uploadedImages : [];

			const newMember = {
				memberId: memberId || undefined, // let backend assign if empty
				title,
				firstName,
				lastName,
				nameInSinhala,
				memberRole,
				address: address ? address.split(",").map(n => n.trim()).filter(Boolean) : [], 
				notes: notes || "",
				image: image.length > 0 ? await Promise.all(image.map(img => mediaUpload(img))) : [],
				mobile,
				phone: phone || null,
				dueAmount: dueAmount || 0,
			};
			if (email) newMember.email = email.trim();  // only include if non-empty

			await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/member`, newMember, {
				headers: { Authorization: `Bearer ${token}` },
			});

			toast.success("Member added successfully!");
			navigate("/members", { replace: true });

		} catch (err) {
			toast.error(err?.response?.data?.message || "Something went wrong");
		} finally {
			setIsAdding(false);
		}
	};

	return (
		<div className="w-full h-full flex flex-col p-4">
			
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
				<div>
					<h1 className="text-lg md:text-xl font-semibold text-gray-800">👤➕ Add New Members</h1>
					<p className="text-sm text-gray-500">Fill the member details to add it</p>
				</div>

				<div className="flex justify-end gap-3">
					<button
						disabled={isAdding}
						onClick={async () => { setIsAdding(true); await handleAddProduct(); }}
						className={`px-4 md:px-6 py-2 rounded-lg text-sm font-medium shadow-md text-white ${
							isAdding ? "bg-gray-500" : "bg-green-600 hover:bg-green-700"
						}`}
					>
						{isAdding ? "Adding..." : "Add Member"}
					</button>

					<Link to="/members" className="bg-red-500 hover:bg-red-600 text-white px-6 md:px-8 py-2 rounded-md text-sm font-medium shadow">
						Cancel
					</Link>
				</div>
			</div>

			{/* Form */}
			<div className="w-full h-full p-4 md:px-10 md:py-6 shadow rounded-xl border border-gray-200 flex flex-col">
				<div className="flex flex-col lg:flex-row justify-between gap-8">

					{/* Left Section */}
					<div className="w-full lg:w-1/2 space-y-4">

						{/* Member ID */}
						<div className="w-full flex flex-col sm:flex-row sm:items-end gap-3">
							<div className="w-full sm:w-1/4">
								<label className="text-sm font-medium">Member ID</label>
								{/* <input
									type="text"
									value={memberId}
									onChange={(e) => setMemberId(e.target.value.replace(/\D/g, "").slice(0, 3))}
									placeholder="e.g. 001"
									className="w-full p-2 text-sm text-center border rounded-lg"
								/> */}
							</div>
						</div>

						{/* Name + Title */}
						<div className="w-full flex flex-col sm:flex-row gap-3">
							<div className="w-full sm:w-[12%]">
								<label className="text-sm font-medium">Title</label>
								<select value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
									<option>Mr.</option><option>Mrs.</option><option>Miss.</option><option>Dr.</option><option>Prof.</option>
								</select>
							</div>

							<div className="w-full sm:w-1/2">
								<label className="text-sm font-medium">First Name</label>
								<input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
							</div>

							<div className="w-full sm:w-1/2">
								<label className="text-sm font-medium">Last Name</label>
								<input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
							</div>
						</div>

						{/* Name in Sinhala */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Name in Sinhala
							</label>
							<input
								type="text"
								value={nameInSinhala}
								onChange={(e) => setNameInSinhala(e.target.value)}
								className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								placeholder="e.g. සුනිල් ගුණවර්ධන"
							/>
						</div>

						{/* Address */}
						<div>
							<label className="text-sm font-medium">Address (comma-separated)</label>
							<input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
						</div>

						{/* Mobile / Phone / Email */}
						<div className="flex flex-col sm:flex-row justify-between gap-3">
							<div className="w-full sm:w-[20%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Mobile
								</label>
								<input 
									type="text" 
									value={mobile} 
									onChange={(e) => setMobile(e.target.value)} 
									placeholder="Mobile" 
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
								/>
							</div>
							<div className="w-full sm:w-[20%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Phone
								</label>
								<input 
									type="text" 
									value={phone} onChange={(e) => setPhone(e.target.value)} 
									placeholder="Phone" 
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
								/>
							</div>
							<div className="w-full sm:w-[50%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email
								</label>
								<input 
									type="email" 
									value={email} 
									onChange={(e) => setEmail(e.target.value)} 
									placeholder="Email" 
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
								/>
							</div>
						</div>

						{/* Member Type & Role */}
						<div className="w-full flex flex-col sm:flex-row gap-3">

							<div className="w-full sm:w-1/2">
								<label className="text-sm font-medium">Member Role</label>
								<select value={memberRole} onChange={(e) => setMemberRole(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm">
									<option value="member">Member</option>
									{/* <option value="president">President</option>
									<option value="secretary">Secretary</option>
									<option value="treasurer">Treasurer</option>
									<option value="vice-president">Vice-President</option>
									<option value="assistant-secretary">Assistant Secretary</option>
									<option value="assistant-treasurer">Assistant Treasurer</option>
									<option value="activity-coordinator">Activity Coordinator</option>
									<option value="committee-member">Committee Member</option>
									<option value="internal-auditor">Internal Auditor</option> */}
								</select>
							</div>
						</div>
					</div>

					{/* Right Section */}
					<div className="w-full lg:w-[45%] space-y-6">

						{/* Notes */}
						<div>
							<label className="text-sm font-medium">Description</label>
							<textarea rows="6" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg text-sm" />
						</div>

						{/* Preview Selected Images */}
						<div>
							<p className="text-sm font-medium">Selected Images</p>
							<div className="w-full h-35 overflow-y-auto border border-gray-300 rounded-lg p-2">
								{image.length > 0 &&
									<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
										{image.map((file, idx) => (
											<div key={idx} className="relative group border border-gray-300 rounded-lg">
												<img src={URL.createObjectURL(file)} className="w-30 h-30 rounded-lg object-cover" />
												<button onClick={() => setImage(image.filter((_, i) => i !== idx))} className="absolute top-1 right-4 bg-black text-white text-xs rounded px-1">✕</button>
											</div>
										))}
									</div>
								}
							</div>
						</div>

						{/* Upload */}
						<div>
							<label className="text-sm font-medium">Upload Images</label>
							<input type="file" multiple onChange={(e) => setImage([...e.target.files])} className="w-full text-sm text-blue-600 cursor-pointer" />
						</div>

					</div>
				</div>
			</div>

		</div>
	);
}
