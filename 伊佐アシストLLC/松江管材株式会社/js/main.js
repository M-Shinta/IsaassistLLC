/**
 * 松江管材株式会社 — main.js
 */

/* ============================================================
   1. Header — scroll behavior
   ============================================================ */
function initHeader() {
  const header = document.getElementById("header");
  if (!header) return;

  const THRESHOLD = 80;
  const toggle = () => {
    header.classList.toggle("header--scrolled", window.scrollY > THRESHOLD);
  };

  window.addEventListener("scroll", toggle, { passive: true });
  toggle(); // run once on load
}

/* ============================================================
   2. Hamburger Menu
   ============================================================ */
function initHamburger() {
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("globalNav");
  if (!btn || !nav) return;

  const open = () => {
    btn.classList.add("is-open");
    nav.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    btn.setAttribute("aria-label", "メニューを閉じる");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    btn.classList.remove("is-open");
    nav.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-label", "メニューを開く");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", () => {
    btn.classList.contains("is-open") ? close() : open();
  });

  // Close when a nav link is clicked
  nav.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", close);
  });

  // Close on outside click
  document.addEventListener("click", (e) => {
    if (
      nav.classList.contains("is-open") &&
      !nav.contains(e.target) &&
      !btn.contains(e.target)
    ) {
      close();
    }
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) close();
  });
}

/* ============================================================
   3. Hero Animations
   ============================================================ */
function initHeroAnimations() {
  // Hero eyebrow, sub, actions — fade up with delay
  document.querySelectorAll(".js-hero-anim").forEach((el) => {
    const delay = parseInt(el.dataset.delay || "0", 10);
    setTimeout(() => el.classList.add("is-visible"), delay + 250);
  });

  // Title lines — clip-path wipe
  document.querySelectorAll(".js-title-line").forEach((el) => {
    const delay = parseInt(el.dataset.delay || "0", 10);
    setTimeout(() => el.classList.add("is-visible"), delay + 250);
  });
}

/* ============================================================
   4. Parallax on Hero Background
   ============================================================ */
function initParallax() {
  const bg = document.getElementById("heroBg");
  if (!bg) return;

  // Respect user preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Only run on desktop (parallax feels odd on mobile scroll)
  const mq = window.matchMedia("(min-width: 769px)");
  if (!mq.matches) return;

  let ticking = false;

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrolled = window.scrollY;
          bg.style.transform = `translateY(${scrolled * 0.35}px)`;
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
}

/* ============================================================
   5. Scroll Animations — Intersection Observer
   ============================================================ */
function initScrollAnimations() {
  // Pre-set CSS variable for stagger delays
  document.querySelectorAll("[data-delay]").forEach((el) => {
    el.style.setProperty("--anim-delay", el.dataset.delay + "ms");
  });

  const options = {
    root: null,
    rootMargin: "0px 0px -80px 0px",
    threshold: 0.08,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, options);

  document.querySelectorAll(".js-fade-up, .js-scale-reveal").forEach((el) => {
    observer.observe(el);
  });
}

/* ============================================================
   6. Counter Animations
   ============================================================ */
function initCounters() {
  const counters = document.querySelectorAll(".js-counter");
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  function startCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    if (isNaN(target)) return;

    const numEl = el.querySelector(".stat__number");
    if (!numEl) return;

    const DURATION = 2000;
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);
      const value = Math.floor(easeOut(progress) * target);
      numEl.textContent = value.toLocaleString("ja-JP");
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        numEl.textContent = target.toLocaleString("ja-JP");
      }
    }

    requestAnimationFrame(tick);
  }

  const counterObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          startCounter(entry.target);
          counterObs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((el) => counterObs.observe(el));
}

/* ============================================================
   7. Scroll Spy — Active Nav Links
   ============================================================ */
function initScrollSpy() {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('.nav__link[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.toggle(
              "is-active",
              link.getAttribute("href") === "#" + entry.target.id,
            );
          });
        }
      });
    },
    {
      rootMargin: "-45% 0px -45% 0px",
      threshold: 0,
    },
  );

  sections.forEach((s) => spy.observe(s));
}

/* ============================================================
   8. Smooth Scroll
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();

      const headerH = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue(
          "--header-h",
        ) || "72",
        10,
      );
      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - headerH;

      window.scrollTo({ top: targetTop, behavior: "smooth" });
    });
  });
}

/* ============================================================
   9. Page Top Button
   ============================================================ */
function initPageTop() {
  const btn = document.getElementById("pagetop");
  if (!btn) return;

  window.addEventListener(
    "scroll",
    () => {
      btn.classList.toggle("is-visible", window.scrollY > 400);
    },
    { passive: true },
  );

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* ============================================================
   10. Contact Form Validation
   ============================================================ */
function initContactForm() {
  const form = document.getElementById("contactForm");
  const success = document.getElementById("contactSuccess");
  if (!form) return;

  const rules = {
    name: { required: true, label: "お名前" },
    email: { required: true, label: "メールアドレス", type: "email" },
    subject: { required: true, label: "お問い合わせ種別" },
    message: { required: true, label: "お問い合わせ内容" },
    privacy: { required: true, label: "プライバシーポリシーへの同意" },
  };

  function getFieldValue(name) {
    const field = form.elements[name];
    if (!field) return "";
    if (field.type === "checkbox") return field.checked ? "checked" : "";
    return (field.value || "").trim();
  }

  function validateField(name) {
    const rule = rules[name];
    if (!rule) return "";
    const value = getFieldValue(name);

    if (rule.required && !value) {
      return `${rule.label}は必須です`;
    }
    if (rule.type === "email" && value) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(value)) {
        return "正しいメールアドレスを入力してください";
      }
    }
    return "";
  }

  function showError(name, message) {
    const errorEl = document.getElementById("error-" + name);
    const field = form.elements[name];
    if (errorEl) errorEl.textContent = message;
    if (field && field.type !== "checkbox") {
      field.classList.toggle("has-error", !!message);
    }
  }

  function clearError(name) {
    showError(name, "");
  }

  // Real-time validation on blur
  Object.keys(rules).forEach((name) => {
    const field = form.elements[name];
    if (!field) return;

    const eventType = field.type === "checkbox" ? "change" : "blur";
    field.addEventListener(eventType, () => {
      const error = validateField(name);
      showError(name, error);
    });

    if (field.type !== "checkbox") {
      field.addEventListener("input", () => {
        if (field.classList.contains("has-error")) {
          const error = validateField(name);
          showError(name, error);
        }
      });
    }
  });

  // Submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    Object.keys(rules).forEach((name) => {
      const error = validateField(name);
      showError(name, error);
      if (error) isValid = false;
    });

    if (!isValid) {
      // Scroll to first error
      const firstError = form.querySelector(
        ".has-error, .form-group--check .form-error:not(:empty)",
      );
      if (firstError) {
        const headerH = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue(
            "--header-h",
          ) || "72",
          10,
        );
        const top =
          firstError.getBoundingClientRect().top +
          window.scrollY -
          headerH -
          20;
        window.scrollTo({ top, behavior: "smooth" });
      }
      return;
    }

    // Show loading state
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
      submitBtn.textContent = "送信中...";
      submitBtn.disabled = true;
    }

    // Simulate async submission (replace with real backend/Formspree call)
    setTimeout(() => {
      form.hidden = true;
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 1000);
  });
}

/* ============================================================
   11. GSAP — ヒーロー写真パネル 出現 + スクロール視差
   ============================================================ */
function initGsapParallax() {
  // GSAP が読み込まれていなければスキップ
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    return;
  }

  // prefers-reduced-motion の場合は視差のみ無効化（出現アニメは継続）
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ScrollTrigger プラグイン登録
  gsap.registerPlugin(ScrollTrigger);

  const photos = document.querySelectorAll(".hero__photo");
  if (!photos.length) return;

  photos.forEach((photo) => {
    // --- data 属性を取得 ---
    // data-speed  : 視差速度（0〜1、大きいほど速く流れる）
    // data-dir    : "up" | "down"（スクロール時の移動方向）
    // data-entry  : 出現アニメーションの開始遅延(秒)
    const speed = parseFloat(photo.dataset.speed ?? "0.5");
    const goDown = photo.dataset.dir === "down";
    const entryDelay = parseFloat(photo.dataset.entry ?? "0");

    // ---------------------------------------------------------
    // 出現アニメーション
    // ・scale(0.82) からズームしながら浮き上がる
    // ・autoAlpha で visibility + opacity を同時制御
    // ・expo.out で急激に動き出し、ふわっと静止する質感
    // ---------------------------------------------------------
    gsap.from(photo, {
      autoAlpha: 0,        // opacity:0 + visibility:hidden から開始
      scale: 0.80,         // 少し縮んだ状態から拡大
      y: 48,               // 下から浮き上がる
      duration: 1.5,
      delay: entryDelay,
      ease: "expo.out",    // 急加速→滑らか減速
    });

    // ---------------------------------------------------------
    // スクロール視差（ScrollTrigger scrub）
    // ・reducedMotion の場合は視差をスキップ
    // ---------------------------------------------------------
    if (!reducedMotion) {
      // ヒーローの高さ分だけ、speed 比率で移動量を計算
      const moveY = () =>
        window.innerHeight * speed * 0.55 * (goDown ? 1 : -1);

      gsap.to(photo, {
        y: moveY,          // スクロール量に応じて上下に流れる
        ease: "power2.out", // 滑らかに減速して止まる質感
        scrollTrigger: {
          trigger: "#hero",
          start: "top top",
          end: "bottom top",
          scrub: 1.8,      // 値が大きいほど慣性が強くなる
          invalidateOnRefresh: true, // リサイズ時に moveY を再計算
        },
      });
    }
  });
}

/* ============================================================
   12. Init
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initHamburger();
  initHeroAnimations();
  initParallax();       // heroBg が無いので早期 return するが残置
  initScrollAnimations();
  initCounters();
  initScrollSpy();
  initSmoothScroll();
  initPageTop();
  initContactForm();
  initGsapParallax();   // GSAP 写真視差（GSAP CDN 読み込み後に実行）
});
