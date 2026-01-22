// Minimal scroll-reveal (no libraries)
// - Reveals anything already in view on load (prevents blank sections)
// - Reveals remaining sections on scroll
// - Respects prefers-reduced-motion


(() => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Inject minimal styles needed for reveal
  const style = document.createElement("style");
  style.textContent = `
    .reveal {
      opacity: 0;
      transform: translateY(24px);
      transition: opacity 520ms ease, transform 520ms ease;
      will-change: opacity, transform;
    }
    .reveal.is-visible {
      opacity: 1;
      transform: translateY(0);
    }
    @media (prefers-reduced-motion: reduce) {
      .reveal {
        transition: none !important;
        transform: none !important;
        opacity: 1 !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Do NOT animate hero; animate everything else
  const targets = document.querySelectorAll("section:not(#hero):not(#services), footer");


  if (prefersReducedMotion) return;

  targets.forEach((el) => el.classList.add("reveal"));

  // Reveal anything already in view to avoid "blank until scroll"
  const revealInViewNow = () => {
    const triggerLine = window.innerHeight * 0.92; // slightly below fold
    targets.forEach((el) => {
      if (el.classList.contains("is-visible")) return;
      const rect = el.getBoundingClientRect();
      if (rect.top < triggerLine) el.classList.add("is-visible");
    });
  };

  revealInViewNow();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    },
    {
      threshold: 0,
      rootMargin: "0px 0px -25% 0px",
    }
  );

  targets.forEach((el) => {
    if (!el.classList.contains("is-visible")) io.observe(el);
  });

  // Safety: if layout shifts after load (fonts/video), re-check once
  window.addEventListener("load", () => setTimeout(revealInViewNow, 0), { once: true });
})();
