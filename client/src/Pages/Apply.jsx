import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHero from "../Components/common/PageHero";
import { Icon } from "../Components/common/Icons";
import { useToast } from "../context/Toast";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import {
  ACCOUNT_TYPES,
  ID_TYPES,
  LOAN_TYPE_NAMES,
  EMPLOYMENT,
} from "../data/content";
import "./Inner.css";
import "./Apply.css";
import PhoneField from "../Components/common/PhoneField";

const usd = (n) => "$" + Math.round(n || 0).toLocaleString("en-US");

const Apply = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [tab, setTab] = useState("account");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null); // { reference, type }

  // Initial form states (will be populated dynamically once user loads)
  const [acc, setAcc] = useState({
    fullName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    idType: ID_TYPES[0] || "",
    idNumber: "",
    address: "",
    occupation: "",
    accountType: ACCOUNT_TYPES[0] || "",
    initialDeposit: "",
  });

  const [loan, setLoan] = useState({
    fullName: "",
    email: "",
    phone: "",
    loanType: LOAN_TYPE_NAMES[0] || "",
    amount: "",
    termMonths: "",
    interestRate: 22,
    employmentStatus: EMPLOYMENT[0] || "",
    monthlyIncome: "",
    purpose: "",
  });

  // Watch for auth state changes and sync user details into the forms
  useEffect(() => {
    if (user) {
      setAcc((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
      setLoan((prev) => ({
        ...prev,
        fullName: prev.fullName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }
  }, [user]);

  const accChange = (e) => setAcc({ ...acc, [e.target.name]: e.target.value });
  const loanChange = (e) => setLoan({ ...loan, [e.target.name]: e.target.value });

  // Live EMI preview on loan form
  const emiPreview = useMemo(() => {
    const p = +loan.amount, m = +loan.termMonths, ann = +loan.interestRate;
    if (!p || !m || p <= 0 || m <= 0) return null;
    const r = ann / 100 / 12;
    const e = r === 0 ? p / m : (p * r * (1 + r) ** m) / ((1 + r) ** m - 1);
    return e * m ? { emi: e, total: e * m } : null;
  }, [loan.amount, loan.termMonths, loan.interestRate]);

  const submitAccount = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // NOTE: Ensure your backend response contains { message, reference } directly in the body
      const { data } = await api.post("/accounts", {
        ...acc,
        initialDeposit: Number(acc.initialDeposit) || 0,
      });
      
      toast.success(data.message || "Account created successfully!");
      setDone({ reference: data.reference, type: "account" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitLoan = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // NOTE: Ensure your backend response contains { message, reference } directly in the body
      const { data } = await api.post("/loans", {
        ...loan,
        amount: Number(loan.amount),
        termMonths: Number(loan.termMonths),
        interestRate: Number(loan.interestRate),
        monthlyIncome: Number(loan.monthlyIncome) || 0,
      });
      
      toast.success(data.message || "Loan requested successfully!");
      setDone({ reference: data.reference, type: "loan" });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    return (
      <div className="inner">
        <PageHero eyebrow="Application received" title="Your seed is planted 🌱" crumb="Apply" />
        <section className="section">
          <div className="container">
            <div className="success-card reveal in">
              <span className="success-tick"><Icon name="check" size={34} /></span>
              <h2>Thank you, {done.type === "loan" ? loan.fullName : acc.fullName}!</h2>
              <p>
                We've received your {done.type === "loan" ? "loan request" : "account application"}.
                Our team will review it and reach out within 24–48 hours.
              </p>
              <div className="success-ref">
                <span>Your reference</span>
                <strong>{done.reference || "N/A"}</strong>
              </div>
              <div className="success-actions">
                {user ? (
                  <Link to="/dashboard" className="btn btn-primary">Track in your dashboard</Link>
                ) : (
                  <Link to="/register" className="btn btn-primary">Create an account to track it</Link>
                )}
                <Link to="/" className="btn btn-ghost">Back home</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="inner">
      <PageHero
        eyebrow="Get started"
        title="Apply in a few minutes"
        subtitle="Open an account or request a loan online. No lines, no fuss. Just a clear path to growth."
        crumb="Apply"
      />

      <section className="section">
        <div className="container apply-layout">
          {/* Form */}
          <div className="apply-main">
            <div className="apply-tabs">
              <button className={tab === "account" ? "active" : ""} onClick={() => setTab("account")}>
                <Icon name="savings" size={18} /> Open an account
              </button>
              <button className={tab === "loan" ? "active" : ""} onClick={() => setTab("loan")}>
                <Icon name="loan" size={18} /> Apply for a loan
              </button>
            </div>

            {tab === "account" ? (
              <form className="apply-form card" onSubmit={submitAccount}>
                <h3 className="form-title">Account application</h3>
                <div className="field-row">
                  <div className="field">
                    <label>Full name *</label>
                    <input name="fullName" value={acc.fullName} onChange={accChange} required placeholder="Sarah Johnson" />
                  </div>
                  <div className="field">
                    <label>Phone *</label>
                    <PhoneField value={acc.phone} onChange={(v) => setAcc({ ...acc, phone: v })} required />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Email *</label>
                    <input type="email" name="email" value={acc.email} onChange={accChange} required placeholder="you@example.com" />
                  </div>
                  <div className="field">
                    <label>Date of birth</label>
                    <input type="date" name="dateOfBirth" value={acc.dateOfBirth} onChange={accChange} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>ID type *</label>
                    <select name="idType" value={acc.idType} onChange={accChange}>
                      {ID_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>ID number *</label>
                    <input name="idNumber" value={acc.idNumber} onChange={accChange} required placeholder="Your ID or license number" />
                  </div>
                </div>
                <div className="field">
                  <label>Residential address *</label>
                  <input name="address" value={acc.address} onChange={accChange} required placeholder="Street address, city, state, ZIP" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Occupation</label>
                    <input name="occupation" value={acc.occupation} onChange={accChange} placeholder="e.g. Store owner" />
                  </div>
                  <div className="field">
                    <label>Account type *</label>
                    <select name="accountType" value={acc.accountType} onChange={accChange}>
                      {ACCOUNT_TYPES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Initial deposit ($)</label>
                  <input type="number" min="0" name="initialDeposit" value={acc.initialDeposit} onChange={accChange} placeholder="20" />
                </div>
                <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
                  {busy ? "Submitting…" : "Submit application"}
                </button>
              </form>
            ) : (
              <form className="apply-form card" onSubmit={submitLoan}>
                <h3 className="form-title">Loan application</h3>
                <div className="field-row">
                  <div className="field">
                    <label>Full name *</label>
                    <input name="fullName" value={loan.fullName} onChange={loanChange} required placeholder="Michael Carter" />
                  </div>
                  <div className="field">
                    <label>Phone *</label>
                    <PhoneField value={loan.phone} onChange={(v) => setLoan({ ...loan, phone: v })} required />
                  </div>
                </div>
                <div className="field">
                  <label>Email *</label>
                  <input type="email" name="email" value={loan.email} onChange={loanChange} required placeholder="you@example.com" />
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Loan type *</label>
                    <select name="loanType" value={loan.loanType} onChange={loanChange}>
                      {LOAN_TYPE_NAMES.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Amount ($) *</label>
                    <input type="number" min="100" name="amount" value={loan.amount} onChange={loanChange} required placeholder="5000" />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Term (months) *</label>
                    <input type="number" min="1" name="termMonths" value={loan.termMonths} onChange={loanChange} required placeholder="12" />
                  </div>
                  <div className="field">
                    <label>Interest rate (% p.a.)</label>
                    <input type="number" step="0.5" name="interestRate" value={loan.interestRate} onChange={loanChange} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label>Employment</label>
                    <select name="employmentStatus" value={loan.employmentStatus} onChange={loanChange}>
                      {EMPLOYMENT.map((t) => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="field">
                    <label>Monthly income ($)</label>
                    <input type="number" min="0" name="monthlyIncome" value={loan.monthlyIncome} onChange={loanChange} placeholder="2000" />
                  </div>
                </div>
                <div className="field">
                  <label>Purpose of loan *</label>
                  <textarea name="purpose" value={loan.purpose} onChange={loanChange} required placeholder="Tell us how you'll use the funds…" />
                </div>

                {emiPreview && (
                  <div className="emi-preview">
                    <div>
                      <span>Estimated monthly repayment</span>
                      <strong>{usd(emiPreview.emi)}</strong>
                    </div>
                    <div>
                      <span>Total payable</span>
                      <strong>{usd(emiPreview.total)}</strong>
                    </div>
                  </div>
                )}

                <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
                  {busy ? "Submitting…" : "Submit loan request"}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <aside className="apply-aside">
            <div className="aside-card card">
              <h4>What you'll need</h4>
              <ul className="aside-list">
                {["Valid government ID or passport", "Your SSN or ITIN (foreign nationals welcome)", "Proof of address", "Opening deposit (for accounts)"].map((x) => (
                  <li key={x}><span className="pp-check"><Icon name="check" size={13} /></span>{x}</li>
                ))}
              </ul>
            </div>
            <div className="aside-card card aside-help">
              <span className="aside-help-icon"><Icon name="chat" size={22} /></span>
              <h4>Need a hand?</h4>
              <p>Our team is happy to walk you through it.</p>
              <Link to="/contact" className="btn btn-ghost btn-sm btn-block">Contact support</Link>
            </div>
            <div className="aside-card card aside-secure">
              <Icon name="secure" size={20} />
              <p>Your information is encrypted and handled under U.S. federal banking and privacy rules.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default Apply;
