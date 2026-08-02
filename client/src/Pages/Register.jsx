import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Icon } from "../Components/common/Icons";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/Toast";
import "./Auth.css";
import PhoneField from "../Components/common/PhoneField";

const Register = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords don't match");
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setBusy(true);
    try {
      const data = await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      });
      toast.success(data.message);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <div className="auth-aside auth-aside-grow">
        <div className="auth-aside-inner">
          <span className="auth-nut">🌱</span>
          <h2>Plant your first seed today</h2>
          <p>Create a free Nut Treasury Services profile to apply for accounts and loans and track everything in your dashboard.</p>
          <ul className="auth-points">
            <li><Icon name="check" size={15} /> Free to create, takes a minute</li>
            <li><Icon name="check" size={15} /> Apply once, track forever</li>
            <li><Icon name="check" size={15} /> Manage savings & loans together</li>
          </ul>
        </div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <Link to="/" className="auth-logo"><img src={logo} alt="Nut Treasury Services" /></Link>
          <h1>Create account</h1>
          <p className="auth-sub">Start growing in minutes.</p>
          <form onSubmit={submit}>
            <div className="field">
              <label>Full name</label>
              <input name="name" value={form.name} onChange={change} required placeholder="Sarah Johnson" />
            </div>
            <div className="field-row">
              <div className="field">
                <label>Email</label>
                <input type="email" name="email" value={form.email} onChange={change} required placeholder="you@example.com" />
              </div>
              <div className="field">
                <label>Phone</label>
                <PhoneField value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Password</label>
                <input type="password" name="password" value={form.password} onChange={change} required placeholder="••••••••" />
              </div>
              <div className="field">
                <label>Confirm password</label>
                <input type="password" name="confirm" value={form.confirm} onChange={change} required placeholder="••••••••" />
              </div>
            </div>
            <button className="btn btn-primary btn-block btn-lg" disabled={busy}>
              {busy ? "Creating…" : "Create account"}
            </button>
          </form>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
