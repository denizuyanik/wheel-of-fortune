import type { CampaignInput, CampaignRecord, PrizeRecord, SpinRecord } from './domain';

type DevelopmentStore = {
  active: boolean;
  campaign: CampaignRecord | null;
  prizes: PrizeRecord[];
  spins: SpinRecord[];
};

const STORE_KEY = Symbol.for('wheel-of-fortune.development-store');

function store(): DevelopmentStore {
  const runtime = globalThis as typeof globalThis & { [STORE_KEY]?: DevelopmentStore };
  runtime[STORE_KEY] ??= { active: false, campaign: null, prizes: [], spins: [] };
  return runtime[STORE_KEY];
}

export function activateDevelopmentStore(): void {
  store().active = true;
}

export function isDevelopmentStoreActive(): boolean {
  return store().active;
}

export function getDevelopmentDashboardData() {
  const developmentStore = store();
  const campaign = developmentStore.campaign;
  if (!campaign) return null;

  const prizes = developmentStore.prizes
    .filter((prize) => prize.campaignId === campaign._id)
    .sort((left, right) => left.position - right.position);
  const spins = developmentStore.spins.filter((spin) => spin.campaignId === campaign._id);

  return {
    campaign: {
      ...campaign,
      id: campaign._id,
      prizes: prizes.map(({ _id, ...prize }) => ({ ...prize, id: _id })),
    },
    metrics: {
      totalSpins: spins.length,
      wins: spins.filter((spin) => Boolean(spin.couponCode)).length,
      uniqueVisitors: new Set(spins.map((spin) => spin.visitorHash)).size,
    },
  };
}

export function saveDevelopmentCampaign(input: CampaignInput) {
  const developmentStore = store();
  const { prizes, id, ...campaignFields } = input;
  const campaignId = id ?? developmentStore.campaign?._id ?? crypto.randomUUID();

  developmentStore.campaign = { _id: campaignId, ...campaignFields };
  developmentStore.prizes = prizes.map(({ id: prizeId, ...prize }) => ({
    _id: prizeId ?? crypto.randomUUID(),
    campaignId,
    ...prize,
  }));

  return { id: campaignId };
}

export function getDevelopmentPublicCampaign(campaignId?: string) {
  const developmentStore = store();
  const campaign = developmentStore.campaign;
  if (!campaign) return null;
  if (campaignId ? campaign._id !== campaignId : campaign.status !== 'ACTIVE') return null;

  const prizes = developmentStore.prizes
    .filter((prize) => prize.campaignId === campaign._id && prize.enabled)
    .sort((left, right) => left.position - right.position)
    .slice(0, 12);

  return { campaign, prizes };
}

export function findDevelopmentSpin(idempotencyKey: string): SpinRecord | null {
  return store().spins.find((spin) => spin.idempotencyKey === idempotencyKey) ?? null;
}

export function countDevelopmentVisitorSpins(visitorHash: string, campaignId: string, since: Date): number {
  return store().spins.filter(
    (spin) => spin.visitorHash === visitorHash && spin.campaignId === campaignId && spin.spunAt >= since,
  ).length;
}

export function recordDevelopmentSpin(spin: Omit<SpinRecord, '_id'>): SpinRecord {
  const savedSpin = { _id: crypto.randomUUID(), ...spin };
  store().spins.push(savedSpin);
  return savedSpin;
}
