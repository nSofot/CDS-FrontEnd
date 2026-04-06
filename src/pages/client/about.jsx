import { Fragment } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { FiUsers, FiHeart, FiCalendar } from "react-icons/fi";

export default function AboutUs() {

  const navClass = ({ isActive }) =>
  isActive
    ? "text-yellow-400 border-b-2 border-yellow-400"
    : "hover:text-yellow-400";

  return (
    <Fragment>
      {/* ---------- HERO ---------- */}
      <section className="relative w-full min-h-[60vh] flex items-center bg-black overflow-hidden">
        <motion.img
          src="/LandingPage4.png"
          alt="About Us Banner"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />

        <div className="relative z-10 px-8 max-w-6xl mx-auto text-white">
          <motion.h1
            className="text-4xl sm:text-5xl font-extrabold drop-shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            About Us
          </motion.h1>

          <motion.p
            className="mt-4 text-lg max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Tholangamuwa Central College Past Students Colombo Group
          </motion.p>
        </div>
      </section>

      {/* ---------- INTRO ---------- */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Who We Are
          </motion.h2>

          <p className="text-gray-700 text-lg leading-relaxed max-w-4xl mx-auto">
            The Tholangamuwa Central College Past Students Colombo Group is a
            united community of former students currently living in and around
            Colombo. Our group was formed to strengthen lifelong friendships,
            preserve school traditions, and support one another through social,
            educational, and community-based initiatives.
          </p>
        </div>
      </section>

      {/* ---------- MISSION / VISION ---------- */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10">
          <motion.div
            className="bg-white rounded-2xl shadow-md p-8"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-gray-600 leading-relaxed">
              To build a strong and active alumni network that promotes unity,
              friendship, mutual support, and meaningful engagement among past
              students while contributing positively to society.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-md p-8"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-gray-600 leading-relaxed">
              To become a model alumni organization that nurtures lifelong
              connections, supports future generations, and upholds the values
              and heritage of Tholangamuwa Central College.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------- VALUES ---------- */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12">
          Our Core Values
        </h2>

        <div className="grid sm:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <motion.div
            className="bg-white rounded-2xl shadow p-6 text-center"
            whileHover={{ y: -5 }}
          >
            <FiUsers className="mx-auto text-4xl text-indigo-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Unity</h3>
            <p className="text-gray-600 text-sm">
              Strengthening bonds among alumni through togetherness and respect.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow p-6 text-center"
            whileHover={{ y: -5 }}
          >
            <FiHeart className="mx-auto text-4xl text-indigo-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Service</h3>
            <p className="text-gray-600 text-sm">
              Giving back to society and supporting meaningful causes.
            </p>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow p-6 text-center"
            whileHover={{ y: -5 }}
          >
            <FiCalendar className="mx-auto text-4xl text-indigo-600 mb-4" />
            <h3 className="font-semibold text-lg mb-2">Engagement</h3>
            <p className="text-gray-600 text-sm">
              Organizing events and activities that keep our alumni connected.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="w-full bg-gray-900 text-white py-8 px-4 text-center text-sm">
        <p>© 2025 Tholangamuwa Central College Past Students Colombo Group</p>
        <p className="opacity-75">Powered by nSoft Technologies</p>
      </footer>
    </Fragment>
  );
}
