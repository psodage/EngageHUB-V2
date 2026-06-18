import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { getSocialAccounts } from "../services/socialApi";
import { SOCIAL_PLATFORM_CONFIGS } from "../data/socialPlatforms";
import { createEmptyChannelDraft } from "../data/platformComposerConfig";
import ChannelPickerStep from "../components/create-post/ChannelPickerStep";
import SchedulePostWorkspace from "../components/create-post/SchedulePostWorkspace";
import {
  buildConnectedByChannelKey,
  mapAccountsToCreatePostChannelOptions,
  parseCreatePostChannelKey,
} from "../utils/createPostChannels";

export default function SchedulePostPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [step, setStep] = useState("pick");
  const [selectedChannelKeys, setSelectedChannelKeys] = useState([]);
  const [drafts, setDrafts] = useState({});

  const scopedPlatformKey = useMemo(() => {
    const raw = searchParams.get("platform")?.trim() || "";
    if (!raw) return null;
    return SOCIAL_PLATFORM_CONFIGS.some((c) => c.key === raw) ? raw : null;
  }, [searchParams]);

  const scopedEntityId = useMemo(
    () => searchParams.get("entity")?.trim() || searchParams.get("entityId")?.trim() || "",
    [searchParams]
  );

  useEffect(() => {
    getSocialAccounts()
      .then(setConnectedAccounts)
      .catch(() => setConnectedAccounts([]));
  }, []);

  const connectedByPlatform = useMemo(
    () => connectedAccounts.reduce((acc, item) => ({ ...acc, [item.platform]: item }), {}),
    [connectedAccounts]
  );

  const channelOptions = useMemo(
    () => mapAccountsToCreatePostChannelOptions(connectedAccounts),
    [connectedAccounts]
  );

  const connectedByChannel = useMemo(
    () => buildConnectedByChannelKey(connectedAccounts),
    [connectedAccounts]
  );

  useEffect(() => {
    if (!scopedPlatformKey) return;
    if (!connectedByPlatform[scopedPlatformKey]?.isConnected) return;

    let keys = [scopedPlatformKey];

    if (scopedPlatformKey === "facebook" || scopedPlatformKey === "linkedin") {
      const platformChannelKeys = channelOptions
        .filter((o) => o.platformKey === scopedPlatformKey)
        .map((o) => o.key);
      if (scopedEntityId) {
        const match = platformChannelKeys.find(
          (key) => parseCreatePostChannelKey(key).entityId === scopedEntityId
        );
        if (!match) return;
        keys = [match];
      } else if (scopedPlatformKey === "linkedin") {
        const profileKey = platformChannelKeys.find(
          (key) => parseCreatePostChannelKey(key).entityType === "profile"
        );
        keys = profileKey ? [profileKey] : platformChannelKeys.slice(0, 1);
      } else if (scopedPlatformKey === "facebook") {
        keys = platformChannelKeys.length ? [platformChannelKeys[0]] : [];
        if (!keys.length) return;
      }
    }

    setSelectedChannelKeys(keys);
    const nextDrafts = {};
    const initialCaption = location.state?.caption || searchParams.get("caption") || "";
    keys.forEach((key) => {
      const draft = createEmptyChannelDraft(key);
      if (initialCaption) draft.caption = initialCaption;
      nextDrafts[key] = draft;
    });
    setDrafts(nextDrafts);
    setStep("compose");
  }, [scopedPlatformKey, scopedEntityId, connectedByPlatform, channelOptions, location.state, searchParams]);

  const toggleChannel = useCallback((key) => {
    setSelectedChannelKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const selectAllChannels = useCallback(() => {
    setSelectedChannelKeys(channelOptions.map((c) => c.key));
  }, [channelOptions]);

  const clearAllChannels = useCallback(() => {
    setSelectedChannelKeys([]);
  }, []);

  const startCompose = useCallback(() => {
    const nextDrafts = {};
    const initialCaption = location.state?.caption || searchParams.get("caption") || "";
    selectedChannelKeys.forEach((key) => {
      const draft = drafts[key] || createEmptyChannelDraft(key);
      if (!draft.caption && initialCaption) draft.caption = initialCaption;
      nextDrafts[key] = draft;
    });
    setDrafts(nextDrafts);
    setStep("compose");
  }, [selectedChannelKeys, drafts, location.state, searchParams]);

  const onSetDrafts = useCallback((nextDrafts) => {
    setDrafts(nextDrafts);
  }, []);

  const handleBack = useCallback(() => {
    if (scopedPlatformKey) {
      const entity = scopedEntityId ? `?entity=${encodeURIComponent(scopedEntityId)}` : "";
      navigate(`/channels/${scopedPlatformKey}${entity}`);
      return;
    }
    if (step === "compose") {
      setStep("pick");
      return;
    }
    navigate("/schedule");
  }, [scopedPlatformKey, scopedEntityId, step, navigate]);

  useEffect(() => {
    if (step === "compose" && selectedChannelKeys.length === 0) {
      setStep("pick");
    }
  }, [step, selectedChannelKeys.length]);

  const isComposeStep = step === "compose" && selectedChannelKeys.length > 0;

  let content;
  if (!channelOptions.length) {
    content = (
      <section className="buffer-card mx-auto max-w-lg p-6">
        <p className="font-semibold text-slate-900 dark:text-white">No connected platforms</p>
        <p className="mt-1 text-sm text-slate-500">Connect at least one channel to schedule posts.</p>
        <button
          type="button"
          onClick={() => navigate("/channels")}
          className="mt-4 rounded-lg bg-buffer-600 px-4 py-2 text-sm font-semibold text-black hover:bg-[#d4ff33]"
        >
          Connect channels
        </button>
      </section>
    );
  } else if (isComposeStep) {
    content = (
      <SchedulePostWorkspace
        selectedChannelKeys={selectedChannelKeys}
        connectedByPlatform={connectedByChannel}
        drafts={drafts}
        onSetDrafts={onSetDrafts}
        onBack={handleBack}
      />
    );
  } else {
    content = (
      <ChannelPickerStep
        title="Schedule post"
        subtitle="Select channels, add your content, and choose when it goes live."
        maxWidthClass={selectedChannelKeys.length ? "max-w-[88rem]" : "max-w-4xl"}
        connectedPlatformConfigs={channelOptions}
        selectedKeys={selectedChannelKeys}
        onToggle={toggleChannel}
        onSelectAll={selectAllChannels}
        onClearAll={clearAllChannels}
        onContinue={startCompose}
        continueLabel="Continue to schedule"
      />
    );
  }

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col ${
        isComposeStep ? "overflow-y-auto lg:overflow-hidden" : "overflow-y-auto overflow-x-hidden overscroll-contain"
      }`}
    >
      {content}
    </div>
  );
}
