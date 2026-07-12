import axios from "axios";
import { useEffect, useState } from "react";
import ProductCard from "../../components/productCard";
import LoadingSpinner from "../../components/loadingSpinner";
import toast from "react-hot-toast";
import { FiSearch } from "react-icons/fi";

export default function ProductPage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [query, setQuery] = useState("");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setIsLoading(true);

                const res = await axios.get(
                    import.meta.env.VITE_BACKEND_URL + "/api/stock/search?query=" + query
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

        fetchProducts();
    }, [query]);

    return (
        <main className="min-h-screen bg-[#f4f7f4]">
            <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="mb-6 flex flex-col gap-4 rounded-lg border border-[#dfe7df] bg-white/90 p-5 shadow-[0_14px_32px_rgba(31,54,36,0.08)] md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5f7a64]">CDS Marketplace</p>
                        <h1 className="mt-1 text-3xl font-extrabold text-[#172017] md:text-4xl">Fresh Mushroom Products</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#627069]">
                            Browse society-grown harvests and locally prepared mushroom products.
                        </p>
                    </div>

                    <div className="relative w-full md:w-[24rem]">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="erp-input pl-10"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
						<FiSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8b80]" />
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex min-h-[18rem] items-center justify-center rounded-lg bg-white">
                        <LoadingSpinner />
                    </div>
                ) : products.length === 0 ? (
                    <div className="rounded-lg border border-[#dfe7df] bg-white p-12 text-center text-[#627069]">
                        No products found.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
