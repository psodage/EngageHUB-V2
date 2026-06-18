import Lead from "../models/Lead.js";
import AutoReplyRule from "../models/AutoReplyRule.js";

// Helper for standard success responses
const successResponse = (res, data, message = "Success") => {
  return res.status(200).json({ success: true, message, data, error: null });
};

// Helper for error responses
const errorResponse = (res, message, status = 500, code = "error") => {
  return res.status(status).json({ success: false, message, data: null, error: { message, code } });
};

// 1. List all leads
export async function listLeads(req, res) {
  try {
    const leads = await Lead.find({ userId: req.auth.userId }).sort({ updatedAt: -1 });
    return successResponse(res, leads, "Fetched leads successfully.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch leads.");
  }
}

// 2. Get single lead
export async function getLead(req, res) {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, userId: req.auth.userId });
    if (!lead) {
      return errorResponse(res, "Lead not found.", 404, "lead_not_found");
    }
    return successResponse(res, lead, "Fetched lead details.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch lead.");
  }
}

// 3. Update lead status
export async function updateLeadStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["new", "contacted", "qualified", "closed"].includes(status)) {
      return errorResponse(res, "Invalid status value.", 400, "validation_error");
    }

    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: { status } },
      { new: true }
    );

    if (!lead) {
      return errorResponse(res, "Lead not found.", 404, "lead_not_found");
    }
    return successResponse(res, lead, "Updated lead status.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to update lead status.");
  }
}

// 4. Update lead notes
export async function updateLeadNotes(req, res) {
  try {
    const { notes } = req.body;
    const lead = await Lead.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: { notes: notes || "" } },
      { new: true }
    );

    if (!lead) {
      return errorResponse(res, "Lead not found.", 404, "lead_not_found");
    }
    return successResponse(res, lead, "Updated lead notes.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to update lead notes.");
  }
}

// 5. Send message manually (simulated response from business)
export async function sendManualMessage(req, res) {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return errorResponse(res, "Message text is required.", 400, "validation_error");
    }

    const lead = await Lead.findOne({ _id: req.params.id, userId: req.auth.userId });
    if (!lead) {
      return errorResponse(res, "Lead not found.", 404, "lead_not_found");
    }

    const newMessage = {
      sender: "business",
      text: text.trim(),
      createdAt: new Date()
    };

    lead.messages.push(newMessage);
    await lead.save();

    return successResponse(res, lead, "Message sent successfully.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to send message.");
  }
}

// 6. Delete a lead
export async function deleteLead(req, res) {
  try {
    const result = await Lead.deleteOne({ _id: req.params.id, userId: req.auth.userId });
    if (result.deletedCount === 0) {
      return errorResponse(res, "Lead not found.", 404, "lead_not_found");
    }
    return successResponse(res, { deleted: true }, "Deleted lead successfully.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to delete lead.");
  }
}

// 7. List auto-reply rules
export async function listRules(req, res) {
  try {
    const rules = await AutoReplyRule.find({ userId: req.auth.userId }).sort({ createdAt: -1 });
    return successResponse(res, rules, "Fetched rules successfully.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to fetch rules.");
  }
}

// 8. Create auto-reply rule
export async function createRule(req, res) {
  try {
    const { name, keyword, replyText } = req.body;
    if (!name || !keyword || !replyText) {
      return errorResponse(res, "Name, keyword, and replyText are required.", 400, "validation_error");
    }

    const rule = await AutoReplyRule.create({
      userId: req.auth.userId,
      name: name.trim(),
      keyword: keyword.trim(),
      replyText: replyText.trim()
    });

    return successResponse(res, rule, "Created auto-reply rule.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to create rule.");
  }
}

// 9. Update auto-reply rule
export async function updateRule(req, res) {
  try {
    const { name, keyword, replyText, isActive } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (keyword !== undefined) updates.keyword = keyword.trim();
    if (replyText !== undefined) updates.replyText = replyText.trim();
    if (isActive !== undefined) updates.isActive = Boolean(isActive);

    const rule = await AutoReplyRule.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId },
      { $set: updates },
      { new: true }
    );

    if (!rule) {
      return errorResponse(res, "Rule not found.", 404, "rule_not_found");
    }
    return successResponse(res, rule, "Updated auto-reply rule.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to update rule.");
  }
}

// 10. Delete auto-reply rule
export async function deleteRule(req, res) {
  try {
    const result = await AutoReplyRule.deleteOne({ _id: req.params.id, userId: req.auth.userId });
    if (result.deletedCount === 0) {
      return errorResponse(res, "Rule not found.", 404, "rule_not_found");
    }
    return successResponse(res, { deleted: true }, "Deleted rule successfully.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to delete rule.");
  }
}

// 11. Simulate incoming comment/DM event
export async function simulateIncomingEvent(req, res) {
  try {
    const { platform, contactName, contactUsername, text } = req.body;
    if (!platform || !contactName || !contactUsername || !text) {
      return errorResponse(res, "platform, contactName, contactUsername, and text are required.", 400, "validation_error");
    }

    // A. Check for matching active auto-reply rule
    const activeRules = await AutoReplyRule.find({ userId: req.auth.userId, isActive: true });
    let triggeredRule = null;
    const lowerText = text.toLowerCase();
    
    for (const rule of activeRules) {
      const lowerKeyword = rule.keyword.toLowerCase();
      if (lowerText.includes(lowerKeyword)) {
        triggeredRule = rule;
        break; // Match the first matching keyword
      }
    }

    // B. Find or create lead
    let lead = await Lead.findOne({
      userId: req.auth.userId,
      platform,
      contactUsername: contactUsername.trim()
    });

    if (!lead) {
      lead = new Lead({
        userId: req.auth.userId,
        platform,
        contactName: contactName.trim(),
        contactUsername: contactUsername.trim(),
        profileImage: `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(contactUsername.trim())}`,
        status: "new",
        messages: []
      });
    }

    // C. Append incoming message
    lead.messages.push({
      sender: "lead",
      text: text.trim(),
      createdAt: new Date()
    });

    // D. Append auto-reply if triggered
    let autoReplied = false;
    if (triggeredRule) {
      lead.messages.push({
        sender: "business",
        text: triggeredRule.replyText,
        createdAt: new Date()
      });
      autoReplied = true;
    }

    // Mark as updated and save
    lead.updatedAt = new Date();
    await lead.save();

    return successResponse(res, { lead, autoReplied, ruleName: triggeredRule?.name || null }, "Simulated incoming event successfully.");
  } catch (error) {
    return errorResponse(res, error.message || "Failed to simulate incoming event.");
  }
}
