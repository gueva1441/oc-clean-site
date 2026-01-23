// main.js - Premium Interactions

// 1. Scroll Reveal with Staggered Effect
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
    // Añadimos un pequeño delay basado en el orden para el efecto cascada
    // pero reseteamos el delay si es un nuevo contenedor
    observer.observe(el);
  });
});


// 2. Form Logic (Manteniendo tu lógica original, pero limpia)
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
      // Pequeño timeout para permitir transición de opacidad si quisieras agregarla
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
    
    // Mostrar resto del formulario si hay selección
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

  radios.forEach(r => r.addEventListener('change', updateUI));

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
      // Aquí iría tu integración con n8n más adelante
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

  // Init
  updateUI();
})();