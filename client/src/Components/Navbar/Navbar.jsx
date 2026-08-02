import { useState, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { Icon } from "../common/Icons";
import { useAuth } from "../../context/AuthContext";
import "./Navbar.css";

const links = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Apply Now", path: "/apply" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll when the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="container nav-inner">
        <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
          <img src={logo} alt="Nut Treasury Services" />
        </Link>

        <nav className={`nav-menu ${open ? "open" : ""}`}>
          <button className="nav-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <Icon name="close" size={22} />
          </button>
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.name}>
                <NavLink
                  to={l.path}
                  end={l.path === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) => (isActive ? "active" : "")}
                >
                  {l.name}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="nav-actions">
            {user ? (
              <>
                <Link
                  to={user.role === "admin" ? "/admin" : user.role === "employee" ? "/employee" : "/dashboard"}
                  className="btn btn-ghost btn-sm"
                  onClick={() => setOpen(false)}
                >
                  {user.role === "admin" ? "Admin" : user.role === "employee" ? "Console" : "Dashboard"}
                </Link>
                <button className="btn btn-primary btn-sm" onClick={handleLogout}>
                  <Icon name="logout" size={17} /> Sign out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm" onClick={() => setOpen(false)}>
                  Log in
                </Link>
                <Link to="/apply" className="btn btn-primary btn-sm" onClick={() => setOpen(false)}>
                  Open account
                </Link>
              </>
            )}
          </div>
        </nav>

        <button className="nav-toggle" onClick={() => setOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={26} />
        </button>
        {open && <div className="nav-backdrop" onClick={() => setOpen(false)} />}
      </div>
    </header>
  );
};

export default Navbar;
