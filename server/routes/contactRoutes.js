import express from "express";
import { body } from "express-validator";
import {
  createContactMessage,
  getContactMessages,
  updateContactStatus,
  subscribeNewsletter,
} from "../controllers/contactController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.post(
  "/contact",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("A valid email is required"),
    body("subject").trim().notEmpty().withMessage("Subject is required"),
    body("message")
      .trim()
      .isLength({ min: 10 })
      .withMessage("Message should be at least 10 characters"),
  ],
  createContactMessage
);

router.get("/contact", protect, authorize("admin"), getContactMessages);
router.patch("/contact/:id/handled", protect, authorize("admin"), updateContactStatus);

router.post(
  "/newsletter",
  [body("email").isEmail().withMessage("A valid email is required")],
  subscribeNewsletter
);

export default router;
