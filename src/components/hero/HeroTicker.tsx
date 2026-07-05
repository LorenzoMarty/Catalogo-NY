import { m, useReducedMotion } from 'framer-motion';

const tickerItems = [
  'Curadoria',
  'Originalidade',
  'Exclusividade',
  'Sofisticacao',
  'Selecao premium',
  'Confianca',
  'Internacional',
  'Praticidade',
];

export function HeroTicker() {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      animate={{ opacity: 1, y: 0 }}
      aria-label="Qualidades do freeshop"
      className="hero-foot"
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      transition={{ delay: 0.4, duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="marquee-band">
        <div className="marquee-track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span className="ticker-item" key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </m.div>
  );
}
