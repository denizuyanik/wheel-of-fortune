import { submissions } from '@wix/forms';
import { auth } from '@wix/essentials';
import type { ParticipantInput } from './domain';
import { ApiError } from './http';

const elevatedCreateSubmission = auth.elevate(submissions.createSubmission);

export async function createParticipantSubmission(formId: string, participant: ParticipantInput): Promise<string> {
  if (!formId) throw new ApiError(503, 'FORM_NOT_CONFIGURED', 'The lead form is not configured yet');

  try {
    const submission = await elevatedCreateSubmission({
      formId,
      submissions: {
        first_name: participant.firstName,
        last_name: participant.lastName,
        phone: participant.phone,
        email: participant.email,
        contact_consent: participant.contactConsent,
        marketing_consent: participant.marketingConsent,
      },
    });
    if (!submission._id) throw new Error('Wix Forms did not return a submission ID');
    return submission._id;
  } catch (error) {
    console.error('Wix Forms submission failed', { formId, error });
    throw new ApiError(502, 'FORM_SUBMISSION_FAILED', 'Your details could not be submitted. Please check the form setup and try again');
  }
}
