import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = [
  'index.html',
  'research/index.html',
  'publications/index.html',
  'projects/index.html',
  'academic/index.html',
  'teaching/index.html',
  'cv/index.html',
  'news/index.html',
  'contact/index.html',
  '404.html'
];

const errors = [];
const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();
const htmlByFile = new Map();

const recordUnique = (map, value, file, label) => {
  if (!value) return errors.push(`${file}: missing ${label}`);
  if (map.has(value)) errors.push(`${file}: duplicate ${label} also used by ${map.get(value)}`);
  else map.set(value, file);
};

const internalTarget = (url) => {
  const clean = decodeURIComponent(url.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return path.join(root, 'index.html');
  const relative = clean.replace(/^\//, '');
  return path.join(root, path.extname(relative) ? relative : relative, path.extname(relative) ? '' : 'index.html');
};

for (const file of htmlFiles) {
  const html = await readFile(path.join(root, file), 'utf8');
  htmlByFile.set(file, html);
  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  recordUnique(titles, title, file, 'title');
  recordUnique(descriptions, description, file, 'meta description');
  recordUnique(canonicals, canonical, file, 'canonical URL');

  const h1Count = (html.match(/<h1(?:\s|>)/g) || []).length;
  if (h1Count !== 1) errors.push(`${file}: expected one h1, found ${h1Count}`);
  if (html.includes('href="#"')) errors.push(`${file}: contains placeholder href="#"`);
  if (/cdn\.tailwindcss|font-awesome|fonts\.googleapis|particles\.js/i.test(html)) {
    errors.push(`${file}: contains a removed runtime visual dependency`);
  }

  for (const match of html.matchAll(/<img\s+[^>]*>/g)) {
    if (!/\salt="[^"]*"/.test(match[0])) errors.push(`${file}: image missing alt attribute`);
    if (!/\swidth="\d+"/.test(match[0]) || !/\sheight="\d+"/.test(match[0])) {
      errors.push(`${file}: image missing intrinsic width or height: ${match[0].slice(0, 120)}`);
    }
  }

  for (const match of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(match[1]); }
    catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
  }

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = match[1];
    if (!url.startsWith('/') || url.startsWith('//')) continue;
    try { await access(internalTarget(url)); }
    catch { errors.push(`${file}: missing internal target ${url}`); }
  }
}

const publicationData = JSON.parse(await readFile(path.join(root, 'data/publications.json'), 'utf8'));
const statuses = new Set(['Published', 'Preprint']);
const ids = new Set();
const publicationTitles = new Set();
const publicationHtml = htmlByFile.get('publications/index.html');
for (const publication of publicationData) {
  if (ids.has(publication.id)) errors.push(`data/publications.json: duplicate id ${publication.id}`);
  ids.add(publication.id);
  if (publicationTitles.has(publication.title)) errors.push(`data/publications.json: duplicate title ${publication.title}`);
  publicationTitles.add(publication.title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(publication.id)) {
    errors.push(`data/publications.json: invalid slug id ${publication.id}`);
  }
  if (!statuses.has(publication.status)) errors.push(`data/publications.json: invalid status for ${publication.id}`);
  if (!publication.title || !publication.authors || !publication.year || !publication.venue || !publication.type) {
    errors.push(`data/publications.json: incomplete core metadata for ${publication.id}`);
  }
  if (!publication.authors.includes('Ali Alfatemi')) {
    errors.push(`data/publications.json: Ali Alfatemi missing from authors for ${publication.id}`);
  }
  if (/et al\.|\.\.\./.test(publication.authors)) {
    errors.push(`data/publications.json: abbreviated author list for ${publication.id}`);
  }
  if (publication.firstAuthor !== publication.authors.startsWith('Ali Alfatemi')) {
    errors.push(`data/publications.json: firstAuthor flag disagrees with author order for ${publication.id}`);
  }
  if (publication.status === 'Preprint' && publication.type !== 'Preprint') {
    errors.push(`data/publications.json: preprint status/type mismatch for ${publication.id}`);
  }
  if (!publication.links || Object.keys(publication.links).length === 0) {
    errors.push(`data/publications.json: missing source link for ${publication.id}`);
  }
  for (const url of Object.values(publication.links || {})) {
    if (!url.startsWith('https://')) errors.push(`data/publications.json: non-HTTPS link for ${publication.id}`);
  }
  if (!publicationHtml.includes(`id="${publication.id}"`)) {
    errors.push(`publications/index.html: missing publication row ${publication.id}`);
  }
  const expectedCitationLabel = `aria-label="Copy citation for ${publication.title.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`;
  if (!publicationHtml.includes(expectedCitationLabel)) {
    errors.push(`publications/index.html: missing specific citation label for ${publication.id}`);
  }
}

const publicationLdMatch = publicationHtml.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
if (!publicationLdMatch) {
  errors.push('publications/index.html: missing JSON-LD graph');
} else {
  const publicationLd = JSON.parse(publicationLdMatch[1]);
  const graph = publicationLd['@graph'] || [];
  const articles = graph.filter((node) => node['@type'] === 'ScholarlyArticle');
  const itemList = graph.find((node) => node['@type'] === 'ItemList');
  if (articles.length !== publicationData.length) {
    errors.push(`publications/index.html: expected ${publicationData.length} ScholarlyArticle nodes, found ${articles.length}`);
  }
  if (!itemList || itemList.numberOfItems !== publicationData.length) {
    errors.push('publications/index.html: ItemList count does not match publication data');
  }
}

const bibtex = await readFile(path.join(root, 'data/publications.bib'), 'utf8');
const bibtexCount = (bibtex.match(/^@/gm) || []).length;
if (bibtexCount !== publicationData.length) {
  errors.push(`data/publications.bib: expected ${publicationData.length} records, found ${bibtexCount}`);
}
for (const publication of publicationData) {
  if (!bibtex.includes(`{${publication.id},`)) errors.push(`data/publications.bib: missing ${publication.id}`);
}

for (const required of ['robots.txt', 'sitemap.xml', 'images/favicon.svg', 'images/og-profile.png', 'data/publications.bib']) {
  try { await access(path.join(root, required)); }
  catch { errors.push(`missing required output: ${required}`); }
}

if (errors.length) {
  console.error(`Validation failed with ${errors.length} issue${errors.length === 1 ? '' : 's'}:`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exitCode = 1;
} else {
  console.log(`Validated ${htmlFiles.length} pages, ${publicationData.length} publications, structured data, metadata, internal links, and image dimensions.`);
}
