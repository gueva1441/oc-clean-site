// main.js - Premium Interactions & Logic (Conectado a n8n)

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


// 2. Form Logic (Lógica del Formulario + Auto-Scroll + n8n)
(() => {
  const form = document.getElementById("estimateForm");
  if (!form) return;

  const hiddenCategory = document.getElementById("service_category");
  const radios = Array.from(form.querySelectorAll('input[name="service_category_choice"]'));
  const commercial = document.getElementById("commercialFields");
  const special = document.getElementById("specialFields");
  const formStatus = document.getElementById("formStatus");
  const submitBtn = document.getElementById("submitBtn"); // Agregamos referencia al botón

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

  // --- AUTO-SCROLL MEJORADO (FRANCOTIRADOR) ---
  radios.forEach(r => r.addEventListener('change', (e) => {
    updateUI();

    // Esperamos un instante a que el navegador pinte los campos nuevos
    setTimeout(() => {
        const selectedValue = e.target.value;
        const targetId = selectedValue === 'commercial' ? 'commercialFields' : 'specialFields';
        const targetSection = document.getElementById(targetId);
        
        // CÁLCULO MANUAL (Para que el menú no tape el título)
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
    // Deshabilitar botón para evitar doble clic
    if(submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Processing...";
    }

    // 3. Capturar Datos
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    try {
      // 4. Disparar al Webhook de Producción
      const response = await fetch('https://n8n.northmasters.ca/webhook/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        // 5. Éxito
        form.reset();
        updateUI(); // Resetea visualmente el formulario
        formStatus.textContent = "✅ Request sent! We'll contact you shortly.";
        formStatus.style.color = "green";
        
        if(submitBtn) submitBtn.textContent = "Request Sent";
        
        // Restaurar botón después de 5 segundos
        setTimeout(() => {
            if(submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Request a Free Quote";
            }
            formStatus.textContent = "";
        }, 5000);

      } else {
        throw new Error('Server returned ' + response.status);
      }

    } catch (error) {
      // 6. Error
      console.error('Error sending form:', error);
      formStatus.textContent = "❌ Error connecting to server. Please email us at oc@northmasters.ca";
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