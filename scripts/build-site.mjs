import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publications = JSON.parse(await readFile(path.join(root, 'data/publications.json'), 'utf8'));
const projects = JSON.parse(await readFile(path.join(root, 'data/projects.json'), 'utf8'));

const site = {
  url: 'https://alialfatemi.github.io',
  name: 'Ali Alfatemi',
  defaultDescription: 'Ali Alfatemi is a Fordham University Ph.D. candidate developing machine learning for DDoS defense, network security, computer vision, and multimodal AI.',
  image: '/images/og-profile.png'
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
  ['projects', '/projects/', 'Projects'],
  ['academic', '/academic/', 'Academic'],
  ['teaching', '/teaching/', 'Teaching'],
  ['cv', '/cv/', 'CV']
];

const imageDimensions = {
  '/images/ddos-paper-diagram-thumb.jpg': [902, 291],
  '/images/pipeline-1400.jpg': [1400, 510],
  '/images/grassmaan.png': [1304, 766],
  '/images/mtagec-architecture.jpg': [1200, 953],
  '/images/VisionTGPTJ.png': [926, 480],
  '/images/twostege.png': [914, 318],
  '/images/aipr-captioning-pipeline.svg': [1200, 760],
  '/images/globecom-llm-ddos-framework.svg': [1200, 760]
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

const head = ({ route, title, description, structuredData, extraHead = '' }) => {
  const canonical = absoluteUrl(route);
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
    <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f6f7f3">
    <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#081215">
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
    <!-- Search Console: replace this comment with the verification meta tag supplied for this domain. -->
    <script>
      (() => {
        try {
          const saved = localStorage.getItem('theme');
          const preferred = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          document.documentElement.dataset.theme = saved === 'dark' || saved === 'light' ? saved : preferred;
        } catch { document.documentElement.dataset.theme = 'light'; }
      })();
    </script>
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
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Switch theme">
          <span class="theme-glyph" aria-hidden="true">D</span>
        </button>
        <button class="nav-toggle" type="button" data-nav-toggle aria-controls="primary-menu" aria-expanded="false" aria-label="Open navigation menu">
          <span class="nav-toggle-lines" aria-hidden="true"></span>
        </button>
      </div>
    </nav>
  </header>`;

const footer = () => `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-intro">
          <a class="brand" href="/">
            <span class="brand-mark" aria-hidden="true">AA</span>
            <span class="brand-name">Ali Alfatemi</span>
          </a>
          <p>Machine learning research for resilient networks, trustworthy systems, and multimodal intelligence.</p>
        </div>
        <div>
          <p class="footer-heading">Explore</p>
          <ul class="footer-links">
            <li><a href="/research/">Research agenda</a></li>
            <li><a href="/publications/">Publication index</a></li>
            <li><a href="/projects/">Applied project stories</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-heading">Academic</p>
          <ul class="footer-links">
            <li><a href="/academic/">Academic profile</a></li>
            <li><a href="/teaching/">Teaching</a></li>
            <li><a href="/cv/">CV and résumé</a></li>
            <li><a href="/news/">News</a></li>
          </ul>
        </div>
        <div>
          <p class="footer-heading">Profiles</p>
          <ul class="footer-links">
            <li><a href="${profileLinks.scholar}">Google Scholar</a></li>
            <li><a href="${profileLinks.github}">GitHub</a></li>
            <li><a href="${profileLinks.linkedin}">LinkedIn</a></li>
            <li><a href="${profileLinks.fordham}">Fordham profile</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© <span data-current-year></span> Ali Alfatemi</span>
        <span>Static, accessible, and intentionally lightweight.</span>
      </div>
    </div>
  </footer>`;

const layout = ({ route, title, description, active, content, structuredData, extraHead = '', noFooter = false }) => `<!doctype html>
<html lang="en">
<head>${head({ route, title, description, structuredData, extraHead })}
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

const pageHero = ({ label, title, lead, aside = '' }) => `
  <header class="page-hero">
    <div class="container">
      ${breadcrumb(label)}
      <div class="page-hero-grid">
        <div>
          <p class="eyebrow">${escapeHtml(label)}</p>
          <h1>${title}</h1>
        </div>
        <div><p class="lead">${lead}</p>${aside}</div>
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

const homeContent = () => {
  const featured = selectedFeatureIds.map((id) => publications.find((item) => item.id === id));
  return `
  <section class="hero">
    <div class="container">
      <div class="hero-grid">
        <div class="hero-copy reveal">
          <p class="eyebrow">Fordham University · Ph.D. Candidate</p>
          <h1>Ali Alfatemi <span class="hero-title">AI researcher for resilient and trustworthy systems.</span></h1>
          <p class="lead">I develop machine learning systems for DDoS detection and network defense, then extend those ideas across multimodal intelligence, computer vision, and data-efficient AI.</p>
          <p class="opportunity-line"><span class="opportunity-dot" aria-hidden="true"></span><span>Open to research collaborations and conversations about postdoctoral, faculty, Research Scientist, Applied Scientist, ML engineering, and AI security opportunities.</span></p>
          <div class="hero-actions">
            <a class="button button--primary" href="/research/">Explore My Research <span class="arrow" aria-hidden="true">→</span></a>
            <a class="button button--secondary" href="/cv/#downloads">Download CV <span class="arrow" aria-hidden="true">↓</span></a>
            <a class="button button--text" href="/contact/">Discuss a Role or Collaboration <span class="arrow" aria-hidden="true">→</span></a>
          </div>
        </div>
        <aside class="hero-visual reveal" aria-label="Research profile portrait and working method">
          <div class="portrait-frame">
            <img src="/images/ali-960.jpg" width="720" height="960" alt="Ali Alfatemi working with a research paper and laptop in New York" fetchpriority="high" decoding="async">
            <div class="portrait-label">
              <strong>Research → systems</strong>
              <span>New York · Security · Machine intelligence</span>
            </div>
          </div>
          <div class="signal-strip" aria-label="Research workflow">
            <div class="signal-step"><span>01</span><strong>Detect</strong></div>
            <div class="signal-step"><span>02</span><strong>Reason</strong></div>
            <div class="signal-step"><span>03</span><strong>Deploy</strong></div>
          </div>
        </aside>
      </div>
      <div class="evidence-rail reveal" aria-label="Profile evidence">
        <div class="evidence-item"><span class="meta-label">Affiliation</span><strong>Computer Science, Fordham University</strong></div>
        <div class="evidence-item"><span class="meta-label">Core problem</span><strong>Intelligent DDoS detection and network defense</strong></div>
        <div class="evidence-item"><span class="meta-label">Research range</span><strong>Security · LLMs · vision · trustworthy AI</strong></div>
        <div class="evidence-item"><span class="meta-label">Publication record</span><a href="${profileLinks.scholar}">Verified on Google Scholar <span aria-hidden="true">↗</span></a></div>
      </div>
    </div>
  </section>

  <section class="section" aria-labelledby="research-heading">
    <div class="container">
      <div class="section-heading reveal">
        <div><span class="section-index">Research agenda / 01</span><h2 id="research-heading">Four connected lines of inquiry</h2></div>
        <div><p>The unifying question is practical: how can learning systems remain useful when data, compute, and trust are constrained?</p></div>
      </div>
      <div class="theme-grid">
        <article class="theme-card reveal"><span class="theme-number">R·01</span><h3>AI for network security</h3><p>Detection and mitigation methods for DDoS attacks across edge, IoT, and computational social systems.</p><a class="text-link" href="/research/#network-security">Trace this theme <span class="arrow" aria-hidden="true">→</span></a></article>
        <article class="theme-card reveal"><span class="theme-number">R·02</span><h3>Trustworthy and data-efficient learning</h3><p>Robust, interpretable, and resource-aware learning, including meta-learning and federated settings.</p><a class="text-link" href="/research/#trustworthy-ai">Trace this theme <span class="arrow" aria-hidden="true">→</span></a></article>
        <article class="theme-card reveal"><span class="theme-number">R·03</span><h3>Multimodal and language intelligence</h3><p>Vision–language integration, explainable grammatical error correction, and LLM-enhanced analysis.</p><a class="text-link" href="/research/#multimodal-ai">Trace this theme <span class="arrow" aria-hidden="true">→</span></a></article>
        <article class="theme-card reveal"><span class="theme-number">R·04</span><h3>Computer vision and applied AI</h3><p>Foreground-centric recognition and learning across healthcare, forecasting, robotics, and visual understanding.</p><a class="text-link" href="/research/#computer-vision">Trace this theme <span class="arrow" aria-hidden="true">→</span></a></article>
      </div>
    </div>
  </section>

  <section class="section section--surface" aria-labelledby="selected-work-heading">
    <div class="container">
      <div class="section-heading reveal">
        <div><span class="section-index">Selected evidence / 02</span><h2 id="selected-work-heading">Representative publications</h2></div>
        <div><p>Selected work is presented by research question and contribution. The complete index clearly separates published work from preprints.</p><p><a class="text-link" href="/publications/">Browse all publications <span class="arrow" aria-hidden="true">→</span></a></p></div>
      </div>
${featured.map(featuredPaper).join('')}
    </div>
  </section>

  <section class="section" aria-labelledby="pathways-heading">
    <div class="container">
      <div class="section-heading reveal">
        <div><span class="section-index">Ways to engage / 03</span><h2 id="pathways-heading">One research identity, two useful entry points</h2></div>
        <p>Whether the next conversation begins with a paper or a product problem, the underlying work is the same: rigorous experimentation translated into systems judgment.</p>
      </div>
      <div class="pathway-grid">
        <article class="pathway reveal"><span class="section-index">Academic collaboration</span><h3>Research, teaching, and scholarly service</h3><p>Explore the research agenda, publication record, teaching profile, and verified academic activities.</p><a class="text-link" href="/academic/">View the academic profile <span class="arrow" aria-hidden="true">→</span></a></article>
        <article class="pathway pathway--dark reveal"><span class="section-index">Applied AI roles</span><h3>Systems thinking for real-world AI</h3><p>See how security, vision, LLM, and evaluation work translates into practical engineering and research problems.</p><a class="text-link" href="/projects/">Explore applied project stories <span class="arrow" aria-hidden="true">→</span></a></article>
      </div>
    </div>
  </section>

  <section class="section section--tight" aria-labelledby="news-heading">
    <div class="container">
      <div class="section-heading reveal">
        <div><span class="section-index">Recent updates / 04</span><h2 id="news-heading">Publication milestones</h2></div>
        <p><a class="text-link" href="/news/">View all verified updates <span class="arrow" aria-hidden="true">→</span></a></p>
      </div>
      <ol class="news-list reveal">
        <li class="news-item"><time datetime="2026-07-10">Jul 2026</time><a href="https://doi.org/10.1109/TNSM.2026.3710874">ShallowNet published in IEEE Transactions on Network and Service Management</a><span class="tag">Security</span></li>
        <li class="news-item"><time datetime="2026">2026</time><a href="https://doi.org/10.1016/j.bspc.2026.110397">MS-GBANet version of record available in Biomedical Signal Processing and Control</a><span class="tag">Vision</span></li>
        <li class="news-item"><time datetime="2026">2026</time><a href="https://doi.org/10.1109/TII.2026.3658027">Resource-efficient blockchain article published in IEEE Transactions on Industrial Informatics</a><span class="tag">Journal</span></li>
      </ol>
    </div>
  </section>`;
};

const researchContent = () => `
  ${pageHero({
    label: 'Research',
    title: 'Learning systems for constrained, high-stakes environments.',
    lead: 'My research connects network defense, trustworthy machine learning, multimodal intelligence, and computer vision through a common emphasis on robustness, efficiency, and measurable evidence.'
  })}
  <section class="section--tight">
    <div class="container">
      <div class="research-flow" aria-label="Research process">
        <div class="flow-step"><strong>Frame the threat</strong><span>Define the operational constraint, failure mode, or data gap.</span></div>
        <div class="flow-step"><strong>Design the model</strong><span>Select architectures that fit the evidence and deployment context.</span></div>
        <div class="flow-step"><strong>Stress the system</strong><span>Evaluate robustness, generalization, efficiency, and interpretability.</span></div>
        <div class="flow-step"><strong>Translate the result</strong><span>Connect experimental findings to defensible real-world use.</span></div>
      </div>
    </div>
  </section>
  <section class="section--tight" aria-label="Research themes">
    <div class="container">
      <article class="research-theme" id="network-security">
        <div><span class="section-index">R·01</span><h2>AI for network security</h2></div>
        <div><h3>Problem</h3><p>DDoS defense must identify hostile traffic under noisy measurements, shifting attack patterns, and the compute limits of edge and IoT systems.</p><h3>Approach</h3><p>I study shallow and deep neural models, noise-aware learning, meta-learning, multi-model fusion, and LLM-enhanced reasoning for detection and mitigation.</p></div>
        <aside class="research-aside"><h3>Selected contributions</h3><ul><li>Noise-tolerant edge DDoS detection.</li><li>Two-stage LLM-enhanced detection for IoT and edge networks.</li><li>Data-efficient ProtoMAML and dual-space prototypical methods.</li></ul><p><a class="text-link" href="/publications/?area=Network+Security">View security publications <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
      <article class="research-theme" id="trustworthy-ai">
        <div><span class="section-index">R·02</span><h2>Trustworthy and data-efficient AI</h2></div>
        <div><h3>Problem</h3><p>Accuracy alone is not enough when learning systems face scarce labels, distribution shifts, privacy constraints, or decisions that need explanation.</p><h3>Approach</h3><p>My work considers robustness through controlled noise, few-shot and meta-learning, interpretable analysis, and trustworthy federated learning for distributed settings.</p></div>
        <aside class="research-aside"><h3>Relevant settings</h3><ul><li>Industrial IoT and federated learning.</li><li>Security operations and explainable mitigation.</li><li>Data-constrained model development.</li></ul><p><a class="text-link" href="/projects/">See applied project stories <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
      <article class="research-theme" id="multimodal-ai">
        <div><span class="section-index">R·03</span><h2>Multimodal and language intelligence</h2></div>
        <div><h3>Problem</h3><p>Useful intelligent systems must align representations across modalities and produce outputs that remain coherent, grounded, and interpretable.</p><h3>Approach</h3><p>I investigate vision–language encoder–decoder systems, LLM-assisted security analysis, and co-authored explainable grammatical-error-correction methods.</p></div>
        <aside class="research-aside"><h3>Selected contributions</h3><ul><li>ViT and GPT-J integration for image captioning.</li><li>Co-authored MTAGEC work on explainable Arabic correction.</li><li>On-premise LLM reasoning for DDoS mitigation.</li></ul><p><a class="text-link" href="/publications/?area=Language+%26+Multimodal+AI">View language and multimodal work <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
      <article class="research-theme" id="computer-vision">
        <div><span class="section-index">R·04</span><h2>Computer vision and applied AI</h2></div>
        <div><h3>Problem</h3><p>Visual classifiers often struggle when categories differ by subtle features or when background context changes between training and use.</p><h3>Approach</h3><p>I study foreground-centric representation, fine-grained recognition, and data augmentation, while applying machine learning in healthcare, forecasting, and robotics collaborations.</p></div>
        <aside class="research-aside"><h3>Applications</h3><ul><li>Fine-grained visual recognition.</li><li>Image captioning and accessible interfaces.</li><li>Multi-omics patient subgrouping.</li></ul><p><a class="text-link" href="/publications/?area=Computer+Vision">View computer-vision publications <span class="arrow" aria-hidden="true">→</span></a></p></aside>
      </article>
    </div>
  </section>
  <section class="section section--surface">
    <div class="narrow prose">
      <span class="section-index">Collaboration</span>
      <h2>Research questions worth discussing</h2>
      <p>I am interested in collaborations around adaptive network defense, trustworthy AI evaluation, efficient LLM use in security workflows, multimodal systems, and learning under limited or noisy data.</p>
      <div class="button-row"><a class="button button--primary" href="/contact/">Discuss a research collaboration <span class="arrow" aria-hidden="true">→</span></a><a class="button button--secondary" href="/publications/">Review the evidence base</a></div>
    </div>
  </section>`;

const publicationCitation = (publication) => `${publication.authors} (${publication.year}). ${publication.title}. ${publication.venue}${publication.note ? `, ${publication.note}` : ''}`;

const publicationRow = (publication) => {
  const citationId = `citation-${publication.id}`;
  const search = `${publication.title} ${publication.authors} ${publication.venue} ${publication.area} ${publication.status} ${publication.type}`;
  return `
    <li class="publication-row" id="${publication.id}" data-publication data-year="${publication.year}" data-area="${escapeHtml(publication.area)}" data-type="${escapeHtml(publication.type)}" data-author="${publication.firstAuthor ? 'First author' : 'Co-author'}" data-search="${escapeHtml(search)}">
      <div class="publication-year">${publication.year}</div>
      <article>
        <h2>${escapeHtml(publication.title)}</h2>
        <p class="authors">${emphasizeAli(publication.authors)}</p>
        <p class="venue">${escapeHtml(publication.venue)}${publication.note ? ` · ${escapeHtml(publication.note)}` : ''}</p>
        <div class="publication-links">
          ${Object.entries(publication.links).map(([kind, href]) => {
            const labels = { paper: 'Read paper', doi: 'DOI record', code: 'Source code', program: 'Conference program' };
            return `<a href="${escapeHtml(href)}">${labels[kind] || escapeHtml(kind)} <span aria-hidden="true">↗</span></a>`;
          }).join('')}
          <button class="citation-toggle" type="button" data-copy-citation="#${citationId}" aria-label="Copy citation for ${escapeHtml(publication.title)}">Copy citation</button>
        </div>
        <div class="citation-details" id="${citationId}" tabindex="-1">${escapeHtml(publicationCitation(publication))}</div>
      </article>
      <div class="publication-side">
        <span class="status status--${publication.status.toLowerCase()}">${publication.status}</span>
        <span class="tag">${escapeHtml(publication.type)}</span>
        <span class="tag">${publication.firstAuthor ? 'First author' : 'Co-author'}</span>
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
    title: 'A clear record of published work and preprints.',
    lead: 'Search and filter the complete record by year, research area, publication type, and authorship. Status labels distinguish peer-reviewed publications from preprints.'
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
        ${publications.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title)).map(publicationRow).join('')}
      </ol>
      <p class="empty-state" data-empty-state hidden>No publications match these filters. Reset the filters or broaden the search.</p>
      <div class="notice" style="margin-top: 2rem"><p><strong>Bibliographic integrity note.</strong> Several legacy entries list abbreviated author strings. Canonical author order and full citation metadata should be checked against the attached CV or publisher records before those entries are used for automated bibliography export.</p></div>
    </div>
  </section>`;
};

const projectCard = (project, index) => `
  <article class="project-card reveal" id="${project.id}">
    <figure class="project-figure">
      <img src="${escapeHtml(project.image)}"${imageSizeAttributes(project.image)} alt="${escapeHtml(project.imageAlt)}" loading="lazy" decoding="async">
    </figure>
    <div class="project-copy">
      <span class="section-index">Project story / ${String(index + 1).padStart(2, '0')}</span>
      <h2>${escapeHtml(project.title)}</h2>
      <p>${escapeHtml(project.problem)}</p>
      <dl class="project-facts">
        <div><dt>System</dt><dd>${escapeHtml(project.system)}</dd></div>
        <div><dt>Methods</dt><dd>${escapeHtml(project.methods.join(' · '))}</dd></div>
        <div><dt>Evaluation</dt><dd>${escapeHtml(project.evaluation)}</dd></div>
        <div><dt>Relevance</dt><dd>${escapeHtml(project.relevance)}</dd></div>
      </dl>
      ${project.imageNote ? `<p class="muted"><small>${escapeHtml(project.imageNote)}</small></p>` : ''}
      <div class="card-actions">${externalLinks(project.links)}</div>
    </div>
  </article>`;

const projectsContent = () => `
  ${pageHero({
    label: 'Projects',
    title: 'Research translated into system stories.',
    lead: 'These case studies emphasize the technical problem, system design, evaluation logic, and practical relevance—not screenshots or technology lists.'
  })}
  <section class="section">
    <div class="container">
      <div class="project-grid">${projects.map(projectCard).join('')}</div>
      <div class="notice" style="margin-top: 2rem"><p><strong>Figure provenance.</strong> Website-created conceptual overviews are labeled as such. Paper-derived visuals should be checked against publisher reuse rights before broader redistribution.</p></div>
    </div>
  </section>`;

const academicContent = () => `
  ${pageHero({
    label: 'Academic profile',
    title: 'Research, teaching, and scholarly contribution.',
    lead: 'A concise record of verified academic activity. Unsupported categories such as awards, grants, and memberships are intentionally omitted until source material is provided.'
  })}
  <section class="section">
    <div class="container split-layout">
      <div>
        <span class="section-index">Current appointment</span>
        <h2>Fordham University</h2>
        <ul class="timeline">
          <li class="timeline-item"><div class="timeline-date">Expected 2027</div><div><h3>Ph.D. Candidate, Computer Science</h3><p>Fordham University · New York, New York</p><p>Research interests listed by Fordham: Large Language Models, AI for Network Security, Machine Learning, and Computer Vision.</p></div></li>
        </ul>

        <span class="section-index" style="display:block; margin-top:4rem">Teaching</span>
        <h2>Computer science teaching</h2>
        <ul class="timeline">
          <li class="timeline-item"><div class="timeline-date">Spring 2026</div><div><h3>CISC 1100 E01 · Structures of Computer Science</h3><p>Discrete structures including sets, logic, relations, functions, combinatorics, graph theory, and computer-based lab work.</p></div></li>
          <li class="timeline-item"><div class="timeline-date">Fall 2025</div><div><h3>CISC 1100 R03 · Structures of Computer Science</h3><p>Foundations in sets, logic, Boolean algebra, recursion, and graphs, with an emphasis on rigorous problem solving.</p></div></li>
        </ul>

        <span class="section-index" style="display:block; margin-top:4rem">Intellectual property</span>
        <h2>Granted patent activity</h2>
        <ul class="timeline">
          <li class="timeline-item"><div class="timeline-date">Granted · active</div><div><h3>Cancer subtype identification via multi-omics data integration</h3><p>Chinese patent CN113537358B. Co-inventors: Hongmin Cai and Ali Alfatemi.</p><p><a class="text-link" href="https://patents.google.com/patent/CN113537358B/en">View Google Patents record <span class="arrow" aria-hidden="true">↗</span></a></p></div></li>
        </ul>

        <span class="section-index" style="display:block; margin-top:4rem">Professional service</span>
        <h2>Peer reviewing</h2>
        <p class="lead">The prior profile records reviewing activity for journals and conferences across AI, networking, and computational intelligence.</p>
        <div class="tag-row">
          ${['Information Fusion', 'IEEE Transactions on Network and Service Management', 'Scientific Reports', 'Artificial Intelligence Review', 'Signal, Image and Video Processing', 'The Journal of Supercomputing', 'Cluster Computing', 'IEEE WCCI 2024', 'IJCNN 2025'].map((item) => `<span class="tag">${item}</span>`).join('')}
        </div>
      </div>
      <aside class="side-panel">
        <h2>Profile links</h2>
        <ul>
          <li><a href="${profileLinks.fordham}">Fordham Ph.D. student profile</a></li>
          <li><a href="${profileLinks.scholar}">Google Scholar</a></li>
          <li><a href="${profileLinks.github}">GitHub</a></li>
          <li><a href="${profileLinks.linkedin}">LinkedIn</a></li>
        </ul>
        <div class="notice" style="margin-top:1.5rem"><p><strong>[INFORMATION NEEDED]</strong></p><p>Previous degrees and dates, dissertation title, advisor/lab, exact teaching appointment, awards, grants, talks, memberships, and verified ORCID.</p></div>
      </aside>
    </div>
  </section>`;

const teachingContent = () => `
  ${pageHero({
    label: 'Teaching',
    title: 'Computer science foundations taught with research-level care.',
    lead: 'The permanent teaching profile focuses on course scope and learning priorities. Current rooms, office hours, and temporary logistics belong in official course channels.'
  })}
  <section class="section">
    <div class="container split-layout">
      <div>
        <span class="section-index">Teaching focus</span>
        <h2>Making formal ideas operational</h2>
        <div class="prose">
          <p>Structures of Computer Science connects mathematical language to the habits students need for algorithms, software, data science, and security: defining terms precisely, reasoning from assumptions, testing counterexamples, and communicating a solution clearly.</p>
          <p>The course records below are retained as evidence of teaching involvement, with temporary room and office-hour details removed from the permanent profile.</p>
        </div>
        <div class="course-card">
          <div class="course-head"><span class="course-code">CISC 1100 E01</span><div><h2>Structures of Computer Science</h2><p>Sets, logic, relations, functions, combinatorics, graph theory, and computer-based lab projects.</p></div><span class="course-term">Spring 2026</span></div>
        </div>
        <div class="course-card">
          <div class="course-head"><span class="course-code">CISC 1100 R03</span><div><h2>Structures of Computer Science</h2><p>Sets, logic, Boolean algebra, recursion, and graphs, with an emphasis on logical thinking.</p></div><span class="course-term">Fall 2025</span></div>
        </div>
      </div>
      <aside class="side-panel">
        <h2>For students</h2>
        <p>For current syllabi, assignments, meeting locations, and office hours, use the official learning-management system and Fordham course communications.</p>
        <div class="notice"><p><strong>[INFORMATION NEEDED]</strong></p><p>Confirm the exact appointment title and role for each course before this page is used in a formal dossier.</p></div>
      </aside>
    </div>
  </section>`;

const cvContent = () => `
  ${pageHero({
    label: 'CV & résumé',
    title: 'A concise, accessible professional overview.',
    lead: 'The HTML profile below contains only details verified from the repository or official publication records. Downloadable source documents have not yet been provided.'
  })}
  <section class="section" id="downloads">
    <div class="container split-layout">
      <div>
        <span class="section-index">At a glance</span>
        <h2>Ali Alfatemi</h2>
        <dl class="profile-facts">
          <div><dt>Position</dt><dd>Ph.D. Candidate and AI/ML Researcher</dd></div>
          <div><dt>Affiliation</dt><dd>Computer Science, Fordham University</dd></div>
          <div><dt>Expected graduation</dt><dd>Spring 2027</dd></div>
          <div><dt>Research</dt><dd>AI for network security, DDoS detection, machine learning, LLMs, computer vision, multimodal AI, trustworthy and data-efficient learning</dd></div>
          <div><dt>Teaching record</dt><dd>CISC 1100 · Structures of Computer Science, Fall 2025 and Spring 2026</dd></div>
          <div><dt>Patent</dt><dd>Co-inventor, CN113537358B, cancer subtype identification via multi-omics data integration</dd></div>
          <div><dt>Profiles</dt><dd><a href="${profileLinks.scholar}">Google Scholar</a> · <a href="${profileLinks.github}">GitHub</a> · <a href="${profileLinks.linkedin}">LinkedIn</a></dd></div>
        </dl>
        <div class="button-row"><button class="button button--secondary" type="button" data-print-page>Print this HTML profile</button><a class="button button--primary" href="/contact/">Request current materials</a></div>
      </div>
      <aside class="side-panel">
        <h2>Downloads</h2>
        <div class="notice"><p><strong>[INFORMATION NEEDED]</strong></p><p>Upload an academic CV PDF and, if available, an industry résumé PDF. Until then, no fake or incomplete download is published.</p></div>
        <p class="muted"><small>HTML profile last reviewed: July 29, 2026.</small></p>
      </aside>
    </div>
  </section>`;

const newsContent = () => `
  ${pageHero({
    label: 'News',
    title: 'Verified research and professional updates.',
    lead: 'This page is intentionally selective: publications, conference milestones, teaching activity, and other updates that materially change the professional record.'
  })}
  <section class="section--tight">
    <div class="container">
      <ol class="news-list">
        <li class="news-item"><time datetime="2026-07-10">Jul 2026</time><a href="https://doi.org/10.1109/TNSM.2026.3710874">ShallowNet: A Lightweight Neural Network Approach for Efficient Flow-Level DDoS Detection published in IEEE Transactions on Network and Service Management</a><span class="tag">Publication</span></li>
        <li class="news-item"><time datetime="2026">2026</time><a href="https://doi.org/10.1016/j.bspc.2026.110397">MS-GBANet: Multiscale graph convolution with boundary attention for medical image segmentation version of record available in Biomedical Signal Processing and Control</a><span class="tag">Publication</span></li>
        <li class="news-item"><time datetime="2026">2026</time><a href="https://doi.org/10.1109/TII.2026.3658027">A Resource-Efficient Blockchain With Delegated Fault-Tolerance for Manufacturing Nodes published in IEEE Transactions on Industrial Informatics</a><span class="tag">Publication</span></li>
        <li class="news-item"><time datetime="2026-04">Apr 2026</time><a href="https://doi.org/10.1007/978-3-032-18474-0_8">Vision-Language Integration for Image Captioning Using Vision Transformers and GPT-J published in LNCS</a><span class="tag">Publication</span></li>
        <li class="news-item"><time datetime="2026-01">Jan 2026</time><a href="https://doi.org/10.1007/s44443-025-00354-2">MTAGEC version of record published in Journal of King Saud University Computer and Information Sciences</a><span class="tag">Publication</span></li>
        <li class="news-item"><time datetime="2026">Spring 2026</time><a href="/teaching/">Teaching record updated for CISC 1100 E01, Structures of Computer Science</a><span class="tag">Teaching</span></li>
        <li class="news-item"><time datetime="2025">2025</time><a href="https://doi.org/10.1109/GLOBECOM59602.2025.11431718">Two-stage LLM-enhanced DDoS framework published at IEEE GLOBECOM 2025</a><span class="tag">Conference</span></li>
      </ol>
    </div>
  </section>`;

const contactContent = () => `
  ${pageHero({
    label: 'Contact',
    title: 'Start with the problem worth solving.',
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
        <p>The institutional address is revealed on request to reduce basic scraping while keeping contact accessible.</p>
        <button class="button button--primary" type="button" data-reveal-email data-user="aalfatemi" data-domain="fordham.edu" data-output="#email-output">Show email address</button>
        <div class="email-output" id="email-output" aria-live="polite"></div>
        <ul class="contact-list">
          <li><span>LinkedIn</span><a href="${profileLinks.linkedin}">Open profile ↗</a></li>
          <li><span>GitHub</span><a href="${profileLinks.github}">View repositories ↗</a></li>
          <li><span>Scholar</span><a href="${profileLinks.scholar}">View publications ↗</a></li>
          <li><span>Fordham</span><a href="${profileLinks.fordham}">Institutional profile ↗</a></li>
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
      '@graph': [personEntity, breadcrumbData('/publications/', 'Publications'), ...scholarlyGraph]
    },
    extraHead: '<link rel="alternate" type="application/json" href="/data/publications.json" title="Structured publication data">'
  },
  {
    route: '/projects/',
    output: 'projects/index.html',
    title: 'AI Research Projects | Ali Alfatemi',
    description: 'Selected projects by Ali Alfatemi connecting machine learning research with cybersecurity, DDoS defense, computer vision, and multimodal systems.',
    active: 'projects',
    content: projectsContent(),
    extraHead: '<link rel="alternate" type="application/json" href="/data/projects.json" title="Structured project data">'
  },
  {
    route: '/academic/',
    output: 'academic/index.html',
    title: 'Academic Profile | Ali Alfatemi',
    description: 'Education, research appointments, teaching, service, reviewing, and verified academic activities of Fordham University Ph.D. candidate Ali Alfatemi.',
    active: 'academic',
    content: academicContent()
  },
  {
    route: '/teaching/',
    output: 'teaching/index.html',
    title: 'Teaching | Ali Alfatemi — Computer Science at Fordham',
    description: 'Ali Alfatemi’s computer science teaching profile at Fordham University, including courses, teaching approach, and verified instructional experience.',
    active: 'teaching',
    content: teachingContent()
  },
  {
    route: '/cv/',
    output: 'cv/index.html',
    title: 'CV & Résumé | Ali Alfatemi',
    description: 'View Ali Alfatemi’s academic background and current profile materials for research, faculty, and applied AI opportunities.',
    active: 'cv',
    content: cvContent()
  },
  {
    route: '/news/',
    output: 'news/index.html',
    title: 'News | Ali Alfatemi',
    description: 'Verified updates from Ali Alfatemi on AI research publications, conference presentations, teaching, talks, and professional milestones.',
    active: 'news',
    content: newsContent()
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
  }
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

const bibtex = publications
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
