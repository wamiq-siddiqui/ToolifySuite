// Reveal page
document.addEventListener("DOMContentLoaded", () => {
  const page = document.querySelector(".contact-page-container");
  if (page)
    requestAnimationFrame(() => page.classList.add("contact-page-visible"));
});

// Mobile tap animation
document.querySelectorAll(".contact-btn").forEach((btn) => {
  btn.addEventListener("touchstart", () => btn.classList.add("cp-tap"));
  btn.addEventListener("touchend", () => btn.classList.remove("cp-tap"));
});

// -------------------------------------------
// FORM BUTTON STATE + FORM RESET
// -------------------------------------------

const contactForm = document.querySelector(".contact-form");
const contactBtn = document.querySelector(".contact-btn");

// Button reset helper
function resetContactButton() {
  if (!contactBtn) return;
  contactBtn.disabled = false;
  contactBtn.style.opacity = "1";
  contactBtn.textContent = "Send Message";
}

if (contactForm && contactBtn) {
  contactForm.addEventListener("submit", () => {
    contactBtn.disabled = true;
    contactBtn.style.opacity = "0.75";
    contactBtn.textContent = "Sending…";

    setTimeout(() => {
      contactBtn.textContent = "Message Sent ✓";
    }, 600);

    // Just visual reset before redirect on localhost
    setTimeout(() => {
      contactForm.reset();
    }, 800);
  });
}

// -------------------------------------------
// FIX BACK/FORWARD CACHE ISSUE
// -------------------------------------------
window.addEventListener("pageshow", () => {
  if (contactForm) contactForm.reset();
  resetContactButton();
});
