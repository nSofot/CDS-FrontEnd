import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiShoppingBag, FiShield, FiTruck, FiArrowRight } from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function HomePage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const spotlight = [
        { productId: "spotlight-1", stockId: "spotlight-1", stockName: "Fresh Oyster Mushrooms", stockPrice: 650, stockImage: ["/mainBanner.jpg"] },
        { productId: "spotlight-2", stockId: "spotlight-2", stockName: "Dried Mushroom Pack", stockPrice: 950, stockImage: ["/mainBanner.jpg"] },
        { productId: "spotlight-3", stockId: "spotlight-3", stockName: "Mushroom Value Pack", stockPrice: 1200, stockImage: ["/mainBanner.jpg"] },
    ];

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const [prodRes] = await Promise.all([
                    axios.get(import.meta.env.VITE_BACKEND_URL + "/api/stock"),
                ]);

                const filteredProducts = prodRes.data.filter((p) => p.stockCategory === "harvested products");
                setProducts(filteredProducts);
            } catch (err) {
                console.error("Search request failed:", err);
                toast.error("Failed to fetch products. Showing featured picks.");
                setProducts(spotlight);
            } finally {
                setIsLoading(false);
            }
        };

        if (isLoading) {
            fetchProducts();
        }
    }, [isLoading]);

    return (
        <Fragment>
            <section className="relative flex min-h-[72vh] w-full items-center overflow-hidden bg-[#142116]">
                <motion.img
                    src="/mainBanner.jpg"
                    alt="Fresh mushroom production"
                    className="absolute inset-0 h-full w-full object-cover opacity-55"
                    initial={{ scale: 1.08 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 1.1 }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#101810]/90 via-[#101810]/65 to-transparent" />

                <div className="relative mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <motion.div
                        className="max-w-2xl text-white"
                        initial={{ opacity: 0, y: 36 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                    >
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9dfbf]">Collective Development Society</p>
                        <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">
                            Fresh mushroom harvests from a community-led production network.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-white/85 md:text-lg">
                            Discover carefully grown, locally supplied mushroom products with reliable quality, responsible production, and direct society support.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                            <Link to="/products" className="erp-btn erp-btn-primary">
                                <FiShoppingBag /> Shop Products
                            </Link>
                            <Link to="/about" className="erp-btn border border-white/40 bg-white/10 text-white backdrop-blur hover:bg-white/20">
                                Learn More <FiArrowRight />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <section className="bg-white py-12">
                <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
                    {[
                        { icon: <FiTruck />, title: "Local Supply", desc: "Fresh products handled through a society-managed production and distribution flow." },
                        { icon: <FiShield />, title: "Quality Focused", desc: "Harvests and prepared products are presented with consistent product information." },
                        { icon: <FiShoppingBag />, title: "Simple Ordering", desc: "Browse, add to cart, and checkout through a responsive storefront experience." },
                    ].map(({ icon, title, desc }) => (
                        <div key={title} className="rounded-lg border border-[#dfe7df] bg-[#f8fbf8] p-5 text-center">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6f4e9] text-2xl text-[#2f7d46]">{icon}</div>
                            <h3 className="mt-4 text-lg font-extrabold text-[#172017]">{title}</h3>
                            <p className="mt-2 text-sm leading-6 text-[#627069]">{desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                        <p className="erp-eyebrow">Marketplace</p>
                        <h2 className="erp-title">Featured Products</h2>
                    </div>
                    <Link to="/products" className="erp-btn erp-btn-secondary">Browse All Products</Link>
                </div>

                {isLoading ? (
                    <p className="text-center text-[#627069]">Loading products...</p>
                ) : products.length === 0 ? (
                    <p className="rounded-lg bg-white p-10 text-center text-[#627069]">No products available at the moment.</p>
                ) : (
                    <div className="grid gap-5 md:grid-cols-3">
                        {products.slice(0, 3).map((item, idx) => (
                            <motion.article
                                key={item.stockId || item.productId}
                                className="group overflow-hidden rounded-lg border border-[#dfe7df] bg-white shadow-[0_10px_28px_rgba(31,54,36,0.07)] transition hover:-translate-y-1 hover:shadow-xl"
                                initial={{ opacity: 0, y: 28 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                            >
                                <Link to={"/overview/" + item.stockId}>
                                    <div className="aspect-[4/3] overflow-hidden bg-[#f2f7f3]">
                                        <img
                                            src={item.stockImage?.[0] || item.image?.[0] || "/mainBanner.jpg"}
                                            alt={item.stockName || item.name}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />
                                    </div>
                                    <div className="p-5">
                                        <h3 className="text-lg font-extrabold text-[#172017]">{item.stockName || item.name}</h3>
                                        <p className="mt-2 text-xl font-extrabold text-[#2f7d46]">Rs.{Number(item.stockPrice || item.price || 0).toFixed(2)}</p>
                                        <p className="mt-3 flex items-center gap-1 text-[#f5b544]">
                                            {[...Array(5)].map((_, i) => <FaStar key={i} size={14} />)}
                                            <span className="ml-1 text-sm text-[#627069]">Featured</span>
                                        </p>
                                    </div>
                                </Link>
                            </motion.article>
                        ))}
                    </div>
                )}
            </section>

            <section className="bg-[#142116] px-4 py-16 text-white sm:px-6 lg:px-8">
                <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9dfbf]">Join the network</p>
                    <h2 className="mt-3 text-3xl font-extrabold md:text-4xl">Support local mushroom production with every order.</h2>
                    <p className="mt-4 max-w-2xl text-white/75">
                        Shop fresh harvests, learn about the society, or contact the team for supply and production inquiries.
                    </p>
                    <Link to="/contact" className="erp-btn mt-8 bg-white text-[#276b3b] hover:bg-[#eef8f0]">Contact CDS</Link>
                </div>
            </section>
        </Fragment>
    );
}
