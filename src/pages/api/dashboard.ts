import type { APIRoute } from 'astro';
import { campaignInputSchema, defaultCampaign } from '../../backend/domain';
import { json, jsonError, parseJson } from '../../backend/http';
import { getDashboardData, saveDashboardCampaign } from '../../backend/repository';

export const prerender = false;

export const GET: APIRoute = async () => {
  const requestId = crypto.randomUUID();
  try {
    const result = await getDashboardData();
    return json(result ?? { campaign: defaultCampaign, metrics: { totalSpins: 0, wins: 0, uniqueVisitors: 0 } }, 200, requestId);
  } catch (error) {
    return jsonError(error, requestId);
  }
};

export const PUT: APIRoute = async (context) => {
  const requestId = crypto.randomUUID();
  try {
    const input = await parseJson(context, campaignInputSchema);
    const result = await saveDashboardCampaign(input);
    return json(result, 200, requestId);
  } catch (error) {
    return jsonError(error, requestId);
  }
};
