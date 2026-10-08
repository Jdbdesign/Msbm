/* MSBM Glasgow Retreat — page behaviour on top of Bootstrap 5.
   Bootstrap handles: modal open/close/backdrop/focus/Esc (data-bs-toggle="modal"),
   nav highlighting (ScrollSpy on <body>), and smooth anchor scrolling (CSS).
   This file only fills the shared modal with the right form and validates it. */
(function () {
  'use strict';

  // ---- form definitions (one shared modal, four variants) ----
  var firstName = { name: 'firstName', label: 'First name', type: 'text', placeholder: 'Jane', half: true };
  var lastName = { name: 'lastName', label: 'Last name', type: 'text', placeholder: 'Smith', half: true };
  var email = { name: 'email', label: 'Work email', type: 'email', placeholder: 'jane@company.com' };

  var FORMS = {
    apply: {
      eyebrow: 'APPLICATION', title: 'Secure Your Place', subtitle: '23–27 March 2027 · Glasgow, Scotland', cta: 'Submit Application',
      fields: [firstName, lastName, email,
        { name: 'org', label: 'Organisation', type: 'text', placeholder: 'Company name' },
        { name: 'role', label: 'Job title', type: 'text', placeholder: 'e.g. Chief Operating Officer' },
        { name: 'country', label: 'Country of residence', type: 'text', placeholder: 'e.g. United Arab Emirates' }],
      successTitle: 'Application received',
      successText: 'Thank you. Our admissions team will review your application and contact you within two business days.'
    },
    brochure: {
      eyebrow: 'BROCHURE', title: 'Download the Brochure', subtitle: 'Programme overview, experiences and fees.', cta: 'Send Brochure',
      fields: [firstName, lastName, email],
      successTitle: 'Brochure on its way',
      successText: 'We’ve emailed the retreat brochure to you. Check your inbox in the next few minutes.'
    },
    programme: {
      eyebrow: 'PROGRAMME', title: 'Download Detailed Programme', subtitle: 'Day-by-day schedule, masterclasses and experiences.', cta: 'Send Programme',
      fields: [firstName, lastName, email,
        { name: 'org', label: 'Organisation', type: 'text', placeholder: 'Company name' }],
      successTitle: 'Programme sent',
      successText: 'The detailed programme is on its way to your inbox.'
    },
    visa: {
      eyebrow: 'VISA SUPPORT', title: 'Get Visa Support', subtitle: 'Guidance, documentation advice and invitation letters.', cta: 'Request Support',
      fields: [firstName, lastName, email,
        { name: 'nationality', label: 'Nationality', type: 'text', placeholder: 'e.g. Nigerian' }],
      successTitle: 'Request received',
      successText: 'A member of our visa support team will be in touch with next steps and an invitation letter request form.'
    }
  };

  // ---- DOM refs ----
  var stickyNav = document.getElementById('stickyNav');
  var modalEl = document.getElementById('msbmModal');
  var formEl = document.getElementById('msbmForm');
  var fieldsEl = document.getElementById('msbmFields');
  var submitBtn = document.getElementById('msbmSubmit');
  var successEl = document.getElementById('msbmSuccess');
  var current = null;
  var sending = false;

  function setText(id, text) { document.getElementById(id).textContent = text; }

  function setSubmitLabel(text) {
    submitBtn.textContent = text + ' ';
    var icon = document.createElement('span');
    icon.className = 'msi msi-19';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = 'arrow_forward';
    submitBtn.appendChild(icon);
  }

  // ---- build the form for the chosen variant ----
  function renderForm(kind) {
    var cfg = FORMS[kind];
    current = kind;
    sending = false;

    setText('modalEyebrow', cfg.eyebrow);
    setText('modalTitle', cfg.title);
    setText('modalSubtitle', cfg.subtitle);
    setText('successTitle', cfg.successTitle);
    setText('successText', cfg.successText);

    fieldsEl.innerHTML = '';
    cfg.fields.forEach(function (f) {
      var col = document.createElement('div');
      col.className = f.half ? 'col-12 col-sm-6' : 'col-12';

      var id = 'msbm-' + f.name;
      var label = document.createElement('label');
      label.className = 'form-label';
      label.setAttribute('for', id);
      label.textContent = f.label;

      var input = document.createElement('input');
      input.className = 'form-control';
      input.id = id;
      input.name = f.name;
      input.type = f.type;
      input.placeholder = f.placeholder;
      input.autocomplete = { firstName: 'given-name', lastName: 'family-name', email: 'email', org: 'organization' }[f.name] || 'off';
      input.addEventListener('input', function () { input.classList.remove('is-invalid'); });

      var feedback = document.createElement('div');
      feedback.className = 'invalid-feedback';

      col.appendChild(label);
      col.appendChild(input);
      col.appendChild(feedback);
      fieldsEl.appendChild(col);
    });

    setSubmitLabel(cfg.cta);
    submitBtn.disabled = false;
    formEl.classList.remove('d-none');
    successEl.classList.add('d-none');
  }

  // Open: Bootstrap fires show.bs.modal with the clicked button as relatedTarget.
  modalEl.addEventListener('show.bs.modal', function (e) {
    var kind = e.relatedTarget && e.relatedTarget.getAttribute('data-msbm-form');
    if (!FORMS[kind]) { e.preventDefault(); return; }
    renderForm(kind);
  });
  modalEl.addEventListener('shown.bs.modal', function () {
    var first = fieldsEl.querySelector('input');
    if (first && !formEl.classList.contains('d-none')) first.focus();
  });

  // ---- validation + (simulated) submit ----
  formEl.addEventListener('submit', function (e) {
    e.preventDefault();
    if (sending || !FORMS[current]) return;

    var firstInvalid = null;
    FORMS[current].fields.forEach(function (f) {
      var input = formEl.elements[f.name];
      var feedback = input.parentNode.querySelector('.invalid-feedback');
      var v = input.value.trim();
      var msg = '';
      if (!v) msg = f.label + ' is required';
      else if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address';

      input.classList.toggle('is-invalid', !!msg);
      feedback.textContent = msg;
      if (msg && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    // No backend yet: show the sending state, then the success panel.
    sending = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    setTimeout(function () {
      sending = false;
      formEl.classList.add('d-none');
      successEl.classList.remove('d-none');
    }, 900);
  });

  // ---- sticky nav: fade in after the hero fold ----
  function syncSticky() {
    stickyNav.classList.toggle('show', window.scrollY > 520);
  }
  window.addEventListener('scroll', syncSticky, { passive: true });
  syncSticky();
})();
