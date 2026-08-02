// Central content for Nut Treasury Services (United States). Edit here to update the whole site.

export const BANK = {
  name: "Nut Treasury Services",
  short: "Nut Treasury Services",
  tagline: "Small seeds, mighty growth.",
  phone: "+1 (276) 885-5722",
  textLine: "+1 (276) 885-5722",
  email: "support@nuttreasuryservices.com",
  supportEmail: "support@nuttreasuryservices.com",
  hours: [
    ["Monday to Friday", "9:00 AM to 5:00 PM"],
    ["Saturday", "10:00 AM to 2:00 PM"],
    ["Sunday & Holidays", "Closed"],
  ],
  socials: ["twitter", "facebook", "instagram", "linkedin"],
};

// Marquee ticker
export const TICKER = [
  "Round-Up Savings start with just $5",
  "12-month CD up to 16.5% APY",
  "Small business loans funded in 48 hours",
  "Member FDIC and Equal Housing Lender",
  "Credit-builder loans to grow your score",
  "Auto-invest from $25 a month",
  "96% on-time repayment rate",
];

// Impact stats (used on the About page)
export const IMPACT = [
  { value: "180K+", label: "Customers served", accent: "royal" },
  { value: "$420M", label: "Loans funded", accent: "amber" },
  { value: "96%", label: "On-time repayment", accent: "sprout" },
  { value: "50", label: "U.S. states served", accent: "royal" },
];

// Quick service overview (Home)
export const SERVICES_BRIEF = [
  {
    icon: "savings",
    title: "Savings & CDs",
    desc: "Everyday savings, round-up auto-save and CDs that grow your money with APYs up to 16.5%.",
  },
  {
    icon: "loan",
    title: "Micro & Small Business Loans",
    desc: "Fast, fair credit for entrepreneurs, gig workers and growing small businesses.",
  },
  {
    icon: "grow",
    title: "Auto-Investing",
    desc: "Put as little as $25 to work each month and watch your nest egg grow over time.",
  },
  {
    icon: "mobile",
    title: "Online Banking",
    desc: "Send money, pay bills and check balances online, anytime from any browser.",
  },
];

// Full product catalogue (Services page)
export const PRODUCTS = [
  {
    group: "Save & Grow",
    items: [
      {
        title: "Everyday Savings Account",
        desc: "An everyday account with no monthly fees, free transfers and interest paid monthly. Open with just $25.",
        points: ["No minimum balance", "Monthly interest", "Free mobile alerts"],
      },
      {
        title: "Round-Up Savings",
        desc: "We round up your card purchases to the nearest dollar and save the change automatically. Effortless saving for busy people.",
        points: ["Automatic round-ups", "Set savings goals", "Withdraw anytime"],
      },
      {
        title: "Certificate of Deposit (CD)",
        desc: "Lock funds for 3 to 24 months and earn up to 16.5% APY, a safe and predictable way to grow surplus cash.",
        points: ["APY up to 16.5%", "Terms 3 to 24 months", "Auto-renew option"],
      },
    ],
  },
  {
    group: "Borrow & Build",
    items: [
      {
        title: "Micro Business Loan",
        desc: "Quick working-capital loans for sole proprietors and small businesses, sized to your cash flow and repaid in easy installments.",
        points: ["$1,000 to $50,000", "48-hour decisions", "Flexible repayment"],
      },
      {
        title: "Credit-Builder Loan",
        desc: "Build or rebuild your credit with small, reportable installments. We report to all three bureaus to help your score grow.",
        points: ["Reports to 3 bureaus", "Low fixed payments", "No credit history needed"],
      },
      {
        title: "Lending Circle Loan",
        desc: "Borrow as a trusted circle of 5 to 15 members. Shared accountability unlocks larger amounts at friendlier rates.",
        points: ["No collateral required", "Group guarantee", "Free financial coaching"],
      },
    ],
  },
  {
    group: "Move & Manage",
    items: [
      {
        title: "Online Banking",
        desc: "Bank anywhere from our secure website, with transfers, bill pay and balance checks in seconds.",
        points: ["Works in any browser", "Instant transfers", "Bank-grade security"],
      },
      {
        title: "Money Transfer",
        desc: "Send and receive money across the U.S. and to linked accounts, with transparent, low fees.",
        points: ["ACH & instant transfers", "Low transparent fees", "Real-time receipts"],
      },
      {
        title: "Financial Coaching",
        desc: "Free workshops and one-on-one coaching to help you budget, save and grow your business with confidence.",
        points: ["Free workshops", "Business coaching", "Women-in-business program"],
      },
    ],
  },
];

// Loan presets used by the repayment calculator
export const LOAN_TYPES = [
  { key: "micro", emoji: "🛒", label: "Micro Business", min: 10000, max: 1000000, termMin: 6, termMax: 36, rate: 14 },
  { key: "small", emoji: "🏢", label: "Small Business", min: 100000, max: 10000000, termMin: 12, termMax: 60, rate: 11 },
  { key: "personal", emoji: "💳", label: "Personal", min: 1000, max: 100000, termMin: 6, termMax: 48, rate: 13 },
  { key: "auto", emoji: "🚗", label: "Auto", min: 10000, max: 500000, termMin: 12, termMax: 72, rate: 8 },
];

// Why-us features
export const WHY = [
  { icon: "fast", title: "Decisions in 48 hours", desc: "No endless paperwork. Bring your basics and get a clear answer in two business days." },
  { icon: "fair", title: "Fair, transparent pricing", desc: "Rates and fees explained upfront. What you see is what you pay, every time." },
  { icon: "people", title: "Built for everyday people", desc: "From gig workers to small business owners, our products fit real American livelihoods." },
  { icon: "secure", title: "Safe & FDIC insured", desc: "Your deposits are insured by the FDIC and protected by bank-grade security on every transaction." },
];

// Testimonials (carousel)
export const TESTIMONIALS = [
  {
    quote: "My boutique doubled in a year. The micro loan came through in two days and the round-up savings grows my reserve without me even thinking about it.",
    name: "Maria Alvarez",
    role: "Boutique owner, Austin, TX",
  },
  {
    quote: "As a circle of fifteen drivers we never qualified at the big banks. Nut Treasury Services trusted us and now we keep our cars on the road.",
    name: "James Carter",
    role: "Rideshare driver, Chicago, IL",
  },
  {
    quote: "The website is so simple my mom uses it. We send money and pay bills without ever standing in a line.",
    name: "Linda Nguyen",
    role: "Salon owner, San Jose, CA",
  },
  {
    quote: "The credit-builder loan took my score from 580 to 690 in eight months. That changed everything for my family.",
    name: "Marcus Bell",
    role: "Electrician, Atlanta, GA",
  },
  {
    quote: "I opened a business checking account online in ten minutes. My coffee cart has never run smoother.",
    name: "Priya Patel",
    role: "Coffee cart owner, Seattle, WA",
  },
  {
    quote: "Nut Treasury Services funded my food truck when no one else would even call me back. Best decision I ever made.",
    name: "Diego Romero",
    role: "Food truck owner, Denver, CO",
  },
];

// About values
export const VALUES = [
  { icon: "grow", title: "Growth for all", desc: "We exist so small seeds, small savings and small businesses, can grow into something mighty." },
  { icon: "trust", title: "Trust & integrity", desc: "We keep our word, price fairly, and protect every dollar our customers entrust to us." },
  { icon: "people", title: "People first", desc: "Behind every account is a livelihood. We design around people, not paperwork." },
  { icon: "secure", title: "Sound & resilient", desc: "Prudent, FDIC insured and built to be here for the next generation of savers." },
];

// About milestones
export const MILESTONES = [
  { year: "2009", title: "The first seed", text: "Launched as a small online lending circle serving 200 entrepreneurs." },
  { year: "2014", title: "Going fully digital", text: "Rebuilt as an online-first platform so anyone could open an account from their browser." },
  { year: "2019", title: "Lending at scale", text: "Crossed 50,000 customers and rolled out credit-builder loans nationwide." },
  { year: "2024", title: "A growing forest", text: "180,000+ customers across all 50 states and $420M in loans funded." },
];

// About leadership
export const LEADERS = [
  { name: "Sarah Whitfield", role: "Chief Executive Officer", initials: "SW" },
  { name: "David Chen", role: "Chief Operating Officer", initials: "DC" },
  { name: "Olivia Martinez", role: "Head of Lending", initials: "OM" },
  { name: "Michael Brooks", role: "Head of Digital", initials: "MB" },
];

// Contact FAQ
export const FAQS = [
  {
    q: "What do I need to open an account?",
    a: "A valid government ID or passport, your Social Security number or ITIN, proof of address and your opening deposit. Most accounts open online in minutes.",
  },
  {
    q: "How fast can I get a loan?",
    a: "Micro and credit-builder loans receive a decision within 48 hours of a complete application. Larger small business loans may take a few extra days for review.",
  },
  {
    q: "Is Nut Treasury Services insured?",
    a: "Yes. Deposits are insured by the FDIC up to the maximum amount allowed by law, and we are an Equal Housing Lender.",
  },
  {
    q: "Is Nut Treasury Services a fully online bank?",
    a: "Yes. Nut Treasury Services is a 100% online platform with no branches. You can open accounts, transfer money and pay bills entirely from our secure website, wherever you are in the U.S.",
  },
  {
    q: "Can non-U.S. citizens open an account?",
    a: "Yes. While we mainly serve U.S. citizens, foreign nationals and non-residents are welcome too. You can open an account with a valid passport and an ITIN (or Social Security number), along with proof of address.",
  },
  {
    q: "Do you charge monthly account fees?",
    a: "Our Everyday Savings and Round-Up accounts have no monthly maintenance fees. Specific transaction fees are always disclosed upfront.",
  },
];

export const ACCOUNT_TYPES = [
  "Everyday Savings",
  "Round-Up Savings",
  "Certificate of Deposit",
  "Business Checking",
  "Joint Savings",
];

export const ID_TYPES = ["Driver's License", "State ID", "Passport", "Social Security Card", "Other"];

export const LOAN_TYPE_NAMES = [
  "Micro Business Loan",
  "Small Business Loan",
  "Credit-Builder Loan",
  "Personal Loan",
  "Auto Loan",
  "Lending Circle Loan",
];

export const EMPLOYMENT = ["Self-employed", "Employed", "Small Business Owner", "Gig Worker", "Other"];
