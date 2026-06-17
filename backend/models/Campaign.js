import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    color: { type: String, default: "#C8FF00" },
    status: {
      type: String,
      enum: ["active", "completed", "draft"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

campaignSchema.index({ userId: 1, startDate: 1 });

const Campaign = mongoose.models.Campaign || mongoose.model("Campaign", campaignSchema);

export default Campaign;
