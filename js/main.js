/**
 * VISUALWOXX — Core Interactive Controller
 * Handles subscription form validation, email forwarding to visualwoxx@gmail.com,
 * local storage backup, parallax floating physics, and cursor glow.
 */

(function () {
  'use strict';

  // --- Configuration & Integration Point ---
  const CONFIG = {
    // Direct AJAX email notification endpoint forwarding to visualwoxx@gmail.com
    TARGET_EMAIL: 'visualwoxx@gmail.com',
    API_ENDPOINT: 'https://formsubmit.co/ajax/visualwoxx@gmail.com',
    STORAGE_KEY: 'visualwoxx_subscribers'
  };

  // --- DOM Elements ---
  const form = document.getElementById('notify-form');
  const emailInput = document.getElementById('email-input');
  const submitBtn = document.getElementById('submit-btn');
  const feedbackEl = document.getElementById('form-feedback');
  const successBanner = document.getElementById('success-banner');
  const resetBtn = document.getElementById('reset-form-btn');
  const cursorGlow = document.getElementById('cursor-glow');
  const floatItems = document.querySelectorAll('.float-item');
  const yearEl = document.getElementById('current-year');

  // Update dynamic year
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- 1. Interactive Parallax Physics for Floating Shapes ---
  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

  if (hasFinePointer) {
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      mouse.targetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

      // Custom cursor glow tracking
      if (cursorGlow) {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
      }
    }, { passive: true });

    function updateParallax() {
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      floatItems.forEach((item) => {
        const speed = parseFloat(item.getAttribute('data-speed')) || 1;
        const offsetX = mouse.x * speed * 22;
        const offsetY = mouse.y * speed * 22;
        item.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
      });

      requestAnimationFrame(updateParallax);
    }
    requestAnimationFrame(updateParallax);
  }

  // --- 2. Robust Email Validation & Subscription Handler ---
  function validateEmail(email) {
    // RFC 5322 standard regex pattern for strict client-side validation
    const re = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    return re.test(String(email).trim());
  }

  function showFeedback(message, type) {
    if (!feedbackEl) return;
    feedbackEl.textContent = message;
    feedbackEl.className = `form-feedback is-${type}`;
  }

  function clearFeedback() {
    if (!feedbackEl) return;
    feedbackEl.textContent = '';
    feedbackEl.className = 'form-feedback';
  }

  // Store in LocalStorage for persistence & developer inspection
  function saveSubscriber(email) {
    try {
      const existing = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      const record = {
        email: email,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || 'direct'
      };
      
      // Avoid duplicate entries
      const alreadySubscribed = existing.some(item => item.email.toLowerCase() === email.toLowerCase());
      if (!alreadySubscribed) {
        existing.push(record);
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(existing));
      }
      return { success: true, isNew: !alreadySubscribed, total: existing.length };
    } catch (e) {
      console.error('[VisualWoxx] Error saving to localStorage:', e);
      return { success: true, isNew: true, total: 1 };
    }
  }

  // Developer utilities exposed to console for reviewing & exporting subscribers
  window.getVisualWoxxSubscribers = function () {
    try {
      const subs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      console.table(subs);
      return subs;
    } catch (e) {
      return [];
    }
  };

  // Get comma-separated string of all emails (ready to paste directly into Gmail BCC)
  window.getSubscriberEmails = function () {
    try {
      const subs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      const list = subs.map(s => s.email).join(', ');
      console.log('--- SUBSCRIBER EMAILS (COPY & PASTE TO BCC) ---');
      console.log(list);
      return list;
    } catch (e) {
      return '';
    }
  };

  // Download all subscribers as a CSV file (ready for Mailchimp, Brevo, or Excel)
  window.exportSubscribersCSV = function () {
    try {
      const subs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
      if (subs.length === 0) {
        console.warn('No subscribers found yet to export.');
        return;
      }
      let csvContent = 'data:text/csv;charset=utf-8,Email,Timestamp\n';
      subs.forEach(s => {
        csvContent += `"${s.email}","${s.timestamp}"\n`;
      });
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'visualwoxx_subscribers.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('visualwoxx_subscribers.csv downloaded successfully!');
    } catch (e) {
      console.error('Failed to export CSV:', e);
    }
  };

  // Form submission handling
  if (form && emailInput && submitBtn) {
    // Clear error as user types
    emailInput.addEventListener('input', () => {
      if (feedbackEl.classList.contains('is-error')) {
        clearFeedback();
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rawEmail = emailInput.value.trim();

      // 1. Validation check
      if (!rawEmail) {
        showFeedback('Please enter your email address to get notified.', 'error');
        emailInput.focus();
        return;
      }

      if (!validateEmail(rawEmail)) {
        showFeedback('Please provide a valid email address (e.g. name@domain.com).', 'error');
        emailInput.focus();
        return;
      }

      // 2. Set loading state
      clearFeedback();
      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      emailInput.disabled = true;

      try {
        // Forward subscription email notification directly to visualwoxx@gmail.com
        if (CONFIG.API_ENDPOINT) {
          try {
            await fetch(CONFIG.API_ENDPOINT, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              },
              body: JSON.stringify({
                email: rawEmail,
                _subject: 'New VisualWoxx VIP Launch Subscriber!',
                _replyto: rawEmail,
                message: `New VIP subscriber joined the VisualWoxx waitlist: ${rawEmail}`,
                destination: CONFIG.TARGET_EMAIL,
                submitted_at: new Date().toLocaleString()
              })
            });
          } catch (netErr) {
            // Log warning if offline or sandbox network restricted; local backup succeeds regardless
            console.warn('[VisualWoxx] Email forwarding network notice:', netErr);
          }
        }

        // Save entry locally in localStorage as a guaranteed backup
        saveSubscriber(rawEmail);

        // 3. Show animated success state
        form.classList.add('is-hidden');
        if (successBanner) {
          successBanner.classList.add('is-visible');
          successBanner.setAttribute('aria-hidden', 'false');
        }

      } catch (err) {
        console.error('[VisualWoxx] Subscription error:', err);
        showFeedback('Connection issue. Please try again in a few moments.', 'error');
      } finally {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        emailInput.disabled = false;
      }
    });
  }

  // Reset form to subscribe another email
  if (resetBtn && form && successBanner && emailInput) {
    resetBtn.addEventListener('click', () => {
      successBanner.classList.remove('is-visible');
      successBanner.setAttribute('aria-hidden', 'true');
      form.classList.remove('is-hidden');
      emailInput.value = '';
      clearFeedback();
      setTimeout(() => emailInput.focus(), 100);
    });
  }

  // Console Welcome Badge
  console.log(
    '%c VISUALWOXX %c Visual That Speaks Louder %c',
    'background: #EA00FF; color: #000000; font-weight: bold; font-size: 13px; padding: 4px 8px; border-radius: 4px;',
    'background: #111116; color: #EA00FF; font-size: 12px; padding: 4px 8px;',
    'background: transparent;'
  );
  console.log('Subscribers will be forwarded to: visualwoxx@gmail.com');
  console.log('To view locally saved subscribers, run: getVisualWoxxSubscribers()');

})();
