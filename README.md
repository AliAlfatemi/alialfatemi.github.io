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

## Audit of the previous site

The previous implementation was a single 1,982-line page built from runtime Tailwind, Google Fonts, Font Awesome, a JavaScript typewriter, a continuously animated neural canvas, glass cards, mouse-driven tilt, and more than twenty equally weighted publication cards.

The redesign addresses these issues:

- Important content now has stable, crawlable URLs instead of hash anchors.
- The core value proposition exists in source HTML rather than being typed by JavaScript.
- Published work and preprints have explicit, distinct statuses.
- The broken grammar-paper link and obsolete GLOBECOM program link are replaced with official records.
- A verified 2026 IEEE Transactions on Industrial Informatics paper missing from the old site is included.
- Stale Summer 2026 internship language and temporary classroom logistics no longer lead the profile.
- Generic or mismatched “AI” artwork is not used in the new interface.
- Authentic research figures are displayed with `object-fit: contain`, descriptive alt text, intrinsic dimensions, and lazy loading below the fold.
- Runtime visual dependencies, typewriter effects, particles, card tilt, and the O(n²) canvas loop are removed.
- The new header, filters, theme control, email reveal, focus states, keyboard navigation, and reduced-motion behavior are accessible by design.

## Sitemap and information architecture

| Route | Purpose |
| --- | --- |
| `/` | Identity, research value proposition, evidence rail, selected work, audience pathways, and current milestones |
| `/research/` | Four connected research themes organized by problem, approach, contribution, and application |
| `/publications/` | Complete static publication index with progressive search and filters for year, area, type, and authorship |
| `/projects/` | Research-to-system stories covering problem, system, methods, evaluation, and relevance |
| `/academic/` | Current appointment, teaching record, patent activity, reviewing, and verified profile links |
| `/teaching/` | Permanent teaching profile without stale classroom logistics |
| `/cv/` | Accessible HTML overview and honest download placeholders until source PDFs are supplied |
| `/news/` | Select publication and teaching milestones only |
| `/contact/` | Collaboration and role pathways, protected institutional email, and verified profiles |
| `/404.html` | Branded recovery page with useful next paths |

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
- `data/projects.json` contains the project-story model.
- `data/publications.bib` is generated for entries with complete author strings.
- `scripts/build-site.mjs` contains shared layout and page copy, then generates all checked-in HTML, `robots.txt`, `sitemap.xml`, and BibTeX.

Publication statuses are intentionally limited to `Published` and `Preprint` until a supplied CV or publisher record supports more specific states. Several legacy records still contain abbreviated author strings; the public index flags this limitation instead of fabricating author order.

## SEO and structured data

Every indexable page includes:

- A unique title and meta description.
- An absolute canonical URL.
- Open Graph and Twitter card metadata.
- A 1200×630 local social image.
- Robots directives, local favicon, theme colors, and sitemap discovery.
- Semantic landmarks and one H1.
- JSON-LD breadcrumbs.

The homepage includes a linked `Person`, `ProfilePage`, `WebSite`, and Fordham `CollegeOrUniversity` graph. The publications page adds `ScholarlyArticle` entities only for records with complete author strings. Verified profile URLs are connected through `sameAs`; ORCID is intentionally omitted until ownership is confirmed.

`robots.txt`, `sitemap.xml`, `.nojekyll`, and a custom 404 are generated automatically. A comment in the shared head marks where to add the Google Search Console verification meta tag.

## Accessibility and performance

- Skip link, semantic navigation, `aria-current`, labelled form controls, live result count, and visible focus styles.
- Keyboard-operable mobile navigation with Escape handling and focus return.
- Text-based theme control with an accessible changing label.
- Email reveal that avoids publishing the complete address in source HTML.
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

`npm run check` verifies page count, unique metadata, canonical URLs, one H1 per page, JSON-LD parsing, internal targets, image dimensions, secure publication links, sitemap, robots, favicon, social image, and BibTeX output.

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

## Information to verify before final publication

- `[INFORMATION NEEDED]` Upload the current academic CV PDF.
- `[INFORMATION NEEDED]` Upload an industry résumé PDF if a separate version exists.
- `[INFORMATION NEEDED]` Confirm previous degrees, institutions, fields, and dates.
- `[INFORMATION NEEDED]` Confirm dissertation title, advisor, laboratory, and exact expected graduation wording.
- `[INFORMATION NEEDED]` Confirm the exact teaching appointment and role for CISC 1100.
- `[INFORMATION NEEDED]` Confirm reviewer activity and whether all listed venues should remain public.
- `[INFORMATION NEEDED]` Confirm ORCID ownership before adding `0009-0004-7635-5403`.
- `[INFORMATION NEEDED]` Provide awards, grants, talks, mentoring, memberships, and research statement only if they should be published.
- `[INFORMATION NEEDED]` Restore full canonical author lists for legacy entries that still contain ellipses or “et al.”
- `[INFORMATION NEEDED]` Resolve whether the cryptocurrency arXiv entry should remain associated with Ali when the final conference metadata does not list him.
- `[INFORMATION NEEDED]` Confirm reuse rights and fidelity for paper-derived figures and website-created conceptual diagrams.
- `[INFORMATION NEEDED]` Replace the candid portrait with a professional 4:5 portrait when available.
- `[INFORMATION NEEDED]` Reconfirm current availability language before each recruiting cycle.

## Major improvements and rationale

The rebuild prioritizes credibility over spectacle. It creates durable topic pages, moves evidence close to the hero, converts publications into a useful research index, makes applied capability legible to industry visitors, distinguishes factual status, removes fragile visual dependencies, and documents every remaining information gap. The result is faster, more accessible, easier to maintain, and substantially clearer to professors, research directors, recruiters, and collaborators.
