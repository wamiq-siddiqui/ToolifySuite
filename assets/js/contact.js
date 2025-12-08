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
// FORM BUTTON STATE + FORM RESET (ADDED CODE)
// -------------------------------------------

const contactForm = document.querySelector(".contact-form");
const contactBtn = document.querySelector(".contact-btn");

if (contactForm && contactBtn) {
  contactForm.addEventListener("submit", (e) => {
    // Local testing ke liye prevent mat karna,
    // warna formsubmit.co ka kaam nahi chalega.

    // Button disable + animation
    contactBtn.disabled = true;
    contactBtn.style.opacity = "0.75";
    contactBtn.textContent = "Sending…";

    // Chhota sa delay so button change user ko dikh sake
    setTimeout(() => {
      contactBtn.textContent = "Message Sent ✓";
    }, 600);

    // Localhost testing ke liye form reset ho jaye
    setTimeout(() => {
      contactForm.reset();
    }, 800);
  });
}

// Refresh par form force reset
window.addEventListener("pageshow", () => {
  const form = document.querySelector(".contact-form");
  if (form) form.reset();
});
