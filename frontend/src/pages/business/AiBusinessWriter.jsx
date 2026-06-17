import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { Sparkles, PenSquare, BadgeAlert, Send } from "lucide-react";

export default function AiBusinessWriter() {
  return (
    <DashboardPageShell
      title="AI Business Writer"
      description="Generate high-converting marketing copy, product descriptions, and promotional campaign hooks."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Input parameters */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Generation Parameters
            </h3>
            <p className="text-xs text-slate-500">Configure parameters for your business promo post.</p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Product / Promotion Description</label>
              <textarea
                rows={4}
                placeholder="What product are you launching, or what discount offer are you running? E.g., 20% off summer sneakers launch..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition resize-none"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Tone of Voice</label>
              <select className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition cursor-pointer">
                <option value="professional">Professional & Direct</option>
                <option value="enthusiastic">Enthusiastic & Hype</option>
                <option value="informative">Informative & Educational</option>
                <option value="exclusive">Exclusive & Urgency</option>
              </select>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black py-2.5 text-xs font-bold shadow-sm transition"
            >
              <Sparkles size={14} />
              Generate Marketing Copy
            </button>
          </div>
        </div>

        {/* Right 2 cols: Generated variations */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PenSquare size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Copy Options
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Copy or send your favorite AI-generated variation to the content composer.</p>
          </div>

          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-20 flex flex-col items-center justify-center text-slate-400 gap-2">
            <BadgeAlert size={32} strokeWidth={1.5} className="text-slate-300 dark:text-slate-700" />
            <span className="text-xs font-semibold">No copy generated yet</span>
            <p className="text-[10px] text-slate-400">Fill in the product details and click Generate to see options here.</p>
          </div>
        </div>
      </div>
    </DashboardPageShell>
  );
}
