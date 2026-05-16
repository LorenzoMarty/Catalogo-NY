import { useMemo, useRef, useState } from 'react';
import { STORE_PANELS } from '../../data/stores.data';
import { useStoresShowcase } from '../../hooks/useStoresShowcase';
import { resolveAssetPath, resolveSrcSet } from '../../utils/assets';
import { CSSVars } from '../../utils/styles';

export function StoresSection() {
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
        Tr&ecirc;s lojas f&iacute;sicas do New York Freeshop no Centro de Uruguaiana
      </h2>

      <div className="stores-shell" ref={storesShellRef}>
        <div className="stores-track-shell" id="stores-track-shell" ref={trackShellRef}>
          <div aria-hidden="true" className="stores-progress">
            <span className="stores-progress-kicker">
              Centro de Uruguaiana / 3 endere&ccedil;os
            </span>
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
                    alt={store.imageAlt}
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
                    <span>{store.displayIndex} / centro de uruguaiana</span>
                    <span className="store-status">{store.status}</span>
                  </div>

                  <div className="store-editorial">
                    <span className="store-district">{store.district}</span>
                    <h3 className="store-title display-font">{store.title}</h3>
                    <p className="store-mobile-signature">{store.mobileSignature}</p>
                    <p className="store-tagline">{store.tagline}</p>
                  </div>

                  <div className="store-note">
                    <span className="store-note-label">Endere&ccedil;o oficial</span>
                    <p className="store-note-location">{store.noteLocation}</p>
                    <p className="store-address">{store.address}</p>
                    <div className="store-note-meta">
                      <span>{store.noteMeta}</span>
                    </div>
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
