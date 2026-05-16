import { useRef } from 'react';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { resolveAssetPath, resolveSrcSet } from '../../utils/assets';

export function HeroSection() {
  const heroStageRef = useRef<HTMLElement | null>(null);
  const heroMediaRef = useRef<HTMLImageElement | null>(null);

  useHeroParallax(heroStageRef, heroMediaRef);

  return (
    <header className="hero-stage" id="hero" ref={heroStageRef}>
      <div className="hero-media parallax-media">
        <img
          alt=""
          aria-hidden="true"
          decoding="async"
          fetchPriority="high"
          height="538"
          ref={heroMediaRef}
          sizes="100vw"
          src={resolveAssetPath('assets/ui/new-york-hero-720.webp')}
          srcSet={resolveSrcSet(
            'assets/ui/new-york-hero-640.webp 640w, assets/ui/new-york-hero-720.webp 720w, assets/ui/new-york-hero-860.webp 860w',
          )}
          width="860"
        />
      </div>
      <div className="hero-grid grid-lines" />
      <div className="hero-overlay" />
      <div className="hero-shade" />
      <div className="hero-scan" />

      <div className="hero-shell">
        <div className="hero-layout">
          <div className="hero-copy" id="curation">
            <div className="hero-title-group">
              <div className="hero-title-stack">
                <div className="hero-line">
                  <h1 className="hero-text-huge hero-title-l">New York</h1>
                </div>
                <div className="hero-line">
                  <h1 className="hero-text-huge hero-title-r">Freeshop</h1>
                </div>
              </div>
            </div>

            <p className="hero-note reveal">
              Um freeshop internacional inspirado na eleg&acirc;ncia editorial e na energia
              cosmopolita de New York.
            </p>
            <p className="hero-lead reveal">
              Essa est&eacute;tica entra apenas como atmosfera: luz filtrada, contraste sutil,
              vitrine contempor&acirc;nea e leitura limpa em qualquer tela.
            </p>
          </div>

          <aside aria-label="Notas editoriais" className="hero-rail" id="mood">
            <figure className="hero-rail-figure reveal">
              <img
                alt=""
                aria-hidden="true"
                decoding="async"
                height="1080"
                sizes="(min-width: 1040px) 720px, (min-width: 768px) 58vw, 92vw"
                src={resolveAssetPath('assets/ui/statue-360.webp')}
                srcSet={resolveSrcSet(
                  'assets/ui/statue-360.webp 360w, assets/ui/statue-520.webp 520w, assets/ui/statue-720.webp 720w',
                )}
                width="720"
              />
            </figure>
          </aside>
        </div>
      </div>
    </header>
  );
}
