/* =========================================================
   Ahmad Tahir - Portfolio
   ========================================================= */
(function () {
  "use strict";
  const root = document.documentElement;

  /* ---------- Theme ---------- */
  const THEME_KEY = "at-theme";
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (_) {}
  const toggle = document.getElementById("theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
    });
  }

  /* ---------- Scroll-spy nav ---------- */
  const sections = document.querySelectorAll("main section[id], footer[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          navLinks.forEach((l) =>
            l.classList.toggle("active", l.getAttribute("data-section") === e.target.id)
          );
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- GitHub contribution graph ---------- */
  (function githubGraph() {
    const grid = document.getElementById("gh-grid");
    const months = document.getElementById("gh-months");
    const totalEl = document.getElementById("gh-total");
    if (!grid) return;

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

    function render(days, total) {
      const active = days.filter((d) => d.level > 0).length;
      if (!days.length || active === 0) {
        grid.innerHTML = '<div class="gh-state">Contributions will appear here as commits land. <a href="https://github.com/AhmadTahir04" target="_blank" rel="noreferrer">View on GitHub</a></div>';
        months.innerHTML = "";
        if (totalEl) totalEl.textContent = "Contributions";
        return;
      }
      const first = new Date(days[0].date + "T00:00:00");
      const offset = first.getDay();
      const numWeeks = Math.ceil((offset + days.length) / 7);

      grid.innerHTML = "";
      grid.style.gridTemplateColumns = "repeat(" + numWeeks + ", 1fr)";
      const frag = document.createDocumentFragment();
      for (let i = 0; i < offset; i++) {
        const e = document.createElement("span");
        e.className = "gh-day empty";
        frag.appendChild(e);
      }
      days.forEach((d) => {
        const cell = document.createElement("span");
        cell.className = "gh-day";
        cell.setAttribute("data-level", d.level);
        const c = d.count != null ? d.count : "";
        cell.title = (c !== "" ? c + " on " : "") + d.date;
        frag.appendChild(cell);
      });
      grid.appendChild(frag);

      months.innerHTML = "";
      months.style.gridTemplateColumns = "repeat(" + numWeeks + ", 1fr)";
      const firstSunday = addDays(first, -offset);
      let lastMonth = -1;
      for (let w = 0; w < numWeeks; w++) {
        const colDate = addDays(firstSunday, w * 7);
        const span = document.createElement("span");
        const m = colDate.getMonth();
        if (m !== lastMonth && colDate.getDate() <= 7) { span.textContent = MONTHS[m]; lastMonth = m; }
        months.appendChild(span);
      }
      if (totalEl) totalEl.textContent = total + " contributions in the last year";
    }

    fetch("assets/contributions.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((snap) => { if (snap && snap.days) render(snap.days, snap.total); })
      .catch(() => {});

    fetch("https://github-contributions-api.jogruber.de/v4/AhmadTahir04?y=last")
      .then((r) => (r.ok ? r.json() : null))
      .then((live) => {
        if (!live || !live.contributions) return;
        const total = (live.total && (live.total.lastYear || Object.values(live.total)[0])) || 0;
        const active = live.contributions.filter((d) => d.count > 0).length;
        if (active > 0) render(live.contributions, total);
      })
      .catch(() => {});
  })();
})();
