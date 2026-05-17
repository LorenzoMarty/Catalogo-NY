import { m, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useHeroParallax } from '../../hooks/useHeroParallax';
import { resolveAssetPath, resolveSrcSet } from '../../utils/assets';

export function HeroSection() {
  const heroStageRef = useRef<HTMLElement | null>(null);
  const heroMediaRef = useRef<HTMLImageElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroStageRef,
    offset: ['start start', 'end start'],
  });
  const railY = useTransform(scrollYProgress, [0, 1], [-110, -154]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 18]);

  useHeroParallax(heroStageRef, heroMediaRef);

  return (
    <m.header
      animate={{ opacity: 1 }}
      className="hero-stage"
      id="hero"
      initial={{ opacity: 0 }}
      ref={heroStageRef}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
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
          <m.div className="hero-copy" id="curation" style={{ y: copyY }}>
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
          </m.div>

          <aside aria-label="Notas editoriais" className="hero-rail" id="mood">
            <m.div className="hero-rail-motion" style={{ y: railY }}>
              <figure className="hero-rail-figure">
                <img
                  alt=""
                  aria-hidden="true"
                  decoding="async"
                  fetchPriority="high"
                  height="1080"
                  sizes="(min-width: 1360px) 720px, (min-width: 1040px) 48vw, (min-width: 768px) 64vw, 128vw"
                  src={resolveAssetPath('assets/ui/statue-360.webp')}
                  srcSet={resolveSrcSet(
                    'assets/ui/statue-360.webp 360w, assets/ui/statue-520.webp 520w, assets/ui/statue-720.webp 720w',
                  )}
                  width="720"
                />
              </figure>
            </m.div>
          </aside>
        </div>
      </div>
    </m.header>
  );
}
