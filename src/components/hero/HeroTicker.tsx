import { m, useReducedMotion } from 'framer-motion';
import { useI18n } from '../../i18n/I18nProvider';
import type { MessageKey } from '../../i18n/pt';

const tickerItems: readonly MessageKey[] = [
  'ticker.1',
  'ticker.2',
  'ticker.3',
  'ticker.4',
  'ticker.5',
  'ticker.6',
  'ticker.7',
  'ticker.8',
];

export function HeroTicker() {
  const { t } = useI18n();
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      aria-label={t('ticker.aria')}
      className="hero-foot"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      transition={{ delay: 0.4, duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="marquee-band">
        <div className="marquee-track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span className="ticker-item" key={`${item}-${index}`}>
              {t(item)}
            </span>
          ))}
        </div>
      </div>
    </m.div>
  );
}
