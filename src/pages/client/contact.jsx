import { useState } from "react";
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
  FiCheckCircle,
} from "react-icons/fi";

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  textarea = false,
}) {
  return (
    <div>
      <label htmlFor={name} className="erp-label">
        {label}
      </label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          rows={5}
          className="erp-input min-h-36 resize-y"
          value={value}
          onChange={onChange}
          required
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className="erp-input"
          value={value}
          onChange={onChange}
          required
          {...(name === "telephone" && {
            pattern: "^(?:\\+94|94|0)(7[01245678])[0-9]{7}$",
            title:
              "Please enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567)",
          })}
        />
      )}
    </div>
  );
}

function ContactItem({ icon, title, value, href, meta }) {
  return (
    <div className="flex gap-4 rounded-lg border border-[#dfe7df] bg-white p-4 shadow-[0_8px_20px_rgba(31,54,36,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e6f4e9] text-xl text-[#2f7d46]">
        {icon}
      </div>

      <div>
        <p className="font-extrabold text-[#172017]">{title}</p>

        {href ? (
          <a
            href={href}
            className="font-bold text-[#2f7d46] hover:underline"
          >
            {value}
          </a>
        ) : (
          <span className="font-bold text-[#2f7d46]">{value}</span>
        )}

        {meta && (
          <p className="mt-1 text-xs font-semibold text-[#627069]">
            {meta}
          </p>
        )}
      </div>
    </div>
  );
}

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    telephone: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setSuccess(false);
    setError("");

    if (name === "telephone") {
      let phone = value.replace(/[^\d+]/g, "");

      if (phone.includes("+")) {
        phone =
          "+" +
          phone
            .substring(1)
            .replace(/\+/g, "");
      }

      setForm((prev) => ({
        ...prev,
        telephone: phone,
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^(?:\+94|94|0)(7[01245678])[0-9]{7}$/;

    if (!phoneRegex.test(form.telephone.trim())) {
      setError(
        "Please enter a valid Sri Lankan mobile number (e.g. 0771234567 or +94771234567)."
      );
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Failed to send message.");
      }

      setSuccess(true);

      setForm({
        name: "",
        telephone: "",
        email: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f4f7f4]">
      {/* Hero */}
      <section className="relative flex min-h-[42vh] items-center overflow-hidden bg-[#142116]">
        <img
          src="/contactBanner.jpg"
          alt="Contact"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#101810]/90 via-[#101810]/60 to-transparent" />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-16 text-white sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#b9dfbf]">
            Contact CDS
          </p>

          <h1 className="mt-4 max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">
            Talk to the Mushroom Production Society
          </h1>

          <p className="mt-4 max-w-2xl text-white/80">
            Reach us for products, deliveries, membership, technical support,
            and production inquiries.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        {/* Left */}
        <div className="space-y-6">
          <div>
            <p className="erp-eyebrow">Support</p>

            <h2 className="erp-title">We're here to help</h2>

            <p className="erp-subtitle">
              Have questions about mushroom production, products, deliveries or
              becoming a member? We'd love to hear from you.
            </p>
          </div>

          <div className="space-y-4">
            <ContactItem
              icon={<FiMail />}
              title="Email"
              value="cdscommunity.lk@gmail.com"
              href="mailto:cdscommunity.lk@gmail.com"
            />

            <ContactItem
              icon={<FiPhone />}
              title="Phone"
              value="+94 77 075 4486"
              href="tel:+94770754486"
              meta="Monday - Friday | 9:00 AM - 6:00 PM"
            />

            <ContactItem
              icon={<FiMapPin />}
              title="Address"
              value="Malmaduwa, Kotiyakumbura, Sri Lanka"
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-[#dfe7df] bg-white shadow-lg">
            <iframe
              title="CDS Location"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d720.3858114549289!2d80.27390926943457!3d7.137538330266953!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e1!3m2!1sen!2slk!4v1779035872417!5m2!1sen!2slk"
              loading="lazy"
              className="h-72 w-full border-0"
            />
          </div>
        </div>

        {/* Right */}
        <div className="rounded-xl border border-[#dfe7df] bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-extrabold text-[#172017]">
            Send us a Message
          </h2>

          {success && (
            <div className="mt-6 flex items-center gap-3 rounded-lg border border-[#c9e8d0] bg-[#eef8f0] p-4 text-[#276b3b]">
              <FiCheckCircle className="text-xl" />
              Thank you! Your message has been sent successfully.
            </div>
          )}

          {error && (
            <div className="mt-6 rounded-lg border border-[#ffd5d1] bg-[#fff1f0] p-4 text-[#b42318]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <Field
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Telephone Number"
                name="telephone"
                type="tel"
                value={form.telephone}
                onChange={handleChange}
              />

              <Field
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <Field
              label="Subject"
              name="subject"
              value={form.subject}
              onChange={handleChange}
            />

            <Field
              label="Message"
              name="message"
              textarea
              value={form.message}
              onChange={handleChange}
            />

            <button
              type="submit"
              disabled={submitting}
              className="erp-btn erp-btn-primary flex w-full items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  Sending...
                  <FiSend className="animate-pulse" />
                </>
              ) : (
                <>
                  Send Message
                  <FiSend />
                </>
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}