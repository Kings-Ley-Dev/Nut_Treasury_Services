import { useState } from "react";
import PageHero from "../Components/common/PageHero";
import { Icon } from "../Components/common/Icons";
import { useReveal } from "../Components/common/useReveal";
import { useToast } from "../context/Toast";
import api from "../api/client";
import { BANK, FAQS } from "../data/content";
import "./Inner.css";
import "./Contact.css";
import PhoneField from "../Components/common/PhoneField";

const Contact = () => {
  useReveal();
  const toast = useToast();
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/contact", form);
      toast.success(data.message);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const channels = [
    { icon: "phone", label: "Call us", value: BANK.phone, sub: "Mon to Fri, 9am to 5pm" },
    { icon: "chat", label: "Text us", value: BANK.textLine, sub: "Quick SMS support" },
    { icon: "mail", label: "Email", value: BANK.email, sub: "Replies within 24h" },
  ];

  return (
    <div className="inner">
      <PageHero
        eyebrow="Contact"
        title="We'd love to hear from you"
        subtitle="Questions about saving, borrowing or opening an account? Reach us any way you like."
        crumb="Contact"
      />

      {/* Channels */}
      <section className="section-tight">
        <div className="container channels-grid">
          {channels.map((c, i) => (
            <div className="channel-card reveal" key={c.label} style={{ transitionDelay: `${i * 0.05}s` }}>
              <span className="channel-icon"><Icon name={c.icon} size={22} /></span>
              <span className="channel-label">{c.label}</span>
              <strong className="channel-value">{c.value}</strong>
              <span className="channel-sub">{c.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Form + hours */}
      <section className="section contact-main">
        <div className="container contact-grid">
          <form className="contact-form card reveal" onSubmit={submit}>
            <span className="eyebrow">Send a message</span>
            <h2>Drop us a line</h2>
            <div className="field-row">
              <div className="field">
                <label>Your name *</label>
                <input name="name" value={form.name} onChange={change} required placeholder="Full name" />
              </div>
              <div className="field">
                <label>Phone</label>
                <PhoneField value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Email *</label>
                <input type="email" name="email" value={form.email} onChange={change} required placeholder="you@example.com" />
              </div>
              <div className="field">
                <label>Subject *</label>
                <input name="subject" value={form.subject} onChange={change} required placeholder="How can we help?" />
              </div>
            </div>
            <div className="field">
              <label>Message *</label>
              <textarea name="message" value={form.message} onChange={change} required placeholder="Tell us a bit more…" />
            </div>
            <button className="btn btn-primary btn-lg" disabled={busy}>
              {busy ? "Sending…" : "Send message"} <Icon name="arrow" size={17} />
            </button>
          </form>

          <aside className="contact-side reveal">
            <div className="hours-card card">
              <span className="hours-icon"><Icon name="clock" size={22} /></span>
              <h3>Support hours</h3>
              <table className="hours-table">
                <tbody>
                  {BANK.hours.map(([d, t]) => (
                    <tr key={d}><td>{d}</td><td>{t}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="online-card card">
              <span className="online-icon"><Icon name="secure" size={24} /></span>
              <h3>Fully online</h3>
              <p>Open accounts, borrow and manage your money securely from anywhere in the U.S., whenever it suits you.</p>
            </div>
          </aside>
        </div>
      </section>

      {/* FAQ */}
      <section className="section faq-section">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">Good to know</span>
            <h2>Frequently asked questions</h2>
          </div>
          <div className="faq-list reveal">
            {FAQS.map((f, i) => (
              <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={f.q}>
                <button className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  {f.q}
                  <span className="faq-toggle">{openFaq === i ? "−" : "+"}</span>
                </button>
                <div className="faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
