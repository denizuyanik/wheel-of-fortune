import { items } from '@wix/data';
import { auth } from '@wix/essentials';
import type { CampaignInput, CampaignRecord, PrizeRecord, SpinRecord } from './domain';
import { CAMPAIGNS_COLLECTION, PRIZES_COLLECTION, SPINS_COLLECTION } from './collections';
import {
  activateDevelopmentStore,
  countDevelopmentVisitorSpins,
  findDevelopmentSpin,
  getDevelopmentDashboardData,
  getDevelopmentPublicCampaign,
  isDevelopmentStoreActive,
  recordDevelopmentSpin,
  saveDevelopmentCampaign,
} from './development-store';
import { ApiError } from './http';

const elevatedQuery = auth.elevate(items.query);
const elevatedInsert = auth.elevate(items.insert);
const elevatedUpdate = auth.elevate(items.update);

type QueryOptions = { elevated?: boolean; consistentRead?: boolean };

function isMissingCollectionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String((error as { message?: unknown })?.message ?? error);
  return /WDE0025|collection does not exist/i.test(message);
}

async function withDevelopmentStore<T>(operation: () => Promise<T>, fallback: () => T | Promise<T>): Promise<T> {
  if (import.meta.env.DEV && isDevelopmentStoreActive()) return fallback();

  try {
    return await operation();
  } catch (error) {
    if (!import.meta.env.DEV || !isMissingCollectionError(error)) throw error;
    activateDevelopmentStore();
    console.warn('Wix App Data collections are unavailable; using the development-only in-memory store.');
    return fallback();
  }
}

async function queryCollection<T extends Record<string, unknown>>(
  collection: string,
  filter: Record<string, unknown> = {},
  sort: Array<{ fieldName: string; order: 'ASC' | 'DESC' }> = [],
  limit = 100,
  options: QueryOptions = {},
): Promise<T[]> {
  const query = options.elevated ? elevatedQuery : items.query;
  const result = await query<T>(
    collection,
    { filter, sort, paging: { limit, offset: 0 } },
    { consistentRead: options.consistentRead ?? false },
  );
  return (result.items ?? []) as T[];
}

export async function requireDashboardUser(): Promise<void> {
  let token;
  try {
    token = await auth.getTokenInfo();
  } catch {
    throw new ApiError(401, 'WIX_AUTH_REQUIRED', 'A valid Wix dashboard token is required');
  }
  if (token.subjectType !== 'USER' && token.subjectType !== 'APP') {
    throw new ApiError(403, 'DASHBOARD_AUTH_REQUIRED', 'Dashboard authorization required');
  }
}

export async function getDashboardData() {
  await requireDashboardUser();
  return withDevelopmentStore(async () => {
    const campaigns = await queryCollection<CampaignRecord>(
      CAMPAIGNS_COLLECTION,
      {},
      [{ fieldName: '_updatedDate', order: 'DESC' }],
      1,
      { elevated: true },
    );
    const campaign = campaigns[0];
    if (!campaign) return null;
    const [prizes, spins] = await Promise.all([
      queryCollection<PrizeRecord>(
        PRIZES_COLLECTION,
        { campaignId: campaign._id },
        [{ fieldName: 'position', order: 'ASC' }],
        100,
        { elevated: true },
      ),
      queryCollection<SpinRecord>(
        SPINS_COLLECTION,
        { campaignId: campaign._id },
        [{ fieldName: 'spunAt', order: 'DESC' }],
        1_000,
        { elevated: true },
      ),
    ]);
    return {
      campaign: { ...campaign, id: campaign._id, prizes: prizes.map(({ _id, ...prize }) => ({ ...prize, id: _id })) },
      metrics: {
        totalSpins: spins.length,
        wins: spins.filter((spin) => Boolean(spin.couponCode)).length,
        uniqueVisitors: new Set(spins.map((spin) => spin.visitorHash)).size,
      },
    };
  }, getDevelopmentDashboardData);
}

export async function saveDashboardCampaign(input: CampaignInput) {
  await requireDashboardUser();
  return withDevelopmentStore(async () => {
    const { prizes, id, ...campaignFields } = input;
    const savedCampaign = id
      ? await elevatedUpdate(CAMPAIGNS_COLLECTION, { _id: id, ...campaignFields })
      : await elevatedInsert(CAMPAIGNS_COLLECTION, campaignFields);
    const campaignId = savedCampaign._id;
    if (!campaignId) throw new Error('Campaign could not be saved');

    const current = await queryCollection<PrizeRecord>(PRIZES_COLLECTION, { campaignId }, [], 100, {
      elevated: true,
      consistentRead: true,
    });
    const submittedIds = new Set(prizes.flatMap((prize) => (prize.id ? [prize.id] : [])));
    await Promise.all([
      ...prizes.map(({ id: prizeId, ...prize }) =>
        prizeId
          ? elevatedUpdate(PRIZES_COLLECTION, { _id: prizeId, campaignId, ...prize })
          : elevatedInsert(PRIZES_COLLECTION, { campaignId, ...prize }),
      ),
      ...current
        .filter((prize) => !submittedIds.has(prize._id))
        .map((prize) => elevatedUpdate(PRIZES_COLLECTION, { ...prize, enabled: false })),
    ]);
    return { id: campaignId };
  }, () => saveDevelopmentCampaign(input));
}

export async function getPublicCampaign(campaignId?: string) {
  return withDevelopmentStore(async () => {
    const campaigns = await queryCollection<CampaignRecord>(
      CAMPAIGNS_COLLECTION,
      campaignId ? { _id: campaignId } : { status: 'ACTIVE' },
      [{ fieldName: '_updatedDate', order: 'DESC' }],
      1,
      { elevated: true },
    );
    const campaign = campaigns[0];
    if (!campaign) return null;
    const prizes = await queryCollection<PrizeRecord>(
      PRIZES_COLLECTION,
      { campaignId: campaign._id, enabled: true },
      [{ fieldName: 'position', order: 'ASC' }],
      12,
      { elevated: true },
    );
    return { campaign, prizes };
  }, () => getDevelopmentPublicCampaign(campaignId));
}

export async function findSpinByIdempotencyKey(idempotencyKey: string): Promise<SpinRecord | null> {
  return withDevelopmentStore(async () => {
    const spins = await queryCollection<SpinRecord>(SPINS_COLLECTION, { idempotencyKey }, [], 1, {
      elevated: true,
      consistentRead: true,
    });
    return spins[0] ?? null;
  }, () => findDevelopmentSpin(idempotencyKey));
}

export async function countVisitorSpins(visitorHash: string, campaignId: string, since: Date): Promise<number> {
  return withDevelopmentStore(async () => {
    const spins = await queryCollection<SpinRecord>(
      SPINS_COLLECTION,
      { visitorHash, campaignId, spunAt: { $gte: since } },
      [],
      20,
      { elevated: true, consistentRead: true },
    );
    return spins.length;
  }, () => countDevelopmentVisitorSpins(visitorHash, campaignId, since));
}

export async function recordSpin(spin: Omit<SpinRecord, '_id'>): Promise<SpinRecord> {
  return withDevelopmentStore(
    () => elevatedInsert(SPINS_COLLECTION, spin) as Promise<SpinRecord>,
    () => recordDevelopmentSpin(spin),
  );
}
