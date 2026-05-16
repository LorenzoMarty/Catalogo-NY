const tickerItems = [
  'Curadoria',
  'Originalidade',
  'Exclusividade',
  'Sofisticação',
  'Seleção premium',
  'Confiança',
  'Internacional',
  'Praticidade',
];

export function HeroTicker() {
  return (
    <div aria-label="Qualidades do freeshop" className="hero-foot">
      <div className="marquee-band">
        <div className="marquee-track">
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <span className="ticker-item" key={`${item}-${index}`}>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
