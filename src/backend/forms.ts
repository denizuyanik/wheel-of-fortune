import { forms, submissions } from '@wix/forms';
import { auth } from '@wix/essentials';
import type { ParticipantInput } from './domain';
import { ApiError } from './http';

export const PARTICIPANT_FORM_NAME = 'Lead form & background';
const WIX_FORMS_NAMESPACE = 'wix.form_app.form';

const elevatedCreateSubmission = auth.elevate(submissions.createSubmission);
const elevatedGetForm = auth.elevate(forms.getForm);
const elevatedQueryForms = auth.elevate(forms.queryForms);

type WixForm = forms.Form;
type FormTargets = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  contactConsent?: string;
  marketingConsent?: string;
};

function normalized(value: string | null | undefined): string {
  return (value ?? '').trim().toLowerCase();
}

function targetFor(form: WixForm, contactField: string, fallbacks: string[]): string | undefined {
  const fields = form.formFields ?? [];
  const mapped = fields.find((field) => field.inputOptions?.contactMapping?.contactField === contactField)?.inputOptions?.target;
  if (mapped) return mapped;

  return fields.find((field) => {
    const candidates = [field.identifier, field.inputOptions?.target].map(normalized);
    return fallbacks.some((fallback) => candidates.some((candidate) => candidate.includes(fallback)));
  })?.inputOptions?.target;
}

function formTargets(form: WixForm): FormTargets {
  const targets = {
    firstName: targetFor(form, 'FIRST_NAME', ['first_name', 'firstname', 'contacts_first_name']),
    lastName: targetFor(form, 'LAST_NAME', ['last_name', 'lastname', 'contacts_last_name']),
    phone: targetFor(form, 'PHONE', ['phone', 'telephone', 'contacts_phone']),
    email: targetFor(form, 'EMAIL', ['email', 'contacts_email']),
    contactConsent: targetFor(form, '', ['contact_consent', 'privacy_consent', 'terms_consent']),
    marketingConsent: targetFor(form, 'SUBSCRIPTION', ['marketing_consent', 'subscription', 'newsletter']),
  };

  const missing = Object.entries(targets)
    .filter(([key, value]) => ['firstName', 'lastName', 'phone', 'email'].includes(key) && !value)
    .map(([key]) => key);
  if (missing.length) {
    throw new ApiError(
      422,
      'FORM_FIELDS_MISSING',
      `The Wix Form “${PARTICIPANT_FORM_NAME}” is missing required fields: ${missing.join(', ')}`,
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
      throw new ApiError(502, 'FORM_LOOKUP_FAILED', 'Wix Forms could not be reached. Confirm that Wix Forms is installed, then save again');
    }
  }

  if (!form?._id) {
    throw new ApiError(422, 'FORM_NOT_FOUND', `Create a Wix Form named “${PARTICIPANT_FORM_NAME}”, then save the campaign again`);
  }
  formTargets(form);
  return { formId: form._id, formName: form.name ?? PARTICIPANT_FORM_NAME };
}

export async function createParticipantSubmission(formId: string, participant: ParticipantInput): Promise<string> {
  if (!formId) throw new ApiError(503, 'FORM_NOT_CONFIGURED', 'The lead form is not configured yet');

  try {
    const form = await elevatedGetForm(formId);
    const targets = formTargets(form);
    const values: Record<string, string | boolean> = {
      [targets.firstName]: participant.firstName,
      [targets.lastName]: participant.lastName,
      [targets.phone]: participant.phone,
      [targets.email]: participant.email,
    };
    if (targets.contactConsent) values[targets.contactConsent] = participant.contactConsent;
    if (targets.marketingConsent) values[targets.marketingConsent] = participant.marketingConsent;

    const submission = await elevatedCreateSubmission({
      formId,
      submissions: values,
    });
    if (!submission._id) throw new Error('Wix Forms did not return a submission ID');
    return submission._id;
  } catch (error) {
    console.error('Wix Forms submission failed', { formId, error });
    throw new ApiError(502, 'FORM_SUBMISSION_FAILED', 'Your details could not be submitted. Please check the form setup and try again');
  }
}
