import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const failures = [];
const pages = ["field-manual-index.html", ...Array.from({ length: 98 }, (_, index) => `episode-${String(index + 1).padStart(2, "0")}.html`)];
const count = (text, needle) => text.split(needle).length - 1;

for (const page of pages) {
  const html = await readFile(resolve(root, page), "utf8");
  const documentHead = html.match(/<head[\s\S]*?<\/head>/i)?.[0] || "";
  const isEpisode = page.startsWith("episode-");
  const expect = (condition, message) => {
    if (!condition) failures.push(`${page}: ${message}`);
  };

  expect(count(documentHead.toLowerCase(), "<title>") === 1, "expected one document title");
  expect(/<meta\s+name="description"\s+content="[^"]+"/i.test(html), "missing meta description");
  expect(count(html, 'rel="canonical"') === 1, "expected one canonical URL");
  expect(/<h1(?:\s|>)/i.test(html), "missing H1");
  expect(/brand-docks-logo\.png/.test(html), "missing local Brand Docks logo");
  expect(!/target=["']_blank["']/i.test(html), "new-tab link found");

  if (isEpisode) {
    expect(count(html, "BRAND_DOCKS_FIELD_SYSTEM_START") === 1, "generated head system is duplicated or absent");
    expect(count(html, "bd-main-footer") === 1, "Brand Docks footer is duplicated or absent");
    expect(count(html, "field-manual-reader.js") === 1, "reader script is duplicated or absent");
    expect(/"@type":"TechArticle"/.test(html), "missing TechArticle schema");
    expect(/class="bd-field-episode"/.test(html), "missing episode design class");
  } else {
    expect(/"@type": "Course"/.test(html), "missing Course schema");
    expect(/field-manual-app\.js/.test(html), "missing interactive Field Atlas app");
  }

  const localRefs = [...html.matchAll(/(?:href|src)=["']([^"']+)["']/gi)]
    .map((match) => match[1])
    .filter((ref) => !/^(?:https?:|mailto:|tel:|data:|blob:|javascript:|#)/i.test(ref));

  for (const ref of new Set(localRefs)) {
    const clean = ref.split(/[?#]/)[0];
    if (!clean) continue;
    try {
      await access(resolve(root, clean));
    } catch {
      failures.push(`${page}: broken local reference ${ref}`);
    }
  }

  const jsonLdBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const [, block] of jsonLdBlocks) {
    try {
      JSON.parse(block);
    } catch (error) {
      failures.push(`${page}: invalid JSON-LD (${error.message})`);
    }
  }
}

const sitemap = await readFile(resolve(root, "sitemap.xml"), "utf8");
if (count(sitemap, "<url>") !== 99) failures.push("sitemap.xml: expected 99 URLs");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`PASS: ${pages.length} pages, 98 episode shells, 99 sitemap URLs and all local file references verified.`);
}
