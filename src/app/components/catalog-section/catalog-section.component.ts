import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';

import { CatalogProductViewModel } from '../../models/catalog.models';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';
import { CatalogService } from '../../services/catalog.service';

@Component({
  selector: 'app-catalog-section',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './catalog-section.component.html',
  styleUrl: './catalog-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogSectionComponent {
  private readonly document = inject(DOCUMENT);
  private readonly catalogService = inject(CatalogService);
  private readonly selectedSectorIdSubject = new BehaviorSubject<string | null>(null);

  private lastFocusedElement: HTMLElement | null = null;

  @ViewChild('lightboxCloseButton')
  private lightboxCloseButton?: ElementRef<HTMLButtonElement>;

  protected readonly brandLaneCopies = [0, 1, 2, 3] as const;
  protected readonly viewModel = toSignal(
    this.catalogService.getCatalogView(this.selectedSectorIdSubject.asObservable()),
    {
      initialValue: this.catalogService.createInitialViewModel(),
    },
  );
  protected readonly lightboxProductId = signal<string | null>(null);
  protected readonly activeProduct = computed(() => {
    const productId = this.lightboxProductId();

    if (!productId) {
      return null;
    }

    return this.viewModel().productMap[productId] ?? null;
  });

  constructor() {
    effect(() => {
      this.document.body.classList.toggle('modal-open', Boolean(this.activeProduct()));
    });
  }

  ngOnDestroy(): void {
    this.selectedSectorIdSubject.complete();
    this.document.body.classList.remove('modal-open');
  }

  @HostListener('document:keydown.escape')
  protected handleEscape(): void {
    this.closeLightbox();
  }

  protected toggleSector(sectorId: string): void {
    const nextSectorId = this.selectedSectorIdSubject.value === sectorId ? null : sectorId;
    this.selectedSectorIdSubject.next(nextSectorId);
  }

  protected openLightbox(product: CatalogProductViewModel, trigger: EventTarget | null): void {
    const fallbackElement =
      this.document.activeElement instanceof HTMLElement ? this.document.activeElement : null;

    this.lastFocusedElement = trigger instanceof HTMLElement ? trigger : fallbackElement;
    this.lightboxProductId.set(product.id);

    queueMicrotask(() => {
      this.lightboxCloseButton?.nativeElement.focus();
    });
  }

  protected closeLightbox(): void {
    if (!this.activeProduct()) {
      return;
    }

    const targetToRestore = this.lastFocusedElement;
    this.lightboxProductId.set(null);
    this.lastFocusedElement = null;

    queueMicrotask(() => {
      targetToRestore?.focus();
    });
  }

  protected getDelay(index: number, step: number): string {
    return `${(index * step).toFixed(2)}s`;
  }
}
