import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Icon } from "../Components/common/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/Toast";
import api from "../api/client";
import "./Console.css";

const usd = (n) => "$" + Math.round(n || 0).toLocaleString("en-US");
const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const Pill = ({ v }) => <span className={`spill ${v}`}>{String(v).replace("-", " ")}</span>;

const EmployeeDashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("tickets");
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [loans, setLoans] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [detailsFor, setDetailsFor] = useState(null);
  const [detailsText, setDetailsText] = useState("");
  const [q, setQ] = useState("");
  const [openTicket, setOpenTicket] = useState(null);
  const [reply, setReply] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [t, l, d, w] = await Promise.all([
        api.get("/staff/tickets"), api.get("/staff/loans"),
        api.get("/staff/deposits"), api.get("/staff/withdrawals"),
      ]);
      setTickets(t.data.tickets);
      setLoans(l.data.loans);
      setDeposits(d.data.requests);
      setWithdrawals(w.data.requests);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const searchCustomers = async (e) => {
    e?.preventDefault();
    try { const { data } = await api.get(`/staff/customers?q=${encodeURIComponent(q)}`); setCustomers(data.customers); }
    catch (err) { toast.error(err.message); }
  };
  useEffect(() => { if (tab === "customers" && customers.length === 0) searchCustomers(); /* eslint-disable-next-line */ }, [tab]);

  const assign = async (id) => { try { await api.patch(`/staff/tickets/${id}/assign`); toast.success("Assigned to you"); load(); } catch (e) { toast.error(e.message); } };
  const setStatus = async (id, status) => { try { await api.patch(`/staff/tickets/${id}/status`, { status }); load(); if (openTicket?._id === id) setOpenTicket({ ...openTicket, status }); } catch (e) { toast.error(e.message); } };
  const sendReply = async (id) => {
    if (!reply.trim()) return;
    try { const { data } = await api.post(`/staff/tickets/${id}/reply`, { message: reply }); setReply(""); setOpenTicket(data.ticket); load(); }
    catch (e) { toast.error(e.message); }
  };
  const review = async (id) => { try { await api.patch(`/staff/loans/${id}/review`); toast.success("Marked under review"); load(); } catch (e) { toast.error(e.message); } };
  const decide = async (id, decision) => { try { await api.patch(`/staff/loans/${id}/decision`, { decision }); toast.success(`Loan ${decision}`); load(); } catch (e) { toast.error(e.message); } };

  const depositTemplate = (ref) => `Please make your deposit to:\nBank: Nut Treasury Services\nAccount name: Nut Treasury Services Deposits\nAccount number: 000-123-456-789\nRouting (ACH): 021000021\nReference: ${ref}\n\nOnce sent, the customer marks the deposit as completed on their dashboard.`;
  const openDetails = (d) => { setDetailsFor(d._id); setDetailsText(d.bankDetails || depositTemplate(d.reference)); };
  const sendDetails = async () => { try { const { data } = await api.post(`/staff/deposits/${detailsFor}/details`, { bankDetails: detailsText }); toast.success(data.message); setDetailsFor(null); load(); } catch (e) { toast.error(e.message); } };
  const confirmDeposit = async (id) => { try { const { data } = await api.post(`/staff/deposits/${id}/confirm`); toast.success(data.message); load(); } catch (e) { toast.error(e.message); } };
  const rejectDeposit = async (id) => { try { await api.post(`/staff/deposits/${id}/reject`); toast.success("Deposit rejected"); load(); } catch (e) { toast.error(e.message); } };
  const approveWithdrawal = async (id) => { try { const { data } = await api.post(`/staff/withdrawals/${id}/approve`); toast.success(data.message); load(); } catch (e) { toast.error(e.message); } };
  const rejectWithdrawal = async (id) => { try { await api.post(`/staff/withdrawals/${id}/reject`); toast.success("Withdrawal rejected"); load(); } catch (e) { toast.error(e.message); } };

  const handleLogout = () => { logout(); navigate("/"); };
  const openTickets = tickets.filter((t) => t.status !== "resolved").length;
  const pendingLoans = loans.filter((l) => ["pending", "under-review"].includes(l.status)).length;
  const pendingDeposits = deposits.filter((d) => ["requested", "details-sent", "paid"].includes(d.status)).length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;

  const nav = [
    { k: "tickets", label: "Support tickets", icon: "chat", badge: openTickets },
    { k: "loans", label: "Loan approvals", icon: "loan", badge: pendingLoans },
    { k: "deposits", label: "Deposits", icon: "savings", badge: pendingDeposits },
    { k: "withdrawals", label: "Withdrawals", icon: "grow", badge: pendingWithdrawals },
    { k: "customers", label: "Customer lookup", icon: "people" },
  ];

  return (
    <div className="console">
      <aside className="console-sidebar">
        <Link to="/" className="console-brand"><img src={logo} alt="Nut Treasury Services" /></Link>
        <span className="console-role">Employee{user?.department ? ` · ${user.department}` : ""}</span>
        <nav className="console-nav">
          {nav.map((n) => (
            <button key={n.k} className={`console-nav-btn ${tab === n.k ? "active" : ""}`} onClick={() => { setTab(n.k); setOpenTicket(null); }}>
              <Icon name={n.icon} size={18} /><span>{n.label}</span>{n.badge > 0 && <span className="console-badge">{n.badge}</span>}
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
          <div><h1>Employee console</h1><p>Signed in as {user?.name} · {user?.email}</p></div>
          <span className="console-tag">Staff</span>
        </div>

        {loading ? (
          <div className="console-loading"><span className="loader-nut">🌰</span><p>Loading…</p></div>
        ) : (
          <>
            {/* TICKETS */}
            {tab === "tickets" && (openTicket ? (
              <div className="panel" style={{ maxWidth: 720 }}>
                <div className="panel-head">
                  <div><button className="linklike" onClick={() => setOpenTicket(null)}>← Back</button><h2 style={{ marginTop: 6 }}>{openTicket.subject}</h2>
                    <span className="muted">{openTicket.reference} · {openTicket.category}</span></div>
                  <Pill v={openTicket.status} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                  {openTicket.messages.map((m, i) => (
                    <div key={i} style={{ background: m.authorRole === "customer" ? "var(--mist)" : "#eef4ff", padding: "12px 14px", borderRadius: 12 }}>
                      <strong style={{ fontSize: 13 }}>{m.authorName} <span className="muted">({m.authorRole})</span></strong>
                      <p style={{ fontSize: 14, marginTop: 4 }}>{m.body}</p>
                    </div>
                  ))}
                </div>
                <div className="mini-form">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your reply…" />
                  <div className="row-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => sendReply(openTicket._id)}>Send reply</button>
                    <button className="mini-btn" onClick={() => assign(openTicket._id)}>Assign to me</button>
                    <button className="mini-btn green" onClick={() => setStatus(openTicket._id, "resolved")}>Resolve</button>
                    <button className="mini-btn blue" onClick={() => setStatus(openTicket._id, "in-progress")}>In progress</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="panel">
                <div className="panel-head"><h2>Support tickets</h2></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Reference</th><th>Subject</th><th>Customer</th><th>Assigned</th><th>Status</th><th></th></tr></thead>
                  <tbody>{tickets.map((t) => (
                    <tr key={t._id}><td className="ref">{t.reference}</td><td>{t.subject}</td>
                      <td className="muted">{t.customer?.name}</td><td className="muted">{t.assignedTo?.name || "—"}</td>
                      <td><Pill v={t.status} /></td>
                      <td><button className="mini-btn blue" onClick={() => { setOpenTicket(t); setReply(""); }}>Open</button></td></tr>
                  ))}</tbody>
                </table>{tickets.length === 0 && <div className="empty"><span>🎫</span>No tickets yet.</div>}</div>
              </div>
            ))}

            {/* LOANS */}
            {tab === "loans" && (
              <div className="panel">
                <div className="panel-head"><h2>Loan approvals</h2></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Reference</th><th>Applicant</th><th>Type</th><th>Amount</th><th>Risk</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{loans.map((l) => (
                    <tr key={l._id}><td className="ref">{l.reference}</td>
                      <td>{l.applicant?.name}<br /><span className="muted">{l.applicant?.email}</span></td>
                      <td>{l.loanType}</td><td>{usd(l.amount)}</td>
                      <td><span className={`spill ${l.riskBand === "Low" ? "approved" : l.riskBand === "High" ? "rejected" : "under-review"}`}>{l.riskBand} · {l.riskScore}</span></td>
                      <td><Pill v={l.status} /></td>
                      <td><div className="row-actions">
                        {["pending"].includes(l.status) && <button className="mini-btn blue" onClick={() => review(l._id)}>Review</button>}
                        {["pending", "under-review"].includes(l.status) && <>
                          <button className="mini-btn green" onClick={() => decide(l._id, "approved")}>Approve</button>
                          <button className="mini-btn red" onClick={() => decide(l._id, "rejected")}>Reject</button>
                        </>}
                        {l.status === "approved" && <span className="muted">Awaiting disbursement</span>}
                      </div></td></tr>
                  ))}</tbody>
                </table>{loans.length === 0 && <div className="empty"><span>📋</span>No loan applications.</div>}</div>
              </div>
            )}

            {/* DEPOSITS */}
            {tab === "deposits" && (
              <div className="panel">
                <div className="panel-head"><h2>Deposit requests</h2></div>
                {detailsFor && (
                  <div className="panel" style={{ background: "var(--mist)", marginBottom: 16 }}>
                    <div className="panel-head"><h3>Send deposit account details</h3><button className="linklike" onClick={() => setDetailsFor(null)}>Cancel</button></div>
                    <textarea className="" style={{ width: "100%", minHeight: 150, padding: 12, border: "1.5px solid var(--line)", borderRadius: 10, fontFamily: "inherit", fontSize: 13 }} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} />
                    <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={sendDetails}>Send to customer</button>
                  </div>
                )}
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{deposits.map((d) => (
                    <tr key={d._id}><td className="ref">{d.reference}</td>
                      <td>{d.user?.name}<br /><span className="muted">{d.user?.email}</span></td>
                      <td>{usd(d.amount)}</td><td><Pill v={d.status} /></td>
                      <td><div className="row-actions">
                        {d.status === "requested" && <button className="mini-btn blue" onClick={() => openDetails(d)}>Send details</button>}
                        {d.status === "details-sent" && <button className="mini-btn blue" onClick={() => openDetails(d)}>Resend</button>}
                        {["details-sent", "paid"].includes(d.status) && <button className="mini-btn green" onClick={() => confirmDeposit(d._id)}>Confirm received</button>}
                        {!["received", "rejected"].includes(d.status) && <button className="mini-btn red" onClick={() => rejectDeposit(d._id)}>Reject</button>}
                        {d.status === "received" && <span className="muted">Credited</span>}
                      </div></td></tr>
                  ))}</tbody>
                </table>{deposits.length === 0 && <div className="empty"><span>💵</span>No deposit requests.</div>}</div>
              </div>
            )}

            {/* WITHDRAWALS */}
            {tab === "withdrawals" && (
              <div className="panel">
                <div className="panel-head"><h2>Withdrawal requests</h2></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Reference</th><th>Customer</th><th>Amount</th><th>Destination</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{withdrawals.map((w) => (
                    <tr key={w._id}><td className="ref">{w.reference}</td>
                      <td>{w.user?.name}<br /><span className="muted">{w.user?.email}</span></td>
                      <td>{usd(w.amount)}</td><td className="muted">{w.destination}</td><td><Pill v={w.status} /></td>
                      <td><div className="row-actions">
                        {w.status === "pending" && <>
                          <button className="mini-btn green" onClick={() => approveWithdrawal(w._id)}>Approve</button>
                          <button className="mini-btn red" onClick={() => rejectWithdrawal(w._id)}>Reject</button>
                        </>}
                        {w.status !== "pending" && <span className="muted">Done</span>}
                      </div></td></tr>
                  ))}</tbody>
                </table>{withdrawals.length === 0 && <div className="empty"><span>🏧</span>No withdrawal requests.</div>}</div>
              </div>
            )}

            {/* CUSTOMERS */}
            {tab === "customers" && (
              <div className="panel">
                <div className="panel-head"><h2>Customer lookup</h2></div>
                <form className="mini-form" onSubmit={searchCustomers} style={{ marginBottom: 18 }}>
                  <div className="row-actions">
                    <input style={{ flex: 1, minWidth: 220, padding: "11px 13px", border: "1.5px solid var(--line)", borderRadius: 10 }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" />
                    <button className="btn btn-royal btn-sm">Search</button>
                  </div>
                </form>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Name</th><th>Email</th><th>KYC</th><th>Status</th><th>Joined</th></tr></thead>
                  <tbody>{customers.map((c) => (
                    <tr key={c._id}><td>{c.name}</td><td className="muted">{c.email}</td>
                      <td><Pill v={c.kyc?.status || "not-submitted"} /></td><td><Pill v={c.status} /></td>
                      <td className="muted">{fmt(c.createdAt)}</td></tr>
                  ))}</tbody>
                </table>{customers.length === 0 && <div className="empty"><span>🔍</span>No customers found.</div>}</div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
