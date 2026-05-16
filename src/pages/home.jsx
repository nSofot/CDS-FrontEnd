import { Fragment, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FiShoppingBag,
    FiCreditCard,
    FiTruck,
} from "react-icons/fi";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import Header from "../components/header";

export default function Home() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);  
    const [isLoading, setIsLoading] = useState(true);

    /* ------------------ dummy spotlight data (fallback) ------------------ */
    const spotlight = [
      {
        productId: "spotlight-1",
        name: "Hydra Glow Serum",
        price: 4990,
        image: ["/products/serum.jpg"],
      },
      {
        productId: "spotlight-2",
        name: "Velvet Matte Lipstick",
        price: 2450,
        image: ["/products/lipstick.jpg"],
      },
      {
        productId: "spotlight-3",
        name: "Renew Night Cream",
        price: 5600,
        image: ["/products/nightcream.jpg"],
      },
    ];

    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const [prodRes] = await Promise.all([
            axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stock`),
            // axios.get(import.meta.env.VITE_BACKEND_URL + "/api/category"),
            // axios.get(import.meta.env.VITE_BACKEND_URL + "/api/brand"),
          ]);

          const filteredProducts = prodRes.data.filter((p) => p.stockCategory === "harvested products");
          setProducts(filteredProducts);
          // setCategories(catRes.data);
          // setBrands(braRes.data);
        } catch (err) {
          console.error("Search request failed:", err);
          toast.error("Failed to fetch products. Showing featured picks.");
          setProducts(spotlight); // fallback spotlight data
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
          <Header />
          {/* ---------- HERO ---------- */}
          <section className="relative w-full h-[70vh] bg-gradient-to-r from-red-600 to-indigo-600 flex items-center justify-center overflow-hidden">
              <motion.img
                src="/bg01.avif"
                alt="Beauty banner"
                className="absolute inset-0 w-full h-full object-cover opacity-40"
                initial={{ scale: 1.2 }}
                animate={{ scale: 1 }}
                transition={{ duration: 1 }}
              />

              <div className="relative text-center text-white px-4">
                <motion.h1
                  className="text-4xl md:text-6xl font-extrabold drop-shadow-lg"
                  initial={{ opacity: 0, y: 60 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  නැවුම්ව වැඩෙන්න, සෞඛ්‍ය සම්පන්නව &nbsp;කන්න
                </motion.h1>

                <motion.p
                  className="mt-4 max-w-xl mx-auto text-lg md:text-xl"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  සාමූහික සංවර්ධන සංගමය විසින් ප්‍රවේශමෙන් වගා කරන ලද උසස් තත්ත්වයේ හතු සොයා ගන්න - නැවුම්, පෝෂ්‍යදායී සහ තිරසාර ලෙස වගා කරන ලද.
                </motion.p>

                <motion.div
                  className="mt-8 flex justify-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  <Link
                    to="/products"
                    className="px-6 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow hover:bg-gray-100"
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/about"
                    className="px-6 py-3 border border-white font-semibold rounded-full hover:bg-white hover:text-indigo-600"
                  >
                    Learn More
                  </Link>
                </motion.div>
              </div>
            </section>

            {/* ---------- FEATURES ---------- */}
            <section className="bg-white py-12">
              <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 text-center">
                {[
                  {
                    icon: <FiTruck size={36} />,
                    title: "මිත්‍රශීලී සහ වෙළඳපොළ විලාසය",
                    desc: "ගොවිපලෙන් මේසයට නැවුම්. නැවුම්, සෞඛ්‍ය සම්පන්න සහ වගකීමෙන් යුතුව නිෂ්පාදනය කරන ලද උසස් තත්ත්වයේ, දේශීයව වගා කරන ලද හතු භුක්ති විඳින්න.",
                  },
                  {
                    icon: <FiCreditCard size={36} />,
                    title: "වෘත්තීය සහ ව්‍යාපෘති කේන්ද්‍ර කරගත්",
                    desc: "නැවුම් නිෂ්පාදන හරහා ප්‍රජාවන් සවිබල ගැන්වීම. ගුණාත්මකභාවය, පෝෂණය සහ ප්‍රජා වර්ධනය සහතික කරමින් තිරසාරව වගා කරන ලද හතු ගවේෂණය කරන්න.",
                  },
                  {
                    icon: <FiShoppingBag size={36} />,
                    title: "කෙටි සහ ආකර්ශනීය",
                    desc: "පිරිසිදු. නැවුම්. දේශීය. පරිස්සමෙන් වගා කරන ලද උසස් හතු.",
                  },
                ].map(({ icon, title, desc }) => (
                  <div key={title} className="flex flex-col items-center">
                    <div className="text-indigo-600">{icon}</div>
                    <h3 className="mt-3 font-bold">{title}</h3>
                    <p className="mt-1 text-gray-600 text-sm text-center px-4">
                      {desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* ---------- SPOTLIGHT / BESTSELLERS ---------- */}
            <section className="max-w-6xl mx-auto px-6 py-16">
              <h2 className="text-3xl font-bold text-center mb-10">Trending Now</h2>

              {isLoading ? (
                <p className="text-center">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-center text-gray-500">No products available at the moment.</p>
              ) : (
                <div className="grid md:grid-cols-3 gap-10">
                  {products.slice(0, 3).map((item, idx) => (
                    <motion.article
                      key={item.stockId}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                      initial={{ opacity: 0, y: 40 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Link to={`/overview/${item.stockId}`}>
                        <img
                          src={item.stockImage[0]}
                          alt={item.stockName}
                          className="w-full h-64 object-cover"
                        />
                        <div className="p-6">
                          {/* <h2 className="text-lg font-semibold">{getBrandName(item.brandId)} {getCategoryName(item.categoryId)}</h2> */}
                          <h3 className="text-lg font-semibold">{item.stockName}</h3>
                          <p className="mt-2 text-indigo-600 font-bold">
                            Rs.{item.stockPrice}
                          </p>

                          <p className="mt-2 flex items-center gap-1 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} size={14} />
                            ))}
                            <span className="ml-1 text-sm text-gray-600">
                              (1k reviews)
                            </span>
                          </p>
                        </div>
                      </Link>
                    </motion.article>
                  ))}
                </div>
              )}

              <div className="text-center mt-12">
                <Link
                  to="/products"
                  className="inline-block px-8 py-3 border border-indigo-600 text-indigo-600 font-semibold rounded-full hover:bg-indigo-50"
                >
                  Browse All Products
                </Link>
              </div>
            </section>

            {/* ---------- CTA BANNER ---------- */}
            <section className="w-full bg-indigo-600 text-white py-16 text-center">
              <h2 className="text-3xl md:text-4xl font-bold bg-indigo-600">
                  අපේ හතු ආදරවන්තයින්ගේ කවයට එකතු වෙන්න
              </h2>
              <p className="mt-4 max-w-2xl mx-auto">
                  ඔබගේ පළමු ඇණවුමට 10% වට්ටමක් ලබාගන්න, 
                  විශේෂ ප්‍රවර්ධන සඳහා පෙර ප්‍රවේශය ලබාගන්න, 
                  තවද seasonal offers සහ රසවත් recipes හා flavor tips 
                  ඔබගේ inbox එකට සෘජුවම ලබාගන්න.
              </p>
              <Link
                to="/register"
                className="mt-8 inline-block px-8 py-3 bg-white text-indigo-600 font-semibold rounded-full shadow hover:bg-gray-100"
              >
                Sign&nbsp;Up&nbsp;Free
              </Link>
            </section>
        </Fragment>
    );
}
