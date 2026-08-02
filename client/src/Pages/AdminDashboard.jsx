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
const fmtT = (d) => new Date(d).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const Pill = ({ v }) => <span className={`spill ${v}`}>{String(v).replace("-", " ")}</span>;

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  const [report, setReport] = useState(null);
  const [users, setUsers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [txns, setTxns] = useState([]);
  const [fraud, setFraud] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [invites, setInvites] = useState([]);
  const [logs, setLogs] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [detailsFor, setDetailsFor] = useState(null);
  const [detailsText, setDetailsText] = useState("");
  const [invite, setInvite] = useState({ email: "", department: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [r, u, l, t, f, tk, iv, lg, dp, wd] = await Promise.all([
        api.get("/admin/reports"), api.get("/admin/users"), api.get("/staff/loans"),
        api.get("/admin/transactions"), api.get("/admin/fraud"), api.get("/staff/tickets"),
        api.get("/admin/invites"), api.get("/admin/audit"),
        api.get("/staff/deposits"), api.get("/staff/withdrawals"),
      ]);
      setReport(r.data.report); setUsers(u.data.users); setLoans(l.data.loans);
      setTxns(t.data.transactions); setFraud(f.data.alerts); setTickets(tk.data.tickets);
      setInvites(iv.data.invites); setLogs(lg.data.logs);
      setDeposits(dp.data.requests); setWithdrawals(wd.data.requests);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const setUserStatus = async (id, status) => { try { await api.patch(`/admin/users/${id}/status`, { status }); toast.success(`User ${status}`); load(); } catch (e) { toast.error(e.message); } };
  const verifyKyc = async (id, decision) => { try { await api.patch(`/admin/users/${id}/kyc`, { decision }); toast.success(`KYC ${decision}`); load(); } catch (e) { toast.error(e.message); } };
  const delUser = async (id) => { if (!confirm("Delete this user permanently?")) return; try { await api.delete(`/admin/users/${id}`); toast.success("User deleted"); load(); } catch (e) { toast.error(e.message); } };
  const decideLoan = async (id, decision) => { try { await api.patch(`/staff/loans/${id}/decision`, { decision }); toast.success(`Loan ${decision}`); load(); } catch (e) { toast.error(e.message); } };
  const disburse = async (id) => { try { const { data } = await api.post(`/staff/loans/${id}/disburse`); toast.success(data.message); load(); } catch (e) { toast.error(e.message); } };
  const createInvite = async (e) => {
    e.preventDefault();
    try { const { data } = await api.post("/admin/invites", invite); setInvite({ email: "", department: "" }); toast.success("Invite created"); load();
      const link = `${window.location.origin}/portal/employee?token=${data.token}`;
      navigator.clipboard?.writeText(link).then(() => toast.info("Invite link copied to clipboard")).catch(() => {});
    } catch (err) { toast.error(err.message); }
  };
  const revokeInvite = async (id) => { try { await api.delete(`/admin/invites/${id}`); load(); } catch (e) { toast.error(e.message); } };
  const copyLink = (token) => { navigator.clipboard?.writeText(`${window.location.origin}/portal/employee?token=${token}`); toast.info("Invite link copied"); };

  const depositTemplate = (ref) => `Please make your deposit to:\nBank: Nut Treasury Services\nAccount name: Nut Treasury Services Deposits\nAccount number: 000-123-456-789\nRouting (ACH): 021000021\nReference: ${ref}\n\nOnce sent, the customer marks the deposit as completed on their dashboard.`;
  const openDetails = (d) => { setDetailsFor(d._id); setDetailsText(d.bankDetails || depositTemplate(d.reference)); };
  const sendDetails = async () => { try { const { data } = await api.post(`/staff/deposits/${detailsFor}/details`, { bankDetails: detailsText }); toast.success(data.message); setDetailsFor(null); load(); } catch (e) { toast.error(e.message); } };
  const confirmDeposit = async (id) => { try { const { data } = await api.post(`/staff/deposits/${id}/confirm`); toast.success(data.message); load(); } catch (e) { toast.error(e.message); } };
  const rejectDeposit = async (id) => { try { await api.post(`/staff/deposits/${id}/reject`); toast.success("Deposit rejected"); load(); } catch (e) { toast.error(e.message); } };
  const approveWithdrawal = async (id) => { try { const { data } = await api.post(`/staff/withdrawals/${id}/approve`); toast.success(data.message); load(); } catch (e) { toast.error(e.message); } };
  const rejectWithdrawal = async (id) => { try { await api.post(`/staff/withdrawals/${id}/reject`); toast.success("Withdrawal rejected"); load(); } catch (e) { toast.error(e.message); } };

  const handleLogout = () => { logout(); navigate("/"); };

  const pendingUsers = users.filter((u) => u.status === "pending").length;
  const pendingKyc = users.filter((u) => u.kyc?.status === "pending").length;
  const pendingLoans = loans.filter((l) => ["pending", "under-review"].includes(l.status)).length;
  const pendingDeposits = deposits.filter((d) => ["requested", "details-sent", "paid"].includes(d.status)).length;
  const pendingWithdrawals = withdrawals.filter((w) => w.status === "pending").length;

  const nav = [
    { k: "overview", label: "Overview", icon: "grow" },
    { k: "users", label: "User management", icon: "people", badge: pendingUsers },
    { k: "kyc", label: "KYC & approvals", icon: "check", badge: pendingKyc },
    { k: "deposits", label: "Deposits", icon: "savings", badge: pendingDeposits },
    { k: "withdrawals", label: "Withdrawals", icon: "loan", badge: pendingWithdrawals },
    { k: "transactions", label: "Transactions", icon: "savings" },
    { k: "fraud", label: "Fraud alerts", icon: "secure", badge: fraud.length },
    { k: "loans", label: "Loans", icon: "loan", badge: pendingLoans },
    { k: "tickets", label: "Tickets", icon: "chat" },
    { k: "invites", label: "Employee invites", icon: "mail" },
    { k: "audit", label: "Audit logs", icon: "doc" },
  ];

  const staff = users.filter((u) => u.role !== "customer");
  const customers = users.filter((u) => u.role === "customer");

  return (
    <div className="console">
      <aside className="console-sidebar">
        <Link to="/" className="console-brand"><img src={logo} alt="Nut Treasury Services" /></Link>
        <span className="console-role">Admin Console</span>
        <nav className="console-nav">
          {nav.map((n) => (
            <button key={n.k} className={`console-nav-btn ${tab === n.k ? "active" : ""}`} onClick={() => setTab(n.k)}>
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
          <div><h1>{nav.find((n) => n.k === tab)?.label}</h1><p>Signed in as {user?.name} · {user?.email}</p></div>
          <span className="console-tag">Administrator</span>
        </div>

        {loading || !report ? (
          <div className="console-loading"><span className="loader-nut">🌰</span><p>Loading platform data…</p></div>
        ) : (
          <>
            {/* OVERVIEW / REPORTS */}
            {tab === "overview" && (
              <>
                <div className="stat-grid">
                  <div className="stat-card"><span className="stat-ico s-blue"><Icon name="people" size={22} /></span><span className="stat-num">{report.users.total}</span><span className="stat-label">Total users</span></div>
                  <div className="stat-card"><span className="stat-ico s-green"><Icon name="savings" size={22} /></span><span className="stat-num">{usd(report.deposits.totalDeposits)}</span><span className="stat-label">Total deposits</span></div>
                  <div className="stat-card"><span className="stat-ico s-amber"><Icon name="loan" size={22} /></span><span className="stat-num">{usd(report.loans.totalDisbursed)}</span><span className="stat-label">Loans disbursed</span></div>
                  <div className="stat-card"><span className="stat-ico s-red"><Icon name="secure" size={22} /></span><span className="stat-num">{fraud.length}</span><span className="stat-label">Fraud alerts</span></div>
                </div>
                <div className="panel-grid">
                  <div className="panel">
                    <div className="panel-head"><h3>Users by role</h3></div>
                    {Object.entries(report.users.byRole).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--line-soft)" }}><span style={{ textTransform: "capitalize" }}>{k}</span><strong>{v}</strong></div>
                    ))}
                  </div>
                  <div className="panel">
                    <div className="panel-head"><h3>Loans by status</h3></div>
                    {Object.keys(report.loans.byStatus).length === 0 ? <p className="muted">No loans yet.</p> : Object.entries(report.loans.byStatus).map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid var(--line-soft)" }}><Pill v={k} /><strong>{v}</strong></div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12 }}><span className="muted">Outstanding</span><strong>{usd(report.loans.totalOutstanding)}</strong></div>
                  </div>
                </div>
              </>
            )}

            {/* USERS */}
            {tab === "users" && (
              <>
                <div className="panel">
                  <div className="panel-head"><h2>Customers</h2><span className="muted">{customers.length} total</span></div>
                  <div className="tbl-wrap"><table className="tbl">
                    <thead><tr><th>Name</th><th>Email</th><th>Status</th><th>KYC</th><th>Actions</th></tr></thead>
                    <tbody>{customers.map((u) => (
                      <tr key={u._id}><td>{u.name}</td><td className="muted">{u.email}</td><td><Pill v={u.status} /></td><td><Pill v={u.kyc?.status || "not-submitted"} /></td>
                        <td><div className="row-actions">
                          {u.status !== "approved" && <button className="mini-btn green" onClick={() => setUserStatus(u._id, "approved")}>Approve</button>}
                          {u.status !== "suspended" && <button className="mini-btn" onClick={() => setUserStatus(u._id, "suspended")}>Suspend</button>}
                          {u.status !== "rejected" && <button className="mini-btn red" onClick={() => setUserStatus(u._id, "rejected")}>Reject</button>}
                          <button className="mini-btn red" onClick={() => delUser(u._id)}>Delete</button>
                        </div></td></tr>
                    ))}</tbody>
                  </table>{customers.length === 0 && <div className="empty"><span>👤</span>No customers yet.</div>}</div>
                </div>
                <div className="panel">
                  <div className="panel-head"><h2>Employees</h2><span className="muted">{staff.length} total</span></div>
                  <div className="tbl-wrap"><table className="tbl">
                    <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                    <tbody>{staff.map((u) => (
                      <tr key={u._id}><td>{u.name}</td><td className="muted">{u.email}</td><td style={{ textTransform: "capitalize" }}>{u.role}</td><td><Pill v={u.status} /></td>
                        <td><div className="row-actions">
                          {u.role !== "admin" && <>
                            {u.status !== "approved" && <button className="mini-btn green" onClick={() => setUserStatus(u._id, "approved")}>Approve</button>}
                            {u.status !== "suspended" && <button className="mini-btn" onClick={() => setUserStatus(u._id, "suspended")}>Suspend</button>}
                            <button className="mini-btn red" onClick={() => delUser(u._id)}>Delete</button>
                          </>}
                          {u.role === "admin" && <span className="muted">—</span>}
                        </div></td></tr>
                    ))}</tbody>
                  </table></div>
                </div>
              </>
            )}

            {/* KYC */}
            {tab === "kyc" && (
              <div className="panel">
                <div className="panel-head"><h2>KYC verification & account approvals</h2></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Name</th><th>Residency</th><th>ID</th><th>Tax ID</th><th>KYC</th><th>Account</th><th>Actions</th></tr></thead>
                  <tbody>{customers.map((u) => (
                    <tr key={u._id}><td>{u.name}<br /><span className="muted">{u.email}</span></td>
                      <td className="muted">{u.kyc?.residency || "—"}</td>
                      <td className="muted">{u.kyc?.idType ? `${u.kyc.idType} ${u.kyc.idNumber}` : "—"}</td>
                      <td className="muted">{u.kyc?.taxIdType || "—"}</td>
                      <td><Pill v={u.kyc?.status || "not-submitted"} /></td>
                      <td><Pill v={u.status} /></td>
                      <td><div className="row-actions">
                        <button className="mini-btn green" onClick={() => verifyKyc(u._id, "verified")}>Verify</button>
                        <button className="mini-btn red" onClick={() => verifyKyc(u._id, "rejected")}>Reject</button>
                      </div></td></tr>
                  ))}</tbody>
                </table>{customers.length === 0 && <div className="empty"><span>🪪</span>No customers to review.</div>}</div>
              </div>
            )}

            {/* DEPOSITS */}
            {tab === "deposits" && (
              <div className="panel">
                <div className="panel-head"><h2>Deposit requests</h2></div>
                {detailsFor && (
                  <div className="panel" style={{ background: "var(--mist)", marginBottom: 16 }}>
                    <div className="panel-head"><h3>Send deposit account details</h3><button className="linklike" onClick={() => setDetailsFor(null)}>Cancel</button></div>
                    <textarea style={{ width: "100%", minHeight: 150, padding: 12, border: "1.5px solid var(--line)", borderRadius: 10, fontFamily: "inherit", fontSize: 13 }} value={detailsText} onChange={(e) => setDetailsText(e.target.value)} />
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

            {/* TRANSACTIONS */}
            {tab === "transactions" && (
              <div className="panel">
                <div className="panel-head"><h2>Transaction monitoring</h2><span className="muted">{txns.length} recent</span></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Date</th><th>Reference</th><th>Owner</th><th>Type</th><th>Amount</th><th>Flag</th></tr></thead>
                  <tbody>{txns.map((t) => (
                    <tr key={t._id}><td className="muted">{fmtT(t.createdAt)}</td><td className="ref">{t.reference}</td>
                      <td className="muted">{t.owner?.name || "—"}</td><td>{t.type.replace("-", " ")}</td><td>{usd(t.amount)}</td>
                      <td>{t.flagged ? <span className="spill flagged">flagged</span> : <span className="muted">—</span>}</td></tr>
                  ))}</tbody>
                </table>{txns.length === 0 && <div className="empty"><span>💳</span>No transactions yet.</div>}</div>
              </div>
            )}

            {/* FRAUD */}
            {tab === "fraud" && (
              <div className="panel">
                <div className="panel-head"><h2>Fraud alerts</h2><span className="muted">{fraud.length} flagged</span></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Date</th><th>Reference</th><th>Owner</th><th>Amount</th><th>Reason</th></tr></thead>
                  <tbody>{fraud.map((t) => (
                    <tr key={t._id}><td className="muted">{fmtT(t.createdAt)}</td><td className="ref">{t.reference}</td>
                      <td className="muted">{t.owner?.name || "—"}</td><td>{usd(t.amount)}</td><td className="muted">{t.flagReason}</td></tr>
                  ))}</tbody>
                </table>{fraud.length === 0 && <div className="empty"><span>✅</span>No fraud alerts.</div>}</div>
              </div>
            )}

            {/* LOANS */}
            {tab === "loans" && (
              <div className="panel">
                <div className="panel-head"><h2>Loan management</h2></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Reference</th><th>Applicant</th><th>Amount</th><th>Risk</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>{loans.map((l) => (
                    <tr key={l._id}><td className="ref">{l.reference}</td><td>{l.applicant?.name}</td><td>{usd(l.amount)}</td>
                      <td><span className={`spill ${l.riskBand === "Low" ? "approved" : l.riskBand === "High" ? "rejected" : "under-review"}`}>{l.riskBand} {l.riskScore}</span></td>
                      <td><Pill v={l.status} /></td>
                      <td><div className="row-actions">
                        {["pending", "under-review"].includes(l.status) && <>
                          <button className="mini-btn green" onClick={() => decideLoan(l._id, "approved")}>Approve</button>
                          <button className="mini-btn red" onClick={() => decideLoan(l._id, "rejected")}>Reject</button>
                        </>}
                        {l.status === "approved" && <button className="mini-btn blue" onClick={() => disburse(l._id)}>Disburse</button>}
                        {["disbursed", "repaying", "closed"].includes(l.status) && <span className="muted">Out: {usd(l.outstanding)}</span>}
                      </div></td></tr>
                  ))}</tbody>
                </table>{loans.length === 0 && <div className="empty"><span>📋</span>No loans yet.</div>}</div>
              </div>
            )}

            {/* TICKETS */}
            {tab === "tickets" && (
              <div className="panel">
                <div className="panel-head"><h2>Support tickets</h2></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>Reference</th><th>Subject</th><th>Customer</th><th>Assigned</th><th>Status</th></tr></thead>
                  <tbody>{tickets.map((t) => (
                    <tr key={t._id}><td className="ref">{t.reference}</td><td>{t.subject}</td><td className="muted">{t.customer?.name}</td>
                      <td className="muted">{t.assignedTo?.name || "—"}</td><td><Pill v={t.status} /></td></tr>
                  ))}</tbody>
                </table>{tickets.length === 0 && <div className="empty"><span>🎫</span>No tickets.</div>}</div>
              </div>
            )}

            {/* INVITES */}
            {tab === "invites" && (
              <div className="panel-grid">
                <div className="panel">
                  <div className="panel-head"><h2>Employee invites</h2></div>
                  {invites.length === 0 ? <div className="empty"><span>✉️</span>No invites yet.</div> : invites.map((iv) => (
                    <div key={iv._id} style={{ padding: "12px 0", borderBottom: "1px solid var(--line-soft)" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div><strong>{iv.email}</strong> {iv.used ? <span className="spill approved">used</span> : <span className="spill pending">pending</span>}<br />
                          <span className="muted">{iv.department || "General"} · expires {fmt(iv.expiresAt)}</span></div>
                        <div className="row-actions">
                          {!iv.used && <button className="mini-btn blue" onClick={() => copyLink(iv.token)}>Copy link</button>}
                          <button className="mini-btn red" onClick={() => revokeInvite(iv._id)}>Revoke</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="panel">
                  <div className="panel-head"><h3>Invite an employee</h3></div>
                  <p className="muted" style={{ marginBottom: 14 }}>Only you can create these links. The employee uses the link to sign up at the hidden employee portal.</p>
                  <form className="mini-form" onSubmit={createInvite}>
                    <div><label>Email</label><input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} required placeholder="employee@nutbank.com" /></div>
                    <div><label>Department</label><input value={invite.department} onChange={(e) => setInvite({ ...invite, department: e.target.value })} placeholder="e.g. Customer Support" /></div>
                    <button className="btn btn-primary">Create invite & copy link</button>
                  </form>
                </div>
              </div>
            )}

            {/* AUDIT */}
            {tab === "audit" && (
              <div className="panel">
                <div className="panel-head"><h2>Audit logs</h2><span className="muted">{logs.length} entries</span></div>
                <div className="tbl-wrap"><table className="tbl">
                  <thead><tr><th>When</th><th>Actor</th><th>Action</th><th>Target</th></tr></thead>
                  <tbody>{logs.map((l) => (
                    <tr key={l._id}><td className="muted">{fmtT(l.createdAt)}</td><td>{l.actorName} <span className="muted">({l.actorRole})</span></td>
                      <td className="ref">{l.action}</td><td className="muted">{l.target}</td></tr>
                  ))}</tbody>
                </table>{logs.length === 0 && <div className="empty"><span>📜</span>No activity logged yet.</div>}</div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
