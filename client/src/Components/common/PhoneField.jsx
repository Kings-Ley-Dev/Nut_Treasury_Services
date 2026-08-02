import { useMemo, useState, useRef, useEffect } from "react";
import { COUNTRIES, EU_COUNTRIES, OTHER_COUNTRIES, DEFAULT_DIAL } from "../../data/countries";

const byDial = (dial) => COUNTRIES.find((c) => c.dial === dial) || COUNTRIES.find((c) => c.dial === DEFAULT_DIAL);

const splitValue = (value) => {
  if (!value) return { dial: DEFAULT_DIAL, number: "" };
  const dials = COUNTRIES.map((c) => c.dial).sort((a, b) => b.length - a.length);
  const match = dials.find((d) => value.startsWith(d));
  if (match) return { dial: match, number: value.slice(match.length).trim() };
  return { dial: DEFAULT_DIAL, number: value };
};

/**
 * Single unified phone field: a clickable country flag/dial button sits INSIDE
 * the same bordered input, next to the number. EU countries are listed first.
 * Emits "<dial> <number>" (e.g. "+33 612345678") or "" when empty.
 */
const PhoneField = ({ value, onChange, required = false, disabled = false, id }) => {
  const init = useMemo(() => splitValue(value), []); // initialise once
  const [country, setCountry] = useState(byDial(init.dial));
  const [number, setNumber] = useState(init.number);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const emit = (c, n) => onChange(n ? `${c.dial} ${n}`.trim() : "");
  const pick = (c) => { setCountry(c); setOpen(false); setQuery(""); emit(c, number); };
  const filt = (list) => list.filter((c) => {
    const q = query.toLowerCase();
    return !q || c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.code.toLowerCase().includes(q);
  });

  const renderGroup = (label, list) => {
    const items = filt(list);
    if (items.length === 0) return null;
    return (
      <>
        <div className="phone-group">{label}</div>
        {items.map((c) => (
          <button type="button" key={c.code} className="phone-opt" onClick={() => pick(c)}>
            <span className="po-flag">{c.flag}</span>
            <span className="po-name">{c.name}</span>
            <span className="po-dial">{c.dial}</span>
          </button>
        ))}
      </>
    );
  };

  return (
    <div className={`phone-field ${disabled ? "is-disabled" : ""} ${open ? "is-open" : ""}`} ref={ref}>
      <button type="button" className="phone-flag" onClick={() => !disabled && setOpen((o) => !o)} disabled={disabled} aria-label="Select country">
        <span className="pf-flag">{country.flag}</span>
        <span className="pf-dial">{country.dial}</span>
        <span className="pf-caret">▾</span>
      </button>
      <input
        id={id}
        className="phone-number"
        type="tel"
        value={number}
        required={required}
        disabled={disabled}
        placeholder="Phone number"
        onChange={(e) => { setNumber(e.target.value); emit(country, e.target.value); }}
      />
      {open && (
        <div className="phone-dropdown">
          <input className="phone-search" autoFocus placeholder="Search country" value={query} onChange={(e) => setQuery(e.target.value)} />
          <div className="phone-list">
            {renderGroup("European Union", EU_COUNTRIES)}
            {renderGroup("Rest of the world", OTHER_COUNTRIES)}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhoneField;
