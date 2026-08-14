import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { WixDesignSystemProvider } from '@wix/design-system';
import { httpClient } from '@wix/essentials';
import '@wix/design-system/styles.global.css';
import type { CampaignInput } from '../../../backend/domain';
import { appApiUrl, readApiResponse } from '../../../shared/api-client';
import styles from './wheel.module.css';

type DashboardPayload = {
  campaign: CampaignInput;
  metrics: { totalSpins: number; wins: number; uniqueVisitors: number };
};

const fallback: DashboardPayload = {
  campaign: {
    name: 'Welcome wheel', status: 'DRAFT', headline: 'Spin the wheel', buttonLabel: 'Spin now',
    primaryColor: '#6d5dfc', backgroundColor: '#f4f1ff', dailySpinLimit: 1, startsAt: null, endsAt: null,
    backgroundMediaType: 'NONE', backgroundMediaUrl: '', wixFormId: '', privacyPolicyUrl: '',
    prizes: [
      { label: '10% off', couponCode: 'WELCOME10', color: '#6d5dfc', weight: 30, position: 0, enabled: true },
      { label: 'Free shipping', couponCode: 'SHIPFREE', color: '#ffb703', weight: 20, position: 1, enabled: true },
      { label: 'Try again', couponCode: '', color: '#ff7a59', weight: 50, position: 2, enabled: true },
    ],
  },
  metrics: { totalSpins: 0, wins: 0, uniqueVisitors: 0 },
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong';
}

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function fromDateTimeLocal(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export default function WheelDashboard() {
  const [data, setData] = useState<DashboardPayload>(fallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    httpClient.fetchWithAuth(appApiUrl('/api/dashboard'))
      .then(async (response) => {
        const body = await readApiResponse<{ data: DashboardPayload; error?: { message?: string } }>(response);
        if (!response.ok) throw new Error(body.error?.message ?? 'Could not load campaign');
        if (!cancelled) setData(body.data);
      })
      .catch((error) => !cancelled && setNotice({ kind: 'error', text: errorMessage(error) }))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, []);

  const campaign = data.campaign;
  const setCampaign = (patch: Partial<CampaignInput>) => setData((current) => ({ ...current, campaign: { ...current.campaign, ...patch } }));
  const updatePrize = (index: number, patch: Partial<CampaignInput['prizes'][number]>) => {
    setCampaign({ prizes: campaign.prizes.map((prize, position) => position === index ? { ...prize, ...patch } : prize) });
  };
  const wheelBackground = useMemo(() => {
    const enabled = campaign.prizes.filter((prize) => prize.enabled);
    if (!enabled.length) return campaign.backgroundColor;
    return `conic-gradient(${enabled.map((prize, index) => `${prize.color} ${index * 100 / enabled.length}% ${(index + 1) * 100 / enabled.length}%`).join(',')})`;
  }, [campaign.prizes, campaign.backgroundColor]);

  const save = async () => {
    setSaving(true);
    setNotice(null);
    try {
      const response = await httpClient.fetchWithAuth(appApiUrl('/api/dashboard'), {
        method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(campaign),
      });
      const body = await readApiResponse<{ data: { id: string }; error?: { message?: string } }>(response);
      if (!response.ok) throw new Error(body.error?.message ?? 'Could not save campaign');
      setCampaign({ id: body.data.id });
      setNotice({ kind: 'success', text: 'Campaign saved.' });
    } catch (error) {
      setNotice({ kind: 'error', text: errorMessage(error) });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading wheel settings…</div>;

  return (
    <WixDesignSystemProvider>
      <main className={styles.shell}>
        <div className={styles.content}>
          <header className={styles.header}>
            <div><p className={styles.eyebrow}>Engagement</p><h1 className={styles.title}>Wheel of Fortune</h1><p className={styles.subtitle}>Configure the visitor experience and monitor results.</p></div>
            <button className={styles.save} disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save campaign'}</button>
          </header>
          {notice && <div role="status" className={`${styles.notice} ${notice.kind === 'success' ? styles.success : ''}`}>{notice.text}</div>}
          <section className={styles.metrics} aria-label="Campaign metrics">
            {[['Total spins', data.metrics.totalSpins], ['Wins', data.metrics.wins], ['Unique visitors', data.metrics.uniqueVisitors]].map(([label, value]) => (
              <div className={styles.metric} key={label}><span className={styles.metricLabel}>{label}</span><strong className={styles.metricValue}>{Number(value).toLocaleString()}</strong></div>
            ))}
          </section>
          <div className={styles.layout}>
            <div>
              <section className={styles.card}>
                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Campaign</h2><span className={styles.badge}>{campaign.status}</span></div>
                <div className={styles.grid}>
                  <label className={`${styles.field} ${styles.fieldFull}`}>Internal name<input className={styles.input} value={campaign.name} onChange={(event) => setCampaign({ name: event.target.value })} /></label>
                  <label className={styles.field}>Status<select className={styles.select} value={campaign.status} onChange={(event) => setCampaign({ status: event.target.value as CampaignInput['status'] })}><option value="DRAFT">Draft</option><option value="ACTIVE">Active</option><option value="PAUSED">Paused</option></select></label>
                  <label className={styles.field}>Daily spins per visitor<input className={styles.input} type="number" min="1" max="20" value={campaign.dailySpinLimit} onChange={(event) => setCampaign({ dailySpinLimit: Number(event.target.value) })} /></label>
                  <label className={styles.field}>Starts at (optional)<input className={styles.input} type="datetime-local" value={toDateTimeLocal(campaign.startsAt)} onChange={(event) => setCampaign({ startsAt: fromDateTimeLocal(event.target.value) })} /></label>
                  <label className={styles.field}>Ends at (optional)<input className={styles.input} type="datetime-local" min={toDateTimeLocal(campaign.startsAt)} value={toDateTimeLocal(campaign.endsAt)} onChange={(event) => setCampaign({ endsAt: fromDateTimeLocal(event.target.value) })} /></label>
                  <p className={`${styles.scheduleHint} ${styles.fieldFull}`}>Times use your browser’s timezone. An active campaign is visible only inside this window.</p>
                  <label className={`${styles.field} ${styles.fieldFull}`}>Headline<input className={styles.input} value={campaign.headline} onChange={(event) => setCampaign({ headline: event.target.value })} /></label>
                  <label className={styles.field}>Button label<input className={styles.input} value={campaign.buttonLabel} onChange={(event) => setCampaign({ buttonLabel: event.target.value })} /></label>
                </div>
                <div className={styles.colors} style={{ marginTop: 16 }}>
                  <label className={styles.field}>Primary color<input className={`${styles.input} ${styles.colorInput}`} type="color" value={campaign.primaryColor} onChange={(event) => setCampaign({ primaryColor: event.target.value })} /></label>
                  <label className={styles.field}>Background color<input className={`${styles.input} ${styles.colorInput}`} type="color" value={campaign.backgroundColor} onChange={(event) => setCampaign({ backgroundColor: event.target.value })} /></label>
                </div>
              </section>
              <section className={styles.card}>
                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Lead form &amp; background</h2><span className={styles.badge}>Wix Forms</span></div>
                <div className={styles.grid}>
                  <label className={`${styles.field} ${styles.fieldFull}`}>Wix Form ID<input className={styles.input} placeholder="00000000-0000-0000-0000-000000000000" value={campaign.wixFormId ?? ''} onChange={(event) => setCampaign({ wixFormId: event.target.value.trim() })} /></label>
                  <p className={`${styles.scheduleHint} ${styles.fieldFull}`}>Use a Wix Form with targets: first_name, last_name, phone, email, contact_consent and marketing_consent. A successful submission can trigger a Wix Automation email to the business.</p>
                  <label className={`${styles.field} ${styles.fieldFull}`}>Privacy policy URL (optional)<input className={styles.input} type="url" placeholder="https://example.com/privacy" value={campaign.privacyPolicyUrl ?? ''} onChange={(event) => setCampaign({ privacyPolicyUrl: event.target.value })} /></label>
                  <label className={styles.field}>Background media<select className={styles.select} value={campaign.backgroundMediaType ?? 'NONE'} onChange={(event) => setCampaign({ backgroundMediaType: event.target.value as CampaignInput['backgroundMediaType'] })}><option value="NONE">None</option><option value="IMAGE">Image</option><option value="VIDEO">Video</option></select></label>
                  <label className={styles.field}>Media URL<input className={styles.input} type="url" disabled={(campaign.backgroundMediaType ?? 'NONE') === 'NONE'} placeholder="https://..." value={campaign.backgroundMediaUrl ?? ''} onChange={(event) => setCampaign({ backgroundMediaUrl: event.target.value })} /></label>
                  <p className={`${styles.scheduleHint} ${styles.fieldFull}`}>Use a public HTTPS image or an autoplay-safe video. Videos play muted and loop behind the wheel.</p>
                </div>
              </section>
              <section className={styles.card}>
                <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Prize segments</h2><span className={styles.badge}>{campaign.prizes.filter((prize) => prize.enabled).length} active</span></div>
                <div className={styles.prizeList}>
                  {campaign.prizes.map((prize, index) => (
                    <div className={styles.prize} key={prize.id ?? index}>
                      <input aria-label={`${prize.label} color`} className={styles.swatch} type="color" value={prize.color} onChange={(event) => updatePrize(index, { color: event.target.value })} />
                      <input aria-label="Prize label" className={`${styles.input} ${styles.compact}`} value={prize.label} onChange={(event) => updatePrize(index, { label: event.target.value })} />
                      <input aria-label="Coupon code" className={`${styles.input} ${styles.compact}`} placeholder="Coupon code" value={prize.couponCode} onChange={(event) => updatePrize(index, { couponCode: event.target.value })} />
                      <input aria-label="Weight" title="Relative probability weight" className={`${styles.input} ${styles.compact}`} type="number" min="1" value={prize.weight} onChange={(event) => updatePrize(index, { weight: Number(event.target.value) })} />
                      <label className={styles.toggle} title="Enabled"><input type="checkbox" checked={prize.enabled} onChange={(event) => updatePrize(index, { enabled: event.target.checked })} /></label>
                      <button aria-label={`Remove ${prize.label}`} className={styles.remove} disabled={campaign.prizes.length <= 2} onClick={() => setCampaign({ prizes: campaign.prizes.filter((_, prizeIndex) => prizeIndex !== index).map((item, position) => ({ ...item, position })) })}>×</button>
                    </div>
                  ))}
                </div>
                <button className={styles.add} disabled={campaign.prizes.length >= 12} onClick={() => setCampaign({ prizes: [...campaign.prizes, { label: 'New prize', couponCode: '', color: '#22c55e', weight: 10, position: campaign.prizes.length, enabled: true }] })}>+ Add prize</button>
              </section>
            </div>
            <aside className={`${styles.card} ${styles.preview}`} style={{ '--preview-background': campaign.backgroundColor } as CSSProperties}>
              <p className={styles.eyebrow}>Live preview</p><h2 className={styles.cardTitle}>{campaign.headline}</h2>
              <div className={styles.previewWheel} style={{ background: wheelBackground }}><div className={styles.previewHub}>{campaign.buttonLabel}</div></div>
              <p className={styles.previewHint}>Weights stay private. Visitors see only segment labels and the result returned by the secure spin endpoint.</p>
            </aside>
          </div>
        </div>
      </main>
    </WixDesignSystemProvider>
  );
}
