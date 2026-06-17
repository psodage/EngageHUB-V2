import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { Palette, Layers, Plus, Sliders, Image } from "lucide-react";

export default function BrandKitPage() {
  return (
    <DashboardPageShell
      title="Brand Kit & Assets"
      description="Store brand colors, upload watermarks, and save typography presets to keep your cross-platform content consistent."
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Brand Color Palettes */}
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Palette size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Color Palette
            </h3>
            <p className="text-xs text-slate-500">Your core color themes for overlays and banners.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {["#C8FF00", "#111111", "#F3F4F6", "#EC4899"].map((color) => (
              <div key={color} className="flex flex-col items-center gap-1.5">
                <div
                  className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] font-bold text-slate-550 dark:text-slate-400 tabular-nums">{color}</span>
              </div>
            ))}
            
            <button
              type="button"
              className="h-12 w-12 rounded-xl border border-dashed border-slate-200 hover:border-slate-400 dark:border-slate-800 dark:hover:border-slate-600 flex items-center justify-center text-slate-400 hover:text-slate-600 transition"
              aria-label="Add Color"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Right 2 cols: Uploaded Assets & Logo templates */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Layers size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Brand Assets
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Watermark logos, background templates, and recurring layouts.</p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8FF00] px-3.5 py-2 text-xs font-bold text-black hover:bg-[#d4ff33] transition"
            >
              <Plus size={14} />
              Upload Asset
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 aspect-square flex flex-col items-center justify-center text-slate-400 gap-1 p-4 text-center">
              <Image size={24} strokeWidth={1.5} className="text-slate-300 dark:text-slate-700" />
              <span className="text-[10px] font-bold">Logo (White)</span>
              <span className="text-[8px] text-slate-400">PNG · 512x512</span>
            </div>
          </div>
        </div>

      </div>
    </DashboardPageShell>
  );
}
