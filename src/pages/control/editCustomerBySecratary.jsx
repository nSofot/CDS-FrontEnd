import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function EditMember() {
	const [isLoading, setIsLoading] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [expanded, setExpanded] = useState("basic"); 

	// Example states (replace with your actual ones)
	const [member, setMember] = useState({});
	const [memberId, setMemberId] = useState("");
	const [title, setTitle] = useState("");
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [nameInSinhala, setNameInSinhala] = useState("");
	const [memberRole, setMemberRole] = useState("");	
	const [address, setAddress] = useState("");
	const [mobile, setMobile] = useState("");
	const [phone, setPhone] = useState("");
	const [email, setEmail] = useState("");
	const [notes, setNotes] = useState("");
	const [existingImages, setExistingImages] = useState([]);
	const [image, setImage] = useState([]);
	const [dueAmount, setDueAmount] = useState(0);

	const navigate = useNavigate();

	const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user") || "null");

    // if (!user) navigate("/control");
    // if (user.memberRole !== 'secretary') navigate("/control");

    const searchCustomer = async (id) => {
        if (!id || id === "0") return;

        setIsLoading(true);
        try {         
            // Fetch applicant details
            const res = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/member/${id}`
            );
            if (res.data) {
                setMember(res.data);
				setMemberId(res.data.memberId || "");
				setTitle(res.data.title || "");
				setFirstName(res.data.firstName || "");
				setLastName(res.data.lastName || "");
				setNameInSinhala(res.data.nameInSinhala || "");
				setMemberRole(res.data.memberRole || "");
				setAddress(Array.isArray(res.data.address) ? res.data.address.join(", ") : res.data.address || "");
				setNotes(res.data.notes || "");
				setMobile(res.data.mobile || "");
				setPhone(res.data.phone || "");
				setEmail(res.data.email || "");
				setExistingImages(res.data.image || "");
				setDueAmount(res.data.dueAmount || 0);
            }           
        } catch (err) {
            toast.error(err.response?.data?.message || "Invalid Member ID");
        } finally {
            setIsLoading(false);
        }
    };

	useEffect(() => {
	if (location.state) {
		const data = location.state;
		setMemberId(data.memberId || "");
		setTitle(data.title || "");
		setFirstName(data.firstName || "");
		setLastName(data.lastName || "");
		setNameInSinhala(data.nameInSinhala || "");
		setMemberRole(data.memberRole || "");
		setAddress(Array.isArray(data.address) ? data.address.join(", ") : data.address || "");
		setNotes(data.notes || "");
		setMobile(data.mobile || "");
		setPhone(data.phone || "");
		setEmail(data.email || "");
		setExistingImages(data.image || []);
		setDueAmount(data.dueAmount || 0);
	}
	}, [location.state]);



	async function updateProduct() {
		setIsUpdating(true);

		// Validate basic fields
		if (!firstName || !lastName || !mobile || !memberRole) {
			toast.error("Please fill in all required fields");
			setIsUpdating(false);
			return;
		}

		// validate member role
		const validRoles = ['admin',
							'member', 
							'president', 
							'secretary', 
							'treasurer', 
							'vice-president', 
							'assistant-secretary', 
							'assistant-treasurer', 
							'internal-auditor'
							];
		if (!validRoles.includes(memberRole)) {
			toast.error("Please select a valid member role");
			setIsUpdating(false);
			return;
		}
		if (memberRole === 'admin' || 
			memberRole === 'member' ||
			memberRole === 'president' ||
			memberRole === 'secretary' ||
			memberRole === 'treasurer' ||
			memberRole === 'vice-president' ||
			memberRole === 'assistant-secretary' ||
			memberRole === 'assistant-treasurer' ||
			memberRole === 'internal-auditor'	
		) {
			const response = await axios.get(
				`${import.meta.env.VITE_BACKEND_URL}/api/member/`

			);
			const adminCount = response.data.filter(
				(cust) => cust.memberRole === 'admin' && cust.memberId !== memberId
				).length;
			const presidentCount = response.data.filter(
				(cust) => cust.memberRole === 'president' && cust.memberId !== memberId
				).length;
			const secretaryCount = response.data.filter(
				(cust) => cust.memberRole === 'secretary' && cust.memberId !== memberId
				).length;
			const treasurerCount = response.data.filter(
				(cust) => cust.memberRole === 'treasurer' && cust.memberId !== memberId
				).length;
			const vicePresidentCount = response.data.filter(
				(cust) => cust.memberRole === 'vice-president' && cust.memberId !== memberId
				).length;
			const assistantSecretaryCount = response.data.filter(
				(cust) => cust.memberRole === 'assistant-secretary' && cust.memberId !== memberId
				).length;
			const assistantTreasurerCount = response.data.filter(
				(cust) => cust.memberRole === 'assistant-treasurer' && cust.memberId !== memberId
				).length;
			const internalAuditorCount = response.data.filter(
				(cust) => cust.memberRole === 'internal-auditor' && cust.memberId !== memberId
				).length;

			if (memberRole === 'admin' && adminCount >= 1) {
				toast.error("Please ensure only one Admin exists. Please delete the existing Admin first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'president' && presidentCount >= 1) {
				toast.error("Please ensure only one President exists. Please delete the existing President first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'secretary' && secretaryCount >= 1) {
				toast.error("Please ensure only one Secretary exists. Please delete the existing Secretary first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'treasurer' && treasurerCount >= 1) {
				toast.error("Please ensure only one Treasurer exists. Please delete the existing Treasurer first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'vice-president' && vicePresidentCount >= 1) {
				toast.error("Please ensure only one Vice President exists. Please delete the existing Vice President first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'assistant-secretary' && assistantSecretaryCount >= 1) {
				toast.error("Please ensure only one Assistant Secretary exists. Please delete the existing Assistant Secretary first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'assistant-treasurer' && assistantTreasurerCount >= 1) {
				toast.error("Please ensure only one Assistant Treasurer exists. Please delete the existing Assistant Treasurer first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'activity-coordinator' && activityCoordinatorCount >= 1) {
				toast.error("Please ensure only one Activity Coordinator exists. Please delete the existing Activity Coordinator first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'committee-member' && committeeMemberCount >= 10) {
				toast.error("Please ensure only ten (10) Committee Members exists. Please delete the existing Committee Member first.");
				setIsUpdating(false);
				return;
			}
			if (memberRole === 'internal-auditor' && internalAuditorCount >= 1) {
				toast.error("Please ensure only one Internal Auditor exists. Please delete the existing Internal Auditor first.");
				setIsUpdating(false);
				return;
			}
		}

		try {
			let uploadedNewImages = [];

			// Upload new images if selected
			if (image.length > 0) {
			const uploadPromises = image.map((img) => mediaUpload(img));
			uploadedNewImages = await Promise.all(uploadPromises);
			}
			const updatedMember = {
				memberId,
				title,
				firstName,
				lastName,
				nameInSinhala,
				memberRole,
				address: address
					? address.split(",").map(n => n.trim()).filter(Boolean)  // remove empty strings
					: undefined,			
				notes: notes || undefined,
				image: [...existingImages, ...uploadedNewImages].length > 0
					? [...existingImages, ...uploadedNewImages]
					: [],
				mobile: mobile || undefined,
				phone: phone || undefined,
				email: email?.trim() || undefined,
				dueAmount: dueAmount || 0,
			};

			await axios.put(
				`${import.meta.env.VITE_BACKEND_URL}/api/member/${memberId}`,
				updatedMember,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			toast.success("Member updated successfully");
			navigate("/");
		} catch (error) {
			console.error(error);
			toast.error(error?.response?.data?.message || "Update failed");
		} finally {
			setIsUpdating(false);
		}
	}

	return (
		<div className="w-full min-h-screen flex flex-col p-4 bg-gray-50">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
				<div>
					<h1 className="text-xl font-semibold text-gray-800">✏️ Edit Member</h1>
					<p className="text-sm text-gray-500">Edit and Update existing member information</p>
				</div>

				<div className="flex flex-wrap gap-3 w-full sm:w-auto justify-end">
					<button
					onClick={async () => {
						setIsUpdating(true);
						await updateProduct();
						setIsUpdating(false);
					}}
					disabled={isUpdating}
					className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium shadow-md transition text-white ${
						isUpdating
						? "bg-gray-500 cursor-not-allowed"
						: "bg-blue-600 hover:bg-blue-700"
					}`}
					>
					{isUpdating ? "Updating..." : "Update Member"}
					</button>

					<Link
					to="/"
					className="flex-1 sm:flex-none bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-medium shadow text-center"
					>
					Cancel
					</Link>
				</div>
			</div>

			{/* Form Container */}
			<div className="bg-white w-full p-4 sm:p-8 shadow rounded-xl border border-gray-200">
				{/* Two-column → stack on mobile */}
				<div className="flex flex-col lg:flex-row justify-between gap-6">
					{/* Left Column */}
					<div className="w-full lg:w-[50%] space-y-4">
						{/* Member ID */}
						<div className="flex flex-col sm:flex-row gap-3">
							<div className="w-full sm:w-1/4">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Member ID
								</label>
								<input
									type="text"
									className="w-full border border-gray-300 rounded-lg p-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
									placeholder="0000"
									maxLength={4}
									value={memberId}
									onChange={async (e) => {
										const value = e.target.value;
										setMemberId(value);
										if (value.length === 4) {
										await searchCustomer(value);
										}
									}}
								/>
							</div>
						</div>

						<div className="flex flex-col sm:flex-row justify-between gap-3">
							<div className="w-full sm:w-[12%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Title
								</label>
								<select
									value={title}
									onChange={(e) => setTitle(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="Mr.">Mr.</option>
									<option value="Mrs.">Mrs.</option>
									<option value="Miss.">Miss.</option>
									<option value="Ms.">Ms.</option>
									<option value="Dr.">Dr.</option>
									<option value="Prof.">Prof.</option>
								</select>
							</div>

							<div className="w-full sm:flex-1">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									First Name
								</label>
								<input
									type="text"
									value={firstName}
									onChange={(e) => setFirstName(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. Sunil"
								/>
							</div>
						
							<div className="w-full sm:flex-1">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Last Name
								</label>
								<input
									type="text"
									value={lastName}
									onChange={(e) => setLastName(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. Gunawardena"
								/>
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
							<label className="block text-sm font-medium text-gray-700 mb-1">
								Address
							</label>
							<input
								type="text"
								value={address}
								onChange={(e) => setAddress(e.target.value)}
								className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
									type="text"
									value={mobile}
									onChange={(e) => setMobile(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
							<div className="w-full sm:w-[20%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Phone
								</label>
								<input
									type="text"
									value={phone}
									onChange={(e) => setPhone(e.target.value)}
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
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								/>
							</div>
						</div>


						{/* Member Type ,  Member Role */}
						<div className="flex flex-col sm:flex-row justify-between gap-3">

							<div className="w-full sm:w-[50%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Member Role
								</label>
								<select
									value={memberRole}
									onChange={(e) => setMemberRole(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
								>
									<option value="admin">Admin</option>
									<option value="member">Member</option>
									<option value="president">President</option>
									<option value="secretary">Secretary</option>
									<option value="treasurer">Treasurer</option>
									<option value="vice-president">Vice President</option>
									<option value="assistant-secretary">Assistant Secretary</option>
									<option value="assistant-treasurer">Assistant Treasurer</option>
									<option value="internal-auditor">Internal Auditor</option>
								</select>
							</div>
							
							<div className="w-full sm:w-[50%]">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Due Amount
								</label>
								<input
									type="number"
									value={dueAmount}
									onChange={(e) => setDueAmount(e.target.value)}
									className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
									placeholder="e.g. 1500"
								/>
							</div>
						</div>	
					</div>

					{/* Right Column */}
					<div className="mt-6 w-full lg:w-[45%] space-y-8">
						{/* Description */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">
							Description
							</label>
							<textarea
								rows="6"
								value={notes}
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
							<div className="w-full h-35 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto border border-gray-300 p-2 rounded-lg shadow-inner">
								{/* Existing */}
								{existingImages.map((imgUrl, index) => (
									<div key={`existing-${index}`} className="relative rounded-md overflow-hidden">
										<img src={imgUrl} alt="" className="w-30 h-30 rounded-lg object-cover" />
										<button
											type="button"
											onClick={() =>
											setExistingImages(existingImages.filter((_, i) => i !== index))
											}
											className="absolute top-1 right-4 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full hover:bg-red-600"
										>
											✕
										</button>
									</div>
								))}
								{/* New */}
								{image.map((file, index) => (
									<div key={`new-${index}`} className="relative rounded-md overflow-hidden">
										<img
											src={URL.createObjectURL(file)}
											alt=""
											className="w-30 h-30 rounded-lg object-cover"
										/>
										<button
											type="button"
											onClick={() =>
											setImage(image.filter((_, i) => i !== index))
											}
											className="absolute top-1 right-4 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full hover:bg-red-600"
										>
											✕
										</button>
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
									onChange={(e) => {
										const files = Array.from(e.target.files);
										setImage((prev) => [...prev, ...files]);
									}}
									className="w-full text-sm text-blue-600 cursor-pointer"
								/>
							</div>							
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
