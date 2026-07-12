import { useState } from "react";
import { addToCart, getCart, removeFromCart, getItemsTotal, getItemsDiscount, getSubTotal, getEstimatedTotal } from "../../utils/cart";
import { BiMinus, BiPlus, BiTrash } from "react-icons/bi";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

export default function CartPage() {
    const [cart, setCart] = useState(getCart());
    const [selectedItems, setSelectedItems] = useState({});

    const toggleSelectItem = (productId) => {
        setSelectedItems((prev) => ({ ...prev, [productId]: !prev[productId] }));
    };

    return (
        <main className="min-h-screen bg-[#f4f7f4]">
            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
                <div>
                    <div className="mb-5">
                        <p className="erp-eyebrow">Shopping Cart</p>
                        <h1 className="erp-title">Review Your Order</h1>
                        <p className="erp-subtitle">Select specific items or continue with the full cart.</p>
                    </div>

                    <div className="space-y-3">
                        {cart.length === 0 ? (
                            <div className="rounded-lg border border-[#dfe7df] bg-white p-10 text-center text-[#627069]">Your cart is empty.</div>
                        ) : (
                            cart.map((item) => (
                                <article key={item.productId} className="rounded-lg border border-[#dfe7df] bg-white p-4 shadow-[0_10px_28px_rgba(31,54,36,0.07)]">
                                    <div className="grid gap-4 md:grid-cols-[auto_7rem_1fr_auto] md:items-center">
                                        <label className="flex items-center justify-center md:block">
                                            <input
                                                type="checkbox"
                                                checked={!!selectedItems[item.productId]}
                                                onChange={() => toggleSelectItem(item.productId)}
                                                className="h-5 w-5 accent-[#2f7d46]"
                                            />
                                        </label>

                                        <img src={item.image[0]} alt={item.name} className="h-28 w-full rounded-lg object-cover md:h-24 md:w-24" />

                                        <div className="min-w-0 text-center md:text-left">
                                            <h2 className="text-lg font-extrabold text-[#172017]">{item.name}</h2>
                                            <p className="mt-1 text-sm font-semibold text-[#627069]">{item.productId}</p>
                                            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                                                {item.labelledPrice > item.price ? (
                                                    <>
                                                        <span className="text-base font-extrabold text-[#172017]">Rs.{item.price.toFixed(2)}</span>
                                                        <span className="text-sm font-semibold text-[#8a978e] line-through">Rs.{item.labelledPrice.toFixed(2)}</span>
                                                    </>
                                                ) : (
                                                    <span className="text-base font-extrabold text-[#2f7d46]">Rs.{item.price.toFixed(2)}</span>
                                                )}
                                                <span className="rounded-full bg-[#eef8f0] px-3 py-1 text-xs font-extrabold text-[#276b3b]">Line: Rs.{(item.price * item.qty).toFixed(2)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-center gap-3 md:flex-col md:items-end">
                                            <button
                                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ffd5d1] text-[#b42318] transition hover:bg-[#fff1f0]"
                                                onClick={() => {
                                                    removeFromCart(item.productId);
                                                    setCart(getCart());
                                                    toast.success("Item removed from cart");
                                                }}
                                                aria-label="Remove item"
                                            >
                                                <BiTrash />
                                            </button>
                                            <div className="flex items-center rounded-lg border border-[#dfe7df] bg-[#f8fbf8] p-1">
                                                <button
                                                    className="flex h-8 w-8 items-center justify-center rounded-md text-[#405547] hover:bg-white"
                                                    onClick={() => {
                                                        if (item.qty > 0) {
                                                            addToCart(item, -1);
                                                            setCart(getCart());
                                                        }
                                                    }}
                                                >
                                                    <BiMinus />
                                                </button>
                                                <span className="min-w-8 text-center font-extrabold text-[#172017]">{item.qty}</span>
                                                <button
                                                    className="flex h-8 w-8 items-center justify-center rounded-md text-[#405547] hover:bg-white"
                                                    onClick={() => {
                                                        addToCart(item, 1);
                                                        setCart(getCart());
                                                    }}
                                                >
                                                    <BiPlus />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>

                <aside className="h-fit rounded-lg border border-[#dfe7df] bg-white p-6 shadow-[0_14px_32px_rgba(31,54,36,0.08)] lg:sticky lg:top-6">
                    <h2 className="text-2xl font-extrabold text-[#172017]">Summary</h2>
                    <div className="mt-6 space-y-3">
                        <SummaryRow label="Total Items" value={cart.length} />
                        <SummaryRow label="Items Total" value={"Rs." + getItemsTotal().toFixed(2)} strike />
                        <SummaryRow label="Items Discount" value={"- Rs." + getItemsDiscount().toFixed(2)} highlight />
                        <SummaryRow label="Sub Total" value={"Rs." + getSubTotal().toFixed(2)} bold />
                        <SummaryRow label="Shipping" value="Rs.00.00" bold />
                    </div>
                    <div className="mt-5 border-t border-[#edf2ed] pt-5">
                        <SummaryRow label="Estimated Total" value={"Rs." + getEstimatedTotal().toFixed(2)} bold large />
                    </div>

                    <Link
                        to="/checkout"
                        state={{
                            cart: Object.values(selectedItems).some(Boolean)
                                ? cart.filter((item) => selectedItems[item.productId])
                                : cart,
                        }}
                        className="erp-btn erp-btn-primary mt-8 w-full"
                    >
                        Checkout
                    </Link>
                    <p className="mt-4 text-xs leading-5 text-[#627069]">Shipping and taxes are calculated at checkout.</p>
                </aside>
            </section>
        </main>
    );
}

function SummaryRow({ label, value, strike, bold, highlight, large }) {
    return (
        <div className="flex w-full items-center justify-between gap-4">
            <p className={(bold ? "font-bold" : "font-medium") + " text-sm text-[#627069]"}>{label}</p>
            <p className={(bold ? "font-extrabold" : "font-semibold") + " " + (highlight ? "text-[#b42318]" : "text-[#172017]") + " " + (strike ? "line-through text-[#8a978e]" : "") + " " + (large ? "text-xl" : "text-sm")}>{value}</p>
        </div>
    );
}
