import type { APIRoute } from 'astro';
import { chooseWeightedPrize, isCampaignActive, spinInputSchema } from '../../backend/domain';
import { createParticipantSubmission, resolveParticipantForm } from '../../backend/forms';
import { ApiError, json, jsonError, parseJson, requireWixRequest } from '../../backend/http';
import { enforceRateLimit } from '../../backend/rate-limit';
import { countVisitorSpins, findSpinByIdempotencyKey, getPublicCampaign, recordSpin } from '../../backend/repository';

export const prerender = false;

async function fingerprint(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function publicSpin(spin: { prizeId: string; outcomeLabel: string; couponCode: string; spunAt: Date }) {
  return { prizeId: spin.prizeId, label: spin.outcomeLabel, couponCode: spin.couponCode || null, spunAt: spin.spunAt };
}

export const POST: APIRoute = async (context) => {
  const requestId = crypto.randomUUID();
  try {
    const token = await requireWixRequest();
    const input = await parseJson(context, spinInputSchema);
    const visitorHash = await fingerprint(`${token.siteId}:${token.subjectType}:${token.subjectId}`);
    enforceRateLimit(`${visitorHash}:${input.campaignId}`);

    const replay = await findSpinByIdempotencyKey(input.idempotencyKey);
    if (replay) {
      if (replay.campaignId !== input.campaignId || replay.visitorHash !== visitorHash) {
        throw new ApiError(409, 'IDEMPOTENCY_CONFLICT', 'Idempotency key was already used');
      }
      return json(publicSpin(replay), 200, requestId);
    }

    const result = await getPublicCampaign(input.campaignId);
    if (!result || !isCampaignActive(result.campaign)) throw new ApiError(404, 'CAMPAIGN_NOT_FOUND', 'Campaign is not active');
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const used = await countVisitorSpins(visitorHash, input.campaignId, dayStart);
    if (used >= result.campaign.dailySpinLimit) throw new ApiError(429, 'DAILY_LIMIT_REACHED', 'Daily spin limit reached');

    const participantForm = await resolveParticipantForm(result.campaign.wixFormId);
    const formSubmissionId = await createParticipantSubmission(participantForm.formId, input.participant);
    const prize = chooseWeightedPrize(result.prizes);
    const spin = await recordSpin({
      campaignId: input.campaignId,
      prizeId: prize._id,
      idempotencyKey: input.idempotencyKey,
      visitorHash,
      outcomeLabel: prize.label,
      couponCode: prize.couponCode,
      formSubmissionId,
      spunAt: new Date(),
    });
    return json(publicSpin(spin), 201, requestId);
  } catch (error) {
    return jsonError(error, requestId);
  }
};
