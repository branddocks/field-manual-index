(() => {
  "use strict";

  const manual = window.FIELD_MANUAL;
  if (!manual) return;

  const { modules, episodes } = manual;
  const storageKey = "brand-docks-field-manual-completed-v3";
  const state = {
    activeModule: Math.min(14, Math.max(1, Number(location.hash.match(/module-(\d+)/)?.[1]) || 1)),
    query: "",
    readerEpisode: null,
  };

  const $ = (selector) => document.querySelector(selector);
  const switchboard = $("#module-switchboard");
  const moduleRail = $("#module-rail");
  const missionIntro = $("#mission-intro");
  const lessonGrid = $("#lesson-grid");
  const noResults = $("#no-results");
  const search = $("#lesson-search");
  const reader = $("#lesson-reader");
  const readerFrame = $("#reader-frame");

  function readCompleted() {
    try {
      const values = JSON.parse(localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(values) ? values.map(Number).filter(Boolean) : []);
    } catch {
      return new Set();
    }
  }

  let completed = readCompleted();

  function saveCompleted() {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...completed].sort((a, b) => a - b)));
    } catch {
      // The course remains fully usable when storage is unavailable.
    }
  }

  function moduleFor(number) {
    return modules.find((module) => module.num === number);
  }

  function episodesFor(number) {
    return episodes.filter((episode) => episode.module === number);
  }

  function setActiveModule(number, shouldScroll = false) {
    state.activeModule = Math.min(14, Math.max(1, Number(number) || 1));
    state.query = "";
    if (search) search.value = "";
    history.replaceState(null, "", `#module-${state.activeModule}`);
    render();
    if (shouldScroll) {
      $("#field-console")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderHeroRoute() {
    const route = $("#hero-route");
    if (!route) return;
    route.replaceChildren(...modules.map((module) => {
      const cell = document.createElement("span");
      cell.textContent = String(module.num).padStart(2, "0");
      return cell;
    }));
  }

  function makeModuleButton(module, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    if (className === "route-module") button.id = `module-${module.num}`;
    button.dataset.module = module.num;
    button.classList.toggle("is-active", state.activeModule === module.num && !state.query);
    button.setAttribute("aria-pressed", String(state.activeModule === module.num && !state.query));

    if (className === "route-module") {
      button.innerHTML = `
        <span class="route-module-num"><b>M${String(module.num).padStart(2, "0")}</b><b>${module.range}</b></span>
        <strong><span lang="gu">${module.gu}</span>${module.en}</strong>
        <small>${module.signal} / 07 LESSONS</small>`;
    } else {
      button.innerHTML = `
        <span>M${String(module.num).padStart(2, "0")}</span>
        <strong>${module.en}<small lang="gu">${module.gu}</small></strong>`;
    }
    button.addEventListener("click", () => setActiveModule(module.num, className === "route-module"));
    return button;
  }

  function renderModuleControls() {
    switchboard?.replaceChildren(...modules.map((module) => makeModuleButton(module, "route-module")));
    moduleRail?.replaceChildren(...modules.map((module) => makeModuleButton(module, "module-rail-button")));
  }

  function renderMission(module, isSearch = false) {
    if (!missionIntro) return;
    if (isSearch) {
      missionIntro.innerHTML = `
        <p class="mission-code">FIELD SEARCH / 98</p>
        <h3><span lang="gu">શોધ પરિણામ</span>Search results</h3>
        <p class="mission-copy"><span lang="gu">તમારા વિષય સાથે મેળ ખાતા બધા મોડ્યુલ અહીં દેખાય છે.</span>Results search titles, lesson summaries and both Gujarati and English module language.</p>`;
      return;
    }
    missionIntro.innerHTML = `
      <p class="mission-code">M${String(module.num).padStart(2, "0")} / ${module.signal}<br>EP ${module.range}</p>
      <h3><span lang="gu">${module.gu}</span>${module.en}</h3>
      <p class="mission-copy"><span lang="gu">${module.summaryGu}</span>${module.summaryEn}</p>`;
  }

  function lessonMatches(episode, query) {
    const module = moduleFor(episode.module);
    return [episode.title, episode.description, module.en, module.gu, module.summaryGu, module.summaryEn, module.signal]
      .join(" ")
      .toLocaleLowerCase()
      .includes(query);
  }

  function lessonCard(episode) {
    const module = moduleFor(episode.module);
    const article = document.createElement("article");
    article.className = "lesson-card";
    article.classList.toggle("is-done", completed.has(episode.num));
    article.dataset.episode = episode.num;
    article.innerHTML = `
      <div class="lesson-card-head"><span>EP ${episode.padded}</span><span>M${String(episode.module).padStart(2, "0")} / ${module.signal}</span></div>
      <h3>${episode.title}</h3>
      <p>${episode.description}</p>
      <div class="lesson-card-actions">
        <a class="lesson-open" href="${episode.href}" data-open-episode="${episode.num}"><span>READ / વાંચો</span><span>↗</span></a>
        <button class="lesson-done" type="button" data-complete-episode="${episode.num}" aria-label="Mark episode ${episode.num} complete" aria-pressed="${completed.has(episode.num)}">${completed.has(episode.num) ? "✓" : "○"}</button>
      </div>`;
    return article;
  }

  function visibleEpisodes() {
    if (!state.query) return episodesFor(state.activeModule);
    const normalized = state.query.trim().toLocaleLowerCase();
    return episodes.filter((episode) => lessonMatches(episode, normalized));
  }

  function renderLessons() {
    const visible = visibleEpisodes();
    renderMission(moduleFor(state.activeModule), Boolean(state.query));
    lessonGrid?.replaceChildren(...visible.map(lessonCard));
    if (noResults) noResults.hidden = visible.length !== 0;
  }

  function updateProgress() {
    const total = completed.size;
    const counter = $("#nav-completed");
    if (counter) counter.textContent = String(total).padStart(2, "0");
    const continueButton = $("#continue-learning");
    const next = episodes.find((episode) => !completed.has(episode.num));
    if (continueButton) {
      continueButton.textContent = next
        ? `CONTINUE EP ${next.padded} / આગળ વધો ↗`
        : "ALL 98 COMPLETE / પૂર્ણ ✓";
    }
    const readerComplete = $("#reader-complete");
    if (readerComplete && state.readerEpisode) {
      const done = completed.has(state.readerEpisode.num);
      readerComplete.textContent = done ? "COMPLETED / પૂર્ણ ✓" : "MARK DONE / પૂર્ણ";
      readerComplete.setAttribute("aria-pressed", String(done));
    }
  }

  function render() {
    renderModuleControls();
    renderLessons();
    updateProgress();
  }

  function toggleComplete(number) {
    const episodeNumber = Number(number);
    completed.has(episodeNumber) ? completed.delete(episodeNumber) : completed.add(episodeNumber);
    saveCompleted();
    renderLessons();
    updateProgress();
  }

  function openReader(number) {
    const episode = episodes.find((item) => item.num === Number(number));
    if (!episode) return;
    state.readerEpisode = episode;
    const module = moduleFor(episode.module);
    $("#reader-coordinate").textContent = `EP ${episode.padded} / M${String(module.num).padStart(2, "0")} / ${module.signal}`;
    $("#reader-title").textContent = episode.title;
    $("#reader-open").href = episode.href;
    readerFrame.src = `${episode.href}?embed=1`;
    $("#reader-prev").disabled = episode.num === 1;
    $("#reader-next").disabled = episode.num === episodes.length;
    updateProgress();
    if (typeof reader.showModal === "function") {
      if (!reader.open) reader.showModal();
    }
    else location.href = episode.href;
  }

  function closeReader() {
    if (reader?.open) reader.close();
    if (readerFrame) readerFrame.src = "about:blank";
    state.readerEpisode = null;
  }

  document.addEventListener("click", (event) => {
    const openLink = event.target.closest("[data-open-episode]");
    if (openLink && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      openReader(openLink.dataset.openEpisode);
      return;
    }
    const completeButton = event.target.closest("[data-complete-episode]");
    if (completeButton) toggleComplete(completeButton.dataset.completeEpisode);
  });

  search?.addEventListener("input", () => {
    state.query = search.value.trim();
    render();
  });

  $("#continue-learning")?.addEventListener("click", () => {
    const next = episodes.find((episode) => !completed.has(episode.num));
    if (next) openReader(next.num);
  });

  $("#reader-close")?.addEventListener("click", closeReader);
  $("#reader-prev")?.addEventListener("click", () => state.readerEpisode && openReader(state.readerEpisode.num - 1));
  $("#reader-next")?.addEventListener("click", () => state.readerEpisode && openReader(state.readerEpisode.num + 1));
  $("#reader-complete")?.addEventListener("click", () => state.readerEpisode && toggleComplete(state.readerEpisode.num));
  reader?.addEventListener("click", (event) => {
    if (event.target === reader) closeReader();
  });
  reader?.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReader();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
      event.preventDefault();
      search?.focus();
      search?.select();
    }
  });

  window.addEventListener("scroll", () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    const progress = max > 0 ? Math.min(100, (scrollY / max) * 100) : 0;
    const bar = $("#page-progress");
    if (bar) bar.style.width = `${progress}%`;
  }, { passive: true });

  const itemList = document.createElement("script");
  itemList.type = "application/ld+json";
  itemList.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "98 Field Manual lessons",
    numberOfItems: episodes.length,
    itemListElement: episodes.map((episode) => ({
      "@type": "ListItem",
      position: episode.num,
      name: episode.title,
      url: new URL(episode.href, location.href).href,
    })),
  });
  document.head.append(itemList);

  renderHeroRoute();
  render();
})();
