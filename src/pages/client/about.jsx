import { Fragment } from "react";
import { motion } from "framer-motion";
import { FaHandsHelping, FaLeaf, FaRocket, FaUsers, FaGlobeAsia } from "react-icons/fa";

export default function About() {
  return (
    <Fragment>
      <section className="relative flex min-h-[52vh] w-full items-center overflow-hidden bg-[#142116]">
        <motion.img
          src="/aboutBanner.jpg"
          alt="CDS mushroom production community"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#101810]/90 via-[#101810]/60 to-transparent" />
        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 text-white sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 36 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9dfbf]">About CDS</p>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-6xl">Community-grown mushroom production with a shared purpose.</h1>
            <p className="mt-5 text-base leading-7 text-white/80 md:text-lg">CDS supports sustainable production, local livelihoods, and reliable access to quality mushroom products.</p>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8">
        <article className="rounded-lg border border-[#dfe7df] bg-white p-6 shadow-[0_10px_28px_rgba(31,54,36,0.07)]">
          <p className="erp-eyebrow">Mission</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#172017]">Our Mission</h2>
          <p className="mt-4 text-base leading-8 text-[#627069]">To strengthen sustainable mushroom cultivation through community effort, innovation, shared knowledge, quality production, and practical support for local growers and members.</p>
        </article>
        <article className="rounded-lg border border-[#dfe7df] bg-white p-6 shadow-[0_10px_28px_rgba(31,54,36,0.07)]">
          <p className="erp-eyebrow">Vision</p>
          <h2 className="mt-2 text-2xl font-extrabold text-[#172017]">Our Vision</h2>
          <p className="mt-4 text-base leading-8 text-[#627069]">To become a trusted community-based mushroom production network that improves livelihoods, protects the environment, and brings high-quality local products to market.</p>
        </article>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto grid max-w-5xl gap-4 px-4 text-center sm:grid-cols-3 sm:px-6">
          {[{ value: "30+", label: "Community years" }, { value: "500+", label: "Supported customers" }, { value: "8", label: "Production workflows" }].map(({ value, label }) => (
            <div key={label} className="rounded-lg bg-[#f8fbf8] p-6">
              <p className="text-4xl font-extrabold text-[#2f7d46]">{value}</p>
              <p className="mt-2 text-sm font-semibold text-[#627069]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="erp-eyebrow">Values</p>
          <h2 className="erp-title">What Guides Our Work</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: <FaHandsHelping size={32} />, title: "Integrity", desc: "Clear, responsible work from production to customer care." },
            { icon: <FaLeaf size={32} />, title: "Sustainability", desc: "Careful cultivation practices that respect local resources." },
            { icon: <FaUsers size={32} />, title: "People First", desc: "Members, growers, and customers are central to decisions." },
            { icon: <FaRocket size={32} />, title: "Innovation", desc: "Better systems and workflows for a stronger society." },
            { icon: <FaGlobeAsia size={32} />, title: "Community", desc: "Local progress built through shared opportunity." },
          ].map(({ icon, title, desc }) => (
            <motion.div key={title} className="rounded-lg border border-[#dfe7df] bg-white p-6 text-center shadow-[0_10px_28px_rgba(31,54,36,0.07)]" initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35 }}>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#e6f4e9] text-[#2f7d46]">{icon}</div>
              <h3 className="mt-4 text-lg font-extrabold text-[#172017]">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#627069]">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-[#142116] px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold md:text-4xl">Ready to experience CDS products?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/75">Explore the latest harvest or contact the team for supply information.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <button className="erp-btn bg-white text-[#276b3b] hover:bg-[#eef8f0]" onClick={() => (window.location.href = "/products")}>Shop Now</button>
          <button className="erp-btn border border-white/35 bg-white/10 text-white hover:bg-white/20" onClick={() => (window.location.href = "/contact")}>Contact Us</button>
        </div>
      </section>
    </Fragment>
  );
}
