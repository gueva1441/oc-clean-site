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

  // Animate sections + footer
  const targets = document.querySelectorAll("section:not(#hero), footer");

  if (prefersReducedMotion) return;

  targets.forEach((el) => el.classList.add("reveal"));

  // Reveal anything already in view to avoid "blank until scroll"
  const revealInViewNow = () => {
    const triggerLine = window.innerHeight * 0.92;
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

// Phase 4: Estimate form UI logic (no n8n integration yet)
(() => {
  const form = document.getElementById("estimateForm");
  if (!form) return;

  const hiddenCategory = document.getElementById("service_category");
  const radios = Array.from(form.querySelectorAll('input[name="service_category_choice"]'));

  const commercial = document.getElementById("commercialFields");
  const special = document.getElementById("specialFields");

  const photos = document.getElementById("photos");
  const statusEl = document.getElementById("formStatus");

  const errorFor = (name) => form.querySelector(`[data-error-for="${name}"]`);

  const setError = (name, message) => {
    const el = errorFor(name);
    if (!el) return;
    el.textContent = message || "";
  };

  const clearErrors = () => {
    ["contact_name", "email", "service_category", "photos"].forEach((k) => setError(k, ""));
    if (statusEl) statusEl.textContent = "";
  };

  const getSelectedCategory = () => {
    const checked = radios.find((r) => r.checked);
    return checked ? checked.value : "";
  };

  const setSelectedUI = (value) => {
    const cards = form.querySelectorAll(".choice-card");
    cards.forEach((card) => card.classList.remove("is-selected"));

    const checked = radios.find((r) => r.value === value);
    if (!checked) return;

    const card = checked.closest(".choice-card");
    if (card) card.classList.add("is-selected");
  };





  const toggleFields = () => {
    const v = getSelectedCategory();
    hiddenCategory.value = v;

    // Hide everything first
    commercial.style.display = "none";
    special.style.display = "none";

    const contactFieldset = form.querySelectorAll("fieldset")[2];
    const actions = form.querySelector(".form-actions");

    contactFieldset.style.display = "none";
    actions.style.display = "none";

    // Show only when category is selected
    if (v === "commercial") {
      commercial.style.display = "block";
    }

    if (v === "special") {
      special.style.display = "block";
    }

    if (v) {
      contactFieldset.style.display = "block";
      actions.style.display = "block";
    }
  };


  radios.forEach((r) => {
    r.addEventListener("change", () => {
      setSelectedUI(r.value);
      toggleFields();
      clearErrors();
    });
  });

  photos?.addEventListener("change", () => {
    setError("photos", "");
    if (photos.files && photos.files.length > 10) {
      setError("photos", "Please select up to 10 images.");
    }
  });

  const validate = () => {
    clearErrors();
    let ok = true;

    const name = form.contact_name?.value?.trim() || "";
    const email = form.email?.value?.trim() || "";
    const cat = hiddenCategory?.value?.trim() || "";

    if (!cat) {
      setError("service_category", "Please choose one option above.");
      ok = false;
    }

    if (!name) {
      setError("contact_name", "Contact name is required.");
      ok = false;
    }

    if (!email) {
      setError("email", "Email is required.");
      ok = false;
    } else {
      const simpleEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!simpleEmail.test(email)) {
        setError("email", "Please enter a valid email.");
        ok = false;
      }
    }

    if (photos?.files && photos.files.length > 10) {
      setError("photos", "Please select up to 10 images.");
      ok = false;
    }

    return ok;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    toggleFields();

    if (!validate()) {
      if (statusEl) statusEl.textContent = "Please fix the highlighted fields and try again.";
      return;
    }

    // Phase 4 only: show success message (no backend yet)
    if (statusEl) {
      statusEl.textContent = "Thanks! Your request is ready. (Submission will be connected in a later phase.)";
    }

    form.reset();
    setSelectedUI("");
    toggleFields();
  });

  // Init
  setSelectedUI("");
  toggleFields();
})();
