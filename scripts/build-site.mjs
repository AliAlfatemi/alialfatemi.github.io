import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publications = JSON.parse(await readFile(path.join(root, 'data/publications.json'), 'utf8'));
const projects = JSON.parse(await readFile(path.join(root, 'data/projects.json'), 'utf8'));
const sortedPublications = [...publications].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
const publicationYears = publications.map((publication) => publication.year);
const profileStats = {
  publications: publications.length,
  published: publications.filter((publication) => publication.status === 'Published').length,
  preprints: publications.filter((publication) => publication.status === 'Preprint').length,
  firstAuthor: publications.filter((publication) => publication.firstAuthor).length,
  coAuthor: publications.filter((publication) => !publication.firstAuthor).length,
  code: publications.filter((publication) => publication.links.code).length,
  ieeeTransactions: publications.filter((publication) => /^IEEE Transactions/.test(publication.venue)).length,
  yearRange: `${Math.min(...publicationYears)}–${Math.max(...publicationYears)}`
};

const patentCount = 1;

const researchAreas = [
  ['network-security', 'Network Security', 'Net. Sec.'],
  ['trustworthy-ai', 'Trustworthy AI', 'Trust'],
  ['multimodal-ai', 'Language & Multimodal AI', 'Lang.'],
  ['computer-vision', 'Computer Vision', 'Vision'],
  ['applied-ai', 'Applied AI', 'Applied']
];

const areaCount = (areaName) => publications.filter((publication) => publication.area === areaName).length;

const site = {
  url: 'https://alialfatemi.github.io',
  name: 'Ali Alfatemi',
  defaultDescription: 'Ali Alfatemi is a Fordham University Ph.D. candidate developing machine learning for DDoS defense, network security, computer vision, and multimodal AI.',
  image: '/images/og-profile.png',
  email: 'aalfatemi@fordham.edu'
};

const profileLinks = {
  scholar: 'https://scholar.google.com/citations?user=5INwJxIAAAAJ',
  github: 'https://github.com/AliAlfatemi',
  linkedin: 'https://www.linkedin.com/in/ali-alfatemi/',
  fordham: 'https://www.fordham.edu/academics/departments/computer-and-information-science/faculty-and-administration/phd-students/'
};

const navItems = [
  ['research', '/research/', 'Research'],
  ['publications', '/publications/', 'Publications'],
  ['profile', '/profile/', 'Profile']
];

const imageDimensions = {
  '/images/ddos-paper-diagram-thumb.jpg': [902, 291],
  '/images/picpip.png': [2044, 1200],
  '/images/pipeline-1400.jpg': [1400, 510],
  '/images/grassmaan.png': [1304, 766],
  '/images/mtagec-architecture.jpg': [1200, 953],
  '/images/twostege.png': [914, 318],
  '/images/aipr-captioning-pipeline.svg': [1200, 760]
};

const imageSizeAttributes = (src) => {
  const dimensions = imageDimensions[src];
  return dimensions ? ` width="${dimensions[0]}" height="${dimensions[1]}"` : '';
};

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

const absoluteUrl = (route) => `${site.url}${route === '/' ? '/' : route}`;

const jsonScript = (value) => JSON.stringify(value, null, 2).replaceAll('<', '\\u003c');

const personEntity = {
  '@type': 'Person',
  '@id': `${site.url}/#person`,
  name: 'Ali Alfatemi',
  url: `${site.url}/`,
  image: `${site.url}/images/ali-960.jpg`,
  jobTitle: 'Ph.D. Candidate and AI/ML Researcher',
  affiliation: {
    '@type': 'CollegeOrUniversity',
    '@id': 'https://www.fordham.edu/#organization',
    name: 'Fordham University',
    url: 'https://www.fordham.edu/'
  },
  sameAs: [profileLinks.scholar, profileLinks.github, profileLinks.linkedin],
  knowsAbout: [
    'AI for network security',
    'DDoS detection and mitigation',
    'Machine learning',
    'Large language models',
    'Computer vision',
    'Multimodal learning',
    'Trustworthy artificial intelligence',
    'Federated learning'
  ]
};

const homeStructuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    personEntity,
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      url: `${site.url}/`,
      name: 'Ali Alfatemi — AI Researcher',
      description: site.defaultDescription,
      publisher: { '@id': `${site.url}/#person` },
      inLanguage: 'en-US'
    },
    {
      '@type': 'ProfilePage',
      '@id': `${site.url}/#profile`,
      url: `${site.url}/`,
      name: 'Ali Alfatemi | AI Researcher in Cybersecurity & Multimodal AI',
      isPartOf: { '@id': `${site.url}/#website` },
      mainEntity: { '@id': `${site.url}/#person` },
      about: { '@id': `${site.url}/#person` },
      inLanguage: 'en-US'
    }
  ]
};

const breadcrumbData = (route, label) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${site.url}/` },
    { '@type': 'ListItem', position: 2, name: label, item: absoluteUrl(route) }
  ]
});

const scholarlyGraph = publications.map((publication) => {
  const canonicalRecord = publication.links.doi || publication.links.paper;
  const doi = publication.links.doi?.replace('https://doi.org/', '');

  return {
    '@type': 'ScholarlyArticle',
    '@id': `${site.url}/publications/#${publication.id}`,
    headline: publication.title,
    author: publication.authors.split(', ').map((name) => ({
      '@type': 'Person',
      ...(name === 'Ali Alfatemi' ? { '@id': `${site.url}/#person`, name } : { name })
    })),
    datePublished: String(publication.year),
    isPartOf: {
      '@type': publication.type === 'Journal article' ? 'Periodical' : 'CreativeWork',
      name: publication.venue
    },
    about: publication.area,
    creativeWorkStatus: publication.status,
    ...(doi ? { identifier: { '@type': 'PropertyValue', propertyID: 'DOI', value: doi } } : {}),
    ...(canonicalRecord ? { sameAs: canonicalRecord } : {}),
    ...(publication.image ? { image: `${site.url}/${publication.image}` } : {})
  };
});

const publicationItemList = {
  '@type': 'ItemList',
  '@id': `${site.url}/publications/#publication-list`,
  name: 'Ali Alfatemi publication index',
  numberOfItems: sortedPublications.length,
  itemListElement: sortedPublications.map((publication, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: { '@id': `${site.url}/publications/#${publication.id}` }
  }))
};

const publicationCollectionEntity = {
  '@type': 'CollectionPage',
  '@id': `${site.url}/publications/#collection`,
  url: `${site.url}/publications/`,
  name: 'Publications | Ali Alfatemi',
  about: { '@id': `${site.url}/#person` },
  mainEntity: { '@id': publicationItemList['@id'] }
};

const head = ({ route, title, description, structuredData, extraHead = '', canonicalOverride }) => {
  const canonical = canonicalOverride || absoluteUrl(route);
  const data = structuredData || breadcrumbData(route, title.split('|')[0].trim());
  const robots = route === '/404.html' ? 'noindex, follow' : 'index, follow, max-image-preview:large';
  return `
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="author" content="Ali Alfatemi">
    <meta name="robots" content="${robots}">
    <link rel="canonical" href="${canonical}">
    <link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
    <link rel="sitemap" href="/sitemap.xml" type="application/xml">
    <meta name="theme-color" content="#f8fafc">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="Ali Alfatemi — AI Researcher">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="${site.url}${site.image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="Ali Alfatemi — AI researcher in cybersecurity, machine learning, and multimodal intelligence">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${site.url}${site.image}">
    <meta name="twitter:image:alt" content="Ali Alfatemi — AI researcher in cybersecurity, machine learning, and multimodal intelligence">
    <link rel="stylesheet" href="/css/styles.css">
${extraHead ? `    ${extraHead}\n` : ''}
    <script type="application/ld+json">${jsonScript(data)}</script>`;
};

const header = (active = '') => `
  <a class="skip-link" href="#main-content">Skip to main content</a>
  <header class="site-header">
    <nav class="container nav-shell" aria-label="Primary navigation" data-site-nav>
      <a class="brand" href="/" ${active === 'home' ? 'aria-current="page"' : ''}>
        <span class="brand-mark" aria-hidden="true">AA</span>
        <span class="brand-copy">
          <span class="brand-name">Ali Alfatemi</span>
          <span class="brand-field">AI · Security · Vision</span>
        </span>
      </a>
      <ul class="nav-links" id="primary-menu" data-nav-menu data-open="false">
        ${navItems.map(([id, href, label]) => `<li><a href="${href}" ${active === id ? 'aria-current="page"' : ''}>${label}</a></li>`).join('')}
        <li><a class="nav-contact" href="/contact/" ${active === 'contact' ? 'aria-current="page"' : ''}>Contact</a></li>
      </ul>
      <div class="nav-actions">
        <button class="nav-toggle" type="button" data-nav-toggle aria-controls="primary-menu" aria-expanded="false" aria-label="Open navigation menu">
          <span class="nav-toggle-lines" aria-hidden="true"></span>
        </button>
      </div>
    </nav>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="container footer-simple">
      <div class="footer-row">
        <a class="brand" href="/">
          <span class="brand-mark" aria-hidden="true">AA</span>
          <span class="brand-name">Ali Alfatemi</span>
        </a>
        <p class="footer-email"><a href="mailto:${site.email}">${site.email}</a></p>
      </div>
      <ul class="footer-links footer-links--inline">
        <li><a href="${profileLinks.scholar}">Google Scholar</a></li>
        <li><a href="${profileLinks.github}">GitHub</a></li>
        <li><a href="${profileLinks.linkedin}">LinkedIn</a></li>
        <li><a href="${profileLinks.fordham}">Fordham Ph.D. directory</a></li>
      </ul>
      <div class="footer-bottom">
        <span>© <span data-current-year></span> Ali Alfatemi</span>
      </div>
    </div>
  </footer>`;

const layout = ({ route, title, description, active, content, structuredData, extraHead = '', noFooter = false, canonicalOverride }) => `<!doctype html>
<html lang="en">
<head>${head({ route, title, description, structuredData, extraHead, canonicalOverride })}
</head>
<body>
${header(active)}
<main id="main-content">${content}</main>
${noFooter ? '' : footer()}
<script src="/js/main.js" defer></script>
</body>
</html>
`;

const breadcrumb = (label) => `
  <ol class="breadcrumb" aria-label="Breadcrumb">
    <li><a href="/">Home</a></li>
    <li aria-hidden="true">/</li>
    <li aria-current="page">${escapeHtml(label)}</li>
  </ol>`;

const heroStats = (items, label = 'Highlights') => `
  <dl class="hero-stats" aria-label="${escapeHtml(label)}">
    ${items.map(([value, name]) => `<div><dt>${escapeHtml(name)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
  </dl>`;

const pageHero = ({ label, title, lead, aside = '' }) => `
  <header class="page-hero">
    <div class="container">
      ${breadcrumb(label)}
      <div class="page-hero-grid reveal">
        <div class="page-hero-title">
          <p class="eyebrow">${escapeHtml(label)}</p>
          <h1>${title}</h1>
        </div>
        <div class="page-hero-copy"><p class="lead">${lead}</p>${aside}</div>
      </div>
    </div>
  </header>`;

const externalLinks = (links = {}, compact = false) => {
  const labels = {
    paper: 'Read the paper',
    doi: 'Open DOI record',
    code: 'View source code',
    dataset: 'View dataset',
    program: 'View conference program'
  };
  return Object.entries(links).map(([kind, href]) => `
    <a class="${compact ? 'text-link' : 'button button--secondary button--small'}" href="${escapeHtml(href)}">${labels[kind] || `Open ${escapeHtml(kind)}`} <span class="arrow" aria-hidden="true">↗</span></a>`).join('');
};

const emphasizeAli = (authors) => escapeHtml(authors).replace('Ali Alfatemi', '<strong>Ali Alfatemi</strong>');

const featureSummaries = {
  'enhancing-ddos-detection-edge-networks': 'Studies a noise-tolerant, computationally efficient route to DDoS detection for edge environments where observations and resources are constrained.',
  'foreground-centric-fine-grained-recognition': 'Tests whether isolating and standardizing the visual subject can reduce background shortcuts in fine-grained recognition.',
  'mtagec-arabic-grammatical-error-correction': 'A co-authored, explainable Arabic grammatical-error-correction study that unifies correction, error typing, evidence extraction, and explanation.',
  'vision-language-image-captioning-vit-gpt-j': 'Connects a Vision Transformer encoder with GPT-J decoding to study coherent image caption generation across visual and language representations.'
};

const selectedFeatureIds = [
  'enhancing-ddos-detection-edge-networks',
  'foreground-centric-fine-grained-recognition',
  'mtagec-arabic-grammatical-error-correction'
];

const featuredPaper = (publication) => `
  <article class="feature-paper reveal">
    <div class="feature-paper-copy">
      <div class="paper-meta">
        <span class="status status--${publication.status.toLowerCase()}">${publication.status}</span>
        <span class="tag">${publication.year}</span>
        <span class="tag">${escapeHtml(publication.area)}</span>
        <span class="tag authorship-tag${publication.firstAuthor ? ' authorship-tag--first' : ''}">${publication.firstAuthor ? 'First author' : 'Co-author'}</span>
      </div>
      <h3>${escapeHtml(publication.title)}</h3>
      <p class="authors">${emphasizeAli(publication.authors)}</p>
      <p class="venue">${escapeHtml(publication.venue)}${publication.note ? ` · ${escapeHtml(publication.note)}` : ''}</p>
      <p class="paper-summary">${escapeHtml(featureSummaries[publication.id] || '')}</p>
      <div class="card-actions">${externalLinks(publication.links)}</div>
    </div>
    <figure class="feature-paper-figure">
      <img src="/${escapeHtml(publication.image)}"${imageSizeAttributes(`/${publication.image}`)} alt="${escapeHtml(publication.imageAlt)}" loading="lazy" decoding="async">
    </figure>
  </article>`;

const themeAreaCount = (...areaNames) => publications.filter((publication) => areaNames.includes(publication.area)).length;

const themeLabel = (...areaNames) => {
  const items = publications.filter((publication) => areaNames.includes(publication.area));
  const first = items.filter((publication) => publication.firstAuthor).length;
  return `${items.length} works · ${first} first-author`;
};

const homeContent = () => {
  const featured = selectedFeatureIds.map((id) => publications.find((item) => item.id === id));
  return `
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div class="hero-copy reveal">
          <p class="eyebrow">Fordham University · Ph.D. Candidate</p>
          <h1>Machine learning that keeps detecting when the data, the hardware, or the trust runs out.</h1>
          <p class="lead">I build systems that identify hostile network traffic under noisy observations, small compute budgets, and scarce labeled attack data, with connected work in trustworthy AI, computer vision, and multimodal intelligence.</p>
          <p class="availability-badge"><span class="opportunity-dot" aria-hidden="true"></span><span><strong>On the 2026–27 academic job market</strong> · available Fall 2027</span></p>
          <div class="hero-actions">
            <a class="button button--primary" href="/research/">Explore My Research <span class="arrow" aria-hidden="true">→</span></a>
            <a class="button button--secondary" href="/profile/">Full profile <span class="arrow" aria-hidden="true">→</span></a>
            <a class="button button--text" href="/contact/">Discuss a Role or Collaboration <span class="arrow" aria-hidden="true">→</span></a>
          </div>
        </div>
        <dl class="evidence-rail reveal" aria-label="Verified record">
          <div class="evidence-item"><dt class="meta-label">Publications</dt><dd><strong>${profileStats.publications}</strong></dd></div>
          <div class="evidence-item"><dt class="meta-label">First-author</dt><dd><strong>${profileStats.firstAuthor}</strong></dd></div>
          <div class="evidence-item"><dt class="meta-label">IEEE Transactions</dt><dd><strong>${profileStats.ieeeTransactions}</strong></dd></div>
          <div class="evidence-item"><dt class="meta-label">Granted patent</dt><dd><strong>${patentCount}</strong></dd></div>
        </dl>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="research-heading">
    <div class="container">
      <div class="section-heading reveal">
        <div><span class="section-index">Research agenda</span><h2 id="research-heading">Four connected lines of inquiry</h2></div>
        <div><p>The unifying question is practical: how can learning systems remain useful when data, compute, and trust are constrained?</p></div>
      </div>
      <div class="theme-grid">
        <article class="theme-card reveal"><span class="theme-number">${themeAreaCount('Network Security')} works</span><h3>AI for network security</h3><p>Detection and mitigation methods for DDoS attacks across edge, IoT, and computational social systems.</p><a class="text-link" href="/research/#network-security">Explore this research area <span class="arrow" aria-hidden="true">→</span></a></article>
        <article class="theme-card reveal"><span class="theme-number">${themeAreaCount('Trustworthy AI')} works</span><h3>Trustworthy and data-efficient learning</h3><p>Robust, interpretable, and resource-aware learning, including meta-learning and federated settings.</p><a class="text-link" href="/research/#trustworthy-ai">Explore this research area <span class="arrow" aria-hidden="true">→</span></a></article>
        <article class="theme-card reveal"><span class="theme-number">${themeAreaCount('Language & Multimodal AI')} works</span><h3>Multimodal and language intelligence</h3><p>Vision–language integration, explainable grammatical error correction, and LLM-enhanced analysis.</p><a class="text-link" href="/research/#multimodal-ai">Explore this research area <span class="arrow" aria-hidden="true">→</span></a></article>
        <article class="theme-card reveal"><span class="theme-number">${themeAreaCount('Computer Vision', 'Applied AI')} works</span><h3>Computer vision and applied AI</h3><p>Foreground-centric recognition and learning across healthcare, forecasting, robotics, and visual understanding.</p><a class="text-link" href="/research/#computer-vision">Explore this research area <span class="arrow" aria-hidden="true">→</span></a></article>
      </div>
    </div>
  </section>

  <section class="section section--surface" aria-labelledby="selected-work-heading">
    <div class="container">
      <div class="section-heading reveal">
        <div><span class="section-index">Selected work</span><h2 id="selected-work-heading">Representative publications</h2></div>
        <div><p>Selected work is presented by research question and contribution. The complete index clearly separates published work from preprints.</p><p><a class="text-link" href="/publications/">Browse all publications <span class="arrow" aria-hidden="true">→</span></a></p></div>
      </div>
${featured.map(featuredPaper).join('')}
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="contact-heading">
    <div class="container contact-band">
      <div>
        <span class="section-index">Get in touch</span>
        <h2 id="contact-heading">Let's talk.</h2>
        <p class="lead">Open to research collaborations, postdoctoral and faculty roles, and applied Research Scientist, Applied Scientist, and AI security positions.</p>
      </div>
      <p class="contact-email"><a href="mailto:${site.email}">${site.email}</a></p>
    </div>
  </section>`;
};

const caseStudy = (project) => {
  const publication = publications.find((item) => item.id === project.id || project.links.doi === item.links.doi);
  const record = publication ? `/publications/#${publication.id}` : (project.links.paper || project.links.doi);
  return `
        <div class="case-study">
          <h3>Case study — ${escapeHtml(project.title)}</h3>
          <p>${escapeHtml(project.system)}</p>
          <dl class="project-facts">
            <div><dt>Methods</dt><dd>${escapeHtml(project.methods.join(' · '))}</dd></div>
            <div><dt>Evaluation</dt><dd>${escapeHtml(project.evaluation)}</dd></div>
            <div><dt>Relevance</dt><dd>${escapeHtml(project.relevance)}</dd></div>
          </dl>
          <p><a class="text-link" href="${escapeHtml(record)}">View publication record <span class="arrow" aria-hidden="true">→</span></a></p>
        </div>`;
};

const projectById = (id) => projects.find((project) => project.id === id);

const researchContent = () => `
  ${pageHero({
    label: 'Research',
    title: 'Security-focused learning, from method to system.',
    lead: 'My research connects network defense, trustworthy machine learning, multimodal intelligence, and computer vision through robustness, efficiency, and practical evaluation.',
    aside: heroStats([['4', 'Connected themes'], [String(profileStats.firstAuthor), 'First-author works'], [profileStats.yearRange, 'Publication years']], 'Research overview')
  })}
  <section class="section--tight">
    <div class="container">
      <ol class="research-flow" aria-label="Research process">
        <li class="flow-step"><strong>Frame the threat</strong><span>Define the operational constraint, failure mode, or data gap.</span></li>
        <li class="flow-step"><strong>Design the model</strong><span>Select architectures suited to the data and deployment context.</span></li>
        <li class="flow-step"><strong>Stress the system</strong><span>Evaluate robustness, generalization, efficiency, and interpretability.</span></li>
        <li class="flow-step"><strong>Translate the result</strong><span>Connect experimental findings to practical deployment decisions.</span></li>
      </ol>
    </div>
  </section>
  <section class="section--tight" aria-label="Research themes">
    <div class="container">
      <article class="research-theme" id="network-security">
        <div><span class="section-index">${themeLabel('Network Security')}</span><h2>AI for network security</h2></div>
        <div>
          <h3>Problem</h3><p>DDoS defense must identify hostile traffic under noisy measurements, shifting attack patterns, and the compute limits of edge and IoT systems.</p>
          <h3>Approach</h3><p>I study shallow and deep neural models, noise-aware learning, meta-learning, multi-model fusion, and LLM-enhanced reasoning for detection and mitigation.</p>
          ${caseStudy(projectById('edge-ddos-defense'))}
          ${caseStudy(projectById('llm-enhanced-ddos'))}
        </div>
        <aside class="research-aside"><h3>Also in this area</h3><ul><li>Data-efficient ProtoMAML and dual-space prototypical detection methods.</li><li>Multi-model fusion for combinatorial DDoS classification.</li></ul><p><a class="text-link" href="/publications/?area=Network+Security">View all security publications <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
      <article class="research-theme" id="trustworthy-ai">
        <div><span class="section-index">${themeLabel('Trustworthy AI')}</span><h2>Trustworthy and data-efficient AI</h2></div>
        <div><h3>Problem</h3><p>Accuracy alone is not enough when learning systems face scarce labels, distribution shifts, privacy constraints, or decisions that need explanation.</p><h3>Approach</h3><p>My work considers robustness through controlled noise, few-shot and meta-learning, interpretable analysis, and trustworthy federated learning for distributed settings.</p></div>
        <aside class="research-aside"><h3>Relevant settings</h3><ul><li>Industrial IoT and federated learning.</li><li>Security operations and explainable mitigation.</li><li>Data-constrained model development.</li></ul><p><a class="text-link" href="/publications/?area=Trustworthy+AI">View trustworthy-AI publications <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
      <article class="research-theme" id="multimodal-ai">
        <div><span class="section-index">${themeLabel('Language & Multimodal AI')}</span><h2>Multimodal and language intelligence</h2></div>
        <div>
          <h3>Problem</h3><p>Useful intelligent systems must align representations across modalities and produce outputs that remain coherent, grounded, and interpretable.</p>
          <h3>Approach</h3><p>I investigate vision–language encoder–decoder systems, LLM-assisted security analysis, and co-authored explainable grammatical-error-correction methods.</p>
          ${caseStudy(projectById('explainable-arabic-gec'))}
        </div>
        <aside class="research-aside"><h3>Also in this area</h3><ul><li>ViT and GPT-J integration for image captioning.</li><li>On-premise LLM reasoning for real-time DDoS mitigation.</li></ul><p><a class="text-link" href="/publications/?area=Language+%26+Multimodal+AI">View language and multimodal work <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
      <article class="research-theme" id="computer-vision">
        <div><span class="section-index">${themeLabel('Computer Vision', 'Applied AI')}</span><h2>Computer vision and applied AI</h2></div>
        <div>
          <h3>Problem</h3><p>Visual classifiers often struggle when categories differ by subtle features or when background context changes between training and use.</p>
          <h3>Approach</h3><p>I study foreground-centric representation, fine-grained recognition, and data augmentation, while applying machine learning in healthcare, forecasting, and robotics collaborations.</p>
          ${caseStudy(projectById('foreground-centric-recognition'))}
        </div>
        <aside class="research-aside"><h3>Also in this area</h3><ul><li>Image captioning and accessible interfaces.</li><li>Multi-omics patient subgrouping on a Grassmann manifold.</li></ul><p><a class="text-link" href="/publications/?area=Computer+Vision">View computer-vision publications <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
    </div>
  </section>
  <section class="section section--surface">
    <div class="narrow prose">
      <span class="section-index">Collaboration</span>
      <h2>Research questions worth discussing</h2>
      <p>I am interested in collaborations around adaptive network defense, trustworthy AI evaluation, efficient LLM use in security workflows, multimodal systems, and learning under limited or noisy data.</p>
      <div class="button-row"><a class="button button--primary" href="/contact/">Discuss a research collaboration <span class="arrow" aria-hidden="true">→</span></a><a class="button button--secondary" href="/publications/">Browse publications</a></div>
    </div>
  </section>`;

const publicationCitation = (publication) => `${publication.authors} (${publication.year}). ${publication.title}. ${publication.venue}${publication.note ? `, ${publication.note}` : ''}`;

const publicationRow = (publication) => {
  const search = `${publication.title} ${publication.authors} ${publication.venue} ${publication.area} ${publication.status} ${publication.type}`;
  return `
    <li class="publication-row" id="${publication.id}" data-publication data-year="${publication.year}" data-area="${escapeHtml(publication.area)}" data-type="${escapeHtml(publication.type)}" data-author="${publication.firstAuthor ? 'First author' : 'Co-author'}" data-search="${escapeHtml(search)}">
      <time class="publication-year" datetime="${publication.year}">${publication.year}</time>
      <article>
        <h2>${escapeHtml(publication.title)}</h2>
        <p class="authors">${emphasizeAli(publication.authors)}</p>
        <p class="venue">${escapeHtml(publication.venue)}${publication.note ? ` · ${escapeHtml(publication.note)}` : ''}</p>
        <div class="publication-links">
          ${Object.entries(publication.links).map(([kind, href]) => {
            const labels = { paper: 'Read paper', doi: 'DOI record', code: 'Source code', program: 'Conference program' };
            return `<a href="${escapeHtml(href)}">${labels[kind] || escapeHtml(kind)} <span aria-hidden="true">↗</span></a>`;
          }).join('')}
          <button class="citation-toggle" type="button" data-copy-citation="${escapeHtml(publicationCitation(publication))}" aria-label="Copy citation for ${escapeHtml(publication.title)}">Copy citation</button>
        </div>
      </article>
      <div class="publication-side">
        <span class="status status--${publication.status.toLowerCase()}">${publication.status}</span>
        <span class="tag">${escapeHtml(publication.type)}</span>
        <span class="publication-authorship${publication.firstAuthor ? ' publication-authorship--first' : ''}">${publication.firstAuthor ? 'First author' : 'Co-author'}</span>
      </div>
    </li>`;
};

const publicationsContent = () => {
  const years = [...new Set(publications.map((item) => item.year))].sort((a, b) => b - a);
  const areas = [...new Set(publications.map((item) => item.area))].sort();
  const types = [...new Set(publications.map((item) => item.type))].sort();
  return `
  ${pageHero({
    label: 'Publications',
    title: 'Peer-reviewed work, clearly indexed.',
    lead: 'Browse the publication record by year, research area, type, or authorship. Status labels clearly separate published work from preprints.',
    aside: heroStats([
      [String(profileStats.publications), 'Research works'],
      [String(profileStats.published), 'Published'],
      [String(profileStats.firstAuthor), 'First-author']
    ], 'Publication record')
  })}
  <section class="section--tight">
    <div class="container">
      <form class="filter-panel" role="search" aria-label="Filter publications" onsubmit="return false">
        <label class="filter-group" for="publication-search"><span class="filter-label">Search</span><input class="filter-control" id="publication-search" type="search" placeholder="Title, author, venue, topic…" autocomplete="off"></label>
        <label class="filter-group" for="publication-year"><span class="filter-label">Year</span><select class="filter-control" id="publication-year"><option value="">All years</option>${years.map((year) => `<option value="${year}">${year}</option>`).join('')}</select></label>
        <label class="filter-group" for="publication-area"><span class="filter-label">Area</span><select class="filter-control" id="publication-area"><option value="">All areas</option>${areas.map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`).join('')}</select></label>
        <label class="filter-group" for="publication-type"><span class="filter-label">Type</span><select class="filter-control" id="publication-type"><option value="">All types</option>${types.map((type) => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`).join('')}</select></label>
        <label class="filter-group" for="publication-author"><span class="filter-label">Authorship</span><select class="filter-control" id="publication-author"><option value="">All authorship</option><option value="First author">First author</option><option value="Co-author">Co-author</option></select></label>
        <button class="button button--secondary button--small filter-reset" type="button" data-filter-reset>Reset</button>
      </form>
      <div class="results-line"><p><strong data-result-count aria-live="polite">${publications.length} publications</strong></p><p>Source data: <a href="/data/publications.json">JSON</a> · <a href="/data/publications.bib">BibTeX</a></p></div>
      <ol class="publication-list" data-publication-list>
        ${sortedPublications.map(publicationRow).join('')}
      </ol>
      <p class="empty-state" data-empty-state hidden>No publications match these filters. Reset the filters or broaden the search.</p>
      <p class="visually-hidden" data-copy-status aria-live="polite"></p>
    </div>
  </section>`;
};

const teachingCourses = [
  { code: 'CISC 1100 E01', term: 'Spring 2026', desc: 'Sets, logic, relations, functions, combinatorics, graph theory, and computer-based lab projects.' },
  { code: 'CISC 1100 R03', term: 'Fall 2025', desc: 'Sets, logic, Boolean algebra, recursion, and graphs, with an emphasis on rigorous problem solving.' }
];

const reviewedVenues = ['Information Fusion', 'IEEE Transactions on Network and Service Management', 'Scientific Reports', 'Artificial Intelligence Review', 'Signal, Image and Video Processing', 'The Journal of Supercomputing', 'Cluster Computing', 'IEEE WCCI 2024', 'IJCNN 2025'];

const profileContent = () => `
  ${pageHero({
    label: 'Profile',
    title: 'Education, teaching, and professional record.',
    lead: 'A short summary of my doctoral research, teaching, patent, service, and publication record.',
    aside: heroStats([
      ['Ph.D.', 'Computer science'],
      ['2 terms', 'Course instruction'],
      ['1', 'Granted patent']
    ], 'Profile record')
  })}
  <section class="section">
    <div class="container">
    <div class="profile-simple">
      <header class="cv-print-header"><div><p class="cv-print-name">Ali Alfatemi</p><p>Ph.D. Candidate · AI/ML Researcher · Instructor</p></div><div><a href="mailto:${site.email}">${site.email}</a><span>New York, NY</span></div></header>

      <p class="lead">Ph.D. Candidate in Computer Science at Fordham University, expected Spring 2027. I develop machine-learning methods for DDoS detection and network defense, with connected research in trustworthy AI, computer vision, language, and multimodal intelligence.</p>

      <div class="profile-block">
        <span class="section-index">Teaching</span>
        <p>I taught CISC 1100, Structures of Computer Science, at Fordham in Fall 2025 and Spring 2026.</p>
        <p>${teachingCourses.map((course) => `<strong>${course.term}</strong> · Instructor, ${course.code}`).join('<br>')}</p>
      </div>

      <div class="profile-block">
        <span class="section-index">Patent</span>
        <p>Chinese patent CN113537358B, “Cancer subtype identification via multi-omics data integration.” Co-inventors: Hongmin Cai and Ali Alfatemi. <a href="https://patents.google.com/patent/CN113537358B/en">Patent record ↗</a></p>
      </div>

      <div class="profile-block">
        <span class="section-index">Peer review</span>
        <p>${reviewedVenues.join(' · ')}</p>
      </div>

      <div class="profile-block">
        <span class="section-index">Publications</span>
        <p>${profileStats.published} published works · ${profileStats.preprints} preprints · ${profileStats.firstAuthor} first-author. <a class="text-link" href="/publications/">View the complete publication index <span class="arrow" aria-hidden="true">→</span></a></p>
      </div>

      <div class="profile-block">
        <span class="section-index">Contact</span>
        <p class="contact-email"><a href="mailto:${site.email}">${site.email}</a></p>
        <p><a href="${profileLinks.scholar}">Google Scholar ↗</a> · <a href="${profileLinks.github}">GitHub ↗</a> · <a href="${profileLinks.linkedin}">LinkedIn ↗</a> · <a href="${profileLinks.fordham}">Fordham Ph.D. directory ↗</a></p>
      </div>
    </div>
    </div>
  </section>`;

const contactContent = () => `
  ${pageHero({
    label: 'Contact',
    title: 'Let’s work on a hard problem.',
    lead: 'I welcome focused conversations about research collaboration, postdoctoral and faculty paths, and applied AI roles spanning security, machine learning, computer vision, and multimodal systems.'
  })}
  <section class="section">
    <div class="container contact-grid">
      <div>
        <span class="section-index">Good reasons to connect</span>
        <h2>Research, roles, and collaboration</h2>
        <div class="prose"><p>Useful first messages include the problem or role, why my work appears relevant, the expected timeline, and any paper, project, or team context that will help frame the conversation.</p><ul><li>Academic research collaboration and joint proposals.</li><li>Postdoctoral, faculty, or teaching opportunities.</li><li>Research Scientist, Applied Scientist, ML engineering, computer vision, and AI security roles.</li><li>Technical discussion around DDoS defense, trustworthy AI, LLM security, and multimodal learning.</li></ul></div>
      </div>
      <aside class="contact-card">
        <span class="section-index">Direct contact</span>
        <h2>Email Ali</h2>
        <p>Use my Fordham email for research and professional inquiries.</p>
        <p class="contact-email"><a href="mailto:${site.email}">${site.email}</a></p>
        <ul class="contact-list">
          <li><span>LinkedIn</span><a href="${profileLinks.linkedin}">Open profile ↗</a></li>
          <li><span>GitHub</span><a href="${profileLinks.github}">View repositories ↗</a></li>
          <li><span>Scholar</span><a href="${profileLinks.scholar}">View publications ↗</a></li>
          <li><span>Fordham</span><a href="${profileLinks.fordham}">Ph.D. directory ↗</a></li>
        </ul>
      </aside>
    </div>
  </section>`;

const errorContent = () => `
  <section class="error-page">
    <div class="narrow">
      <p class="error-code">404</p>
      <h1>This research trail ends here.</h1>
      <p class="lead">The page may have moved or the address may be incomplete. The research, publication index, and contact paths are still available.</p>
      <div class="button-row" style="justify-content:center"><a class="button button--primary" href="/">Return home</a><a class="button button--secondary" href="/publications/">Browse publications</a></div>
    </div>
  </section>`;

const redirectPage = ({ route, output, fromLabel, targetRoute, targetLabel }) => ({
  route,
  output,
  title: `${fromLabel} Has Moved | Ali Alfatemi`,
  description: `${fromLabel} has moved to ${absoluteUrl(targetRoute)}.`,
  active: '',
  canonicalOverride: absoluteUrl(targetRoute),
  extraHead: `<meta http-equiv="refresh" content="0; url=${targetRoute}">`,
  structuredData: breadcrumbData(route, `${fromLabel} (moved)`),
  content: `
  <section class="section redirect-page">
    <div class="narrow">
      <p class="eyebrow">Page moved</p>
      <h1>${escapeHtml(fromLabel)} now lives at ${escapeHtml(targetLabel)}.</h1>
      <p class="lead">You should be redirected automatically. If nothing happens, continue below.</p>
      <div class="button-row"><a class="button button--primary" href="${targetRoute}">Go to ${escapeHtml(targetLabel)} <span class="arrow" aria-hidden="true">→</span></a></div>
    </div>
  </section>`
});

const pages = [
  {
    route: '/',
    output: 'index.html',
    title: 'Ali Alfatemi | AI Researcher in Cybersecurity & Multimodal AI',
    description: site.defaultDescription,
    active: 'home',
    content: homeContent(),
    structuredData: homeStructuredData
  },
  {
    route: '/research/',
    output: 'research/index.html',
    title: 'Research | Ali Alfatemi — AI Security, DDoS & Multimodal AI',
    description: 'Research by Ali Alfatemi on machine learning for network security, DDoS detection, trustworthy AI, computer vision, multimodal learning, and edge systems.',
    active: 'research',
    content: researchContent()
  },
  {
    route: '/publications/',
    output: 'publications/index.html',
    title: 'Publications | Ali Alfatemi — AI & Cybersecurity',
    description: 'Explore Ali Alfatemi’s peer-reviewed papers and preprints in network security, DDoS detection, machine learning, computer vision, multimodal AI, and NLP.',
    active: 'publications',
    content: publicationsContent(),
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        personEntity,
        breadcrumbData('/publications/', 'Publications'),
        publicationCollectionEntity,
        publicationItemList,
        ...scholarlyGraph
      ]
    },
    extraHead: '<link rel="alternate" type="application/json" href="/data/publications.json" title="Structured publication data">'
  },
  {
    route: '/profile/',
    output: 'profile/index.html',
    title: 'Profile | Ali Alfatemi',
    description: 'The complete profile and web CV of Fordham University Ph.D. candidate Ali Alfatemi: education, teaching, patent, peer-review service, and publication record.',
    active: 'profile',
    content: profileContent()
  },
  {
    route: '/contact/',
    output: 'contact/index.html',
    title: 'Contact Ali Alfatemi | AI Researcher',
    description: 'Contact Ali Alfatemi about AI research collaboration, postdoctoral or faculty opportunities, and applied machine learning and AI security roles.',
    active: 'contact',
    content: contactContent()
  },
  {
    route: '/404.html',
    output: '404.html',
    title: 'Page Not Found | Ali Alfatemi',
    description: 'The requested page could not be found. Explore Ali Alfatemi’s research, publications, and professional profile.',
    active: '',
    content: errorContent(),
    noFooter: true,
    extraHead: ''
  },
  redirectPage({ route: '/academic/', output: 'academic/index.html', fromLabel: 'Academic Profile', targetRoute: '/profile/', targetLabel: 'Profile' }),
  redirectPage({ route: '/teaching/', output: 'teaching/index.html', fromLabel: 'Teaching', targetRoute: '/profile/', targetLabel: 'Profile' }),
  redirectPage({ route: '/cv/', output: 'cv/index.html', fromLabel: 'Curriculum Vitae', targetRoute: '/profile/', targetLabel: 'Profile' }),
  redirectPage({ route: '/projects/', output: 'projects/index.html', fromLabel: 'Selected Projects', targetRoute: '/research/', targetLabel: 'Research' }),
  redirectPage({ route: '/news/', output: 'news/index.html', fromLabel: 'News', targetRoute: '/publications/', targetLabel: 'Publications' })
];

for (const page of pages) {
  const outputPath = path.join(root, page.output);
  await mkdir(path.dirname(outputPath), { recursive: true });
  const html = layout(page).replace(/[ \t]+$/gm, '');
  await writeFile(outputPath, html, 'utf8');
}

const sitemapPages = pages.filter((page) => page.route !== '/404.html');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapPages.map((page) => `  <url><loc>${absoluteUrl(page.route)}</loc></url>`).join('\n')}
</urlset>
`;

await writeFile(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
await writeFile(path.join(root, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`, 'utf8');
await writeFile(path.join(root, '.nojekyll'), '', 'utf8');

const bibType = (publication) => ({
  'Journal article': 'article',
  'Conference paper': 'inproceedings',
  'Book chapter': 'incollection',
  Preprint: 'misc'
}[publication.type] || 'misc');

const bibtex = sortedPublications
  .filter((publication) => !publication.authors.includes('et al.') && !publication.authors.includes('...'))
  .map((publication) => {
    const doiUrl = publication.links.doi
      || (publication.links.paper?.startsWith('https://doi.org/') ? publication.links.paper : '');
    const doi = doiUrl.replace('https://doi.org/', '');
    const venueField = publication.type === 'Journal article' ? 'journal' : 'booktitle';
    const fields = [
      `  title = {${publication.title}},`,
      `  author = {${publication.authors.split(', ').join(' and ')}},`,
      `  year = {${publication.year}},`,
      `  ${venueField} = {${publication.venue}},`,
      ...(doi ? [`  doi = {${doi}},`] : []),
      ...(publication.links.code ? [`  url = {${publication.links.code}},`] : [])
    ];
    fields[fields.length - 1] = fields[fields.length - 1].replace(/,$/, '');
    return `@${bibType(publication)}{${publication.id},\n${fields.join('\n')}\n}`;
  })
  .join('\n\n');

await writeFile(path.join(root, 'data/publications.bib'), `${bibtex}\n`, 'utf8');

console.log(`Built ${pages.length} pages, sitemap.xml, and robots.txt.`);
