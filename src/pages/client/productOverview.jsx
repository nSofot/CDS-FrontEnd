import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import ImageSlider from "../../components/imageSlider";
import LoadingSpinner from "../../components/loadingSpinner";
import { addToCart } from "../../utils/cart";
import { FiShoppingCart, FiCreditCard, FiArrowLeft } from "react-icons/fi";

export default function ProductOverview() {
    const params = useParams();
    const stockId = params.Id;

    const [status, setStatus] = useState("loading");
    const [product, setProduct] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(import.meta.env.VITE_BACKEND_URL + "/api/stock/" + stockId);
                setProduct(response.data);
                setStatus("success");
            } catch (error) {
                setStatus("error");
                toast.error("Error fetching product details");
            }
        };
        fetchProduct();
    }, []);

    if (status === "loading") {
        return <LoadingSpinner />;
    }

    if (status === "error") {
        return (
            <div className="flex min-h-[60vh] items-center justify-center bg-[#f4f7f4] px-4">
                <div className="rounded-lg border border-[#dfe7df] bg-white p-8 text-center shadow-lg">
                    <h1 className="text-2xl font-extrabold text-[#172017]">Product unavailable</h1>
                    <p className="mt-2 text-[#627069]">Please try again or return to the product catalog.</p>
                    <button onClick={() => navigate("/products")} className="erp-btn erp-btn-primary mt-6">Back to Products</button>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-[#f4f7f4]">
            <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
                <div className="overflow-hidden rounded-lg border border-[#dfe7df] bg-white p-4 shadow-[0_14px_32px_rgba(31,54,36,0.08)]">
                    <button onClick={() => navigate("/products")} className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-[#2f7d46] hover:text-[#276b3b]">
                        <FiArrowLeft /> Products
                    </button>
                    <div className="min-h-[24rem] rounded-lg bg-[#f2f7f3] p-2">
                        <ImageSlider images={product.stockImage || []} />
                    </div>
                </div>

                <div className="flex flex-col justify-center rounded-lg border border-[#dfe7df] bg-white p-5 shadow-[0_14px_32px_rgba(31,54,36,0.08)] lg:p-8">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#5f7a64]">Fresh Harvest</p>
                    <h1 className="mt-2 text-3xl font-extrabold leading-tight text-[#172017] md:text-4xl">{product.stockName}</h1>
                    <p className="mt-3 text-base leading-7 text-[#627069]">{product.stockDescription}</p>
                    <p className="mt-4 inline-flex w-fit rounded-full bg-[#eef8f0] px-3 py-1 text-xs font-extrabold text-[#276b3b]">{product.stockId}</p>

                    <div className="mt-8 rounded-lg border border-[#dfe7df] bg-[#f8fbf8] p-5">
                        {product.labelledPrice > product.stockPrice ? (
                            <div className="flex flex-wrap items-end gap-3">
                                <span className="text-lg font-bold text-[#8a978e] line-through">Rs.{Number(product.labelledPrice).toFixed(2)}</span>
                                <span className="text-4xl font-extrabold text-[#172017]">Rs.{Number(product.stockPrice).toFixed(2)}</span>
                            </div>
                        ) : (
                            <span className="text-4xl font-extrabold text-[#172017]">Rs.{Number(product.stockPrice || 0).toFixed(2)}</span>
                        )}
                        <p className="mt-2 text-sm text-[#627069]">Final order total is confirmed at checkout.</p>
                    </div>

                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                        <button
                            className="erp-btn erp-btn-primary w-full"
                            onClick={() => {
                                navigate("/checkout", {
                                    state: {
                                        cart: [
                                            {
                                                productId: product.stockId,
                                                name: product.stockName,
                                                image: product.stockImage,
                                                description: product.stockDescription,
                                                price: product.stockPrice,
                                                labelledPrice: product.labelledPrice,
                                                qty: 1,
                                            },
                                        ],
                                    },
                                });
                            }}
                        >
                            <FiCreditCard /> Buy Now
                        </button>

                        <button
                            className="erp-btn erp-btn-secondary w-full"
                            onClick={() => {
                                addToCart(product, 1);
                                toast.success("Added to cart");
                            }}
                        >
                            <FiShoppingCart /> Add to Cart
                        </button>
                    </div>
                </div>
            </section>
        </main>
    );
}
