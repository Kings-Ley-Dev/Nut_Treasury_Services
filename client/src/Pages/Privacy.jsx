import PageHero from "../Components/common/PageHero";
import { useReveal } from "../Components/common/useReveal";
import { BANK } from "../data/content";
import "./Inner.css";
import "./Legal.css";

const sections = [
  {
    id: "collect",
    h: "Information we collect",
    p: [
      "When you open an account or apply for a loan we collect the details you provide, such as your name, contact information, date of birth, tax identification number (SSN or ITIN), and identity documents used for verification.",
      "We also collect information automatically as you use our online platform, including device data, log information and the transactions you make.",
    ],
  },
  {
    id: "use",
    h: "How we use your information",
    list: [
      "To open, service and protect your accounts and loans",
      "To verify your identity and meet our legal and regulatory obligations",
      "To detect, prevent and investigate fraud or unauthorized activity",
      "To communicate with you about your accounts, products and support requests",
    ],
  },
  {
    id: "share",
    h: "How we share information",
    p: [
      "We do not sell your personal information. We share it only with service providers who help us operate the platform, and with regulators or law enforcement when required by law.",
    ],
  },
  {
    id: "security",
    h: "How we protect it",
    p: [
      "Your data is encrypted in transit and at rest, access is limited to authorized staff, and every sensitive action is logged. See our Security page for more detail.",
    ],
  },
  {
    id: "rights",
    h: "Your choices and rights",
    list: [
      "Access and update your personal information from your dashboard",
      "Request a copy of the data we hold about you",
      "Ask us to close your account and delete eligible data",
    ],
  },
  {
    id: "contact",
    h: "Contact us",
    p: [`Questions about this policy? Email ${BANK.email} or call ${BANK.phone}.`],
  },
];

const Privacy = () => {
  useReveal();
  return (
    <div className="inner">
      <PageHero eyebrow="Legal" title="Privacy Policy" subtitle="How Nut Treasury Services collects, uses and protects your information." crumb="Privacy" />
      <section className="legal">
        <div className="container legal-wrap reveal">
          <p className="legal-updated">Last updated: January 2024</p>
          <div className="legal-toc">
            <h3>On this page</h3>
            <ol>{sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.h}</a></li>)}</ol>
          </div>
          {sections.map((s, i) => (
            <div className="legal-block" id={s.id} key={s.id}>
              <h2><span>{String(i + 1).padStart(2, "0")}</span>{s.h}</h2>
              {s.p?.map((t, j) => <p key={j}>{t}</p>)}
              {s.list && <ul>{s.list.map((t) => <li key={t}>{t}</li>)}</ul>}
            </div>
          ))}
          <div className="legal-note">This summary is provided for clarity and does not replace formal disclosures you receive when opening an account.</div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;
