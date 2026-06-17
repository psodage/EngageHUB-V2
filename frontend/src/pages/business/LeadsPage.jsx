import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { Inbox, MessageSquare, Bot, AlertCircle } from "lucide-react";

export default function LeadsPage() {
  return (
    <DashboardPageShell
      title="Lead & Inbox Management"
      description="Centralized lead collection from comments and messages with instant automated responses."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Unified Inbox placeholder */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Inbox size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Inbox Queue
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Aggregated comments and DMs waiting for responses.</p>
            </div>
          </div>
          
          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
            <MessageSquare size={32} strokeWidth={1.5} className="text-slate-300 dark:text-slate-700" />
            <span className="text-xs font-semibold">Your inbox is clean</span>
            <p className="text-[10px] text-slate-400">Incoming comments asking about your products will appear here.</p>
          </div>
        </div>

        {/* Right 1 col: Automation Rules sidebar */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot size={18} className="text-blue-500" /> Instant Auto-Replies
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Configure keyword triggers for DMs.</p>
          </div>

          <div className="space-y-3">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">"Price" Auto-Send</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">Active</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Triggers on comments containing "price" or "how much". Sends product catalog link.</p>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-950/20 opacity-60">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">"Interested" Auto-Send</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500">Disabled</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Triggers on comments containing "interested" or "info". Sends booking callback page.</p>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-700 dark:border-slate-800 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Create Auto-Reply Rule
          </button>
        </div>
      </div>
    </DashboardPageShell>
  );
}
