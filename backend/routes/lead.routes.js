import { Router } from "express";
import {
  listLeads,
  getLead,
  updateLeadStatus,
  updateLeadNotes,
  sendManualMessage,
  deleteLead,
  listRules,
  createRule,
  updateRule,
  deleteRule,
  simulateIncomingEvent
} from "../controllers/lead.controller.js";

export function createLeadRoutes(requireAuth) {
  const router = Router();
  
  // Rules management (Define specific routes BEFORE dynamic /:id parameter)
  router.get("/rules", requireAuth, listRules);
  router.post("/rules", requireAuth, createRule);
  router.put("/rules/:id", requireAuth, updateRule);
  router.delete("/rules/:id", requireAuth, deleteRule);

  // Simulation
  router.post("/simulate", requireAuth, simulateIncomingEvent);

  // Lead CRUD
  router.get("/", requireAuth, listLeads);
  router.get("/:id", requireAuth, getLead);
  router.put("/:id/status", requireAuth, updateLeadStatus);
  router.put("/:id/notes", requireAuth, updateLeadNotes);
  router.post("/:id/message", requireAuth, sendManualMessage);
  router.delete("/:id", requireAuth, deleteLead);

  return router;
}
