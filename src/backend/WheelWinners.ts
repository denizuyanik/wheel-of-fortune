/**
 * WheelWinners Data Collection
 * ================================
 * Stores every visitor who spins the wheel and submits their contact details.
 * Site owners use this as a CRM lead list in the dashboard.
 */

import type { DataCollection } from "@wix/astro/builders";

export const collectionIdSuffix = "WheelWinners";

export default {
  idSuffix: collectionIdSuffix,
  displayName: "Wheel of Fortune — Leads",
  fields: [
    {
      type: "TEXT",
      displayName: "First Name",
      key: "firstName",
    },
    {
      type: "TEXT",
      displayName: "Last Name",
      key: "lastName",
    },
    {
      type: "TEXT",
      displayName: "Phone",
      key: "phone",
    },
    {
      type: "TEXT",
      displayName: "Email",
      key: "email",
    },
    {
      type: "TEXT",
      displayName: "Reward Code",
      key: "rewardCode",
    },
    {
      type: "TEXT",
      displayName: "Prize Label",
      key: "prizeLabel",
    },
    {
      type: "BOOLEAN",
      displayName: "Is Winner",
      key: "isWinner",
    },
    {
      type: "TEXT",
      displayName: "Language",
      key: "language",
    },
    {
      type: "TEXT",
      displayName: "Status",
      key: "status",
    },
    {
      type: "DATE",
      displayName: "Spun At",
      key: "spunAt",
    },
    {
      type: "BOOLEAN",
      displayName: "Marketing / Privacy Consent",
      key: "marketingConsent",
    },
    {
      type: "TEXT",
      displayName: "Site ID",
      key: "siteId",
    },
  ],
  displayField: "email",
  dataPermissions: {
    itemInsert: "ANYONE",
    itemRead: "ANYONE",
    itemUpdate: "ANYONE",
    itemRemove: "ANYONE",
  },
  indexes: [
    {
      fields: [{ path: "spunAt", order: "DESC" }],
      unique: false,
    },
    {
      fields: [{ path: "status", order: "ASC" }],
      unique: false,
    },
    {
      fields: [{ path: "siteId", order: "ASC" }],
      unique: false,
    },
  ],
  initialData: [],
} satisfies DataCollection;
