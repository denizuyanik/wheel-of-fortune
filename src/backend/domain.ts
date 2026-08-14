import { z } from 'zod';

const hexColor = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color');
const optionalDateTime = z.iso.datetime().nullable().optional();
const optionalHttpsUrl = z
  .string()
  .trim()
  .max(2_048)
  .refine((value) => !value || /^https:\/\//i.test(value), 'Use an HTTPS URL');
const optionalFormId = z.union([z.literal(''), z.uuid('Use a valid Wix Form ID')]);

export const prizeInputSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  label: z.string().trim().min(1).max(48),
  couponCode: z.string().trim().max(80).default(''),
  color: hexColor,
  weight: z.number().int().min(1).max(10_000),
  position: z.number().int().min(0).max(24),
  enabled: z.boolean().default(true),
});

export const campaignInputSchema = z
  .object({
    id: z.string().min(1).max(80).optional(),
    name: z.string().trim().min(1).max(80),
    status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']),
    headline: z.string().trim().min(1).max(100),
    buttonLabel: z.string().trim().min(1).max(32),
    primaryColor: hexColor,
    backgroundColor: hexColor,
    backgroundMediaType: z.enum(['NONE', 'IMAGE', 'VIDEO']).default('NONE'),
    backgroundMediaUrl: optionalHttpsUrl.default(''),
    wixFormId: optionalFormId.default(''),
    privacyPolicyUrl: optionalHttpsUrl.default(''),
    dailySpinLimit: z.number().int().min(1).max(20),
    startsAt: optionalDateTime,
    endsAt: optionalDateTime,
    prizes: z.array(prizeInputSchema).min(2).max(12),
  })
  .superRefine((campaign, context) => {
    const enabled = campaign.prizes.filter((prize) => prize.enabled);
    if (enabled.length < 2) {
      context.addIssue({ code: 'custom', path: ['prizes'], message: 'Enable at least two prizes' });
    }
    if (new Set(campaign.prizes.map((prize) => prize.position)).size !== campaign.prizes.length) {
      context.addIssue({ code: 'custom', path: ['prizes'], message: 'Prize positions must be unique' });
    }
    if (campaign.startsAt && campaign.endsAt && campaign.startsAt >= campaign.endsAt) {
      context.addIssue({ code: 'custom', path: ['endsAt'], message: 'End time must follow start time' });
    }
    if (campaign.status === 'ACTIVE' && !campaign.wixFormId) {
      context.addIssue({ code: 'custom', path: ['wixFormId'], message: 'An active campaign needs a Wix Form ID' });
    }
    if (campaign.backgroundMediaType !== 'NONE' && !campaign.backgroundMediaUrl) {
      context.addIssue({ code: 'custom', path: ['backgroundMediaUrl'], message: 'Add a background media URL' });
    }
  });

export const participantInputSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(7).max(32).regex(/^[+()\-\s\d]+$/, 'Enter a valid phone number'),
  email: z.email().max(254),
  contactConsent: z.literal(true),
  marketingConsent: z.boolean().default(false),
});

export const spinInputSchema = z.object({
  campaignId: z.string().min(1).max(80),
  idempotencyKey: z.string().uuid(),
  participant: participantInputSchema,
});

export type CampaignInput = z.infer<typeof campaignInputSchema>;
export type PrizeInput = z.infer<typeof prizeInputSchema>;
export type ParticipantInput = z.infer<typeof participantInputSchema>;

export type CampaignRecord = Omit<CampaignInput, 'id' | 'prizes'> & { _id: string };
export type PrizeRecord = PrizeInput & { _id: string; campaignId: string };
export type SpinRecord = {
  _id: string;
  campaignId: string;
  prizeId: string;
  idempotencyKey: string;
  visitorHash: string;
  outcomeLabel: string;
  couponCode: string;
  formSubmissionId?: string;
  spunAt: Date;
};

export const defaultCampaign: CampaignInput = {
  name: 'Welcome wheel',
  status: 'DRAFT',
  headline: 'Spin the wheel',
  buttonLabel: 'Spin now',
  primaryColor: '#6d5dfc',
  backgroundColor: '#f4f1ff',
  backgroundMediaType: 'NONE',
  backgroundMediaUrl: '',
  wixFormId: '',
  privacyPolicyUrl: '',
  dailySpinLimit: 1,
  startsAt: null,
  endsAt: null,
  prizes: [
    { label: '10% off', couponCode: 'WELCOME10', color: '#6d5dfc', weight: 30, position: 0, enabled: true },
    { label: 'Free shipping', couponCode: 'SHIPFREE', color: '#ffb703', weight: 20, position: 1, enabled: true },
    { label: 'Try again', couponCode: '', color: '#ff7a59', weight: 50, position: 2, enabled: true },
  ],
};

export function isCampaignActive(campaign: CampaignRecord, now = new Date()): boolean {
  if (campaign.status !== 'ACTIVE') return false;
  if (campaign.startsAt && new Date(campaign.startsAt) > now) return false;
  if (campaign.endsAt && new Date(campaign.endsAt) <= now) return false;
  return true;
}

export function chooseWeightedPrize(prizes: PrizeRecord[]): PrizeRecord {
  const enabled = prizes.filter((prize) => prize.enabled && prize.weight > 0);
  const total = enabled.reduce((sum, prize) => sum + prize.weight, 0);
  if (!enabled.length || total <= 0) throw new Error('Campaign has no eligible prizes');

  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  let cursor = (random[0] / 0x1_0000_0000) * total;
  for (const prize of enabled) {
    cursor -= prize.weight;
    if (cursor < 0) return prize;
  }
  return enabled[enabled.length - 1];
}
