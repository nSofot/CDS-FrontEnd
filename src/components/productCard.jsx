import "./productCard.css";
import { Link } from "react-router-dom";
import { FaStar } from "react-icons/fa";
import { FiShoppingBag } from "react-icons/fi";

export default function ProductCard({ product }) {
    const {
        stockId,
        stockName,
        stockDescription,
        stockImage,
        stockPrice,
        labelledPrice,
        stock,
        isAvailable,
        rating = 0,
        reviewCount = 0,
    } = product;

    const stars = Array.from({ length: 5 }, (_, i) => (
        <FaStar
            key={i}
            size={13}
            className={i < Math.round(rating) ? "text-[#f5b544]" : "text-[#d6ded7]"}
        />
    ));

    const available = isAvailable !== false && Number(stock || 0) > 0;

    return (
        <Link
            to={"/overview/" + stockId}
            className="group flex h-full min-h-[420px] w-full flex-col overflow-hidden rounded-lg border border-[#dfe7df] bg-white shadow-[0_10px_28px_rgba(31,54,36,0.07)] transition duration-200 hover:-translate-y-1 hover:border-[#a9c6af] hover:shadow-xl"
        >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#f2f7f3]">
                <img
                    src={stockImage?.[0] || "/placeholder.png"}
                    alt={stockName}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className={"absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-extrabold " + (available ? "bg-[#e6f4e9] text-[#276b3b]" : "bg-[#fff1f0] text-[#b42318]") }>
                    {available ? "Available" : "Out of stock"}
                </span>
            </div>

            <div className="flex flex-1 flex-col p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#6b7b70]">Fresh Harvest</p>
                <h2 className="mt-1 line-clamp-2 text-base font-extrabold text-[#172017]">{stockName}</h2>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#627069]">
                    {stockDescription || "Locally produced mushroom product from CDS."}
                </p>

                <div className="mt-3 flex items-center gap-1 text-xs">
                    {reviewCount > 0 ? (
                        <>
                            {stars}
                            <span className="ml-1 text-[#627069]">({reviewCount})</span>
                        </>
                    ) : (
                        <span className="text-[#8a978e]">No reviews yet</span>
                    )}
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                    <div>
                        {labelledPrice > stockPrice && (
                            <p className="text-xs font-semibold text-[#8a978e] line-through">Rs.{Number(labelledPrice).toFixed(2)}</p>
                        )}
                        <p className="text-xl font-extrabold text-[#2f7d46]">Rs.{Number(stockPrice || 0).toFixed(2)}</p>
                    </div>

                    <button
                        onClick={(e) => e.preventDefault()}
                        disabled={!available}
                        className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#2f7d46] text-white transition hover:bg-[#276b3b] disabled:bg-[#cad8cc]"
                        aria-label="View product"
                    >
                        <FiShoppingBag />
                    </button>
                </div>
            </div>
        </Link>
    );
}
