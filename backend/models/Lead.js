import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ["lead", "business"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    platform: { 
      type: String, 
      required: true, 
      enum: ["instagram", "facebook", "linkedin", "x", "googleBusiness"],
      index: true 
    },
    contactName: { type: String, required: true },
    contactUsername: { type: String, required: true },
    profileImage: { type: String, default: "" },
    status: {
      type: String,
      enum: ["new", "contacted", "qualified", "closed"],
      default: "new",
      index: true
    },
    notes: { type: String, default: "" },
    messages: [messageSchema]
  },
  { timestamps: true }
);

leadSchema.index({ userId: 1, platform: 1, contactUsername: 1 });

const Lead = mongoose.models.Lead || mongoose.model("Lead", leadSchema);

export default Lead;
