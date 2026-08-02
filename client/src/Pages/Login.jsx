import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import { Icon } from "../Components/common/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/Toast";
import "./Auth.css";

const Login = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const data = await login(form.email, form.password);
      toast.success(data.message);
      const home = { admin: "/admin", employee: "/employee", customer: from };
      navigate(home[data.user?.role] || from, { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-aside">
        <div className="auth-aside-inner">
          <img src="/favicon.png" alt="Nut Treasury Services" className="auth-favicon" />
          <h2>Welcome back to your growth</h2>
          <p>Track your applications, manage your savings goals and watch your money grow, all in one place.</p>
          <ul className="auth-points">
            <li><Icon name="check" size={15} /> Track loan & account applications</li>
            <li><Icon name="check" size={15} /> See your references & status</li>
            <li><Icon name="check" size={15} /> Bank-grade security</li>
          </ul>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <Link to="/" className="auth-logo"><img src={logo} alt="Nut Treasury Services" /></Link>
          <h1>Log in</h1>
          <p className="auth-sub">Good to see you again.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={change} required placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={change} required placeholder="••••••••" />
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? "Signing in…" : "Log in"}
            </button>
          </form>
          <p className="auth-switch">
            Don't have an account yet? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
