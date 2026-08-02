import { Link } from "react-router-dom";
import PageHero from "../Components/common/PageHero";
import { Icon } from "../Components/common/Icons";
import { useReveal } from "../Components/common/useReveal";
import { IMPACT, VALUES, MILESTONES, LEADERS } from "../data/content";
import "./Inner.css";

const About = () => {
  useReveal();
  return (
    <div className="inner">
      <PageHero
        eyebrow="About us"
        title="Growing money, growing communities"
        subtitle="For over fifteen years we've helped hardworking Americans turn small beginnings into lasting prosperity."
        crumb="About"
      />

      {/* Story */}
      <section className="section">
        <div className="container story-grid">
          <div className="story-visual reveal">
            <div className="story-photo" />
            <div className="story-quote">
              <span className="sq-mark">🌰</span>
              <p>“Give a small seed the right care and it becomes a mighty tree.”</p>
            </div>
          </div>
          <div className="story-content reveal">
            <span className="eyebrow">Our story</span>
            <h2>From a single lending circle to a trusted national bank</h2>
            <p>
              Nut Treasury Services began in 2009 with one online lending circle and 200
              entrepreneurs who simply wanted a fair place to save and borrow. We saw
              what the big banks overlooked: that the smallest savers are often the hardest workers.
            </p>
            <p>
              Fifteen years on, we serve more than 180,000 customers online across all 50 states,
              and we still measure success the same way: by the businesses that grow, the credit scores
              rebuilt and the families that move forward because someone believed in their first small seed.
            </p>
            <Link to="/apply" className="btn btn-primary">Join our community <Icon name="arrow" size={17} /></Link>
          </div>
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="section-tight mv-section">
        <div className="container mv-grid">
          <div className="mv-card reveal">
            <span className="mv-icon"><Icon name="spark" size={24} /></span>
            <h3>Our mission</h3>
            <p>To put fair, simple financial tools in the hands of every entrepreneur and family, so a small start can grow into a secure future.</p>
          </div>
          <div className="mv-card reveal">
            <span className="mv-icon"><Icon name="grow" size={24} /></span>
            <h3>Our vision</h3>
            <p>An America where no good idea goes unfunded and no honest saver is left behind, one growing community at a time.</p>
          </div>
        </div>
      </section>

      {/* Impact stats */}
      <section className="section about-impact">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">Our impact</span>
            <h2>Numbers we're proud of</h2>
          </div>
          <div className="about-stats reveal">
            {IMPACT.map((s) => (
              <div className="about-stat" key={s.label}>
                <span className="as-value">{s.value}</span>
                <span className="as-label">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section values-section">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">What we stand for</span>
            <h2>Our values</h2>
          </div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div className="value-card reveal" key={v.title} style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="value-icon"><Icon name={v.icon} size={24} /></span>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Milestones timeline */}
      <section className="section timeline-section">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">Our journey</span>
            <h2>Fifteen years of growth</h2>
          </div>
          <div className="timeline">
            {MILESTONES.map((m, i) => (
              <div className="tl-item reveal" key={m.year} style={{ transitionDelay: `${i * 0.05}s` }}>
                <div className="tl-marker"><span /></div>
                <div className="tl-card">
                  <span className="tl-year">{m.year}</span>
                  <h3>{m.title}</h3>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="section leaders-section">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">Leadership</span>
            <h2>The people growing Nut Treasury Services</h2>
          </div>
          <div className="leaders-grid">
            {LEADERS.map((l, i) => (
              <div className="leader-card reveal" key={l.name} style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="leader-avatar">{l.initials}</span>
                <h3>{l.name}</h3>
                <span className="leader-role">{l.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
