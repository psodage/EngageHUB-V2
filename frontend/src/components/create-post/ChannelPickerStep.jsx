import { Check } from "lucide-react";
import PlatformBrandIcon from "../channels/PlatformBrandIcon";
import { getPlatformKeyFromCreatePostChannelKey } from "../../utils/createPostChannels";

function profilePlaceholder(displayName, platformName) {
  const initial = (displayName?.[0] || platformName?.[0] || "?").toUpperCase();
  return `https://placehold.co/96x96/e2e8f0/64748b?text=${encodeURIComponent(initial)}`;
}

function ChannelPickerCard({ option, isSelected, onToggle }) {
  const platformKey = option.platformKey || getPlatformKeyFromCreatePostChannelKey(option.key);
  const platformName = option.platformName || option.label;
  const username = option.username || option.accountDisplayName || option.label || "";
  const accountTypeLabel = option.accountTypeLabel || "";
  const disabled = Boolean(option.publishDisabled);
  const disabledReason = option.publishDisabledReason || "";
  const profileSrc =
    option.profileImage || profilePlaceholder(option.accountDisplayName || username, platformName);

  return (
    <button
      type="button"
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      onClick={() => !disabled && onToggle(option.key)}
      className={`flex w-full items-center gap-4.5 p-4 rounded-2xl border bg-white dark:bg-slate-900 text-left transition duration-200 shadow-sm focus:outline-none ${
        disabled
          ? "cursor-not-allowed opacity-50 border-slate-200 dark:border-slate-800"
          : isSelected
            ? "border-[#C8FF00] ring-2 ring-[#C8FF00]/10 dark:border-[#C8FF00]/50 dark:ring-[#C8FF00]/5"
            : "border-slate-200/70 hover:border-slate-350 dark:border-slate-800 dark:hover:border-slate-700"
      }`}
    >
      <span className="relative shrink-0">
        <img src={profileSrc} alt="" className="h-12 w-12 rounded-xl object-cover border border-slate-100 dark:border-slate-800" />
        <span className="absolute -bottom-1 -right-1 shadow-sm">
          <PlatformBrandIcon
            platformKey={platformKey}
            size="sm"
            className="!h-[18px] !w-[18px] !rounded-md [&_svg]:!h-2.5 [&_svg]:!w-2.5 ring-2 ring-white dark:ring-slate-900"
          />
        </span>
      </span>

      <span className="min-w-0 flex-1">
        <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{username}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{platformName}</p>
        {accountTypeLabel ? (
          <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{accountTypeLabel}</p>
        ) : null}
        {disabled && disabledReason ? (
          <p className="mt-1 text-[9px] leading-snug text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md border border-amber-100 dark:border-amber-900/30">{disabledReason}</p>
        ) : null}
      </span>

      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition duration-150 ${
          isSelected 
            ? "border-[#C8FF00] bg-[#C8FF00] text-black shadow-sm" 
            : "border-slate-300 dark:border-slate-700"
        }`}
        aria-hidden
      >
        {isSelected ? <Check size={11} strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

export default function ChannelPickerStep({
  title = "Create post",
  subtitle = "Select channels and compose content to publish now.",
  maxWidthClass,
  continueLabel = "Continue",
  connectedPlatformConfigs,
  selectedKeys,
  onToggle,
  onSelectAll,
  onClearAll,
  onContinue,
}) {
  const canContinue = selectedKeys.length > 0;
  const allSelected = connectedPlatformConfigs.length > 0 && selectedKeys.length === connectedPlatformConfigs.length;
  const widthClass = maxWidthClass || "max-w-4xl";

  return (
    <section className={`mx-auto space-y-6 ${widthClass} py-4`}>
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> {title}
          </h2>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-850 h-fit self-start sm:self-center">
          <button
            type="button"
            onClick={onSelectAll}
            disabled={allSelected}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 disabled:opacity-40 dark:text-slate-400 dark:hover:text-slate-200 transition"
          >
            Select all
          </button>
          <span className="text-slate-200 dark:text-slate-800">|</span>
          <button
            type="button"
            onClick={onClearAll}
            disabled={!selectedKeys.length}
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-700 disabled:opacity-40 dark:text-slate-500 dark:hover:text-slate-350 transition"
          >
            Clear
          </button>
        </div>
      </header>

      <div>
        <div className="grid gap-4 sm:grid-cols-2">
          {connectedPlatformConfigs.map((option) => (
            <ChannelPickerCard
              key={option.key}
              option={option}
              isSelected={selectedKeys.includes(option.key)}
              onToggle={onToggle}
            />
          ))}
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            disabled={!canContinue}
            onClick={onContinue}
            className="rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] px-6 py-3 text-xs font-bold text-black shadow-sm transition duration-150 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:bg-[#C8FF00] flex items-center gap-1.5"
          >
            {continueLabel} ({selectedKeys.length} channel{selectedKeys.length === 1 ? "" : "s"})
          </button>
        </div>
      </div>
    </section>
  );
}
