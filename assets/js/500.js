// PAGE VISIBILITY ANIMATION
document.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".error-500-container");
  setTimeout(() => {
    container.classList.add("error-500-visible");
  }, 120);
});

// UNIVERSAL TAP/CLICK SHRINK ANIMATION
document
  .querySelectorAll(
    ".password-generator-btn, .word-counter-buttons button, .image-compressor-btn, .error-500-btn"
  )
  .forEach((btn) => {
    // TOUCH
    btn.addEventListener("touchstart", () => {
      btn.classList.add("pg-tap");
    });
    btn.addEventListener("touchend", () => {
      setTimeout(() => btn.classList.remove("pg-tap"), 120);
    });

    // MOUSE
    btn.addEventListener("mousedown", () => {
      btn.classList.add("pg-tap");
    });
    btn.addEventListener("mouseup", () => {
      setTimeout(() => btn.classList.remove("pg-tap"), 120);
    });
  });
