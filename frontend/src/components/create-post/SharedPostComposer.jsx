import { useRef } from "react";
import { useObjectUrl } from "../../utils/useObjectUrl";
import { useUrlMediaSuggestions } from "../../hooks/useUrlMediaSuggestions";
import { ChevronDown, Hash, ImagePlus, Plus, Smile } from "lucide-react";
import SuggestedMediaStrip from "./SuggestedMediaStrip";

export default function SharedPostComposer({
  caption,
  file,
  mediaUrl = "",
  captionLimit,
  linkedInMediaImporting = false,
  onCaptionChange,
  onFileChange,
  onSuggestedImageSelect,
  onClearSuggestedMedia,
}) {
  const fileInputRef = useRef(null);
  const previewUrl = useObjectUrl(file);
  const { images, loading, error, visible, dismiss } = useUrlMediaSuggestions(caption);

  const showSuggestions = visible && !file;
  const suggestedPreviewUrl = !file && mediaUrl ? mediaUrl : null;

  const handleRemoveMedia = () => {
    onFileChange(null);
    if (suggestedPreviewUrl) onClearSuggestedMedia?.();
  };

  return (
    <article className="rounded-2xl border border-slate-200/60 bg-white dark:border-slate-850/60 dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-5">
        <textarea
          rows={8}
          maxLength={captionLimit}
          value={caption}
          onChange={(e) => onCaptionChange(e.target.value)}
          placeholder="Start writing or get inspired with Templates..."
          className="w-full resize-none border-0 bg-transparent px-0 py-0 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-white leading-relaxed"
        />

        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            className="flex h-[96px] w-[96px] shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 text-center transition duration-200 hover:border-[#C8FF00] hover:bg-[#C8FF00]/5 dark:border-slate-800 dark:bg-slate-950/50"
          >
            {previewUrl && file ? (
              file.type?.startsWith("video/") ? (
                <video src={previewUrl} className="h-full w-full rounded-lg object-cover" muted />
              ) : (
                <img src={previewUrl} alt="" className="h-full w-full rounded-lg object-cover" />
              )
            ) : suggestedPreviewUrl ? (
              <img src={suggestedPreviewUrl} alt="" className="h-full w-full rounded-lg object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center p-2">
                <ImagePlus size={20} className="text-slate-400 group-hover:text-slate-500" />
                <p className="mt-1 px-1 text-[9px] font-bold text-slate-400 leading-tight">Add Media</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
            />
          </div>

          {file || suggestedPreviewUrl ? (
            <button
              type="button"
              onClick={handleRemoveMedia}
              className="text-xs font-bold text-red-500 hover:text-red-650 dark:hover:text-red-400/90 mb-1"
            >
              Remove Media
            </button>
          ) : null}
        </div>

        {linkedInMediaImporting ? (
          <p
            role="status"
            className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
          >
            Importing image for posting…
          </p>
        ) : null}

        {showSuggestions ? (
          <SuggestedMediaStrip
            images={images}
            loading={loading}
            error={error}
            selectedUrl={mediaUrl}
            onSelect={onSuggestedImageSelect}
            onDismiss={dismiss}
          />
        ) : null}

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5 text-slate-400">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              aria-label="Add media"
            >
              <Plus size={16} />
            </button>
            <button type="button" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition" aria-label="More options">
              <ChevronDown size={16} />
            </button>
            <button type="button" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition" aria-label="Add emoji">
              <Smile size={16} />
            </button>
            <button type="button" className="rounded-lg p-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition" aria-label="Hashtag">
              <Hash size={16} />
            </button>
          </div>
          <span className="text-xs font-semibold text-slate-400">
            {caption.length} / {captionLimit}
          </span>
        </div>
      </div>
    </article>
  );
}
