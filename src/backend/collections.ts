import type { DataCollection } from '@wix/astro/builders';

const privileged = {
  itemInsert: 'PRIVILEGED',
  itemRead: 'PRIVILEGED',
  itemRemove: 'PRIVILEGED',
  itemUpdate: 'PRIVILEGED',
} as const;

export const CAMPAIGNS_COLLECTION = 'WheelCampaigns';
export const PRIZES_COLLECTION = 'WheelPrizes';
export const SPINS_COLLECTION = 'WheelSpins';

export const campaignsCollection = {
  idSuffix: CAMPAIGNS_COLLECTION,
  displayName: 'Wheel Campaigns',
  displayField: 'name',
  dataPermissions: privileged,
  fields: [
    { key: 'name', displayName: 'Name', type: 'TEXT' },
    { key: 'status', displayName: 'Status', type: 'TEXT' },
    { key: 'headline', displayName: 'Headline', type: 'TEXT' },
    { key: 'buttonLabel', displayName: 'Button Label', type: 'TEXT' },
    { key: 'primaryColor', displayName: 'Primary Color', type: 'TEXT' },
    { key: 'backgroundColor', displayName: 'Background Color', type: 'TEXT' },
    { key: 'centerText', displayName: 'Center Text', type: 'TEXT' },
    { key: 'centerColor', displayName: 'Center Color', type: 'TEXT' },
    { key: 'centerTextColor', displayName: 'Center Text Color', type: 'TEXT' },
    { key: 'centerImageUrl', displayName: 'Center Image URL', type: 'URL' },
    { key: 'backgroundMediaType', displayName: 'Background Media Type', type: 'TEXT' },
    { key: 'backgroundMediaUrl', displayName: 'Background Media URL', type: 'URL' },
    { key: 'wixFormId', displayName: 'Wix Form ID', type: 'TEXT' },
    { key: 'privacyPolicyUrl', displayName: 'Privacy Policy URL', type: 'URL' },
    { key: 'dailySpinLimit', displayName: 'Daily Spin Limit', type: 'NUMBER' },
    { key: 'startsAt', displayName: 'Starts At', type: 'DATETIME' },
    { key: 'endsAt', displayName: 'Ends At', type: 'DATETIME' },
  ],
  indexes: [{ fields: [{ path: 'status', order: 'ASC' }] }],
  initialData: [],
} satisfies DataCollection;

export const prizesCollection = {
  idSuffix: PRIZES_COLLECTION,
  displayName: 'Wheel Prizes',
  displayField: 'label',
  dataPermissions: privileged,
  fields: [
    { key: 'campaignId', displayName: 'Campaign ID', type: 'TEXT' },
    { key: 'label', displayName: 'Label', type: 'TEXT' },
    { key: 'couponCode', displayName: 'Coupon Code', type: 'TEXT', encrypted: true },
    { key: 'formSubmissionId', displayName: 'Form Submission ID', type: 'TEXT' },
    { key: 'color', displayName: 'Color', type: 'TEXT' },
    { key: 'weight', displayName: 'Weight', type: 'NUMBER' },
    { key: 'position', displayName: 'Position', type: 'NUMBER' },
    { key: 'enabled', displayName: 'Enabled', type: 'BOOLEAN' },
  ],
  indexes: [{ fields: [{ path: 'campaignId', order: 'ASC' }, { path: 'position', order: 'ASC' }] }],
  initialData: [],
} satisfies DataCollection;

export const spinsCollection = {
  idSuffix: SPINS_COLLECTION,
  displayName: 'Wheel Spins',
  displayField: 'outcomeLabel',
  dataPermissions: privileged,
  fields: [
    { key: 'campaignId', displayName: 'Campaign ID', type: 'TEXT' },
    { key: 'prizeId', displayName: 'Prize ID', type: 'TEXT' },
    { key: 'idempotencyKey', displayName: 'Idempotency Key', type: 'TEXT' },
    { key: 'visitorHash', displayName: 'Visitor Hash', type: 'TEXT' },
    { key: 'outcomeLabel', displayName: 'Outcome Label', type: 'TEXT' },
    { key: 'couponCode', displayName: 'Coupon Code', type: 'TEXT', encrypted: true },
    { key: 'spunAt', displayName: 'Spun At', type: 'DATETIME' },
  ],
  indexes: [
    { unique: true, fields: [{ path: 'idempotencyKey', order: 'ASC' }] },
    { fields: [{ path: 'campaignId', order: 'ASC' }, { path: 'spunAt', order: 'DESC' }] },
    { fields: [{ path: 'visitorHash', order: 'ASC' }, { path: 'spunAt', order: 'DESC' }] },
  ],
  initialData: [],
} satisfies DataCollection;
