import { useEffect, useMemo, useState, type CSSProperties, type FC, type FormEvent } from 'react';
import classNames from 'classnames';
import { httpClient } from '@wix/essentials';
import { appApiUrl, readApiResponse } from '../../../shared/api-client';
import type { WheelWidgetProps } from './wheel-widget.props';
import styles from './wheel-widget.module.css';

type PublicCampaign = {
  id: string;
  headline: string;
  buttonLabel: string;
  primaryColor: string;
  backgroundColor: string;
  backgroundMediaType: 'NONE' | 'IMAGE' | 'VIDEO';
  backgroundMediaUrl: string;
  privacyPolicyUrl: string;
  prizes: Array<{ id: string; label: string; color: string; position: number }>;
};

type Participant = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  contactConsent: boolean;
  marketingConsent: boolean;
};

type SpinResult = { prizeId: string; label: string; couponCode: string | null; spunAt: string };

const blankParticipant = (): Participant => ({
  firstName: '', lastName: '', phone: '', email: '', contactConsent: false, marketingConsent: false,
});

const previewCampaign: PublicCampaign = {
  id: 'preview', headline: 'Spin & reveal your reward', buttonLabel: 'Submit & spin', primaryColor: '#6d5dfc', backgroundColor: '#f4f1ff',
  backgroundMediaType: 'NONE', backgroundMediaUrl: '', privacyPolicyUrl: '',
  prizes: [
    { id: 'one', label: '10% off', color: '#6d5dfc', position: 0 },
    { id: 'two', label: 'Free shipping', color: '#ffb703', position: 1 },
    { id: 'three', label: 'Try again', color: '#ff7a59', position: 2 },
    { id: 'four', label: '15% off', color: '#22c55e', position: 3 },
  ],
};

const confettiColors = ['#6d5dfc', '#ffb703', '#ff7a59', '#22c55e', '#ec4899', '#38bdf8'];

const WheelWidget: FC<WheelWidgetProps> = ({ id, className, campaignId, direction, preview = false }) => {
  const [campaign, setCampaign] = useState<PublicCampaign | null>(preview ? previewCampaign : null);
  const [participant, setParticipant] = useState<Participant>(blankParticipant);
  const [loading, setLoading] = useState(!preview);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState('');
  const [confettiRun, setConfettiRun] = useState(0);

  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : '';
    httpClient.fetchWithAuth(appApiUrl(`/api/campaigns/current${query}`), { signal: controller.signal })
      .then(async (response) => {
        const body = await readApiResponse<{ data: PublicCampaign; error?: { message?: string } }>(response);
        if (!response.ok) throw new Error(body.error?.message ?? 'Campaign is unavailable');
        setCampaign(body.data);
      })
      .catch((fetchError) => fetchError.name !== 'AbortError' && setError(fetchError.message))
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [campaignId, preview]);

  const background = useMemo(() => {
    if (!campaign?.prizes.length) return '#e7e9ec';
    const size = 100 / campaign.prizes.length;
    return `conic-gradient(${campaign.prizes.map((prize, index) => `${prize.color} ${index * size}% ${(index + 1) * size}%`).join(',')})`;
  }, [campaign]);

  const updateParticipant = (patch: Partial<Participant>) => setParticipant((current) => ({ ...current, ...patch }));

  const spin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!campaign || preview || spinning) return;
    setSpinning(true); setError(''); setResult(null);
    try {
      const response = await httpClient.fetchWithAuth(appApiUrl('/api/spins'), {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, idempotencyKey: crypto.randomUUID(), participant }),
      });
      const body = await readApiResponse<{ data: SpinResult; error?: { message?: string } }>(response);
      if (!response.ok) throw new Error(body.error?.message ?? 'The wheel could not be spun');
      const next: SpinResult = body.data;
      const index = Math.max(0, campaign.prizes.findIndex((prize) => prize.id === next.prizeId));
      const segment = 360 / campaign.prizes.length;
      const target = 360 - (index * segment + segment / 2);
      const normalized = ((rotation % 360) + 360) % 360;
      setRotation(rotation + 5 * 360 + ((target - normalized + 360) % 360));
      setParticipant(blankParticipant());
      window.setTimeout(() => {
        setResult(next);
        setSpinning(false);
        if (next.couponCode) setConfettiRun((run) => run + 1);
      }, 4_650);
    } catch (spinError) {
      setError(spinError instanceof Error ? spinError.message : 'The wheel could not be spun');
      setSpinning(false);
    }
  };

  const vars = {
    '--widget-primary': campaign?.primaryColor ?? '#6d5dfc',
    '--widget-bg': campaign?.backgroundColor ?? '#f4f1ff',
  } as CSSProperties;

  return (
    <section id={id} dir={direction} className={classNames('wheel-widget', styles.root, styles.fallbackDirection, className)} style={vars} aria-busy={loading || spinning}>
      {campaign?.backgroundMediaType === 'IMAGE' && campaign.backgroundMediaUrl && <img className={styles.backgroundMedia} src={campaign.backgroundMediaUrl} alt="" />}
      {campaign?.backgroundMediaType === 'VIDEO' && campaign.backgroundMediaUrl && <video className={styles.backgroundMedia} src={campaign.backgroundMediaUrl} autoPlay muted loop playsInline aria-hidden="true" />}
      {campaign?.backgroundMediaType !== 'NONE' && campaign?.backgroundMediaUrl && <div className={styles.backgroundOverlay} />}
      {confettiRun > 0 && <div key={confettiRun} className={styles.confetti} aria-hidden="true">{Array.from({ length: 44 }, (_, index) => <i key={index} style={{ '--confetti-x': `${(index * 37) % 100}%`, '--confetti-delay': `${(index % 11) * 0.06}s`, '--confetti-drift': `${((index * 29) % 160) - 80}px`, '--confetti-color': confettiColors[index % confettiColors.length] } as CSSProperties} />)}</div>}
      <div className={styles.inner}>
        <div className={styles.wheelWrap} aria-hidden="true">
          <div className={styles.pointer} />
          <div className={styles.wheel} style={{ background, transform: `rotate(${rotation}deg)` }}>
            {campaign?.prizes.map((prize, index) => {
              const segment = 360 / campaign.prizes.length;
              const angle = index * segment + segment / 2;
              const flipped = angle > 180;
              return <span key={prize.id} className={styles.label} style={{ transform: `translateY(-50%) rotate(${angle - 90}deg)` }}><span className={styles.labelText} style={{ transform: flipped ? 'rotate(180deg)' : undefined }}>{prize.label}</span></span>;
            })}
          </div>
          <div className={styles.hub}>GOOD<br />LUCK</div>
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>A little surprise</p>
          <h2 className={styles.title}>{campaign?.headline ?? (loading ? 'Loading your wheel…' : 'The wheel is resting')}</h2>
          <p className={styles.description}>Enter your details to reveal your reward.</p>
          <form className={styles.leadForm} onSubmit={spin}>
            <div className={styles.formGrid}>
              <label className={styles.field}>First name<input required autoComplete="given-name" value={participant.firstName} onChange={(event) => updateParticipant({ firstName: event.target.value })} /></label>
              <label className={styles.field}>Last name<input required autoComplete="family-name" value={participant.lastName} onChange={(event) => updateParticipant({ lastName: event.target.value })} /></label>
              <label className={styles.field}>Phone<input required type="tel" autoComplete="tel" value={participant.phone} onChange={(event) => updateParticipant({ phone: event.target.value })} /></label>
              <label className={styles.field}>Email<input required type="email" autoComplete="email" value={participant.email} onChange={(event) => updateParticipant({ email: event.target.value })} /></label>
            </div>
            <label className={styles.consent}><input required type="checkbox" checked={participant.contactConsent} onChange={(event) => updateParticipant({ contactConsent: event.target.checked })} /><span>I agree to the processing of my information and being contacted about my wheel result.{campaign?.privacyPolicyUrl && <> <a href={campaign.privacyPolicyUrl} target="_blank" rel="noreferrer">Privacy policy</a></>}</span></label>
            <label className={styles.consent}><input type="checkbox" checked={participant.marketingConsent} onChange={(event) => updateParticipant({ marketingConsent: event.target.checked })} /><span>I would like to receive marketing messages and offers.</span></label>
            <button className={styles.spin} disabled={!campaign || loading || spinning || preview} type="submit">{spinning ? 'Spinning…' : campaign?.buttonLabel ?? 'Submit & spin'}</button>
          </form>
          <div aria-live="polite">
            {error && <div className={`${styles.result} ${styles.error}`}>{error}</div>}
            {result && <div className={styles.result}><strong>{result.label}</strong>{result.couponCode && <span className={styles.coupon}>{result.couponCode}</span>}</div>}
            {preview && <div className={styles.result}>Connect an active campaign to enable submissions and spins.</div>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WheelWidget;
