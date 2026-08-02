// Clean, consistent line icons used across the site.
const base = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const Icon = ({ name, size = 24, ...rest }) => {
  const props = { ...base, width: size, height: size, ...rest };
  switch (name) {
    case "savings":
      return (
        <svg {...props}>
          <path d="M19 5c-1.5-1.5-4-2-7-2S6.5 3.5 5 5 3 8 3 11s.7 5 3 7v2h3l1-1.5h2L15 20h3v-2c1.2-.9 2-2.2 2.4-3.7" />
          <path d="M16 8h.01" />
          <path d="M3 11h2" />
          <path d="M12 3c0-1 .8-2 2-2s2 1 2 2" />
        </svg>
      );
    case "loan":
      return (
        <svg {...props}>
          <rect x="2.5" y="6" width="19" height="12" rx="2.5" />
          <circle cx="12" cy="12" r="2.6" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      );
    case "grow":
      return (
        <svg {...props}>
          <path d="M12 21V11" />
          <path d="M12 11c0-3 1.8-5 4.5-5 0 3-1.8 5-4.5 5Z" />
          <path d="M12 13c0-2.6-1.6-4.5-4-4.5 0 2.6 1.6 4.5 4 4.5Z" />
          <path d="M7 21h10" />
        </svg>
      );
    case "mobile":
      return (
        <svg {...props}>
          <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
          <path d="M10.5 18.5h3" />
        </svg>
      );
    case "fast":
      return (
        <svg {...props}>
          <path d="M13 2 4.5 13.5H11l-1 8.5L19 10h-6.5L13 2Z" />
        </svg>
      );
    case "fair":
      return (
        <svg {...props}>
          <path d="M12 3v18" />
          <path d="M5 7h14" />
          <path d="M5 7 2.5 13a3.5 3.5 0 0 0 5 0L5 7Z" />
          <path d="M19 7l-2.5 6a3.5 3.5 0 0 0 5 0L19 7Z" />
          <path d="M8 21h8" />
        </svg>
      );
    case "people":
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3.2" />
          <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
          <path d="M16 5.2A3.2 3.2 0 0 1 16 11.4" />
          <path d="M17 14.2c2.6.5 4.5 2.6 4.5 5.8" />
        </svg>
      );
    case "secure":
      return (
        <svg {...props}>
          <path d="M12 2.5 4.5 5.5v5c0 5 3.2 8.5 7.5 10 4.3-1.5 7.5-5 7.5-10v-5L12 2.5Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "trust":
      return (
        <svg {...props}>
          <path d="M7.5 11.5 11 15l6-6.5" />
          <circle cx="12" cy="12" r="9.5" />
        </svg>
      );
    case "phone":
      return (
        <svg {...props}>
          <path d="M5 3h4l2 5-2.5 1.5a12 12 0 0 0 5 5L20 13l-1 5a2 2 0 0 1-2 1.5A15 15 0 0 1 3.5 6 2 2 0 0 1 5 3Z" />
        </svg>
      );
    case "mail":
      return (
        <svg {...props}>
          <rect x="2.5" y="4.5" width="19" height="15" rx="2.5" />
          <path d="m3 6 9 6 9-6" />
        </svg>
      );
    case "pin":
      return (
        <svg {...props}>
          <path d="M12 21s7-6 7-11a7 7 0 1 0-14 0c0 5 7 11 7 11Z" />
          <circle cx="12" cy="10" r="2.6" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      );
    case "arrow":
      return (
        <svg {...props}>
          <path d="M5 12h14" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="m5 12 4.5 4.5L19 7" />
        </svg>
      );
    case "chat":
      return (
        <svg {...props}>
          <path d="M21 11.5a8 8 0 0 1-11.5 7.2L3 21l2.3-6.5A8 8 0 1 1 21 11.5Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg {...props}>
          <path d="M3 21l1.6-5A8 8 0 1 1 8 19.4L3 21Z" />
          <path d="M8.5 9c.2 2 2.5 4.3 4.5 4.5.6.06 1.3-.5 1.6-1l-1.5-1-1 .6c-.7-.4-1.4-1.1-1.8-1.8l.6-1-1-1.5c-.5.3-1.06 1-1 1.7Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "twitter":
      return (
        <svg {...props}>
          <path d="M4 4l7 9-7 7h2l6-6 5 6h4l-7.5-9.5L20 4h-2l-5.5 5.5L8 4H4Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...props}>
          <path d="M15 3h-2.5A4.5 4.5 0 0 0 8 7.5V10H6v3h2v8h3v-8h2.5l.5-3H11V7.5c0-.8.7-1.5 1.5-1.5H15V3Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "instagram":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="1.1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M7 10v7M7 7v.01M11 17v-4a2 2 0 0 1 4 0v4M11 13v4" />
        </svg>
      );
    case "menu":
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      );
    case "close":
      return (
        <svg {...props}>
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      );
    case "logout":
      return (
        <svg {...props}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5M21 12H9" />
        </svg>
      );
    case "doc":
      return (
        <svg {...props}>
          <path d="M6 2.5h7L19 8v13.5H6Z" />
          <path d="M13 2.5V8h6" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );
    case "spark":
      return (
        <svg {...props}>
          <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
        </svg>
      );
    default:
      return null;
  }
};

export default Icon;
