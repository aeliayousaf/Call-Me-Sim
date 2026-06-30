const toggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    navLinks.classList.toggle('is-open', !isOpen);
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
    });
  });
}

const modal = document.getElementById('contact-modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.querySelector('.modal-close');
const contactTriggers = document.querySelectorAll('[data-contact-modal]');

function openContactModal(title) {
  if (!modal || !modalTitle) return;

  modalTitle.textContent = title;
  modal.hidden = false;
  document.body.classList.add('modal-open');
  modalClose?.focus();
}

function closeContactModal() {
  if (!modal) return;

  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

contactTriggers.forEach((trigger) => {
  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    openContactModal(trigger.dataset.modalTitle || 'Contact');
  });
});

modalClose?.addEventListener('click', closeContactModal);

modal?.addEventListener('click', (event) => {
  if (event.target === modal) {
    closeContactModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal && !modal.hidden) {
    closeContactModal();
  }
});
