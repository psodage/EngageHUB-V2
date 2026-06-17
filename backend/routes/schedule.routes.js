import { Router } from "express";
import {
  createScheduledPost,
  deleteScheduledPost,
  getScheduledPost,
  listScheduledPosts,
  updateScheduledPost,
} from "../controllers/schedule.controller.js";

export function createScheduleRoutes(requireAuth) {
  const router = Router();
  router.get("/", requireAuth, listScheduledPosts);
  router.post("/", requireAuth, createScheduledPost);
  router.get("/:id", requireAuth, getScheduledPost);
  router.put("/:id", requireAuth, updateScheduledPost);
  router.delete("/:id", requireAuth, deleteScheduledPost);
  return router;
}

