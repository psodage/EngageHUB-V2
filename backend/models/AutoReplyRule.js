import mongoose from "mongoose";

const autoReplyRuleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true, trim: true },
    keyword: { type: String, required: true, trim: true },
    replyText: { type: String, required: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

autoReplyRuleSchema.index({ userId: 1, keyword: 1 });

const AutoReplyRule = mongoose.models.AutoReplyRule || mongoose.model("AutoReplyRule", autoReplyRuleSchema);

export default AutoReplyRule;
