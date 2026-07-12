import { useState } from "react";
import toast from "react-hot-toast";
import { BiMinus, BiPlus, BiTrash } from "react-icons/bi";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

export default function CheckOutPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [cart, setCart] = useState(() => {
        const items = location.state?.cart || [];
        return items.map((item) => {
            const info = item.productInfo || item;
            return {
                productId: info.productId,
                name: info.name,
                description: info.description || "",
                image: Array.isArray(info.image) ? info.image : [info.image || ""],
                altName: Array.isArray(info.altName) ? info.altName : [info.altName || ""],
                labelledPrice: info.labelledPrice || info.price,
                price: info.price,
                qty: info.qty || info.quantity || 1,
            };
        });
    });

    const [phoneNumber, setPhoneNumber] = useState("");
    const [address, setAddress] = useState("");

    const getItemsTotal = () => cart.reduce((total, item) => total + item.labelledPrice * item.qty, 0);
    const getItemsDiscount = () => cart.reduce((total, item) => total + (item.labelledPrice - item.price) * item.qty, 0);
    const getSubTotal = () => cart.reduce((total, item) => total + item.price * item.qty, 0);
    const getEstimatedTotal = () => cart.reduce((total, item) => total + item.price * item.qty, 0);

    const removeFromCart = (index) => setCart(cart.filter((_, i) => i !== index));

    const changeQty = (index, delta) => {
        const updated = [...cart];
        updated[index].qty = Math.max(1, updated[index].qty + delta);
        setCart(updated);
    };

    const placeOrder = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Please login first");
            return;
        }
        if (!phoneNumber || !address) {
            toast.error("Please enter phone number and address");
            return;
        }
        if (cart.length === 0) {
            toast.error("Your cart is empty");
            return;
        }

        const orderInformation = {
            phone: phoneNumber,
            address: address,
            products: cart.map((item) => ({
                productInfo: {
                    productId: item.productId,
                    name: item.name,
                    altNames: Array.isArray(item.altName) ? item.altName : [item.altName],
                    quantity: item.qty,
                    description: item.description,
                    price: item.price,
                    images: Array.isArray(item.image) ? item.image : [item.image],
                    labelledPrice: item.labelledPrice,
                },
            })),
        };

        try {
            await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/order", orderInformation, {
                headers: { Authorization: "Bearer " + token },
            });
            toast.success("Order placed successfully!");
            navigate("/products");
        } catch (err) {
            toast.error("Error placing order");
        }
    };

    return (
        <main className="min-h-screen bg-[#f4f7f4]">
            <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_24rem] lg:px-8">
                <div>
                    <div className="mb-5">
                        <p className="erp-eyebrow">Checkout</p>
                        <h1 className="erp-title">Confirm Your Order</h1>
                        <p className="erp-subtitle">Review quantities and add delivery contact details.</p>
                    </div>

                    <div className="space-y-3">
                        {cart.length === 0 ? (
                            <div className="rounded-lg border border-[#dfe7df] bg-white p-10 text-center text-[#627069]">No items selected for checkout.</div>
                        ) : (
                            cart.map((item, index) => (
                                <article key={item.productId || index} className="rounded-lg border border-[#dfe7df] bg-white p-4 shadow-[0_10px_28px_rgba(31,54,36,0.07)]">
                                    <div className="grid gap-4 md:grid-cols-[7rem_1fr_auto] md:items-center">
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
                                            <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#ffd5d1] text-[#b42318] transition hover:bg-[#fff1f0]" onClick={() => removeFromCart(index)}>
                                                <BiTrash />
                                            </button>
                                            <div className="flex items-center rounded-lg border border-[#dfe7df] bg-[#f8fbf8] p-1">
                                                <button onClick={() => changeQty(index, -1)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white"><BiMinus /></button>
                                                <span className="min-w-8 text-center font-extrabold">{item.qty}</span>
                                                <button onClick={() => changeQty(index, 1)} className="flex h-8 w-8 items-center justify-center rounded-md hover:bg-white"><BiPlus /></button>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            ))
                        )}
                    </div>
                </div>

                <aside className="h-fit rounded-lg border border-[#dfe7df] bg-white p-6 shadow-[0_14px_32px_rgba(31,54,36,0.08)] lg:sticky lg:top-6">
                    <h2 className="text-2xl font-extrabold text-[#172017]">Order Summary</h2>
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

                    <div className="mt-8 space-y-4">
                        <input className="erp-input" type="text" placeholder="Phone Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
                        <input className="erp-input" type="text" placeholder="Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} />
                    </div>

                    <button className="erp-btn erp-btn-primary mt-8 w-full" disabled={cart.length === 0} onClick={placeOrder}>
                        Place Order
                    </button>
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
