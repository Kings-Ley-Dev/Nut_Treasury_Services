import PageHero from "../Components/common/PageHero";
import { useReveal } from "../Components/common/useReveal";
import { BANK } from "../data/content";
import "./Inner.css";
import "./Legal.css";

const sections = [
  { id: "accept", h: "Acceptance of terms", p: ["By opening an account or using the Nut Treasury Services platform you agree to these terms. If you do not agree, please do not use our services."] },
  { id: "eligible", h: "Eligibility", p: ["Our services are intended mainly for U.S. citizens, and foreign nationals may also apply with a valid passport and an ITIN or Social Security number. You must be at least 18 years old and provide accurate information."] },
  { id: "accounts", h: "Your accounts", list: ["Keep your login credentials confidential", "You are responsible for activity on your account", "Maintain accurate contact and identity information", "We may freeze or close accounts that violate these terms or applicable law"] },
  { id: "loans", h: "Loans and repayment", p: ["Loan approval is subject to review and risk assessment. When a loan is disbursed you agree to repay the principal plus interest according to the schedule shown in your dashboard. Missed repayments may incur fees and affect future eligibility."] },
  { id: "fees", h: "Fees", p: ["Applicable fees are disclosed before you complete a transaction or open a product. Our everyday savings products have no monthly maintenance fee."] },
  { id: "liability", h: "Limitation of liability", p: ["We work hard to keep the platform available and secure, but services are provided on an as-available basis. To the extent permitted by law, we are not liable for indirect or consequential losses."] },
  { id: "changes", h: "Changes to these terms", p: ["We may update these terms from time to time. Continued use of the platform after changes take effect means you accept the updated terms."] },
  { id: "contact", h: "Contact us", p: [`Questions about these terms? Email ${BANK.email} or call ${BANK.phone}.`] },
];

const Terms = () => {
  useReveal();
  return (
    <div className="inner">
      <PageHero eyebrow="Legal" title="Terms of Service" subtitle="The agreement that governs your use of Nut Treasury Services." crumb="Terms" />
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
          <div className="legal-note">These terms are a plain-language overview and do not replace the formal account agreements you receive on sign-up.</div>
        </div>
      </section>
    </div>
  );
};

export default Terms;
