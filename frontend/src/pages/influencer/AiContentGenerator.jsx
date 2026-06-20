import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardPageShell from "../../components/layout/DashboardPageShell";
import {
  Sparkles,
  PenSquare,
  FileText,
  Copy,
  Check,
  Send,
  ChevronRight,
  RefreshCw,
  Sliders,
  Globe,
  MessageSquare,
  Sparkle,
  Clapperboard,
  Compass,
  Lightbulb,
  CalendarDays
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { generateInfluencerContent } from "../../services/aiInfluencerApi";

export default function AiContentGenerator() {
  const navigate = useNavigate();
  const { setToast } = useApp();

  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Form states
  const [concept, setConcept] = useState("");
  const [outputType, setOutputType] = useState("reels-script");
  const [tone, setTone] = useState("enthusiastic");
  const [platform, setPlatform] = useState("all");

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setVariants([]);

    if (!concept.trim()) {
      setToast({ message: "Concept is required.", error: true });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        type: outputType,
        topic: concept.trim(),
        tone,
        platform: platform === "all" ? "" : platform
      };

      const result = await generateInfluencerContent(payload);
      setVariants(result || []);
      setToast({ message: "Influencer content generated successfully!" });
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
    navigate("/dashboard/influencer", { state: { openComposer: true, caption: text } });
  };

  // Helper to render type icons
  const getTypeIcon = (type) => {
    switch (type) {
      case "reels-script":
        return <Clapperboard size={13} />;
      case "hooks":
        return <Compass size={13} />;
      case "story-prompts":
        return <MessageSquare size={13} />;
      case "month-strategy":
        return <CalendarDays size={13} />;
      default:
        return <Sparkles size={13} />;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "reels-script":
        return "Video Script";
      case "hooks":
        return "Viral Hook";
      case "story-prompts":
        return "Story Poll / Prompt";
      case "month-strategy":
        return "30-Day Strategy";
      default:
        return "Generated Idea";
    }
  };

  return (
    <DashboardPageShell
      title="AI Content Generator"
      description="Generate viral scripts, engaging hook ideas, interactive stories, and monthly roadmaps to skyrocket your reach."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel: Configuration */}
        <div className="rounded-2xl border border-slate-200/65 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-5 h-fit">
          <div className="flex flex-col gap-1">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Sliders size={16} className="text-[#82a800] dark:text-[#C8FF00]" /> Configuration
            </h3>
            <p className="text-[11px] text-slate-400">Configure parameters for your creator content.</p>
          </div>

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Video Concept / Theme
              </label>
              <textarea
                rows={4}
                required
                placeholder="e.g. A morning routine guide for developers highlighting productivity apps and morning coffee ritual."
                value={concept}
                onChange={(e) => setConcept(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Output Type
              </label>
              <select
                value={outputType}
                onChange={(e) => {
                  setOutputType(e.target.value);
                  setVariants([]);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
              >
                <option value="reels-script">Reels/Shorts Script (Storyboard & Visuals)</option>
                <option value="hooks">3-Second Viral Hooks</option>
                <option value="story-prompts">Instagram Story Polls & Prompts</option>
                <option value="month-strategy">30-Day Content Roadmap</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Tone
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
                >
                  <option value="enthusiastic">Enthusiastic ✨</option>
                  <option value="professional">Professional 💼</option>
                  <option value="playful">Playful / Witty 😜</option>
                  <option value="urgent">Urgent 🚨</option>
                  <option value="informative">Informative 📚</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Platform
                </label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-850 dark:bg-slate-950 outline-none transition cursor-pointer"
                >
                  <option value="all">Cross Platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="threads">Threads</option>
                  <option value="x">X / Twitter</option>
                  <option value="youtube">YouTube</option>
                  <option value="facebook">Facebook</option>
                  <option value="pinterest">Pinterest</option>
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
                  Generating Ideas...
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  Generate AI Content
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Panel: Variations */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-5 min-h-[500px]">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <PenSquare size={16} className="text-[#82a800] dark:text-[#C8FF00]" /> Generated Variations
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Copy or push your favorite content strategies and scripts straight to the planner composer.
            </p>
          </div>

          {variants.length === 0 ? (
            <div className="flex-1 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-24 flex flex-col items-center justify-center text-slate-400 gap-3">
              <div className="p-3 bg-[#C8FF00]/10 text-[#82a800] dark:text-[#C8FF00] rounded-2xl animate-pulse">
                <Sparkle size={32} />
              </div>
              <span className="text-xs font-bold text-slate-650 dark:text-slate-300">Creator Board Ready</span>
              <p className="text-[10px] text-slate-400 max-w-[280px] text-center mt-0.5 leading-relaxed">
                Describe your video concept on the left, then click Generate to produce highly structured creator content.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-1">
              {variants.map((text, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/30 dark:bg-slate-950/20 p-5 flex flex-col gap-4 relative group"
                >
                  {/* Card Header metadata */}
                  <div className="flex items-center justify-between border-b border-slate-150/40 dark:border-slate-800/40 pb-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                        Option {idx + 1}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-[#C8FF00]/10 border border-[#C8FF00]/25 px-2 py-0.5 rounded text-[#82a800] dark:text-[#C8FF00] flex items-center gap-1">
                        {getTypeIcon(outputType)}
                        {getTypeName(outputType)}
                      </span>
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-slate-500 capitalize">
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
                        title="Copy text to clipboard"
                      >
                        {copiedId === idx ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>

                  {/* Preformatted script or list text */}
                  <p className="text-xs text-slate-750 dark:text-slate-300 leading-relaxed whitespace-pre-wrap select-all bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-800/40 font-mono">
                    {text}
                  </p>

                  {/* Send to Content Planner Handoff */}
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
