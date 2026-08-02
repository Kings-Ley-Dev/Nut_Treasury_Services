import { Link } from "react-router-dom";
import "./PageHero.css";

const PageHero = ({ eyebrow, title, subtitle, crumb }) => (
  <section className="page-hero">
    <div className="page-hero-art" aria-hidden="true">
      <span className="ph-nut">🌰</span>
    </div>
    <div className="container page-hero-inner">
      {eyebrow && <span className="eyebrow center">{eyebrow}</span>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
      <nav className="page-crumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <span className="crumb-current">{crumb || title}</span>
      </nav>
    </div>
  </section>
);

export default PageHero;
