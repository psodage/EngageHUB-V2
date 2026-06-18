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

// AI Influencer Content: Local Fallback Generator
export function generateLocalInfluencerContent({
  type = "reels-script",
  topic = "daily habits",
  tone = "enthusiastic",
  platform = ""
}) {
  const t = topic.trim() || "daily habits";
  const platSuffix = platform ? ` on ${platform}` : "";

  if (type === "reels-script") {
    return [
      `🎥 REELS/SHORTS SCRIPT: How to master ${t}\n\n[0:00 - 0:03] HOOK (Visual: Energetic transition or text overlay)\n"Here's the one thing holding you back from mastering ${t}..."\n\n[0:03 - 0:15] BODY (Visual: Behind-the-scenes or screen recording)\n"Most people think it takes hours, but you can actually make massive progress in just 5 minutes a day. Start by focusing on one key component: consistency."\n\n[0:15 - 0:20] CALL TO ACTION (Visual: Pointing to screen/caption)\n"Drop a 🚀 if you're ready to try this${platSuffix}! Full guide is linked in my bio."\n\n#ContentCreator #Tutorial #Growth`,
      
      `🎬 STORYBOARD: Secrets of ${t}\n\n[0:00 - 0:03] HOOK (Visual: Quick head shake, hands holding coffee)\n"Stop scrolling if you want to fix your setup for ${t}..."\n\n[0:03 - 0:12] BODY (Visual: Clean B-roll with text boxes popping up)\n"Step 1: Simplify your tools. Step 2: Establish a routine. Step 3: Track your stats. It's really that simple."\n\n[0:12 - 0:15] OUTRO / CTA (Visual: Big smile, waving)\n"Follow for daily content creators tips. What's your biggest obstacle with ${t}? Let me know!"\n\n#InfluencerTip #Setup #CreativeLife`,

      `📹 MINI-TUTORIAL: Ultimate ${t} Hack\n\n[0:00 - 0:03] HOOK (Visual: Pointing up at bold text overlay: 'DO THIS FIRST')\n"This simple hack for ${t} saved me hours of stress..."\n\n[0:03 - 0:12] BODY (Visual: Action-packed macro shots of typing/working)\n"Instead of doing everything manually, automate the boring parts. Setting up templates is a game changer for content creators."\n\n[0:12 - 0:15] CALL TO ACTION (Visual: Text overlay: 'SAVE FOR LATER')\n"Save this script for your next shoot and drop your questions below!"\n\n#CreatorTips #Hack #Automation`
    ];
  } else if (type === "hooks") {
    return [
      `1️⃣ "The honest truth about ${t} that nobody wants to tell you..."\n👉 (Goal: Spark curiosity or controversy. Perfect for a conversational style)\n\n2️⃣ "If you're still struggling with ${t}, you need to stop doing this immediately..."\n👉 (Goal: Pattern interrupt. Point out a common mistake to gain trust)\n\n3️⃣ "I tried every ${t} trick for 30 days. Here is what actually worked..."\n👉 (Goal: Case study / proof. High authority and social proof)\n\n#Hooks #ViralTips #Engagement`,

      `1️⃣ "This one tool completely changed how I approach ${t}..."\n👉 (Goal: Solution-oriented. Introduce utility or workflow hacks)\n\n2️⃣ "How to go from beginner to pro in ${t} (without burning out)..."\n👉 (Goal: Aspirational. Focus on simple, sustainable growth)\n\n3️⃣ "3 mistakes you're making with ${t} that are costing you followers..."\n👉 (Goal: Warning hook. Creates urgency to fix errors)\n\n#CreatorSecrets #Success #Fails`
    ];
  } else if (type === "story-prompts") {
    return [
      `📸 INSTAGRAM STORY SEQUENCE:\n\nFrame 1 (Poll Slide):\n"Be honest... do you find ${t} easy or super frustrating?"\n🔘 Options: [ "Super easy! 😎" | "Help, I'm stuck! 😭" ]\n\nFrame 2 (Insight / Value):\n"Here is my #1 secret to simplify it: Focus on systems, not goals."\n\nFrame 3 (Question Box):\n"What's your biggest struggle with ${t} right now? Ask me anything!"\n\n#StoryIdeas #AudiencePoll #Interact`,

      `📸 INTERACTIVE STORY SEQUENCE:\n\nFrame 1 (This or That):\n"Which style of ${t} do you prefer?"\n🔘 Options: [ "Option A 🛠️" | "Option B ✨" ]\n\nFrame 2 (Behind The Scenes):\n"Here is how I set up mine in under 10 minutes..." (Show photo/video)\n\nFrame 3 (Link Handoff):\n"Grab my checklist to get started! Tap the link sticker below 👇"\n\n#BehindTheScenes #Creative #Checklist`
    ];
  } else { // month-strategy
    return [
      `📅 30-DAY CONTENT ROADMAP FOR: ${t}\n\n🎯 Goal: Establish authority & grow following\n\n• Week 1: Introduction & Common Myths\n  - Post 1: Why most people fail at ${t} (Infographic)\n  - Post 2: My personal journey with ${t} (Reel)\n\n• Week 2: Step-by-Step Tutorial\n  - Post 3: The 3-step framework you need (Carousel)\n  - Post 4: Watch me build a ${t} setup in real-time (Short)\n\n• Week 3: Mistakes & Case Studies\n  - Post 5: Stop doing this when starting ${t} (Reel)\n  - Post 6: Creator Spotlight: How they won (Post)\n\n• Week 4: Scaling & Next Steps\n  - Post 7: 5 tools to automate your workflow (Carousel)\n  - Post 8: Q&A recap & what's next? (Story / Reel)\n\n#Roadmap #Planning #Consistency`,

      `📅 ENGAGEMENT ROADMAP FOR: ${t}\n\n🎯 Goal: Maximize community interaction\n\n• Week 1: Interactive Conversation\n  - Day 1: Ask: What is your #1 goal with ${t}? (Story / Post)\n  - Day 3: Share responses & reaction (Reel)\n\n• Week 2: Deep Dive Case Study\n  - Day 8: Breaking down a successful ${t} example (Carousel)\n  - Day 10: How to replicate it step-by-step (Reel)\n\n• Week 3: Fun & Witty Content\n  - Day 15: Expectation vs. Reality of ${t} (Meme / Short)\n  - Day 17: Relatable creator struggles (Post)\n\n• Week 4: Call to Action Push\n  - Day 22: Live audit session of follower submissions (Live/Reel)\n  - Day 25: Get my ultimate resource checklist (Post)\n\n#SocialStrategy #CreatorCommunity #Growth`
    ];
  }
}

// AI Influencer Content: OpenAI Generator
export async function generateInfluencerContentWithOpenAI(params, apiKey) {
  const {
    type = "reels-script",
    topic = "daily habits",
    tone = "enthusiastic",
    platform = ""
  } = params;

  let contentTypeDesc = "";
  if (type === "reels-script") {
    contentTypeDesc = "Reels/Shorts Script (complete with Hook, Visual scenes, Voiceover, and CTA)";
  } else if (type === "hooks") {
    contentTypeDesc = "3-Second Viral Hook ideas (with explanation of why they work)";
  } else if (type === "story-prompts") {
    contentTypeDesc = "Interactive Instagram Story sequences (polls, sliders, Q&A prompts, and stickers)";
  } else {
    contentTypeDesc = "30-Day Content Roadmap strategy (weekly breakdowns of topics, angles, and formats)";
  }

  const prompt = `Write 3 distinct influencer content ideas for: ${contentTypeDesc}.
Topic: ${topic}
Tone: ${tone}
Target Platform: ${platform || "general social media"}

Rules:
1. No quotes around output.
2. Separate variants with exactly "---".
3. For scripts, use structured headings/timestamps (e.g., Hook, Visual, Audio, CTA).
4. Include line breaks and make the text look highly readable and professional.
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
        { role: "system", content: "You are a professional social media content creator, viral strategist, and influencer scripting consultant. Output only raw copywriting variants." },
        { role: "user", content: prompt },
      ],
      temperature: 0.85,
      max_tokens: 1200,
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

