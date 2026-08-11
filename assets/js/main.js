// main.js - Premium Interactions & Logic (Production Ready)

// ---------------------------------------------------------
// 1. SCROLL REVEAL (Entry Animation)
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const options = {
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        // Stagger solo para los service cards (100ms entre cada uno)
        const delay = parseInt(el.dataset.stagger || "0", 10);
        setTimeout(() => el.classList.add("is-visible"), delay);
        observer.unobserve(el);
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

  // Entrada escalonada (stagger) para los service cards
  document.querySelectorAll("#services article").forEach((card, i) => {
    card.dataset.stagger = i * 100;
  });
});

// ---------------------------------------------------------
// 2. MOBILE MENU TOGGLE (Hamburguesa) ✅ NUEVO
// ---------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  const mobileBtn = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('nav ul'); // Asegúrate que tu HTML tenga <ul class="nav-menu"> o solo <ul> dentro del nav

  if (mobileBtn && navMenu) {
      mobileBtn.addEventListener('click', () => {
          // Alternar clase 'active' para mostrar/ocultar menú
          navMenu.classList.toggle('active');
          
          // Opcional: Animar el icono de hamburguesa (transformar a X)
          mobileBtn.classList.toggle('open');
      });

      // Cerrar menú al hacer clic en cualquier enlace
      navMenu.querySelectorAll('a').forEach(link => {
          link.addEventListener('click', () => {
              navMenu.classList.remove('active');
              mobileBtn.classList.remove('open');
          });
      });
  }
});

// ---------------------------------------------------------
// 3. FORM LOGIC (Validation, Visibility, n8n)
// ---------------------------------------------------------
(() => {
  const form = document.getElementById("estimateForm");
  if (!form) return;

  // -- Form Elements --
  const hiddenCategory = document.getElementById("service_category");
  const radios = Array.from(form.querySelectorAll('input[name="service_category_choice"]'));
  
  // Sections
  const commercial = document.getElementById("commercialFields");
  const special = document.getElementById("specialFields");
  const photosSection = document.getElementById("photosFields"); 
  
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");
  
  // -- File Input Selection --
  const fileInput = form.querySelector('input[type="file"]');

  // -- Modal Elements --
  const modal = document.getElementById("customModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  // URL for n8n Production Webhook
  const WEBHOOK_URL = 'https://n8n.northmasters.ca/webhook/contact';

  // Modal Close Logic
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  // Helper: Toggle visibility with simple opacity transition
  const toggleVisibility = (element, show) => {
    if (!element) return; 
    if (show) {
      element.hidden = false;
      element.style.display = 'block';
      setTimeout(() => element.style.opacity = 1, 10);
    } else {
      element.hidden = true;
      element.style.display = 'none';
      element.style.opacity = 0;
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

    // 2. Set Hidden Value
    if (selected) hiddenCategory.value = selected;
    
    // 3. Show/Hide Specific Sections
    toggleVisibility(commercial, selected === 'commercial');
    toggleVisibility(special, selected === 'special');
    
    // 4. Show/Hide Common Sections
    const contactSet = form.querySelector('fieldset:last-of-type'); // Contact Details
    const actions = form.querySelector('.form-actions'); // Buttons
    
    if (selected) {
      toggleVisibility(photosSection, true);
      toggleVisibility(contactSet, true);
      toggleVisibility(actions, true);
    } else {
      toggleVisibility(photosSection, false);
      toggleVisibility(contactSet, false);
      toggleVisibility(actions, false);
    }
  };

  // --- FILE VALIDATION (SIZE + QUANTITY) ---
  if (fileInput) {
    const MAX_BYTES = 90 * 1024 * 1024; // 90 MB Limit
    const MAX_FILES = 10; // Quantity Limit

    fileInput.addEventListener('change', function() {
        // 1. Validate QUANTITY
        if (this.files.length > MAX_FILES) {
            alert(`⚠️ Too many files! You selected ${this.files.length} images.\n\nThe limit is ${MAX_FILES} images per submission.`);
            this.value = ""; // Clear selection
            return;
        }

        // 2. Validate SIZE
        let totalSize = 0;
        for (let i = 0; i < this.files.length; i++) {
            totalSize += this.files[i].size;
        }

        if (totalSize > MAX_BYTES) {
            const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
            alert(`⚠️ Total size too large! Your files total ${sizeInMB} MB.\n\nThe system accepts a maximum of 90 MB per submission.`);
            this.value = ""; // Clear selection
        }
    });
  }

  // --- AUTO-SCROLL EVENT ---
  radios.forEach(r => r.addEventListener('change', (e) => {
    updateUI();
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

    // 3. Capture Data
    const formData = new FormData(form);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        body: formData 
      });

      if (response.ok) {
        form.reset();
        updateUI(); 
        
        if (modal) modal.classList.add("active");

        if(formStatus) {
            formStatus.textContent = "Success!";
            formStatus.style.color = "green";
        }
        if(submitBtn) submitBtn.textContent = "Sent!";
        
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