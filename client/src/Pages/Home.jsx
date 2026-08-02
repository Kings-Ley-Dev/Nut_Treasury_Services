import { useState, useCallback, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { Icon } from "../Components/common/Icons";
import { useReveal } from "../Components/common/useReveal";
import {
  TICKER,
  SERVICES_BRIEF,
  WHY,
  LOAN_TYPES,
  TESTIMONIALS,
} from "../data/content";
import "./Home.css";

const usd = (n) => "$" + Math.round(n).toLocaleString("en-US");

const Home = () => {
  useReveal();

  // EMI / repayment calculator
  const [loanIdx, setLoanIdx] = useState(0);
  const loan = LOAN_TYPES[loanIdx];
  const [amount, setAmount] = useState(10000);
  const [term, setTerm] = useState(18);
  const [rate, setRate] = useState(LOAN_TYPES[0].rate);

  const switchLoan = useCallback((i) => {
    const l = LOAN_TYPES[i];
    setLoanIdx(i);
    setAmount(Math.round((l.min + l.max) / 4));
    setTerm(Math.round((l.termMin + l.termMax) / 2));
    setRate(l.rate);
  }, []);

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const r = rate / 100 / 12;
    const months = term;
    const e = r === 0 ? amount / months : (amount * r * (1 + r) ** months) / ((1 + r) ** months - 1);
    const total = e * months;
    return { emi: e, totalInterest: total - amount, totalPayable: total };
  }, [amount, term, rate]);

  const sliderBg = (val, min, max) => {
    const pct = ((val - min) / (max - min)) * 100;
    return `linear-gradient(90deg, var(--royal) ${pct}%, var(--line) ${pct}%)`;
  };

  // Testimonials carousel
  const [tIndex, setTIndex] = useState(0);
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const calc = () =>
      setPerView(window.innerWidth <= 760 ? 1 : window.innerWidth <= 1040 ? 2 : 3);
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  const maxIndex = Math.max(0, TESTIMONIALS.length - perView);
  useEffect(() => setTIndex((i) => Math.min(i, maxIndex)), [maxIndex]);
  const prevT = () => setTIndex((i) => (i <= 0 ? maxIndex : i - 1));
  const nextT = () => setTIndex((i) => (i >= maxIndex ? 0 : i + 1));

  return (
    <div className="home">
      {/* ───────── VIDEO HERO ───────── */}
      <section className="hero">
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          poster="/hero-poster.jpg"
        >
          <source src="/hero.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay" aria-hidden="true" />
        <div className="container hero-inner">
          <div className="hero-content">
            <span className="hero-badge">
              <span className="dot" /> Member FDIC · Equal Housing Lender
            </span>
            <h1>
              Small seeds,<br />
              <span className="text-grad">mighty growth.</span>
            </h1>
            <p className="hero-lead">
              Nut Treasury Services helps entrepreneurs, gig workers and everyday people save,
              borrow and grow. Open an account in minutes and watch a small start become
              something big.
            </p>
            <div className="hero-actions">
              <Link to="/apply" className="btn btn-primary btn-lg">
                Open an account <Icon name="arrow" size={18} />
              </Link>
              <Link to="/services" className="btn btn-outline-light btn-lg">
                Explore services
              </Link>
            </div>
          </div>
        </div>
        <div className="hero-scroll" aria-hidden="true"><span /></div>
      </section>

      {/* ───────── TICKER ───────── */}
      <div className="ticker">
        <div className="ticker-track">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span className="ticker-item" key={i}>{t}</span>
          ))}
        </div>
      </div>

      {/* ───────── SERVICES BRIEF ───────── */}
      <section className="section services">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">What we do</span>
            <h2>Banking that helps you grow</h2>
            <p>Everything a growing household or business needs, saving, borrowing and moving money, under one trusted roof.</p>
          </div>
          <div className="services-grid">
            {SERVICES_BRIEF.map((s, i) => (
              <div className="svc-card reveal" key={s.title} style={{ transitionDelay: `${i * 0.06}s` }}>
                <span className="svc-icon"><Icon name={s.icon} size={26} /></span>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <Link to="/services" className="svc-link">Learn more <Icon name="arrow" size={15} /></Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── IMPACT / ABOUT SPLIT ───────── */}
      <section className="section impact-split">
        <div className="container impact-split-inner">
          <div className="is-visual reveal">
            <div className="is-photo" />
            <div className="is-badge">
              <span className="is-badge-num">15 yrs</span>
              <span className="is-badge-label">growing communities</span>
            </div>
            <div className="is-stat-card">
              <Icon name="grow" size={22} />
              <div>
                <strong>96%</strong>
                <span>loans repaid on time</span>
              </div>
            </div>
          </div>
          <div className="is-content reveal">
            <span className="eyebrow">Our purpose</span>
            <h2>From a single lending circle to a growing forest of opportunity</h2>
            <p>
              We started in 2009 with 200 entrepreneurs and one simple belief:
              that the smallest savers are often the hardest workers. Today we serve over 180,000
              customers online across all 50 states, but our belief hasn't changed: give a small
              seed the right care and it grows into something mighty.
            </p>
            <ul className="is-list">
              {[
                "Fair, transparent pricing with no hidden fees",
                "Decisions on micro and credit-builder loans within 48 hours",
                "Free financial coaching for every borrower",
              ].map((p) => (
                <li key={p}><span className="is-check"><Icon name="check" size={14} /></span>{p}</li>
              ))}
            </ul>
            <Link to="/about" className="btn btn-royal">Read our story <Icon name="arrow" size={17} /></Link>
          </div>
        </div>
      </section>

      {/* ───────── WHY US ───────── */}
      <section className="section why">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">Why Nut Treasury Services</span>
            <h2>Trusted, fair and built for you</h2>
            <p>We do banking the way it should be done for hardworking people and growing businesses.</p>
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

      {/* ───────── REPAYMENT CALCULATOR ───────── */}
      <section className="section calc">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">Plan before you borrow</span>
            <h2>Loan repayment calculator</h2>
            <p>Move the sliders to see exactly what your monthly payment looks like, with no surprises.</p>
          </div>

          <div className="calc-panel reveal">
            <div className="calc-types">
              {LOAN_TYPES.map((l, i) => (
                <button
                  key={l.key}
                  className={`calc-type ${loanIdx === i ? "active" : ""}`}
                  onClick={() => switchLoan(i)}
                >
                  <span className="ct-emoji">{l.emoji}</span>
                  <span className="ct-label">{l.label}</span>
                </button>
              ))}
            </div>

            <div className="calc-body">
              <div className="calc-sliders">
                <div className="slider-block">
                  <div className="slider-top">
                    <label>Loan amount</label>
                    <span className="slider-val">{usd(amount)}</span>
                  </div>
                  <input
                    type="range" min={loan.min} max={loan.max} step={100} value={amount}
                    onChange={(e) => setAmount(+e.target.value)}
                    style={{ background: sliderBg(amount, loan.min, loan.max) }}
                  />
                  <div className="slider-range"><span>{usd(loan.min)}</span><span>{usd(loan.max)}</span></div>
                </div>

                <div className="slider-block">
                  <div className="slider-top">
                    <label>Repayment term</label>
                    <span className="slider-val">{term} months</span>
                  </div>
                  <input
                    type="range" min={loan.termMin} max={loan.termMax} step={1} value={term}
                    onChange={(e) => setTerm(+e.target.value)}
                    style={{ background: sliderBg(term, loan.termMin, loan.termMax) }}
                  />
                  <div className="slider-range"><span>{loan.termMin} mo</span><span>{loan.termMax} mo</span></div>
                </div>

                <div className="slider-block">
                  <div className="slider-top">
                    <label>Interest rate (APR)</label>
                    <span className="slider-val">{rate}%</span>
                  </div>
                  <input
                    type="range" min={4} max={30} step={0.5} value={rate}
                    onChange={(e) => setRate(+e.target.value)}
                    style={{ background: sliderBg(rate, 4, 30) }}
                  />
                  <div className="slider-range"><span>4%</span><span>30%</span></div>
                </div>
              </div>

              <div className="calc-result">
                <span className="cr-label">Estimated monthly payment</span>
                <span className="cr-emi">{usd(emi)}</span>
                <div className="cr-rows">
                  <div className="cr-row"><span>Principal</span><strong>{usd(amount)}</strong></div>
                  <div className="cr-row"><span>Total interest</span><strong>{usd(totalInterest)}</strong></div>
                  <div className="cr-row cr-total"><span>Total payable</span><strong>{usd(totalPayable)}</strong></div>
                </div>
                <Link to="/apply" className="btn btn-primary btn-block">Apply for this loan</Link>
                <p className="cr-note">Indicative only. Final terms depend on review.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── BANKING FOR ───────── */}
      <section className="section banking-for">
        <div className="container">
          <div className="section-head center reveal">
            <span className="eyebrow center">Built around you</span>
            <h2>Banking for every kind of grower</h2>
          </div>
          <div className="bf-grid">
            {[
              { tag: "Individuals", title: "Save for what matters", desc: "Round-up savings, CDs and easy digital banking for rent, tuition and rainy days.", icon: "people", to: "/services" },
              { tag: "Businesses", title: "Fuel your enterprise", desc: "Working capital, small business loans and checking accounts that move at the speed of your business.", icon: "loan", to: "/services" },
              { tag: "Circles", title: "Grow stronger together", desc: "Lending circles and group savings for cooperatives, associations and community groups.", icon: "trust", to: "/services" },
            ].map((b, i) => (
              <Link to={b.to} className="bf-card reveal" key={b.tag} style={{ transitionDelay: `${i * 0.07}s` }}>
                <span className="bf-icon"><Icon name={b.icon} size={26} /></span>
                <span className="bf-tag">{b.tag}</span>
                <h3>{b.title}</h3>
                <p>{b.desc}</p>
                <span className="bf-arrow"><Icon name="arrow" size={18} /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── TESTIMONIALS CAROUSEL ───────── */}
      <section className="section testimonials">
        <div className="container">
          <div className="tst-head reveal">
            <div>
              <span className="eyebrow">In their words</span>
              <h2>Real growth, real people</h2>
            </div>
            <div className="tst-nav">
              <button className="tst-arrow" onClick={prevT} aria-label="Previous testimonials">
                <Icon name="arrow" size={20} style={{ transform: "rotate(180deg)" }} />
              </button>
              <button className="tst-arrow" onClick={nextT} aria-label="Next testimonials">
                <Icon name="arrow" size={20} />
              </button>
            </div>
          </div>

          <div className="tst-viewport reveal">
            <div
              className="tst-track"
              style={{ transform: `translateX(-${tIndex * (100 / perView)}%)` }}
            >
              {TESTIMONIALS.map((t) => (
                <div className="tst-slide" key={t.name} style={{ flex: `0 0 ${100 / perView}%` }}>
                  <figure className="tst-card">
                    <span className="tst-quote">“</span>
                    <blockquote>{t.quote}</blockquote>
                    <figcaption>
                      <span className="tst-avatar">{t.name.split(" ").map((w) => w[0]).join("").slice(0, 2)}</span>
                      <span>
                        <strong>{t.name}</strong>
                        <em>{t.role}</em>
                      </span>
                    </figcaption>
                  </figure>
                </div>
              ))}
            </div>
          </div>

          <div className="tst-dots">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                className={`tst-dot ${tIndex === i ? "active" : ""}`}
                onClick={() => setTIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ───────── FINAL CTA ───────── */}
      <section className="cta-band">
        <div className="container cta-inner reveal">
          <div className="cta-text">
            <h2>Ready to plant your first seed?</h2>
            <p>Open a Nut Treasury Services account today and start growing your money the smart way.</p>
          </div>
          <div className="cta-actions">
            <Link to="/apply" className="btn btn-primary btn-lg">Open an account</Link>
            <Link to="/contact" className="btn btn-outline-light btn-lg">Talk to us</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
