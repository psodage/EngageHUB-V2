import express from "express";
import {
  generateCaptionVariants,
  generateWithOpenAI,
  generateLocalBusinessCopy,
  generateBusinessCopyWithOpenAI,
  generateLocalInfluencerContent,
  generateInfluencerContentWithOpenAI
} from "../utils/aiCaptionGenerator.js";

export function createAiRoutes(requireAuth) {
  const router = express.Router();

  router.post("/generate-caption", requireAuth, async (req, res) => {
    const { topic = "", tone = "casual", goal = "engage", platform = "" } = req.body || {};
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (apiKey) {
      try {
        const variants = await generateWithOpenAI({ topic, tone, goal, platform }, apiKey);
        return res.json({ variants, source: "openai" });
      } catch (error) {
        console.warn("[ai:openai:fallback]", error.message);
      }
    }

    const variants = generateCaptionVariants({ topic, tone, goal, platform });
    return res.json({ variants, source: "local" });
  });

  router.post("/generate-business-copy", requireAuth, async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (apiKey) {
      try {
        const variants = await generateBusinessCopyWithOpenAI(req.body, apiKey);
        return res.json({ success: true, variants, source: "openai" });
      } catch (error) {
        console.warn("[ai:openai:business:fallback]", error.message);
      }
    }

    const variants = generateLocalBusinessCopy(req.body || {});
    return res.json({ success: true, variants, source: "local" });
  });

  router.post("/generate-influencer-content", requireAuth, async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY?.trim();

    if (apiKey) {
      try {
        const variants = await generateInfluencerContentWithOpenAI(req.body, apiKey);
        return res.json({ success: true, variants, source: "openai" });
      } catch (error) {
        console.warn("[ai:openai:influencer:fallback]", error.message);
      }
    }

    const variants = generateLocalInfluencerContent(req.body || {});
    return res.json({ success: true, variants, source: "local" });
  });

  return router;
}
