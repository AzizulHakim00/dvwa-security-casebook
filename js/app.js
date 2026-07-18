(() => {
  const findingList = document.getElementById("findingList");
  const resultCount = document.getElementById("resultCount");
  const filterButtons = document.getElementById("filterButtons");
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const lightboxIndex = document.getElementById("lightboxIndex");
  let activeEvidence = [];
  let activeImageIndex = 0;

  const escapeHTML = (value) => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const findingTemplate = (finding) => `
    <article class="finding-card reveal" data-severity="${finding.severity.toLowerCase()}" id="case-${finding.id}">
      <div class="finding-summary">
        <div class="finding-number">${finding.number}</div>
        <div class="finding-title">
          <div class="finding-tags">
            <span class="severity ${finding.severity.toLowerCase()}">${finding.severity}</span>
            <span>${finding.category}</span>
          </div>
          <h3>${finding.title}</h3>
        </div>
        <p>${finding.summary}</p>
        <button class="case-toggle" type="button" aria-expanded="false" aria-controls="detail-${finding.id}">
          <span>Open case file</span><i>+</i>
        </button>
      </div>
      <div class="finding-detail" id="detail-${finding.id}" hidden>
        <div class="detail-lead">
          <div><span>IMPACT</span><p>${finding.impact}</p></div>
          <div><span>ROOT CAUSE</span><p>${finding.rootCause}</p></div>
        </div>
        <div class="detail-columns">
          <section>
            <p class="detail-label">TEST PATH</p>
            <ol class="test-path">${finding.steps.map((step, index) => `<li><span>${String(index + 1).padStart(2, "0")}</span><p>${step}</p></li>`).join("")}</ol>
          </section>
          <section>
            <p class="detail-label">DEFENSIVE CONTROLS</p>
            <ul class="mitigation-list">${finding.mitigations.map(item => `<li><i>✓</i><span>${item}</span></li>`).join("")}</ul>
          </section>
        </div>
        <section class="payload-section">
          <p class="detail-label">CONTROLLED LAB INPUTS</p>
          <div class="payload-grid">
            ${finding.payloads.map(payload => `
              <div class="payload-card">
                <div><span>${payload.label}</span><button type="button" class="copy-button" data-copy="${escapeHTML(payload.code)}">Copy</button></div>
                <pre><code>${escapeHTML(payload.code)}</code></pre>
              </div>`).join("")}
          </div>
        </section>
        <section class="evidence-section">
          <div class="evidence-heading"><div><p class="detail-label">EVIDENCE REGISTER</p><h4>${finding.evidence.length} captured artifact${finding.evidence.length === 1 ? "" : "s"}</h4></div><p>Select any frame to inspect it at full size.</p></div>
          <div class="evidence-grid">
            ${finding.evidence.map((item, index) => `
              <button class="evidence-card" type="button" data-finding="${finding.id}" data-image="${index}" aria-label="Open ${escapeHTML(item[1])}">
                <span class="evidence-image"><img src="${item[0]}" alt="${escapeHTML(item[1])}" loading="lazy" decoding="async" /><i>↗</i></span>
                <span class="evidence-copy"><small>${String(index + 1).padStart(2, "0")} / ${String(finding.evidence.length).padStart(2, "0")}</small><strong>${item[1]}</strong><em>${item[2]}</em></span>
              </button>`).join("")}
          </div>
        </section>
      </div>
    </article>`;

  const setupRevealObserver = () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px" });
    document.querySelectorAll(".reveal:not(.visible)").forEach(el => observer.observe(el));
  };

  const renderFindings = () => {
    findingList.innerHTML = FINDINGS.map(findingTemplate).join("");
    setupRevealObserver();
  };

  const filterFindings = (filter) => {
    let visible = 0;
    document.querySelectorAll(".finding-card").forEach(card => {
      const show = filter === "all" || card.dataset.severity === filter;
      card.hidden = !show;
      if (show) visible += 1;
    });
    resultCount.textContent = `${visible} case${visible === 1 ? "" : "s"} shown`;
  };

  filterButtons.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-filter]");
    if (!button) return;
    filterButtons.querySelectorAll("button").forEach(item => {
      item.classList.toggle("active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    filterFindings(button.dataset.filter);
  });

  findingList.addEventListener("click", async (event) => {
    const toggle = event.target.closest(".case-toggle");
    if (toggle) {
      const detail = document.getElementById(toggle.getAttribute("aria-controls"));
      const opening = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(opening));
      toggle.querySelector("span").textContent = opening ? "Close case file" : "Open case file";
      detail.hidden = !opening;
      requestAnimationFrame(() => detail.classList.toggle("open", opening));
      return;
    }

    const copyButton = event.target.closest(".copy-button");
    if (copyButton) {
      const original = copyButton.textContent;
      try {
        await navigator.clipboard.writeText(copyButton.dataset.copy);
        copyButton.textContent = "Copied";
      } catch {
        copyButton.textContent = "Select text";
      }
      window.setTimeout(() => { copyButton.textContent = original; }, 1400);
      return;
    }

    const evidenceButton = event.target.closest(".evidence-card");
    if (evidenceButton) {
      const finding = FINDINGS.find(item => item.id === evidenceButton.dataset.finding);
      activeEvidence = finding.evidence;
      activeImageIndex = Number(evidenceButton.dataset.image);
      openLightbox();
    }
  });

  const updateLightbox = () => {
    const item = activeEvidence[activeImageIndex];
    lightboxImage.src = item[0];
    lightboxImage.alt = item[1];
    lightboxCaption.textContent = item[1];
    lightboxIndex.textContent = `${activeImageIndex + 1} / ${activeEvidence.length}`;
  };

  const openLightbox = () => {
    updateLightbox();
    lightbox.showModal();
    document.body.classList.add("no-scroll");
  };

  const closeLightbox = () => {
    lightbox.close();
    document.body.classList.remove("no-scroll");
  };

  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  document.getElementById("lightboxPrev").addEventListener("click", () => {
    activeImageIndex = (activeImageIndex - 1 + activeEvidence.length) % activeEvidence.length;
    updateLightbox();
  });
  document.getElementById("lightboxNext").addEventListener("click", () => {
    activeImageIndex = (activeImageIndex + 1) % activeEvidence.length;
    updateLightbox();
  });
  lightbox.addEventListener("click", event => { if (event.target === lightbox) closeLightbox(); });
  lightbox.addEventListener("close", () => document.body.classList.remove("no-scroll"));
  document.addEventListener("keydown", event => {
    if (!lightbox.open) return;
    if (event.key === "ArrowLeft") document.getElementById("lightboxPrev").click();
    if (event.key === "ArrowRight") document.getElementById("lightboxNext").click();
  });

  const menuToggle = document.getElementById("menuToggle");
  const siteNav = document.getElementById("siteNav");
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") !== "true";
    menuToggle.setAttribute("aria-expanded", String(open));
    siteNav.classList.toggle("open", open);
  });
  siteNav.addEventListener("click", event => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("open");
    }
  });

  const meter = document.getElementById("scrollMeter");
  const header = document.getElementById("siteHeader");
  const updateScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    meter.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    header.classList.toggle("scrolled", window.scrollY > 24);
  };
  document.addEventListener("scroll", updateScroll, { passive: true });

  const countObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const element = entry.target;
      const target = Number(element.dataset.count);
      const started = performance.now();
      const animate = (now) => {
        const progress = Math.min((now - started) / 850, 1);
        element.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 3)));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      observer.unobserve(element);
    });
  }, { threshold: 0.7 });
  document.querySelectorAll("[data-count]").forEach(item => countObserver.observe(item));

  document.getElementById("year").textContent = new Date().getFullYear();
  renderFindings();
  updateScroll();

  const hash = window.location.hash.replace("#case-", "");
  if (hash && FINDINGS.some(item => item.id === hash)) {
    window.setTimeout(() => {
      const card = document.getElementById(`case-${hash}`);
      card.querySelector(".case-toggle").click();
      card.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);
  }
})();
