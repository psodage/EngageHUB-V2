import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { TrendingUp, Search, Play, Users, BarChart } from "lucide-react";

export default function TrendsPage() {
  return (
    <DashboardPageShell
      title="Trend Detection"
      description="Track viral audio tracks, trending hooks, competitor posts, and popular tags on Instagram and YouTube Shorts."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Trending Audio and Topics */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Trending Audio card */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp size={18} className="text-pink-550 dark:text-[#C8FF00]" /> Viral Audio List
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Highly requested audio tracks seeing exponential growth this week.</p>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { title: "Retro Future Beats (Slowed)", creator: "SoundLab Studios", reelsCount: "125k reels", growth: "+420%" },
                { title: "Summer Chill Vibes 2026", creator: "Lofi Cafe", reelsCount: "94k reels", growth: "+310%" },
                { title: "Neon Synth Glitch", creator: "Cyberwave Music", reelsCount: "48k reels", growth: "+190%" },
              ].map((track, idx) => (
                <div key={idx} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="h-8 w-8 rounded-full bg-slate-150 flex items-center justify-center text-slate-700 dark:bg-slate-800 dark:text-slate-200 hover:bg-[#C8FF00] hover:text-black transition"
                    >
                      <Play size={12} fill="currentColor" className="ml-0.5" />
                    </button>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{track.title}</p>
                      <p className="text-[10px] text-slate-400">{track.creator}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{track.reelsCount}</p>
                    <p className="text-[10px] text-emerald-500 font-bold">{track.growth} velocity</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending hashtags/topics */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Search size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Viral Hashtags & Topics
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Popular search hashtags and viral themes.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {["#aestheticvibe", "#dailyvlog2026", "#cyberpunkfashion", "#contentcreationtips", "#filmtiktok", "#dayinmylife"].map((tag) => (
                <span key={tag} className="rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-650 dark:text-slate-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 col: Competitor Analysis */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> Competitor Tracking
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Track top rival handles to inspect their hook strategies.</p>
          </div>

          <div className="space-y-3">
            {[
              { username: "@steve_creator", score: "5.4% ER", status: "Active" },
              { username: "@sara_marketing", score: "4.8% ER", status: "Active" },
            ].map((comp, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                <div>
                  <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{comp.username}</p>
                  <p className="text-[10px] text-slate-400">Avg. engagement rate: {comp.score}</p>
                </div>
                <span className="text-[9px] font-bold text-emerald-500">Tracked</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Track New Creator Handle
          </button>
        </div>

      </div>
    </DashboardPageShell>
  );
}
