// PAGE REVEAL ANIMATION
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".error-403-container");

  setTimeout(() => {
    container.classList.add("error-403-visible");
  }, 120);
});

// UNIVERSAL TAP/CLICK SHRINK ANIMATION
document
  .querySelectorAll(
    ".password-generator-btn, .word-counter-buttons button, .image-compressor-btn, .error-403-btn"
  )
  .forEach((btn) => {
    // MOBILE TOUCH
    btn.addEventListener("touchstart", () => {
      btn.classList.add("pg-tap");
    });
    btn.addEventListener("touchend", () => {
      setTimeout(() => btn.classList.remove("pg-tap"), 120);
    });

    // DESKTOP MOUSE
    btn.addEventListener("mousedown", () => {
      btn.classList.add("pg-tap");
    });
    btn.addEventListener("mouseup", () => {
      setTimeout(() => btn.classList.remove("pg-tap"), 120);
    });
  });
