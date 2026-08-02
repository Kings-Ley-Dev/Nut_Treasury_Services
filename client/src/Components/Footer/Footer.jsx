import { Link } from "react-router-dom";
import logoWhite from "../../assets/logo-white.png";
import { Icon } from "../common/Icons";
import { BANK } from "../../data/content";
import "./Footer.css";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <img src={logoWhite} alt="Nut Treasury Services" className="footer-logo" />
          <p>{BANK.tagline} Banking built for entrepreneurs, gig workers and everyday people across the U.S.</p>
          <div className="footer-socials">
            {BANK.socials.map((s) => (
              <a key={s} href="#" aria-label={s} className="footer-social">
                <Icon name={s} size={18} />
              </a>
            ))}
          </div>
        </div>

        <div className="footer-col">
          <h4>Bank</h4>
          <ul>
            <li><Link to="/services">Savings & CDs</Link></li>
            <li><Link to="/services">Micro & Small Business Loans</Link></li>
            <li><Link to="/services">Auto-Investing</Link></li>
            <li><Link to="/services">Digital Banking</Link></li>
            <li><Link to="/apply">Open an Account</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/about">Our Impact</Link></li>
            <li><Link to="/about">Leadership</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/contact">FAQs</Link></li>
          </ul>
        </div>

        <div className="footer-col footer-contact">
          <h4>Reach us</h4>
          <p className="fc-row"><Icon name="phone" size={17} /><span>{BANK.phone}</span></p>
          <p className="fc-row"><Icon name="mail" size={17} /><span>{BANK.email}</span></p>
          <p className="fc-row"><Icon name="clock" size={17} /><span>Mon to Fri, 9:00 AM to 5:00 PM</span></p>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <p>© {year} {BANK.name}. All rights reserved.</p>
          <p className="footer-reg">Member FDIC · Equal Housing Lender</p>
          <div className="footer-legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/security">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
