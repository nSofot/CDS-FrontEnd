import axios from "axios";
import { useEffect, useState } from "react";
import ProductCard from "../../components/productCard";
import LoadingSpinner from "../../components/loadingSpinner";
import toast from "react-hot-toast";

export default function ProductPage() {
	const [products, setProducts] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [query, setQuery] = useState("");

	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setIsLoading(true);

				const res = await axios.get(
					`${import.meta.env.VITE_BACKEND_URL}/api/stock/search?query=${query}`
				);

				const filtered = res.data.filter(
					(p) => p.stockCategory === "harvested products"
				);

				setProducts(filtered);

			} catch (err) {
				console.error("Search request failed:", err);
				toast.error("Failed to fetch products.");
			} finally {
				setIsLoading(false);
			}
		};

		// IMPORTANT: avoid empty API call
		fetchProducts();

	}, [query]);

	return (
		<div className="w-full h-full flex flex-col items-center gap-4 p-4">
			<input
				type="text"
				placeholder="Search for products..."
				className="w-[400px] h-[50px] p-2 mb-4 rounded-lg border"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
			/>

			<div className="w-full flex flex-wrap justify-center">
				{isLoading ? (
					<LoadingSpinner />
				) : products.length === 0 ? (
					<p className="text-gray-500">No products found.</p>
				) : (
					products.map((product) => (
						<ProductCard
							key={product._id}
							product={product}
						/>
					))
				)}
			</div>
		</div>
	);
}