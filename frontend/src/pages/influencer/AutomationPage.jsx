import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { MessageSquare, Zap, Play, Bot, AlertCircle } from "lucide-react";

export default function AutomationPage() {
  return (
    <DashboardPageShell
      title="Engagement Automation"
      description="Build DM triggers and configure chatbot workflows to reply to comments instantly."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 cols: Main automation workspace */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Comment-to-DM Funnels
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Define actions that execute when followers comment specific keywords.</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF00] px-3.5 py-2 text-xs font-bold text-black hover:bg-[#d4ff33] transition"
            >
              <Zap size={14} />
              New Flow
            </button>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Comment Keyword "KIT"</span>
                <p className="text-[10px] text-slate-400 mt-1">If a user comments "KIT" on any Reel, send them the Brand Kit link in DM.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">Active</span>
                <button type="button" className="text-xs font-semibold text-slate-400 hover:text-slate-650 transition">Configure</button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: FAQ bot settings */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot size={18} className="text-blue-500" /> FAQ Chatbot Composer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Automate replies to direct messages based on typical questions.</p>
          </div>

          <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-14 flex flex-col items-center justify-center text-slate-400 gap-2">
            <AlertCircle size={24} strokeWidth={1.5} className="text-slate-300 dark:text-slate-700" />
            <span className="text-[11px] font-semibold">Chatbot disabled</span>
            <p className="text-[9px] text-slate-400 text-center max-w-xs px-2">Enable chatbot automation to handle FAQs when you are offline.</p>
          </div>
        </div>

      </div>
    </DashboardPageShell>
  );
}
