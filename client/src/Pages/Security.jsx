import PageHero from "../Components/common/PageHero";
import { Icon } from "../Components/common/Icons";
import { useReveal } from "../Components/common/useReveal";
import { BANK } from "../data/content";
import "./Inner.css";
import "./Legal.css";

const measures = [
  { icon: "secure", h: "Encryption everywhere", p: "Your data is encrypted in transit with TLS and encrypted at rest, so information is protected on the move and in storage." },
  { icon: "fast", h: "Continuous monitoring", p: "Transactions are screened in real time and unusual activity above our thresholds is automatically flagged for review." },
  { icon: "people", h: "Least-privilege access", p: "Only authorized staff can access sensitive systems, and every administrative action is written to an immutable audit log." },
  { icon: "check", h: "Account protection", p: "We support strong passwords and account alerts, and you can freeze a card instantly from your dashboard if something looks wrong." },
];

const tips = [
  "Use a unique, strong password and never share it",
  "Be wary of anyone asking for your password, PIN or one-time codes",
  "We will never ask for your full password by phone or email",
  "Freeze your card from the dashboard the moment it goes missing",
  "Always check you are on our official website before signing in",
];

const Security = () => {
  useReveal();
  return (
    <div className="inner">
      <PageHero eyebrow="Legal" title="Security" subtitle="How we keep your money and information safe, and how you can help." crumb="Security" />
      <section className="section">
        <div className="container">
          <div className="values-grid reveal">
            {measures.map((m) => (
              <div className="value-card" key={m.h}>
                <span className="value-icon"><Icon name={m.icon} size={24} /></span>
                <h3>{m.h}</h3>
                <p>{m.p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="legal" style={{ paddingTop: 0 }}>
        <div className="container legal-wrap reveal">
          <div className="legal-block">
            <h2><span>01</span>How you can stay safe</h2>
            <ul>{tips.map((t) => <li key={t}>{t}</li>)}</ul>
          </div>
          <div className="legal-note">Spotted something suspicious? Contact us right away at {BANK.email} or {BANK.phone} and freeze any affected cards from your dashboard.</div>
        </div>
      </section>
    </div>
  );
};

export default Security;
