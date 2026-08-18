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
  fetchMetrics,
  type AppSettings,
  type PrizeSegment,
  type Lead,
  DEFAULT_SETTINGS,
} from "../../services/leads";

const TABS = [
  { id: "overview", title: "📊 Overview & Stats" },
  { id: "prizes", title: "🎡 Prize Segments" },
  { id: "leads", title: "👥 Leads & Winners CRM" },
  { id: "design", title: "🎨 Design & Theme" },
  { id: "translations", title: "🌍 16 Languages & Texts" },
];

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

  // App Settings State
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
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
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");

  // Custom Texts
  const [customTexts, setCustomTexts] = useState<Record<string, string>>({});

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
        if (fetchedSettings.customTextsJSON) {
          try {
            setCustomTexts(JSON.parse(fetchedSettings.customTextsJSON));
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

  const handleSaveSettings = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const updated: Partial<AppSettings> = {
        ...settings,
        rewardPool: prizes,
        customTextsJSON: JSON.stringify(customTexts),
      };
      const res = await persistSettings(updated).then(r => ({ success: r }));
      if (res.success) {
        setNotice({ type: "success", text: "Settings and prize pool saved successfully!" });
      } else {
        setNotice({ type: "error", text: "Failed to save settings." });
      }
    } catch (err) {
      setNotice({ type: "error", text: String(err) });
    } finally {
      setSaving(false);
    }
  };

  const handlePrizeChange = (index: number, patch: Partial<PrizeSegment>) => {
    setPrizes((curr) => curr.map((p, idx) => (idx === index ? { ...p, ...patch } : p)));
  };

  const handleAddPrize = () => {
    if (prizes.length >= 12) return;
    const newPrize: PrizeSegment = {
      id: `prize_${Date.now()}`,
      label: "NEW PRIZE",
      code: "SAVE" + Math.floor(Math.random() * 90 + 10),
      color: "#f59e0b",
      probability: 15,
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

  // CSV Export for Leads
  const exportLeadsToCSV = () => {
    if (leads.length === 0) {
      alert("No leads to export.");
      return;
    }
    const headers = ["First Name", "Last Name", "Email", "Phone", "Reward Code", "Prize", "Spun Date", "Status", "Marketing Consent"];
    const rows = leads.map((l) => [
      `"${l.firstName || ""}"`,
      `"${l.lastName || ""}"`,
      `"${l.email || ""}"`,
      `"${l.phone || ""}"`,
      `"${l.rewardCode || ""}"`,
      `"${l.prizeLabel || ""}"`,
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
        <Page.Header
          title="🎡 Wheel of Fortune (Çarkıfelek)"
          subtitle="Configure prize probabilities, analyze spin metrics & manage CRM winner leads"
          actionsBar={
            <Button priority="primary" skin="standard" onClick={handleSaveSettings} disabled={saving}>
              {saving ? "Saving..." : "Save All Changes"}
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

          <Tabs
            activeId={activeTab}
            onClick={(tab) => setActiveTab(tab.id as string)}
            items={TABS}
            type="compact"
          />

          <div style={{ marginTop: 20 }}>
            {/* ─── TAB 1: OVERVIEW & STATS ─── */}
            {activeTab === "overview" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Total Spins</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#1e293b", fontWeight: 900 }}>{metrics.totalSpins.toLocaleString()}</h2>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Winners</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#10b981", fontWeight: 900 }}>{metrics.winnersCount.toLocaleString()}</h2>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Leads Captured</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#6366f1", fontWeight: 900 }}>{metrics.leadsCount.toLocaleString()}</h2>
                    </Card.Content>
                  </Card>

                  <Card>
                    <Card.Content>
                      <span style={{ fontSize: 13, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Conversion Rate</span>
                      <h2 style={{ fontSize: 32, margin: "8px 0 0 0", color: "#f59e0b", fontWeight: 900 }}>{metrics.conversionRate}%</h2>
                    </Card.Content>
                  </Card>
                </div>

                <Card>
                  <Card.Header
                    title="🚀 Quick Campaign Status"
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
                      Visitors can spin the wheel up to <strong>{settings.dailyLimit} time(s)</strong> per day in <strong>{settings.defaultLang.toUpperCase()}</strong>.
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
                    title="🎡 Prize Wheel Segments (6-12 Segments)"
                    subtitle="Configure labels, coupon codes, slice colors and server-side random weights"
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
                            title="Slice Color"
                          />
                          <Input
                            placeholder="Prize Label"
                            value={prize.label}
                            onChange={(e) => handlePrizeChange(idx, { label: e.target.value })}
                          />
                          <Input
                            placeholder="Coupon Code"
                            value={prize.code}
                            onChange={(e) => handlePrizeChange(idx, { code: e.target.value })}
                          />
                          <FormField label="Weight %">
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
                            Win
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

                {/* Live Preview Wheel */}
                <Card>
                  <Card.Header title="Live Slice Preview" />
                  <Card.Content>
                    <div style={{ display: "flex", justifyContent: "center", padding: "16px 0" }}>
                      <div
                        style={{
                          width: 240,
                          height: 240,
                          borderRadius: "50%",
                          background: `conic-gradient(${prizes
                            .map((p, i) => `${p.color} ${(i * 100) / prizes.length}% ${((i + 1) * 100) / prizes.length}%`)
                            .join(",")})`,
                          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 60,
                            borderRadius: "50%",
                            background: "#ffffff",
                            boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 900,
                            fontSize: 12,
                            color: "#1e1b4b",
                          }}
                        >
                          SPIN
                        </div>
                      </div>
                    </div>
                    <p style={{ fontSize: 12, color: "#64748b", textAlign: "center", margin: 0 }}>
                      Weights are securely calculated on the server. Visitors only see the slice names and graphics.
                    </p>
                  </Card.Content>
                </Card>
              </div>
            )}

            {/* ─── TAB 3: LEADS & WINNERS CRM ─── */}
            {activeTab === "leads" && (
              <Card>
                <Card.Header
                  title="👥 Leads & Winners CRM Table"
                  subtitle="Manage visitor contact details, export to CSV and update follow-up statuses"
                  suffix={
                    <div style={{ display: "flex", gap: 12 }}>
                      <Button priority="secondary" onClick={exportLeadsToCSV}>
                        📥 Export to CSV
                      </Button>
                    </div>
                  }
                />
                <Card.Content>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 280 }}>
                      <Input
                        placeholder="Search name, email or coupon..."
                        value={leadSearch}
                        onChange={(e) => setLeadSearch(e.target.value)}
                      />
                    </div>
                    <div style={{ width: 180 }}>
                      <Dropdown
                        selectedId={leadStatusFilter}
                        options={STATUS_OPTIONS}
                        onSelect={(opt) => setLeadStatusFilter(opt.id as string)}
                      />
                    </div>
                  </div>

                  <Table
                    data={filteredLeads}
                    columns={[
                      {
                        title: "Visitor Name",
                        render: (row: Lead) => (
                          <div>
                            <strong>{String(row.firstName || "")} {String(row.lastName || "")}</strong>
                          </div>
                        ),
                      },
                      {
                        title: "Email",
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
                        title: "Phone",
                        render: (row: Lead) => (
                          <span>{String(row.phone || "—")}</span>
                        ),
                      },
                      {
                        title: "Coupon Code",
                        render: (row: Lead) => (
                          <Badge skin="premium">{String(row.rewardCode || "N/A")}</Badge>
                        ),
                      },
                      {
                        title: "Prize Won",
                        render: (row: Lead) => (
                          <span>{String(row.prizeLabel || "—")}</span>
                        ),
                      },
                      {
                        title: "Spun At",
                        render: (row: Lead) => (
                          <span>{row.spunAt ? new Date(row.spunAt as string).toLocaleDateString() : "—"}</span>
                        ),
                      },
                      {
                        title: "Status",
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
                <Card.Header title="🎨 Theme & Visual Settings" />
                <Card.Content>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    <FormField label="Color Theme Preset">
                      <Dropdown
                        selectedId={settings.colorTheme}
                        options={THEMES}
                        onSelect={(opt) => setSettings({ ...settings, colorTheme: opt.id as string })}
                      />
                    </FormField>

                    <FormField label="Daily Spin Limit per Visitor">
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
              <Card>
                <Card.Header
                  title="🌍 16 Languages & Custom Texts"
                  subtitle="Override texts for all languages or select default store language"
                />
                <Card.Content>
                  <div style={{ maxWidth: 400, marginBottom: 20 }}>
                    <FormField label="Default Store Language">
                      <Dropdown
                        selectedId={settings.defaultLang}
                        options={LANGUAGES}
                        onSelect={(opt) => setSettings({ ...settings, defaultLang: opt.id as string })}
                      />
                    </FormField>
                  </div>

                  <div style={{ margin: "20px 0" }}><Divider /></div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <FormField label="Custom Widget Title">
                      <Input
                        value={customTexts.title || ""}
                        placeholder="Leave empty for dictionary default"
                        onChange={(e) => setCustomTexts({ ...customTexts, title: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Custom Subtitle">
                      <Input
                        value={customTexts.subtitle || ""}
                        placeholder="Leave empty for dictionary default"
                        onChange={(e) => setCustomTexts({ ...customTexts, subtitle: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Custom Spin Button Label">
                      <Input
                        value={customTexts.spinBtn || ""}
                        placeholder="e.g. SPIN TO WIN"
                        onChange={(e) => setCustomTexts({ ...customTexts, spinBtn: e.target.value })}
                      />
                    </FormField>

                    <FormField label="Custom Claim Button Label">
                      <Input
                        value={customTexts.cta || ""}
                        placeholder="e.g. Claim My Reward"
                        onChange={(e) => setCustomTexts({ ...customTexts, cta: e.target.value })}
                      />
                    </FormField>
                  </div>
                </Card.Content>
              </Card>
            )}
          </div>
        </Page.Content>
      </Page>
    </WixDesignSystemProvider>
  );
};

export default WheelDashboard;
