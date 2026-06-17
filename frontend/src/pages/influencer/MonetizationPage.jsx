import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { Coins, Award, Users, FileText, ChevronRight, Plus } from "lucide-react";

export default function MonetizationPage() {
  return (
    <DashboardPageShell
      title="Sponsorships & Brand Deals"
      description="Design dynamic media kits and manage brand deal pitches from initial contact to final payment."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Brand Deals Kanban board placeholder */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Deal Pipeline
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Track pitches and brand deals.</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-350 hover:bg-slate-100 transition"
            >
              <Plus size={12} />
              Add Deal
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {["Pitched", "Negotiating", "Contract/Paid"].map((stage) => (
              <div key={stage} className="rounded-xl bg-slate-50/50 dark:bg-slate-950/20 p-3 min-h-[180px] border border-slate-100 dark:border-slate-800/60 flex flex-col gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stage}</span>
                {stage === "Negotiating" ? (
                  <div className="rounded-lg bg-white dark:bg-slate-900 p-2.5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-slate-950 dark:text-white">Fitness App Integration</span>
                    <span className="text-slate-400">Est. payout: $800</span>
                  </div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-slate-450 italic">No deals</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 col: Dynamic Media Kit preview link */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={18} className="text-pink-500" /> Dynamic Media Kit
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Share live, dynamic stats directly with PR representatives.</p>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 dark:bg-pink-950/40 dark:text-pink-400 shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Main Creator Kit</p>
                <p className="text-[10px] text-slate-400">Last updated: Today</p>
              </div>
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-between gap-2 rounded-lg bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 border border-slate-100 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 transition"
            >
              <span>View Public Media Link</span>
              <ChevronRight size={14} className="text-slate-400" />
            </button>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-[#C8FF00] py-2.5 text-xs font-bold text-black hover:bg-[#d4ff33] transition shadow-sm"
          >
            Edit Media Template
          </button>
        </div>

      </div>
    </DashboardPageShell>
  );
}
