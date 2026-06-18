import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardPageShell from "../../components/layout/DashboardPageShell";
import {
  Sparkles,
  PenSquare,
  FileText,
  BadgeAlert,
  Copy,
  Check,
  Send,
  ShoppingBag,
  Ticket,
  ChevronRight,
  RefreshCw,
  Sliders,
  Globe,
  MessageSquare,
  Lightbulb,
  Sparkle
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { generateAiCaptions } from "../../services/aiApi";
import { generateBusinessCopy } from "../../services/aiBusinessApi";

export default function AiBusinessWriter() {
  const navigate = useNavigate();
  const { setToast } = useApp();

  const [mode, setMode] = useState("general"); // 'general', 'product', or 'promo'
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Form states - General Caption
  const [generalTopic, setGeneralTopic] = useState("");
  const [generalGoal, setGeneralGoal] = useState("engage");

  // Form states - Product Highlight
  const [productName, setProductName] = useState("");
  const [features, setFeatures] = useState("");
  const [benefits, setBenefits] = useState("");

  // Form states - Promo Optimizer
  const [promoOffer, setPromoOffer] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [deadline, setDeadline] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("medium");

  // Shared inputs
  const [ctaType, setCtaType] = useState("learn more");
  const [tone, setTone] = useState("professional");
  const [platform, setPlatform] = useState("all");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVariants([]);

    try {
      if (mode === "general") {
        if (!generalTopic.trim()) {
          setToast({ message: "Topic is required.", error: true });
          setLoading(false);
          return;
        }
        const payload = {
          topic: generalTopic.trim(),
          tone,
          goal: generalGoal,
          platform: platform === "all" ? "" : platform
        };
        const result = await generateAiCaptions(payload);
        // Normalize: generateAiCaptions returns objects [{ caption, ... }]
        const normalized = (result || []).map(v => v.caption);
        setVariants(normalized);
      } else {
        const payload = {
          type: mode,
          tone,
          platform: platform === "all" ? "" : platform,
          ctaType,
          ...(mode === "product"
            ? { productName, features, benefits }
            : { promoOffer, promoCode, deadline, urgencyLevel })
        };
        const result = await generateBusinessCopy(payload);
        setVariants(result || []);
      }
      setToast({ message: "Content generated successfully!" });
    } catch (err) {
      setToast({ message: err.message || "Failed to generate copy.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setToast({ message: "Copied to clipboard!" });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendToPlanner = (text) => {
    setToast({ message: "Redirecting to content planner composer..." });
    navigate("/dashboard/business", { state: { openComposer: true, caption: text } });
  };

  return (
    <DashboardPageShell
      title="AI Content Generator"
      description="Create platform-tailored captions, structured product highlights, and urgency-driven discount promos instantly."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input Configuration Panel */}
        <div className="rounded-2xl border border-slate-200/65 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-5 h-fit">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-[#82a800] dark:text-[#C8FF00]" /> Config Parameters
            </h3>
            <p className="text-[11px] text-slate-400">Configure parameters for your marketing copy.</p>
          </div>

          {/* Mode Tabs */}
          <div className="flex flex-col gap-1 p-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850">
            <button
              type="button"
              onClick={() => { setMode("general"); setVariants([]); }}
              className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                mode === "general"
                  ? "bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white"
                  : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
              }`}
            >
              <MessageSquare size={13} />
              General Caption
            </button>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <button
                type="button"
                onClick={() => { setMode("product"); setVariants([]); }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  mode === "product"
                    ? "bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                }`}
              >
                <ShoppingBag size={13} />
                Product Highlight
              </button>
              <button
                type="button"
                onClick={() => { setMode("promo"); setVariants([]); }}
                className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg transition ${
                  mode === "promo"
                    ? "bg-white text-slate-950 shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-350"
                }`}
              >
                <Ticket size={13} />
                Promo Optimizer
              </button>
            </div>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            {/* GENERAL MODE FIELDS */}
            {mode === "general" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic / Prompt</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Write a post about launching our new sustainable energy workspace, highlighting productivity."
                    value={generalTopic}
                    onChange={(e) => setGeneralTopic(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Goal</label>
                  <select
                    value={generalGoal}
                    onChange={(e) => setGeneralGoal(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
                  >
                    <option value="engage">Increase Engagement 💬</option>
                    <option value="sell">Promote &amp; Sell 🛍️</option>
                    <option value="educate">Educate Audience 📚</option>
                    <option value="inspire">Inspire Followers ✨</option>
                  </select>
                </div>
              </>
            )}

            {/* PRODUCT MODE FIELDS */}
            {mode === "product" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SwiftSaaS CRM"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Key Features</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. automated email marketing, smart leads calendar, pipeline builder"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition resize-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Core Benefits</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="e.g. saves founders 15 hours a week, converts leads on autopilot"
                    value={benefits}
                    onChange={(e) => setBenefits(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition resize-none"
                  />
                </div>
              </>
            )}

            {/* PROMO MODE FIELDS */}
            {mode === "promo" && (
              <>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promotion Offer</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 30% Off First Month"
                    value={promoOffer}
                    onChange={(e) => setPromoOffer(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Promo Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SAVE30"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Urgency Level</label>
                    <select
                      value={urgencyLevel}
                      onChange={(e) => setUrgencyLevel(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
                    >
                      <option value="high">High Urgency 🚨</option>
                      <option value="medium">Medium</option>
                      <option value="low">Soft Offer</option>
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiration / Deadline</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Midnight this Friday"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition"
                  />
                </div>
              </>
            )}

            {/* SHARED SETTINGS */}
            {mode !== "general" && (
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Call to Action Type</label>
                <select
                  value={ctaType}
                  onChange={(e) => setCtaType(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
                >
                  <option value="learn more">Learn More</option>
                  <option value="claim this discount">Claim Discount</option>
                  <option value="try it for free">Try for Free</option>
                  <option value="buy now">Buy / Shop Now</option>
                  <option value="register for our webinar">Register / Sign Up</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tone</label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
                >
                  <option value="professional">Professional</option>
                  <option value="enthusiastic">Enthusiastic</option>
                  <option value="playful">Playful / Witty</option>
                  <option value="urgent">Urgent</option>
                  <option value="informative">Informative</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
                >
                  <option value="all">Cross Platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X / Twitter</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black py-3 text-xs font-bold shadow-sm transition cursor-pointer"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Generating Copy...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate AI Copy
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Generated copywriting variations */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-5 min-h-[500px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PenSquare size={16} className="text-[#82a800] dark:text-[#C8FF00]" /> Generated Variations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Copy or send your favorite AI-generated copy straight to the content planner drafts.</p>
          </div>

          {variants.length === 0 ? (
            <div className="flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="p-3 bg-[#C8FF00]/10 text-[#82a800] dark:text-[#C8FF00] rounded-2xl animate-pulse">
                <Sparkle size={32} />
              </div>
              <span className="text-xs font-bold text-slate-650 dark:text-slate-300">AI Copywriting Board Ready</span>
              <p className="text-[10px] text-slate-400 max-w-[280px] text-center mt-0.5 leading-relaxed">
                Configure your options on the left, then click Generate to output high-converting copywriting templates.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {variants.map((text, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 p-5 flex flex-col gap-4 relative group"
                >
                  {/* Top attributes bar */}
                  <div className="flex items-center justify-between border-b border-slate-150/40 dark:border-slate-800/40 pb-2">
                    <div className="flex gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        Option {idx + 1}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#C8FF00]/10 border border-[#C8FF00]/25 px-2 py-0.5 rounded text-[#82a800] dark:text-[#C8FF00]">
                        {tone}
                      </span>
                      {platform !== "all" && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500 capitalize">
                          {platform}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleCopyToClipboard(text, idx)}
                        className="flex items-center justify-center p-1.5 text-slate-500 hover:text-black dark:hover:text-white rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 transition cursor-pointer"
                        title="Copy copy to clipboard"
                      >
                        {copiedId === idx ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Preformatted copy text */}
                  <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-all bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/40 font-mono">
                    {text}
                  </p>

                  {/* Planner handoff CTA button */}
                  <button
                    type="button"
                    onClick={() => handleSendToPlanner(text)}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-[#C8FF00] dark:hover:border-[#C8FF00] bg-white dark:bg-slate-900 py-2 text-xs font-semibold text-slate-800 dark:text-slate-250 transition cursor-pointer"
                  >
                    <Send size={11} className="text-[#82a800] dark:text-[#C8FF00]" />
                    Send to Content Planner
                    <ChevronRight size={12} className="text-slate-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardPageShell>
  );
}
