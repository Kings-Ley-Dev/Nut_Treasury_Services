import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Icon } from "../Components/common/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/Toast";
import api from "../api/client";
import "./Auth.css";
import "./Portal.css";
import PhoneField from "../Components/common/PhoneField";

const EmployeePortal = () => {
  const { setSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tokenFromUrl = params.get("token") || "";

  const [mode, setMode] = useState(tokenFromUrl ? "join" : "login");
  const [busy, setBusy] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", password: "", email: "", token: tokenFromUrl });
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Validate invite token and prefill email
  useEffect(() => {
    if (!tokenFromUrl) return;
    api
      .get(`/auth/employee/invite/${tokenFromUrl}`)
      .then(({ data }) => { setInviteEmail(data.email); setMode("join"); })
      .catch((err) => toast.error(err.message));
  }, [tokenFromUrl, toast]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { data } = await api.post("/auth/login", { email: form.email, password: form.password });
        if (data.user.role !== "employee") throw new Error("This portal is for employees only");
        setSession(data.token, data.user);
        navigate("/employee", { replace: true });
      } else {
        const { data } = await api.post("/auth/employee/register", {
          name: form.name,
          phone: form.phone,
          password: form.password,
          token: form.token,
        });
        setSession(data.token, data.user);
        toast.success("Welcome to the team!");
        navigate("/employee", { replace: true });
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth portal portal-employee">
      <div className="auth-aside auth-aside-grow">
        <div className="auth-aside-inner">
          <span className="portal-shield"><Icon name="people" size={30} /></span>
          <h2>Employee portal</h2>
          <p>Support customers, manage tickets and review loan applications. Access is invite-only.</p>
          <ul className="auth-points">
            <li><Icon name="check" size={15} /> Customer support tickets</li>
            <li><Icon name="check" size={15} /> Loan review & approvals</li>
            <li><Icon name="check" size={15} /> Customer lookup</li>
          </ul>
        </div>
      </div>
      <div className="auth-main">
        <div className="auth-card">
          <span className="portal-tag portal-tag-emp">Employee</span>
          <h1>{mode === "login" ? "Employee sign in" : "Join your team"}</h1>
          <p className="auth-sub">
            {mode === "login" ? "Sign in with your employee account." : `Set up your account for ${inviteEmail || "your invited email"}.`}
          </p>
          <form onSubmit={submit}>
            {mode === "join" ? (
              <>
                <div className="field">
                  <label>Invited email</label>
                  <input value={inviteEmail} disabled placeholder="from your invite link" />
                </div>
                <div className="field">
                  <label>Full name</label>
                  <input name="name" value={form.name} onChange={change} required placeholder="Your name" />
                </div>
                <div className="field">
                  <label>Phone</label>
                  <PhoneField value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input type="password" name="password" value={form.password} onChange={change} required placeholder="••••••••" />
                </div>
                {!tokenFromUrl && (
                  <div className="field">
                    <label>Invite token</label>
                    <input name="token" value={form.token} onChange={change} required placeholder="Paste your invite token" />
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="field">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={change} required placeholder="you@nutbank.com" />
                </div>
                <div className="field">
                  <label>Password</label>
                  <input type="password" name="password" value={form.password} onChange={change} required placeholder="••••••••" />
                </div>
              </>
            )}
            <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create employee account"}
            </button>
          </form>
          <p className="auth-switch">
            {mode === "login" ? (
              <>Have an invite? <button className="linklike" onClick={() => setMode("join")}>Join your team</button></>
            ) : (
              <>Already set up? <button className="linklike" onClick={() => setMode("login")}>Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmployeePortal;
