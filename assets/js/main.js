// main.js - Premium Interactions & Logic

// 1. Scroll Reveal with Staggered Effect (Animación de entrada)
document.addEventListener("DOMContentLoaded", () => {
  const options = {
    threshold: 0.15, // Espera a que el 15% del elemento sea visible
    rootMargin: "0px 0px -50px 0px"
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target); // Dejar de observar una vez animado
      }
    });
  }, options);

  // Seleccionamos elementos para animar
  const animatedElements = document.querySelectorAll(
    "section h2, section p, article, .marquee, form"
  );

  animatedElements.forEach((el, index) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
});


// 2. Form Logic (Lógica del Formulario + Auto-Scroll)
(() => {
  const form = document.getElementById("estimateForm");
  if (!form) return;

  const hiddenCategory = document.getElementById("service_category");
  const radios = Array.from(form.querySelectorAll('input[name="service_category_choice"]'));
  const commercial = document.getElementById("commercialFields");
  const special = document.getElementById("specialFields");
  const formStatus = document.getElementById("formStatus");

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
    
    // 1. Highlight Cards (Resaltar tarjeta seleccionada)
    document.querySelectorAll('.choice-card').forEach(card => {
      const input = card.querySelector('input');
      if (input.checked) card.classList.add('is-selected');
      else card.classList.remove('is-selected');
    });

    // 2. Show Fields (Mostrar campos correspondientes)
    if (selected) hiddenCategory.value = selected;
    
    toggleVisibility(commercial, selected === 'commercial');
    toggleVisibility(special, selected === 'special');
    
    // Mostrar resto del formulario (contacto y botón) si hay selección
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

  // --- AQUÍ ESTÁ LA MAGIA DEL AUTO-SCROLL ---
  radios.forEach(r => r.addEventListener('change', (e) => {
    // 1. Primero actualizamos la pantalla (mostramos los campos)
    updateUI();

    // 2. Esperamos un instante a que el navegador pinte los campos nuevos
    setTimeout(() => {
        const selectedValue = e.target.value;
        const targetId = selectedValue === 'commercial' ? 'commercialFields' : 'specialFields';
        const targetSection = document.getElementById(targetId);
        
        // 3. Deslizamos suavemente hacia la sección nueva
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 150); // 150ms de pausa para suavidad
  }));

  // Validación básica al enviar
  form.addEventListener('submit', (e) => {
    e.preventDefault();
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

    if (isValid) {
      if(formStatus) formStatus.textContent = "Thank you. Processing your request...";
      formStatus.style.color = "green";
      
      // Simulación de envío (Aquí conectaremos n8n luego)
      setTimeout(() => {
        form.reset();
        updateUI();
        formStatus.textContent = "Request sent! We will be in touch shortly.";
      }, 1500);
      
    } else {
      if(formStatus) formStatus.textContent = "Please complete all required fields.";
      formStatus.style.color = "red";
    }
  });

  // Inicializar estado (por si el navegador guarda caché del formulario)
  updateUI();
})();