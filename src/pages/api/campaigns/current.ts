import type { APIRoute } from 'astro';
import { isCampaignActive } from '../../../backend/domain';
import { ApiError, json, jsonError } from '../../../backend/http';
import { getPublicCampaign } from '../../../backend/repository';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const requestId = crypto.randomUUID();
  try {
    const campaignId = url.searchParams.get('campaignId') ?? undefined;
    const result = await getPublicCampaign(campaignId);
    if (!result || !isCampaignActive(result.campaign)) throw new ApiError(404, 'CAMPAIGN_NOT_FOUND', 'No active campaign was found');
    return json(
      {
        id: result.campaign._id,
        headline: result.campaign.headline,
        buttonLabel: result.campaign.buttonLabel,
        primaryColor: result.campaign.primaryColor,
        backgroundColor: result.campaign.backgroundColor,
        backgroundMediaType: result.campaign.backgroundMediaType ?? 'NONE',
        backgroundMediaUrl: result.campaign.backgroundMediaUrl ?? '',
        privacyPolicyUrl: result.campaign.privacyPolicyUrl ?? '',
        formConfigured: Boolean(result.campaign.wixFormId),
        prizes: result.prizes.map((prize) => ({ id: prize._id, label: prize.label, color: prize.color, position: prize.position })),
      },
      200,
      requestId,
    );
  } catch (error) {
    return jsonError(error, requestId);
  }
};
