import Campaign from "../models/Campaign.js";
import ScheduledPost from "../models/ScheduledPost.js";

export async function listCampaigns(req, res) {
  try {
    const userId = req.auth.userId;
    const campaigns = await Campaign.find({ userId }).sort({ startDate: 1 });

    // Fetch the list of post counts for each campaign
    const enrichedCampaigns = await Promise.all(
      campaigns.map(async (campaign) => {
        const postCount = await ScheduledPost.countDocuments({ campaignId: campaign._id });
        return {
          ...campaign.toObject(),
          postCount,
        };
      })
    );

    return res.json(enrichedCampaigns);
  } catch (error) {
    return res.status(500).json({ error: "Failed to list campaigns." });
  }
}

export async function createCampaign(req, res) {
  try {
    const userId = req.auth.userId;
    const { name, description, startDate, endDate, color, status } = req.body;

    if (!name || !startDate || !endDate) {
      return res.status(400).json({ error: "Name, start date, and end date are required." });
    }

    const campaign = new Campaign({
      userId,
      name,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      color: color || "#C8FF00",
      status: status || "active",
    });

    await campaign.save();
    return res.status(201).json(campaign);
  } catch (error) {
    return res.status(550).json({ error: "Failed to create campaign." });
  }
}

export async function getCampaign(req, res) {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    // Fetch sequential posts associated with this campaign
    const posts = await ScheduledPost.find({ campaignId: campaign._id }).sort({ scheduledAt: 1 });

    return res.json({
      campaign,
      posts,
    });
  } catch (error) {
    return res.status(550).json({ error: "Failed to fetch campaign." });
  }
}

export async function updateCampaign(req, res) {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;
    const { name, description, startDate, endDate, color, status } = req.body;

    const campaign = await Campaign.findOne({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    if (name) campaign.name = name;
    if (description !== undefined) campaign.description = description;
    if (startDate) campaign.startDate = new Date(startDate);
    if (endDate) campaign.endDate = new Date(endDate);
    if (color) campaign.color = color;
    if (status) campaign.status = status;

    await campaign.save();
    return res.json(campaign);
  } catch (error) {
    return res.status(550).json({ error: "Failed to update campaign." });
  }
}

export async function deleteCampaign(req, res) {
  try {
    const userId = req.auth.userId;
    const { id } = req.params;

    const campaign = await Campaign.findOneAndDelete({ _id: id, userId });
    if (!campaign) {
      return res.status(404).json({ error: "Campaign not found." });
    }

    // Set campaignId: null on all posts previously linked to this campaign
    await ScheduledPost.updateMany({ campaignId: id }, { $set: { campaignId: null } });

    return res.json({ success: true, message: "Campaign deleted successfully." });
  } catch (error) {
    return res.status(550).json({ error: "Failed to delete campaign." });
  }
}
