import { Router } from "express";
import {
  createCampaign,
  deleteCampaign,
  getCampaign,
  listCampaigns,
  updateCampaign,
} from "../controllers/campaign.controller.js";

export function createCampaignRoutes(requireAuth) {
  const router = Router();
  router.get("/", requireAuth, listCampaigns);
  router.post("/", requireAuth, createCampaign);
  router.get("/:id", requireAuth, getCampaign);
  router.put("/:id", requireAuth, updateCampaign);
  router.delete("/:id", requireAuth, deleteCampaign);
  return router;
}
