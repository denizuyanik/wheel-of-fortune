/**
 * Wheel of Fortune — Backend Web Module
 * =====================================
 * Server-side secure random reward draw, CRM contact creation,
 * settings synchronization, and lead management.
 */

import { items } from "@wix/data";
import { contacts } from "@wix/crm";

export type PermissionType = "Anyone" | "SiteMember" | "SiteMemberAuthor" | "Admin";

export const Permissions = {
  Anyone: "Anyone" as PermissionType,
  SiteMember: "SiteMember" as PermissionType,
  SiteMemberAuthor: "SiteMemberAuthor" as PermissionType,
  Admin: "Admin" as PermissionType,
};

export function webMethod<T extends (...args: any[]) => any>(_permission: PermissionType, handler: T): T {
  return handler;
}

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

export interface LeadSubmissionData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  rewardCode: string;
  prizeLabel: string;
  isWinner: boolean;
  language: string;
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

// Helper: Read active settings
async function fetchCurrentSettings(): Promise<AppSettings> {
  for (const coll of SETTINGS_COLLECTIONS) {
    try {
      const q = (items as any).query(coll, { paging: { limit: 1 } });
      const result = typeof q?.find === "function" ? await q.find() : await q;
      if (result?.items && result.items.length > 0) {
        const item = result.items[0];
        return {
          isActive: item.isActive ?? DEFAULT_SETTINGS.isActive,
          colorTheme: item.colorTheme || DEFAULT_SETTINGS.colorTheme,
          defaultLang: item.defaultLang || DEFAULT_SETTINGS.defaultLang,
          dailyLimit: Number(item.dailyLimit) || DEFAULT_SETTINGS.dailyLimit,
          rewardPool: item.rewardPool
            ? (typeof item.rewardPool === "string" ? JSON.parse(item.rewardPool) : item.rewardPool)
            : DEFAULT_SETTINGS.rewardPool,
          widgetTitle: item.widgetTitle || DEFAULT_SETTINGS.widgetTitle,
          subtitleText: item.subtitleText || DEFAULT_SETTINGS.subtitleText,
          rewardWonText: item.rewardWonText || DEFAULT_SETTINGS.rewardWonText,
          noRewardText: item.noRewardText || DEFAULT_SETTINGS.noRewardText,
          ctaText: item.ctaText || DEFAULT_SETTINGS.ctaText,
          spinButtonText: item.spinButtonText || DEFAULT_SETTINGS.spinButtonText,
          marketingConsentText: item.marketingConsentText || DEFAULT_SETTINGS.marketingConsentText,
          customTextsJSON: item.customTextsJSON || DEFAULT_SETTINGS.customTextsJSON,
        };
      }
    } catch {
      // Try next
    }
  }
  return DEFAULT_SETTINGS;
}

// ─── 1. Secure Anti-Cheat Spin Draw ─────────────────────────────────────────
export const drawReward = webMethod(
  Permissions.Anyone,
  async (_clientDailyCount = 0): Promise<{
    success: boolean;
    prizeIndex: number;
    prizeId: string;
    label: string;
    couponCode: string;
    isWinner: boolean;
    targetAngle: number;
    spinToken: string;
    error?: string;
  }> => {
    const settings = await fetchCurrentSettings();

    if (!settings.isActive) {
      return {
        success: false,
        prizeIndex: 0,
        prizeId: "",
        label: "",
        couponCode: "",
        isWinner: false,
        targetAngle: 0,
        spinToken: "",
        error: "Wheel of Fortune is currently inactive",
      };
    }

    const pool = (settings.rewardPool && settings.rewardPool.length > 0)
      ? settings.rewardPool
      : DEFAULT_SETTINGS.rewardPool;

    const activePrizes = pool.filter((p) => p.isActive !== false);
    if (activePrizes.length === 0) {
      return {
        success: false,
        prizeIndex: 0,
        prizeId: "",
        label: "",
        couponCode: "",
        isWinner: false,
        targetAngle: 0,
        spinToken: "",
        error: "No active prizes found",
      };
    }

    const totalWeight = pool.reduce((sum, p) => sum + (p.isActive !== false ? Math.max(1, p.probability || 10) : 0), 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < pool.length; i++) {
      const prize = pool[i];
      if (prize.isActive === false) continue;
      const weight = Math.max(1, prize.probability || 10);
      if (randomWeight <= weight) {
        selectedIndex = i;
        break;
      }
      randomWeight -= weight;
    }

    const selectedPrize = pool[selectedIndex];
    const totalSegments = pool.length;
    const segmentAngle = 360 / totalSegments;

    const jitter = (Math.random() - 0.5) * (segmentAngle * 0.7);
    const targetSliceAngle = (selectedIndex + 0.5) * segmentAngle + jitter;
    const normalizedStopAngle = (270 - targetSliceAngle + 720) % 360;
    const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    const finalTargetAngle = fullSpins + normalizedStopAngle;

    const tokenObj = {
      id: selectedPrize.id,
      code: selectedPrize.code,
      label: selectedPrize.label,
      ts: Date.now(),
      rnd: Math.random(),
    };
    const spinToken = typeof btoa !== "undefined"
      ? btoa(JSON.stringify(tokenObj))
      : JSON.stringify(tokenObj);

    return {
      success: true,
      prizeIndex: selectedIndex,
      prizeId: selectedPrize.id,
      label: selectedPrize.label,
      couponCode: selectedPrize.code || "",
      isWinner: selectedPrize.isWinner !== false && !!selectedPrize.code,
      targetAngle: finalTargetAngle,
      spinToken,
    };
  }
);

// ─── 2. Submit Winner Lead (Wix Data & Wix CRM) ────────────────────────────
export const submitWinnerLead = webMethod(
  Permissions.Anyone,
  async (data: LeadSubmissionData): Promise<{ success: boolean; id?: string; error?: string }> => {
    if (!data.email || !data.firstName) {
      return { success: false, error: "First name and email are required" };
    }

    const leadRecord = {
      firstName: data.firstName.trim(),
      lastName: (data.lastName || "").trim(),
      phone: (data.phone || "").trim(),
      email: data.email.trim().toLowerCase(),
      rewardCode: data.rewardCode || "",
      prizeLabel: data.prizeLabel || "",
      isWinner: Boolean(data.isWinner),
      language: data.language || "en",
      status: "new",
      spunAt: new Date(),
      marketingConsent: Boolean(data.marketingConsent),
      siteId: data.siteId || "default",
    };

    let savedId: string | undefined;

    for (const coll of WINNERS_COLLECTIONS) {
      try {
        const result = await items.insert(coll, leadRecord);
        if (result && (result as any)._id) {
          savedId = String((result as any)._id);
          break;
        }
      } catch (err) {
        console.warn("[rewardLogic] Insert candidate:", coll, err);
      }
    }

    // Auto-create CRM contact if possible
    try {
      const labels = ["Wheel of Fortune Winner"];
      if (data.marketingConsent) labels.push("Marketing Consent");
      if (data.isWinner) labels.push("Prize Winner");

      await contacts.createContact({
        name: {
          first: data.firstName,
          last: data.lastName || "",
        },
        emails: {
          items: [{ tag: "MAIN", email: data.email }],
        },
        phones: data.phone
          ? { items: [{ tag: "MOBILE", phone: data.phone }] }
          : undefined,
        labelKeys: { items: labels },
      });
      console.log("[rewardLogic] CRM contact created for:", data.email);
    } catch (crmErr) {
      console.warn("[rewardLogic] CRM contact creation note:", crmErr);
    }

    return { success: true, id: savedId };
  }
);

// ─── 3. Get Settings ────────────────────────────────────────────────────────
export const getSettings = webMethod(
  Permissions.Anyone,
  async (): Promise<AppSettings> => {
    return await fetchCurrentSettings();
  }
);

// ─── 4. Save Settings (Dashboard & Editor Sync) ─────────────────────────────
export const saveSettings = webMethod(
  Permissions.SiteMember,
  async (settings: Partial<AppSettings>): Promise<{ success: boolean; error?: string }> => {
    const record: Record<string, unknown> = {
      siteId: "default",
      isActive: settings.isActive ?? DEFAULT_SETTINGS.isActive,
      colorTheme: settings.colorTheme || DEFAULT_SETTINGS.colorTheme,
      defaultLang: settings.defaultLang || DEFAULT_SETTINGS.defaultLang,
      dailyLimit: Number(settings.dailyLimit) || DEFAULT_SETTINGS.dailyLimit,
      rewardPool: JSON.stringify(settings.rewardPool || DEFAULT_SETTINGS.rewardPool),
      widgetTitle: settings.widgetTitle || DEFAULT_SETTINGS.widgetTitle,
      subtitleText: settings.subtitleText || DEFAULT_SETTINGS.subtitleText,
      rewardWonText: settings.rewardWonText || DEFAULT_SETTINGS.rewardWonText,
      noRewardText: settings.noRewardText || DEFAULT_SETTINGS.noRewardText,
      ctaText: settings.ctaText || DEFAULT_SETTINGS.ctaText,
      spinButtonText: settings.spinButtonText || DEFAULT_SETTINGS.spinButtonText,
      marketingConsentText: settings.marketingConsentText || DEFAULT_SETTINGS.marketingConsentText,
      customTextsJSON: settings.customTextsJSON || DEFAULT_SETTINGS.customTextsJSON,
      updatedAt: new Date(),
    };

    for (const coll of SETTINGS_COLLECTIONS) {
      try {
        const q = (items as any).query(coll, { paging: { limit: 1 } });
        const existing = typeof q?.find === "function" ? await q.find() : await q;
        if (existing?.items && existing.items.length > 0) {
          record._id = existing.items[0]._id;
          await items.update(coll, record as any);
        } else {
          await items.insert(coll, record as any);
        }
        return { success: true };
      } catch (err) {
        console.warn("[rewardLogic] saveSettings try failed for:", coll, err);
      }
    }

    return { success: false, error: "Settings collection not reachable" };
  }
);

// ─── 5. Leads List for Dashboard CRM ────────────────────────────────────────
export const getLeads = webMethod(
  Permissions.SiteMember,
  async (options: { page?: number; pageSize?: number; status?: string; search?: string } = {}): Promise<{
    items: Record<string, unknown>[];
    total: number;
    page: number;
    pageSize: number;
  }> => {
    const pageSize = options.pageSize || 20;
    const page = options.page || 1;

    for (const coll of WINNERS_COLLECTIONS) {
      try {
        let query = (items as any).query(coll, { paging: { limit: pageSize } });
        if (options.status && options.status !== "all") {
          query = query.eq("status", options.status);
        }

        const result = typeof query?.find === "function" ? await query.find() : await query;
        if (result?.items) {
          return {
            items: result.items,
            total: result.totalCount || result.items.length,
            page,
            pageSize,
          };
        }
      } catch {
        // Try next
      }
    }

    return { items: [], total: 0, page, pageSize };
  }
);

// ─── 6. Update Lead Status ──────────────────────────────────────────────────
export const updateLeadStatus = webMethod(
  Permissions.SiteMember,
  async (leadId: string, status: "new" | "contacted" | "converted" | "lost"): Promise<{ success: boolean }> => {
    for (const coll of WINNERS_COLLECTIONS) {
      try {
        const existing = await items.get(coll, leadId);
        if (existing) {
          await items.update(coll, { ...existing, status, updatedAt: new Date(), _id: leadId });
          return { success: true };
        }
      } catch {
        // Next
      }
    }
    return { success: false };
  }
);

// ─── 7. Dashboard Metrics ───────────────────────────────────────────────────
export const getDashboardMetrics = webMethod(
  Permissions.SiteMember,
  async (): Promise<{
    totalSpins: number;
    winnersCount: number;
    leadsCount: number;
    conversionRate: number;
  }> => {
    for (const coll of WINNERS_COLLECTIONS) {
      try {
        const q = (items as any).query(coll, { paging: { limit: 1000 } });
        const allResult = typeof q?.find === "function" ? await q.find() : await q;
        if (allResult?.items) {
          const itemsList = allResult.items;
          const total = itemsList.length;
          const winners = itemsList.filter((i: any) => i.isWinner).length;
          const leads = itemsList.filter((i: any) => i.email).length;
          const conversionRate = total > 0 ? Math.round((leads / total) * 100) : 0;

          return {
            totalSpins: total,
            winnersCount: winners,
            leadsCount: leads,
            conversionRate,
          };
        }
      } catch {
        // Try next
      }
    }

    return { totalSpins: 0, winnersCount: 0, leadsCount: 0, conversionRate: 0 };
  }
);
