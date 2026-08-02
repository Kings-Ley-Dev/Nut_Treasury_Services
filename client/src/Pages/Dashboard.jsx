import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Icon } from "../Components/common/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/Toast";
import { LOAN_TYPE_NAMES, EMPLOYMENT, ID_TYPES } from "../data/content";
import api from "../api/client";
import "./Console.css";

const usd = (n) => "$" + Math.round(n || 0).toLocaleString("en-US");
const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const emiCalc = (p, ann, m) => {
  const r = ann / 100 / 12;
  const e = r === 0 ? p / m : (p * r * (1 + r) ** m) / ((1 + r) ** m - 1);
  return e * m ? e : 0;
};

const Pill = ({ v }) => <span className={`spill ${v}`}>{String(v).replace("-", " ")}</span>;

const Dashboard = () => {
  const { user, logout, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [ov, setOv] = useState({ totalBalance: 0, accounts: [], recent: [] });
  const [txns, setTxns] = useState([]);
  const [bens, setBens] = useState([]);
  const [cards, setCards] = useState([]);
  const [loans, setLoans] = useState([]);
  const [notes, setNotes] = useState([]);

  const approved = user?.status === "approved";

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [o, t, b, c, l, n, d, w] = await Promise.all([
        api.get("/bank/overview"),
        api.get("/bank/transactions"),
        api.get("/bank/beneficiaries"),
        api.get("/bank/cards"),
        api.get("/bank/loans"),
        api.get("/bank/notifications"),
        api.get("/bank/deposits"),
        api.get("/bank/withdrawals"),
      ]);
      setOv(o.data);
      setTxns(t.data.transactions);
      setBens(b.data.beneficiaries);
      setCards(c.data.cards);
      setLoans(l.data.loans);
      setNotes(n.data.notifications);
      setDepReqs(d.data.requests);
      setWdReqs(w.data.requests);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const primary = ov.accounts[0];
  const unread = notes.filter((n) => !n.read).length;

  /* ── actions ── */
  const [xfer, setXfer] = useState({ toAccountNumber: "", amount: "", description: "" });
  const doTransfer = async (e) => {
    e.preventDefault();
    try {
      await api.post("/bank/transfer", { fromAccountId: primary?._id, ...xfer });
      toast.success("Transfer completed");
      setXfer({ toAccountNumber: "", amount: "", description: "" });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const [depReqs, setDepReqs] = useState([]);
  const [wdReqs, setWdReqs] = useState([]);

  const [dep, setDep] = useState({ amount: "", note: "" });
  const submitDeposit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/bank/deposits", dep);
      toast.success(data.message);
      setDep({ amount: "", note: "" });
      load();
    } catch (err) { toast.error(err.message); }
  };
  const confirmPaid = async (id) => {
    try { const { data } = await api.post(`/bank/deposits/${id}/paid`, {}); toast.success(data.message); load(); }
    catch (err) { toast.error(err.message); }
  };

  const [wd, setWd] = useState({ amount: "", destination: "", note: "" });
  const submitWithdrawal = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post("/bank/withdrawals", wd);
      toast.success(data.message);
      setWd({ amount: "", destination: "", note: "" });
      load();
    } catch (err) { toast.error(err.message); }
  };

  const [ben, setBen] = useState({ name: "", accountNumber: "", bankName: "", nickname: "" });
  const addBen = async (e) => {
    e.preventDefault();
    try { await api.post("/bank/beneficiaries", ben); setBen({ name: "", accountNumber: "", bankName: "", nickname: "" }); toast.success("Beneficiary added"); load(); }
    catch (err) { toast.error(err.message); }
  };
  const delBen = async (id) => { try { await api.delete(`/bank/beneficiaries/${id}`); load(); } catch (e) { toast.error(e.message); } };

  const issueCard = async (type) => { try { await api.post("/bank/cards", { type }); toast.success("Card issued"); load(); } catch (e) { toast.error(e.message); } };
  const toggleCard = async (c) => {
    try { await api.patch(`/bank/cards/${c._id}`, { status: c.status === "active" ? "frozen" : "active" }); load(); }
    catch (e) { toast.error(e.message); }
  };

  const [loanForm, setLoanForm] = useState({ loanType: LOAN_TYPE_NAMES[0], amount: "", termMonths: "", interestRate: 12, employmentStatus: EMPLOYMENT[0], monthlyIncome: "", purpose: "" });
  const lc = (e) => setLoanForm({ ...loanForm, [e.target.name]: e.target.value });
  const applyLoan = async (e) => {
    e.preventDefault();
    try { await api.post("/bank/loans", loanForm); toast.success("Loan application submitted"); setLoanForm({ ...loanForm, amount: "", termMonths: "", purpose: "" }); load(); }
    catch (err) { toast.error(err.message); }
  };
  const repay = async (id) => { try { const { data } = await api.post(`/bank/loans/${id}/repay`, {}); toast.success(data.message); load(); } catch (e) { toast.error(e.message); } };

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const changePw = async (e) => {
    e.preventDefault();
    try { await api.post("/bank/security/password", pw); toast.success("Password updated"); setPw({ currentPassword: "", newPassword: "" }); }
    catch (err) { toast.error(err.message); }
  };

  const [kyc, setKyc] = useState({ idType: ID_TYPES[0], idNumber: "", dateOfBirth: "", residency: "US Citizen", taxIdType: "SSN", address: "" });
  const kc = (e) => setKyc({ ...kyc, [e.target.name]: e.target.value });
  const submitKyc = async (e) => {
    e.preventDefault();
    try { await api.post("/bank/kyc", kyc); toast.success("KYC submitted for review"); await refreshUser(); }
    catch (err) { toast.error(err.message); }
  };

  const markAll = async () => { try { await api.patch("/bank/notifications/read-all"); load(); } catch (e) { toast.error(e.message); } };

  const downloadStatement = () => {
    const rows = [["Date", "Reference", "Type", "Amount", "Balance", "Description"]];
    txns.forEach((t) => rows.push([fmt(t.createdAt), t.reference, t.type, t.amount, t.balanceAfter, t.description]));
    const csv = rows.map((r) => r.map((c) => `"${c ?? ""}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url; a.download = "nut-statement.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => { logout(); navigate("/"); };
  const emiPreview = loanForm.amount && loanForm.termMonths ? emiCalc(+loanForm.amount, +loanForm.interestRate, +loanForm.termMonths) : 0;

  const nav = [
    { k: "overview", label: "Overview", icon: "grow" },
    { k: "transactions", label: "Transactions", icon: "savings" },
    { k: "money", label: "Deposit & Withdraw", icon: "grow" },
    { k: "transfer", label: "Transfer", icon: "arrow" },
    { k: "beneficiaries", label: "Beneficiaries", icon: "people" },
    { k: "cards", label: "Cards", icon: "loan" },
    { k: "loans", label: "Loans", icon: "spark" },
    { k: "statements", label: "Statements", icon: "doc" },
    { k: "notifications", label: "Notifications", icon: "mail", badge: unread },
    { k: "security", label: "Security", icon: "secure" },
    ...(approved ? [] : [{ k: "kyc", label: "Verify identity", icon: "check" }]),
  ];

  return (
    <div className="console">
      <aside className="console-sidebar">
        <Link to="/" className="console-brand"><img src={logo} alt="Nut Treasury Services" /></Link>
        <span className="console-role">Customer</span>
        <nav className="console-nav">
          {nav.map((n) => (
            <button key={n.k} className={`console-nav-btn ${tab === n.k ? "active" : ""}`} onClick={() => setTab(n.k)}>
              <Icon name={n.icon} size={18} /><span>{n.label}</span>
              {n.badge > 0 && <span className="console-badge">{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="console-foot">
          <button className="console-btn" onClick={load}><Icon name="spark" size={16} /> Refresh</button>
          <button className="console-btn danger" onClick={handleLogout}><Icon name="logout" size={17} /> Sign out</button>
        </div>
      </aside>

      <main className="console-main">
        <div className="console-top">
          <div><h1>Hello, {user?.name?.split(" ")[0]} 👋</h1><p>Welcome to your Nut Treasury Services dashboard</p></div>
          <span className="console-tag">{approved ? "Verified" : "Pending approval"}</span>
        </div>

        {!approved && (
          <div className="console-banner">
            <span>🔎 <strong>Your account is pending approval.</strong> Complete identity verification to unlock transfers, cards and loans.</span>
            <button className="btn btn-primary btn-sm" onClick={() => setTab("kyc")}>Verify identity</button>
          </div>
        )}

        {loading ? (
          <div className="console-loading"><span className="loader-nut">🌰</span><p>Loading your accounts…</p></div>
        ) : (
          <>
            {/* OVERVIEW */}
            {tab === "overview" && (
              <>
                <div className="stat-grid">
                  <div className="stat-card"><span className="stat-ico s-blue"><Icon name="savings" size={22} /></span><span className="stat-num">{usd(ov.totalBalance)}</span><span className="stat-label">Total balance</span></div>
                  <div className="stat-card"><span className="stat-ico s-green"><Icon name="grow" size={22} /></span><span className="stat-num">{ov.accounts.length}</span><span className="stat-label">Accounts</span></div>
                  <div className="stat-card"><span className="stat-ico s-amber"><Icon name="loan" size={22} /></span><span className="stat-num">{cards.length}</span><span className="stat-label">Cards</span></div>
                  <div className="stat-card"><span className="stat-ico s-slate"><Icon name="spark" size={22} /></span><span className="stat-num">{loans.length}</span><span className="stat-label">Loans</span></div>
                </div>
                <div className="panel-grid">
                  <div className="panel">
                    <div className="panel-head"><h3>Primary account</h3>{primary && <Pill v={primary.status} />}</div>
                    {primary ? (
                      <>
                        <span className="acct-num">{primary.accountNumber}</span>
                        <div className="big-balance">{usd(primary.balance)}</div>
                        <p className="muted" style={{ marginTop: 6 }}>{primary.type}</p>
                      </>
                    ) : <p className="muted">No account yet.</p>}
                  </div>
                  <div className="panel">
                    <div className="panel-head"><h3>Recent activity</h3><button className="linklike" onClick={() => setTab("transactions")}>View all</button></div>
                    {ov.recent.length === 0 ? <p className="muted">No transactions yet.</p> : ov.recent.map((t) => (
                      <div key={t._id} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--line-soft)" }}>
                        <span style={{ fontSize: 14 }}>{t.description || t.type}</span>
                        <strong style={{ color: t.type.includes("out") || t.type.includes("repayment") ? "#c2381f" : "#0c7a59" }}>
                          {t.type.includes("out") || t.type.includes("repayment") ? "-" : "+"}{usd(t.amount)}
                        </strong>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TRANSACTIONS */}
            {tab === "transactions" && (
              <div className="panel">
                <div className="panel-head"><h2>Transaction history</h2><button className="mini-btn blue" onClick={downloadStatement}>Download CSV</button></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Date</th><th>Reference</th><th>Type</th><th>Amount</th><th>Balance</th></tr></thead>
                  <tbody>{txns.map((t) => (
                    <tr key={t._id}><td className="muted">{fmt(t.createdAt)}</td><td className="ref">{t.reference}</td>
                      <td>{t.type.replace("-", " ")} {t.flagged && <span className="spill flagged">flagged</span>}</td>
                      <td>{usd(t.amount)}</td><td className="muted">{usd(t.balanceAfter)}</td></tr>
                  ))}</tbody>
                </table>{txns.length === 0 && <div className="empty"><span>💸</span>No transactions yet.</div>}</div>
              </div>
            )}

            {/* DEPOSIT & WITHDRAW */}
            {tab === "money" && (
              <>
                <div className="panel" style={{ maxWidth: 760 }}>
                  <div className="panel-head"><h2>Deposit & Withdraw</h2>{primary && <Pill v={primary.status} />}</div>
                  <p className="muted">{primary?.accountNumber} · Available balance <strong>{usd(primary?.balance)}</strong></p>
                </div>

                {/* DEPOSITS */}
                <div className="panel-grid">
                  <div className="panel">
                    <div className="panel-head"><h3>💰 Request a deposit</h3></div>
                    <p className="muted" style={{ marginBottom: 14 }}>Submit a deposit request. The bank will send you the account details to pay into, here on your dashboard and by email.</p>
                    <form className="mini-form" onSubmit={submitDeposit}>
                      <div><label>Amount ($)</label><input type="number" min="1" value={dep.amount} onChange={(e) => setDep({ ...dep, amount: e.target.value })} required placeholder="500" /></div>
                      <div><label>Note (optional)</label><input value={dep.note} onChange={(e) => setDep({ ...dep, note: e.target.value })} placeholder="e.g. Savings top-up" /></div>
                      <button className="btn btn-primary" disabled={!approved}>Request deposit</button>
                      {!approved && <p className="muted">Available once your account is approved.</p>}
                    </form>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><h3>My deposit requests</h3></div>
                    {depReqs.length === 0 ? <div className="empty"><span>💵</span>No deposit requests yet.</div> : depReqs.map((d) => (
                      <div key={d._id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div><strong className="ref">{d.reference}</strong> · {usd(d.amount)}</div>
                          <Pill v={d.status} />
                        </div>
                        {d.status === "requested" && <p className="muted" style={{ marginTop: 6 }}>Awaiting the bank's deposit account details.</p>}
                        {d.status === "details-sent" && (
                          <div style={{ marginTop: 8 }}>
                            <pre style={{ whiteSpace: "pre-wrap", background: "var(--mist)", padding: "12px 14px", borderRadius: 10, fontSize: 13, fontFamily: "inherit", margin: "0 0 10px" }}>{d.bankDetails}</pre>
                            <button className="mini-btn green" onClick={() => confirmPaid(d._id)}>I've completed the deposit</button>
                          </div>
                        )}
                        {d.status === "paid" && <p className="muted" style={{ marginTop: 6 }}>Payment reported. Awaiting bank confirmation.</p>}
                        {d.status === "received" && <p className="muted" style={{ marginTop: 6 }}>✅ Deposit received and credited.</p>}
                        {d.status === "rejected" && <p className="muted" style={{ marginTop: 6 }}>This request was rejected.</p>}
                      </div>
                    ))}
                  </div>
                </div>

                {/* WITHDRAWALS */}
                <div className="panel-grid">
                  <div className="panel">
                    <div className="panel-head"><h3>🏧 Request a withdrawal</h3></div>
                    <p className="muted" style={{ marginBottom: 14 }}>Withdrawals are reviewed and approved by the bank before funds are released.</p>
                    <form className="mini-form" onSubmit={submitWithdrawal}>
                      <div><label>Amount ($)</label><input type="number" min="1" value={wd.amount} onChange={(e) => setWd({ ...wd, amount: e.target.value })} required placeholder="200" /></div>
                      <div><label>Send to (bank & account)</label><input value={wd.destination} onChange={(e) => setWd({ ...wd, destination: e.target.value })} required placeholder="Bank name, account number" /></div>
                      <div><label>Note (optional)</label><input value={wd.note} onChange={(e) => setWd({ ...wd, note: e.target.value })} placeholder="e.g. Rent" /></div>
                      <button className="btn btn-royal" disabled={!approved}>Request withdrawal</button>
                      {!approved && <p className="muted">Available once your account is approved.</p>}
                    </form>
                  </div>
                  <div className="panel">
                    <div className="panel-head"><h3>My withdrawal requests</h3></div>
                    {wdReqs.length === 0 ? <div className="empty"><span>🏧</span>No withdrawal requests yet.</div> : wdReqs.map((w) => (
                      <div key={w._id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div><strong className="ref">{w.reference}</strong> · {usd(w.amount)}<br /><span className="muted">{w.destination}</span></div>
                          <Pill v={w.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* TRANSFER */}
            {tab === "transfer" && (
              <div className="panel" style={{ maxWidth: 560 }}>
                <div className="panel-head"><h2>Transfer funds</h2></div>
                <p className="muted" style={{ marginBottom: 16 }}>From {primary?.accountNumber} · Balance {usd(primary?.balance)}</p>
                <form className="mini-form" onSubmit={doTransfer}>
                  <div><label>Recipient account number</label><input value={xfer.toAccountNumber} onChange={(e) => setXfer({ ...xfer, toAccountNumber: e.target.value })} required placeholder="NB…" /></div>
                  <div><label>Amount ($)</label><input type="number" min="1" value={xfer.amount} onChange={(e) => setXfer({ ...xfer, amount: e.target.value })} required placeholder="100" /></div>
                  <div><label>Description</label><input value={xfer.description} onChange={(e) => setXfer({ ...xfer, description: e.target.value })} placeholder="What's this for?" /></div>
                  <button className="btn btn-primary" disabled={!approved}>Send transfer</button>
                  {!approved && <p className="muted">Available once your account is approved.</p>}
                </form>
                <p className="muted" style={{ marginTop: 14 }}>Tip: use a saved beneficiary's account number for quick transfers.</p>
              </div>
            )}

            {/* BENEFICIARIES */}
            {tab === "beneficiaries" && (
              <div className="panel-grid">
                <div className="panel">
                  <div className="panel-head"><h2>Beneficiaries</h2></div>
                  {bens.length === 0 ? <div className="empty"><span>👥</span>No saved beneficiaries.</div> : bens.map((b) => (
                    <div key={b._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <div><strong>{b.nickname || b.name}</strong><br /><span className="muted">{b.accountNumber} · {b.bankName}</span></div>
                      <button className="mini-btn red" onClick={() => delBen(b._id)}>Remove</button>
                    </div>
                  ))}
                </div>
                <div className="panel">
                  <div className="panel-head"><h3>Add beneficiary</h3></div>
                  <form className="mini-form" onSubmit={addBen}>
                    <div><label>Name</label><input value={ben.name} onChange={(e) => setBen({ ...ben, name: e.target.value })} required /></div>
                    <div className="row">
                      <div><label>Account number</label><input value={ben.accountNumber} onChange={(e) => setBen({ ...ben, accountNumber: e.target.value })} required /></div>
                      <div><label>Nickname</label><input value={ben.nickname} onChange={(e) => setBen({ ...ben, nickname: e.target.value })} /></div>
                    </div>
                    <div><label>Bank</label><input value={ben.bankName} onChange={(e) => setBen({ ...ben, bankName: e.target.value })} placeholder="Nut Treasury Services" /></div>
                    <button className="btn btn-royal" disabled={!approved}>Save beneficiary</button>
                  </form>
                </div>
              </div>
            )}

            {/* CARDS */}
            {tab === "cards" && (
              <div className="panel">
                <div className="panel-head"><h2>Card management</h2>
                  <div className="row-actions">
                    <button className="mini-btn green" onClick={() => issueCard("virtual")} disabled={!approved}>+ Virtual card</button>
                    <button className="mini-btn blue" onClick={() => issueCard("physical")} disabled={!approved}>+ Physical card</button>
                  </div>
                </div>
                {cards.length === 0 ? <div className="empty"><span>💳</span>No cards yet. Issue a virtual card to get started.</div> : (
                  <div className="stat-grid" style={{ marginBottom: 0 }}>
                    {cards.map((c) => (
                      <div key={c._id}>
                        <div className={`bank-card ${c.status !== "active" ? "frozen" : ""}`}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}><span className="bc-brand">{c.brand}</span><span style={{ fontSize: 12 }}>{c.type}</span></div>
                          <span className="bc-num">•••• •••• •••• {c.last4}</span>
                          <div className="bc-foot"><span>{c.holderName}</span><span>exp {c.expiry}</span></div>
                        </div>
                        <div className="row-actions" style={{ marginTop: 10 }}>
                          <Pill v={c.status} />
                          <button className="mini-btn" onClick={() => toggleCard(c)}>{c.status === "active" ? "Freeze" : "Unfreeze"}</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* LOANS */}
            {tab === "loans" && (
              <div className="panel-grid">
                <div className="panel">
                  <div className="panel-head"><h2>My loans</h2></div>
                  {loans.length === 0 ? <div className="empty"><span>🌳</span>No loans yet.</div> : loans.map((l) => (
                    <div key={l._id} style={{ padding: "14px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><strong className="ref">{l.reference}</strong> · {l.loanType}<br />
                          <span className="muted">{usd(l.amount)} · {l.termMonths} mo · {l.interestRate}% APR</span></div>
                        <Pill v={l.status} />
                      </div>
                      {["disbursed", "repaying"].includes(l.status) && (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                          <span className="muted">Outstanding {usd(l.outstanding)} · EMI {usd(l.monthlyEmi)}</span>
                          <button className="mini-btn green" onClick={() => repay(l._id)}>Pay installment</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="panel">
                  <div className="panel-head"><h3>Apply for a loan</h3></div>
                  <form className="mini-form" onSubmit={applyLoan}>
                    <div className="row">
                      <div><label>Type</label><select name="loanType" value={loanForm.loanType} onChange={lc}>{LOAN_TYPE_NAMES.map((t) => <option key={t}>{t}</option>)}</select></div>
                      <div><label>Amount ($)</label><input type="number" name="amount" value={loanForm.amount} onChange={lc} required /></div>
                    </div>
                    <div className="row">
                      <div><label>Term (months)</label><input type="number" name="termMonths" value={loanForm.termMonths} onChange={lc} required /></div>
                      <div><label>APR (%)</label><input type="number" step="0.5" name="interestRate" value={loanForm.interestRate} onChange={lc} /></div>
                    </div>
                    <div className="row">
                      <div><label>Employment</label><select name="employmentStatus" value={loanForm.employmentStatus} onChange={lc}>{EMPLOYMENT.map((t) => <option key={t}>{t}</option>)}</select></div>
                      <div><label>Monthly income ($)</label><input type="number" name="monthlyIncome" value={loanForm.monthlyIncome} onChange={lc} /></div>
                    </div>
                    <div><label>Purpose</label><textarea name="purpose" value={loanForm.purpose} onChange={lc} required /></div>
                    {emiPreview > 0 && <p className="muted">Estimated monthly payment: <strong>{usd(emiPreview)}</strong></p>}
                    <button className="btn btn-primary" disabled={!approved}>Submit application</button>
                  </form>
                </div>
              </div>
            )}

            {/* STATEMENTS */}
            {tab === "statements" && (
              <div className="panel" style={{ maxWidth: 560 }}>
                <div className="panel-head"><h2>Statements</h2></div>
                <p className="muted" style={{ marginBottom: 16 }}>Download a CSV statement of your transaction history for your records or your accountant.</p>
                <button className="btn btn-primary" onClick={downloadStatement}><Icon name="doc" size={17} /> Download statement (CSV)</button>
              </div>
            )}

            {/* NOTIFICATIONS */}
            {tab === "notifications" && (
              <div className="panel">
                <div className="panel-head"><h2>Notifications</h2>{unread > 0 && <button className="mini-btn blue" onClick={markAll}>Mark all read</button>}</div>
                {notes.length === 0 ? <div className="empty"><span>🔔</span>No notifications.</div> : notes.map((n) => (
                  <div key={n._id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line-soft)", opacity: n.read ? 0.6 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><strong>{n.title}</strong><span className="muted">{fmt(n.createdAt)}</span></div>
                    <span className="muted">{n.body}</span>
                  </div>
                ))}
              </div>
            )}

            {/* SECURITY */}
            {tab === "security" && (
              <div className="panel" style={{ maxWidth: 520 }}>
                <div className="panel-head"><h2>Security center</h2></div>
                <form className="mini-form" onSubmit={changePw}>
                  <div><label>Current password</label><input type="password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required /></div>
                  <div><label>New password</label><input type="password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required placeholder="At least 6 characters" /></div>
                  <button className="btn btn-primary">Update password</button>
                </form>
                <p className="muted" style={{ marginTop: 16 }}>Tip: never share your password or one-time codes. Nut Treasury Services will never ask for them.</p>
              </div>
            )}

            {/* KYC */}
            {tab === "kyc" && !approved && (
              <div className="panel" style={{ maxWidth: 620 }}>
                <div className="panel-head"><h2>Identity verification (KYC)</h2><Pill v={user?.kyc?.status || "not-submitted"} /></div>
                <p className="muted" style={{ marginBottom: 16 }}>Foreign nationals welcome. Provide a passport with an ITIN or SSN.</p>
                <form className="mini-form" onSubmit={submitKyc}>
                  <div className="row">
                    <div><label>ID type</label><select name="idType" value={kyc.idType} onChange={kc}>{ID_TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
                    <div><label>ID number</label><input name="idNumber" value={kyc.idNumber} onChange={kc} required /></div>
                  </div>
                  <div className="row">
                    <div><label>Date of birth</label><input type="date" name="dateOfBirth" value={kyc.dateOfBirth} onChange={kc} /></div>
                    <div><label>Residency</label><select name="residency" value={kyc.residency} onChange={kc}><option>US Citizen</option><option>Permanent Resident</option><option>Foreign National</option></select></div>
                  </div>
                  <div className="row">
                    <div><label>Tax ID type</label><select name="taxIdType" value={kyc.taxIdType} onChange={kc}><option>SSN</option><option>ITIN</option></select></div>
                    <div><label>Address</label><input name="address" value={kyc.address} onChange={kc} placeholder="Street, city, state, ZIP" /></div>
                  </div>
                  <button className="btn btn-primary">Submit for review</button>
                </form>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
