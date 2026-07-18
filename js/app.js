"use strict";

const remediationMap = {
  "brute-force": [
    "Apply account- and IP-aware rate limiting with progressive delay.",
    "Use multi-factor authentication and breached-password screening.",
    "Monitor response patterns and credential-stuffing indicators without exposing account existence."
  ],
  "command-injection": [
    "Avoid shell execution; use fixed application or operating-system APIs.",
    "Validate input with a strict allow-list and reject command metacharacters.",
    "Run the web service with least privilege and alert on unexpected child processes."
  ],
  "csrf": [
    "Require an unpredictable anti-CSRF token for every state-changing request.",
    "Use appropriate SameSite cookies and validate Origin or Referer on sensitive actions.",
    "Require the current password or re-authentication before credential changes."
  ],
  "file-inclusion": [
    "Map fixed page identifiers to approved templates instead of accepting raw paths.",
    "Canonicalize paths and enforce an approved base directory.",
    "Disable remote inclusion features and avoid exposing detailed filesystem errors."
  ],
  "file-upload": [
    "Allow-list file types and verify extension, MIME type, and file signature.",
    "Generate server-side file names and store uploads outside the executable web root.",
    "Apply file-size limits, malware scanning, and non-executable storage permissions."
  ],
  "sql-injection": [
    "Use parameterized queries or prepared statements for all variable data.",
    "Validate expected types and lengths before database access.",
    "Use a least-privilege database account and add regression tests for injection paths."
  ],
  "dom-xss": [
    "Avoid inserting URL data with innerHTML, document.write, or similar unsafe sinks.",
    "Use textContent and safe DOM construction for untrusted values.",
    "Validate allowed parameter values and deploy a restrictive Content Security Policy."
  ],
  "reflected-xss": [
    "Encode output according to its HTML, attribute, URL, or JavaScript context.",
    "Use safe templating and DOM APIs rather than building HTML strings from input.",
    "Add a restrictive Content Security Policy as defense in depth."
  ],
  "stored-xss": [
    "Contextually encode all stored user content when it is rendered.",
    "Sanitize intentionally allowed rich text with a maintained library.",
    "Use HttpOnly session cookies and a restrictive Content Security Policy."
  ],
  "cookie-stealing": [
    "Eliminate the underlying XSS path with contextual encoding and safe DOM APIs.",
    "Set session cookies with HttpOnly, Secure, and suitable SameSite attributes.",
    "Restrict outbound browser connections with CSP and monitor suspicious requests."
  ]
};

const severityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };
const imageState = new Map(modules.map((module) => [module.id, 0]));
let activeFilter = "all";
let lightboxModuleId = null;
let lightboxIndex = 0;

const $ = (selector, context = document) => context.querySelector(selector);
const $$ = (selector, context = document) => [...context.querySelectorAll(selector)];
const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

function moduleNumber(index) {
  return String(index + 1).padStart(2, "0");
}

function payloadMarkup(payloads) {
  return payloads.map((payload) => `
    <div class="payload-box">
      <div class="payload-head">
        <span>${escapeHtml(payload.label)}</span>
        <button class="copy-button" type="button" data-copy="${escapeHtml(payload.code)}">Copy</button>
      </div>
      <pre><code>${escapeHtml(payload.code)}</code></pre>
    </div>
  `).join("");
}

function printGalleryMarkup(module) {
  return `
    <div class="print-gallery" aria-hidden="true">
      ${module.images.map(([src, title, caption], imageIndex) => `
        <figure>
          <img src="${escapeHtml(src)}" alt="${escapeHtml(title)}">
          <figcaption><b>${imageIndex + 1}. ${escapeHtml(title)}</b><span>${escapeHtml(caption || title)}</span></figcaption>
        </figure>
      `).join("")}
    </div>
  `;
}

function moduleMarkup(module, index) {
  const first = module.images[0];
  const remediation = remediationMap[module.id] || [];
  return `
    <article class="module-card reveal" id="${escapeHtml(module.id)}" data-severity="${escapeHtml(module.severity)}" data-search="${escapeHtml(`${module.title} ${module.type} ${module.overview} ${module.vulnerable} ${module.steps.join(" ")} ${module.payloads.map((item) => `${item.label} ${item.code}`).join(" ")}`.toLowerCase())}">
      <header class="module-top">
        <div>
          <span class="module-id">CASE ${moduleNumber(index)} · ${escapeHtml(module.type)} · ${escapeHtml(module.images.length)} SCREENSHOTS</span>
          <h3>${escapeHtml(module.title)}</h3>
          <p>${escapeHtml(module.overview)}</p>
        </div>
        <span class="severity ${escapeHtml(module.severity)}">${escapeHtml(module.severity)}</span>
      </header>

      <div class="module-main">
        <section class="evidence-panel" aria-label="${escapeHtml(module.title)} visual evidence">
          <div class="evidence-head">
            <span>VISUAL EVIDENCE · <b data-counter="${escapeHtml(module.id)}">1 / ${module.images.length}</b></span>
            <div class="carousel-controls">
              <button type="button" data-carousel="prev" data-module="${escapeHtml(module.id)}" aria-label="Previous ${escapeHtml(module.title)} screenshot">←</button>
              <button type="button" data-carousel="next" data-module="${escapeHtml(module.id)}" aria-label="Next ${escapeHtml(module.title)} screenshot">→</button>
            </div>
          </div>
          <div class="carousel-info">
            <strong data-title="${escapeHtml(module.id)}">${escapeHtml(first[1])}</strong>
            <p data-caption="${escapeHtml(module.id)}">${escapeHtml(first[2] || first[1])}</p>
          </div>
          <button class="carousel-image" type="button" data-open-lightbox="${escapeHtml(module.id)}" aria-label="Enlarge ${escapeHtml(module.title)} screenshot">
            <img src="${escapeHtml(first[0])}" alt="${escapeHtml(first[1])}" data-image="${escapeHtml(module.id)}">
          </button>
          ${printGalleryMarkup(module)}
        </section>

        <section class="module-details">
          <div class="info-block">
            <h4>Vulnerable Point</h4>
            <div class="vulnerable-box">${escapeHtml(module.vulnerable)}</div>
          </div>
          <div class="info-block">
            <h4>Performed Steps</h4>
            <ol class="steps">${module.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}</ol>
          </div>
          <div class="payload-section">
            <h4>Payloads / Commands</h4>
            ${payloadMarkup(module.payloads)}
          </div>
          <div class="remediation">
            <h4>Recommended Controls</h4>
            <ul>${remediation.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
          </div>
        </section>
      </div>
      <footer class="module-footer"><span>${escapeHtml(module.id)} · Controlled DVWA laboratory evidence</span><a href="#modules">Return to module index ↑</a></footer>
    </article>
  `;
}

function buildModules() {
  const sorted = [...modules].sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  $("#moduleList").innerHTML = sorted.map(moduleMarkup).join("");
  $("#quickNav").innerHTML = sorted.map((module, index) => `<a href="#${escapeHtml(module.id)}">${moduleNumber(index)} ${escapeHtml(module.title)}</a>`).join("");
  setupReveal();
  applyFilters();
}

function updateCarousel(moduleId, direction) {
  const module = modules.find((item) => item.id === moduleId);
  if (!module) return;
  const current = imageState.get(moduleId) || 0;
  const next = direction === "next" ? (current + 1) % module.images.length : (current - 1 + module.images.length) % module.images.length;
  imageState.set(moduleId, next);
  const [src, title, caption] = module.images[next];
  const image = $(`[data-image="${CSS.escape(moduleId)}"]`);
  image.style.opacity = "0";
  image.style.transform = "scale(.975)";
  window.setTimeout(() => {
    image.src = src;
    image.alt = title;
    image.style.opacity = "1";
    image.style.transform = "scale(1)";
    $(`[data-counter="${CSS.escape(moduleId)}"]`).textContent = `${next + 1} / ${module.images.length}`;
    $(`[data-title="${CSS.escape(moduleId)}"]`).textContent = title;
    $(`[data-caption="${CSS.escape(moduleId)}"]`).textContent = caption || title;
  }, 140);
}

function applyFilters() {
  const query = $("#moduleSearch").value.trim().toLowerCase();
  let visible = 0;
  $$(".module-card").forEach((card) => {
    const filterMatch = activeFilter === "all" || card.dataset.severity === activeFilter;
    const searchMatch = !query || card.dataset.search.includes(query);
    const show = filterMatch && searchMatch;
    card.classList.toggle("hidden", !show);
    if (show) visible += 1;
  });
  $("#resultCount").textContent = `${visible} module${visible === 1 ? "" : "s"}`;
  $("#quickNav").hidden = visible !== modules.length || Boolean(query) || activeFilter !== "all";
  let empty = $(".empty-state");
  if (!visible && !empty) {
    empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = "No module matches this search and severity filter.";
    $("#moduleList").append(empty);
  } else if (visible && empty) {
    empty.remove();
  }
}

function openLightbox(moduleId, index = imageState.get(moduleId) || 0) {
  const module = modules.find((item) => item.id === moduleId);
  if (!module) return;
  lightboxModuleId = moduleId;
  lightboxIndex = index;
  const [src, title, caption] = module.images[index];
  $("#lightboxImage").src = src;
  $("#lightboxImage").alt = title;
  $("#lightboxCounter").textContent = `${index + 1} / ${module.images.length}`;
  $("#lightboxTitle").textContent = title;
  $("#lightboxCaption").textContent = caption || title;
  $("#lightbox").showModal();
  document.body.classList.add("locked");
}

function moveLightbox(direction) {
  const module = modules.find((item) => item.id === lightboxModuleId);
  if (!module) return;
  lightboxIndex = direction === "next" ? (lightboxIndex + 1) % module.images.length : (lightboxIndex - 1 + module.images.length) % module.images.length;
  const [src, title, caption] = module.images[lightboxIndex];
  $("#lightboxImage").src = src;
  $("#lightboxImage").alt = title;
  $("#lightboxCounter").textContent = `${lightboxIndex + 1} / ${module.images.length}`;
  $("#lightboxTitle").textContent = title;
  $("#lightboxCaption").textContent = caption || title;
}

function closeLightbox() {
  $("#lightbox").close();
  document.body.classList.remove("locked");
}

async function copyPayload(button) {
  const value = button.dataset.copy || "";
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement("textarea");
    area.value = value;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  const old = button.textContent;
  button.textContent = "Copied";
  button.classList.add("copied");
  window.setTimeout(() => {
    button.textContent = old;
    button.classList.remove("copied");
  }, 1200);
}

function setupReveal() {
  const items = $$(".reveal:not(.visible)");
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: "0px 0px -45px" });
  items.forEach((item) => observer.observe(item));
}

function setupEvents() {
  document.addEventListener("click", (event) => {
    const carousel = event.target.closest("[data-carousel]");
    if (carousel) updateCarousel(carousel.dataset.module, carousel.dataset.carousel);
    const open = event.target.closest("[data-open-lightbox]");
    if (open) openLightbox(open.dataset.openLightbox);
    const copy = event.target.closest("[data-copy]");
    if (copy) copyPayload(copy);
  });

  $("#moduleSearch").addEventListener("input", applyFilters);
  $$("#filterButtons button").forEach((button) => button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    $$("#filterButtons button").forEach((item) => {
      const selected = item === button;
      item.classList.toggle("active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });
    applyFilters();
  }));

  $("#menuToggle").addEventListener("click", () => {
    const open = $("#siteNav").classList.toggle("open");
    $("#menuToggle").setAttribute("aria-expanded", String(open));
  });
  $$("#siteNav a").forEach((link) => link.addEventListener("click", () => {
    $("#siteNav").classList.remove("open");
    $("#menuToggle").setAttribute("aria-expanded", "false");
  }));

  $("#lightboxClose").addEventListener("click", closeLightbox);
  $("#lightboxPrev").addEventListener("click", () => moveLightbox("prev"));
  $("#lightboxNext").addEventListener("click", () => moveLightbox("next"));
  $("#lightbox").addEventListener("click", (event) => { if (event.target === $("#lightbox")) closeLightbox(); });
  document.addEventListener("keydown", (event) => {
    if (!$("#lightbox").open) return;
    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") moveLightbox("prev");
    if (event.key === "ArrowRight") moveLightbox("next");
  });

  $("#printTop").addEventListener("click", () => window.print());
  $("#printReport").addEventListener("click", () => window.print());
  window.addEventListener("scroll", () => {
    const root = document.documentElement;
    const max = root.scrollHeight - root.clientHeight;
    $("#pageProgress").style.width = `${max > 0 ? (root.scrollTop / max) * 100 : 0}%`;
    $("#siteHeader").classList.toggle("scrolled", root.scrollTop > 30);
  }, { passive: true });
}

buildModules();
setupEvents();
setupReveal();
