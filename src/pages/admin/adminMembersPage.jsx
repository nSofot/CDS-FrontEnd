import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEdit, FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import LoadingSpinner from "../../components/loadingSpinner";

export default function AdminMembersPage() {
	const [customers, setCustomers] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const navigate = useNavigate();
	const location = useLocation();
	const token = localStorage.getItem("token");

	useEffect(() => {
		window.scrollTo(0, 0);
		setIsLoading(true);
		axios
			.get(import.meta.env.VITE_BACKEND_URL + "/api/customer")
			.then((res) => {
				setCustomers(res.data);
				setIsLoading(false);
			});
	}, [location]);

	function deleteCustomer(customerId) {
		const token = localStorage.getItem("token");
		if (!token) {
			toast.error("Please login first");
			return;
		}
		axios
			.delete(import.meta.env.VITE_BACKEND_URL + "/api/customer/" + productId, {
				headers: {
					Authorization: "Bearer " + token,
				},
			})
			.then(() => {
				toast.success("Customer deleted successfully");
				setIsLoading(true); // reload products
			})
			.catch((e) => {
				toast.error(e.response?.data?.message || "Delete failed");
			});
	}

	return (
		<div className="w-full h-full flex flex-col p-4">
			<div className="flex justify-between items-center mb-4">
				<div>
					<h1 className="text-xl font-semibold text-gray-800">🛍️ Members</h1>
					<p className="text-sm text-gray-500">Manage members</p>
				</div>
				<Link
					to="/admin/add-customer"
					className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow">
					+ Add New Member
				</Link>
			</div>

			<div className="bg-white shadow rounded-md overflow-x-auto">
				{isLoading ? (
					<LoadingSpinner />
				) : (
					<table className="min-w-full text-sm text-left border border-gray-200">
						<thead className="bg-purple-600 text-white">
							<tr>
								<th className="px-4 py-2">#</th>
								<th className="px-4 py-2">Mem/Id</th>
								<th className="px-4 py-2">Name</th>
								<th className="px-4 py-2">Mobile</th>
								<th className="px-4 py-2">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{customers.map((item, index) => (
								<tr
									key={index}
									className="hover:bg-purple-100 transition duration-150">
										<td className="px-4 py-2">{index + 1}</td>
										<td className="px-4 py-2 font-medium">{item.customerId}</td>
										<td className="px-4 py-2">{item.name}</td>
										<td className="px-4 py-2">{item.mobile}</td>
										<td className="px-4 py-2">
											
										<div className="flex gap-3">
											<button
												onClick={() => deleteProduct(item.productId)}
												className="text-red-600 hover:text-red-800"
											>
												<FaTrash className="text-lg" />
											</button>
											<button
												onClick={() =>
													navigate("/admin/edit-customer", {
													state: {
													...item
													}

													})
												}
												className="text-blue-600 hover:text-blue-800"
											>
												<FaEdit className="text-lg" />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>
		</div>
	);
}
