import { useEffect, useMemo, useRef, useState } from 'react';
import { StorePanel } from '../../models/store.models';
import { STORE_PANELS } from '../../data/stores.data';
import { useStoresShowcase } from '../../hooks/useStoresShowcase';
import { resolveAssetPath, resolveSrcSet } from '../../utils/assets';
import { isOpenNow } from '../../utils/storeHours';
import { CSSVars } from '../../utils/styles';
import { track } from '../../services/track';
import { branchNumber, storeMessage, whatsappHref } from '../../utils/whatsapp';
import { useI18n } from '../../i18n/I18nProvider';

export function StoresSection() {
  const { t, tOr } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const stageRef = useRef<HTMLElement | null>(null);
  const storesShellRef = useRef<HTMLDivElement | null>(null);
  const trackShellRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const progressFillRef = useRef<HTMLSpanElement | null>(null);
  const currentStore = useMemo(() => STORE_PANELS[activeIndex] ?? STORE_PANELS[0], [activeIndex]);

  useStoresShowcase({
    progressFillRef,
    setActiveIndex,
    stageRef,
    storesShellRef,
    trackRef,
    trackShellRef,
  });

  return (
    <section aria-labelledby="stores-heading" className="stores-stage" id="stores" ref={stageRef}>
      <h2 className="sr-only" id="stores-heading">
        {t('stores.heading')}
      </h2>

      <div className="stores-shell" ref={storesShellRef}>
        <div className="stores-track-shell" id="stores-track-shell" ref={trackShellRef}>
          <div aria-hidden="true" className="stores-progress">
            <span className="stores-progress-kicker">{t('stores.kicker')}</span>
            <p className="stores-progress-name display-font" id="stores-progress-name">
              {currentStore.name}
            </p>
            <div className="stores-progress-bar">
              <span
                className="stores-progress-fill"
                id="stores-progress-fill"
                ref={progressFillRef}
              />
            </div>
            <div className="stores-progress-count">
              <span id="stores-current">{currentStore.displayIndex}</span>
              <span>/ 03</span>
            </div>
          </div>

          <div className="stores-track" id="stores-track" ref={trackRef}>
            {STORE_PANELS.map((store, index) => (
              <article
                className={`store-panel${index === activeIndex ? ' is-active' : ''}`}
                data-store-index={index}
                data-store-name={store.name}
                key={store.id}
                style={
                  {
                    '--store-accent': store.accent,
                    '--store-accent-strong': store.accentStrong,
                    '--store-position': store.position,
                  } as CSSVars
                }
              >
                <div className="store-scene">
                  <img
                    alt={tOr(`store.${store.id}.imageAlt`, store.imageAlt)}
                    className="store-image"
                    decoding="async"
                    draggable="false"
                    height={store.imageHeight}
                    loading="lazy"
                    sizes="100vw"
                    src={resolveAssetPath(store.imageSrc)}
                    srcSet={resolveSrcSet(store.imageSrcset)}
                    width={store.imageWidth}
                  />
                  <div aria-hidden="true" className="store-marker-stack">
                    <span className="store-marker store-marker-main">{store.marker}</span>
                  </div>
                </div>

                <div className="store-layout">
                  <div className="store-topline">
                    <span>{t('stores.topline', { index: store.displayIndex })}</span>
                    <span className="store-status">{store.status}</span>
                  </div>

                  <div className="store-editorial">
                    <span className="store-district">{store.district}</span>
                    <h3 className="store-title display-font">{store.title}</h3>
                    <p className="store-mobile-signature">{store.mobileSignature}</p>
                    <p className="store-tagline">
                      {tOr(`store.${store.id}.tagline`, store.tagline)}
                    </p>
                  </div>

                  <div className="store-note">
                    <span className="store-note-label">{t('stores.address')}</span>
                    <p className="store-note-location">{store.noteLocation}</p>
                    <p className="store-address">{store.address}</p>
                    <div className="store-note-meta">
                      <span>{tOr(`store.${store.id}.noteMeta`, store.noteMeta)}</span>
                    </div>
                    <StoreActions store={store} />
                  </div>

                  <span aria-hidden="true" className="store-number">
                    {store.displayIndex}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const mapUrlFor = (store: StorePanel) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${store.noteLocation}, ${store.status}`)}`;

function StoreActions({ store }: { readonly store: StorePanel }) {
  const { t } = useI18n();
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const whatsapp = branchNumber(store.id);
  const open = store.timeZone ? isOpenNow(store.hours, store.timeZone, now) : null;
  return (
    <ul className="store-actions">
      {open !== null && (
        <li className="store-open">{open ? t('stores.open') : t('stores.closed')}</li>
      )}
      {store.phone && (
        <li>
          <a
            href={`tel:${store.phone.replace(/[^\d+]/g, '')}`}
            onClick={() => track('store_click', { store: store.id, action: 'phone' })}
          >
            {store.phone}
          </a>
        </li>
      )}
      {whatsapp && (
        <li>
          <a
            href={whatsappHref(whatsapp, storeMessage(store, t))}
            onClick={() => track('whatsapp_click', { target: store.id })}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('stores.whatsapp')}
            <span className="sr-only">{t('stores.whatsappOf', { name: store.name })}</span>
          </a>
        </li>
      )}
      <li>
        <a
          href={mapUrlFor(store)}
          onClick={() => track('store_click', { store: store.id, action: 'map' })}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('stores.map')}
          <span className="sr-only">{t('stores.mapOf', { name: store.name })}</span>
        </a>
      </li>
    </ul>
  );
}
