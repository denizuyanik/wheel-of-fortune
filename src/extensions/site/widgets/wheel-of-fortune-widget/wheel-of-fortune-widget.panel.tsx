import React, { type FC, useState, useEffect, useCallback } from "react";
import { widget } from "@wix/editor";
import {
  SidePanel,
  WixDesignSystemProvider,
  Input,
  FormField,
  Dropdown,
  Tabs,
  NumberInput,
  SectionHelper,
  Divider,
} from "@wix/design-system";
import "@wix/design-system/styles.global.css";
import { fetchSettings, persistSettings } from "../../../../dashboard/services/leads";

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

const PANEL_TABS = [
  { id: "lang", title: "🌐 Language" },
  { id: "style", title: "🎨 Theme" },
  { id: "rules", title: "⚙️ Rules" },
  { id: "texts", title: "✍️ Texts" },
];

const Panel: FC = () => {
  const [activeTab, setActiveTab] = useState("lang");
  const [lang, setLang] = useState("en");
  const [theme, setTheme] = useState("gold");
  const [dailyLimit, setDailyLimit] = useState(1);

  // Custom Texts
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [spinBtnText, setSpinBtnText] = useState("");
  const [ctaText, setCtaText] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [mandatoryNotice, setMandatoryNotice] = useState("");
  const [privacyConsent, setPrivacyConsent] = useState("");
  const [marketingConsent, setMarketingConsent] = useState("");
  const [voucherTitle, setVoucherTitle] = useState("");
  const [validNotice, setValidNotice] = useState("");

  // Load Initial Settings (Bi-directional Sync)
  useEffect(() => {
    // 1. From Widget Props
    Promise.all([
      widget.getProp("lang").catch(() => null),
      widget.getProp("color-theme").catch(() => null),
      widget.getProp("daily-limit").catch(() => null),
      widget.getProp("custom-texts").catch(() => null),
    ]).then(([wLang, wTheme, wLimit, wTexts]) => {
      if (wLang) setLang(wLang);
      if (wTheme) setTheme(wTheme);
      if (wLimit) setDailyLimit(Number(wLimit) || 1);
      if (wTexts) {
        try {
          const parsed = JSON.parse(wTexts);
          if (parsed.title) setTitle(parsed.title);
          if (parsed.subtitle) setSubtitle(parsed.subtitle);
          if (parsed.spinBtn) setSpinBtnText(parsed.spinBtn);
          if (parsed.cta) setCtaText(parsed.cta);
          if (parsed.formTitle) setFormTitle(parsed.formTitle);
          if (parsed.formMandatoryNotice) setMandatoryNotice(parsed.formMandatoryNotice);
          if (parsed.privacyConsent) setPrivacyConsent(parsed.privacyConsent);
          if (parsed.marketingConsent) setMarketingConsent(parsed.marketingConsent);
          if (parsed.couponVoucherTitle) setVoucherTitle(parsed.couponVoucherTitle);
          if (parsed.couponValidNotice) setValidNotice(parsed.couponValidNotice);
        } catch {}
      }
    });

    // 2. From Backend CMS
    fetchSettings().then((backend) => {
      if (backend) {
        if (backend.defaultLang) setLang((prev) => prev || backend.defaultLang);
        if (backend.colorTheme) setTheme((prev) => prev || backend.colorTheme);
        if (backend.dailyLimit) setDailyLimit((prev) => prev || backend.dailyLimit);
        if (backend.customTextsJSON) {
          try {
            const parsed = JSON.parse(backend.customTextsJSON);
            if (parsed.title) setTitle((p) => p || parsed.title);
            if (parsed.subtitle) setSubtitle((p) => p || parsed.subtitle);
            if (parsed.spinBtn) setSpinBtnText((p) => p || parsed.spinBtn);
            if (parsed.cta) setCtaText((p) => p || parsed.cta);
          } catch {}
        }
      }
    }).catch(() => {});
  }, []);

  // Update Widget & Backend
  const syncCustomTexts = useCallback(
    (overrides: Record<string, string>) => {
      const allTexts = {
        title,
        subtitle,
        spinBtn: spinBtnText,
        cta: ctaText,
        formTitle,
        formMandatoryNotice: mandatoryNotice,
        privacyConsent,
        marketingConsent,
        couponVoucherTitle: voucherTitle,
        couponValidNotice: validNotice,
        ...overrides,
      };
      // Clean empty keys
      const clean: Record<string, string> = {};
      for (const [k, v] of Object.entries(allTexts)) {
        if (v && v.trim()) clean[k] = v.trim();
      }
      const raw = JSON.stringify(clean);
      widget.setProp("custom-texts", raw);
      try {
        localStorage.setItem("wheel_of_fortune_app_settings", raw);
      } catch {}
      persistSettings({ customTextsJSON: raw }).catch(() => {});
    },
    [title, subtitle, spinBtnText, ctaText, formTitle, mandatoryNotice, privacyConsent, marketingConsent, voucherTitle, validNotice]
  );

  const handleLangChange = (selectedId: string) => {
    setLang(selectedId);
    widget.setProp("lang", selectedId);
    persistSettings({ defaultLang: selectedId }).catch(() => {});
  };

  const handleThemeChange = (selectedTheme: string) => {
    setTheme(selectedTheme);
    widget.setProp("color-theme", selectedTheme);
    persistSettings({ colorTheme: selectedTheme }).catch(() => {});
  };

  const handleLimitChange = (val: number | null) => {
    const lim = val && val > 0 ? val : 1;
    setDailyLimit(lim);
    widget.setProp("daily-limit", String(lim));
    persistSettings({ dailyLimit: lim }).catch(() => {});
  };

  return (
    <WixDesignSystemProvider>
      <SidePanel width="320" height="100vh">
        <SidePanel.Header
          title="🎡 Wheel of Fortune"
          subtitle="Customize wheel behavior, theme & translations"
        />

        <SidePanel.Content noPadding stretchVertically>
          <Tabs
            activeId={activeTab}
            onClick={(tab) => setActiveTab(tab.id as string)}
            items={PANEL_TABS}
            type="compact"
          />

          <div style={{ padding: 16 }}>
            {activeTab === "lang" && (
              <SidePanel.Field>
                <FormField label="Widget Language (16 Languages)">
                  <Dropdown
                    placeholder="Select language"
                    selectedId={lang}
                    options={LANGUAGES}
                    onSelect={(opt) => handleLangChange(opt.id as string)}
                  />
                </FormField>
                <div style={{ marginTop: 12 }}>
                  <SectionHelper appearance="standard">
                    Changing the language instantly localizes all 30+ interface strings, form labels, and digital voucher cards.
                  </SectionHelper>
                </div>
              </SidePanel.Field>
            )}

            {activeTab === "style" && (
              <SidePanel.Field>
                <FormField label="Visual Theme & Color Palette">
                  <Dropdown
                    placeholder="Select theme"
                    selectedId={theme}
                    options={THEMES}
                    onSelect={(opt) => handleThemeChange(opt.id as string)}
                  />
                </FormField>
                <div style={{ marginTop: 12 }}>
                  <SectionHelper appearance="standard">
                    Themes automatically style the outer LED bulbs, slice gradients, center gold spin hub, and confirmation vouchers.
                  </SectionHelper>
                </div>
              </SidePanel.Field>
            )}

            {activeTab === "rules" && (
              <SidePanel.Field>
                <FormField label="Daily Spins per Visitor">
                  <NumberInput
                    value={dailyLimit}
                    min={1}
                    max={20}
                    onChange={handleLimitChange}
                  />
                </FormField>
                <div style={{ marginTop: 12 }}>
                  <SectionHelper appearance="warning">
                    Anti-cheat logic limits attempts per visitor/device per calendar day.
                  </SectionHelper>
                </div>
              </SidePanel.Field>
            )}

            {activeTab === "texts" && (
              <div>
                <SidePanel.Field>
                  <FormField label="Widget Title Override">
                    <Input
                      placeholder="Default translated title"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        syncCustomTexts({ title: e.target.value });
                      }}
                    />
                  </FormField>
                </SidePanel.Field>

                <SidePanel.Field>
                  <FormField label="Subtitle Override">
                    <Input
                      placeholder="Default translated subtitle"
                      value={subtitle}
                      onChange={(e) => {
                        setSubtitle(e.target.value);
                        syncCustomTexts({ subtitle: e.target.value });
                      }}
                    />
                  </FormField>
                </SidePanel.Field>

                <div style={{ margin: "12px 0" }}><Divider /></div>

                <SidePanel.Field>
                  <FormField label="Spin Button Label">
                    <Input
                      placeholder="e.g. SPIN TO WIN"
                      value={spinBtnText}
                      onChange={(e) => {
                        setSpinBtnText(e.target.value);
                        syncCustomTexts({ spinBtn: e.target.value });
                      }}
                    />
                  </FormField>
                </SidePanel.Field>

                <SidePanel.Field>
                  <FormField label="Claim Button Label">
                    <Input
                      placeholder="e.g. Claim My Reward"
                      value={ctaText}
                      onChange={(e) => {
                        setCtaText(e.target.value);
                        syncCustomTexts({ cta: e.target.value });
                      }}
                    />
                  </FormField>
                </SidePanel.Field>

                <SidePanel.Field>
                  <FormField label="Mandatory Warning Notice">
                    <Input
                      placeholder="Form completion required notice"
                      value={mandatoryNotice}
                      onChange={(e) => {
                        setMandatoryNotice(e.target.value);
                        syncCustomTexts({ formMandatoryNotice: e.target.value });
                      }}
                    />
                  </FormField>
                </SidePanel.Field>
              </div>
            )}
          </div>
        </SidePanel.Content>

        <SidePanel.Footer noPadding>
          <SectionHelper fullWidth appearance="standard" border="topBottom">
            Changes sync automatically with the App Dashboard and live widget.
          </SectionHelper>
        </SidePanel.Footer>
      </SidePanel>
    </WixDesignSystemProvider>
  );
};

export default Panel;
