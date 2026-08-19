/**
 * Wheel of Fortune — Dashboard Data Service
 * ==========================================
 * Manages Wix Data CMS interactions for settings, leads, and statistics.
 * Client-safe SDK imports avoiding Node/Vite backend bundling conflicts.
 */

import { items } from "@wix/data";

export interface PrizeSegment {
  id: string;
  label: string;
  code: string;
  color: string;
  probability: number;
  isWinner: boolean;
  isActive: boolean;
}

export interface AppSettings {
  isActive: boolean;
  colorTheme: string;
  defaultLang: string;
  dailyLimit: number;
  rewardPool: PrizeSegment[];
  widgetTitle: string;
  subtitleText: string;
  rewardWonText: string;
  noRewardText: string;
  ctaText: string;
  spinButtonText: string;
  marketingConsentText: string;
  customTextsJSON: string;
}

export interface Lead {
  _id?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  email: string;
  rewardCode: string;
  prizeLabel?: string;
  isWinner: boolean;
  language: string;
  status: "new" | "contacted" | "converted" | "lost";
  notes?: string;
  spunAt: string | Date;
  marketingConsent: boolean;
  siteId?: string;
}

export const DEFAULT_SETTINGS: AppSettings = {
  isActive: true,
  colorTheme: "gold",
  defaultLang: "en",
  dailyLimit: 1,
  spinButtonText: "SPIN",
  marketingConsentText: "I consent to receiving marketing communications and agree to the Privacy Policy.",
  rewardPool: [
    { id: "prize_1", label: "10% OFF", code: "SPIN10", color: "#6366F1", probability: 25, isWinner: true, isActive: true },
    { id: "prize_2", label: "FREE SHIPPING", code: "FREESHIP", color: "#EC4899", probability: 20, isWinner: true, isActive: true },
    { id: "prize_3", label: "TRY AGAIN", code: "", color: "#64748B", probability: 15, isWinner: false, isActive: true },
    { id: "prize_4", label: "20% OFF", code: "LUCKY20", color: "#F59E0B", probability: 15, isWinner: true, isActive: true },
    { id: "prize_5", label: "MYSTERY GIFT", code: "GIFT50", color: "#10B981", probability: 10, isWinner: true, isActive: true },
    { id: "prize_6", label: "5% OFF", code: "WELCOME5", color: "#8B5CF6", probability: 15, isWinner: true, isActive: true },
  ],
  widgetTitle: "Spin & Win!",
  subtitleText: "Spin the wheel of fortune to unlock exclusive discounts",
  rewardWonText: "Congratulations! You Won! 🎉",
  noRewardText: "Better luck next time!",
  ctaText: "🎁 Claim My Reward",
  customTextsJSON: "{}",
};

const LOCAL_STORAGE_KEY = "wheel_of_fortune_app_settings";
const LOCAL_LEADS_KEY = "wheel_of_fortune_local_leads";

const SETTINGS_COLLECTIONS = [
  "WheelAppSettings",
  "@deniz-uyanik/wheel-of-fortune/WheelAppSettings",
  "wheelAppSettings",
  "Wheel_App_Settings",
];

const WINNERS_COLLECTIONS = [
  "WheelWinners",
  "@deniz-uyanik/wheel-of-fortune/WheelWinners",
  "wheelWinners",
  "Wheel_Winners",
];

function stripSystemFields(obj: Record<string, any>): Record<string, any> {
  const clean = { ...obj };
  delete clean._id;
  delete clean._createdDate;
  delete clean._updatedDate;
  delete clean._owner;
  return clean;
}

// ─── Settings Fetch & Save ──────────────────────────────────────────────────
export async function fetchSettings(): Promise<AppSettings> {
  for (const coll of SETTINGS_COLLECTIONS) {
    try {
      let queryBuilder = (items as any).query(coll, { paging: { limit: 1 } });
      const result = typeof queryBuilder?.find === "function" ? await queryBuilder.find() : await queryBuilder;

      if (result?.items && result.items.length > 0) {
        const item = result.items[0];
        const loaded: AppSettings = {
          isActive: item.isActive ?? DEFAULT_SETTINGS.isActive,
          colorTheme: item.colorTheme || DEFAULT_SETTINGS.colorTheme,
          defaultLang: item.defaultLang || DEFAULT_SETTINGS.defaultLang,
          dailyLimit: Number(item.dailyLimit) || DEFAULT_SETTINGS.dailyLimit,
          spinButtonText: item.spinButtonText || DEFAULT_SETTINGS.spinButtonText,
          marketingConsentText: item.marketingConsentText || DEFAULT_SETTINGS.marketingConsentText,
          rewardPool: item.rewardPool
            ? typeof item.rewardPool === "string"
              ? JSON.parse(item.rewardPool)
              : item.rewardPool
            : DEFAULT_SETTINGS.rewardPool,
          widgetTitle: item.widgetTitle || DEFAULT_SETTINGS.widgetTitle,
          subtitleText: item.subtitleText || DEFAULT_SETTINGS.subtitleText,
          rewardWonText: item.rewardWonText || DEFAULT_SETTINGS.rewardWonText,
          noRewardText: item.noRewardText || DEFAULT_SETTINGS.noRewardText,
          ctaText: item.ctaText || DEFAULT_SETTINGS.ctaText,
          customTextsJSON: item.customTextsJSON || DEFAULT_SETTINGS.customTextsJSON,
        };

        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(loaded));
        } catch {}

        return loaded;
      }
    } catch {
      // next candidate
    }
  }

  // Local fallback
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}

  return DEFAULT_SETTINGS;
}

export async function persistSettings(settings: Partial<AppSettings>): Promise<boolean> {
  const merged: AppSettings = {
    ...DEFAULT_SETTINGS,
    ...settings,
  };

  const payload: Record<string, any> = {
    siteId: "default",
    isActive: merged.isActive,
    colorTheme: merged.colorTheme,
    defaultLang: merged.defaultLang,
    dailyLimit: merged.dailyLimit,
    spinButtonText: merged.spinButtonText,
    marketingConsentText: merged.marketingConsentText,
    rewardPool: JSON.stringify(merged.rewardPool),
    widgetTitle: merged.widgetTitle,
    subtitleText: merged.subtitleText,
    rewardWonText: merged.rewardWonText,
    noRewardText: merged.noRewardText,
    ctaText: merged.ctaText,
    customTextsJSON: merged.customTextsJSON,
    updatedAt: new Date(),
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(merged));
  } catch {}

  for (const coll of SETTINGS_COLLECTIONS) {
    try {
      const q = (items as any).query(coll, { paging: { limit: 1 } });
      const res = typeof q?.find === "function" ? await q.find() : await q;

      if (res?.items && res.items.length > 0) {
        const existing = res.items[0];
        const safe = stripSystemFields(existing);
        await items.update(coll, { ...safe, ...payload, _id: existing._id });
        return true;
      } else {
        await items.insert(coll, payload);
        return true;
      }
    } catch {
      // next
    }
  }

  return true;
}

// ─── Leads Management ───────────────────────────────────────────────────────
export async function fetchLeads(options: { page?: number; pageSize?: number; status?: string } = {}): Promise<{
  items: Lead[];
  total: number;
}> {
  const pageSize = options.pageSize || 50;

  for (const coll of WINNERS_COLLECTIONS) {
    try {
      let q = (items as any).query(coll, { paging: { limit: pageSize } });
      if (options.status && options.status !== "all") {
        q = q.eq("status", options.status);
      }
      const res = typeof q?.find === "function" ? await q.find() : await q;
      if (res?.items) {
        return { items: res.items, total: res.totalCount || res.items.length };
      }
    } catch {
      // next
    }
  }

  // Local leads fallback
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_KEY);
    if (raw) {
      const leads = JSON.parse(raw);
      return { items: leads, total: leads.length };
    }
  } catch {}

  return { items: [], total: 0 };
}

export async function patchLeadStatus(leadId: string, status: Lead["status"]): Promise<boolean> {
  // Update local storage
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const idx = list.findIndex((l: any) => l._id === leadId);
      if (idx !== -1) {
        list[idx].status = status;
        localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(list));
      }
    }
  } catch {}

  for (const coll of WINNERS_COLLECTIONS) {
    try {
      const current = await items.get(coll, leadId);
      if (current) {
        const safe = stripSystemFields(current as any);
        await items.update(coll, { ...safe, status, _id: leadId });
        return true;
      }
    } catch {
      // next
    }
  }

  return true;
}

export async function patchLeadNotes(leadId: string, notes: string): Promise<boolean> {
  // Update local storage
  try {
    const raw = localStorage.getItem(LOCAL_LEADS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const idx = list.findIndex((l: any) => l._id === leadId);
      if (idx !== -1) {
        list[idx].notes = notes;
        localStorage.setItem(LOCAL_LEADS_KEY, JSON.stringify(list));
      }
    }
  } catch {}

  for (const coll of WINNERS_COLLECTIONS) {
    try {
      const current = await items.get(coll, leadId);
      if (current) {
        const safe = stripSystemFields(current as any);
        await items.update(coll, { ...safe, notes, _id: leadId });
        return true;
      }
    } catch {
      // next
    }
  }

  return true;
}

export async function fetchMetrics(): Promise<{
  totalSpins: number;
  winnersCount: number;
  leadsCount: number;
  conversionRate: number;
}> {
  const leadsData = await fetchLeads();
  const leads = leadsData.items;
  const total = leads.length;
  const winners = leads.filter((l) => l.isWinner).length;
  const emails = leads.filter((l) => l.email).length;
  const conversionRate = total > 0 ? Math.round((emails / total) * 100) : 0;

  return {
    totalSpins: total,
    winnersCount: winners,
    leadsCount: emails,
    conversionRate,
  };
}
