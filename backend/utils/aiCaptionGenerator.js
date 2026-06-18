const TONE_OPENERS = {
  professional: "Here's an update on",
  casual: "Quick thought on",
  playful: "Plot twist about",
  urgent: "Don't miss this on",
  inspirational: "A reminder about",
};

export function generateCaptionVariants({ topic = "", tone = "casual", goal = "engage", platform = "" }) {
  const t = topic.trim() || "your brand";
  const opener = TONE_OPENERS[tone] || TONE_OPENERS.casual;
  const plat = platform ? ` for ${platform}` : "";

  return [
    `${opener} ${t}${plat}.\n\nWe'd love your take—comment below.\n\n#SocialMedia #ContentStrategy`,
    `${t}: 3 ideas to try this week\n\n1. Lead with a hook\n2. One CTA only\n3. Reply fast\n\n#Marketing #Growth`,
    `Why ${t} matters right now—and what we're doing about it.\n\nSave · Share · Follow for more.`,
  ];
}

export async function generateWithOpenAI({ topic, tone, goal, platform }, apiKey) {
  const prompt = `Write 3 distinct social media captions.
Topic: ${topic || "general brand"}
Tone: ${tone}
Goal: ${goal}
Platform: ${platform || "general"}
Rules: No quotes around output. Separate variants with "---". Under 280 words each unless platform is linkedin. Include line breaks. Optional 2-3 hashtags at end.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a social media copywriter like Buffer. Output only caption text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 900,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "OpenAI request failed");
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content?.trim() || "";
  const parts = content.split(/\n---\n|\n\n---\n\n/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [content];
}

// AI Business Writer: Local Fallback Generator
export function generateLocalBusinessCopy({
  type = "product",
  productName = "our product",
  features = "automated workflows",
  benefits = "saves time",
  ctaType = "learn more",
  promoOffer = "20% off",
  promoCode = "SAVE20",
  deadline = "this weekend",
  urgencyLevel = "medium",
  tone = "professional",
  platform = ""
}) {
  const pName = productName.trim() || "our product";
  const pFeatures = features.trim() || "premium features";
  const pBenefits = benefits.trim() || "drive growth";
  const pCta = ctaType.trim() || "learn more";
  
  const pOffer = promoOffer.trim() || "special discount";
  const pCode = promoCode.trim() || "SAVE20";
  const pDeadline = deadline.trim() || "limited time";

  const platSuffix = platform ? ` on ${platform}` : "";

  if (type === "product") {
    return [
      `Introducing ${pName}! ✨\n\nStruggling with manual content scheduling and disjointed tools? We built ${pName} to solve that exact problem, allowing you to ${pBenefits} effortlessly.\n\nHere is what you get:\n• ${pFeatures}\n\nReady to elevate your setup${platSuffix}? Click the link in our bio to ${pCta}! 🚀\n\n#${pName.replace(/\s+/g, "")} #Launch #Productivity`,
      
      `Here's why ${pName} is a game-changer. 👇\n\nMost business owners compromise on efficiency. But ${pName} gives you the exact setup you need to ${pBenefits} without the complexity.\n\nKey features include:\n✅ ${pFeatures}\n\nDon't settle for less. Tap the link to ${pCta} today! 🔗\n\n#${pName.replace(/\s+/g, "")} #BusinessTool #Marketing`,
      
      `We're officially launching ${pName}! 🎉\n\nOur team has spent months building this specifically to help businesses ${pBenefits}. No complex onboarding, just immediate results.\n\nHighlights:\n⚙️ ${pFeatures}\n\n👉 Join our early users and ${pCta} now!`,
    ];
  } else { // promo
    const urgencyHeader = urgencyLevel === "high" ? "🚨 TIME IS RUNNING OUT! 🚨" : "✨ EXCLUSIVE PROMOTION ✨";
    return [
      `${urgencyHeader}\n\nGet ${pOffer} on your entire order today! Elevate your content game and save big before this deal expires.\n\n🎫 Promo Code: ${pCode}\n⏰ Deadline: ${pDeadline}\n\nDon't wait—tap the link to ${pCta} now! 📲\n\n#Offer #PromoCode #SaveBig`,
      
      `Looking for a quick shortcut to save? 💸\n\nEnjoy ${pOffer} on us! Simply enter code ${pCode} at checkout to apply your discount.\n\nWhy pay full price? Grab your favorites before they sell out. Offer expires ${pDeadline}.\n\nLink in bio to ${pCta}! 🛍️\n\n#Discount #Shopping #Promo`,
      
      `Unlock your discount: ${pOffer} is live! 🔓\n\nGet premium access for less. Use coupon code ${pCode} to save instantly on your subscription.\n\n⏳ Deal disappears: ${pDeadline}\n\nTap the link to ${pCta}! 🌐\n\n#ExclusiveDeal #PromoCode`
    ];
  }
}

// AI Business Writer: OpenAI Generator
export async function generateBusinessCopyWithOpenAI(params, apiKey) {
  const {
    type = "product",
    productName,
    features,
    benefits,
    ctaType,
    promoOffer,
    promoCode,
    deadline,
    urgencyLevel = "medium",
    tone = "professional",
    platform = ""
  } = params;

  let detailsText = "";
  if (type === "product") {
    detailsText = `Product Name: ${productName || "our product"}
Key Features: ${features || "automated tools"}
Core Benefits: ${benefits || "saves time"}
Call to Action: ${ctaType || "learn more"}`;
  } else {
    detailsText = `Promotional Offer: ${promoOffer || "20% off"}
Promo Code: ${promoCode || "SAVE20"}
Expiration Deadline: ${deadline || "limited time"}
Urgency Level: ${urgencyLevel || "medium"}
Call to Action: ${ctaType || "claim discount"}`;
  }

  const prompt = `Write 3 distinct high-converting social media marketing caption variants for a Business.
Type of copywriting: ${type === "product" ? "Product Highlight & Value Proposition" : "Promotional Offer & Discount Optimizer"}
${detailsText}
Tone of Voice: ${tone}
Target Platform: ${platform || "general social media"}

Rules:
1. No quotes around output.
2. Separate variants with exactly "---".
3. Include clear line breaks and bullet points where appropriate.
4. Keep each under 280 words (unless platform is LinkedIn).
5. Include 2-3 relevant hashtags at the end of each variant.`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a professional social media marketing copywriter and conversion rate optimization (CRO) specialist. Output only raw copy variants." },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "OpenAI request failed");
  }

  const json = await response.json();
  const content = json.choices?.[0]?.message?.content?.trim() || "";
  const parts = content.split(/\n---\n|\n\n---\n\n/).map((s) => s.trim()).filter(Boolean);
  return parts.length ? parts : [content];
}
