// main.js - Premium Interactions & Logic (Connected to n8n Production + Custom Modal)

// 1. Scroll Reveal with Staggered Effect (Entry Animation)
document.addEventListener("DOMContentLoaded", () => {
  const options = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, options);

  const animatedElements = document.querySelectorAll(
    "section h2, section p, article, .marquee, form"
  );

  animatedElements.forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
});


// 2. Form Logic (Field Toggling + n8n Connection + Modal)
(() => {
  const form = document.getElementById("estimateForm");
  if (!form) return;

  // -- Form Elements --
  const hiddenCategory = document.getElementById("service_category");
  const radios = Array.from(form.querySelectorAll('input[name="service_category_choice"]'));
  const commercial = document.getElementById("commercialFields");
  const special = document.getElementById("specialFields");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  // -- Modal Elements --
  const modal = document.getElementById("customModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  // URL for n8n Production Webhook
  //const WEBHOOK_URL = 'https://n8n.northmasters.ca/webhook/contact';

  // TEst url
  const WEBHOOK_URL = 'https://n8n.northmasters.ca/webhook-test/contact';

  // Modal Close Logic
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  // Helper: Toggle visibility with simple opacity transition
  const toggleVisibility = (element, show) => {
    if (show) {
      element.hidden = false;
      element.style.display = 'block';
      setTimeout(() => element.style.opacity = 1, 10);
      
      // Enable required fields inside visible section if needed in future
      // element.querySelectorAll('[data-required]').forEach(el => el.required = true);
    } else {
      element.hidden = true;
      element.style.display = 'none';
      
      // Disable required fields inside hidden section to prevent validation blocking
      // element.querySelectorAll('[data-required]').forEach(el => el.required = false);
    }
  };

  // Logic: Updates UI based on selected category (Commercial vs Special)
  const updateUI = () => {
    const selected = radios.find(r => r.checked)?.value;
    
    // 1. Highlight Cards
    document.querySelectorAll('.choice-card').forEach(card => {
      const input = card.querySelector('input');
      if (input.checked) card.classList.add('is-selected');
      else card.classList.remove('is-selected');
    });

    // 2. Show/Hide Sections
    if (selected) hiddenCategory.value = selected;
    
    toggleVisibility(commercial, selected === 'commercial');
    toggleVisibility(special, selected === 'special');
    
    // Show remaining form parts (Contact info & Submit button)
    const contactSet = form.querySelector('fieldset:last-of-type');
    const actions = form.querySelector('.form-actions');
    
    if (selected) {
      toggleVisibility(contactSet, true);
      toggleVisibility(actions, true);
    } else {
      toggleVisibility(contactSet, false);
      toggleVisibility(actions, false);
    }
  };

  // --- AUTO-SCROLL EVENT ---
  radios.forEach(r => r.addEventListener('change', (e) => {
    updateUI();
    // Small delay to allow DOM to update before scrolling
    setTimeout(() => {
        const selectedValue = e.target.value;
        const targetId = selectedValue === 'commercial' ? 'commercialFields' : 'specialFields';
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
            const y = targetSection.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({top: y, behavior: 'smooth'});
        }
    }, 150);
  }));

  // --- SUBMIT EVENT (SEND TO N8N) ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Visual Validation
    const required = form.querySelectorAll('[required]');
    let isValid = true;
    required.forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        field.style.borderColor = 'red';
      } else {
        field.style.borderColor = '';
      }
    });

    if (!isValid) {
      if(formStatus) {
          formStatus.textContent = "Please complete all required fields.";
          formStatus.style.color = "red";
      }
      return;
    }

    // 2. Prepare UI for Sending
    if(formStatus) {
        formStatus.textContent = "Sending request...";
        formStatus.style.color = "#0f172a";
    }
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
    }

    // 3. Capture Data (Using FormData for Binary/Image support)
    // IMPORTANT: We do NOT use JSON.stringify here because we want to support file uploads.
    const formData = new FormData(form);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        // Note: Do NOT set 'Content-Type': 'application/json' here.
        // The browser automatically sets the correct multipart/form-data boundary for files.
        body: formData 
      });

      if (response.ok) {
        // --- SUCCESS ---
        form.reset();
        updateUI(); // Reset visibility logic
        
        // A. Open Modal
        if (modal) modal.classList.add("active");

        // B. Update text feedback
        if(formStatus) {
            formStatus.textContent = "Success!";
            formStatus.style.color = "green";
        }
        if(submitBtn) submitBtn.textContent = "Sent!";
        
        // C. Restore button state
        setTimeout(() => {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Submit Request";
            }
            if(formStatus) formStatus.textContent = "";
        }, 3000);

      } else {
        throw new Error('Server returned ' + response.status);
      }

    } catch (error) {
      console.error('Error sending form:', error);
      formStatus.textContent = "❌ Error connecting. Please email us directly.";
      formStatus.style.color = "red";
      if(submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Try Again";
      }
    }
  });

  // Initialize UI on load
  updateUI();
})();