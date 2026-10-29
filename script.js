/**
 * C&C ASESORÍA LEGAL ESPECIALIZADA - DERECHO PENAL
 * Lógica Interactiva, Filtro Pre-Llamada y Derivación a WhatsApp
 */

document.addEventListener('DOMContentLoaded', function () {
  const PHONE_NUMBER = '+51962937239';
  const WA_CLEAN_PHONE = '51962937239';

  // Elementos del Modal Pre-Llamada
  const callModal = document.getElementById('call-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const btnTriggerCall = document.getElementById('btn-modal-trigger-call');
  const checkHonorarios = document.getElementById('check-honorarios');
  const nonPenalWarning = document.getElementById('non-penal-warning');
  const modalWaFallback = document.getElementById('btn-modal-wa-fallback');

  // 1. Verificación de Horario de Atención (Lunes a Viernes 9:30 - 13:50 y 16:00 - 18:00)
  function checkBusinessHours() {
    // Calculamos hora en Perú (UTC-5)
    const now = new Date();
    const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
    const peruTime = new Date(utcTime - (5 * 3600000));
    
    const day = peruTime.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const hour = peruTime.getHours();
    const minutes = peruTime.getMinutes();
    const currentMinOfDay = hour * 60 + minutes;

    const isWeekday = day >= 1 && day <= 5;
    const isMorningShift = currentMinOfDay >= (9 * 60 + 30) && currentMinOfDay <= (13 * 60 + 50);
    const isAfternoonShift = currentMinOfDay >= (16 * 60) && currentMinOfDay <= (18 * 60);

    const isOpen = isWeekday && (isMorningShift || isAfternoonShift);
    return {
      isOpen: isOpen,
      day: day,
      hourText: `${String(hour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
    };
  }

  // Actualizar indicadores de horario en el DOM
  function updateScheduleUI() {
    const status = checkBusinessHours();
    const scheduleBox = document.getElementById('modal-schedule-status');
    const scheduleBadge = document.getElementById('hero-schedule-badge');

    if (scheduleBox) {
      if (status.isOpen) {
        scheduleBox.className = 'modal-schedule-status status-open';
        scheduleBox.innerHTML = `
          <div class="sched-header">
            <span class="sched-dot-open"></span>
            <strong>Línea Telefónica Disponible</strong>
            <span class="sched-hours-pill">Lun–Vie: 9:30–1:50 y 4:00–6:00</span>
          </div>
        `;
      } else {
        scheduleBox.className = 'modal-schedule-status status-closed';
        scheduleBox.innerHTML = `
          <div class="sched-header">
            <span class="sched-dot-closed"></span>
            <strong>Línea Telefónica en Receso</strong>
            <span class="sched-hours-pill">Lun–Vie: 9:30–1:50 y 4:00–6:00</span>
          </div>
          <div class="sched-urgency-alert">
            <i class="fa-solid fa-triangle-exclamation"></i>
            <span><strong>¿Urgencia 24h?</strong> Escríbenos directo por WhatsApp.</span>
          </div>
        `;
      }
    }

    if (scheduleBadge) {
      if (status.isOpen) {
        scheduleBadge.innerHTML = '<i class="fa-solid fa-phone"></i> Línea telefónica disponible ahora';
      } else {
        scheduleBadge.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Atención penal presencial y virtual';
      }
    }

    evaluateCallButtonState();
  }

  // 2. Control del Modal de Calificación Pre-Llamada (Filtro Anti-Curiosos)
  window.openCallModal = function (originContext) {
    if (!callModal) return;
    updateScheduleUI();
    callModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    
    // Si viene con un contexto específico de especialidad
    if (originContext) {
      const radio = document.querySelector(`input[name="triage-case"][value="${originContext}"]`);
      if (radio) radio.checked = true;
    }
    evaluateCallButtonState();
  };

  function closeCallModal() {
    if (!callModal) return;
    callModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeCallModal);
  }

  if (callModal) {
    callModal.addEventListener('click', function (e) {
      if (e.target === callModal) closeCallModal();
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && callModal && callModal.classList.contains('open')) {
      closeCallModal();
    }
  });

  // Escuchar botones con clase .trigger-call-modal
  document.querySelectorAll('.trigger-call-modal').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const serviceContext = btn.getAttribute('data-context') || '';
      openCallModal(serviceContext);
    });
  });

  // Evaluación interactiva de opciones dentro del modal
  const triageRadios = document.querySelectorAll('input[name="triage-case"]');

  function evaluateCallButtonState() {
    const status = checkBusinessHours();
    const selectedRadio = document.querySelector('input[name="triage-case"]:checked');
    const isTermsChecked = checkHonorarios ? checkHonorarios.checked : false;

    // Fuera del horario laboral: el botón de llamada se desactiva y solo queda activo WhatsApp
    if (!status.isOpen) {
      if (btnTriggerCall) {
        btnTriggerCall.disabled = true;
        btnTriggerCall.innerHTML = '<i class="fa-solid fa-phone-slash"></i> Línea telefónica en receso (Fuera de horario)';
        btnTriggerCall.title = 'Línea telefónica disponible de Lun a Vie: 9:30–1:50 y 4:00–6:00. Usa WhatsApp para consultar.';
      }
      if (modalWaFallback) {
        modalWaFallback.classList.add('wa-priority-active');
      }
      if (nonPenalWarning) {
        nonPenalWarning.style.display = (selectedRadio && selectedRadio.value === 'no_penal') ? 'block' : 'none';
      }
      return;
    }

    // Dentro del horario laboral
    if (btnTriggerCall) {
      btnTriggerCall.innerHTML = '<i class="fa-solid fa-phone"></i> LLAMAR AHORA: +51 962 937 239';
      btnTriggerCall.title = '';
    }
    if (modalWaFallback) {
      modalWaFallback.classList.remove('wa-priority-active');
    }

    if (!selectedRadio) {
      if (btnTriggerCall) btnTriggerCall.disabled = true;
      if (nonPenalWarning) nonPenalWarning.style.display = 'none';
      return;
    }

    if (selectedRadio.value === 'no_penal') {
      // Filtro disuasivo para personas buscando otra rama
      if (nonPenalWarning) nonPenalWarning.style.display = 'block';
      if (btnTriggerCall) btnTriggerCall.disabled = true;
    } else {
      if (nonPenalWarning) nonPenalWarning.style.display = 'none';
      if (btnTriggerCall) {
        btnTriggerCall.disabled = !isTermsChecked;
      }
    }
  }

  if (triageRadios) {
    triageRadios.forEach(function (radio) {
      radio.addEventListener('change', evaluateCallButtonState);
    });
  }

  if (checkHonorarios) {
    checkHonorarios.addEventListener('change', evaluateCallButtonState);
  }

  // Disparar llamada al completar el filtro
  if (btnTriggerCall) {
    btnTriggerCall.addEventListener('click', function () {
      const status = checkBusinessHours();
      if (!status.isOpen) return; // Fuera de horario bloquea la llamada

      const selectedRadio = document.querySelector('input[name="triage-case"]:checked');
      if (!selectedRadio || selectedRadio.value === 'no_penal') return;

      // Disparar llamada al número oficial
      window.location.href = `tel:${PHONE_NUMBER}`;
      closeCallModal();
    });
  }

  updateScheduleUI();
  setInterval(updateScheduleUI, 60000); // Reevaluar cada minuto

  // Redirección a WhatsApp desde el modal
  if (modalWaFallback) {
    modalWaFallback.addEventListener('click', function (e) {
      e.preventDefault();
      const selectedRadio = document.querySelector('input[name="triage-case"]:checked');
      let msg = 'Hola Dra. Elizabeth Rojas, necesito evaluar mi caso de penal con un especialista.';
      
      if (selectedRadio) {
        if (selectedRadio.value === 'detencion') {
          msg = 'URGENCIA PENAL: Hola Dra. Elizabeth Rojas, tengo un familiar/persona detenida en comisaría/juzgado y necesito asistencia legal inmediata.';
        } else if (selectedRadio.value === 'investigacion') {
          msg = 'Hola Dra. Elizabeth Rojas, tengo una investigación preliminar/citación fiscal activa y deseo coordinar una cita para evaluar mi defensa.';
        } else if (selectedRadio.value === 'juicio_apelacion') {
          msg = 'Hola Dra. Elizabeth Rojas, requiero asesoría técnica para un proceso en etapa de juicio oral o apelación de sentencia penal.';
        }
      }

      const waUrl = `https://api.whatsapp.com/send?phone=${WA_CLEAN_PHONE}&text=${encodeURIComponent(msg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      closeCallModal();
    });
  }

  // 3. Formulario Alternativo de Evaluación a WhatsApp
  const leadForm = document.getElementById('lead-form');
  const inputNombre = document.getElementById('form-nombre');
  const inputTelefono = document.getElementById('form-telefono');
  const errNombre = document.getElementById('error-nombre');
  const errTelefono = document.getElementById('error-telefono');

  if (inputNombre) {
    // En la parte de nombre solo se permiten letras, tildes, ñ y espacios
    inputNombre.addEventListener('input', function () {
      this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      if (errNombre && /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,}$/.test(this.value.trim())) {
        errNombre.style.display = 'none';
      }
    });

    inputNombre.addEventListener('keypress', function (e) {
      if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]$/.test(e.key)) {
        e.preventDefault();
      }
    });
  }

  if (inputTelefono) {
    // Solo van números, el primer número debe empezar con 9 y solo se admiten 9 números
    inputTelefono.addEventListener('input', function () {
      let val = this.value.replace(/\D/g, '');
      // El primer número debe empezar con 9
      while (val.length > 0 && val[0] !== '9') {
        val = val.substring(1);
      }
      // Solo admitir un máximo de 9 números
      if (val.length > 9) {
        val = val.slice(0, 9);
      }
      this.value = val;

      if (errTelefono && /^9\d{8}$/.test(this.value)) {
        errTelefono.style.display = 'none';
      }
    });

    inputTelefono.addEventListener('keypress', function (e) {
      // Solo números
      if (!/\d/.test(e.key)) {
        e.preventDefault();
        return;
      }
      // Primer número debe ser 9
      if (this.value.length === 0 && e.key !== '9') {
        e.preventDefault();
        return;
      }
      // Solo se admiten dentro de ese cuadro 9 números
      if (this.value.length >= 9) {
        e.preventDefault();
      }
    });
  }

  if (leadForm) {
    leadForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nombre = inputNombre ? inputNombre.value.trim() : '';
      const telefono = inputTelefono ? inputTelefono.value.trim() : '';
      const ciudad = document.getElementById('form-ciudad').value;
      const servicio = document.getElementById('form-servicio').value;
      const mensaje = document.getElementById('form-mensaje').value.trim();

      let valid = true;

      // Validar nombre (solo letras y espacios, mínimo 3 caracteres)
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]{3,}$/;
      if (!nombre || !nameRegex.test(nombre)) {
        if (errNombre) errNombre.style.display = 'block';
        valid = false;
      } else {
        if (errNombre) errNombre.style.display = 'none';
      }

      // Validar teléfono (Perú: exactamente 9 dígitos iniciando en 9)
      const phoneRegex = /^9\d{8}$/;
      if (!phoneRegex.test(telefono)) {
        if (errTelefono) errTelefono.style.display = 'block';
        valid = false;
      } else {
        if (errTelefono) errTelefono.style.display = 'none';
      }

      if (!valid) return;

      let waText = `*CONSULTA PENAL - C&C ASESORÍA LEGAL ESPECIALIZADA*\n`;
      waText += `*Nombre:* ${nombre}\n`;
      waText += `*Teléfono:* +51 ${telefono}\n`;
      waText += `*Ciudad/Región:* ${ciudad}\n`;
      waText += `*Materia/Delito:* ${servicio}\n`;
      if (mensaje) {
        waText += `*Detalle:* ${mensaje}\n`;
      }
      waText += `\n_Deseo coordinar una llamada o cita de evaluación legal con la Socia Directora._`;

      const sendUrl = `https://api.whatsapp.com/send?phone=${WA_CLEAN_PHONE}&text=${encodeURIComponent(waText)}`;
      window.open(sendUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // 4. Acordeón Interactivo de FAQ
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) {
      trigger.addEventListener('click', function () {
        const isActive = item.classList.contains('active');
        faqItems.forEach(function (other) { other.classList.remove('active'); });
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // 5. Componente Custom Select (Despliega las alternativas dentro de la pantalla celular)
  function setupCustomSelect(selectId) {
    const originalSelect = document.getElementById(selectId);
    if (!originalSelect) return;

    // Ocultar select nativo manteniéndolo funcional en el DOM
    originalSelect.style.position = 'absolute';
    originalSelect.style.opacity = '0';
    originalSelect.style.pointerEvents = 'none';
    originalSelect.style.width = '1px';
    originalSelect.style.height = '1px';
    originalSelect.tabIndex = -1;

    // Crear wrapper del selector personalizado
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    wrapper.id = `custom-wrapper-${selectId}`;

    const trigger = document.createElement('div');
    trigger.className = 'custom-select-trigger';
    trigger.tabIndex = 0;
    trigger.setAttribute('role', 'combobox');
    trigger.setAttribute('aria-expanded', 'false');

    const valueSpan = document.createElement('span');
    valueSpan.className = 'custom-select-value';
    
    const selectedOption = originalSelect.options[originalSelect.selectedIndex] || originalSelect.options[0];
    valueSpan.textContent = selectedOption ? selectedOption.text : '';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-chevron-down custom-select-icon';

    trigger.appendChild(valueSpan);
    trigger.appendChild(icon);

    const dropdown = document.createElement('div');
    dropdown.className = 'custom-select-dropdown';
    dropdown.setAttribute('role', 'listbox');

    Array.from(originalSelect.options).forEach(function (opt) {
      const optionDiv = document.createElement('div');
      optionDiv.className = 'custom-select-option' + (opt.selected ? ' selected' : '');
      optionDiv.setAttribute('role', 'option');
      optionDiv.setAttribute('data-value', opt.value);
      optionDiv.textContent = opt.text;

      optionDiv.addEventListener('click', function (e) {
        e.stopPropagation();
        selectOption(opt.value, opt.text);
      });

      dropdown.appendChild(optionDiv);
    });

    wrapper.appendChild(trigger);
    wrapper.appendChild(dropdown);

    originalSelect.parentNode.insertBefore(wrapper, originalSelect.nextSibling);

    function selectOption(val, text) {
      originalSelect.value = val;
      valueSpan.textContent = text;
      
      dropdown.querySelectorAll('.custom-select-option').forEach(function (el) {
        if (el.getAttribute('data-value') === val) {
          el.classList.add('selected');
        } else {
          el.classList.remove('selected');
        }
      });

      closeDropdown();
      originalSelect.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function openDropdown() {
      document.querySelectorAll('.custom-select-wrapper.open').forEach(function (other) {
        if (other !== wrapper) {
          other.classList.remove('open');
          const otherTrigger = other.querySelector('.custom-select-trigger');
          if (otherTrigger) otherTrigger.setAttribute('aria-expanded', 'false');
        }
      });

      wrapper.classList.add('open');
      trigger.setAttribute('aria-expanded', 'true');

      const curSelected = dropdown.querySelector('.custom-select-option.selected');
      if (curSelected) {
        setTimeout(function () {
          curSelected.scrollIntoView({ block: 'nearest' });
        }, 10);
      }
    }

    function closeDropdown() {
      wrapper.classList.remove('open');
      trigger.setAttribute('aria-expanded', 'false');
    }

    function toggleDropdown() {
      if (wrapper.classList.contains('open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      toggleDropdown();
    });

    trigger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown();
      } else if (e.key === 'Escape') {
        closeDropdown();
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (!wrapper.classList.contains('open')) {
          openDropdown();
        } else {
          const options = Array.from(dropdown.querySelectorAll('.custom-select-option'));
          const curIndex = options.findIndex(function (o) { return o.classList.contains('selected'); });
          const nextIndex = e.key === 'ArrowDown' ? curIndex + 1 : curIndex - 1;
          if (nextIndex >= 0 && nextIndex < options.length) {
            selectOption(options[nextIndex].getAttribute('data-value'), options[nextIndex].textContent);
            options[nextIndex].scrollIntoView({ block: 'nearest' });
          }
        }
      }
    });

    const label = document.querySelector(`label[for="${selectId}"]`);
    if (label) {
      label.addEventListener('click', function (e) {
        e.preventDefault();
        trigger.focus();
        toggleDropdown();
      });
    }

    document.addEventListener('click', function (e) {
      if (!wrapper.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  // Inicializar selectores personalizados (Regiones y Situación Penal)
  setupCustomSelect('form-ciudad');
  setupCustomSelect('form-servicio');
});
