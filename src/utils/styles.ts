import { CSSProperties } from 'react';

export type CSSVars = CSSProperties & Record<`--${string}`, string | number | undefined>;
