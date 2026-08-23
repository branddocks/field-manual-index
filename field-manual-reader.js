(() => {
  "use strict";

  const manual = window.FIELD_MANUAL;
  if (!manual) return;

  const storageKey = "brand-docks-field-manual-completed-v3";
  const filename = location.pathname.split("/").pop() || "";
  const number = Number(filename.match(/episode-(\d+)\.html/i)?.[1]);
  const episode = manual.episodes.find((item) => item.num === number);
  if (!episode) return;
  const module = manual.modules.find((item) => item.num === episode.module);
  const paddedModule = String(module.num).padStart(2, "0");

  function readCompleted() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(stored) ? stored.map(Number).filter(Boolean) : []);
    } catch {
      return new Set();
    }
  }

  let completed = readCompleted();

  function saveCompleted() {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completed].sort((a, b) => a - b)));
    } catch {
      // Progress storage is an enhancement, not a requirement to read.
    }
  }

  function updateDoneButtons() {
    const done = completed.has(number);
    document.querySelectorAll("[data-episode-complete]").forEach((button) => {
      button.classList.toggle("is-done", done);
      button.setAttribute("aria-pressed", String(done));
      button.textContent = done ? "DONE / પૂર્ણ ✓" : "MARK DONE / પૂર્ણ";
    });
  }

  function episodeHref(target) {
    return target >= 1 && target <= 98 ? `episode-${String(target).padStart(2, "0")}.html` : null;
  }

  document.body.id ||= "top";
  if (new URLSearchParams(location.search).get("embed") === "1") {
    document.body.classList.add("is-embedded");
  }

  const tokenStage = document.querySelector(".hero-tokens");
  if (tokenStage) tokenStage.dataset.episodeLabel = `EP ${episode.padded} / M${paddedModule} / ${module.signal}`;

  const heroSub = document.querySelector(".hero-sub");
  if (heroSub && !document.querySelector(".episode-bilingual-note")) {
    const note = document.createElement("aside");
    note.className = "episode-bilingual-note";
    note.setAttribute("aria-label", "Gujarati field note");
    note.innerHTML = `<strong>FIELD NOTE<br>ઝડપી દિશા</strong><p lang="gu">${module.summaryGu}</p>`;
    heroSub.insertAdjacentElement("afterend", note);
  }

  /* Older lesson exports occasionally split ASCII architecture diagrams into
     uncontained paragraphs. Group each contiguous diagram fragment so its
     spatial meaning survives the shared editorial layout. */
  document.querySelectorAll("article.prose").forEach((article) => {
    let diagram = null;
    [...article.children].forEach((child) => {
      const isAsciiLine = child.matches("p") && /^[\s]*[┌└│├┬┼┐┘─▼▲]/u.test(child.textContent || "");
      if (!isAsciiLine) {
        diagram = null;
        return;
      }
      if (!diagram) {
        diagram = document.createElement("div");
        diagram.className = "ascii-diagram-box";
        diagram.setAttribute("role", "img");
        diagram.setAttribute("aria-label", "Architecture diagram");
        child.before(diagram);
      }
      diagram.append(child);
    });
  });

  const topNav = document.querySelector("nav.top");
  if (topNav) {
    topNav.setAttribute("aria-label", "Field Manual navigation");
    const logoLink = topNav.querySelector(".logo") || topNav.querySelector("a");
    if (logoLink) {
      logoLink.href = "https://www.branddocks.com";
      logoLink.setAttribute("aria-label", "Brand Docks home");
      const image = logoLink.querySelector("img");
      if (image) {
        image.src = "brand-docks-logo.png";
        image.alt = "Brand Docks - Dock. Dominate. Disrupt.";
      }
    }
    const right = topNav.querySelector(".nav-right");
    if (right) {
      const previous = episodeHref(number - 1);
      const next = episodeHref(number + 1);
      right.innerHTML = `
        <a href="field-manual-index.html#module-${module.num}">અનુક્રમ / INDEX</a>
        ${previous ? `<a href="${previous}">← EP ${String(number - 1).padStart(2, "0")}</a>` : ""}
        ${next ? `<a href="${next}">EP ${String(number + 1).padStart(2, "0")} →</a>` : ""}`;
    }
  }

  const dock = document.createElement("nav");
  dock.className = "episode-dock";
  dock.setAttribute("aria-label", "Episode progress and navigation");
  const previous = episodeHref(number - 1);
  const next = episodeHref(number + 1);
  dock.innerHTML = `
    ${previous ? `<a href="${previous}" aria-label="Previous episode">← ${String(number - 1).padStart(2, "0")}</a>` : `<a href="field-manual-index.html" aria-label="Back to Field Manual">98</a>`}
    <button type="button" data-episode-complete aria-pressed="false">MARK DONE / પૂર્ણ</button>
    ${next ? `<a href="${next}" aria-label="Next episode">${String(number + 1).padStart(2, "0")} →</a>` : `<a href="field-manual-index.html" aria-label="Return to Field Manual">INDEX →</a>`}`;
  document.body.append(dock);

  document.addEventListener("click", (event) => {
    if (!event.target.closest("[data-episode-complete]")) return;
    completed.has(number) ? completed.delete(number) : completed.add(number);
    saveCompleted();
    updateDoneButtons();
  });

  document.querySelectorAll("a[target='_blank'], a[target=\"_blank\"]").forEach((link) => link.removeAttribute("target"));
  document.querySelectorAll("button").forEach((button) => {
    if (!button.getAttribute("aria-label") && !button.textContent.trim()) {
      button.setAttribute("aria-label", button.dataset.label || "Lesson navigation");
    }
  });
  updateDoneButtons();
})();
