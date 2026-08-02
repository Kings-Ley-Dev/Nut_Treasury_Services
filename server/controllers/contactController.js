import ContactMessage from "../models/ContactMessage.js";
import Newsletter from "../models/Newsletter.js";
import { asyncHandler, handleValidation } from "../utils/helpers.js";

// @desc   Submit a contact-form message
// @route  POST /api/contact
export const createContactMessage = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;
  const msg = await ContactMessage.create(req.body);
  res.status(201).json({
    success: true,
    message: "Thanks for reaching out — our team will reply within 24 hours.",
    id: msg._id,
  });
});

// @desc   List all contact messages (admin)
// @route  GET /api/contact  (admin)
export const getContactMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort("-createdAt");
  res.json({ success: true, count: messages.length, messages });
});

// @desc   Mark a contact message handled / unhandled (admin)
// @route  PATCH /api/contact/:id/handled  (admin)
export const updateContactStatus = asyncHandler(async (req, res) => {
  const msg = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { handled: Boolean(req.body.handled) },
    { new: true }
  );
  if (!msg) {
    res.status(404);
    throw new Error("Message not found");
  }
  res.json({ success: true, message: msg });
});

// @desc   Subscribe an email to the newsletter
// @route  POST /api/newsletter
export const subscribeNewsletter = asyncHandler(async (req, res) => {
  if (handleValidation(req, res)) return;
  const { email } = req.body;
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    return res.json({ success: true, message: "You're already subscribed." });
  }
  await Newsletter.create({ email });
  res.status(201).json({
    success: true,
    message: "Subscribed! Watch your inbox for money tips and updates.",
  });
});
