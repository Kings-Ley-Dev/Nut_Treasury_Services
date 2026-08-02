import Ticket from "../models/Ticket.js";
import { asyncHandler } from "../utils/helpers.js";
import { notify, audit } from "../utils/services.js";

/* ─────────── Customer ─────────── */

export const createTicket = asyncHandler(async (req, res) => {
  const { subject, category, message, priority } = req.body;
  if (!subject || !message) {
    res.status(400);
    throw new Error("Subject and message are required");
  }
  const ticket = await Ticket.create({
    customer: req.user._id,
    subject,
    category: category || "General",
    priority: priority || "normal",
    messages: [{ author: req.user._id, authorName: req.user.name, authorRole: "customer", body: message }],
  });
  res.status(201).json({ success: true, ticket });
});

export const myTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ customer: req.user._id }).sort("-updatedAt");
  res.json({ success: true, tickets });
});

/* ─────────── Staff ─────────── */

export const allTickets = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.mine === "true") filter.assignedTo = req.user._id;
  const tickets = await Ticket.find(filter).populate("customer", "name email").populate("assignedTo", "name").sort("-updatedAt");
  res.json({ success: true, count: tickets.length, tickets });
});

export const assignTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  ticket.assignedTo = req.user._id;
  if (ticket.status === "open") ticket.status = "in-progress";
  await ticket.save();
  await audit(req.user, "ticket.assign", ticket.reference);
  res.json({ success: true, ticket });
});

export const updateTicketStatus = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  if (req.body.status) ticket.status = req.body.status;
  await ticket.save();
  await audit(req.user, "ticket.status", ticket.reference, { status: ticket.status });
  if (ticket.status === "resolved") {
    await notify(ticket.customer, "Ticket resolved", `Your ticket ${ticket.reference} has been resolved.`, "success");
  }
  res.json({ success: true, ticket });
});

/* Reply works for both roles */
export const replyTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) {
    res.status(404);
    throw new Error("Ticket not found");
  }
  const isOwner = ticket.customer.toString() === req.user._id.toString();
  const isStaff = ["employee", "admin"].includes(req.user.role);
  if (!isOwner && !isStaff) {
    res.status(403);
    throw new Error("Not allowed");
  }
  ticket.messages.push({
    author: req.user._id,
    authorName: req.user.name,
    authorRole: req.user.role,
    body: req.body.message,
  });
  if (isStaff && ticket.status === "open") ticket.status = "in-progress";
  await ticket.save();
  if (isStaff) await notify(ticket.customer, "Support replied", `New reply on ticket ${ticket.reference}.`, "info");
  res.json({ success: true, ticket });
});
