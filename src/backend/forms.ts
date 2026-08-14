import { forms, submissions } from '@wix/forms';
import { auth } from '@wix/essentials';
import type { ParticipantInput, PrizeRecord } from './domain';
import { ApiError } from './http';

export const PARTICIPANT_FORM_NAME = 'Lead form & background';
const WIX_FORMS_NAMESPACE = 'wix.form_app.form';

const elevatedCreateSubmission = auth.elevate(submissions.createSubmission);
const elevatedGetForm = auth.elevate(forms.getForm);
const elevatedQueryForms = auth.elevate(forms.queryForms);

type WixForm = forms.Form;
type SubmissionTarget = {
  key: string;
  inputType?: string;
};
type FormTargets = {
  firstName: SubmissionTarget;
  lastName: SubmissionTarget;
  phone: SubmissionTarget;
  email: SubmissionTarget;
  reward: SubmissionTarget;
  contactConsent?: SubmissionTarget;
  marketingConsent?: SubmissionTarget;
};

type ParticipantOutcome = Pick<PrizeRecord, 'label' | 'couponCode'>;

function nestedValue(value: unknown, ...path: string[]): unknown {
  let current = value;
  for (const key of path) {
    if (!current || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return current;
}

function isPermissionDenied(error: unknown): boolean {
  const candidates = [
    nestedValue(error, 'status'),
    nestedValue(error, 'statusCode'),
    nestedValue(error, 'response', 'status'),
    nestedValue(error, 'applicationError', 'code'),
    nestedValue(error, 'details', 'applicationError', 'code'),
  ];
  return candidates.some((candidate) => String(candidate).toUpperCase() === '403' || String(candidate).toUpperCase() === 'FORBIDDEN');
}

function formApiError(error: unknown, fallbackCode: string, fallbackMessage: string): ApiError {
  if (error instanceof ApiError) return error;
  if (isPermissionDenied(error)) {
    return new ApiError(
      503,
      'WIX_FORMS_PERMISSION_REQUIRED',
      'This app is missing the Wix Forms “Manage Submissions” permission. Add it in the Wix app dashboard, then reinstall or update the app on this test site.',
    );
  }
  return new ApiError(502, fallbackCode, fallbackMessage);
}

function normalized(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '_');
}

function targetFor(form: WixForm, contactField: string, fallbacks: string[]): SubmissionTarget | undefined {
  const fields = form.formFields ?? [];
  const field =
    (contactField
      ? fields.find((candidate) => candidate.inputOptions?.contactMapping?.contactField === contactField)
      : undefined) ??
    fields.find((candidate) => {
      const candidates = [candidate.identifier, candidate.inputOptions?.target].map(normalized);
      return fallbacks.some((fallback) => candidates.some((value) => value.includes(fallback)));
    });
  const key = field?.inputOptions?.target;
  if (!key) return undefined;

  return {
    key,
    inputType: field.inputOptions?.inputType,
  };
}

function consentSubmissionValue(target: SubmissionTarget, value: boolean): string | boolean {
  if (target.inputType === 'BOOLEAN') return value;
  if (!target.inputType || target.inputType === 'STRING') return value ? 'Yes' : 'No';

  throw new ApiError(
    422,
    'FORM_CONSENT_FIELD_INVALID',
    `The Wix Form field “${target.key}” must be a Short Answer or boolean field`,
  );
}

function formTargets(form: WixForm): FormTargets {
  const targets = {
    firstName: targetFor(form, 'FIRST_NAME', ['first_name', 'firstname', 'contacts_first_name']),
    lastName: targetFor(form, 'LAST_NAME', ['last_name', 'lastname', 'contacts_last_name']),
    phone: targetFor(form, 'PHONE', ['phone', 'telephone', 'contacts_phone']),
    email: targetFor(form, 'EMAIL', ['email', 'contacts_email']),
    reward: targetFor(form, '', [
      'kazanilan_hediye',
      'kazandigi_hediye',
      'kazandiginiz_hediye',
      'won_prize',
      'prize_won',
      'wheel_reward',
      'reward',
      'prize',
      'hediye',
    ]),
    contactConsent: targetFor(form, '', ['contact_consent', 'privacy_consent', 'terms_consent']),
    marketingConsent: targetFor(form, 'SUBSCRIPTION', ['marketing_consent', 'subscription', 'newsletter']),
  };

  const missing = Object.entries(targets)
    .filter(([key, value]) => ['firstName', 'lastName', 'phone', 'email', 'reward'].includes(key) && !value)
    .map(([key]) => key);
  if (missing.length) {
    const labels: Record<string, string> = {
      firstName: 'first name',
      lastName: 'last name',
      phone: 'phone',
      email: 'email',
      reward: 'a Short Answer field named “Kazanılan hediye”',
    };
    throw new ApiError(
      422,
      'FORM_FIELDS_MISSING',
      `The Wix Form “${PARTICIPANT_FORM_NAME}” is missing required fields: ${missing.map((key) => labels[key] ?? key).join(', ')}`,
    );
  }
  return targets as FormTargets;
}

export async function resolveParticipantForm(currentFormId?: string): Promise<{ formId: string; formName: string }> {
  let form: WixForm | undefined;

  if (currentFormId) {
    try {
      form = await elevatedGetForm(currentFormId);
    } catch (error) {
      console.warn('Saved Wix Form is unavailable; looking it up by name.', { currentFormId, error });
    }
  }

  if (!form) {
    try {
      const result = await elevatedQueryForms({ namespace: WIX_FORMS_NAMESPACE })
        .eq('name', PARTICIPANT_FORM_NAME)
        .limit(10)
        .find();
      form = result.items.find((item) => item.enabled !== false) ?? result.items[0];
    } catch (error) {
      console.error('Wix Forms lookup failed', error);
      throw formApiError(error, 'FORM_LOOKUP_FAILED', 'Wix Forms could not be reached. Confirm that Wix Forms is installed, then save again');
    }
  }

  if (!form?._id) {
    throw new ApiError(422, 'FORM_NOT_FOUND', `Create a Wix Form named “${PARTICIPANT_FORM_NAME}”, then save the campaign again`);
  }
  formTargets(form);
  return { formId: form._id, formName: form.name ?? PARTICIPANT_FORM_NAME };
}

function rewardSubmissionValue(target: SubmissionTarget, outcome: ParticipantOutcome): string {
  if (target.inputType && target.inputType !== 'STRING') {
    throw new ApiError(
      422,
      'FORM_REWARD_FIELD_INVALID',
      'The “Kazanılan hediye” Wix Form field must use the Short Answer field type',
    );
  }

  const couponCode = outcome.couponCode.trim();
  return couponCode ? `${outcome.label} — Kupon: ${couponCode}` : outcome.label;
}

export async function createParticipantSubmission(
  formId: string,
  participant: ParticipantInput,
  outcome: ParticipantOutcome,
): Promise<string> {
  if (!formId) throw new ApiError(503, 'FORM_NOT_CONFIGURED', 'The lead form is not configured yet');

  try {
    const form = await elevatedGetForm(formId);
    const targets = formTargets(form);
    const values: Record<string, string | boolean> = {
      [targets.firstName.key]: participant.firstName,
      [targets.lastName.key]: participant.lastName,
      [targets.phone.key]: participant.phone,
      [targets.email.key]: participant.email,
      [targets.reward.key]: rewardSubmissionValue(targets.reward, outcome),
    };
    if (targets.contactConsent) {
      values[targets.contactConsent.key] = consentSubmissionValue(targets.contactConsent, participant.contactConsent);
    }
    if (targets.marketingConsent) {
      values[targets.marketingConsent.key] = consentSubmissionValue(targets.marketingConsent, participant.marketingConsent);
    }

    const submission = await elevatedCreateSubmission({
      formId,
      submissions: values,
    });
    if (!submission._id) throw new Error('Wix Forms did not return a submission ID');
    return submission._id;
  } catch (error) {
    console.error('Wix Forms submission failed', { formId, error });
    throw formApiError(error, 'FORM_SUBMISSION_FAILED', 'Your details could not be submitted. Please check the form setup and try again');
  }
}
