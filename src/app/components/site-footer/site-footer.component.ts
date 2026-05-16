import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';

import { STORE_PANELS } from '../../data/stores.data';

type CleanupFn = () => void;

interface FooterPageLink {
  readonly href: string;
  readonly index: string;
  readonly label: string;
}

interface FooterCompanyFact {
  readonly label: string;
  readonly value: string;
}

@Component({
  selector: 'app-site-footer',
  standalone: true,
  templateUrl: './site-footer.component.html',
  styleUrl: './site-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteFooterComponent implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly ngZone = inject(NgZone);

  private readonly cleanups: CleanupFn[] = [];

  @ViewChild('footer', { static: true })
  private footerRef?: ElementRef<HTMLElement>;

  protected readonly pages: readonly FooterPageLink[] = [
    { href: '#hero', index: '01', label: 'Inicio' },
    { href: '#curation', index: '02', label: 'Curadoria' },
    { href: '#categories', index: '03', label: 'Catalogo' },
    { href: '#stores', index: '04', label: 'Lojas' },
    { href: '#footer', index: '05', label: 'Fechamento' },
  ];
  protected readonly companyFacts: readonly FooterCompanyFact[] = [
    { label: 'Marca', value: 'New York Freeshop' },
    { label: 'CNPJ', value: 'A informar' },
    { label: 'Contato', value: 'A informar' },
    { label: 'Atendimento', value: 'Centro de Uruguaiana - RS' },
  ];
  protected readonly stores = STORE_PANELS;
  protected readonly pageCount = String(this.pages.length).padStart(2, '0');

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.initializeFooter();
    });
  }

  ngOnDestroy(): void {
    let cleanup: CleanupFn | undefined;

    while ((cleanup = this.cleanups.pop())) {
      cleanup();
    }
  }

  private initializeFooter(): void {
    const windowRef = this.document.defaultView;
    const footer = this.footerRef?.nativeElement;

    if (!windowRef || !footer) {
      return;
    }

    const reduceMotion = windowRef.matchMedia('(prefers-reduced-motion: reduce)');
    const revealFooter = (): void => {
      footer.classList.add('is-visible');
    };

    if (reduceMotion.matches || !('IntersectionObserver' in windowRef)) {
      revealFooter();
      return;
    }

    const IntersectionObserverCtor = windowRef.IntersectionObserver as typeof IntersectionObserver;
    const observer = new IntersectionObserverCtor(
      (entries: IntersectionObserverEntry[]) => {
        const shouldReveal = entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0.24);

        if (!shouldReveal) {
          return;
        }

        revealFooter();
        observer.disconnect();
      },
      {
        threshold: [0.16, 0.24, 0.36],
        rootMargin: '0px 0px -8% 0px',
      },
    );

    observer.observe(footer);
    this.registerCleanup(() => {
      observer.disconnect();
    });

    this.listenToMediaQuery(reduceMotion, (event?: MediaQueryListEvent) => {
      if (event?.matches) {
        revealFooter();
      }
    });
  }

  private listenToMediaQuery(query: MediaQueryList, handler: (event?: MediaQueryListEvent) => void): void {
    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', handler);
      this.registerCleanup(() => {
        query.removeEventListener('change', handler);
      });
      return;
    }

    if (typeof query.addListener === 'function') {
      query.addListener(handler);
      this.registerCleanup(() => {
        query.removeListener(handler);
      });
    }
  }

  private registerCleanup(cleanup: CleanupFn): void {
    this.cleanups.push(cleanup);
  }
}
