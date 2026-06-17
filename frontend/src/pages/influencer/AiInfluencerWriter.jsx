import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { Sparkles, PenSquare, FileText, ArrowRight } from "lucide-react";

export default function AiInfluencerWriter() {
  return (
    <DashboardPageShell
      title="AI Caption & Scriptwriter"
      description="Generate viral hooks, structured Reels/Shorts storyboards, Instagram Story ideas, and monthly content strategies."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Script Generation inputs */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-pink-500" /> AI Script Generator
            </h3>
            <p className="text-xs text-slate-500">Generate storyboard layouts for video drafts.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Video Concept / Theme</label>
              <input
                type="text"
                placeholder="E.g., A morning routing guide for devs..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Output Type</label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition cursor-pointer">
                <option value="reels-script">Reels/Shorts Script (Visual & Voiceover)</option>
                <option value="hooks">3-Second Hook Ideas</option>
                <option value="story-prompts">Instagram Story Polls & Prompts</option>
                <option value="month-strategy">30-Day Content Roadmap</option>
              </select>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black py-2.5 text-xs font-bold shadow-sm transition"
            >
              <Sparkles size={14} />
              Generate Script Draft
            </button>
          </div>
        </div>

        {/* Right 2 cols: Workspace/Draft */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Script Draft Output
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Edit, refine, or send your generated drafts directly to the content planner backlog.</p>
            </div>
          </div>

          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <PenSquare size={32} strokeWidth={1.5} className="text-slate-300 dark:text-slate-700 animate-pulse" />
            <span className="text-xs font-semibold">Your scripting board is ready</span>
            <p className="text-[10px] text-slate-400">Select a concept on the left panel to output structured script cards.</p>
          </div>
        </div>

      </div>
    </DashboardPageShell>
  );
}
