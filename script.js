/* =========================================================
   Ahmad Tahir - Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const THEME_KEY = "at-theme";
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem(THEME_KEY, t); } catch (_) {}
  }
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") root.setAttribute("data-theme", saved);
  } catch (_) {}

  function toggleTheme() {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
  }

  const toggleBtn = document.getElementById("theme-toggle");
  if (toggleBtn) toggleBtn.addEventListener("click", toggleTheme);

  // Floating theme toggle for mobile (sidebar is hidden there)
  const floatBtn = toggleBtn ? toggleBtn.cloneNode(true) : null;
  if (floatBtn) {
    floatBtn.id = "theme-toggle-float";
    floatBtn.className = "theme-toggle";
    Object.assign(floatBtn.style, {
      position: "fixed",
      top: "18px",
      right: "18px",
      zIndex: "60",
    });
    const mq = window.matchMedia("(max-width: 1023px)");
    const syncFloat = () => { floatBtn.style.display = mq.matches ? "grid" : "none"; };
    syncFloat();
    mq.addEventListener("change", syncFloat);
    floatBtn.addEventListener("click", toggleTheme);
    document.body.appendChild(floatBtn);
  }

  /* ---------- Rotating subheader (carousel) ---------- */
  const rotators = document.querySelectorAll("[data-rotator]");
  if (rotators.length) {
    const phrases = [
      "Full-Stack Developer",
      "New-Grad 2027",
      "Coursify Contributor",
      "Ex-Hydro One Intern",
      "Python TA",
      "Car Enthusiast",
    ];
    if (!prefersReduced) {
      let idx = 0;
      setInterval(() => {
        idx = (idx + 1) % phrases.length;
        rotators.forEach((el) => {
          el.classList.add("is-out");
          setTimeout(() => {
            el.textContent = phrases[idx];
            el.classList.remove("is-out");
          }, 320);
        });
      }, 2600);
    }
  }

  /* ---------- GitHub activity graph ---------- */
  (function githubGraph() {
    const grid = document.getElementById("gh-grid");
    const months = document.getElementById("gh-months");
    const totalEl = document.getElementById("gh-total");
    const stateEl = document.getElementById("gh-state");
    if (!grid) return;

    const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

    function render(days, total) {
      const active = days.filter((d) => d.level > 0).length;
      if (!days.length || active === 0) {
        grid.innerHTML = '<div class="gh-state">Contributions will appear here as commits land. <a href="https://github.com/AhmadTahir04" target="_blank" rel="noreferrer">View on GitHub</a></div>';
        months.innerHTML = "";
        if (totalEl) totalEl.textContent = "";
        return;
      }

      const first = new Date(days[0].date + "T00:00:00");
      const offset = first.getDay(); // 0 = Sunday
      const numWeeks = Math.ceil((offset + days.length) / 7);

      // grid cells (column-major: leading empties align first day to its weekday)
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
        cell.title = (c !== "" ? c + " contribution" + (c === 1 ? "" : "s") + " on " : "") + d.date;
        frag.appendChild(cell);
      });
      grid.appendChild(frag);

      // month labels
      months.innerHTML = "";
      months.style.gridTemplateColumns = "repeat(" + numWeeks + ", 1fr)";
      const firstSunday = addDays(first, -offset);
      let lastMonth = -1;
      for (let w = 0; w < numWeeks; w++) {
        const colDate = addDays(firstSunday, w * 7);
        const span = document.createElement("span");
        const m = colDate.getMonth();
        if (m !== lastMonth && colDate.getDate() <= 7) {
          span.textContent = MONTHS[m];
          lastMonth = m;
        }
        months.appendChild(span);
      }

      if (totalEl) totalEl.textContent = total + " contributions in the last year";
    }

    // 1) instant render from embedded snapshot
    fetch("assets/contributions.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : null))
      .then((snap) => { if (snap && snap.days) render(snap.days, snap.total); })
      .catch(() => {});

    // 2) progressive live refresh (overrides snapshot when fresher)
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

  /* ---------- Interactive particle background ---------- */
  const canvas = document.getElementById("bg-canvas");
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext("2d");
    let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles = [];
    const mouse = { x: -9999, y: -9999, active: false };

    const isLight = () => root.getAttribute("data-theme") === "light";

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // particle count scales with viewport area (capped)
      const count = Math.min(96, Math.max(38, Math.round((W * H) / 20000)));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.6 + 0.7,
        });
      }
    }

    const LINK = 130;      // particle-to-particle link distance
    const MOUSE_LINK = 180; // cursor link distance
    const MOUSE_PULL = 190; // cursor influence radius

    function step() {
      ctx.clearRect(0, 0, W, H);
      const light = isLight();
      const lineRGB = light ? "220,38,38" : "255,59,59";
      const dotRGB = light ? "17,17,19" : "255,255,255";

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // gentle cursor attraction
        if (mouse.active) {
          const dx = mouse.x - p.x, dy = mouse.y - p.y;
          const d = Math.hypot(dx, dy);
          if (d < MOUSE_PULL && d > 0.01) {
            const f = (1 - d / MOUSE_PULL) * 0.6;
            p.vx += (dx / d) * f * 0.05;
            p.vy += (dy / d) * f * 0.05;
          }
        }

        p.x += p.vx;
        p.y += p.vy;

        // friction + soft speed cap
        p.vx *= 0.992; p.vy *= 0.992;
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > 1.1) { p.vx = (p.vx / sp) * 1.1; p.vy = (p.vy / sp) * 1.1; }

        // wrap around edges
        if (p.x < -20) p.x = W + 20; else if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; else if (p.y > H + 20) p.y = -20;

        // links to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            const a = (1 - d / LINK) * (light ? 0.16 : 0.22);
            ctx.strokeStyle = "rgba(" + lineRGB + "," + a.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }

        // brighter links to the cursor
        if (mouse.active) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < MOUSE_LINK) {
            const a = (1 - d / MOUSE_LINK) * 0.5;
            ctx.strokeStyle = "rgba(" + lineRGB + "," + a.toFixed(3) + ")";
            ctx.lineWidth = 1.1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }

        // the dot
        ctx.fillStyle = "rgba(" + dotRGB + "," + (light ? 0.35 : 0.5) + ")";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(step);
    }

    let raf = null;
    const start = () => { if (!raf) raf = requestAnimationFrame(step); };
    const stop = () => { if (raf) { cancelAnimationFrame(raf); raf = null; } };

    window.addEventListener("pointermove", (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    }, { passive: true });
    window.addEventListener("pointerleave", () => { mouse.active = false; });
    window.addEventListener("blur", () => { mouse.active = false; });

    let rTimer = null;
    window.addEventListener("resize", () => {
      clearTimeout(rTimer);
      rTimer = setTimeout(resize, 180);
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    resize();
    start();
  }

  /* ---------- Scroll progress ---------- */
  const progress = document.getElementById("progress");
  if (progress) {
    let pRaf = null;
    const updateProgress = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const p = max > 0 ? Math.min(h.scrollTop / max, 1) : 0;
      progress.style.setProperty("--p", p.toFixed(4));
      pRaf = null;
    };
    window.addEventListener("scroll", () => {
      if (pRaf) return;
      pRaf = requestAnimationFrame(updateProgress);
    }, { passive: true });
    updateProgress();
  }

  /* ---------- Cursor spotlight ---------- */
  const spotlight = document.getElementById("spotlight");
  if (spotlight && !prefersReduced && window.matchMedia("(hover: hover)").matches) {
    let raf = null, mx = 0, my = 0;
    window.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        spotlight.style.setProperty("--x", mx + "px");
        spotlight.style.setProperty("--y", my + "px");
        raf = null;
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (prefersReduced || !("IntersectionObserver" in window)) {
    reveals.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          entry.target.style.transitionDelay = Math.min(i * 40, 160) + "ms";
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Scroll-spy nav ---------- */
  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll(".nav-link");
  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((l) =>
        l.classList.toggle("active", l.getAttribute("data-section") === id)
      );
    };
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Dynamic year in colophon (optional) ---------- */
})();
