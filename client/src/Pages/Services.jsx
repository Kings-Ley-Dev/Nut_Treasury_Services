import { Link } from "react-router-dom";
import PageHero from "../Components/common/PageHero";
import { Icon } from "../Components/common/Icons";
import { useReveal } from "../Components/common/useReveal";
import { PRODUCTS, WHY } from "../data/content";
import "./Inner.css";

const groupIcon = {
  "Save & Grow": "savings",
  "Borrow & Build": "loan",
  "Move & Manage": "mobile",
};

const Services = () => {
  useReveal();
  return (
    <div className="inner">
      <PageHero
        eyebrow="Our services"
        title="Everything you need to grow"
        subtitle="Save, borrow and move money with products designed around real American livelihoods, not paperwork."
        crumb="Services"
      />

      {PRODUCTS.map((grp, gi) => (
        <section className={`section ${gi % 2 === 1 ? "svc-alt" : ""}`} key={grp.group}>
          <div className="container">
            <div className="svc-group-head reveal">
              <span className="svc-group-icon"><Icon name={groupIcon[grp.group]} size={26} /></span>
              <div>
                <span className="eyebrow">{`0${gi + 1}`} Product family</span>
                <h2>{grp.group}</h2>
              </div>
            </div>
            <div className="product-grid">
              {grp.items.map((p, i) => (
                <div className="product-card reveal" key={p.title} style={{ transitionDelay: `${i * 0.06}s` }}>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                  <ul className="product-points">
                    {p.points.map((pt) => (
                      <li key={pt}><span className="pp-check"><Icon name="check" size={13} /></span>{pt}</li>
                    ))}
                  </ul>
                  <div className="product-actions">
                    <Link to="/apply" className="btn btn-royal btn-sm">Apply now</Link>
                    <Link to="/contact" className="product-ask">Ask a question</Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Why band */}
      <section className="section why-band">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">The Nut Treasury Services difference</span>
            <h2>Why people choose us</h2>
          </div>
          <div className="why-grid">
            {WHY.map((w, i) => (
              <div className="why-card reveal" key={w.title} style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="why-icon"><Icon name={w.icon} size={24} /></span>
                <h3>{w.title}</h3>
                <p>{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-band">
        <div className="container cta-inner reveal">
          <div className="cta-text">
            <h2>Not sure which product fits?</h2>
            <p>Tell us your goal and we'll match you to the right account or loan.</p>
          </div>
          <div className="cta-actions">
            <Link to="/apply" className="btn btn-primary btn-lg">Get started</Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">Talk to an adviser</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
