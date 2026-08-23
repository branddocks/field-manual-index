import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const canonicalRoot = "https://ai.branddocks.com/field-manual";

const modules = [
  {
    num: 1,
    en: "How LLMs Work",
    gu: "LLM કેવી રીતે કામ કરે",
    range: "01-07",
    signal: "FOUNDATION",
    summaryGu: "ટોકનથી ટ્રાન્સફોર્મર સુધી - AI અંદરથી કેવી રીતે વિચારે છે તે સમજો.",
    summaryEn: "See the machinery beneath every language model, from tokens to attention.",
  },
  {
    num: 2,
    en: "Running Models & Inference",
    gu: "મોડલ ચલાવવું અને ઇન્ફરન્સ",
    range: "08-14",
    signal: "RUNTIME",
    summaryGu: "તમારા કમ્પ્યુટરથી પ્રોડક્શન સુધી મોડલ ઝડપથી અને સમજદારીથી ચલાવો.",
    summaryEn: "Choose the right runtime, hardware and serving strategy for real workloads.",
  },
  {
    num: 3,
    en: "Embeddings & Vector Search",
    gu: "અર્થને નંબર બનાવવો",
    range: "15-21",
    signal: "MEANING",
    summaryGu: "શબ્દોના અર્થને વેક્ટરમાં ફેરવીને મશીનને યોગ્ય જવાબ શોધતા શીખવો.",
    summaryEn: "Turn meaning into vectors and retrieve what matters at production speed.",
  },
  {
    num: 4,
    en: "RAG Architecture",
    gu: "જ્ઞાન જોડતી રચના",
    range: "22-28",
    signal: "RETRIEVAL",
    summaryGu: "દસ્તાવેજ, સર્ચ અને LLMને એક વિશ્વસનીય જવાબ સિસ્ટમમાં જોડો.",
    summaryEn: "Connect documents, retrieval and generation into dependable answers.",
  },
  {
    num: 5,
    en: "AI Agents",
    gu: "કામ કરતી AI",
    range: "29-35",
    signal: "ACTION",
    summaryGu: "માત્ર જવાબ નહીં - ટૂલ વાપરે, નિર્ણય લે અને કામ પૂરું કરે તેવી AI બનાવો.",
    summaryEn: "Build AI that can use tools, remember context and complete multi-step work.",
  },
  {
    num: 6,
    en: "Model Serving & APIs",
    gu: "મોડલને દુનિયા સુધી પહોંચાડવું",
    range: "36-42",
    signal: "SERVING",
    summaryGu: "સ્ટ્રીમિંગ, કેશિંગ અને ગેટવે સાથે હજારો યુઝર્સને વિશ્વસનીય સેવા આપો.",
    summaryEn: "Serve models through resilient APIs without losing speed or control.",
  },
  {
    num: 7,
    en: "Fine-Tuning",
    gu: "મોડલને તમારી ભાષા શીખવો",
    range: "43-49",
    signal: "ADAPTATION",
    summaryGu: "યોગ્ય ડેટા અને LoRAથી મોડલને તમારા વ્યવસાય માટે ખાસ બનાવો.",
    summaryEn: "Adapt a model to your domain while protecting quality and compute budget.",
  },
  {
    num: 8,
    en: "Security & Production",
    gu: "સુરક્ષા અને પ્રોડક્શન",
    range: "50-56",
    signal: "CONTROL",
    summaryGu: "જેલબ્રેક, પ્રાઇવસી, ખર્ચ અને મોનિટરિંગને ડિઝાઇનનો ભાગ બનાવો.",
    summaryEn: "Design guardrails, privacy, cost control and observability from day one.",
  },
  {
    num: 9,
    en: "The Cutting Edge",
    gu: "આવતીકાલની AI",
    range: "57-63",
    signal: "FRONTIER",
    summaryGu: "મલ્ટીમોડલ, વોઇસ, ડિફ્યુઝન અને રીઝનિંગ મોડલની નવી દિશા સમજો.",
    summaryEn: "Understand the frontier ideas shaping multimodal and reasoning systems.",
  },
  {
    num: 10,
    en: "GPU & Hardware",
    gu: "GPU અને હાર્ડવેર",
    range: "64-70",
    signal: "COMPUTE",
    summaryGu: "VRAM, multi-GPU અને cloud computeનું સાચું ગણિત શીખો.",
    summaryEn: "Make confident hardware and cloud decisions with practical compute math.",
  },
  {
    num: 11,
    en: "Tokenizers & Data Formats",
    gu: "ટોકનાઇઝર અને ડેટા ફોર્મેટ",
    range: "71-77",
    signal: "FORMAT",
    summaryGu: "BPEથી GGUF સુધી મોડલની ભાષા અને ફાઇલ ફોર્મેટને ડિકોડ કરો.",
    summaryEn: "Decode the tokenizers, model files and attention optimizations under the hood.",
  },
  {
    num: 12,
    en: "Protocols & Standards",
    gu: "પ્રોટોકોલ અને સ્ટાન્ડર્ડ",
    range: "78-84",
    signal: "CONNECT",
    summaryGu: "MCP, function calling અને event-driven AIથી ટૂલ્સ અને એજન્ટ્સ જોડો.",
    summaryEn: "Connect tools, agents and services through the standards becoming AI infrastructure.",
  },
  {
    num: 13,
    en: "MLOps & DevOps",
    gu: "MLOps અને DevOps",
    range: "85-91",
    signal: "OPERATE",
    summaryGu: "મોડલને ટેસ્ટ, વર્ઝન, ડિપ્લોય અને સતત સુધારવા માટે સિસ્ટમ બનાવો.",
    summaryEn: "Version, test, deploy and improve models with an operating discipline.",
  },
  {
    num: 14,
    en: "Real-World Architectures",
    gu: "વાસ્તવિક સિસ્ટમ રચનાઓ",
    range: "92-98",
    signal: "SHIP",
    summaryGu: "ChatGPTથી AI SaaS સુધી સંપૂર્ણ પ્રોડક્શન આર્કિટેક્ચર જોડીને જુઓ.",
    summaryEn: "Put the entire manual together through systems people use every day.",
  },
];

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&mdash;|&#8212;/g, "-")
    .replace(/&ndash;|&#8211;/g, "-");

const stripTags = (value) =>
  decodeEntities(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());

const cleanTitle = (value) =>
  stripTags(value)
    .replace(/^Ep(?:isode)?\s*0?\d+\s*[:—-]\s*/i, "")
    .replace(/\s*\|\s*98 Field Manual.*$/i, "")
    .trim();

const footer = `
<footer class="bd-main-footer" aria-label="Brand Docks footer">
  <div class="bd-footer-grid">
    <div class="bd-footer-lead">
      <a href="https://www.branddocks.com" aria-label="Brand Docks home">
        <img src="brand-docks-logo.png" alt="Brand Docks - Dock. Dominate. Disrupt." width="1000" height="300" loading="lazy">
      </a>
      <p class="bd-footer-statement">Dock. Dominate. Disrupt.</p>
      <p>A full-service digital marketing and AI agency from Junagadh, Gujarat. Strategy, design, performance and automation under one roof.</p>
      <div class="bd-social-row" aria-label="Brand Docks social links">
        <a href="https://www.instagram.com/branddocks" aria-label="Instagram">IG</a>
        <a href="https://www.facebook.com/branddocks" aria-label="Facebook">FB</a>
        <a href="https://www.linkedin.com/company/branddocks" aria-label="LinkedIn">LI</a>
        <a href="https://wa.me/918200010069" aria-label="WhatsApp">WA</a>
      </div>
    </div>
    <div>
      <p class="bd-footer-label">Explore</p>
      <ul>
        <li><a href="https://www.branddocks.com/#about">About</a></li>
        <li><a href="https://www.branddocks.com/#services">Services</a></li>
        <li><a href="https://www.branddocks.com/#cases">Case Studies</a></li>
        <li><a href="https://branddocks.com/portfolio">Portfolio</a></li>
        <li><a href="https://branddocks.com/package">Packages</a></li>
      </ul>
    </div>
    <div>
      <p class="bd-footer-label">AI Lab</p>
      <ul>
        <li><a href="https://ai.branddocks.com/">Aapdu AI</a></li>
        <li><a href="https://app.branddocks.com/">ERP</a></li>
        <li><a href="https://auto.branddocks.com">AutoDocks</a></li>
        <li><a href="https://branddocks.com/workshops">AI Workshops</a></li>
        <li><a href="field-manual-index.html">98 Field Manual</a></li>
      </ul>
    </div>
    <div>
      <p class="bd-footer-label">Contact</p>
      <ul>
        <li><a href="tel:+918200010069">+91 82000-100-69</a></li>
        <li><a href="mailto:branddocks@gmail.com">branddocks@gmail.com</a></li>
        <li><a href="https://www.branddocks.com">branddocks.com ↗</a></li>
        <li><a href="https://login.branddocks.com/u2/79289/schedule-meet-with-brand-docks-team">Schedule a meeting ↗</a></li>
      </ul>
    </div>
  </div>
  <div class="bd-footer-bottom">
    <p>© 2026 Brand Docks. Built with love in Junagadh.</p>
    <div><a href="https://branddocks.com/privacy-policy">Privacy</a><a href="https://branddocks.com/policies">Terms</a><a href="https://branddocks.com/refund-policy">Refund policy</a></div>
    <a href="#top">Back to top ↑</a>
  </div>
</footer>`;

const episodes = [];

for (let num = 1; num <= 98; num += 1) {
  const padded = String(num).padStart(2, "0");
  const filename = `episode-${padded}.html`;
  const filepath = resolve(root, filename);
  let html = await readFile(filepath, "utf8");
  const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
  const subMatch = html.match(/<p\s+class="hero-sub"[^>]*>([\s\S]*?)<\/p>/i);
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = cleanTitle(titleMatch?.[1] || h1Match?.[1] || `Episode ${num}`);
  const description = stripTags(subMatch?.[1] || `Episode ${num} of the Brand Docks 98 Field Manual.`);
  const moduleNum = Math.ceil(num / 7);
  const module = modules[moduleNum - 1];

  episodes.push({
    num,
    padded,
    href: filename,
    title,
    description,
    module: moduleNum,
  });

  const seoTitle = `${title} | 98 Field Manual by Brand Docks`;
  const seoDescription = `${description} Free bilingual AI engineering field lesson by Brand Docks.`.slice(0, 158);
  const canonical = `${canonicalRoot}/${filename}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        headline: title,
        description: seoDescription,
        url: canonical,
        inLanguage: ["en-IN", "gu-IN"],
        position: num,
        isPartOf: {
          "@type": "Course",
          name: "98 Field Manual - Zero to AI Builder",
          url: `${canonicalRoot}/field-manual-index.html`,
          provider: { "@type": "Organization", name: "Brand Docks", url: "https://www.branddocks.com" },
        },
        author: { "@type": "Organization", name: "Brand Docks", url: "https://www.branddocks.com" },
        publisher: {
          "@type": "Organization",
          name: "Brand Docks",
          logo: { "@type": "ImageObject", url: `${canonicalRoot}/brand-docks-logo.png` },
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "98 Field Manual", item: `${canonicalRoot}/field-manual-index.html` },
          { "@type": "ListItem", position: 2, name: module.en, item: `${canonicalRoot}/field-manual-index.html#module-${moduleNum}` },
          { "@type": "ListItem", position: 3, name: title, item: canonical },
        ],
      },
    ],
  };

  const headBlock = `
<!-- BRAND_DOCKS_FIELD_SYSTEM_START -->
<meta name="robots" content="index,follow,max-image-preview:large">
<meta name="author" content="Brand Docks">
<meta name="keywords" content="AI engineering, ${module.en}, ${title}, Gujarati AI course, 98 Field Manual, Brand Docks">
<link rel="canonical" href="${canonical}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="98 Field Manual by Brand Docks">
<meta property="og:title" content="${seoTitle.replace(/"/g, "&quot;")}">
<meta property="og:description" content="${seoDescription.replace(/"/g, "&quot;")}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${canonicalRoot}/brand-docks-logo.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${seoTitle.replace(/"/g, "&quot;")}">
<meta name="twitter:description" content="${seoDescription.replace(/"/g, "&quot;")}">
<link rel="icon" type="image/png" href="brand-docks-logo.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Noto+Sans+Gujarati:wght@400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="field-manual-system.css">
<script type="application/ld+json">${JSON.stringify(structuredData).replace(/</g, "\\u003c")}</script>
<script defer src="field-manual-data.js"></script>
<script defer src="field-manual-reader.js"></script>
<!-- BRAND_DOCKS_FIELD_SYSTEM_END -->`;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${seoTitle}</title>`);
  html = html.replace(/<html([^>]*)>/i, (match, attrs) => {
    const cleanAttrs = attrs
      .replace(/\sclass="[^"]*"/i, "")
      .replace(/\slang="[^"]*"/i, "");
    return `<html${cleanAttrs} class="bd-field-episode" lang="en-IN">`;
  });
  html = html.replace(/<!-- BRAND_DOCKS_FIELD_SYSTEM_START -->[\s\S]*?<!-- BRAND_DOCKS_FIELD_SYSTEM_END -->/g, "");
  html = html.replace(/<\/head>/i, `${headBlock}\n</head>`);
  html = html.replace(/<footer[^>]*>[\s\S]*?<\/footer>/i, footer);
  html = html.replaceAll(
    "https://storagev2.files-vault.com/uploads/blacklabel-380/sub-account-79289/1775541373-bchJFljNp0.webp",
    "brand-docks-logo.png",
  );
  html = html.replaceAll(`field-manual-index.html#g${moduleNum}`, `field-manual-index.html#module-${moduleNum}`);
  html = html.replace(/<script\s+defer\s+src="field-manual-data\.js"><\/script>\s*<script\s+defer\s+src="field-manual-reader\.js"><\/script>\s*(?=<\/body>)/g, "");

  await writeFile(filepath, html, "utf8");
}

const manifest = `/* Generated by tools/build-field-manual.mjs. */\nwindow.FIELD_MANUAL = ${JSON.stringify({ modules, episodes }, null, 2)};\n`;
await writeFile(resolve(root, "field-manual-data.js"), manifest, "utf8");

const sitemapEntries = ["field-manual-index.html", ...episodes.map((episode) => episode.href)]
  .map((path, index) => `  <url>\n    <loc>${canonicalRoot}/${path}</loc>\n    <changefreq>${index === 0 ? "weekly" : "monthly"}</changefreq>\n    <priority>${index === 0 ? "1.0" : "0.8"}</priority>\n  </url>`)
  .join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
await writeFile(resolve(root, "sitemap.xml"), sitemap, "utf8");

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${canonicalRoot}/sitemap.xml\n`;
await writeFile(resolve(root, "robots.txt"), robots, "utf8");

console.log(`Built bilingual manifest, SEO map and refreshed ${episodes.length} episode shells.`);
