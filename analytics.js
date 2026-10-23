// Google Analytics for the public Poolentra website.
// Loads only on the production domains, so local builds and private previews send nothing.
// Events and parameters are allowlisted: nothing a visitor types is ever sent.
(function () {
  const measurementId = 'G-C8BWYPNTPG';
  const productionHosts = [
    'poolentra.com.au',
    'www.poolentra.com.au',
    'poolentra.com',
    'www.poolentra.com',
  ];
  const allowedEvents = {
    demo_booked: [],
    book_demo_click: ['cta_location', 'cta_text'],
    email_click: ['mailbox'],
    section_view: ['section'],
  };
  const trackedSections = ['switching', 'how', 'pricing', 'demo'];
  // Only known values are ever sent; anything else becomes 'other' or is dropped.
  const pages = {
    '/': 'Home',
    '/features/': 'Features',
    '/pricing/': 'Pricing',
    '/switch-to-poolentra/': 'Switch to Poolentra',
    '/about/': 'About',
    '/book-a-demo/': 'Book a demo',
    '/privacy/': 'Privacy Policy',
    '/terms/': 'Terms of Use',
    '/accessibility/': 'Accessibility',
  };
  // WSEO-R020: where a demo link was clicked, from a fixed list; anything else is 'other'.
  const ctaLocations = [
    'header',
    'footer',
    'hero',
    'pricing',
    'switching',
    'audiences',
    'about',
    'explore',
    'closing-demo',
    'resources',
  ];
  const allowedValues = {
    mailbox: ['manager', 'support'],
    section: trackedSections,
    cta_location: ctaLocations,
    cta_text: [
      'Book a free demo',
      'Book a demo',
      'Book a Poolentra Demo',
      'Start your 30-day free trial',
      'Contact',
    ],
  };

  if (!productionHosts.includes(window.location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  // Only the page's own address goes to Google: no query string or fragment, which a
  // shared link could fill with an email or name. The referrer keeps its site only.
  let referrer = '';
  try {
    referrer = document.referrer ? new URL(document.referrer).origin + '/' : '';
  } catch {
    referrer = '';
  }
  gtag('config', measurementId, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    page_location:
      window.location.origin +
      (Object.hasOwn(pages, window.location.pathname) ? window.location.pathname : '/other'),
    page_title: Object.hasOwn(pages, window.location.pathname)
      ? 'Poolentra · ' + pages[window.location.pathname]
      : 'Poolentra',
    page_referrer: referrer,
  });
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(script);

  function track(name, params) {
    const allowed = allowedEvents[name];
    if (!allowed) return;
    const safe = {};
    for (const key of allowed) {
      const value = params && params[key];
      if (typeof value !== 'string' || !value) continue;
      if (key === 'cta_location' || key === 'cta_text') {
        safe[key] = allowedValues[key].includes(value) ? value : 'other';
      } else if (allowedValues[key].includes(value)) safe[key] = value;
    }
    gtag('event', name, safe);
  }
  window.poolentraTrack = track;

  document.addEventListener('click', (event) => {
    const link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href.startsWith('mailto:')) {
      track('email_click', { mailbox: href.slice(7).split('@')[0] });
    } else if (href.endsWith('#demo') || href.split('#')[0] === '/book-a-demo/') {
      const area = link.closest('header, footer, section');
      const tag = area && String(area.tagName || '').toLowerCase();
      const first = area && String(area.className || '').split(' ');
      const location = !area
        ? 'other'
        : tag === 'header' || tag === 'footer'
          ? tag
          : area.id || first.find((name) => ctaLocations.includes(name)) || first[0] || tag;
      track('book_demo_click', {
        cta_location: location,
        cta_text: link.textContent.replace(/\s+/g, ' ').trim(),
      });
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new window.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          track('section_view', { section: entry.target.id });
        }
      },
      { rootMargin: '0px 0px -50% 0px' },
    );
    for (const id of trackedSections) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
  }
})();
