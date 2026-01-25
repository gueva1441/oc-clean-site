// main.js - Premium Interactions & Logic (Conectado a n8n + Custom Modal)

// 1. Scroll Reveal with Staggered Effect (Animación de entrada)
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


// 2. Form Logic (Lógica del Formulario + n8n + MODAL)
(() => {
  const form = document.getElementById("estimateForm");
  if (!form) return;

  // -- Elementos del Formulario --
  const hiddenCategory = document.getElementById("service_category");
  const radios = Array.from(form.querySelectorAll('input[name="service_category_choice"]'));
  const commercial = document.getElementById("commercialFields");
  const special = document.getElementById("specialFields");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn");

  // -- Elementos del MODAL NUEVO --
  const modal = document.getElementById("customModal");
  const closeModalBtn = document.getElementById("closeModalBtn");

  // Función para cerrar el modal
  if (closeModalBtn && modal) {
    closeModalBtn.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  // Helper para mostrar/ocultar con animación simple
  const toggleVisibility = (element, show) => {
    if (show) {
      element.hidden = false;
      element.style.display = 'block';
      setTimeout(() => element.style.opacity = 1, 10);
    } else {
      element.hidden = true;
      element.style.display = 'none';
    }
  };

  const updateUI = () => {
    const selected = radios.find(r => r.checked)?.value;
    
    // 1. Highlight Cards
    document.querySelectorAll('.choice-card').forEach(card => {
      const input = card.querySelector('input');
      if (input.checked) card.classList.add('is-selected');
      else card.classList.remove('is-selected');
    });

    // 2. Show Fields
    if (selected) hiddenCategory.value = selected;
    
    toggleVisibility(commercial, selected === 'commercial');
    toggleVisibility(special, selected === 'special');
    
    // Mostrar resto del formulario
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

  // --- AUTO-SCROLL MEJORADO ---
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

  // --- ENVÍO REAL A N8N ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // 1. Validación Visual
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

    // 2. Preparar Envío
    if(formStatus) {
        formStatus.textContent = "Sending request...";
        formStatus.style.color = "#0f172a";
    }
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
    }

    // 3. Capturar Datos
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      const response = await fetch('https://n8n.northmasters.ca/webhook/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // --- ÉXITO: ABRIMOS EL MODAL ---
        form.reset();
        updateUI(); 
        
        // 1. Activamos la ventana modal
        if (modal) modal.classList.add("active");

        // 2. Mensajes pequeños de respaldo
        if(formStatus) {
            formStatus.textContent = "Success!";
            formStatus.style.color = "green";
        }
        if(submitBtn) submitBtn.textContent = "Sent!";
        
        // 3. Restaurar botón
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

  // Inicializar estado
  updateUI();
})();