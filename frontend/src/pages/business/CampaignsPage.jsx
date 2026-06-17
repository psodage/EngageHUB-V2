import { useEffect, useState } from "react";
import DashboardPageShell from "../../components/layout/DashboardPageShell";
import { 
  Layers, 
  Plus, 
  Calendar, 
  Trash2, 
  Edit, 
  ChevronRight, 
  Clock, 
  FolderOpen, 
  Share2, 
  ArrowLeft, 
  AlertCircle,
  FileText,
  CheckCircle2,
  X
} from "lucide-react";
import { 
  listCampaigns, 
  createCampaign, 
  getCampaign, 
  updateCampaign, 
  deleteCampaign 
} from "../../services/campaignApi";
import { useApp } from "../../context/AppContext";

export default function CampaignsPage() {
  const { setToast } = useApp();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Detail View State
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [color, setColor] = useState("#C8FF00");
  const [status, setStatus] = useState("active");

  const colors = [
    { value: "#C8FF00", label: "Neon Lime" },
    { value: "#3B82F6", label: "Blue" },
    { value: "#EC4899", label: "Pink" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#10B981", label: "Emerald" },
    { value: "#F59E0B", label: "Amber" }
  ];

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await listCampaigns();
      setCampaigns(data);
    } catch (err) {
      setToast({ message: err.message || "Failed to load campaigns.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      setDetailLoading(true);
      const data = await getCampaign(id);
      setCampaignDetail(data);
    } catch (err) {
      setToast({ message: err.message || "Failed to load campaign details.", error: true });
      setSelectedCampaignId(null);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchDetail(selectedCampaignId);
    } else {
      setCampaignDetail(null);
    }
  }, [selectedCampaignId]);

  const handleOpenCreateModal = () => {
    setEditingCampaign(null);
    setName("");
    setDescription("");
    setStartDate("");
    setEndDate("");
    setColor("#C8FF00");
    setStatus("active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (camp) => {
    setEditingCampaign(camp);
    setName(camp.name);
    setDescription(camp.description || "");
    setStartDate(camp.startDate ? new Date(camp.startDate).toISOString().split("T")[0] : "");
    setEndDate(camp.endDate ? new Date(camp.endDate).toISOString().split("T")[0] : "");
    setColor(camp.color || "#C8FF00");
    setStatus(camp.status || "active");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      setToast({ message: "Please fill in all required fields.", error: true });
      return;
    }

    try {
      const payload = { name, description, startDate, endDate, color, status };
      if (editingCampaign) {
        await updateCampaign(editingCampaign._id, payload);
        setToast({ message: "Campaign updated successfully." });
        if (selectedCampaignId === editingCampaign._id) {
          fetchDetail(selectedCampaignId);
        }
      } else {
        await createCampaign(payload);
        setToast({ message: "Campaign created successfully." });
      }
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      setToast({ message: err.message || "Failed to save campaign.", error: true });
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign? Existing scheduled posts will remain but will be unlinked.")) return;
    try {
      await deleteCampaign(id);
      setToast({ message: "Campaign deleted successfully." });
      if (selectedCampaignId === id) {
        setSelectedCampaignId(null);
      }
      fetchCampaigns();
    } catch (err) {
      setToast({ message: err.message || "Failed to delete campaign.", error: true });
    }
  };

  // Status badge style helper
  const getStatusBadgeClass = (s) => {
    switch (s) {
      case "completed":
        return "bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400";
      case "draft":
        return "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400";
      default: // active
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <DashboardPageShell
      title={campaignDetail ? `Campaign: ${campaignDetail.campaign.name}` : "Campaign Management"}
      description={campaignDetail ? campaignDetail.campaign.description || "Campaign timeline and scheduled posts." : "Plan, launch, and schedule sequential campaigns for seasonal sales, launches, or promos."}
      actions={
        campaignDetail ? (
          <button
            type="button"
            onClick={() => setSelectedCampaignId(null)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-350 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft size={14} />
            Back to Campaigns
          </button>
        ) : (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8FF00] px-4 py-2 text-xs font-bold text-black hover:bg-[#d4ff33] transition"
          >
            <Plus size={14} />
            Create Campaign
          </button>
        )
      }
    >
      {selectedCampaignId && campaignDetail ? (
        /* ==================== CAMPAIGN DETAIL VIEW ==================== */
        <div className="flex flex-col gap-6">
          {/* Top Panel: Metadata details */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-12 rounded-lg" 
                style={{ backgroundColor: campaignDetail.campaign.color }} 
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Timeline</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${getStatusBadgeClass(campaignDetail.campaign.status)}`}>
                    {campaignDetail.campaign.status}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-850 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                  <Calendar size={13} className="text-slate-400" />
                  {formatDate(campaignDetail.campaign.startDate)} — {formatDate(campaignDetail.campaign.endDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleOpenEditModal(campaignDetail.campaign)}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 dark:border-slate-850 dark:bg-slate-950 dark:hover:bg-slate-850 dark:text-slate-400 transition"
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCampaign(campaignDetail.campaign._id)}
                className="p-2 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-750 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {/* Main section: Sequential Posts */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col gap-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Sequential Scheduled Series
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Posts under this campaign, sorted in publishing order.</p>
            </div>

            {detailLoading ? (
              <div className="py-12 flex justify-center text-slate-400 text-xs">Loading posts...</div>
            ) : campaignDetail.posts.length === 0 ? (
              <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-16 flex flex-col items-center justify-center text-slate-400 gap-2">
                <FileText size={32} strokeWidth={1.5} className="text-slate-350 dark:text-slate-650" />
                <span className="text-xs font-semibold">No posts in this campaign yet</span>
                <p className="text-[10px] text-slate-400 max-w-xs text-center">To link posts to this campaign, select this campaign name when composing a post inside the Content Planner.</p>
              </div>
            ) : (
              <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
                {campaignDetail.posts.map((post, idx) => (
                  <div key={post._id} className="relative group">
                    {/* Circle Indicator on the left line */}
                    <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-300 dark:border-slate-900 dark:bg-slate-700 group-hover:bg-[#C8FF00] transition" />
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-950/30 hover:shadow-card transition duration-150">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-extrabold text-[#82a800] dark:text-[#C8FF00] uppercase tracking-wider">Step {idx + 1}</span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            post.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-450" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-450"
                          }`}>
                            {post.status}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200 truncate">{post.title || post.caption || "Untitled Post"}</h4>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(post.scheduledAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                        </p>
                      </div>

                      {/* Display channels list */}
                      <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-lg p-1.5">
                        <Share2 size={11} className="text-slate-400 mx-1 shrink-0" />
                        <div className="flex -space-x-1 overflow-hidden">
                          {post.channelKeys?.map((key) => (
                            <span 
                              key={key} 
                              className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-55/60 dark:bg-slate-800 border border-white dark:border-slate-900 rounded capitalize"
                            >
                              {key}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==================== LIST CAMPAIGNS VIEW ==================== */
        <div>
          {loading ? (
            <div className="py-16 flex justify-center text-slate-400 text-xs">Loading campaigns...</div>
          ) : campaigns.length === 0 ? (
            <div className="rounded-2xl border border-slate-200/60 bg-white p-12 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm flex flex-col items-center justify-center text-slate-400 gap-3">
              <Layers size={36} strokeWidth={1.5} className="text-slate-350 dark:text-slate-650 animate-pulse" />
              <span className="text-xs font-semibold">No Campaigns Created</span>
              <p className="text-[10px] text-slate-400 max-w-xs text-center">Plan sequences of social posts for product releases, festival sales, and campaign ROI.</p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-2 inline-flex items-center gap-1 px-4 py-2 rounded-xl bg-[#C8FF00] text-xs font-bold text-black hover:bg-[#d4ff33] transition shadow-sm"
              >
                <Plus size={13} />
                New Campaign
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((camp) => (
                <div 
                  key={camp._id} 
                  className="rounded-2xl border border-slate-200/60 bg-white p-5 dark:border-slate-800/80 dark:bg-slate-900 shadow-sm hover:shadow-card hover:-translate-y-0.5 transition duration-200 flex flex-col justify-between gap-5 relative group"
                >
                  {/* Color strip */}
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl" 
                    style={{ backgroundColor: camp.color || "#C8FF00" }} 
                  />

                  <div className="pl-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded capitalize ${getStatusBadgeClass(camp.status)}`}>
                        {camp.status}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400">{camp.postCount} post{camp.postCount === 1 ? "" : "s"}</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 truncate group-hover:text-[#82a800] dark:group-hover:text-[#C8FF00] transition">{camp.name}</h4>
                    <p className="text-[11px] text-slate-405 dark:text-slate-400 line-clamp-2 leading-relaxed">{camp.description || "No description provided."}</p>
                  </div>

                  <div className="pl-2 border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between">
                    <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar size={11} />
                      {formatDate(camp.startDate)}
                    </p>
                    
                    <button
                      type="button"
                      onClick={() => setSelectedCampaignId(camp._id)}
                      className="inline-flex items-center gap-0.5 text-xs font-bold text-[#82a800] dark:text-[#C8FF00] hover:underline"
                    >
                      View Timeline
                      <ChevronRight size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ==================== CREATE / EDIT MODAL ==================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-[1.5px]">
          <form 
            onSubmit={handleSave}
            className="w-full max-w-md bg-white dark:bg-[#111] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingCampaign ? "Edit Campaign" : "Create New Campaign"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 rounded-lg transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Campaign Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="E.g., Summer Sneakers Launch 2026"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Goals, targets, or links for this campaign series..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">End Date *</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-sans">Campaign Tag Color</label>
                <div className="flex gap-2.5">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`h-7 w-7 rounded-full border transition flex items-center justify-center shrink-0 ${
                        color === c.value 
                          ? "border-slate-600 dark:border-white scale-110 shadow-sm" 
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.label}
                    >
                      {color === c.value && (
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-900 dark:bg-slate-900" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {editingCampaign && (
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#C8FF00] text-xs font-bold text-black hover:bg-[#d4ff33] transition"
              >
                {editingCampaign ? "Save Changes" : "Create"}
              </button>
            </div>
          </form>
        </div>
      )}
    </DashboardPageShell>
  );
}
