import React, { type FC, useState, useEffect, useMemo } from "react";
import {
  WixDesignSystemProvider,
  Page,
  Tabs,
  Card,
  Table,
  Button,
  Input,
  FormField,
  Dropdown,
  ToggleSwitch,
  Badge,
  Notification,
  Loader,
  Divider,
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import {
  fetchSettings,
  persistSettings,
  fetchLeads,
  patchLeadStatus,
  patchLeadNotes,
  fetchMetrics,
  type AppSettings,
  type PrizeSegment,
  type Lead,
  DEFAULT_SETTINGS,
} from "../../services/leads";
import {
  DASHBOARD_I18N,
  getLocalizedCategories,
  I18N_DICTIONARY,
} from "../../constants/i18nDefaults";

const LANGUAGES = [
  { id: "en", value: "English 🇺🇸" },
  { id: "tr", value: "Türkçe 🇹🇷" },
  { id: "de", value: "Deutsch 🇩🇪" },
  { id: "fr", value: "Français 🇫🇷" },
  { id: "es", value: "Español 🇪🇸" },
  { id: "he", value: "עברית 🇮🇱" },
  { id: "zh", value: "中文 🇨🇳" },
  { id: "ja", value: "日本語 🇯🇵" },
  { id: "ko", value: "한국어 🇰🇷" },
  { id: "hi", value: "हिन्दी 🇮🇳" },
  { id: "pt", value: "Português 🇧🇷" },
  { id: "ru", value: "Русский 🇷🇺" },
  { id: "uk", value: "Українська 🇺🇦" },
  { id: "el", value: "Ελληνικά 🇬🇷" },
  { id: "it", value: "Italiano 🇮🇹" },
  { id: "ar", value: "العربية 🇸🇦" },
];

const THEMES = [
  { id: "gold", value: "👑 Royal Gold Luxury" },
  { id: "dark", value: "🌌 Dark Nebula & Glow" },
  { id: "neon", value: "⚡ Cyberpunk Emerald Neon" },
  { id: "light", value: "✨ Clean Light Modern" },
];

const STATUS_OPTIONS = [
  { id: "all", value: "All Statuses" },
  { id: "new", value: "New Lead" },
  { id: "contacted", value: "Contacted" },
  { id: "converted", value: "Converted / Sale" },
  { id: "lost", value: "Lost / Expired" },
];

const WheelDashboard: FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // App Settings State - Default language is English (en)
  const [settings, setSettings] = useState<AppSettings>({
    ...DEFAULT_SETTINGS,
    defaultLang: "en",
  });
  const [prizes, setPrizes] = useState<PrizeSegment[]>(DEFAULT_SETTINGS.rewardPool);

  // Metrics State
  const [metrics, setMetrics] = useState({
    totalSpins: 0,
    winnersCount: 0,
    leadsCount: 0,
    conversionRate: 0,
  });

  // Leads CRM State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");

  // Custom Texts & Active Dashboard Language State (Default: "en")
  const [customTexts, setCustomTexts] = useState<Record<string, Record<string, string>>>({});
  const [selectedEditLang, setSelectedEditLang] = useState<string>("en");

  // Dynamic Dashboard Localization Dictionary
  const t = useMemo(() => {
    return DASHBOARD_I18N[selectedEditLang] || DASHBOARD_I18N.en;
  }, [selectedEditLang]);

  // Localized Tabs
  const dynamicTabs = useMemo(() => [
    { id: "overview", title: t.tabOverview },
    { id: "prizes", title: t.tabPrizes },
    { id: "leads", title: t.tabLeads },
    { id: "design", title: t.tabTheme },
    { id: "translations", title: t.tabTexts },
  ], [t]);

  // Localized 4 Custom Text Categories
  const dynamicCategories = useMemo(() => {
    return getLocalizedCategories(selectedEditLang);
  }, [selectedEditLang]);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [fetchedSettings, fetchedMetrics, fetchedLeads] = await Promise.all([
        fetchSettings().catch(() => DEFAULT_SETTINGS),
        fetchMetrics().catch(() => ({ totalSpins: 0, winnersCount: 0, leadsCount: 0, conversionRate: 0 })),
        fetchLeads({ page: 1, pageSize: 50 }).catch(() => ({ items: [], total: 0, page: 1, pageSize: 50 })),
      ]);

      if (fetchedSettings) {
        setSettings(fetchedSettings);
        if (fetchedSettings.rewardPool && Array.isArray(fetchedSettings.rewardPool)) {
          setPrizes(fetchedSettings.rewardPool);
        }
        if (fetchedSettings.defaultLang) {
          setSelectedEditLang(fetchedSettings.defaultLang);
        }
        if (fetchedSettings.customTextsJSON) {
          try {
            const parsed = JSON.parse(fetchedSettings.customTextsJSON);
            if (parsed && typeof parsed === "object") {
              const isNested = Object.keys(parsed).some((k) => LANGUAGES.some((l) => l.id === k));
              if (isNested) {
                setCustomTexts(parsed);
              } else {
                setCustomTexts({ [fetchedSettings.defaultLang || "en"]: parsed });
              }
            }
          } catch {}
        }
      }
      if (fetchedMetrics) setMetrics(fetchedMetrics);
      if (fetchedLeads && fetchedLeads.items) setLeads(fetchedLeads.items);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (lang: string, key: string, val: string) => {
    setCustomTexts((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] || {}),
        [key]: val,
      },
    }));
  };

  const handleResetField = (lang: string, key: string) => {
    setCustomTexts((prev) => {
      if (!prev[lang]) return prev;
      const langCopy = { ...prev[lang] };
      delete langCopy[key];
      return {
        ...prev,
        [lang]: langCopy,
      };
    });
  };

  const handleResetLang = (lang: string) => {
    const langName = LANGUAGES.find((l) => l.id === lang)?.value || lang.toUpperCase();
    if (confirm(`Reset all custom texts for "${langName}" to default?`)) {
      setCustomTexts((prev) => {
        const copy = { ...prev };
        delete copy[lang];
        return copy;
      });
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const updated: Partial<AppSettings> = {
        ...settings,
        defaultLang: selectedEditLang,
        rewardPool: prizes,
        customTextsJSON: JSON.stringify(customTexts),
      };
      const res = await persistSettings(updated).then(r => ({ success: r }));
      if (res.success) {
        setNotice({ type: "success", text: t.saveSuccess });
      } else {
        setNotice({ type: "error", text: "Failed to save settings." });
      }
    } catch (err) {
      setNotice({ type: "error", text: String(err) });
    } finally {
      setSaving(false);
    }
  };

  const handlePrizeChange = (index: number, changes: Partial<PrizeSegment>) => {
    const updated = [...prizes];
    updated[index] = { ...updated[index], ...changes };
    setPrizes(updated);
  };

  const handleAddPrize = () => {
    if (prizes.length >= 12) {
      alert("Maximum 12 prize slices allowed.");
      return;
    }
    const colors = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#3b82f6", "#ef4444", "#14b8a6"];
    const nextColor = colors[prizes.length % colors.length];
    const newPrize: PrizeSegment = {
      id: "p_" + Date.now(),
      label: "Special Reward",
      code: "SPECIAL" + (prizes.length + 1),
      color: nextColor,
      probability: 10,
      isWinner: true,
      isActive: true,
    };
    setPrizes([...prizes, newPrize]);
  };

  const handleRemovePrize = (index: number) => {
    if (prizes.length <= 2) {
      alert("Wheel must contain at least 2 prize segments.");
      return;
    }
    setPrizes(prizes.filter((_, idx) => idx !== index));
  };

  const handleUpdateStatus = async (leadId: string, newStatus: "new" | "contacted" | "converted" | "lost") => {
    try {
      await patchLeadStatus(leadId, newStatus);
      setLeads((curr) => curr.map((item) => (item._id === leadId ? { ...item, status: newStatus } : item)));
    } catch (err) {
      console.error("Status update error:", err);
    }
  };

  const handleUpdateNotes = async (leadId: string, newNotes: string) => {
    try {
      await patchLeadNotes(leadId, newNotes);
      setLeads((curr) => curr.map((item) => (item._id === leadId ? { ...item, notes: newNotes } : item)));
    } catch (err) {
      console.error("Notes update error:", err);
    }
  };

  // CSV Export for Leads
  const exportLeadsToCSV = () => {
    if (leads.length === 0) {
      alert("No leads to export.");
      return;
    }
    const headers = ["First Name", "Last Name", "Email", "Phone", "Reward Code", "Prize", "Notes", "Spun Date", "Status", "Marketing Consent"];
    const rows = leads.map((l) => [
      `"${l.firstName || ""}"`,
      `"${l.lastName || ""}"`,
      `"${l.email || ""}"`,
      `"${l.phone || ""}"`,
      `"${l.rewardCode || ""}"`,
      `"${l.prizeLabel || ""}"`,
      `"${(l.notes || "").replace(/"/g, '""')}"`,
      `"${l.spunAt ? new Date(l.spunAt as string).toLocaleString() : ""}"`,
      `"${l.status || "new"}"`,
      `"${l.marketingConsent ? "Yes" : "No"}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `wheel-of-fortune-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      if (leadStatusFilter !== "all" && l.status !== leadStatusFilter) return false;
      if (leadSearch) {
        const query = leadSearch.toLowerCase();
        const email = String(l.email || "").toLowerCase();
        const fname = String(l.firstName || "").toLowerCase();
        const code = String(l.rewardCode || "").toLowerCase();
        return email.includes(query) || fname.includes(query) || code.includes(query);
      }
      return true;
    });
  }, [leads, leadStatusFilter, leadSearch]);

  if (loading) {
    return (
      <WixDesignSystemProvider>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
          <Loader size="large" text="Loading Wheel of Fortune Dashboard..." />
        </div>
      </WixDesignSystemProvider>
    );
  }

  return (
    <WixDesignSystemProvider>
      <Page>
        {/* ─── Persistent Header with App Title + Language Selector + Save Button ─── */}
        <Page.Header
          title={
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <span>🎡 {t.dashTitle}</span>
              <div style={{ width: 170, display: "inline-block" }}>
                <Dropdown
                  size="small"
                  selectedId={selectedEditLang}
                  options={LANGUAGES}
                  onSelect={(opt) => setSelectedEditLang(opt.id as string)}
                />
              </div>
            </div>
          }
          subtitle={t.dashSubtitle}
          actionsBar={
            <Button priority="primary" skin="standard" onClick={handleSaveSettings} disabled={saving}>
              {saving ? t.saving : t.saveAll}
            </Button>
          }
        />

        <Page.Content>
          {notice && (
            <div style={{ marginBottom: 16 }}>
              <Notification type="sticky" theme={notice.type === "success" ? "standard" : "error"}>
                <Notification.TextLabel>{notice.text}</Notification.TextLabel>
                <Notification.CloseButton onClick={() => setNotice(null)} />
              </Notification>
            </div>
          )}

          {/* ─── Dynamic 5 Tabs ─── */}
          <Tabs
            activeId={activeTab}
            onClick={(tab) => setActiveTab(tab.id as string)}
            items={dynamicTabs}
            type="compact"
          />

          <div style={{ marginTop: 20 }}>
            {/* ─── TAB 1: OVERVIEW & STATS ─── */}
            {activeTab === "overview" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{t.statSpins}</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#1e293b", fontWeight: 900 }}>{metrics.totalSpins.toLocaleString()}</h2>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{t.statCoupons}</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#10b981", fontWeight: 900 }}>{metrics.winnersCount.toLocaleString()}</h2>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{t.statLeads}</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#6366f1", fontWeight: 900 }}>{metrics.leadsCount.toLocaleString()}</h2>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{t.statRate}</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#f59e0b", fontWeight: 900 }}>{metrics.conversionRate}%</h2>
                    </Card.Content>
                  </Card>
                </div>

                <Card>
                  <Card.Header
                    title={`🚀 ${t.chartTitle}`}
                    suffix={
                      <ToggleSwitch
                        checked={settings.isActive}
                        onChange={(e) => setSettings({ ...settings, isActive: e.target.checked })}
                      />
                    }
                  />
                  <Card.Content>
                    <p style={{ margin: 0, fontSize: 14, color: "#475569" }}>
                      Status: <strong>{settings.isActive ? "🟢 Active & Visible to Visitors" : "🔴 Inactive (Paused)"}</strong>.
                      Visitors can spin the wheel up to <strong>{settings.dailyLimit} time(s)</strong> per day in <strong>{LANGUAGES.find(l => l.id === selectedEditLang)?.value || selectedEditLang.toUpperCase()}</strong>.
                    </p>
                  </Card.Content>
                </Card>
              </div>
            )}

            {/* ─── TAB 2: PRIZE SEGMENTS & PROBABILITIES ─── */}
            {activeTab === "prizes" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                <Card>
                  <Card.Header
                    title={`🎡 ${t.prizesTitle}`}
                    subtitle={t.prizesSubtitle}
                    suffix={
                      <Button size="small" priority="secondary" onClick={handleAddPrize} disabled={prizes.length >= 12}>
                        + Add Segment
                      </Button>
                    }
                  />
                  <Card.Content>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {prizes.map((prize, idx) => (
                        <div
                          key={prize.id || idx}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "40px 140px 140px 90px 80px 40px",
                            gap: 12,
                            alignItems: "center",
                            padding: "12px 14px",
                            background: "#f8fafc",
                            borderRadius: 10,
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <input
                            type="color"
                            value={prize.color || "#6366f1"}
                            onChange={(e) => handlePrizeChange(idx, { color: e.target.value })}
                            style={{ width: 36, height: 36, border: "none", borderRadius: 6, cursor: "pointer" }}
                            title={t.colColor}
                          />
                          <Input
                            placeholder={t.colLabel}
                            value={prize.label}
                            onChange={(e) => handlePrizeChange(idx, { label: e.target.value })}
                          />
                          <Input
                            placeholder={t.colCode}
                            value={prize.code}
                            onChange={(e) => handlePrizeChange(idx, { code: e.target.value })}
                          />
                          <FormField label={t.colProb}>
                            <Input
                              type="number"
                              value={String(prize.probability || 10)}
                              onChange={(e) => handlePrizeChange(idx, { probability: Number(e.target.value) })}
                            />
                          </FormField>
                          <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, cursor: "pointer" }}>
                            <input
                              type="checkbox"
                              checked={prize.isWinner !== false}
                              onChange={(e) => handlePrizeChange(idx, { isWinner: e.target.checked })}
                            />
                            {prize.isWinner !== false ? "Win" : "No"}
                          </label>
                          <button
                            type="button"
                            onClick={() => handleRemovePrize(idx)}
                            style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: 18, cursor: "pointer" }}
                            title="Remove slice"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </Card.Content>
                </Card>

                {/* Probability Distribution Card */}
                <Card>
                  <Card.Header title="📊 Probability Summary" />
                  <Card.Content>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {prizes.map((p, idx) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: p.color || "#6366f1" }} />
                            {p.label || `Slice ${idx + 1}`}
                          </span>
                          <strong>{p.probability || 0}%</strong>
                        </div>
                      ))}
                      <Divider />
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                        <span>Total:</span>
                        <span style={{ color: prizes.reduce((sum, p) => sum + (Number(p.probability) || 0), 0) === 100 ? "#10b981" : "#ef4444" }}>
                          {prizes.reduce((sum, p) => sum + (Number(p.probability) || 0), 0)}%
                        </span>
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </div>
            )}

            {/* ─── TAB 3: LEADS & WINNERS CRM ─── */}
            {activeTab === "leads" && (
              <Card>
                <Card.Header
                  title={`👥 ${t.leadsTitle}`}
                  subtitle={t.leadsSubtitle}
                  suffix={
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <Input
                        size="small"
                        placeholder="Search lead..."
                        value={leadSearch}
                        onChange={(e) => setLeadSearch(e.target.value)}
                      />
                      <Button size="small" priority="secondary" onClick={exportLeadsToCSV}>
                        {t.exportCSV}
                      </Button>
                    </div>
                  }
                />
                <Card.Content>
                  <Table
                    data={filteredLeads}
                    columns={[
                      {
                        title: t.colName,
                        render: (row: Lead) => (
                          <strong>{row.firstName} {row.lastName || ""}</strong>
                        ),
                      },
                      {
                        title: t.colEmail,
                        render: (row: Lead) => (
                          <span
                            onClick={() => navigator.clipboard.writeText(String(row.email || ""))}
                            style={{ cursor: "pointer", color: "#4f46e5" }}
                            title="Click to copy"
                          >
                            {String(row.email || "")} 📋
                          </span>
                        ),
                      },
                      {
                        title: t.colPhone,
                        render: (row: Lead) => (
                          <span>{String(row.phone || "—")}</span>
                        ),
                      },
                      {
                        title: t.colCouponWon,
                        render: (row: Lead) => (
                          <Badge skin="premium">{String(row.rewardCode || "N/A")}</Badge>
                        ),
                      },
                      {
                        title: t.colPrizeWon,
                        render: (row: Lead) => (
                          <span>{String(row.prizeLabel || "—")}</span>
                        ),
                      },
                      {
                        title: t.colNotes,
                        render: (row: Lead) => (
                          <input
                            type="text"
                            placeholder={t.notePH}
                            defaultValue={String(row.notes || "")}
                            onBlur={(e) => handleUpdateNotes(String(row._id), e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                (e.target as HTMLInputElement).blur();
                              }
                            }}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 6,
                              border: "1px solid #cbd5e1",
                              fontSize: 12,
                              width: 160,
                              background: "#ffffff",
                              color: "#0f172a",
                            }}
                          />
                        ),
                      },
                      {
                        title: "Spun At",
                        render: (row: Lead) => (
                          <span>{row.spunAt ? new Date(row.spunAt as string).toLocaleDateString() : "—"}</span>
                        ),
                      },
                      {
                        title: t.colStatus,
                        render: (row: Lead) => (
                          <select
                            value={String(row.status || "new")}
                            onChange={(e) => handleUpdateStatus(String(row._id), e.target.value as any)}
                            style={{ padding: "4px 8px", borderRadius: 6, border: "1px solid #cbd5e1", fontSize: 12 }}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="lost">Lost</option>
                          </select>
                        ),
                      },
                    ]}
                  >
                    <Table.Content />
                  </Table>
                </Card.Content>
              </Card>
            )}

            {/* ─── TAB 4: DESIGN & THEME ─── */}
            {activeTab === "design" && (
              <Card>
                <Card.Header title={`🎨 ${t.themeTitle}`} subtitle={t.themeSubtitle} />
                <Card.Content>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <FormField label={t.themeLabel}>
                      <Dropdown
                        selectedId={settings.colorTheme}
                        options={THEMES}
                        onSelect={(opt) => setSettings({ ...settings, colorTheme: opt.id as string })}
                      />
                    </FormField>

                    <FormField label={t.limitLabel}>
                      <Input
                        type="number"
                        value={String(settings.dailyLimit)}
                        onChange={(e) => setSettings({ ...settings, dailyLimit: Number(e.target.value) || 1 })}
                      />
                    </FormField>
                  </div>
                </Card.Content>
              </Card>
            )}

            {/* ─── TAB 5: 16 LANGUAGES & CUSTOM TEXTS ─── */}
            {activeTab === "translations" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Language Selection Bar */}
                <Card>
                  <Card.Header
                    title={`🌍 ${t.textsTitle}`}
                    subtitle={t.textsSubtitle}
                    suffix={
                      <Button
                        priority="secondary"
                        skin="destructive"
                        size="small"
                        onClick={() => handleResetLang(selectedEditLang)}
                      >
                        {t.resetLangBtn}
                      </Button>
                    }
                  />
                </Card>

                {/* 4 Categorized Cards */}
                {dynamicCategories.map((cat, catIdx) => (
                  <Card key={catIdx}>
                    <Card.Header
                      title={`${cat.icon} ${cat.category}`}
                      subtitle={`${LANGUAGES.find((l) => l.id === selectedEditLang)?.value} translation strings`}
                    />
                    <Card.Content>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                        {cat.fields.map((field) => {
                          const defaultVal =
                            I18N_DICTIONARY[selectedEditLang]?.[field.key] ||
                            I18N_DICTIONARY.en[field.key] ||
                            "";
                          const customVal = customTexts[selectedEditLang]?.[field.key] ?? "";
                          const isCustomized = customVal.trim().length > 0;

                          return (
                            <div
                              key={field.key}
                              style={{
                                gridColumn: field.isLong ? "1 / -1" : "span 1",
                                background: isCustomized ? "#f0fdf4" : "transparent",
                                padding: isCustomized ? "8px 12px" : "0",
                                borderRadius: 8,
                                border: isCustomized ? "1px solid #86efac" : "none",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <label style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>
                                  {field.label}
                                </label>
                                {isCustomized && (
                                  <button
                                    type="button"
                                    onClick={() => handleResetField(selectedEditLang, field.key)}
                                    style={{
                                      background: "transparent",
                                      border: "none",
                                      color: "#15803d",
                                      fontSize: 11,
                                      fontWeight: 700,
                                      cursor: "pointer",
                                    }}
                                    title="Reset to default translation"
                                  >
                                    {t.resetFieldBtn}
                                  </button>
                                )}
                              </div>
                              <Input
                                value={customVal}
                                placeholder={`${t.defaultPH}${defaultVal}`}
                                onChange={(e) => handleTextChange(selectedEditLang, field.key, e.target.value)}
                              />
                              {field.desc && (
                                <span style={{ fontSize: 11, color: "#64748b", marginTop: 2, display: "block" }}>
                                  {field.desc}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </Card.Content>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
};

export default WheelDashboard;
