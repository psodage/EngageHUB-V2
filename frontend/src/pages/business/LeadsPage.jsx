import { useState, useEffect, useMemo, useRef } from "react";
import DashboardPageShell from "../../components/layout/DashboardPageShell";
import {
  Inbox,
  MessageSquare,
  Bot,
  Trash2,
  Send,
  User,
  Plus,
  Play,
  Check,
  TrendingUp,
  Notebook,
  Sparkles,
  Search,
  Filter,
  UserCheck,
  ToggleLeft,
  ToggleRight,
  FileText,
  Clock
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { PLATFORM_BRAND_ICONS, PLATFORM_BRAND_BG } from "../../data/platformBrandIcons";
import {
  listLeads,
  getLead,
  updateLeadStatus,
  updateLeadNotes,
  sendLeadMessage,
  deleteLead,
  listAutoReplyRules,
  createAutoReplyRule,
  updateAutoReplyRule,
  deleteAutoReplyRule,
  simulateIncomingLeadEvent
} from "../../services/leadApi";

export default function LeadsPage() {
  const { setToast } = useApp();
  const [activeTab, setActiveTab] = useState("inbox"); // 'inbox', 'crm', 'rules'
  
  // Leads & Rules state
  const [leads, setLeads] = useState([]);
  const [rules, setRules] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [loadingRules, setLoadingRules] = useState(false);

  // New message input
  const [messageText, setMessageText] = useState("");
  
  // CRM Notes state
  const [crmNotes, setCrmNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Auto-Reply Form state
  const [showAddRuleForm, setShowAddRuleForm] = useState(false);
  const [newRuleName, setNewRuleName] = useState("");
  const [newRuleKeyword, setNewRuleKeyword] = useState("");
  const [newRuleReplyText, setNewRuleReplyText] = useState("");
  const [creatingRule, setCreatingRule] = useState(false);

  // Sandbox Simulator state
  const [simPlatform, setSimPlatform] = useState("instagram");
  const [simName, setSimName] = useState("Jane Miller");
  const [simUsername, setSimUsername] = useState("janemiller_design");
  const [simText, setSimText] = useState("Hey there! How much does your social plan cost?");
  const [simulating, setSimulating] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const chatEndRef = useRef(null);

  // Fetch leads
  const fetchLeads = async (selectFirst = false) => {
    setLoadingLeads(true);
    try {
      const data = await listLeads();
      setLeads(data);
      if (selectFirst && data.length > 0 && !selectedLeadId) {
        setSelectedLeadId(data[0]._id);
      }
    } catch (err) {
      setToast({ message: err.message || "Failed to load leads.", error: true });
    } finally {
      setLoadingLeads(false);
    }
  };

  // Fetch rules
  const fetchRules = async () => {
    setLoadingRules(true);
    try {
      const data = await listAutoReplyRules();
      setRules(data);
    } catch (err) {
      setToast({ message: err.message || "Failed to load auto-reply rules.", error: true });
    } finally {
      setLoadingRules(false);
    }
  };

  // Fetch single lead details (useful for conversation history)
  const fetchLeadDetails = async (id) => {
    try {
      const data = await getLead(id);
      setSelectedLead(data);
      setCrmNotes(data.notes || "");
    } catch (err) {
      setToast({ message: err.message || "Failed to load lead details.", error: true });
    }
  };

  useEffect(() => {
    fetchLeads(true);
    fetchRules();
  }, []);

  useEffect(() => {
    if (selectedLeadId) {
      fetchLeadDetails(selectedLeadId);
    } else {
      setSelectedLead(null);
      setCrmNotes("");
    }
  }, [selectedLeadId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedLead?.messages]);

  // Send message manual
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !selectedLeadId) return;

    try {
      const updated = await sendLeadMessage(selectedLeadId, messageText);
      setSelectedLead(updated);
      setMessageText("");
      // Update in local list
      setLeads(leads.map(l => l._id === updated._id ? updated : l));
    } catch (err) {
      setToast({ message: err.message || "Failed to send message.", error: true });
    }
  };

  // Save CRM Notes
  const handleSaveNotes = async () => {
    if (!selectedLeadId) return;
    setSavingNotes(true);
    try {
      const updated = await updateLeadNotes(selectedLeadId, crmNotes);
      setSelectedLead(updated);
      setLeads(leads.map(l => l._id === updated._id ? updated : l));
      setToast({ message: "CRM notes saved successfully." });
    } catch (err) {
      setToast({ message: err.message || "Failed to save notes.", error: true });
    } finally {
      setSavingNotes(false);
    }
  };

  // Change lead status
  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await updateLeadStatus(id, newStatus);
      if (id === selectedLeadId) {
        setSelectedLead(updated);
      }
      setLeads(leads.map(l => l._id === updated._id ? updated : l));
      setToast({ message: `Status updated to ${newStatus.toUpperCase()}.` });
    } catch (err) {
      setToast({ message: err.message || "Failed to update status.", error: true });
    }
  };

  // Delete lead
  const handleDeleteLead = async (id) => {
    if (!window.confirm("Are you sure you want to delete this contact and all message history?")) return;
    try {
      await deleteLead(id);
      setLeads(leads.filter(l => l._id !== id));
      if (id === selectedLeadId) {
        setSelectedLeadId(null);
        setSelectedLead(null);
      }
      setToast({ message: "Lead removed successfully." });
    } catch (err) {
      setToast({ message: err.message || "Failed to delete lead.", error: true });
    }
  };

  // Create rule
  const handleCreateRule = async (e) => {
    e.preventDefault();
    if (!newRuleName.trim() || !newRuleKeyword.trim() || !newRuleReplyText.trim()) {
      setToast({ message: "Please fill out all fields.", error: true });
      return;
    }

    setCreatingRule(true);
    try {
      const created = await createAutoReplyRule({
        name: newRuleName.trim(),
        keyword: newRuleKeyword.trim(),
        replyText: newRuleReplyText.trim()
      });
      setRules([created, ...rules]);
      setNewRuleName("");
      setNewRuleKeyword("");
      setNewRuleReplyText("");
      setShowAddRuleForm(false);
      setToast({ message: "Auto-reply rule created successfully." });
    } catch (err) {
      setToast({ message: err.message || "Failed to create rule.", error: true });
    } finally {
      setCreatingRule(false);
    }
  };

  // Toggle rule status
  const handleToggleRule = async (rule) => {
    try {
      const updated = await updateAutoReplyRule(rule._id, { isActive: !rule.isActive });
      setRules(rules.map(r => r._id === rule._id ? updated : r));
      setToast({ message: `Rule "${rule.name}" is now ${updated.isActive ? "active" : "inactive"}.` });
    } catch (err) {
      setToast({ message: err.message || "Failed to update rule.", error: true });
    }
  };

  // Delete rule
  const handleDeleteRule = async (id) => {
    if (!window.confirm("Delete this auto-reply rule?")) return;
    try {
      await deleteAutoReplyRule(id);
      setRules(rules.filter(r => r._id !== id));
      setToast({ message: "Rule deleted successfully." });
    } catch (err) {
      setToast({ message: err.message || "Failed to delete rule.", error: true });
    }
  };

  // Run Sandbox Simulation
  const handleSimulateEvent = async (e) => {
    e.preventDefault();
    if (!simName.trim() || !simUsername.trim() || !simText.trim()) {
      setToast({ message: "Simulator requires name, username, and message text.", error: true });
      return;
    }

    setSimulating(true);
    try {
      const result = await simulateIncomingLeadEvent({
        platform: simPlatform,
        contactName: simName.trim(),
        contactUsername: simUsername.trim(),
        text: simText.trim()
      });

      // Reload leads and select the updated lead
      await fetchLeads();
      setSelectedLeadId(result.lead._id);
      fetchLeadDetails(result.lead._id);

      if (result.autoReplied) {
        setToast({ message: `Simulated DM received! Auto-reply rule "${result.ruleName}" was triggered.`, error: false });
      } else {
        setToast({ message: `Simulated DM received in Inbox (no keyword rule matched).` });
      }

      setSimText(""); // Clear simulator text for next test
    } catch (err) {
      setToast({ message: err.message || "Simulation failed.", error: true });
    } finally {
      setSimulating(false);
    }
  };

  // Filter and search logic for Inbox / CRM
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const matchesSearch =
        lead.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.contactUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lead.messages && lead.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesPlatform = filterPlatform === "all" || lead.platform === filterPlatform;
      const matchesStatus = filterStatus === "all" || lead.status === filterStatus;

      return matchesSearch && matchesPlatform && matchesStatus;
    });
  }, [leads, searchQuery, filterPlatform, filterStatus]);

  // CRM Kanban board columns sorting
  const crmColumns = useMemo(() => {
    const columns = {
      new: [],
      contacted: [],
      qualified: [],
      closed: []
    };
    leads.forEach(lead => {
      if (columns[lead.status]) {
        columns[lead.status].push(lead);
      }
    });
    return columns;
  }, [leads]);

  // Helpers to render status badges
  const getStatusBadge = (status) => {
    const styles = {
      new: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
      contacted: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
      qualified: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
      closed: "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-900/40 dark:text-slate-400 dark:border-slate-800"
    };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${styles[status] || ""}`}>
        {status}
      </span>
    );
  };

  return (
    <DashboardPageShell
      title="Lead & Inbox Management"
      description="Centralized lead collection from comments and messages with instant automated database responses."
    >
      {/* Upper Navigation Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("inbox")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition duration-150 ${
            activeTab === "inbox"
              ? "border-[#C8FF00] text-slate-950 dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Inbox size={16} />
          Unified Inbox
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("crm")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition duration-150 ${
            activeTab === "crm"
              ? "border-[#C8FF00] text-slate-950 dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <UserCheck size={16} />
          CRM Board
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition duration-150 ${
            activeTab === "rules"
              ? "border-[#C8FF00] text-slate-950 dark:text-white"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Bot size={16} />
          Auto-Replies & Sandbox
        </button>
      </div>

      {/* -------------------- INBOX TAB -------------------- */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-200/60 bg-white dark:border-slate-850/60 dark:bg-slate-900 shadow-sm overflow-hidden h-[680px]">
          {/* Thread list (3 cols) */}
          <div className="lg:col-span-4 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full bg-slate-50/30 dark:bg-slate-950/10">
            {/* Search and Filters */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col gap-3">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search inbox..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 text-xs rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#C8FF00]/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filterPlatform}
                  onChange={(e) => setFilterPlatform(e.target.value)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Channels</option>
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="x">X / Twitter</option>
                  <option value="googleBusiness">Google Business</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Leads list queue */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100/50 dark:divide-slate-800/40">
              {loadingLeads ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading queue...</div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <MessageSquare size={24} className="text-slate-300 dark:text-slate-700" />
                  <span>No message threads found</span>
                  <p className="text-[10px] text-slate-400 px-4">Use the Sandbox Simulator tab to trigger a mock DM or comment trigger.</p>
                </div>
              ) : (
                filteredLeads.map((lead) => {
                  const PlatformIcon = PLATFORM_BRAND_ICONS[lead.platform] || MessageSquare;
                  const lastMessage = lead.messages && lead.messages.length > 0 ? lead.messages[lead.messages.length - 1] : null;
                  const isSelected = lead._id === selectedLeadId;
                  
                  return (
                    <button
                      key={lead._id}
                      type="button"
                      onClick={() => setSelectedLeadId(lead._id)}
                      className={`w-full p-4 text-left flex items-start gap-3 transition-colors duration-150 border-l-2 focus:outline-none ${
                        isSelected 
                          ? "bg-slate-100/40 dark:bg-[#1a1a1a]/60 border-[#C8FF00]" 
                          : "border-transparent hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                      }`}
                    >
                      <div className="relative shrink-0 mt-0.5">
                        {lead.profileImage ? (
                          <img
                            src={lead.profileImage}
                            alt={lead.contactName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100 dark:border-slate-800 bg-slate-50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                            <User size={18} />
                          </div>
                        )}
                        <span className={`absolute -bottom-1.5 -right-1.5 p-1 rounded-full text-[9px] shadow-sm ${PLATFORM_BRAND_BG[lead.platform] || "bg-slate-500 text-white"}`}>
                          <PlatformIcon size={8} />
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {lead.contactName}
                          </h4>
                          <span className="text-[9px] text-slate-400 shrink-0">
                            {lead.updatedAt ? new Date(lead.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          @{lead.contactUsername}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                          {lastMessage ? (
                            <span className={lastMessage.sender === "business" ? "font-medium" : ""}>
                              {lastMessage.sender === "business" ? "You: " : ""}{lastMessage.text}
                            </span>
                          ) : (
                            <span className="italic text-slate-400">No messages yet</span>
                          )}
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          {getStatusBadge(lead.status)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Conversation Workspace (5 cols) */}
          <div className="lg:col-span-5 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900">
            {selectedLead ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/20 dark:bg-slate-950/5">
                  <div className="flex items-center gap-3">
                    {selectedLead.profileImage ? (
                      <img
                        src={selectedLead.profileImage}
                        alt={selectedLead.contactName}
                        className="w-9 h-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                        <User size={16} />
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {selectedLead.contactName}
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        @{selectedLead.contactUsername} • via {selectedLead.platform}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Status selection */}
                    <select
                      value={selectedLead.status}
                      onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 focus:outline-none uppercase"
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="closed">Closed</option>
                    </select>
                    
                    <button
                      type="button"
                      onClick={() => handleDeleteLead(selectedLead._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                      title="Delete conversation"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Chat Message Logs */}
                <div className="flex-1 p-4 overflow-y-auto bg-slate-50/20 dark:bg-slate-950/5 flex flex-col gap-4">
                  {selectedLead.messages && selectedLead.messages.length > 0 ? (
                    selectedLead.messages.map((msg, idx) => {
                      const isBiz = msg.sender === "business";
                      return (
                        <div
                          key={idx}
                          className={`flex flex-col max-w-[80%] ${isBiz ? "self-end items-end" : "self-start items-start"}`}
                        >
                          <div className={`rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed ${
                            isBiz 
                              ? "bg-slate-900 text-white dark:bg-slate-800 dark:text-white rounded-br-none" 
                              : "bg-[#C8FF00]/10 text-slate-800 dark:bg-[#C8FF00]/5 dark:text-slate-200 border border-[#C8FF00]/20 rounded-bl-none"
                          }`}>
                            {msg.text}
                          </div>
                          <span className="text-[9px] text-slate-400 mt-1 flex items-center gap-1 px-1">
                            <Clock size={8} /> {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
                      No messages in this chat.
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Response Area */}
                <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 items-center bg-white dark:bg-slate-900">
                  <input
                    type="text"
                    placeholder="Type a response to send..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    className="flex-1 px-4 py-2 text-xs border border-slate-200/80 rounded-xl bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#C8FF00]/50"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-[#C8FF00] hover:bg-[#d4ff33] text-black rounded-xl shadow-sm transition-colors duration-150 flex items-center justify-center"
                  >
                    <Send size={14} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <MessageSquare size={36} strokeWidth={1.5} className="text-slate-300 dark:text-slate-700" />
                <span className="text-xs font-semibold">Select a Conversation</span>
                <p className="text-[10px] text-slate-400 max-w-[200px] text-center">Click a thread on the left pane to view DM details and reply.</p>
              </div>
            )}
          </div>

          {/* CRM Info Column (3 cols) */}
          <div className="lg:col-span-3 border-r border-slate-100 dark:border-slate-800 flex flex-col h-full bg-slate-50/10 dark:bg-slate-950/5 p-4 gap-6">
            {selectedLead ? (
              <>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Notebook size={14} className="text-slate-500" /> Lead Details
                  </h4>
                  <div className="mt-3 space-y-2.5 text-xs">
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{selectedLead.contactName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                      <span className="text-slate-400">Username</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">@{selectedLead.contactUsername}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                      <span className="text-slate-400">Source Platform</span>
                      <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">{selectedLead.platform}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                      <span className="text-slate-400">Collected At</span>
                      <span className="text-[11px] text-slate-700 dark:text-slate-300">{new Date(selectedLead.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 flex flex-col gap-2 min-h-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText size={14} className="text-slate-500" /> CRM Customer Notes
                  </h4>
                  <textarea
                    placeholder="Add notes about this customer..."
                    value={crmNotes}
                    onChange={(e) => setCrmNotes(e.target.value)}
                    className="flex-1 w-full p-3 text-xs border border-slate-200/80 rounded-xl bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none resize-none"
                  />
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white py-2 text-xs font-semibold shadow-sm transition duration-150"
                  >
                    {savingNotes ? "Saving..." : "Save CRM Notes"}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-xs text-slate-400 text-center">
                CRM meta fields load once a chat is active.
              </div>
            )}
          </div>
        </div>
      )}

      {/* -------------------- CRM KANBAN BOARD TAB -------------------- */}
      {activeTab === "crm" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[650px]">
          {/* Loop over columns */}
          {["new", "contacted", "qualified", "closed"].map((colKey) => {
            const list = crmColumns[colKey] || [];
            const titles = {
              new: "New Lead",
              contacted: "Contacted",
              qualified: "Qualified",
              closed: "Closed / Won"
            };
            const borderColors = {
              new: "border-t-blue-500",
              contacted: "border-t-amber-500",
              qualified: "border-t-emerald-500",
              closed: "border-t-slate-400"
            };

            return (
              <div key={colKey} className="rounded-2xl border border-slate-200/60 bg-slate-50/50 p-4 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col h-full">
                <div className={`border-t-2 ${borderColors[colKey]} pt-3 pb-3 mb-2 flex justify-between items-center`}>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    {titles[colKey]}
                  </h3>
                  <span className="rounded-full bg-slate-200 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                    {list.length}
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                  {list.length === 0 ? (
                    <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-10 text-center text-[10px] text-slate-400">
                      Empty column
                    </div>
                  ) : (
                    list.map((lead) => {
                      const PlatformIcon = PLATFORM_BRAND_ICONS[lead.platform] || MessageSquare;
                      return (
                        <div
                          key={lead._id}
                          className="rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 p-3 shadow-xs hover:shadow-md transition duration-200 flex flex-col gap-2 relative group"
                        >
                          <div className="flex items-center gap-2.5">
                            {lead.profileImage ? (
                              <img
                                src={lead.profileImage}
                                alt={lead.contactName}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                                <User size={12} />
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                                {lead.contactName}
                              </h4>
                              <p className="text-[9px] text-slate-400 truncate">
                                @{lead.contactUsername}
                              </p>
                            </div>
                            <span className={`p-1 rounded-full text-[9px] ${PLATFORM_BRAND_BG[lead.platform] || "bg-slate-500 text-white"}`}>
                              <PlatformIcon size={8} />
                            </span>
                          </div>

                          {lead.notes ? (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 bg-slate-50/50 dark:bg-slate-900/50 p-1.5 rounded-lg border border-slate-100/40 dark:border-slate-800/40">
                              {lead.notes}
                            </p>
                          ) : (
                            <p className="text-[9px] text-slate-400 italic">No notes added</p>
                          )}

                          <div className="flex items-center justify-between border-t border-slate-100/50 dark:border-slate-800/40 pt-2 mt-1">
                            <span className="text-[9px] text-slate-400">
                              Updated {new Date(lead.updatedAt).toLocaleDateString()}
                            </span>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedLeadId(lead._id);
                                  setActiveTab("inbox");
                                }}
                                className="text-[9px] font-bold text-[#8aae00] dark:text-[#C8FF00] hover:underline"
                              >
                                Open DM
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* -------------------- AUTO-REPLIES & SANDBOX TAB -------------------- */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[680px]">
          {/* Rules settings */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col h-full gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Bot size={18} className="text-[#82a800] dark:text-[#C8FF00]" /> Instant Auto-Replies
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Define keyword replies automatically posted in DMs or Comments.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddRuleForm(!showAddRuleForm)}
                className="flex items-center gap-1.5 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black px-3.5 py-1.5 text-xs font-bold shadow-sm transition"
              >
                {showAddRuleForm ? "View Rules" : <><Plus size={14} /> New Rule</>}
              </button>
            </div>

            {showAddRuleForm ? (
              <form onSubmit={handleCreateRule} className="space-y-4 bg-slate-50/30 dark:bg-slate-950/10 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Configure Automation Rule</h4>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Price Catalog"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger Keyword</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. price (triggered if incoming contains this)"
                    value={newRuleKeyword}
                    onChange={(e) => setNewRuleKeyword(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Automatic Response Template</label>
                  <textarea
                    required
                    placeholder="e.g. Thanks for your interest! Check out our catalog here: https://engagehub.com/catalog"
                    value={newRuleReplyText}
                    onChange={(e) => setNewRuleReplyText(e.target.value)}
                    className="w-full h-24 p-3 text-xs border border-slate-200/80 rounded-xl bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creatingRule}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black py-2.5 text-xs font-bold shadow-sm transition"
                >
                  {creatingRule ? "Creating Rule..." : "Create & Activate Rule"}
                </button>
              </form>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {loadingRules ? (
                  <div className="text-center text-xs text-slate-400 py-8">Loading rules...</div>
                ) : rules.length === 0 ? (
                  <div className="text-center text-xs text-slate-400 py-16 flex flex-col items-center gap-2">
                    <Sparkles size={28} className="text-slate-300 dark:text-slate-700" />
                    <span>No automated response rules yet</span>
                    <p className="text-[10px] text-slate-400 px-6">Click "New Rule" at the top to configure keyword auto replies.</p>
                  </div>
                ) : (
                  rules.map((rule) => (
                    <div
                      key={rule._id}
                      className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col gap-2 hover:shadow-xs transition"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rule.name}</h4>
                          <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded-md mt-1 inline-block">
                            Keyword trigger: "{rule.keyword}"
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleRule(rule)}
                            className="text-slate-400 hover:text-[#82a800] dark:hover:text-[#C8FF00] transition"
                            title={rule.isActive ? "Deactivate rule" : "Activate rule"}
                          >
                            {rule.isActive ? <ToggleRight size={22} className="text-[#82a800] dark:text-[#C8FF00]" /> : <ToggleLeft size={22} />}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRule(rule._id)}
                            className="text-slate-400 hover:text-red-500 transition"
                            title="Delete rule"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 leading-normal">
                        {rule.replyText}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Sandbox Simulator */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-6 dark:border-slate-850/60 dark:bg-slate-900 shadow-sm flex flex-col h-full gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Play size={18} className="text-blue-500" /> Sandbox Webhook Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Test keyword auto-replies by simulating DMs/comments.</p>
            </div>

            <form onSubmit={handleSimulateEvent} className="space-y-4 bg-slate-50/30 dark:bg-slate-950/10 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex-1 flex flex-col min-h-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Simulate Platform</label>
                  <select
                    value={simPlatform}
                    onChange={(e) => setSimPlatform(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="x">X / Twitter</option>
                    <option value="googleBusiness">Google Business Profile</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Full Name</label>
                  <input
                    type="text"
                    required
                    value={simName}
                    onChange={(e) => setSimName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">User Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-slate-400">@</span>
                  <input
                    type="text"
                    required
                    value={simUsername}
                    onChange={(e) => setSimUsername(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex-1 flex flex-col min-h-0">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Trigger Message Text</label>
                <textarea
                  required
                  placeholder="Type simulated DM / comment..."
                  value={simText}
                  onChange={(e) => setSimText(e.target.value)}
                  className="flex-1 w-full p-3 text-xs border border-slate-200/80 rounded-xl bg-white dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={simulating}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white py-3 text-xs font-semibold shadow-sm transition"
              >
                {simulating ? "Simulating incoming hook..." : <><Play size={14} /> Simulate Incoming Lead Event</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardPageShell>
  );
}
