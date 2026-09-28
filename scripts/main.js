/**
 * PULSO — Interações Principais da Página
 * Menu mobile acessível, cabeçalho sticky, ano dinâmico e resolução de CTAs
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. Cabeçalho Sticky com Efeito de Sombra ao Rolar
  // --------------------------------------------------------------------------
  const header = document.querySelector('.site-header');
  function updateHeaderOnScroll() {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }
  window.addEventListener('scroll', updateHeaderOnScroll, { passive: true });
  updateHeaderOnScroll();

  // --------------------------------------------------------------------------
  // 2. Menu Mobile Acessível (Drawer)
  // --------------------------------------------------------------------------
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .mobile-drawer .btn');

  const menuClose = document.querySelector('.mobile-menu-close');
  const background = [...document.querySelectorAll('main, .site-footer, .site-header, .skip-link')];
  const previousInert = new Map();
  let previousOverflow = '';
  const mobileQuery = window.matchMedia('(max-width: 768px)');

  function openMobileMenu() {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle.setAttribute('aria-label', 'Fechar menu de navegação');
    previousOverflow = document.body.style.overflow;
    background.forEach(el => { previousInert.set(el, el.inert); el.inert = true; });
    mobileDrawer.inert = false;
    mobileDrawer.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Foco no primeiro link
    const firstLink = mobileDrawer.querySelector('a, button');
    if (firstLink) firstLink.focus();
  }

  function closeMobileMenu() {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Abrir menu de navegação');
    mobileDrawer.classList.remove('is-open');
    mobileDrawer.inert = true;
    background.forEach(el => { el.inert = previousInert.get(el) || false; });
    previousInert.clear();
    document.body.style.overflow = previousOverflow;
    if (mobileQuery.matches) menuToggle.focus();
    else document.querySelector('.header-brand')?.focus();
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Fechar ao clicar em qualquer link interno do menu mobile
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        closeMobileMenu();
      });
    });

    menuClose?.addEventListener('click', closeMobileMenu);
    mobileQuery.addEventListener('change', () => {
      if (!mobileQuery.matches && menuToggle.getAttribute('aria-expanded') === 'true') closeMobileMenu();
    });
    mobileDrawer.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      const items = [...mobileDrawer.querySelectorAll('a[href], button:not([disabled])')].filter(el => !el.hidden);
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    // Fechar ao pressionar a tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
        closeMobileMenu();
      }
    });
  }

  // --------------------------------------------------------------------------
  // 3. Atualização Dinâmica do Ano no Rodapé
  // --------------------------------------------------------------------------
  const currentYearSpan = document.getElementById('current-year');
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // --------------------------------------------------------------------------
  // 4. Resolução Inteligente dos Links de Contato a partir de PulsoConfig
  // --------------------------------------------------------------------------
  function resolveContactLinks() {
    const config = window.PulsoConfig;
    if (!config) return;

    const contactButtons = document.querySelectorAll('[data-contact-context]');
    const isWhatsAppReady = config.isWhatsAppConfigured();
    const isEmailReady = config.isEmailConfigured();

    const pending = document.getElementById('contact-pending');
    if (pending) pending.hidden = isWhatsAppReady || isEmailReady;
    contactButtons.forEach(btn => {
      const context = btn.getAttribute('data-contact-context');
      const explicit = btn.getAttribute('data-contact-type');
      const channel = explicit || (isWhatsAppReady ? 'whatsapp' : isEmailReady ? 'email' : null);
      btn.removeAttribute('target');
      btn.removeAttribute('rel');
      if (explicit) btn.hidden = channel === 'whatsapp' ? !isWhatsAppReady : !isEmailReady;
      if (channel === 'whatsapp' && isWhatsAppReady) {
        btn.href = config.getWhatsAppUrl(context);
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
      } else if (channel === 'email' && isEmailReady) {
        btn.href = config.getEmailUrl(context);
      } else {
        btn.href = '#contato';
      }
    });
  }

  // Executar após o carregamento do DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', resolveContactLinks);
  } else {
    resolveContactLinks();
  }
})();
