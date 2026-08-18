/**
 * Wheel of Fortune (Çarkıfelek) — Standalone Web Component Script
 * ================================================================
 * Pure Custom Element with Shadow DOM, HTML5 Canvas Physics Engine,
 * 16-Language Dictionary, 1200x700 Gold Voucher Generator,
 * and Local Draw Engine for instant offline/standalone testing.
 */

// ─── 16-Language Dictionary ──────────────────────────────────────────────────
const I18N = {
  "en": {
    "title": "Spin & Win!",
    "subtitle": "Spin the wheel of fortune to unlock exclusive discounts",
    "spinBtn": "SPIN TO WIN",
    "spinning": "Spinning...",
    "rewardWon": "Congratulations! You Won! 🎉",
    "noReward": "Better luck next time!",
    "formTitle": "🎊 Fill in Your Details to Claim Your Prize",
    "formMandatoryNotice": "⚠️ You must complete and submit this form to claim and activate your prize.",
    "firstName": "First Name",
    "lastName": "Last Name",
    "phone": "Phone",
    "email": "Email",
    "firstNamePH": "Your first name",
    "lastNamePH": "Your last name",
    "phonePH": "+1 XXX XXX XXXX",
    "emailPH": "you@email.com",
    "cta": "🎁 Claim My Prize",
    "sending": "⏳ Sending...",
    "success": "🎉 Congratulations! Your details have been received.\nYour official coupon is ready below.",
    "privacyConsent": "I agree to the processing of my personal data according to the Privacy Policy.",
    "marketingConsent": "I consent to receiving marketing communications and exclusive offers.",
    "errorConsent": "Please accept the privacy policy to proceed.",
    "errorRequired": "Please fill in all required fields.",
    "errorEmail": "Please enter a valid email address.",
    "codeBadge": "COUPON CODE",
    "alreadySpun": "⚠️ Daily Spin Limit Reached",
    "comeBackTomorrow": "Come back tomorrow for more chances! 🌟",
    "yourCodes": "Your won codes:",
    "useThisCode": "🎁 Use this code at checkout",
    "playAgain": "🎮 Spin Again (Remaining: {count})",
    "screenshotNotice": "📸 Take a screenshot or download your coupon below so you don't lose it!",
    "downloadCoupon": "📸 Download / Save Coupon",
    "couponSaved": "✅ Coupon Saved!",
    "couponVoucherTitle": "OFFICIAL REWARD COUPON",
    "couponValidNotice": "Present this code at checkout to claim your reward",
    "couponTip": "💡 Tip: Long-press or right-click the image to save to your photos."
  },
  "tr": {
    "title": "Çevir & Kazan!",
    "subtitle": "Şanslı çarkı çevirerek sana özel sürpriz indirimi keşfet",
    "spinBtn": "ÇEVİR & KAZAN",
    "spinning": "Çark Dönüyor...",
    "rewardWon": "Tebrikler! Kazandınız! 🎉",
    "noReward": "Bu sefer olmadı, tekrar deneyin!",
    "formTitle": "🎊 Ödülünüzü Almak İçin Formu Doldurun",
    "formMandatoryNotice": "⚠️ Hediyenizi alabilmek ve kuponunuzu aktifleştirmek için formu doldurmanız zorunludur.",
    "firstName": "Ad",
    "lastName": "Soyad",
    "phone": "Telefon",
    "email": "E-Posta",
    "firstNamePH": "Adınız",
    "lastNamePH": "Soyadınız",
    "phonePH": "05XX XXX XXXX",
    "emailPH": "ornek@mail.com",
    "cta": "🎁 Ödülümü Al",
    "sending": "⏳ Gönderiliyor...",
    "success": "🎉 Tebrikler! Bilgileriniz başarıyla alındı.\nResmi indirim kuponunuz aşağıda hazır.",
    "privacyConsent": "Gizlilik Politikası kapsamında kişisel verilerimin işlenmesini onaylıyorum.",
    "marketingConsent": "Kampanya ve fırsatlardan haberdar olmak için tarafıma e-posta ve SMS gönderilmesine izin veriyorum.",
    "errorConsent": "Lütfen zorunlu gizlilik politikasını onaylayın.",
    "errorRequired": "Lütfen tüm zorunlu alanları doldurun.",
    "errorEmail": "Geçerli bir e-posta adresi girin.",
    "codeBadge": "KUPON KODU",
    "alreadySpun": "⚠️ Günlük Çevirme Hakkınız Bitti",
    "comeBackTomorrow": "Yarın yeni şanslarınızla tekrar deneyin! 🌟",
    "yourCodes": "Kazanılmış kuponlarınız:",
    "useThisCode": "🎁 Bu Kodu Ödemede Kullan",
    "playAgain": "🎮 Tekrar Çevir (Kalan Hak: {count})",
    "screenshotNotice": "📸 Kuponunuzu kaybetmemek için ekran görüntüsünü alın veya aşağıdan indirin!",
    "downloadCoupon": "📸 Kuponu İndir / Kaydet",
    "couponSaved": "✅ Kupon Kaydedildi!",
    "couponVoucherTitle": "RESMİ ÖDÜL KUPONU",
    "couponValidNotice": "Ödülünüzü almak için ödeme sırasında bu kodu gösterin",
    "couponTip": "💡 İpucu: Görsele basılı tutarak veya sağ tıklayarak galerinize kaydedebilirsiniz."
  },
  "de": {
    "title": "Drehen & Gewinnen!",
    "subtitle": "Drehen Sie das Glücksrad, um exklusive Rabatte freizuschalten",
    "spinBtn": "DREHEN & GEWINNEN",
    "spinning": "Glücksrad dreht sich...",
    "rewardWon": "Herzlichen Glückwunsch! Sie haben gewonnen! 🎉",
    "noReward": "Viel Glück beim nächsten Mal!",
    "formTitle": "🎊 Füllen Sie Ihre Daten aus, um Ihren Preis einzulösen",
    "formMandatoryNotice": "⚠️ Sie müssen dieses Formular ausfüllen, um Ihren Gutschein zu aktivieren.",
    "firstName": "Vorname",
    "lastName": "Nachname",
    "phone": "Telefon",
    "email": "E-Mail",
    "firstNamePH": "Ihr Vorname",
    "lastNamePH": "Ihr Nachname",
    "phonePH": "+49 XXX XXXXXXX",
    "emailPH": "name@beispiel.de",
    "cta": "🎁 Meinen Preis anfordern",
    "sending": "⏳ Wird gesendet...",
    "success": "🎉 Herzlichen Glückwunsch! Ihre Daten wurden empfangen.\nIhr offizieller Gutschein ist unten bereit.",
    "privacyConsent": "Ich stimme der Verarbeitung meiner Daten gemäß der Datenschutzerklärung zu.",
    "marketingConsent": "Ich willige ein, Angebote per E-Mail/SMS zu erhalten.",
    "errorConsent": "Bitte akzeptieren Sie die Datenschutzerklärung.",
    "errorRequired": "Bitte füllen Sie alle erforderlichen Felder aus.",
    "errorEmail": "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
    "codeBadge": "GUTSCHEINCODE",
    "alreadySpun": "⚠️ Tägliches Limit erreicht",
    "comeBackTomorrow": "Kommen Sie morgen wieder für neue Chancen! 🌟",
    "yourCodes": "Ihre gewonnenen Codes:",
    "useThisCode": "🎁 Code beim Bezahlen nutzen",
    "playAgain": "🎮 Erneut drehen (Verbleibend: {count})",
    "screenshotNotice": "📸 Machen Sie einen Screenshot oder laden Sie Ihren Gutschein herunter!",
    "downloadCoupon": "📸 Gutschein herunterladen / speichern",
    "couponSaved": "✅ Gutschein gespeichert!",
    "couponVoucherTitle": "OFFIZIELLER GUTSCHEIN",
    "couponValidNotice": "Diesen Code an der Kasse vorzeigen",
    "couponTip": "💡 Tipp: Bild lange gedrückt halten, um es zu speichern."
  },
  "fr": {
    "title": "Tournez & Gagnez !",
    "subtitle": "Tournez la roue de la fortune pour débloquer des réductions",
    "spinBtn": "TOURNER LA ROUE",
    "spinning": "La roue tourne...",
    "rewardWon": "Félicitations ! Vous avez gagné ! 🎉",
    "noReward": "Plus de chance la prochaine fois !",
    "formTitle": "🎊 Remplissez vos coordonnées pour réclamer votre prix",
    "formMandatoryNotice": "⚠️ Vous devez soumettre ce formulaire pour activer votre coupon.",
    "firstName": "Prénom",
    "lastName": "Nom",
    "phone": "Téléphone",
    "email": "E-mail",
    "firstNamePH": "Votre prénom",
    "lastNamePH": "Votre nom",
    "phonePH": "+33 X XX XX XX XX",
    "emailPH": "vous@exemple.fr",
    "cta": "🎁 Réclamer mon prix",
    "sending": "⏳ Envoi...",
    "success": "🎉 Félicitations ! Vos informations ont été enregistrées.\nVotre coupon officiel est prêt ci-dessous.",
    "privacyConsent": "J'accepte le traitement de mes données conformément à la politique de confidentialité.",
    "marketingConsent": "J'accepte de recevoir des offres par e-mail et SMS.",
    "errorConsent": "Veuillez accepter la politique de confidentialité.",
    "errorRequired": "Veuillez remplir tous les champs obligatoires.",
    "errorEmail": "Veuillez entrer une adresse e-mail valide.",
    "codeBadge": "CODE PROMO",
    "alreadySpun": "⚠️ Limite quotidienne atteinte",
    "comeBackTomorrow": "Revenez demain pour retenter votre chance ! 🌟",
    "yourCodes": "Vos codes gagnés :",
    "useThisCode": "🎁 Utiliser ce code",
    "playAgain": "🎮 Rejouer (Restant : {count})",
    "screenshotNotice": "📸 Prenez une capture d'écran ou téléchargez votre coupon ci-dessous !",
    "downloadCoupon": "📸 Télécharger / Sauvegarder le coupon",
    "couponSaved": "✅ Coupon sauvegardé !",
    "couponVoucherTitle": "COUPON OFFICIEL",
    "couponValidNotice": "Présentez ce code lors du paiement",
    "couponTip": "💡 Astuce : Maintenez l'image appuyée pour l'enregistrer."
  },
  "es": {
    "title": "¡Gira y Gana!",
    "subtitle": "Gira la ruleta de la suerte y desbloquea descuentos",
    "spinBtn": "GIRAR PARA GANAR",
    "spinning": "Girando...",
    "rewardWon": "¡Felicidades! ¡Has ganado! 🎉",
    "noReward": "¡Más suerte la próxima vez!",
    "formTitle": "🎊 Completa tus datos para reclamar tu premio",
    "formMandatoryNotice": "⚠️ Debes completar este formulario para activar tu cupón.",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "phone": "Teléfono",
    "email": "Correo electrónico",
    "firstNamePH": "Tu nombre",
    "lastNamePH": "Tu apellido",
    "phonePH": "+34 XXX XXX XXX",
    "emailPH": "tu@ejemplo.es",
    "cta": "🎁 Reclamar mi premio",
    "sending": "⏳ Enviando...",
    "success": "🎉 ¡Felicidades! Tus datos han sido recibidos.\nTu cupón oficial está listo abajo.",
    "privacyConsent": "Acepto el tratamiento de mis datos según la Política de Privacidad.",
    "marketingConsent": "Doy mi consentimiento para recibir ofertas y promociones.",
    "errorConsent": "Por favor acepta la política de privacidad.",
    "errorRequired": "Por favor completa todos los campos requeridos.",
    "errorEmail": "Por favor ingresa un correo válido.",
    "codeBadge": "CÓDIGO DE CUPÓN",
    "alreadySpun": "⚠️ Límite diario alcanzado",
    "comeBackTomorrow": "¡Vuelve mañana para más oportunidades! 🌟",
    "yourCodes": "Tus códigos ganados:",
    "useThisCode": "🎁 Usa este código al pagar",
    "playAgain": "🎮 Girar de nuevo (Restante: {count})",
    "screenshotNotice": "📸 ¡Haz una captura o descarga tu cupón abajo!",
    "downloadCoupon": "📸 Descargar / Guardar Cupón",
    "couponSaved": "✅ ¡Cupón guardado!",
    "couponVoucherTitle": "CUPÓN OFICIAL DE PREMIO",
    "couponValidNotice": "Presenta este código al finalizar la compra",
    "couponTip": "💡 Consejo: Mantén presionada la imagen para guardarla."
  }
};

// Fallback for remaining languages
["he", "zh", "ja", "ko", "hi", "pt", "ru", "uk", "el", "it", "ar"].forEach(l => {
  if (!I18N[l]) I18N[l] = I18N.en;
});

// ─── Theme Definitions ───────────────────────────────────────────────────────
const THEMES = {
  gold: {
    bg: "radial-gradient(ellipse at center, #1e1b4b 0%, #09090b 100%)",
    cardBg: "rgba(15, 23, 42, 0.85)",
    textPrimary: "#f8fafc",
    textSecondary: "#cbd5e1",
    accent1: "#f59e0b",
    accent2: "#fbbf24",
    goldBorder: "linear-gradient(135deg, #d97706, #fbbf24, #fef08a, #d97706)",
    wheelRim: "#b45309",
    hubBg: "radial-gradient(circle, #fef08a 0%, #d97706 70%, #78350f 100%)",
    pointerColor: "#ef4444",
    sliceColors: ["#4f46e5", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6"],
  },
  dark: {
    bg: "radial-gradient(ellipse at center, #18181b 0%, #09090b 100%)",
    cardBg: "rgba(24, 24, 27, 0.9)",
    textPrimary: "#ffffff",
    textSecondary: "#a1a1aa",
    accent1: "#6366f1",
    accent2: "#a855f7",
    goldBorder: "linear-gradient(135deg, #6366f1, #a855f7, #ec4899)",
    wheelRim: "#3f3f46",
    hubBg: "radial-gradient(circle, #818cf8 0%, #4f46e5 70%, #312e81 100%)",
    pointerColor: "#f43f5e",
    sliceColors: ["#6366f1", "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b"],
  },
  neon: {
    bg: "radial-gradient(ellipse at center, #022c22 0%, #020617 100%)",
    cardBg: "rgba(2, 6, 23, 0.9)",
    textPrimary: "#f0fdf4",
    textSecondary: "#94a3b8",
    accent1: "#10b981",
    accent2: "#06b6d4",
    goldBorder: "linear-gradient(135deg, #10b981, #06b6d4, #3b82f6)",
    wheelRim: "#065f46",
    hubBg: "radial-gradient(circle, #6ee7b7 0%, #10b981 70%, #064e3b 100%)",
    pointerColor: "#fbbf24",
    sliceColors: ["#059669", "#0891b2", "#d97706", "#7c3aed", "#db2777", "#2563eb"],
  },
  light: {
    bg: "radial-gradient(ellipse at center, #f1f5f9 0%, #e2e8f0 100%)",
    cardBg: "rgba(255, 255, 255, 0.95)",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    accent1: "#4f46e5",
    accent2: "#6366f1",
    goldBorder: "linear-gradient(135deg, #4f46e5, #818cf8, #c7d2fe)",
    wheelRim: "#94a3b8",
    hubBg: "radial-gradient(circle, #ffffff 0%, #cbd5e1 70%, #64748b 100%)",
    pointerColor: "#dc2626",
    sliceColors: ["#3b82f6", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#06b6d4"],
  },
};

const DEFAULT_PRIZES = [
  { id: "p1", label: "10% OFF", code: "SPIN10", color: "#6366F1", probability: 25, isWinner: true, isActive: true },
  { id: "p2", label: "FREE SHIP", code: "FREESHIP", color: "#EC4899", probability: 20, isWinner: true, isActive: true },
  { id: "p3", label: "TRY AGAIN", code: "", color: "#64748B", probability: 15, isWinner: false, isActive: true },
  { id: "p4", label: "20% OFF", code: "LUCKY20", color: "#F59E0B", probability: 15, isWinner: true, isActive: true },
  { id: "p5", label: "GIFT BOX", code: "MYSTERY50", color: "#10B981", probability: 10, isWinner: true, isActive: true },
  { id: "p6", label: "5% OFF", code: "WELCOME5", color: "#8B5CF6", probability: 15, isWinner: true, isActive: true },
];

export class WheelOfFortuneElement extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    this.widgetLang = "en";
    this.theme = "gold";
    this.dailyLimit = 1;
    this.customTexts = {};
    this.prizes = DEFAULT_PRIZES;
    this.isSpinning = false;
    this.currentRotation = 0;
    this.wonPrize = null;
    this.lastGeneratedCouponDataUrl = "";
    this.bulbBlinkPhase = 0;
    this.confettiParticles = [];
  }

  static get observedAttributes() {
    return ["lang", "color-theme", "daily-limit", "widget-title", "subtitle-text", "spin-btn-text", "custom-texts", "reward-pool"];
  }

  connectedCallback() {
    this.readProps();
    this.render();
    this.initCanvas();
    this.checkDailyLimit();
    this.setupEventListeners();
  }

  attributeChangedCallback() {
    if (this.shadow && this.shadow.childElementCount > 0) {
      this.readProps();
      this.render();
      this.initCanvas();
      this.updateTexts();
      this.drawWheel();
      this.setupEventListeners();
    }
  }

  readProps() {
    this.widgetLang = this.getAttribute("lang") || "en";
    this.theme = this.getAttribute("color-theme") || "gold";
    this.dailyLimit = Number(this.getAttribute("daily-limit")) || 1;

    try {
      const rawCustom = this.getAttribute("custom-texts");
      if (rawCustom) this.customTexts = JSON.parse(rawCustom);
    } catch {}

    try {
      const rawPool = this.getAttribute("reward-pool");
      if (rawPool) {
        const parsed = JSON.parse(rawPool);
        if (Array.isArray(parsed) && parsed.length >= 2) this.prizes = parsed;
      }
    } catch {}
  }

  getUsageData() {
    const today = new Date().toISOString().split("T")[0];
    try {
      const raw = localStorage.getItem("wof_usage");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.date === today) return parsed;
      }
    } catch {}
    return { date: today, count: 0, codes: [] };
  }

  saveUsage(code, label) {
    const usage = this.getUsageData();
    usage.count += 1;
    if (code) usage.codes.push({ code, label: label || "Prize", date: new Date().toLocaleTimeString() });
    try {
      localStorage.setItem("wof_usage", JSON.stringify(usage));
    } catch {}
  }

  checkDailyLimit() {
    const usage = this.getUsageData();
    if (usage.count >= this.dailyLimit) {
      this.showAlreadySpunState(usage.codes);
    }
  }

  isDefaultInOtherLang(text, fieldKey) {
    for (const [l, dict] of Object.entries(I18N)) {
      if (l !== this.widgetLang && dict[fieldKey] && dict[fieldKey].trim() === text.trim()) {
        return true;
      }
    }
    return false;
  }

  valOr(key, fb) {
    const v = this.customTexts[key];
    if (!v || !v.trim()) return fb;
    if (this.isDefaultInOtherLang(v, key)) return fb;
    return v;
  }

  render() {
    const locale = I18N[this.widgetLang] || I18N.en;
    const th = THEMES[this.theme] || THEMES.gold;

    this.shadow.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          --wof-bg: ${th.bg};
          --wof-card-bg: ${th.cardBg};
          --wof-text-primary: ${th.textPrimary};
          --wof-text-secondary: ${th.textSecondary};
          --wof-accent1: ${th.accent1};
          --wof-accent2: ${th.accent2};
          --wof-gold-border: ${th.goldBorder};
          --wof-pointer-color: ${th.pointerColor};
        }
        *, *::before, *::after { box-sizing: inherit; }

        .wof-container {
          position: relative;
          max-width: 680px;
          margin: 0 auto;
          background: var(--wof-bg);
          border-radius: 24px;
          padding: 32px 24px;
          color: var(--wof-text-primary);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.15);
          overflow: hidden;
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 700;
          color: #fbbf24;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        h2.title {
          font-size: 32px;
          font-weight: 900;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #ffffff 40%, var(--wof-accent2) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        p.subtitle {
          font-size: 15px;
          color: var(--wof-text-secondary);
          margin: 0 0 24px 0;
          line-height: 1.5;
        }

        .wheel-stage {
          position: relative;
          width: 360px;
          height: 360px;
          max-width: 100%;
          margin: 0 auto 24px auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        canvas.wheel-canvas {
          width: 360px;
          height: 360px;
          display: block;
          filter: drop-shadow(0 12px 28px rgba(0, 0, 0, 0.65));
        }

        .pointer-arrow {
          position: absolute;
          top: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 36px;
          height: 44px;
          z-index: 10;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5));
          transform-origin: 50% 15%;
          transition: transform 0.08s ease-out;
        }
        .pointer-arrow.ticking {
          transform: translateX(-50%) rotate(-12deg);
        }
        .pointer-arrow svg {
          width: 100%;
          height: 100%;
          fill: var(--wof-pointer-color);
        }

        .center-hub-btn {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 82px;
          height: 82px;
          border-radius: 50%;
          background: ${th.hubBg};
          border: 4px solid #ffffff;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.8);
          color: #1e1b4b;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 0.5px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 8;
          transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.15s;
          user-select: none;
          text-shadow: 0 1px 1px rgba(255, 255, 255, 0.6);
        }
        .center-hub-btn:hover:not(:disabled) {
          transform: translate(-50%, -50%) scale(1.08);
          box-shadow: 0 12px 28px rgba(245, 158, 11, 0.5), inset 0 2px 6px #fff;
        }
        .center-hub-btn:active:not(:disabled) {
          transform: translate(-50%, -50%) scale(0.95);
        }
        .center-hub-btn:disabled {
          opacity: 0.85;
          cursor: not-allowed;
        }

        .spin-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          max-width: 320px;
          padding: 16px 28px;
          background: linear-gradient(135deg, var(--wof-accent1) 0%, var(--wof-accent2) 100%);
          color: #0f172a;
          border: none;
          border-radius: 14px;
          font-size: 18px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.5);
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
          user-select: none;
          margin-bottom: 8px;
        }
        .spin-action-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px -5px rgba(245, 158, 11, 0.7);
        }
        .spin-action-btn:active:not(:disabled) {
          transform: translateY(1px);
        }
        .spin-action-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          filter: grayscale(0.5);
        }

        .lead-box {
          display: none;
          margin-top: 24px;
          background: var(--wof-card-bg);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 18px;
          padding: 24px 20px;
          text-align: left;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
          animation: slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .prize-banner {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.4);
          border-radius: 12px;
          padding: 12px 16px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .prize-icon { font-size: 28px; }
        .prize-text-wrap h4 { margin: 0; font-size: 16px; color: #fbbf24; font-weight: 800; }
        .prize-text-wrap p { margin: 2px 0 0 0; font-size: 13px; color: var(--wof-text-secondary); }

        .mandatory-warning {
          background: rgba(239, 68, 68, 0.12);
          border-left: 4px solid #ef4444;
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 12px;
          color: #fca5a5;
          margin-bottom: 16px;
          line-height: 1.4;
          font-weight: 600;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        @media (max-width: 480px) {
          .form-grid { grid-template-columns: 1fr; }
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .form-group.full { grid-column: 1 / -1; }
        .form-group label {
          font-size: 12px;
          font-weight: 700;
          color: var(--wof-text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .form-group input {
          background: rgba(0, 0, 0, 0.35);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #ffffff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-group input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.25);
        }

        .checkbox-group {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-bottom: 12px;
          font-size: 12px;
          color: var(--wof-text-secondary);
          line-height: 1.4;
          cursor: pointer;
        }
        .checkbox-group input {
          margin-top: 2px;
          accent-color: #f59e0b;
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }

        .claim-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: #ffffff;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .claim-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(16, 185, 129, 0.45);
        }

        .success-box {
          display: none;
          margin-top: 24px;
          background: rgba(6, 78, 59, 0.85);
          border: 1px solid rgba(52, 211, 153, 0.4);
          border-radius: 18px;
          padding: 24px 20px;
          text-align: center;
          animation: slideUp 0.35s ease-out;
        }
        .success-icon { font-size: 40px; margin-bottom: 8px; }
        .success-title { font-size: 20px; font-weight: 900; color: #a7f3d0; margin: 0 0 8px 0; }
        .success-desc { font-size: 14px; color: #d1fae5; margin: 0 0 16px 0; line-height: 1.5; white-space: pre-line; }

        .voucher-preview-box {
          margin: 16px auto;
          max-width: 520px;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
          border: 2px solid rgba(251, 191, 36, 0.6);
          background: #000;
        }
        .voucher-preview-img { width: 100%; height: auto; display: block; }

        .download-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #fbbf24 0%, #d97706 100%);
          color: #0f172a;
          font-weight: 800;
          font-size: 15px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
          transition: transform 0.15s;
          margin-top: 10px;
        }
        .download-action-btn:hover { transform: translateY(-2px); }

        .limit-box {
          display: none;
          margin-top: 20px;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 16px;
          padding: 20px;
          text-align: center;
        }
      </style>

      <div class="wof-container" id="widget-container">
        <div class="header-badge">🎡 Official Wheel of Fortune</div>
        <h2 class="title" id="wof-title">${this.valOr("title", locale.title)}</h2>
        <p class="subtitle" id="wof-subtitle">${this.valOr("subtitle", locale.subtitle)}</p>

        <div class="wheel-stage">
          <div class="pointer-arrow" id="pointer-arrow">
            <svg viewBox="0 0 24 30">
              <path d="M12 30 L2 6 A 10 10 0 0 1 22 6 Z" />
              <circle cx="12" cy="8" r="3.5" fill="#ffffff" />
            </svg>
          </div>
          <canvas class="wheel-canvas" id="wheel-canvas" width="720" height="720"></canvas>
          <button type="button" class="center-hub-btn" id="center-spin-btn">${this.valOr("spinBtn", locale.spinBtn)}</button>
        </div>

        <button type="button" class="spin-action-btn" id="bottom-spin-btn">
          <span>✨</span>
          <span id="spin-btn-text">${this.valOr("spinBtn", locale.spinBtn)}</span>
          <span>✨</span>
        </button>

        <!-- Lead Capture Form -->
        <div class="lead-box" id="lead-box">
          <div class="prize-banner">
            <div class="prize-icon">🎁</div>
            <div class="prize-text-wrap">
              <h4 id="lead-prize-title">${locale.rewardWon}</h4>
              <p id="lead-prize-subtitle">Coupon Code: <strong id="lead-prize-code" style="color:#fbbf24;"></strong></p>
            </div>
          </div>

          <div class="mandatory-warning" id="mandatory-notice">
            ${locale.formMandatoryNotice}
          </div>

          <form id="lead-form">
            <div class="form-grid">
              <div class="form-group">
                <label id="lbl-fname">${locale.firstName} *</label>
                <input type="text" id="inp-fname" placeholder="${locale.firstNamePH}" required />
              </div>
              <div class="form-group">
                <label id="lbl-lname">${locale.lastName}</label>
                <input type="text" id="inp-lname" placeholder="${locale.lastNamePH}" />
              </div>
              <div class="form-group full">
                <label id="lbl-email">${locale.email} *</label>
                <input type="email" id="inp-email" placeholder="${locale.emailPH}" required />
              </div>
              <div class="form-group full">
                <label id="lbl-phone">${locale.phone}</label>
                <input type="tel" id="inp-phone" placeholder="${locale.phonePH}" />
              </div>
            </div>

            <label class="checkbox-group">
              <input type="checkbox" id="chk-privacy" required checked />
              <span id="lbl-privacy">${locale.privacyConsent}</span>
            </label>

            <label class="checkbox-group">
              <input type="checkbox" id="chk-marketing" checked />
              <span id="lbl-marketing">${locale.marketingConsent}</span>
            </label>

            <button type="submit" class="claim-btn" id="claim-submit-btn">
              ${this.valOr("cta", locale.cta)}
            </button>
          </form>
        </div>

        <!-- Success & Coupon Display -->
        <div class="success-box" id="success-box">
          <div class="success-icon">🎉</div>
          <h3 class="success-title">${locale.rewardWon}</h3>
          <p class="success-desc" id="success-desc">${locale.success}</p>

          <div class="voucher-preview-box" id="voucher-box">
            <img class="voucher-preview-img" id="voucher-img" alt="Official Reward Coupon" />
          </div>

          <p style="font-size:12px; color:#d1fae5; margin:8px 0;">${locale.screenshotNotice}</p>
          <button type="button" class="download-action-btn" id="download-coupon-btn">
            <span>💾</span>
            <span>${locale.downloadCoupon}</span>
          </button>
          <p style="font-size:11px; color:#a7f3d0; margin-top:8px; opacity:0.85;">${locale.couponTip}</p>
        </div>

        <!-- Limit Box -->
        <div class="limit-box" id="limit-box">
          <h3 style="color:#f59e0b; margin:0 0 6px 0;">${locale.alreadySpun}</h3>
          <p style="font-size:13px; color:var(--wof-text-secondary); margin:0 0 12px 0;">${locale.comeBackTomorrow}</p>
          <div id="previous-codes" style="font-size:13px; text-align:left; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px;"></div>
        </div>
      </div>
    `;
  }

  initCanvas() {
    this.canvas = this.shadow.querySelector("#wheel-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.drawWheel();
  }

  drawWheel() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const size = this.canvas.width;
    const center = size / 2;
    const radius = center - 28;
    const th = THEMES[this.theme] || THEMES.gold;

    ctx.clearRect(0, 0, size, size);

    // Outer Rim
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, radius + 20, 0, Math.PI * 2);
    const rimGrad = ctx.createRadialGradient(center, center, radius, center, center, radius + 20);
    rimGrad.addColorStop(0, "#d97706");
    rimGrad.addColorStop(0.5, "#fbbf24");
    rimGrad.addColorStop(1, "#78350f");
    ctx.fillStyle = rimGrad;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#451a03";
    ctx.stroke();

    // LED Bulbs
    const numBulbs = 24;
    for (let b = 0; b < numBulbs; b++) {
      const bulbAngle = (b / numBulbs) * Math.PI * 2;
      const bx = center + Math.cos(bulbAngle) * (radius + 10);
      const by = center + Math.sin(bulbAngle) * (radius + 10);
      const isLit = (b + this.bulbBlinkPhase) % 2 === 0;

      ctx.beginPath();
      ctx.arc(bx, by, 6, 0, Math.PI * 2);
      ctx.fillStyle = isLit ? "#fef08a" : "#ca8a04";
      ctx.shadowColor = isLit ? "#fef08a" : "transparent";
      ctx.shadowBlur = isLit ? 10 : 0;
      ctx.fill();
    }
    ctx.restore();

    // Wheel Slices
    const pool = this.prizes.length >= 2 ? this.prizes : DEFAULT_PRIZES;
    const totalSegments = pool.length;
    const segmentAngle = (Math.PI * 2) / totalSegments;
    const rotationRad = (this.currentRotation * Math.PI) / 180;

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(rotationRad);

    for (let i = 0; i < totalSegments; i++) {
      const prize = pool[i];
      const startAngle = i * segmentAngle;
      const endAngle = (i + 1) * segmentAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      const sliceColor = prize.color || th.sliceColors[i % th.sliceColors.length];
      ctx.fillStyle = sliceColor;
      ctx.fill();
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.stroke();

      // Slice Text
      ctx.save();
      const midAngle = startAngle + segmentAngle / 2;
      ctx.rotate(midAngle);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif";
      ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
      ctx.shadowBlur = 4;

      let label = prize.label || "Prize";
      if (label.length > 15) label = label.substring(0, 14) + "…";
      ctx.fillText(label, radius - 35, 0);
      ctx.restore();
    }

    // Center circle
    ctx.beginPath();
    ctx.arc(0, 0, 68, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fill();
    ctx.restore();

    this.drawConfetti();
  }

  async triggerSpin() {
    if (this.isSpinning) return;
    const usage = this.getUsageData();
    if (usage.count >= this.dailyLimit) {
      this.checkDailyLimit();
      return;
    }

    this.isSpinning = true;
    this.setControlsDisabled(true);

    const locale = I18N[this.widgetLang] || I18N.en;
    const spinTextEl = this.shadow.querySelector("#spin-btn-text");
    if (spinTextEl) spinTextEl.textContent = locale.spinning;

    try {
      // Local Anti-Cheat calculation
      const pool = this.prizes.length >= 2 ? this.prizes : DEFAULT_PRIZES;
      const totalWeight = pool.reduce((sum, p) => sum + Math.max(1, p.probability || 10), 0);
      let rand = Math.random() * totalWeight;
      let selectedIdx = 0;

      for (let i = 0; i < pool.length; i++) {
        const w = Math.max(1, pool[i].probability || 10);
        if (rand <= w) {
          selectedIdx = i;
          break;
        }
        rand -= w;
      }

      const selPrize = pool[selectedIdx];
      const totalSegments = pool.length;
      const segmentAngle = 360 / totalSegments;
      const jitter = (Math.random() - 0.5) * (segmentAngle * 0.7);
      const targetSliceAngle = (selectedIdx + 0.5) * segmentAngle + jitter;
      const normalizedStopAngle = (270 - targetSliceAngle + 720) % 360;
      const fullSpins = (5 + Math.floor(Math.random() * 3)) * 360;
      const finalTargetAngle = fullSpins + normalizedStopAngle;

      this.wonPrize = selPrize;

      await this.animateSpin(finalTargetAngle, 4800);

      this.spawnConfetti();
      this.showPrizeOutcome();
      this.saveUsage(selPrize.code, selPrize.label);

      window.dispatchEvent(
        new CustomEvent("onSpinComplete", {
          bubbles: true,
          composed: true,
          detail: {
            prizeId: selPrize.id,
            label: selPrize.label,
            code: selPrize.code,
            isWinner: selPrize.isWinner,
          },
        })
      );
    } catch (err) {
      console.error("[WheelOfFortune] Spin error:", err);
      this.isSpinning = false;
      this.setControlsDisabled(false);
      if (spinTextEl) spinTextEl.textContent = this.valOr("spinBtn", locale.spinBtn);
    }
  }

  animateSpin(targetAngle, durationMs) {
    return new Promise((resolve) => {
      const startAngle = this.currentRotation % 360;
      const totalDelta = targetAngle - startAngle;
      const startTime = performance.now();
      const pointer = this.shadow.querySelector("#pointer-arrow");

      const totalSegments = this.prizes.length;
      const degPerSegment = 360 / totalSegments;
      let lastSliceIndex = -1;

      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const ease = 1 - Math.pow(1 - progress, 3.5);
        this.currentRotation = startAngle + totalDelta * ease;

        const currentSliceIndex = Math.floor((this.currentRotation % 360) / degPerSegment);
        if (currentSliceIndex !== lastSliceIndex) {
          lastSliceIndex = currentSliceIndex;
          if (pointer) {
            pointer.classList.add("ticking");
            setTimeout(() => pointer.classList.remove("ticking"), 50);
          }
          this.bulbBlinkPhase = (this.bulbBlinkPhase + 1) % 2;
        }

        this.drawWheel();

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          this.currentRotation = targetAngle % 360;
          this.drawWheel();
          resolve();
        }
      };

      requestAnimationFrame(step);
    });
  }

  spawnConfetti() {
    const colors = ["#f59e0b", "#fbbf24", "#6366f1", "#ec4899", "#10b981", "#06b6d4", "#ffffff"];
    this.confettiParticles = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      this.confettiParticles.push({
        x: 360,
        y: 360,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.8) * 20,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12,
        opacity: 1,
      });
    }

    let frame = 0;
    const animateParticles = () => {
      frame++;
      for (const p of this.confettiParticles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.vx *= 0.98;
        p.rotation += p.rotSpeed;
        if (frame > 40) p.opacity -= 0.015;
      }
      this.confettiParticles = this.confettiParticles.filter((p) => p.opacity > 0);
      this.drawWheel();

      if (this.confettiParticles.length > 0) {
        requestAnimationFrame(animateParticles);
      }
    };
    requestAnimationFrame(animateParticles);
  }

  drawConfetti() {
    if (this.confettiParticles.length === 0) return;
    const ctx = this.ctx;
    for (const p of this.confettiParticles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.opacity);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    }
  }

  showPrizeOutcome() {
    const locale = I18N[this.widgetLang] || I18N.en;
    const leadBox = this.shadow.querySelector("#lead-box");
    const bottomBtn = this.shadow.querySelector("#bottom-spin-btn");
    const prizeTitle = this.shadow.querySelector("#lead-prize-title");
    const prizeCode = this.shadow.querySelector("#lead-prize-code");

    if (bottomBtn) bottomBtn.style.display = "none";

    if (this.wonPrize) {
      if (prizeTitle) prizeTitle.textContent = `🎉 ${this.wonPrize.label}`;
      if (prizeCode) prizeCode.textContent = this.wonPrize.code || "LUCKY REWARD";
    }

    if (leadBox) {
      leadBox.style.display = "block";
      leadBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const fname = this.shadow.querySelector("#inp-fname")?.value;
    const lname = this.shadow.querySelector("#inp-lname")?.value;
    const email = this.shadow.querySelector("#inp-email")?.value;
    const phone = this.shadow.querySelector("#inp-phone")?.value;
    const privacy = this.shadow.querySelector("#chk-privacy")?.checked;
    const locale = I18N[this.widgetLang] || I18N.en;

    if (!privacy) {
      alert(locale.errorConsent);
      return;
    }
    if (!fname || !email) {
      alert(locale.errorRequired);
      return;
    }

    const submitBtn = this.shadow.querySelector("#claim-submit-btn");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = locale.sending;
    }

    const dataUrl = this.renderCouponVoucherCard();
    this.lastGeneratedCouponDataUrl = dataUrl;

    const leadBox = this.shadow.querySelector("#lead-box");
    const successBox = this.shadow.querySelector("#success-box");
    const voucherImg = this.shadow.querySelector("#voucher-img");

    if (leadBox) leadBox.style.display = "none";
    if (voucherImg && dataUrl) voucherImg.src = dataUrl;
    if (successBox) {
      successBox.style.display = "block";
      successBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    window.dispatchEvent(
      new CustomEvent("onFormSubmit", {
        bubbles: true,
        composed: true,
        detail: { firstName: fname, lastName: lname, email, phone, code: this.wonPrize?.code },
      })
    );
  }

  renderCouponVoucherCard() {
    const locale = I18N[this.widgetLang] || I18N.en;
    const prizeText = this.wonPrize?.label || "EXCLUSIVE REWARD";
    const couponCode = this.wonPrize?.code || "SPIN2026";

    const vCanvas = document.createElement("canvas");
    vCanvas.width = 1200;
    vCanvas.height = 700;
    const vCtx = vCanvas.getContext("2d");
    if (!vCtx) return "";

    // Background
    const bgGrad = vCtx.createRadialGradient(600, 350, 50, 600, 350, 650);
    bgGrad.addColorStop(0, "#1e1b4b");
    bgGrad.addColorStop(0.6, "#0f172a");
    bgGrad.addColorStop(1, "#020617");
    vCtx.fillStyle = bgGrad;
    vCtx.fillRect(0, 0, 1200, 700);

    // Ornate Gold Border
    vCtx.lineWidth = 14;
    const goldGrad = vCtx.createLinearGradient(0, 0, 1200, 700);
    goldGrad.addColorStop(0, "#d97706");
    goldGrad.addColorStop(0.25, "#fbbf24");
    goldGrad.addColorStop(0.5, "#fef08a");
    goldGrad.addColorStop(0.75, "#fbbf24");
    goldGrad.addColorStop(1, "#b45309");
    vCtx.strokeStyle = goldGrad;
    vCtx.strokeRect(30, 30, 1140, 640);

    vCtx.lineWidth = 3;
    vCtx.strokeStyle = "rgba(251, 191, 36, 0.45)";
    vCtx.strokeRect(48, 48, 1104, 604);

    const drawCorner = (cx, cy) => {
      vCtx.beginPath();
      vCtx.arc(cx, cy, 18, 0, Math.PI * 2);
      vCtx.fillStyle = "#fbbf24";
      vCtx.fill();
    };
    drawCorner(48, 48);
    drawCorner(1152, 48);
    drawCorner(48, 652);
    drawCorner(1152, 652);

    // Header & Prize Text
    vCtx.textAlign = "center";
    vCtx.textBaseline = "middle";

    vCtx.font = "bold 26px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    vCtx.fillStyle = "#fbbf24";
    vCtx.fillText("⭐ " + (locale.couponVoucherTitle || "OFFICIAL REWARD COUPON") + " ⭐", 600, 110);

    vCtx.font = "900 68px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    vCtx.fillStyle = "#ffffff";
    vCtx.shadowColor = "rgba(251, 191, 36, 0.6)";
    vCtx.shadowBlur = 18;
    vCtx.fillText(prizeText.toUpperCase(), 600, 210);
    vCtx.shadowBlur = 0;

    // Coupon Code Box
    vCtx.fillStyle = "rgba(0, 0, 0, 0.65)";
    vCtx.roundRect(280, 290, 640, 130, 20);
    vCtx.fill();
    vCtx.lineWidth = 3;
    vCtx.strokeStyle = goldGrad;
    vCtx.stroke();

    vCtx.font = "bold 22px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    vCtx.fillStyle = "#94a3b8";
    vCtx.fillText(locale.codeBadge || "COUPON CODE", 600, 325);

    vCtx.font = "900 56px Courier, monospace";
    vCtx.fillStyle = "#fef08a";
    vCtx.fillText(couponCode, 600, 380);

    // Perforated Dotted Line
    vCtx.save();
    vCtx.beginPath();
    vCtx.setLineDash([12, 10]);
    vCtx.lineWidth = 2;
    vCtx.strokeStyle = "rgba(255, 255, 255, 0.25)";
    vCtx.moveTo(100, 480);
    vCtx.lineTo(1100, 480);
    vCtx.stroke();
    vCtx.restore();

    // Security Notice
    vCtx.font = "24px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    vCtx.fillStyle = "#cbd5e1";
    vCtx.fillText(locale.couponValidNotice || "Present this coupon at checkout to claim your reward.", 600, 540);

    vCtx.font = "18px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
    vCtx.fillStyle = "#64748b";
    vCtx.fillText(`Verified App Reward • ID: ${Date.now().toString(36).toUpperCase()}`, 600, 595);

    return vCanvas.toDataURL("image/png");
  }

  downloadCouponImage() {
    const dataUrl = this.lastGeneratedCouponDataUrl || this.renderCouponVoucherCard();
    if (!dataUrl) return;

    try {
      const parts = dataUrl.split(",");
      const byteString = atob(parts[1]);
      const mimeString = parts[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const blobUrl = URL.createObjectURL(blob);

      const code = this.wonPrize?.code || "REWARD";
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `wheel-of-fortune-coupon-${code}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1500);

      const dlBtn = this.shadow.querySelector("#download-coupon-btn span:last-child");
      const locale = I18N[this.widgetLang] || I18N.en;
      if (dlBtn) dlBtn.textContent = locale.couponSaved;
    } catch (err) {
      console.error("[WheelOfFortune] Download error:", err);
    }
  }

  showAlreadySpunState(codes) {
    const locale = I18N[this.widgetLang] || I18N.en;
    const limitBox = this.shadow.querySelector("#limit-box");
    const bottomBtn = this.shadow.querySelector("#bottom-spin-btn");
    const centerBtn = this.shadow.querySelector("#center-spin-btn");
    const prevCodes = this.shadow.querySelector("#previous-codes");

    if (bottomBtn) bottomBtn.style.display = "none";
    if (centerBtn) centerBtn.disabled = true;

    if (prevCodes) {
      if (codes.length > 0) {
        prevCodes.innerHTML = `<strong>${locale.yourCodes}</strong><br/>` +
          codes.map((c) => `• <span style="color:#fbbf24; font-weight:700;">${c.code}</span> (${c.label})`).join("<br/>");
      } else {
        prevCodes.style.display = "none";
      }
    }

    if (limitBox) limitBox.style.display = "block";
  }

  setControlsDisabled(disabled) {
    const centerBtn = this.shadow.querySelector("#center-spin-btn");
    const bottomBtn = this.shadow.querySelector("#bottom-spin-btn");
    if (centerBtn) centerBtn.disabled = disabled;
    if (bottomBtn) bottomBtn.disabled = disabled;
  }

  setupEventListeners() {
    const centerBtn = this.shadow.querySelector("#center-spin-btn");
    const bottomBtn = this.shadow.querySelector("#bottom-spin-btn");
    const leadForm = this.shadow.querySelector("#lead-form");
    const dlBtn = this.shadow.querySelector("#download-coupon-btn");

    if (centerBtn) centerBtn.onclick = () => this.triggerSpin();
    if (bottomBtn) bottomBtn.onclick = () => this.triggerSpin();
    if (leadForm) leadForm.onsubmit = (e) => this.handleFormSubmit(e);
    if (dlBtn) dlBtn.onclick = () => this.downloadCouponImage();
  }

  updateTexts() {
    const locale = I18N[this.widgetLang] || I18N.en;
    const titleEl = this.shadow.querySelector("#wof-title");
    const subEl = this.shadow.querySelector("#wof-subtitle");
    const spinTextEl = this.shadow.querySelector("#spin-btn-text");
    const centerBtn = this.shadow.querySelector("#center-spin-btn");

    if (titleEl) titleEl.textContent = this.valOr("title", locale.title);
    if (subEl) subEl.textContent = this.valOr("subtitle", locale.subtitle);
    if (spinTextEl && !this.isSpinning) spinTextEl.textContent = this.valOr("spinBtn", locale.spinBtn);
    if (centerBtn && !this.isSpinning) centerBtn.textContent = this.valOr("spinBtn", locale.spinBtn);
  }
}

if (!customElements.get("wheel-of-fortune-widget")) {
  customElements.define("wheel-of-fortune-widget", WheelOfFortuneElement);
}
