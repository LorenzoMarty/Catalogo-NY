export interface StorePanel extends StoreContact {
  readonly id: string;
  readonly displayIndex: string;
  readonly name: string;
  readonly status: string;
  readonly district: string;
  readonly title: string;
  readonly mobileSignature: string;
  readonly tagline: string;
  readonly noteLocation: string;
  readonly address: string;
  readonly noteMeta: string;
  readonly marker: string;
  readonly imageAlt: string;
  readonly imageSrc: string;
  readonly imageSrcset: string;
  readonly imageWidth: number;
  readonly imageHeight: number;
  readonly accent: string;
  readonly accentStrong: string;
  readonly position: string;
}

/** [open, close] as 'HH:MM' (same day) for each weekday, 0 = Sunday. Missing day = closed. */
export type StoreHours = Readonly<
  Partial<Record<0 | 1 | 2 | 3 | 4 | 5 | 6, readonly [string, string]>>
>;

/** Contact facts. All optional: shown only when known (future source: Estoque public API). */
export interface StoreContact {
  readonly phone?: string;
  readonly mapUrl?: string;
  readonly hours?: StoreHours;
  /** IANA timezone used to compute "open now". */
  readonly timeZone?: string;
}
