# Ali Alfatemi — research profile website

This repository contains a zero-dependency, statically generated academic and industry profile for Ali Alfatemi. The checked-in HTML is ready for GitHub Pages; a small Node build script keeps repeated layout, metadata, publication cards, structured data, sitemap entries, and BibTeX output consistent.

## Positioning

Primary positioning:

> AI researcher for resilient and trustworthy systems.

Supporting value proposition:

> I develop machine learning systems for DDoS detection and network defense, then extend those ideas across multimodal intelligence, computer vision, and data-efficient AI.

The site presents one coherent research identity with two entry paths:

- Academic visitors move from the research agenda to publications, teaching, service, patent activity, and CV materials.
- Industry visitors move from practical problems to system stories, methods, evaluation logic, code, and role-oriented contact.

## Implementation overview

The site is generated as plain HTML, CSS, and JavaScript so its core content remains fast, crawlable, and usable without client-side rendering. The implementation provides:

- Important content now has stable, crawlable URLs instead of hash anchors.
- The core value proposition exists in source HTML rather than being typed by JavaScript.
- Published work and preprints have explicit, distinct statuses.
- The broken grammar-paper link and obsolete GLOBECOM program link are replaced with official records.
- A complete 26-record publication index with explicit publication status.
- Current research, teaching, and professional material without temporary classroom logistics.
- Generic or mismatched “AI” artwork is not used in the new interface.
- Authentic research figures are displayed with `object-fit: contain`, descriptive alt text, intrinsic dimensions, and lazy loading below the fold.
- Runtime visual dependencies, typewriter effects, particles, card tilt, and the O(n²) canvas loop are removed.
- The new header, filters, theme control, email reveal, focus states, keyboard navigation, and reduced-motion behavior are accessible by design.

## Sitemap and information architecture

The site is four content pages. Every fact lives on exactly one page; other pages link to it rather than restate it.

| Route | Purpose |
| --- | --- |
| `/` | Identity, verified numbers, three selected papers, availability, and contact |
| `/research/` | The four research themes, each merged with its applied case study (system, methods, evaluation, relevance) |
| `/publications/` | Complete static publication index with progressive search and filters for year, area, type, and authorship |
| `/profile/` | The web CV: education, current position, teaching with course numbers and terms, patent, peer-review service, a publication summary linking to `/publications/`, and contact. Replaces the former `/academic/`, `/teaching/`, and `/cv/` pages entirely. There is no downloadable CV PDF — this page is the CV. |
| `/contact/` | Direct plain-text email and profile links |
| `/404.html` | Branded recovery page with useful next paths |

`/academic/`, `/teaching/`, `/cv/`, `/projects/`, and `/news/` were previously indexed pages. They now exist only as redirect stubs (`meta http-equiv="refresh"` plus a `rel=canonical` pointing at the new home) so external links and search-engine listings keep resolving. They are not linked from navigation, the footer, or any other page.

## Design concept

The visual concept is **Signal & Evidence**: a research dossier combining scientific-journal typography, premium lab restraint, and product-grade clarity.

- Display typography: Iowan Old Style / Palatino / Georgia system stack.
- Interface typography: native system sans stack.
- Metadata typography: native monospace stack.
- Light theme: warm paper, midnight ink, mineral teal, restrained copper.
- Dark theme: deep blue-black surfaces, high-contrast off-white, luminous teal, warm copper.
- Layout: asymmetric editorial grids, thin evidence rules, restrained radii, and minimal shadow.
- Motion: optional short reveal transitions only; all motion respects `prefers-reduced-motion`.
- Visual evidence: the portrait and research diagrams replace decorative AI imagery.

The complete token and component implementation is in `css/styles.css`.

## Content model

- `data/publications.json` is the canonical structured publication index.
- `data/projects.json` contains the case-study model; each entry is folded into its matching theme on `/research/` rather than living on a standalone page.
- `data/publications.bib` is generated from the full author strings in the publication index.
- `scripts/build-site.mjs` contains shared layout and page copy, then generates all checked-in HTML (including the five redirect stubs), `robots.txt`, `sitemap.xml`, and BibTeX.

The publication index contains 26 records. Statuses are limited to `Published` and `Preprint`, and each entry uses a complete author string, canonical source link, and stable slug.

## SEO and structured data

Every indexable page includes:

- A unique title and meta description.
- An absolute canonical URL.
- Open Graph and Twitter card metadata.
- A 1200×630 local social image.
- Robots directives, local favicon, theme colors, and sitemap discovery.
- Semantic landmarks and one H1.
- JSON-LD breadcrumbs.

The homepage includes a linked `Person`, `ProfilePage`, `WebSite`, and Fordham `CollegeOrUniversity` graph. The publications page adds a `ScholarlyArticle` entity for every published paper and preprint, with full authorship, status, venue, canonical record, and DOI metadata where available. Profile URLs are connected through `sameAs`.

`robots.txt`, `sitemap.xml`, `.nojekyll`, and a custom 404 are generated automatically.

## Accessibility and performance

- Skip link, semantic navigation, `aria-current`, labelled form controls, live result count, and visible focus styles.
- Keyboard-operable mobile navigation with Escape handling and focus return.
- Text-based theme control with an accessible changing label.
- The institutional email is plain, visible text with a `mailto:` link everywhere it appears (footer, `/contact/`, `/profile/`) — no JavaScript reveal.
- Critical hero copy rendered without JavaScript.
- All publications remain visible when JavaScript is disabled.
- System fonts and no third-party JavaScript or CSS.
- Optimized 720×960 portrait and 1,400-pixel research pipeline derivative.
- Intrinsic image dimensions, lazy loading, async decoding, and a single eager portrait.
- Reduced-motion and print styles.

## Local development

Requirements: Node 18 or newer. There are no npm dependencies.

```bash
npm run build
npm run check
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173/`.

`npm run check` verifies page count, unique metadata, canonical URLs, one H1 per page, JSON-LD parsing, internal targets, image dimensions, secure publication links, the 26-record publication data set, sitemap, robots, favicon, social image, and BibTeX output. It also confirms each redirect stub carries a working meta-refresh and a canonical pointing at its new home, and rejects internal editorial notices, the JavaScript email reveal, a checked-in CV PDF, and removed publication data if any of them reappear in generated public files.

## GitHub Pages deployment

This is the username repository `AliAlfatemi/alialfatemi.github.io`, so it needs no repository-name base path.

1. Update the structured JSON or page copy.
2. Run `npm run build`.
3. Run `npm run check`.
4. Commit the source and generated output together.
5. Push to `main`.
6. In GitHub **Settings → Pages**, use **Deploy from a branch**, branch `main`, folder `/ (root)`.
7. After deployment, verify `/robots.txt`, `/sitemap.xml`, `/404.html`, the homepage, and the publication filters.
8. Add the Search Console verification token, submit `https://alialfatemi.github.io/sitemap.xml`, and validate the JSON-LD with Schema.org or Google’s Rich Results tooling.

## Major improvements and rationale

The rebuild prioritizes credibility over spectacle. It creates durable topic pages, moves evidence close to the hero, converts publications into a useful research index, makes applied capability legible to industry visitors, distinguishes factual status, and removes fragile visual dependencies. The result is faster, more accessible, easier to maintain, and substantially clearer to professors, research directors, recruiters, and collaborators.
