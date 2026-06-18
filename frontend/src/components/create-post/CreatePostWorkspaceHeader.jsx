import {
  ChevronDown,
  Eye,
  FileText,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  Tag,
  X,
} from "lucide-react";
import SelectedChannelsRow from "./SelectedChannelsRow";
import { SOCIAL_PLATFORM_CONFIGS } from "../../data/socialPlatforms";
import { WORKSPACE_GRID_COLS } from "./workspaceLayout";

const ACTIVE =
  "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white font-bold";
const PREVIEW_ACTIVE =
  "border-[#C8FF00]/40 bg-[#C8FF00]/10 text-slate-950 dark:border-[#C8FF00]/30 dark:bg-[#C8FF00]/5 dark:text-[#C8FF00] font-bold";

function HeaderAction({ icon: Icon, label, onClick, isActive = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold transition ${
        isActive
          ? ACTIVE
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-950 dark:text-slate-350 dark:hover:bg-slate-800/60 dark:hover:text-white"
      }`}
    >
      {Icon ? <Icon size={15} strokeWidth={2} /> : null}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function CreatePostWorkspaceHeader({
  title = "Create post",
  selectedChannelKeys,
  connectedByPlatform,
  onBack,
  isFullscreen,
  onToggleFullscreen,
  previewPanelMode = "previews",
  activePreviewChannelKey,
  onSelectPreviewChannel,
  onTemplatesClick,
  onAiAssistantClick,
  onPreviewClick,
}) {
  const activePreviewLabel =
    SOCIAL_PLATFORM_CONFIGS.find((c) => c.key === activePreviewChannelKey)?.label || "Post Previews";
  return (
    <header className="shrink-0 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="truncate text-base font-bold tracking-tight text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-700"
          >
            <Tag size={13} strokeWidth={2.25} />
            Tags
            <ChevronDown size={12} className="text-slate-400" />
          </button>
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5">
          <HeaderAction
            icon={FileText}
            label="Templates"
            onClick={onTemplatesClick}
            isActive={previewPanelMode === "templates"}
          />
          <HeaderAction
            icon={Sparkles}
            label="AI Assistant"
            onClick={onAiAssistantClick}
            isActive={previewPanelMode === "ai"}
          />
          <button
            type="button"
            onClick={onPreviewClick}
            className={`mx-0.5 inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-2 text-xs font-bold transition ${
              previewPanelMode === "previews"
                ? PREVIEW_ACTIVE
                : "border-transparent text-slate-600 hover:bg-slate-50 dark:text-slate-350 dark:hover:bg-slate-800/60"
            }`}
          >
            <Eye size={15} strokeWidth={2} />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-850 dark:hover:bg-slate-800/60 dark:hover:text-slate-205"
            aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-850 dark:hover:bg-slate-800/60 dark:hover:text-slate-205"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <div className={`grid border-t border-slate-200 dark:border-slate-800 ${WORKSPACE_GRID_COLS}`}>
        <SelectedChannelsRow
          variant="header"
          selectedChannelKeys={selectedChannelKeys}
          connectedByPlatform={connectedByPlatform}
          activeChannelKey={activePreviewChannelKey}
          onSelectChannel={onSelectPreviewChannel}
        />
        <div className="flex items-center gap-2 border-l border-slate-200 bg-slate-50/50 px-5 py-3 dark:border-slate-800 dark:bg-slate-950/20">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">{activePreviewLabel}</h3>
          <Info
            size={13}
            className="text-slate-400"
            title="Approximate layout on each platform"
            aria-label="Preview info"
          />
        </div>
      </div>
    </header>
  );
}
