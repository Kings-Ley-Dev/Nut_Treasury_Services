import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "../Components/common/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/Toast";
import api from "../api/client";
import "./Auth.css";
import "./Portal.css";
import PhoneField from "../Components/common/PhoneField";

const AdminPortal = () => {
  const { setSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", code: "" });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
        if (data.user.role !== "admin") throw new Error("This portal is for administrators only");
        setSession(data.token, data.user);
        navigate("/admin", { replace: true });
      } else {
        const { data } = await api.post("/auth/admin/register", form);
        setSession(data.token, data.user);
        toast.success("Admin account created");
        navigate("/admin", { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth portal portal-admin">
      <div className="auth-aside">
        <div className="auth-aside-inner">
          <span className="portal-shield"><Icon name="secure" size={30} /></span>
          <h2>Administrator portal</h2>
          <p>Restricted access. Manage users, approvals, KYC, loans, fraud monitoring and audit logs.</p>
          <ul className="auth-points">
            <li><Icon name="check" size={15} /> User & role management</li>
            <li><Icon name="check" size={15} /> Loan approvals & disbursement</li>
            <li><Icon name="check" size={15} /> Fraud alerts & audit trail</li>
          </ul>
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <span className="portal-tag">Admin</span>
          <h1>{mode === "login" ? "Admin sign in" : "Create admin"}</h1>
          <p className="auth-sub">
            {mode === "login" ? "Authorized administrators only." : "Requires a valid setup code."}
          </p>
          <form onSubmit={submit}>
            {mode === "register" && (
              <div className="field">
                <label>Full name</label>
                <input name="name" value={form.name} onChange={change} required placeholder="Admin name" />
              </div>
            )}
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={change} required placeholder="admin@nutbank.com" />
            </div>
            {mode === "register" && (
              <div className="field">
                <label>Phone</label>
                <PhoneField value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              </div>
            )}
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={change} required placeholder="••••••••" />
            </div>
            {mode === "register" && (
              <div className="field">
                <label>Setup code</label>
                <input name="code" value={form.code} onChange={change} required placeholder="Provided by your organization" />
              </div>
            )}
            <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create admin account"}
            </button>
          </form>
          <p className="auth-switch">
            {mode === "login" ? (
              <>First-time setup? <button className="linklike" onClick={() => setMode("register")}>Create admin</button></>
            ) : (
              <>Already have access? <button className="linklike" onClick={() => setMode("login")}>Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
