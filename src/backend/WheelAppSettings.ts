/**
 * WheelAppSettings Data Collection
 * =====================================
 * Stores per-site widget configuration set from the Dashboard or Wix Studio Panel.
 * One record per installed app instance.
 */

import type { DataCollection } from "@wix/astro/builders";

export const collectionIdSuffix = "WheelAppSettings";

export default {
  idSuffix: collectionIdSuffix,
  displayName: "Wheel of Fortune — Settings",
  fields: [
    {
      type: "TEXT",
      displayName: "Site ID",
      key: "siteId",
    },
    {
      type: "BOOLEAN",
      displayName: "Is Active",
      key: "isActive",
    },
    {
      type: "TEXT",
      displayName: "Color Theme",
      key: "colorTheme",
    },
    {
      type: "TEXT",
      displayName: "Default Language",
      key: "defaultLang",
    },
    {
      type: "NUMBER",
      displayName: "Daily Spin Limit",
      key: "dailyLimit",
    },
    {
      type: "TEXT",
      displayName: "Reward Pool (JSON)",
      key: "rewardPool",
    },
    {
      type: "TEXT",
      displayName: "Widget Title",
      key: "widgetTitle",
    },
    {
      type: "TEXT",
      displayName: "Subtitle Text",
      key: "subtitleText",
    },
    {
      type: "TEXT",
      displayName: "Reward Won Text",
      key: "rewardWonText",
    },
    {
      type: "TEXT",
      displayName: "No Reward Text",
      key: "noRewardText",
    },
    {
      type: "TEXT",
      displayName: "CTA Button Text",
      key: "ctaText",
    },
    {
      type: "TEXT",
      displayName: "Spin Button Text",
      key: "spinButtonText",
    },
    {
      type: "TEXT",
      displayName: "Marketing / Privacy Consent Text",
      key: "marketingConsentText",
    },
    {
      type: "TEXT",
      displayName: "Custom Texts JSON",
      key: "customTextsJSON",
    },
    {
      type: "DATE",
      displayName: "Updated At",
      key: "updatedAt",
    },
  ],
  displayField: "siteId",
  dataPermissions: {
    itemRead: "ANYONE",
    itemInsert: "ANYONE",
    itemUpdate: "ANYONE",
    itemRemove: "ANYONE",
  },
  indexes: [
    {
      fields: [{ path: "siteId", order: "ASC" }],
      unique: true,
    },
  ],
  initialData: [
    {
      siteId: "default",
      isActive: true,
      colorTheme: "gold",
      defaultLang: "en",
      dailyLimit: 1,
      spinButtonText: "SPIN",
      marketingConsentText: "I consent to receiving marketing communications and agree to the Privacy Policy.",
      rewardPool: JSON.stringify([
        { id: "prize_1", label: "10% OFF", code: "SPIN10", color: "#6366F1", probability: 25, isWinner: true, isActive: true },
        { id: "prize_2", label: "FREE SHIPPING", code: "FREESHIP", color: "#EC4899", probability: 20, isWinner: true, isActive: true },
        { id: "prize_3", label: "TRY AGAIN", code: "", color: "#64748B", probability: 15, isWinner: false, isActive: true },
        { id: "prize_4", label: "20% OFF", code: "LUCKY20", color: "#F59E0B", probability: 15, isWinner: true, isActive: true },
        { id: "prize_5", label: "MYSTERY GIFT", code: "GIFT50", color: "#10B981", probability: 10, isWinner: true, isActive: true },
        { id: "prize_6", label: "5% OFF", code: "WELCOME5", color: "#8B5CF6", probability: 15, isWinner: true, isActive: true },
      ]),
      widgetTitle: "Spin & Win!",
      subtitleText: "Spin the wheel of fortune to unlock exclusive discounts",
      rewardWonText: "Congratulations! You Won! 🎉",
      noRewardText: "Better luck next time!",
      ctaText: "🎁 Claim My Reward",
      customTextsJSON: "{}",
    },
  ],
} satisfies DataCollection;
