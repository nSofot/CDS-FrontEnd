import { Fragment } from "react";
import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { FiMapPin, FiPhone, FiMail } from "react-icons/fi";

export default function ContactUs() {

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
          alt="Contact Us Banner"
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
            Contact Us
          </motion.h1>

          <motion.p
            className="mt-4 text-lg max-w-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Get in touch with Tholangamuwa Central College Past Students – Colombo Group
          </motion.p>
        </div>
      </section>

      {/* ---------- CONTACT INFO ---------- */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-3xl font-bold text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            We’d Love to Hear From You
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-white rounded-2xl shadow p-6 text-center"
              whileHover={{ y: -5 }}
            >
              <FiMapPin className="mx-auto text-4xl text-indigo-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Address</h3>
              <p className="text-gray-600 text-sm">
                Colombo, Sri Lanka
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow p-6 text-center"
              whileHover={{ y: -5 }}
            >
              <FiPhone className="mx-auto text-4xl text-indigo-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Phone</h3>
              <p className="text-gray-600 text-sm">
                +94 77 123 4567
              </p>
            </motion.div>

            <motion.div
              className="bg-white rounded-2xl shadow p-6 text-center"
              whileHover={{ y: -5 }}
            >
              <FiMail className="mx-auto text-4xl text-indigo-600 mb-4" />
              <h3 className="font-semibold text-lg mb-2">Email</h3>
              <p className="text-gray-600 text-sm">
                colombogrouptcc@gmail.com
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------- CONTACT FORM ---------- */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-8xl mx-auto"> {/* Form width optimized */}
          <motion.h2
            className="text-3xl font-bold text-center mb-10"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Send Us a Message
          </motion.h2>

          <motion.form
            className="bg-white rounded-2xl shadow-md p-8 space-y-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-2">Email Address</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold mb-2">Message</label>
              <textarea
                rows="4"
                placeholder="Write your message"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-700 text-white font-semibold py-3 rounded-lg hover:bg-indigo-800 transition"
            >
              Send Message
            </button>
          </motion.form>
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
