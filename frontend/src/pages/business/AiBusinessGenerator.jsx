import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DashboardPageShell from "../../components/layout/DashboardPageShell";
import {
  Sparkles,
  PenSquare,
  FileText,
  Copy,
  Check,
  Send,
  RefreshCw,
  Sliders,
  Sparkle,
  Film,
  PlayCircle,
  LayoutGrid,
  TrendingUp,
  Calendar,
  Trash2,
  Clock,
  Video,
  CheckCircle,
  Lightbulb,
  Flame,
  Target
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { createScheduledPost, listScheduledPosts, deleteScheduledPost } from "../../services/scheduleApi";

// Insights & Trends
const MOCK_INSIGHTS = [
  { id: "i1", text: "Transformation posts perform 35% better.", value: "+35%" },
  { id: "i2", text: "Audience engagement peaks at 7 PM.", value: "7:00 PM" },
  { id: "i3", text: "Educational content receives more saves.", value: "Saves" },
  { id: "i4", text: "Create more automation tutorials this week.", value: "Topic" }
];

const MOCK_TRENDS = [
  { id: "t1", topic: "AI automation for local business", volume: "124K views" },
  { id: "t2", topic: "Vlog-style founder day in life", volume: "98K views" },
  { id: "t3", topic: "SaaS growth for solopreneurs", volume: "85K views" }
];

const MOCK_TRENDING_HASHTAGS = ["#SaaSGrowth", "#FounderLife", "#WorkflowAutomation"];

export default function AiBusinessGenerator() {
  const navigate = useNavigate();
  const { user, connectedAccounts, connections, setToast } = useApp();
  
  const userType = user?.userType || "business";

  // Brand profile setup
  const brandProfile = {
    name: userType === "business" 
      ? (user.businessProfile?.businessName || user.name || "My Brand")
      : (user.influencerProfile?.fullName || user.name || "Alex Morgan"),
    niche: userType === "business"
      ? (user.businessProfile?.industry || "SaaS & Automation")
      : (user.influencerProfile?.niche || "Lifestyle & Tech"),
    audience: userType === "business"
      ? (user.businessProfile?.description || "Small business owners & founders")
      : (user.influencerProfile?.contentCategories || "Developers & creators"),
    goal: userType === "business"
      ? "Lead Generation"
      : "Community Reach"
  };

  // State Management
  const [platform, setPlatform] = useState("instagram");
  const [contentType, setContentType] = useState("Post");
  const [tone, setTone] = useState("Friendly");
  const [goal, setGoal] = useState("Engagement");

  const [loading, setLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);

  // Tabbed display
  const [activeTab, setActiveTab] = useState("drafts");

  // Recent Drafts state
  const [drafts, setDrafts] = useState([]);
  const [draftsLoading, setDraftsLoading] = useState(false);

  const loadDraftsList = useCallback(async () => {
    setDraftsLoading(true);
    try {
      const dbPosts = await listScheduledPosts();
      const realDrafts = dbPosts.filter(p => p.status === "draft");

      const seedDrafts = [
        {
          _id: "seed-d1",
          title: "Summer Launch Campaign",
          caption: "Get ready for the hottest products of the season. Launching soon in limited quantities! #SummerVibes #Excited",
          channelKeys: ["instagram", "facebook"],
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "draft",
          isMock: true
        },
        {
          _id: "seed-d2",
          title: "SaaS Workflow Check",
          caption: "Are you still manually managing your pipelines? Stop wasting time and connect your forms! #Workflow #SaaS",
          channelKeys: ["linkedin"],
          scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "draft",
          isMock: true
        }
      ];

      const merged = [...realDrafts];
      seedDrafts.forEach(seed => {
        if (!realDrafts.some(d => d.title === seed.title)) {
          merged.push(seed);
        }
      });
      setDrafts(merged);
    } catch (err) {
      setDrafts([
        {
          _id: "seed-d1",
          title: "Summer Launch Campaign",
          caption: "Get ready for the hottest products of the season. Launching soon in limited quantities! #SummerVibes #Excited",
          channelKeys: ["instagram", "facebook"],
          scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          status: "draft",
          isMock: true
        },
        {
          _id: "seed-d2",
          title: "SaaS Workflow Check",
          caption: "Are you still manually managing your pipelines? Stop wasting time and connect your forms! #Workflow #SaaS",
          channelKeys: ["linkedin"],
          scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: "draft",
          isMock: true
        }
      ]);
    } finally {
      setDraftsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDraftsList();
  }, [loadDraftsList]);

  const isPlatformConnected = (platKey) => {
    const key = platKey === "threads" ? "threads" : platKey === "x" ? "threads" : platKey;
    if (connections && connections[key]) return true;
    if (connectedAccounts && connectedAccounts.some(a => a.platform === platKey && a.isConnected)) return true;
    return false;
  };

  const executeGeneration = async (selectedPlat, selectedType, selectedTone, selectedGoal) => {
    setLoading(true);
    setGeneratedContent(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));

      const brandName = brandProfile.name;
      const niche = brandProfile.niche;
      const audience = brandProfile.audience;

      let caption = "";
      let cta = "";
      let hashtags = "";
      let postingTime = "7:00 PM (Optimal for engagement)";
      let script = null;

      if (selectedType === "Reel" || selectedType === "Story") {
        script = {
          hook: `Stop making this mistake with your ${niche}! 🚨`,
          main: `Most people think achieving results requires working 24/7 or spending thousands on marketing.\n\nInstead, focus on tailoring your content strategy to your audience.\n\nHere is our simple 3-step framework:\n1. Hook them with a core problem.\n2. Deliver one actionable solution.\n3. End with a specific call to action.`,
          cta: `Follow ${brandName} for daily ${niche} tips!`
        };
        caption = `Want to master your ${niche} content? Here is a behind-the-scenes breakdown of how we help our audience hit their goals. Check out the storyboard script! 👇`;
        cta = `Watch the full breakdown & drop a comment!`;
        hashtags = `#${niche.replace(/\s+/g, "")} #ReelTips #${brandName.replace(/\s+/g, "")}`;
      } else if (selectedType === "Carousel") {
        caption = `Struggling with ${niche}? Swipe through to discover the 5 simple steps to accelerate your growth as a creator/business. \n\nWe've summarized everything you need to know about reaching ${audience} effectively without wasting hours.`;
        cta = `Swipe left & save this post for later reference!`;
        hashtags = `#${niche.replace(/\s+/g, "")} #SwipeLeft #CarouselContent #ExpertTips`;
        postingTime = "6:30 PM (Recommended carousel window)";
      } else if (selectedType === "Educational") {
        caption = `Here are 3 core pillars of ${niche} that will help you connect with your audience:\n\n1️⃣ Clarity over complexity.\n2️⃣ Consistency over intensity.\n3️⃣ Connection over transaction.\n\nWhich of these are you focusing on this week?`;
        cta = `Share your thoughts in the comments below!`;
        hashtags = `#${niche.replace(/\s+/g, "")} #EducationalPost #MarketingTips #ValueFirst`;
        postingTime = "12:15 PM (Lunchtime scroll peak)";
      } else if (selectedType === "Promotional") {
        caption = `Ready to scale your ${niche} strategy? Here is our roadmap:\n\n📅 Weeks 1-2: Educational value & authority building.\n📅 Week 3: Transformation stories & audience trust.\n📅 Week 4: Soft offers & conversion leads.\n\nSave this framework to plan your next month!`;
        cta = `DM us 'GROWTH' to get our premium guide.`;
        hashtags = `#${niche.replace(/\s+/g, "")} #ContentStrategy #30DayChallenge #LeadGeneration`;
        postingTime = "9:00 AM (Monday kickoff peak)";
      } else {
        caption = `Are you looking to level up your ${niche}? At ${brandName}, we design strategies tailored directly for our audience to fast-track success.\n\nNo complexity, no fluff. Just pure, execution-ready insights.`;
        cta = `Click the link in our bio to book a free discovery session today!`;
        hashtags = `#${niche.replace(/\s+/g, "")} #BusinessSuccess #GrowthMindset`;
        postingTime = "5:45 PM (Post-work rush peak)";
      }

      if (selectedTone === "Funny") {
        caption = `POV: Trying to explain ${niche} to your parents... 🫠\n\nBut seriously, if you're trying to reach your audience, it doesn't have to be this hard. We make it simple!`;
      } else if (selectedTone === "Inspirational") {
        caption = `Your daily reminder that consistency in ${niche} beats intensity. Every single piece of content you put out is a step closer to your goals. Keep showing up. ✨`;
      } else if (selectedTone === "Sales Focused") {
        caption = `Ready to transform your ${niche}? We are opening 5 spots to double your goals with ${brandName}. This will sell out fast.`;
      }

      setGeneratedContent({
        caption,
        cta,
        hashtags,
        postingTime,
        script
      });
      setToast({ message: "Content generated successfully by AI Assistant!" });
    } catch (err) {
      setToast({ message: "Failed to generate AI Content.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClick = (e) => {
    e.preventDefault();
    executeGeneration(platform, contentType, tone, goal);
  };

  const handleQuickAction = (actionType) => {
    let plat = "instagram", type = "Post", toneVal = "Friendly", goalVal = "Engagement";
    if (actionType === "today") {
      plat = "instagram"; type = "Post"; toneVal = "Inspirational"; goalVal = "Engagement";
    } else if (actionType === "reel") {
      plat = "instagram"; type = "Reel"; toneVal = "Friendly"; goalVal = "Reach";
    } else if (actionType === "story") {
      plat = "facebook"; type = "Story"; toneVal = "Friendly"; goalVal = "Engagement";
    } else if (actionType === "carousel") {
      plat = "linkedin"; type = "Carousel"; toneVal = "Inspirational"; goalVal = "Brand Awareness";
    } else if (actionType === "weekly") {
      plat = "linkedin"; type = "Educational"; toneVal = "Professional"; goalVal = "Leads";
    } else if (actionType === "strategy") {
      plat = "instagram"; type = "Promotional"; toneVal = "Sales Focused"; goalVal = "Brand Awareness";
    }

    setPlatform(plat);
    setContentType(type);
    setTone(toneVal);
    setGoal(goalVal);
    executeGeneration(plat, type, toneVal, goalVal);
  };

  const handleCopyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setToast({ message: "Copied to clipboard!" });
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleSaveDraft = async () => {
    if (!generatedContent) return;
    
    const combinedCaption = `${generatedContent.caption}\n\n${generatedContent.cta}\n\n${generatedContent.hashtags}`;
    const payload = {
      title: `${contentType} - ${platform.toUpperCase()} Draft`,
      caption: combinedCaption,
      channelKeys: [platform],
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "draft"
    };

    try {
      await createScheduledPost(payload);
      setToast({ message: "Draft saved successfully!" });
      loadDraftsList();
    } catch (err) {
      const localMock = {
        _id: `draft-mock-${Date.now()}`,
        title: payload.title,
        caption: payload.caption,
        channelKeys: payload.channelKeys,
        scheduledAt: payload.scheduledAt,
        status: "draft",
        isMock: true
      };
      setDrafts(prev => [localMock, ...prev]);
      setToast({ message: "Saved draft locally (mock fallback)." });
    }
  };

  const handleSchedulePost = (customCaption) => {
    const finalCaption = customCaption || `${generatedContent.caption}\n\n${generatedContent.cta}\n\n${generatedContent.hashtags}`;
    const destination = userType === "influencer" ? "/dashboard/influencer" : "/dashboard/business";
    
    setToast({ message: "Redirecting to content planner composer..." });
    navigate(destination, {
      state: {
        openComposer: true,
        caption: finalCaption,
        channelKeys: [platform],
        title: `${contentType} - AI Generated`,
        status: "draft"
      }
    });
  };

  const handleEditDraft = (draft) => {
    const destination = userType === "influencer" ? "/dashboard/influencer" : "/dashboard/business";
    navigate(destination, {
      state: {
        openComposer: true,
        postId: draft._id,
        post: draft
      }
    });
  };

  const handleDeleteDraft = async (id, isMock) => {
    if (isMock) {
      setDrafts(prev => prev.filter(d => d._id !== id));
      setToast({ message: "Draft deleted." });
    } else {
      try {
        await deleteScheduledPost(id);
        setToast({ message: "Draft deleted." });
        loadDraftsList();
      } catch (err) {
        setToast({ message: "Failed to delete draft.", error: true });
      }
    }
  };

  return (
    <DashboardPageShell
      title="AI Content Generator"
      description="Generate platform-optimized content powered by your brand profile and performance data."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Brand Context and Controls */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Brand Context Card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-850/60 dark:bg-slate-900 shadow-xs flex flex-col gap-3">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Target size={15} className="text-[#82a800] dark:text-[#C8FF00]" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Brand Profile
              </h3>
            </div>
            
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 dark:text-slate-500 font-semibold">Brand Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{brandProfile.name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 dark:text-slate-500 font-semibold">Niche</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{brandProfile.niche}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 dark:text-slate-500 font-semibold">Audience</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right truncate max-w-[150px]" title={brandProfile.audience}>
                  {brandProfile.audience}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-400 dark:text-slate-500 font-semibold">Growth Goal</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-right">{brandProfile.goal}</span>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-800 pt-2 flex items-center justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-semibold">Platforms</span>
                <div className="flex gap-1.5">
                  {["instagram", "facebook", "linkedin", "x", "threads"].map((p) => {
                    const active = isPlatformConnected(p);
                    return (
                      <div
                        key={p}
                        className={`w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold uppercase ${
                          active
                            ? "bg-[#C8FF00]/15 text-[#82a800] dark:text-[#C8FF00]"
                            : "bg-slate-100 dark:bg-slate-850 text-slate-400"
                        }`}
                        title={`${p}: ${active ? "Connected" : "Disconnected"}`}
                      >
                        {p.substring(0, 2)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Generator Controls */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-850/60 dark:bg-slate-900 shadow-xs flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Sliders size={15} className="text-[#82a800] dark:text-[#C8FF00]" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">
                Generator Controls
              </h3>
            </div>

            <form onSubmit={handleGenerateClick} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Platform</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition cursor-pointer"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X / Twitter</option>
                    <option value="threads">Threads</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Type</label>
                  <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition cursor-pointer"
                  >
                    <option value="Post">Standard Post</option>
                    <option value="Reel">Reel Script</option>
                    <option value="Carousel">Carousel</option>
                    <option value="Story">Story Draft</option>
                    <option value="Educational">Educational</option>
                    <option value="Promotional">Promotional</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Tone</label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition cursor-pointer"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Friendly">Friendly</option>
                    <option value="Inspirational">Inspirational</option>
                    <option value="Funny">Funny</option>
                    <option value="Sales Focused">Sales Focused</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Goal</label>
                  <select
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2 font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition cursor-pointer"
                  >
                    <option value="Engagement">Engagement</option>
                    <option value="Reach">Reach</option>
                    <option value="Leads">Leads</option>
                    <option value="Sales">Sales</option>
                    <option value="Brand Awareness">Awareness</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black py-2.5 font-bold shadow-xs transition cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    Generating Copy...
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    Generate Content
                  </>
                )}
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Quick Pills, Workspace, and Tabs */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 border border-slate-200/60 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-900 rounded-2xl">
            <span className="text-[10px] font-bold text-slate-400 uppercase px-2">Quick Generate:</span>
            {[
              { label: "Today's Post", id: "today" },
              { label: "Reel Script", id: "reel" },
              { label: "Story Idea", id: "story" },
              { label: "Carousel", id: "carousel" },
              { label: "Weekly Plan", id: "weekly" },
              { label: "30-Day Strategy", id: "strategy" }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => handleQuickAction(pill.id)}
                className="text-[10px] font-semibold px-3 py-1 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl transition cursor-pointer"
              >
                {pill.label}
              </button>
            ))}
          </div>

          {/* Workspace Output */}
          {loading ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-850/60 dark:bg-slate-900 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="h-4 w-28 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-4 w-12 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                <div className="h-3 w-5/6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
              </div>
              <div className="h-20 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-800 animate-pulse" />
            </div>
          ) : generatedContent ? (
            <div className="space-y-6">
              
              {/* Generated Content Box */}
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-850/60 dark:bg-slate-900 shadow-xs flex flex-col gap-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="text-emerald-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Generated Content Output</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-450 uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-950 rounded border border-slate-200/50 dark:border-slate-850">{platform}</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Caption Preview</span>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-all">
                      {generatedContent.caption}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {generatedContent.cta && (
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">CTA Offer</span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 p-2 border border-slate-100 dark:border-slate-850 rounded-lg bg-slate-50/30 dark:bg-slate-950/20">
                          {generatedContent.cta}
                        </p>
                      </div>
                    )}
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hashtags</span>
                      <p className="text-indigo-500 font-mono text-[11px] p-2 border border-slate-100 dark:border-slate-850 rounded-lg bg-slate-50/30 dark:bg-slate-950/20">
                        {generatedContent.hashtags}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/20 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-850 text-[11px]">
                    <Clock size={12} className="text-[#82a800] dark:text-[#C8FF00]" />
                    <span>Suggested posting time: <strong className="text-slate-800 dark:text-white">{generatedContent.postingTime}</strong></span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <button
                    onClick={() => handleCopyToClipboard(`${generatedContent.caption}\n\n${generatedContent.cta}\n\n${generatedContent.hashtags}`)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 transition cursor-pointer"
                  >
                    {copiedText ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    Copy
                  </button>
                  <button
                    onClick={() => executeGeneration(platform, contentType, tone, goal)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 transition cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    Regenerate
                  </button>
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 transition cursor-pointer"
                  >
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSchedulePost()}
                    className="flex items-center gap-1.5 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black px-4 py-1.5 text-xs font-bold transition cursor-pointer"
                  >
                    <Send size={12} />
                    Schedule Post
                  </button>
                </div>
              </div>

              {/* Reel Script generator if appropriate */}
              {generatedContent.script && (
                <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-850/60 dark:bg-slate-900 shadow-xs flex flex-col gap-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                    <Video size={15} className="text-[#82a800] dark:text-[#C8FF00]" />
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Video Script Details</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hook</span>
                      <p className="font-semibold text-slate-900 dark:text-white p-2.5 border border-[#C8FF00]/25 rounded-xl bg-[#C8FF00]/5 italic">
                        "{generatedContent.script.hook}"
                      </p>
                    </div>

                    <div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Script outline</span>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {generatedContent.script.main}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                    <button
                      onClick={() => handleCopyToClipboard(`Hook: ${generatedContent.script.hook}\n\nScript:\n${generatedContent.script.main}`)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 transition cursor-pointer"
                    >
                      Copy Script
                    </button>
                    <button
                      onClick={handleSaveDraft}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-350 transition cursor-pointer"
                    >
                      Save Draft
                    </button>
                    <button
                      onClick={() => handleSchedulePost(`Hook: ${generatedContent.script.hook}\n\nScript:\n${generatedContent.script.main}`)}
                      className="flex items-center gap-1.5 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black px-4 py-1.5 text-xs font-bold transition cursor-pointer"
                    >
                      Schedule
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="min-h-[220px] border border-dashed border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 gap-2.5">
              <div className="p-2.5 bg-[#C8FF00]/10 text-[#82a800] dark:text-[#C8FF00] rounded-2xl animate-pulse">
                <Sparkles size={24} />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Ready to Generate</span>
              <p className="text-[10px] text-slate-400 max-w-[260px] text-center leading-relaxed">
                Click one of the Quick Generate shortcuts above or click the Generate button to create brand-tailored content.
              </p>
            </div>
          )}

          {/* Unified Tabbed Panel for Drafts and Insights */}
          <div className="rounded-2xl border border-slate-200/65 bg-white p-5 dark:border-slate-850/60 dark:bg-slate-900 shadow-xs">
            <div className="flex border-b border-slate-100 dark:border-slate-800 pb-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab("drafts")}
                className={`text-[11px] font-bold uppercase tracking-wider pb-2 border-b-2 transition ${
                  activeTab === "drafts"
                    ? "border-[#C8FF00] text-slate-850 dark:text-white"
                    : "border-transparent text-slate-400 hover:text-slate-650"
                }`}
              >
                Recent Drafts ({drafts.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("insights")}
                className={`ml-6 text-[11px] font-bold uppercase tracking-wider pb-2 border-b-2 transition ${
                  activeTab === "insights"
                    ? "border-[#C8FF00] text-slate-850 dark:text-white"
                    : "border-transparent text-slate-400 hover:text-slate-650"
                }`}
              >
                AI Insights &amp; Opportunities
              </button>
            </div>

            {activeTab === "drafts" ? (
              draftsLoading ? (
                <div className="space-y-2 py-4">
                  <div className="h-6 bg-slate-50 dark:bg-slate-950 rounded animate-pulse" />
                  <div className="h-6 bg-slate-50 dark:bg-slate-950 rounded animate-pulse" />
                </div>
              ) : drafts.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <FileText size={20} className="text-slate-350" />
                  <span className="text-xs font-semibold">No drafts yet</span>
                  <p className="text-[9px] text-slate-400">Your saved AI drafts will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto max-h-[220px]">
                  <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                        <th className="py-2">Draft Info</th>
                        <th className="py-2">Platform</th>
                        <th className="py-2">Scheduled</th>
                        <th className="py-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {drafts.map((d) => (
                        <tr key={d._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-950/10 transition">
                          <td className="py-2 font-semibold text-slate-800 dark:text-slate-200">
                            <span className="line-clamp-1 max-w-[200px]" title={d.title || d.caption}>
                              {d.title || d.caption.substring(0, 35)}
                            </span>
                          </td>
                          <td className="py-2">
                            <span className="px-1.5 py-0.5 rounded text-[8px] font-bold uppercase bg-slate-100 dark:bg-slate-850 text-slate-500">
                              {(d.channelKeys || []).join(", ")}
                            </span>
                          </td>
                          <td className="py-2 text-slate-400 text-[10px]">
                            {new Date(d.scheduledAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </td>
                          <td className="py-2 text-right">
                            <div className="flex justify-end gap-1.5">
                              <button
                                onClick={() => handleEditDraft(d)}
                                className="p-1 border border-slate-200 dark:border-slate-800 rounded hover:border-[#C8FF00] hover:text-black dark:hover:text-white transition cursor-pointer"
                                title="Edit Draft"
                              >
                                <Sliders size={10} />
                              </button>
                              <button
                                onClick={() => handleDeleteDraft(d._id, d.isMock)}
                                className="p-1 border border-slate-200 dark:border-slate-800 rounded hover:border-red-500 hover:text-red-500 transition cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2 text-xs">
                
                {/* Left: Performance Insights */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold text-[10px] uppercase tracking-wider pb-1">
                    <Lightbulb size={13} className="text-[#82a800] dark:text-[#C8FF00]" />
                    AI Performance Insights
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_INSIGHTS.slice(0, 3).map((ins) => (
                      <div key={ins.id} className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 text-[11px] flex justify-between items-center">
                        <span className="text-slate-600 dark:text-slate-400">{ins.text}</span>
                        <strong className="text-[#82a800] dark:text-[#C8FF00] font-bold text-[10px] ml-2 shrink-0">{ins.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right: Trending Niche Opportunities */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-800 dark:text-white font-bold text-[10px] uppercase tracking-wider pb-1">
                    <Flame size={13} className="text-pink-500" />
                    Trending Opportunities
                  </div>
                  <div className="space-y-1.5">
                    {MOCK_TRENDS.slice(0, 2).map((t) => (
                      <div key={t.id} className="p-2 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 text-[11px] flex justify-between items-center">
                        <span className="text-slate-700 dark:text-slate-350 font-semibold truncate max-w-[130px]">{t.topic}</span>
                        <span className="text-slate-400 text-[10px]">{t.volume}</span>
                      </div>
                    ))}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {MOCK_TRENDING_HASHTAGS.map((tag) => (
                        <span key={tag} className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardPageShell>
  );
}
