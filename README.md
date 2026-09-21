# Catálogo NY

> Single-page institutional site and product catalog for a multi-branch perfumery retailer in Uruguaiana, RS (Brazil).

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

The site presents the brand, its physical stores and a searchable product catalog, with a focus on visual polish and performance on mobile. The UI is in Brazilian Portuguese.

## Features

- **Hero with parallax and ticker**, smooth scrolling powered by [Lenis](https://github.com/darkroomengineering/lenis).
- **Searchable catalog** organized by brand, with debounced search and an image lightbox.
- **Stores showcase** with per-branch address, photo and accent color.
- **Responsive navigation** with a mobile menu and a footer reveal animation.
- **Image pipeline:** build-time scripts optimize UI images into responsive `srcset` WebP sets and sync product images against a manifest.

## Tech stack

React 19 · TypeScript · Vite · React Router 7 · Framer Motion · Lenis · Vitest · [sharp](https://sharp.pixelplumbing.com) (image processing) · deployed on Vercel as a static SPA.

## Project structure

```text
src/
  components/   hero, catalog, stores, layout (nav, mobile menu), footer
  hooks/        useProductSearch, useDebouncedValue, useLightbox, useHeroParallax,
                useLenisSmoothScroll, useMobileMenu, useStoresShowcase, ...
  context/      CatalogContext
  services/     catalogService (+ tests)
  data/         catalog and stores data
  models/       TypeScript models
  pages/        HomePage
  routes/       AppRoutes
scripts/        sync-product-images.cjs, optimize-ui-images.cjs
data/           image manifest and product image sources
```

## Getting started

```bash
npm install
npm run dev
```

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest suite |
| `npm run sync:product-images` | Sync product images with the manifest |
| `npm run optimize:ui-images` | Generate optimized responsive UI images |

## Deployment

The app is a static SPA: `vercel.json` publishes `dist/` and rewrites every route to `index.html`.

## Roadmap

The catalog is currently static. The plan is to consume products (featured items, best sellers) directly from the companion inventory system (Estoque NY).
