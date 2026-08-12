import { useEffect, useMemo, useState, type CSSProperties, type FC } from 'react';
import classNames from 'classnames';
import type { WheelWidgetProps } from './wheel-widget.props';
import styles from './wheel-widget.module.css';

type PublicCampaign = {
  id: string;
  headline: string;
  buttonLabel: string;
  primaryColor: string;
  backgroundColor: string;
  prizes: Array<{ id: string; label: string; color: string; position: number }>;
};

type SpinResult = { prizeId: string; label: string; couponCode: string | null; spunAt: string };

const previewCampaign: PublicCampaign = {
  id: 'preview', headline: 'Spin & reveal your reward', buttonLabel: 'Spin now', primaryColor: '#6d5dfc', backgroundColor: '#f4f1ff',
  prizes: [
    { id: 'one', label: '10% off', color: '#6d5dfc', position: 0 },
    { id: 'two', label: 'Free shipping', color: '#ffb703', position: 1 },
    { id: 'three', label: 'Try again', color: '#ff7a59', position: 2 },
    { id: 'four', label: '15% off', color: '#22c55e', position: 3 },
  ],
};

const WheelWidget: FC<WheelWidgetProps> = ({ id, className, campaignId, direction, preview = false }) => {
  const [campaign, setCampaign] = useState<PublicCampaign | null>(preview ? previewCampaign : null);
  const [loading, setLoading] = useState(!preview);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preview) return;
    const controller = new AbortController();
    const query = campaignId ? `?campaignId=${encodeURIComponent(campaignId)}` : '';
    fetch(`/api/campaigns/current${query}`, { signal: controller.signal, credentials: 'include' })
      .then(async (response) => {
        const body = await response.json();
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

  const spin = async () => {
    if (!campaign || preview || spinning) return;
    setSpinning(true); setError(''); setResult(null);
    try {
      const response = await fetch('/api/spins', {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: campaign.id, idempotencyKey: crypto.randomUUID() }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error?.message ?? 'The wheel could not be spun');
      const next: SpinResult = body.data;
      const index = Math.max(0, campaign.prizes.findIndex((prize) => prize.id === next.prizeId));
      const segment = 360 / campaign.prizes.length;
      const target = 360 - (index * segment + segment / 2);
      const normalized = ((rotation % 360) + 360) % 360;
      setRotation(rotation + 5 * 360 + ((target - normalized + 360) % 360));
      window.setTimeout(() => { setResult(next); setSpinning(false); }, 4_650);
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
      <div className={styles.inner}>
        <div className={styles.wheelWrap} aria-hidden="true">
          <div className={styles.pointer} />
          <div className={styles.wheel} style={{ background, transform: `rotate(${rotation}deg)` }}>
            {campaign?.prizes.map((prize, index) => {
              const segment = 360 / campaign.prizes.length;
              return <span key={prize.id} className={styles.label} style={{ transform: `rotate(${index * segment + segment / 2}deg) translateX(50%)` }}>{prize.label}</span>;
            })}
          </div>
          <div className={styles.hub}>GOOD<br />LUCK</div>
        </div>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>A little surprise</p>
          <h2 className={styles.title}>{campaign?.headline ?? (loading ? 'Loading your wheel…' : 'The wheel is resting')}</h2>
          <p className={styles.description}>One spin could unlock a reward for your next order.</p>
          <button className={styles.spin} disabled={!campaign || loading || spinning || preview} onClick={spin}>{spinning ? 'Spinning…' : campaign?.buttonLabel ?? 'Spin now'}</button>
          <div aria-live="polite">
            {error && <div className={`${styles.result} ${styles.error}`}>{error}</div>}
            {result && <div className={styles.result}><strong>{result.label}</strong>{result.couponCode && <span className={styles.coupon}>{result.couponCode}</span>}</div>}
            {preview && <div className={styles.result}>Connect an active campaign to enable spins.</div>}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WheelWidget;
