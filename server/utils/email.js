/**
 * Lightweight email helper. Uses nodemailer only if SMTP is configured via env
 * (SMTP_HOST, SMTP_USER, SMTP_PASS). If not configured, it logs and no-ops so
 * the app still works in development. Notifications to the dashboard are always
 * sent regardless, so email is an optional extra channel.
 */
export const sendEmail = async ({ to, subject, text }) => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`[email skipped — no SMTP configured] to=${to} subject="${subject}"`);
    return { sent: false, reason: "smtp-not-configured" };
  }
  try {
    const nodemailer = (await import("nodemailer")).default;
    const transport = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: Number(SMTP_PORT) === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
    await transport.sendMail({ from: EMAIL_FROM || SMTP_USER, to, subject, text });
    return { sent: true };
  } catch (err) {
    console.error("[email error]", err.message);
    return { sent: false, reason: err.message };
  }
};

// Default deposit instructions shown to staff when sending bank details.
export const defaultDepositDetails = (reference) =>
  [
    "Please make your deposit to:",
    "Bank: Nut Treasury Services",
    "Account name: Nut Treasury Services Deposits",
    "Account number: 000-123-456-789",
    "Routing (ACH): 021000021",
    `Reference: ${reference}`,
    "",
    "Once you have sent the funds, mark the deposit as completed on your dashboard.",
  ].join("\n");
