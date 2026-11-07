import { useEffect, useState } from 'react';
import { analyticsConfigured, startAnalytics } from '../../services/analytics';
import { CONSENT_RESET_EVENT, getConsent, setConsent } from '../../services/consent';

/**
 * LGPD consent for analytics. Shown only when an analytics provider is configured and the visitor
 * has not chosen yet; the tracker is loaded only after "Aceitar" (see main.tsx for returning
 * visitors). The footer link reopens it. Revoking reloads the page so a running tracker is gone.
 */
export function ConsentBanner() {
  const [visible, setVisible] = useState(() => analyticsConfigured() && getConsent() === null);

  useEffect(() => {
    const reopen = () => setVisible(true);
    window.addEventListener(CONSENT_RESET_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_RESET_EVENT, reopen);
  }, []);

  if (!visible) return null;

  const choose = (value: 'granted' | 'denied') => {
    const hadGranted = getConsent() === 'granted';
    setConsent(value);
    setVisible(false);
    if (value === 'granted') startAnalytics();
    else if (hadGranted) window.location.reload();
  };

  return (
    <section aria-label="Privacidade" className="consent-banner">
      <p>
        Usamos estatísticas de visita sem cookies para entender o que interessa aos clientes. Só
        ativamos com a sua permissão.
      </p>
      <div className="consent-actions">
        <button onClick={() => choose('denied')} type="button">
          Recusar
        </button>
        <button className="consent-accept" onClick={() => choose('granted')} type="button">
          Aceitar
        </button>
      </div>
    </section>
  );
}

/** Footer link to change the choice; renders nothing when no analytics is configured. */
export function ConsentPreferencesLink() {
  if (!analyticsConfigured()) return null;
  return (
    <button
      className="consent-link"
      onClick={() => window.dispatchEvent(new Event(CONSENT_RESET_EVENT))}
      type="button"
    >
      Preferências de privacidade
    </button>
  );
}
